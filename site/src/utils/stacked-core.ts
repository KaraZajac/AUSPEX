/**
 * Pure (fs-free) core of the stacked attribution re-ranker: meta-features,
 * z-score standardizer, and the L2-regularized logistic regression. Lives apart
 * from stacked-attribution.ts (which pulls the fs atlas singleton for the eval)
 * so the isomorphic /predict can build + apply the deployed re-ranker in the
 * browser. Types come from the pure atlas-core.
 */
import type { AuspexEvent, Atlas, Actor } from './atlas-core';
import type { RankedCandidate } from './attribution';

/** Gradient-descent hyperparameters (shared by eval + deployment fit). */
export const LR = 0.05;
export const ITERATIONS = 400;
export const L2 = 0.5;

export interface PairFeatures {
  nbLogScore: number;        // base-learner log-score (NB or CNB)
  nbRank: number;            // 1-indexed
  nbMarginToTop: number;     // (top-1 logscore) - (this logscore); 0 for rank-1
  targetOrgMatches: number;
  malwareLineageHit: number;
  operatorHit: number;
  campaignMatch: number;
  inActiveWindow: number;
  sameStateAsTarget: number;
  hasMitreProfile: number;
}

export const FEATURE_KEYS: Array<keyof PairFeatures> = [
  'nbLogScore', 'nbRank', 'nbMarginToTop',
  'targetOrgMatches', 'malwareLineageHit', 'operatorHit',
  'campaignMatch', 'inActiveWindow', 'sameStateAsTarget', 'hasMitreProfile',
];

export interface PairRow extends PairFeatures {
  eventId: string;
  actorId: string;
  label: number; // 1 if true actor, 0 otherwise
}

/** Per-actor set of known editorial campaign ids (for the campaign-match feature). */
export function buildKnownCampaigns(events: Iterable<AuspexEvent>, actorsOf: (e: AuspexEvent) => Iterable<string>): Map<string, Set<string>> {
  const known = new Map<string, Set<string>>();
  for (const e of events) {
    if (!e.campaign_id) continue;
    for (const aid of actorsOf(e)) {
      let s = known.get(aid);
      if (!s) { s = new Set(); known.set(aid, s); }
      s.add(e.campaign_id);
    }
  }
  return known;
}

export function pairFeatures(
  event: AuspexEvent,
  candidate: RankedCandidate,
  topLogScore: number,
  atlas: Atlas,
  knownCampaignsByActor: Map<string, Set<string>>,
): PairFeatures {
  const actor: Actor | undefined = atlas.actors.get(candidate.actorId);
  const evDate = (event.start_date ?? event.disclosure_date ?? '').slice(0, 10);
  const evYear = parseInt(evDate.slice(0, 4), 10);

  const actorEvents = atlas.eventsForActor(candidate.actorId);
  const actorTargets = new Set<string>();
  for (const e of actorEvents) {
    for (const t of e.targets ?? []) {
      if (!t.target_id) continue;
      if (t.target_id.startsWith('orgs/') || t.target_id.startsWith('infra/')) actorTargets.add(t.target_id);
    }
  }
  let targetOrgMatches = 0;
  for (const t of event.targets ?? []) {
    if (!t.target_id) continue;
    if (t.target_id.startsWith('orgs/') || t.target_id.startsWith('infra/')) {
      if (actorTargets.has(t.target_id)) targetOrgMatches++;
    }
  }

  const actorMalware = new Set<string>(actor?.mitre_malware ?? []);
  const actorLineageGroups = new Set<string>();
  for (const m of actorMalware) {
    const lg = atlas.malwareLineageGroup.get(m.toLowerCase());
    if (lg) actorLineageGroups.add(lg);
  }
  const text = ((event.summary ?? '') + ' ' + (event.outcome_summary ?? '')).toLowerCase();
  let malwareLineageHit = 0;
  for (const fam of atlas.malwareLineage.keys()) {
    const esc = fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp(`\\b${esc}\\b`).test(text)) continue;
    if (actorMalware.has(fam)) { malwareLineageHit += 2; continue; }
    const lg = atlas.malwareLineageGroup.get(fam);
    if (lg && actorLineageGroups.has(lg)) malwareLineageHit += 1;
  }

  const actorOps = new Set<string>();
  for (const e of actorEvents) for (const op of e.operators_named ?? []) actorOps.add(op);
  let operatorHit = 0;
  for (const op of event.operators_named ?? []) if (actorOps.has(op)) operatorHit++;

  const campaignMatch = event.campaign_id && knownCampaignsByActor.get(candidate.actorId)?.has(event.campaign_id) ? 1 : 0;

  let inActiveWindow = 1;
  if (actor?.active_since) {
    const since = parseInt(actor.active_since.slice(0, 4), 10);
    if (Number.isFinite(since) && Number.isFinite(evYear) && evYear < since) inActiveWindow = 0;
  }
  if (actor?.active_until) {
    const until = parseInt(actor.active_until.slice(0, 4), 10);
    if (Number.isFinite(until) && Number.isFinite(evYear) && evYear > until) inActiveWindow = 0;
  }

  const actorState = (actor?.primary_service_id ?? '').split('/')[0];
  let sameStateAsTarget = 0;
  for (const t of event.targets ?? []) {
    if ((t.country ?? '').toLowerCase() === actorState) { sameStateAsTarget = 1; break; }
  }

  return {
    nbLogScore: candidate.logScore,
    nbRank: candidate.rank,
    nbMarginToTop: topLogScore - candidate.logScore,
    targetOrgMatches,
    malwareLineageHit,
    operatorHit,
    campaignMatch,
    inActiveWindow,
    sameStateAsTarget,
    hasMitreProfile: actor && (actor.mitre_techniques?.length ?? 0) > 0 ? 1 : 0,
  };
}

export function vectorize(p: PairFeatures): number[] {
  return FEATURE_KEYS.map((k) => p[k]);
}

export interface Standardizer { mean: number[]; std: number[]; }

export function fitStandardizer(rows: PairFeatures[]): Standardizer {
  const D = FEATURE_KEYS.length;
  const n = rows.length;
  const mean = new Array(D).fill(0);
  const sq = new Array(D).fill(0);
  for (const r of rows) {
    const v = vectorize(r);
    for (let i = 0; i < D; i++) { mean[i] += v[i] / n; sq[i] += (v[i] * v[i]) / n; }
  }
  const std = mean.map((m, i) => Math.sqrt(Math.max(1e-6, sq[i] - m * m)));
  return { mean, std };
}

export function standardize(v: number[], s: Standardizer): number[] {
  return v.map((x, i) => (x - s.mean[i]) / s.std[i]);
}

export interface LogReg { w: number[]; b: number; standardizer: Standardizer; }

function sigmoid(z: number): number {
  if (z >= 0) { const ez = Math.exp(-z); return 1 / (1 + ez); }
  const ez = Math.exp(z);
  return ez / (1 + ez);
}

export function trainLogReg(rows: PairRow[]): LogReg {
  const standardizer = fitStandardizer(rows);
  const D = FEATURE_KEYS.length;
  const N = rows.length;
  const w = new Array(D).fill(0);
  let b = 0;
  const X: number[][] = rows.map((r) => standardize(vectorize(r), standardizer));
  const y: number[] = rows.map((r) => r.label);
  for (let it = 0; it < ITERATIONS; it++) {
    let gradB = 0;
    const gradW = new Array(D).fill(0);
    for (let i = 0; i < N; i++) {
      let z = b;
      for (let j = 0; j < D; j++) z += w[j] * X[i][j];
      const p = sigmoid(z);
      const err = p - y[i];
      gradB += err / N;
      for (let j = 0; j < D; j++) gradW[j] += (err * X[i][j]) / N;
    }
    b -= LR * gradB;
    for (let j = 0; j < D; j++) w[j] -= LR * (gradW[j] + (L2 * w[j]) / N);
  }
  return { w, b, standardizer };
}

export function predictLogReg(model: LogReg, p: PairFeatures): number {
  const v = standardize(vectorize(p), model.standardizer);
  let z = model.b;
  for (let j = 0; j < model.w.length; j++) z += model.w[j] * v[j];
  return sigmoid(z);
}
