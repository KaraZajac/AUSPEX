/**
 * Pillar-level prediction engine.
 *
 * Predicts the specific doctrine *pillar* an event serves
 * (e.g., MIC2025/next-gen-it) rather than just the doctrine
 * (MIC2025). Same machinery as doctrine-prediction.ts, narrower
 * label space, higher analytic resolution.
 *
 * Pillars live nested inside doctrines (atlas.pillars Map). Each
 * event may carry zero or more pillar labels — links that only set
 * doctrine_id (without a pillar_id or program_id) contribute no
 * pillar label and don't train the engine.
 */
import { Atlas, type AuspexEvent } from './atlas';
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
  const raw = map.get(key) ?? 1.0;
  return Math.sqrt(Math.max(raw, 0.01));
}

export interface PillarProfile {
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

/** Extract the set of pillar ids labeled on an event (rolls programs up to pillars). */
export function pillarsOfEvent(event: AuspexEvent, atlas: Atlas): Set<string> {
  const out = new Set<string>();
  for (const link of event.doctrine_links ?? []) {
    let pid = link.pillar_id;
    if (!pid && link.program_id) {
      pid = atlas.programs.get(link.program_id)?.pillarId;
    }
    if (pid) out.add(pid);
  }
  return out;
}

/** Build per-pillar feature profiles from a training event set. */
export function buildPillarProfiles(
  events: AuspexEvent[],
  atlas: Atlas,
  opts: ProfileBuildOptions = {},
): Map<string, PillarProfile> {
  const refDate = opts.referenceDate ?? null;
  const tau = opts.temporalTau ?? 3;
  const profiles = new Map<string, PillarProfile>();
  for (const event of events) {
    const features = extractFeatures(event, atlas);
    const w = refDate ? temporalWeightYears(event.start_date ?? event.disclosure_date, refDate, tau) : 1.0;
    for (const pid of pillarsOfEvent(event, atlas)) {
      let p = profiles.get(pid);
      if (!p) {
        p = { total: 0, sectors: new Map(), countries: new Map(), vectors: new Map(), years: new Map(), incidentTypes: new Map(), ttps: new Map(), ttpPairs: new Map(), malware: new Map(), targets: new Map(), markers: new Map(), campaigns: new Map(), inferredCampaigns: new Map(), proseTerms: new Map(), operators: new Map() };
        profiles.set(pid, p);
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

/** IDF over pillar profiles — mirror of buildDoctrineIDF. */
export function buildPillarIDF(profiles: Map<string, PillarProfile>): IDFMap {
  function idfOf(extract: (p: PillarProfile) => Iterable<string>): Map<string, number> {
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

export interface PillarScoringOptions {
  alpha?: number;
  priorWeight?: number;
  weights?: Partial<{ sectors: number; countries: number; vector: number; year: number; incident: number; ttps: number; ttpPairs: number; malware: number; targets: number; markers: number; campaign: number; inferredCampaign: number; proseTerms: number; operators: number }>;
  idf?: IDFMap;
}

export interface RankedPillar {
  pillarId: string;
  logScore: number;
  rank: number;
}

/** Log P(pillar | features), up to a constant. */
export function scorePillar(
  features: EventFeatures,
  pillarId: string,
  profile: PillarProfile,
  vocab: Vocab,
  opts: PillarScoringOptions = {},
): number {
  const alpha = opts.alpha ?? 0.5;
  const priorWeight = opts.priorWeight ?? 1.0;
  // Pillars are more sector-aligned than doctrines (MIC2025/semis is
  // a sector statement); weight sectors slightly higher and year
  // slightly lower.
  const w = {
    sectors: opts.weights?.sectors ?? 1.5,
    countries: opts.weights?.countries ?? 1.0,
    vector: opts.weights?.vector ?? 0.5,
    year: opts.weights?.year ?? 0.3,
    incident: opts.weights?.incident ?? 1.0,
    ttps: opts.weights?.ttps ?? 0.6,
    ttpPairs: opts.weights?.ttpPairs ?? 0.3,
    malware: opts.weights?.malware ?? 0.8,
    targets: opts.weights?.targets ?? 1.0,
    markers: opts.weights?.markers ?? 1.0,
    campaign: opts.weights?.campaign ?? 2.5,
    inferredCampaign: opts.weights?.inferredCampaign ?? 1.0,
    proseTerms: opts.weights?.proseTerms ?? 0.5,
    operators: opts.weights?.operators ?? 2.5,
  };

  function smoothedLog(valueCount: number, totalForPillar: number, vocabSize: number): number {
    return Math.log((valueCount + alpha) / (totalForPillar + alpha * Math.max(vocabSize, 1)));
  }

  let logScore = priorWeight * Math.log((profile.total + alpha) / (vocab.totalEvents + alpha * vocab.sectors.size));

  for (const s of features.sectors) {
    logScore += w.sectors * idfFor(opts.idf?.sectors, s) * smoothedLog(profile.sectors.get(s) ?? 0, profile.total, vocab.sectors.size);
  }
  for (const c of features.countries) {
    logScore += w.countries * idfFor(opts.idf?.countries, c) * smoothedLog(profile.countries.get(c) ?? 0, profile.total, vocab.countries.size);
  }
  if (features.vector) {
    logScore += w.vector * idfFor(opts.idf?.vectors, features.vector) * smoothedLog(profile.vectors.get(features.vector) ?? 0, profile.total, vocab.vectors.size);
  }
  if (features.year) {
    logScore += w.year * idfFor(opts.idf?.years, features.year) * smoothedLog(profile.years.get(features.year) ?? 0, profile.total, vocab.years.size);
  }
  for (const it of features.incidentTypes) {
    logScore += w.incident * idfFor(opts.idf?.incidentTypes, it) * smoothedLog(profile.incidentTypes.get(it) ?? 0, profile.total, vocab.incidentTypes.size);
  }
  for (const t of features.ttps) {
    const k = parentTechnique(t);
    logScore += w.ttps * idfFor(opts.idf?.ttps, k) * smoothedLog(profile.ttps.get(k) ?? 0, profile.total, vocab.ttps.size);
  }
  for (const tp of features.ttpPairs) {
    logScore += w.ttpPairs * idfFor(opts.idf?.ttpPairs, tp) * smoothedLog(profile.ttpPairs.get(tp) ?? 0, profile.total, vocab.ttpPairs.size);
  }
  for (const m of features.malware) {
    logScore += w.malware * idfFor(opts.idf?.malware, m) * smoothedLog(profile.malware.get(m) ?? 0, profile.total, vocab.malware.size);
  }
  for (const tg of features.targets) {
    logScore += w.targets * idfFor(opts.idf?.targets, tg) * smoothedLog(profile.targets.get(tg) ?? 0, profile.total, vocab.targets.size);
  }
  for (const mk of features.markers) {
    logScore += w.markers * idfFor(opts.idf?.markers, mk) * smoothedLog(profile.markers.get(mk) ?? 0, profile.total, Math.max(vocab.markers.size, 1));
  }
  if (features.campaign) {
    const profileCount = profile.campaigns.get(features.campaign) ?? 0;
    if (profileCount > 0) {
      logScore += w.campaign * idfFor(opts.idf?.campaigns, features.campaign) * Math.log(1 + profileCount);
    }
  }
  if (features.inferredCampaign) {
    const profileCount = profile.inferredCampaigns.get(features.inferredCampaign) ?? 0;
    if (profileCount > 0) {
      logScore += w.inferredCampaign * idfFor(opts.idf?.inferredCampaigns, features.inferredCampaign) * Math.log(1 + profileCount);
    }
  }
  for (const pt of features.proseTerms) {
    logScore += w.proseTerms * idfFor(opts.idf?.proseTerms, pt) * smoothedLog(profile.proseTerms.get(pt) ?? 0, profile.total, Math.max(vocab.proseTerms.size, 1));
  }
  for (const op of features.operators) {
    logScore += w.operators * idfFor(opts.idf?.operators, op) * smoothedLog(profile.operators.get(op) ?? 0, profile.total, Math.max(vocab.operators.size, 1));
  }

  return logScore;
}

export function rankPillars(
  features: EventFeatures,
  profiles: Map<string, PillarProfile>,
  vocab: Vocab,
  opts: PillarScoringOptions = {},
): RankedPillar[] {
  const out: Array<{ pillarId: string; logScore: number }> = [];
  for (const [pillarId, profile] of profiles.entries()) {
    if (profile.total === 0) continue;
    out.push({ pillarId, logScore: scorePillar(features, pillarId, profile, vocab, opts) });
  }
  out.sort((a, b) => b.logScore - a.logScore);
  return out.map((x, i) => ({ ...x, rank: i + 1 }));
}
