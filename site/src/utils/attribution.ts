/**
 * Attribution engine (v0).
 *
 * Given partial event features (target sectors, target countries,
 * initial vector, year, incident-type), produce a ranked list of
 * candidate actors with log-probabilities.
 *
 * Approach: Bayesian (Naive Bayes with multi-hot features and
 * Laplace smoothing). Per-actor likelihoods computed against an
 * actor's historical feature distribution; final score is
 * log P(actor) + sum_f log P(f | actor).
 *
 * This module is intentionally framework-free so it can run in
 * Astro build, tsx CLI, and a browser bundle interchangeably.
 */
import { Atlas, type AuspexEvent } from './atlas';
import { inferEventTTPs, parentTechnique } from './ttp-extract';
import { inferEventMalware } from './malware-extract';
import { extractProseTerms } from './prose-features';

export interface EventFeatures {
  /** Top-level target sectors (rolled up). */
  sectors: Set<string>;
  /** Target country codes (lowercase ISO-3166 alpha-2 or compound). */
  countries: Set<string>;
  /** Initial-access vector, single-valued. */
  vector: string | null;
  /** Event year (string, 4 digits) — used for temporal smoothing in v0.1. */
  year: string | null;
  /** Incident-type tags. */
  incidentTypes: Set<string>;
  /** Inferred MITRE ATT&CK technique ids (parent T-codes only, sub-techniques rolled up). */
  ttps: Set<string>;
  /** TTP co-occurrence pairs — alphabetically sorted "Tnnnn|Tmmmm" tokens
   *  from every unordered pair within the ttps set. Captures distinctive
   *  TTP chains (Sandworm's supply-chain + worm-propagation; APT38's
   *  SWIFT-credential + wire-fraud) that bag-of-TTPs misses. */
  ttpPairs: Set<string>;
  /** Malware-family names mentioned in the event's free-text (lowercase). */
  malware: Set<string>;
  /** Named target identities — orgs/<slug> and infra/<slug> from event.targets. */
  targets: Set<string>;
  /** Geopolitical-marker proximity tokens. For each timeline marker
   *  relevant to the event's attacking state (or multilateral), encode
   *  `markerId:bucket` where bucket reflects how recent the marker is
   *  relative to the event date:
   *   - `:recent` (0–365d post-marker)
   *   - `:mid`    (365d–3y post-marker)
   *   - `:late`   (3y+ post-marker)
   *  Pre-marker events get nothing. Captures regime shifts —
   *  Russian ops post-2022-02-24, IR ops post-Soleimani, etc. */
  markers: Set<string>;
  /** Campaign cluster id (if set). Single-valued; events that belong
   *  to a named campaign cluster (Olympic Games, SolarWinds chain,
   *  Hermetic wave, Ronin laundering trail, etc.) share a campaign_id.
   *  This is the visible-fabric signal: events publicly reported as
   *  part of one operational thread reinforce each other. */
  campaign: string | null;
  /** Inferred (latent) campaign cluster id — algorithmic complement
   *  to `campaign`. Lower-weight than the editorial signal. Only fires
   *  for events without an explicit campaign_id. See inferred-campaigns.ts. */
  inferredCampaign: string | null;
  /** Top-K most-distinctive prose terms by TF-IDF over the event
   *  corpus. Captures the analyst-signal currently lost when the
   *  keyword-extractor only pulls TTPs and malware names from prose.
   *  See prose-features.ts. */
  proseTerms: Set<string>;
  /** Named individual operators (indictment / OFAC / court-docs).
   *  The single most stable cross-event link — a named human survives
   *  actor rebrands, tool migrations, and agency reorgs. */
  operators: Set<string>;
}

export interface ActorProfile {
  /** Total events used to train this actor's profile. */
  total: number;
  /** Per-sector observed counts. */
  sectors: Map<string, number>;
  countries: Map<string, number>;
  vectors: Map<string, number>;
  years: Map<string, number>;
  incidentTypes: Map<string, number>;
  /** TTP set — union of MITRE-derived (authoritative) and event-derived (inferred). */
  ttps: Set<string>;
  /** TTP-pair observation counts from training events. */
  ttpPairs: Map<string, number>;
  /** Malware-family names — union of MITRE-derived (authoritative) and event-mentioned. */
  malware: Set<string>;
  /** Named target identities observed in this actor's events, with counts. */
  targets: Map<string, number>;
  /** Geopolitical-marker proximity tokens observed for this actor. */
  markers: Map<string, number>;
  /** Campaign cluster ids observed for this actor (counts). */
  campaigns: Map<string, number>;
  /** Inferred (latent) campaign cluster ids observed for this actor. */
  inferredCampaigns: Map<string, number>;
  /** Per-prose-term observed counts. */
  proseTerms: Map<string, number>;
  /** Named individual operators observed for this actor. */
  operators: Map<string, number>;
  /** Whether the actor has a MITRE-derived TTP profile. */
  hasMitre: boolean;
}

/** Compose an EventFeatures vector from an event. */
export function extractFeatures(event: AuspexEvent, atlas: Atlas): EventFeatures {
  const sectors = new Set<string>();
  const countries = new Set<string>();
  const incidentTypes = new Set<string>();

  for (const t of event.targets ?? []) {
    if (t.target_id?.startsWith('sectors/')) {
      const raw = t.target_id.replace(/^sectors\//, '');
      let slug = raw;
      while (slug && !atlas.sectors.has(slug)) {
        const i = slug.lastIndexOf('/');
        if (i < 0) {
          slug = '';
          break;
        }
        slug = slug.slice(0, i);
      }
      if (slug) {
        const top = atlas.sectorAncestors(slug)[0];
        if (top) sectors.add(top.id);
      }
    }
    if (t.country) countries.add(t.country);
  }
  for (const it of event.incident_type ?? []) incidentTypes.add(it);

  // Roll inferred TTPs up to parent T-codes (e.g., T1566.001 → T1566)
  // so they match MITRE actor profiles that may use either form.
  // Tried dual-expansion (keep both forms) on 2026-05-29 — was net
  // negative across doctrine + pillar engines because of double-counting
  // when both sides carry the sub-form. Parent-rollup is the safer
  // default; sub-tech distinction would need hierarchical matching
  // logic (event T1566.001 matches actor T1566 once, not twice).
  const ttps = new Set<string>();
  for (const t of inferEventTTPs(event)) ttps.add(parentTechnique(t));

  // Emit all unordered pairs from the TTP set as a separate feature
  // family. With ~150 unique parent T-codes corpus-wide and typical
  // events carrying 5-15 TTPs, this stays tractable (~10-100 pairs per
  // event, ~2K distinct pairs corpus-wide after sparsity).
  const ttpArr = [...ttps].sort();
  const ttpPairs = new Set<string>();
  for (let i = 0; i < ttpArr.length; i++) {
    for (let j = i + 1; j < ttpArr.length; j++) {
      ttpPairs.add(ttpArr[i] + '|' + ttpArr[j]);
    }
  }

  // Geopolitical-marker proximity features. Bidirectional: fire markers
  // from the attacker state AND from any target country in event.targets.
  // Captures both regime-shift context for the actor (post-RU-invasion
  // Russian ops) and reaction context for the victim (Iranian ops timed
  // to an Israeli-side trigger).
  const markers = new Set<string>();
  const eventDateRaw = event.start_date ?? event.disclosure_date;
  const evState = computeEventStateForMarkers(event, atlas);
  const targetStates = new Set<string>();
  for (const t of event.targets ?? []) {
    if (t.country) targetStates.add(t.country.toLowerCase());
  }
  if (eventDateRaw && (evState || targetStates.size > 0)) {
    const evMs = Date.parse(eventDateRaw);
    if (Number.isFinite(evMs)) {
      for (const m of atlas.timelineMarkers.values()) {
        const markerState = m.id.split('/')[0];
        const isAttackerMarker = evState && m.id.startsWith(evState + '/');
        const isTargetMarker = targetStates.has(markerState);
        if (!isAttackerMarker && !isTargetMarker) continue;
        const markerDateStr = typeof m.date === 'string'
          ? m.date
          : m.date?.start ?? m.date_range?.start;
        if (!markerDateStr) continue;
        const mMs = Date.parse(markerDateStr);
        if (!Number.isFinite(mMs)) continue;
        const daysDiff = (evMs - mMs) / 86400000;
        if (daysDiff < 0) continue; // pre-marker — skip
        let bucket: 'recent' | 'mid' | 'late';
        if (daysDiff <= 365) bucket = 'recent';
        else if (daysDiff <= 1095) bucket = 'mid';
        else bucket = 'late';
        // Distinguish attacker-side and target-side marker proximity —
        // they carry different meaning. An attacker firing a marker is
        // "this actor is operating in regime X"; a target firing a
        // marker is "this event lands inside target's vulnerable
        // window."
        const role = isAttackerMarker ? 'a' : 't';
        markers.add(role + ':' + m.id + ':' + bucket);
      }
    }
  }

  // Cyber-to-cyber reactivity: for the (attacker, target) dyad, find the
  // most recent prior event in the REVERSE direction (target's actors
  // attacked attacker, or named attacker in attribution/indictment).
  // Bucket by lag. Captures retaliation rhythm — Iran-Israel ⇄ cycle,
  // Russia-NATO sanctions ⇄ cycle, China-US indictment ⇄ cycle.
  if (eventDateRaw && evState && targetStates.size > 0) {
    const evMs = Date.parse(eventDateRaw);
    if (Number.isFinite(evMs)) {
      let minLagDays = Infinity;
      for (const other of atlas.events.values()) {
        if (other.id === event.id) continue;
        const otherState = computeEventStateForMarkers(other, atlas);
        if (!otherState) continue;
        // The reverse-dyad pattern: this event's target is the other event's attacker,
        // and this event's attacker appears in the other event's targets.
        if (!targetStates.has(otherState)) continue;
        const otherTargets = new Set<string>();
        for (const t of other.targets ?? []) {
          if (t.country) otherTargets.add(t.country.toLowerCase());
        }
        if (!otherTargets.has(evState)) continue;
        // Found a reverse-dyad event. Compute lag.
        const otherDateRaw = other.start_date ?? other.disclosure_date;
        if (!otherDateRaw) continue;
        const otherMs = Date.parse(otherDateRaw);
        if (!Number.isFinite(otherMs)) continue;
        const lagDays = (evMs - otherMs) / 86400000;
        if (lagDays <= 0) continue; // not a prior event
        if (lagDays < minLagDays) minLagDays = lagDays;
      }
      if (Number.isFinite(minLagDays)) {
        let bucket: string;
        if (minLagDays <= 30) bucket = 'reactive-acute';
        else if (minLagDays <= 90) bucket = 'reactive-recent';
        else if (minLagDays <= 365) bucket = 'reactive-year';
        else bucket = 'reactive-distant';
        markers.add('dyad:' + evState + '>' + [...targetStates].sort().join(',') + ':' + bucket);
      }
    }
  }

  // Named target identities — orgs and infra slugs from event.targets.
  // These are highly actor-distinctive (Equifax → APT41-ish; SWIFT → DPRK;
  // Ukraine power grid → Sandworm). Useful for closing the CN cluster gap
  // where sector / vector signals overlap broadly.
  const targets = new Set<string>();
  for (const t of event.targets ?? []) {
    if (!t.target_id) continue;
    if (t.target_id.startsWith('orgs/') || t.target_id.startsWith('infra/')) {
      targets.add(t.target_id);
    }
  }

  return {
    sectors,
    countries,
    vector: event.initial_vector ?? null,
    year: (event.start_date ?? event.disclosure_date ?? '').slice(0, 4) || null,
    incidentTypes,
    ttps,
    ttpPairs,
    malware: inferEventMalware(event, atlas),
    targets,
    markers,
    campaign: event.campaign_id ?? null,
    inferredCampaign: event.campaign_id ? null : (atlas.inferredCampaignByEvent.get(event.id) ?? null),
    proseTerms: extractProseTerms(event, atlas),
    operators: new Set(event.operators_named ?? []),
  };
}

/** Lightweight state lookup for marker filtering — avoids circular
 *  dep with atlas.eventStateId by reproducing the same logic locally
 *  (actor's primary_service_id top segment, then attribution service_id,
 *  then any explicit attacker hint). */
function computeEventStateForMarkers(event: AuspexEvent, atlas: Atlas): string | undefined {
  for (const attr of event.attributions ?? []) {
    if (attr.actor_id) {
      const svc = atlas.actors.get(attr.actor_id)?.primary_service_id;
      if (svc) return svc.split('/')[0];
      // Otherwise infer state from actor id prefix (e.g. ru/gru/...)
      const head = attr.actor_id.split('/')[0];
      if (head && head.length === 2 && head !== 'criminal') return head;
    }
    if (attr.service_id) {
      return attr.service_id.split('/')[0];
    }
  }
  return undefined;
}

/** Set of actor ids that appear in this event's attributions. */
export function actorsOfEvent(event: AuspexEvent): Set<string> {
  const out = new Set<string>();
  for (const attr of event.attributions ?? []) {
    if (attr.actor_id) out.add(attr.actor_id);
  }
  return out;
}

/**
 * Options that change how per-actor profiles are accumulated.
 *
 * - `referenceDate`: when set, each training event contributes to the
 *   profile with weight `exp(-|yearsDiff| / temporalTau)`. This gives
 *   recent actor behavior more weight than ancient behavior — APT41
 *   2014 (videogame industry) doesn't drown out APT41 2024 (logistics
 *   for MIC2025) when predicting a 2026 event. When unset, every
 *   training event contributes weight 1.0 (legacy behavior).
 * - `temporalTau`: years constant for the exponential decay. Default 3.
 */
export interface ProfileBuildOptions {
  referenceDate?: string | null;
  temporalTau?: number;
  /**
   * Hierarchical service prior — when set, each actor profile is
   * additively smoothed toward the aggregate profile of all actors
   * sharing its service (with self subtracted). λ=0 disables; λ=0.3
   * is a reasonable default. Fixes the rare-actor problem: a
   * single-event criminal/* actor or APT inherits "criminal-shape"
   * or "MSS-shape" priors from its service's broader behavior.
   */
  servicePriorLambda?: number;
}

function yearOf(event: AuspexEvent): number | null {
  const d = (event.start_date ?? event.disclosure_date ?? '').slice(0, 4);
  if (!/^\d{4}$/.test(d)) return null;
  return parseInt(d, 10);
}

function temporalWeight(eventDate: string | undefined, refDate: string, tau: number): number {
  const ey = parseInt((eventDate ?? '').slice(0, 4), 10);
  const ry = parseInt(refDate.slice(0, 4), 10);
  if (!Number.isFinite(ey) || !Number.isFinite(ry)) return 1.0;
  return Math.exp(-Math.abs(ey - ry) / tau);
}

function newEmptyProfileForBlending(): ActorProfile {
  return {
    total: 0,
    sectors: new Map(),
    countries: new Map(),
    vectors: new Map(),
    years: new Map(),
    incidentTypes: new Map(),
    ttps: new Set(),
    ttpPairs: new Map(),
    malware: new Set(),
    targets: new Map(),
    markers: new Map(),
    campaigns: new Map(),
    inferredCampaigns: new Map(),
    proseTerms: new Map(),
    operators: new Map(),
    hasMitre: false,
  };
}
function addToProfile(dst: ActorProfile, src: ActorProfile, w: number) {
  dst.total += w * src.total;
  function addMap(d: Map<string, number>, s: Map<string, number>) {
    for (const [k, v] of s) d.set(k, (d.get(k) ?? 0) + w * v);
  }
  addMap(dst.sectors, src.sectors);
  addMap(dst.countries, src.countries);
  addMap(dst.vectors, src.vectors);
  addMap(dst.years, src.years);
  addMap(dst.incidentTypes, src.incidentTypes);
  addMap(dst.ttpPairs, src.ttpPairs);
  addMap(dst.targets, src.targets);
  addMap(dst.markers, src.markers);
  addMap(dst.campaigns, src.campaigns);
  addMap(dst.inferredCampaigns, src.inferredCampaigns);
  addMap(dst.proseTerms, src.proseTerms);
  addMap(dst.operators, src.operators);
  // Sets (ttps, malware) — union, weights don't apply since these are presence-only signals.
  if (w > 0) {
    for (const t of src.ttps) dst.ttps.add(t);
    for (const m of src.malware) dst.malware.add(m);
  }
}

/** Build per-actor feature profiles from a training event set. */
export function buildProfiles(
  events: AuspexEvent[],
  atlas: Atlas,
  opts: ProfileBuildOptions = {},
): Map<string, ActorProfile> {
  const refDate = opts.referenceDate ?? null;
  const tau = opts.temporalTau ?? 3;
  const profiles = new Map<string, ActorProfile>();
  for (const event of events) {
    const features = extractFeatures(event, atlas);
    const w = refDate ? temporalWeight(event.start_date ?? event.disclosure_date, refDate, tau) : 1.0;
    for (const actorId of actorsOfEvent(event)) {
      let p = profiles.get(actorId);
      if (!p) {
        const actor = atlas.actors.get(actorId);
        const mitre = actor?.mitre_techniques ?? [];
        const malware = actor?.mitre_malware ?? [];
        const ttpSet = new Set<string>();
        for (const t of mitre) ttpSet.add(parentTechnique(t));
        const malwareSet = new Set<string>();
        for (const m of malware) malwareSet.add(m);
        p = {
          total: 0,
          sectors: new Map(),
          countries: new Map(),
          vectors: new Map(),
          years: new Map(),
          incidentTypes: new Map(),
          ttps: ttpSet,
          ttpPairs: new Map(),
          malware: malwareSet,
          targets: new Map(),
          markers: new Map(),
          campaigns: new Map(),
          inferredCampaigns: new Map(),
          proseTerms: new Map(),
          operators: new Map(),
          hasMitre: mitre.length > 0,
        };
        profiles.set(actorId, p);
      }
      p.total += w;
      for (const s of features.sectors) p.sectors.set(s, (p.sectors.get(s) ?? 0) + w);
      for (const c of features.countries) p.countries.set(c, (p.countries.get(c) ?? 0) + w);
      if (features.vector) p.vectors.set(features.vector, (p.vectors.get(features.vector) ?? 0) + w);
      if (features.year) p.years.set(features.year, (p.years.get(features.year) ?? 0) + w);
      for (const it of features.incidentTypes) p.incidentTypes.set(it, (p.incidentTypes.get(it) ?? 0) + w);
      for (const t of features.ttps) p.ttps.add(t);
      for (const tp of features.ttpPairs) p.ttpPairs.set(tp, (p.ttpPairs.get(tp) ?? 0) + w);
      for (const m of features.malware) p.malware.add(m);
      for (const tg of features.targets) p.targets.set(tg, (p.targets.get(tg) ?? 0) + w);
      for (const mk of features.markers) p.markers.set(mk, (p.markers.get(mk) ?? 0) + w);
      if (features.campaign) p.campaigns.set(features.campaign, (p.campaigns.get(features.campaign) ?? 0) + w);
      if (features.inferredCampaign) p.inferredCampaigns.set(features.inferredCampaign, (p.inferredCampaigns.get(features.inferredCampaign) ?? 0) + w);
      for (const pt of features.proseTerms) p.proseTerms.set(pt, (p.proseTerms.get(pt) ?? 0) + w);
      for (const op of features.operators) p.operators.set(op, (p.operators.get(op) ?? 0) + w);
    }
  }

  // Hierarchical service prior — Empirical-Bayes adaptive smoothing.
  // Each actor profile gets blended toward its service-level aggregate
  // (self-excluded). Smoothing weight is adaptive:
  //
  //   λ_eff = λ * k / (k + profile.total)
  //
  // Rare actors (low total) get heavy smoothing toward the service
  // shape; established actors get light smoothing. k=5 means
  // smoothing drops below 50% once an actor has 5+ events.
  const lambdaMax = opts.servicePriorLambda ?? 0;
  if (lambdaMax > 0) {
    const k = 5;
    const servicePofiles = new Map<string, ActorProfile>();
    for (const [actorId, p] of profiles) {
      const sid = atlas.actors.get(actorId)?.primary_service_id;
      if (!sid) continue;
      let svc = servicePofiles.get(sid);
      if (!svc) { svc = newEmptyProfileForBlending(); servicePofiles.set(sid, svc); }
      addToProfile(svc, p, 1.0);
    }
    for (const [actorId, p] of profiles) {
      const sid = atlas.actors.get(actorId)?.primary_service_id;
      if (!sid) continue;
      const svc = servicePofiles.get(sid);
      if (!svc) continue;
      const lambdaEff = lambdaMax * k / (k + p.total);
      if (lambdaEff < 0.01) continue;
      // Subtract self, blend in λ_eff * service-excluding-self
      const leaveOne = newEmptyProfileForBlending();
      addToProfile(leaveOne, svc, 1.0);
      addToProfile(leaveOne, p, -1.0);
      addToProfile(p, leaveOne, lambdaEff);
    }
  }

  return profiles;
}

/**
 * IDF (inverse document frequency) over actor profiles, for each
 * feature family. A feature value seen in many actors gets a small
 * IDF; a feature seen in few actors gets a large IDF. Used to
 * downweight common signals (Mimikatz, phishing) and upweight
 * distinctive ones (HermeticWiper, ICS-specific TTPs) so the engine
 * rewards discriminating evidence rather than common patterns.
 */
export interface IDFMap {
  sectors: Map<string, number>;
  countries: Map<string, number>;
  vectors: Map<string, number>;
  years: Map<string, number>;
  incidentTypes: Map<string, number>;
  ttps: Map<string, number>;
  ttpPairs: Map<string, number>;
  malware: Map<string, number>;
  targets: Map<string, number>;
  markers: Map<string, number>;
  campaigns: Map<string, number>;
  inferredCampaigns: Map<string, number>;
  proseTerms: Map<string, number>;
  operators: Map<string, number>;
}

function buildIDFForMap(extractor: (p: ActorProfile) => Iterable<string>, profiles: Map<string, ActorProfile>): Map<string, number> {
  const docCounts = new Map<string, number>();
  let N = 0;
  for (const p of profiles.values()) {
    if (p.total === 0) continue;
    N++;
    const seen = new Set<string>();
    for (const k of extractor(p)) {
      if (seen.has(k)) continue;
      seen.add(k);
      docCounts.set(k, (docCounts.get(k) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [k, c] of docCounts) idf.set(k, Math.log((N + 1) / (c + 1)) + 1);
  return idf;
}

export function buildIDF(profiles: Map<string, ActorProfile>): IDFMap {
  return {
    sectors:       buildIDFForMap((p) => p.sectors.keys(),       profiles),
    countries:     buildIDFForMap((p) => p.countries.keys(),     profiles),
    vectors:       buildIDFForMap((p) => p.vectors.keys(),       profiles),
    years:         buildIDFForMap((p) => p.years.keys(),         profiles),
    incidentTypes: buildIDFForMap((p) => p.incidentTypes.keys(), profiles),
    ttps:          buildIDFForMap((p) => p.ttps,                 profiles),
    ttpPairs:      buildIDFForMap((p) => p.ttpPairs.keys(),      profiles),
    malware:       buildIDFForMap((p) => p.malware,              profiles),
    targets:       buildIDFForMap((p) => p.targets.keys(),       profiles),
    markers:       buildIDFForMap((p) => p.markers.keys(),       profiles),
    campaigns:     buildIDFForMap((p) => p.campaigns.keys(),     profiles),
    inferredCampaigns: buildIDFForMap((p) => p.inferredCampaigns.keys(), profiles),
    proseTerms:    buildIDFForMap((p) => p.proseTerms.keys(),    profiles),
    operators:     buildIDFForMap((p) => p.operators.keys(),     profiles),
  };
}
function idfFor(map: Map<string, number> | undefined, key: string): number {
  if (!map) return 1.0;
  const raw = map.get(key) ?? 1.0;
  // sqrt-dampened — full IDF tends to over-reward broad-mission actors
  // whose distinctive features dominate ambiguous events. sqrt(IDF)
  // keeps the discriminative direction without runaway amplification.
  return Math.sqrt(Math.max(raw, 0.01));
}

/** Vocabulary sizes — for Laplace smoothing denominators. */
export interface Vocab {
  sectors: Set<string>;
  countries: Set<string>;
  vectors: Set<string>;
  years: Set<string>;
  incidentTypes: Set<string>;
  ttps: Set<string>;
  ttpPairs: Set<string>;
  malware: Set<string>;
  targets: Set<string>;
  markers: Set<string>;
  campaigns: Set<string>;
  inferredCampaigns: Set<string>;
  proseTerms: Set<string>;
  operators: Set<string>;
  totalEvents: number;
}

export function buildVocab(events: AuspexEvent[], atlas: Atlas): Vocab {
  const v: Vocab = {
    sectors: new Set(),
    countries: new Set(),
    vectors: new Set(),
    years: new Set(),
    incidentTypes: new Set(),
    ttps: new Set(),
    ttpPairs: new Set(),
    malware: new Set(),
    targets: new Set(),
    markers: new Set(),
    campaigns: new Set(),
    inferredCampaigns: new Set(),
    proseTerms: new Set(),
    operators: new Set(),
    totalEvents: events.length,
  };
  for (const e of events) {
    const f = extractFeatures(e, atlas);
    for (const s of f.sectors) v.sectors.add(s);
    for (const c of f.countries) v.countries.add(c);
    if (f.vector) v.vectors.add(f.vector);
    if (f.year) v.years.add(f.year);
    for (const it of f.incidentTypes) v.incidentTypes.add(it);
    for (const t of f.ttps) v.ttps.add(t);
    for (const tp of f.ttpPairs) v.ttpPairs.add(tp);
    for (const m of f.malware) v.malware.add(m);
    for (const tg of f.targets) v.targets.add(tg);
    for (const mk of f.markers) v.markers.add(mk);
    if (f.campaign) v.campaigns.add(f.campaign);
    if (f.inferredCampaign) v.inferredCampaigns.add(f.inferredCampaign);
    for (const pt of f.proseTerms) v.proseTerms.add(pt);
    for (const op of f.operators) v.operators.add(op);
  }
  for (const actor of atlas.actors.values()) {
    for (const t of actor.mitre_techniques ?? []) v.ttps.add(parentTechnique(t));
    for (const m of actor.mitre_malware ?? []) v.malware.add(m);
  }
  return v;
}

export interface ScoringOptions {
  /** Laplace smoothing alpha. Higher = more uniform priors. */
  alpha?: number;
  /** Weight applied to the actor prior log P(actor). 1.0 = standard Naive Bayes; <1 dampens common-actor bias. */
  priorWeight?: number;
  /**
   * Feature weights — emphasize / de-emphasize specific feature
   * families in the log-sum. Defaults are 1.0 each.
   */
  weights?: Partial<{ sectors: number; countries: number; vector: number; year: number; incident: number; ttps: number; ttpPairs: number; malware: number; targets: number; markers: number; campaign: number; inferredCampaign: number; proseTerms: number; operators: number }>;
  /**
   * Optional IDF map — when provided, each feature's contribution
   * to the log score is multiplied by its IDF weight. Common
   * features (seen in many actors) get downweighted; rare /
   * distinctive features (seen in few actors) get upweighted.
   * Construct via buildIDF(profiles).
   */
  idf?: IDFMap;
  /** Lowercase malware-family-name → lineage-group lookup. When
   *  provided, scoreActor credits same-lineage-group matches with
   *  partial weight (captures operator carryover across actor
   *  rebrands when codebase lineage shows tool inheritance). */
  malwareLineageGroup?: Map<string, string>;
}

/**
 * Log P(actor | features) (up to a constant — the per-actor scores
 * are comparable, the absolute value isn't a probability).
 */
export function scoreActor(
  features: EventFeatures,
  actorId: string,
  profile: ActorProfile,
  vocab: Vocab,
  opts: ScoringOptions = {},
): number {
  const alpha = opts.alpha ?? 0.5;
  const priorWeight = opts.priorWeight ?? 1.0;
  const w = {
    sectors: opts.weights?.sectors ?? 1.0,
    countries: opts.weights?.countries ?? 1.0,
    vector: opts.weights?.vector ?? 1.0,
    year: opts.weights?.year ?? 0.5,
    incident: opts.weights?.incident ?? 1.0,
    ttps: opts.weights?.ttps ?? 1.0,
    ttpPairs: opts.weights?.ttpPairs ?? 0.5,
    malware: opts.weights?.malware ?? 2.0,
    targets: opts.weights?.targets ?? 3.0,  // highest — named org/infra targets are highly actor-specific
    markers: opts.weights?.markers ?? 1.0,
    campaign: opts.weights?.campaign ?? 4.0, // very high — a named campaign is the most distinctive cross-event link
    inferredCampaign: opts.weights?.inferredCampaign ?? 1.5, // lower than editorial campaign — algorithmically discovered, no editorial vetting
    proseTerms: opts.weights?.proseTerms ?? 0.4, // low — noisy but orthogonal-information signal
    operators: opts.weights?.operators ?? 5.0, // highest — a named human operator is the single sharpest cross-event link
  };

  function smoothedLog(
    valueCount: number,
    totalForActor: number,
    vocabSize: number,
  ): number {
    return Math.log((valueCount + alpha) / (totalForActor + alpha * Math.max(vocabSize, 1)));
  }

  // Prior: log P(actor)
  let logScore = priorWeight * Math.log((profile.total + alpha) / (vocab.totalEvents + alpha * vocab.sectors.size));

  // Sectors (multi-hot — sum each present sector's log-likelihood, weighted by IDF)
  for (const s of features.sectors) {
    const idf = idfFor(opts.idf?.sectors, s);
    logScore += w.sectors * idf * smoothedLog(profile.sectors.get(s) ?? 0, profile.total, vocab.sectors.size);
  }
  // Countries
  for (const c of features.countries) {
    const idf = idfFor(opts.idf?.countries, c);
    logScore += w.countries * idf * smoothedLog(profile.countries.get(c) ?? 0, profile.total, vocab.countries.size);
  }
  // Vector (single-valued)
  if (features.vector) {
    const idf = idfFor(opts.idf?.vectors, features.vector);
    logScore += w.vector * idf * smoothedLog(profile.vectors.get(features.vector) ?? 0, profile.total, vocab.vectors.size);
  }
  // Year
  if (features.year) {
    const idf = idfFor(opts.idf?.years, features.year);
    logScore += w.year * idf * smoothedLog(profile.years.get(features.year) ?? 0, profile.total, vocab.years.size);
  }
  // Incident types (multi-hot)
  for (const it of features.incidentTypes) {
    const idf = idfFor(opts.idf?.incidentTypes, it);
    logScore += w.incident * idf * smoothedLog(profile.incidentTypes.get(it) ?? 0, profile.total, vocab.incidentTypes.size);
  }

  // Geopolitical markers (multi-hot)
  for (const mk of features.markers) {
    const idf = idfFor(opts.idf?.markers, mk);
    logScore += w.markers * idf * smoothedLog(profile.markers.get(mk) ?? 0, profile.total, Math.max(vocab.markers.size, 1));
  }

  // Campaign cluster (single-valued, additive — only fires when actor
  // has been previously seen in the same campaign).
  if (features.campaign) {
    const profileCount = profile.campaigns.get(features.campaign) ?? 0;
    if (profileCount > 0) {
      const idf = idfFor(opts.idf?.campaigns, features.campaign);
      logScore += w.campaign * idf * Math.log(1 + profileCount);
    }
  }

  // Inferred campaign cluster — only set when explicit campaign isn't.
  // Algorithmic similarity-cluster id propagating actor labels across
  // structurally-similar but editorially-untagged events.
  if (features.inferredCampaign) {
    const profileCount = profile.inferredCampaigns.get(features.inferredCampaign) ?? 0;
    if (profileCount > 0) {
      const idf = idfFor(opts.idf?.inferredCampaigns, features.inferredCampaign);
      logScore += w.inferredCampaign * idf * Math.log(1 + profileCount);
    }
  }

  // Prose terms — additive overlap with weighted IDF. Like TTPs but
  // over the semantic content of the prose. Captures "this event is
  // described in vocabulary similar to that actor's other events."
  if (profile.proseTerms.size > 0 && features.proseTerms.size > 0) {
    let weightedMatches = 0;
    let totalMatches = 0;
    for (const pt of features.proseTerms) {
      if (profile.proseTerms.has(pt)) {
        totalMatches++;
        weightedMatches += idfFor(opts.idf?.proseTerms, pt);
      }
    }
    if (totalMatches > 0) {
      const normalized = totalMatches / features.proseTerms.size;
      logScore += w.proseTerms * Math.log(1 + weightedMatches) * (0.5 + 0.5 * normalized);
    }
  }

  // Named operators — the sharpest single feature when it fires. A
  // matched indictment-named operator is near-conclusive attribution
  // evidence (Vasinskyi → REvil/lineage; Lashgarian → IRGC-IO).
  if (profile.operators.size > 0 && features.operators.size > 0) {
    let weightedMatches = 0;
    let totalMatches = 0;
    for (const op of features.operators) {
      if (profile.operators.has(op)) {
        totalMatches++;
        weightedMatches += idfFor(opts.idf?.operators, op);
      }
    }
    if (totalMatches > 0) {
      const normalized = totalMatches / features.operators.size;
      logScore += w.operators * Math.log(1 + weightedMatches) * (0.5 + 0.5 * normalized);
    }
  }

  // TTPs — additive tiebreaker, IDF-weighted per matching technique.
  if (profile.ttps.size > 0 && features.ttps.size > 0) {
    let weightedMatches = 0;
    let totalMatches = 0;
    for (const t of features.ttps) {
      if (profile.ttps.has(t)) {
        totalMatches++;
        weightedMatches += idfFor(opts.idf?.ttps, t);
      }
    }
    if (totalMatches > 0) {
      const normalized = totalMatches / features.ttps.size;
      logScore += w.ttps * Math.log(1 + weightedMatches) * (0.5 + 0.5 * normalized);
    }
  }

  // TTP co-occurrence pairs — sparser than singletons but distinctive
  // when they fire. Same additive form, lower default weight (0.5).
  if (profile.ttpPairs.size > 0 && features.ttpPairs.size > 0) {
    let weightedMatches = 0;
    let totalMatches = 0;
    for (const tp of features.ttpPairs) {
      if (profile.ttpPairs.has(tp)) {
        totalMatches++;
        weightedMatches += idfFor(opts.idf?.ttpPairs, tp);
      }
    }
    if (totalMatches > 0) {
      const normalized = totalMatches / features.ttpPairs.size;
      logScore += w.ttpPairs * Math.log(1 + weightedMatches) * (0.5 + 0.5 * normalized);
    }
  }

  // Malware-family signature with genealogy-aware partial credit.
  // Exact family match counts full; same-lineage-group match counts half;
  // direct parent/child match (one hop) counts 0.7. Lineage data lives in
  // atlas.malwareLineageGroup; if unavailable, falls back to exact match.
  if (profile.malware.size > 0 && features.malware.size > 0) {
    let weightedMatches = 0;
    let totalMatches = 0;
    const lineageMap = opts.malwareLineageGroup;
    const profileLineageGroups = lineageMap
      ? new Set([...profile.malware].map((m) => lineageMap.get(m.toLowerCase())).filter((g): g is string => !!g))
      : new Set<string>();
    for (const m of features.malware) {
      const ml = m.toLowerCase();
      if (profile.malware.has(m)) {
        totalMatches++;
        weightedMatches += idfFor(opts.idf?.malware, m);
        continue;
      }
      // Lineage-group partial credit
      const eventLineageGroup = lineageMap?.get(ml);
      if (eventLineageGroup && profileLineageGroups.has(eventLineageGroup)) {
        totalMatches++;
        weightedMatches += 0.5 * idfFor(opts.idf?.malware, m);
      }
    }
    if (totalMatches > 0) {
      const normalized = totalMatches / features.malware.size;
      logScore += w.malware * Math.log(1 + weightedMatches) * (0.5 + 0.5 * normalized);
    }
  }

  // Named target overlap — strongest single feature when it fires.
  if (profile.targets.size > 0 && features.targets.size > 0) {
    let weightedMatches = 0;
    let totalMatches = 0;
    for (const t of features.targets) {
      if (profile.targets.has(t)) {
        totalMatches++;
        weightedMatches += idfFor(opts.idf?.targets, t);
      }
    }
    if (totalMatches > 0) {
      const normalized = totalMatches / features.targets.size;
      logScore += w.targets * Math.log(1 + weightedMatches) * (0.5 + 0.5 * normalized);
    }
  }

  return logScore;
}

export interface RankedCandidate {
  actorId: string;
  logScore: number;
  rank: number;
}

/**
 * Rank all candidate actors for a given event's features. Higher
 * logScore = more likely.
 */
export function rankActors(
  features: EventFeatures,
  profiles: Map<string, ActorProfile>,
  vocab: Vocab,
  opts: ScoringOptions = {},
): RankedCandidate[] {
  const out: Array<{ actorId: string; logScore: number }> = [];
  for (const [actorId, profile] of profiles.entries()) {
    if (profile.total === 0) continue;
    out.push({ actorId, logScore: scoreActor(features, actorId, profile, vocab, opts) });
  }
  out.sort((a, b) => b.logScore - a.logScore);
  return out.map((x, i) => ({ ...x, rank: i + 1 }));
}

/** Convenience: convert top-k log scores to a softmax-normalized probability vector. */
export function softmax(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const m = Math.max(...scores);
  const exp = scores.map((s) => Math.exp(s - m));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((e) => e / sum);
}
