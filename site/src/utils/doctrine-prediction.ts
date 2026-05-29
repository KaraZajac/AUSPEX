/**
 * Doctrine prediction engine (v0).
 *
 * Given an event's features, predict which doctrines it serves.
 * Multi-label: most events tag against >1 doctrine.
 *
 * Reuses the EventFeatures shape from the attribution engine — the
 * input is the same; only the label space (doctrines, not actors)
 * and aggregation differ.
 */
import { Atlas, type AuspexEvent } from './atlas-core';
import { extractFeatures, type EventFeatures, type Vocab, type ProfileBuildOptions, type IDFMap } from './attribution';
import { parentTechnique } from './ttp-extract';

function temporalWeightYears(eventDate: string | undefined, refDate: string, tau: number): number {
  const ey = parseInt((eventDate ?? '').slice(0, 4), 10);
  const ry = parseInt(refDate.slice(0, 4), 10);
  if (!Number.isFinite(ey) || !Number.isFinite(ry)) return 1.0;
  return Math.exp(-Math.abs(ey - ry) / tau);
}
function idfFor(map: Map<string, number> | undefined, key: string): number {
  if (!map) return 1.0;
  return map.get(key) ?? 1.0;
}
/** Dampen IDF amplification — full IDF tends to over-reward actors/doctrines with
 *  cross-mission breadth (APT41, ru/fpc-2023). sqrt(IDF) keeps the discriminative
 *  direction without runaway amplification. */
function dampened(idf: number): number {
  return Math.sqrt(Math.max(idf, 0.01));
}

export interface DoctrineProfile {
  total: number;
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

/** Extract the set of top-level doctrine ids labeled on an event. */
export function doctrinesOfEvent(event: AuspexEvent, atlas: Atlas): Set<string> {
  const out = new Set<string>();
  for (const link of event.doctrine_links ?? []) {
    let did = link.doctrine_id;
    if (!did && link.pillar_id) did = atlas.pillars.get(link.pillar_id)?.doctrineId;
    if (!did && link.program_id) did = atlas.programs.get(link.program_id)?.doctrineId;
    if (did) out.add(did);
  }
  return out;
}

/** Build per-doctrine feature profiles from a training event set. */
export function buildDoctrineProfiles(
  events: AuspexEvent[],
  atlas: Atlas,
  opts: ProfileBuildOptions = {},
): Map<string, DoctrineProfile> {
  const refDate = opts.referenceDate ?? null;
  const tau = opts.temporalTau ?? 3;
  const profiles = new Map<string, DoctrineProfile>();
  for (const event of events) {
    const features = extractFeatures(event, atlas);
    const w = refDate ? temporalWeightYears(event.start_date ?? event.disclosure_date, refDate, tau) : 1.0;
    for (const did of doctrinesOfEvent(event, atlas)) {
      let p = profiles.get(did);
      if (!p) {
        p = { total: 0, sectors: new Map(), countries: new Map(), vectors: new Map(), years: new Map(), incidentTypes: new Map(), ttps: new Map(), ttpPairs: new Map(), malware: new Map(), targets: new Map(), markers: new Map(), campaigns: new Map(), inferredCampaigns: new Map(), proseTerms: new Map(), operators: new Map() };
        profiles.set(did, p);
      }
      p.total += w;
      for (const s of features.sectors) p.sectors.set(s, (p.sectors.get(s) ?? 0) + w);
      for (const c of features.countries) p.countries.set(c, (p.countries.get(c) ?? 0) + w);
      if (features.vector) p.vectors.set(features.vector, (p.vectors.get(features.vector) ?? 0) + w);
      if (features.year) p.years.set(features.year, (p.years.get(features.year) ?? 0) + w);
      for (const it of features.incidentTypes) p.incidentTypes.set(it, (p.incidentTypes.get(it) ?? 0) + w);
      for (const t of features.ttps) p.ttps.set(t, (p.ttps.get(t) ?? 0) + w);
      for (const tp of features.ttpPairs) p.ttpPairs.set(tp, (p.ttpPairs.get(tp) ?? 0) + w);
      for (const m of features.malware) p.malware.set(m, (p.malware.get(m) ?? 0) + w);
      for (const tg of features.targets) p.targets.set(tg, (p.targets.get(tg) ?? 0) + w);
      for (const mk of features.markers) p.markers.set(mk, (p.markers.get(mk) ?? 0) + w);
      if (features.campaign) p.campaigns.set(features.campaign, (p.campaigns.get(features.campaign) ?? 0) + w);
      if (features.inferredCampaign) p.inferredCampaigns.set(features.inferredCampaign, (p.inferredCampaigns.get(features.inferredCampaign) ?? 0) + w);
      for (const pt of features.proseTerms) p.proseTerms.set(pt, (p.proseTerms.get(pt) ?? 0) + w);
      for (const op of features.operators) p.operators.set(op, (p.operators.get(op) ?? 0) + w);
    }
  }
  return profiles;
}

/** IDF over the doctrine corpus — mirror of buildIDF for attribution. */
export function buildDoctrineIDF(profiles: Map<string, DoctrineProfile>): IDFMap {
  function idfOf(extract: (p: DoctrineProfile) => Iterable<string>): Map<string, number> {
    const docCounts = new Map<string, number>();
    let N = 0;
    for (const p of profiles.values()) {
      if (p.total === 0) continue;
      N++;
      const seen = new Set<string>();
      for (const k of extract(p)) {
        if (seen.has(k)) continue;
        seen.add(k);
        docCounts.set(k, (docCounts.get(k) ?? 0) + 1);
      }
    }
    const idf = new Map<string, number>();
    for (const [k, c] of docCounts) idf.set(k, Math.log((N + 1) / (c + 1)) + 1);
    return idf;
  }
  return {
    sectors:       idfOf((p) => p.sectors.keys()),
    countries:     idfOf((p) => p.countries.keys()),
    vectors:       idfOf((p) => p.vectors.keys()),
    years:         idfOf((p) => p.years.keys()),
    incidentTypes: idfOf((p) => p.incidentTypes.keys()),
    ttps:          idfOf((p) => p.ttps.keys()),
    ttpPairs:      idfOf((p) => p.ttpPairs.keys()),
    malware:       idfOf((p) => p.malware.keys()),
    targets:       idfOf((p) => p.targets.keys()),
    markers:       idfOf((p) => p.markers.keys()),
    campaigns:     idfOf((p) => p.campaigns.keys()),
    inferredCampaigns: idfOf((p) => p.inferredCampaigns.keys()),
    proseTerms:    idfOf((p) => p.proseTerms.keys()),
    operators:     idfOf((p) => p.operators.keys()),
  };
}

export interface DoctrineScoringOptions {
  alpha?: number;
  priorWeight?: number;
  weights?: Partial<{ sectors: number; countries: number; vector: number; year: number; incident: number; ttps: number; ttpPairs: number; malware: number; targets: number; markers: number; campaign: number; inferredCampaign: number; proseTerms: number; operators: number }>;
  /** Optional IDF map (built via buildDoctrineIDF). When provided, each
   *  feature's log-likelihood contribution is multiplied by sqrt(IDF). */
  idf?: IDFMap;
}

export interface RankedDoctrine {
  doctrineId: string;
  logScore: number;
  rank: number;
}

/** Log P(doctrine | features), up to a constant. */
export function scoreDoctrine(
  features: EventFeatures,
  doctrineId: string,
  profile: DoctrineProfile,
  vocab: Vocab,
  opts: DoctrineScoringOptions = {},
): number {
  const alpha = opts.alpha ?? 0.5;
  const priorWeight = opts.priorWeight ?? 1.0;
  const w = {
    sectors: opts.weights?.sectors ?? 1.0,
    countries: opts.weights?.countries ?? 1.0,
    vector: opts.weights?.vector ?? 0.5,
    year: opts.weights?.year ?? 0.5,
    incident: opts.weights?.incident ?? 1.0,
    ttps: opts.weights?.ttps ?? 0.6,
    ttpPairs: opts.weights?.ttpPairs ?? 0.3,
    malware: opts.weights?.malware ?? 0.8,
    targets: opts.weights?.targets ?? 1.0,
    markers: opts.weights?.markers ?? 1.2,  // doctrines are framed by geopolitical context — weight higher
    campaign: opts.weights?.campaign ?? 2.5,
    inferredCampaign: opts.weights?.inferredCampaign ?? 1.0,
    proseTerms: opts.weights?.proseTerms ?? 0.5, // moderate — doctrines have characteristic vocabulary in their attesting prose
    operators: opts.weights?.operators ?? 3.0, // high — named operators belong to specific service / doctrine clusters
  };

  function smoothedLog(valueCount: number, totalForDoctrine: number, vocabSize: number): number {
    return Math.log((valueCount + alpha) / (totalForDoctrine + alpha * Math.max(vocabSize, 1)));
  }

  let logScore = priorWeight * Math.log((profile.total + alpha) / (vocab.totalEvents + alpha * vocab.sectors.size));

  for (const s of features.sectors) {
    const idf = dampened(idfFor(opts.idf?.sectors, s));
    logScore += w.sectors * idf * smoothedLog(profile.sectors.get(s) ?? 0, profile.total, vocab.sectors.size);
  }
  for (const c of features.countries) {
    const idf = dampened(idfFor(opts.idf?.countries, c));
    logScore += w.countries * idf * smoothedLog(profile.countries.get(c) ?? 0, profile.total, vocab.countries.size);
  }
  if (features.vector) {
    const idf = dampened(idfFor(opts.idf?.vectors, features.vector));
    logScore += w.vector * idf * smoothedLog(profile.vectors.get(features.vector) ?? 0, profile.total, vocab.vectors.size);
  }
  if (features.year) {
    const idf = dampened(idfFor(opts.idf?.years, features.year));
    logScore += w.year * idf * smoothedLog(profile.years.get(features.year) ?? 0, profile.total, vocab.years.size);
  }
  for (const it of features.incidentTypes) {
    const idf = dampened(idfFor(opts.idf?.incidentTypes, it));
    logScore += w.incident * idf * smoothedLog(profile.incidentTypes.get(it) ?? 0, profile.total, vocab.incidentTypes.size);
  }
  for (const t of features.ttps) {
    const k = parentTechnique(t);
    const idf = dampened(idfFor(opts.idf?.ttps, k));
    logScore += w.ttps * idf * smoothedLog(profile.ttps.get(k) ?? 0, profile.total, vocab.ttps.size);
  }
  for (const tp of features.ttpPairs) {
    const idf = dampened(idfFor(opts.idf?.ttpPairs, tp));
    logScore += w.ttpPairs * idf * smoothedLog(profile.ttpPairs.get(tp) ?? 0, profile.total, vocab.ttpPairs.size);
  }
  for (const m of features.malware) {
    const idf = dampened(idfFor(opts.idf?.malware, m));
    logScore += w.malware * idf * smoothedLog(profile.malware.get(m) ?? 0, profile.total, vocab.malware.size);
  }
  for (const tg of features.targets) {
    const idf = dampened(idfFor(opts.idf?.targets, tg));
    logScore += w.targets * idf * smoothedLog(profile.targets.get(tg) ?? 0, profile.total, vocab.targets.size);
  }
  for (const mk of features.markers) {
    const idf = dampened(idfFor(opts.idf?.markers, mk));
    logScore += w.markers * idf * smoothedLog(profile.markers.get(mk) ?? 0, profile.total, Math.max(vocab.markers.size, 1));
  }
  if (features.campaign) {
    const profileCount = profile.campaigns.get(features.campaign) ?? 0;
    if (profileCount > 0) {
      const idf = dampened(idfFor(opts.idf?.campaigns, features.campaign));
      logScore += w.campaign * idf * Math.log(1 + profileCount);
    }
  }
  if (features.inferredCampaign) {
    const profileCount = profile.inferredCampaigns.get(features.inferredCampaign) ?? 0;
    if (profileCount > 0) {
      const idf = dampened(idfFor(opts.idf?.inferredCampaigns, features.inferredCampaign));
      logScore += w.inferredCampaign * idf * Math.log(1 + profileCount);
    }
  }
  for (const pt of features.proseTerms) {
    const idf = dampened(idfFor(opts.idf?.proseTerms, pt));
    logScore += w.proseTerms * idf * smoothedLog(profile.proseTerms.get(pt) ?? 0, profile.total, Math.max(vocab.proseTerms.size, 1));
  }
  for (const op of features.operators) {
    const idf = dampened(idfFor(opts.idf?.operators, op));
    logScore += w.operators * idf * smoothedLog(profile.operators.get(op) ?? 0, profile.total, Math.max(vocab.operators.size, 1));
  }

  return logScore;
}

export function rankDoctrines(
  features: EventFeatures,
  profiles: Map<string, DoctrineProfile>,
  vocab: Vocab,
  opts: DoctrineScoringOptions = {},
): RankedDoctrine[] {
  const out: Array<{ doctrineId: string; logScore: number }> = [];
  for (const [doctrineId, profile] of profiles.entries()) {
    if (profile.total === 0) continue;
    out.push({ doctrineId, logScore: scoreDoctrine(features, doctrineId, profile, vocab, opts) });
  }
  out.sort((a, b) => b.logScore - a.logScore);
  return out.map((x, i) => ({ ...x, rank: i + 1 }));
}
