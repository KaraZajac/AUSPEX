/**
 * Stacked attribution: meta-classifier over the Naive-Bayes engine's
 * top-K candidates per held-out event.
 *
 * Why stack? NB does well at the cluster level but loses sibling
 * discrimination (Lazarus ↔ TraderTraitor, DonotTeam ↔ SideWinder)
 * because the parent-cluster features dominate. A stacker that sees
 * the NB rank-1 + supplementary discriminative features (named-org
 * match, malware-lineage hit, operator overlap, in-window activity,
 * campaign overlap) can re-rank within the cluster.
 *
 * Methodology:
 *   1. LOO with NB → top-K candidates per held-out event
 *   2. Per (candidate, event) pair, compute a meta-feature vector
 *   3. Split events into stacker-train (80%) and stacker-eval (20%),
 *      seeded so numbers reproduce. The stacker NEVER trains on an
 *      event it later re-ranks.
 *   4. Train L2-regularized logistic regression on the train pairs
 *   5. Re-rank candidates on stacker-eval events; report top-K metrics
 *
 * Output is comparable to the plain LOO attribution numbers on the
 * stacker-eval slice — same denominator, same per-state breakdown.
 */
import { atlas, type AuspexEvent, type Atlas, type Actor } from './atlas';
import {
  actorsOfEvent,
  buildProfiles,
  buildVocab,
  buildIDF,
  extractFeatures,
  rankActors,
  type RankedCandidate,
  type ProfileBuildOptions,
} from './attribution';

/** Number of NB candidates the stacker considers per event. */
const TOP_K = 10;
/** Random-split seed (deterministic). */
const SPLIT_SEED = 0xAB13C0DE;
/** Default number of stratified k-folds for the stacker evaluation. */
const DEFAULT_K_FOLDS = 5;
/** L2 regularization. */
const L2 = 0.5;
/** Learning rate. */
const LR = 0.05;
/** Gradient-descent iterations. */
const ITERATIONS = 400;

interface PairFeatures {
  nbLogScore: number;        // raw NB log-score
  nbRank: number;            // 1-indexed
  nbMarginToTop: number;     // (nb top-1 logscore) - (this logscore); 0 for rank-1
  targetOrgMatches: number;  // count of event.targets[*].target_id that appear in actor profile
  malwareLineageHit: number; // count of matches across malware-lineage groups
  operatorHit: number;       // count of matches over event.operators_named
  campaignMatch: number;     // 1 if event.campaign_id is in actor's known campaigns, else 0
  inActiveWindow: number;    // 1 if event date is within [active_since, active_until], else 0
  sameStateAsTarget: number; // 1 if actor's state == event target's country, else 0
  hasMitreProfile: number;   // 1 if actor has MITRE-derived TTPs
}

const FEATURE_KEYS: Array<keyof PairFeatures> = [
  'nbLogScore', 'nbRank', 'nbMarginToTop',
  'targetOrgMatches', 'malwareLineageHit', 'operatorHit',
  'campaignMatch', 'inActiveWindow', 'sameStateAsTarget', 'hasMitreProfile',
];

interface PairRow extends PairFeatures {
  eventId: string;
  actorId: string;
  label: number;  // 1 if true actor, 0 otherwise
}

function pairFeatures(
  event: AuspexEvent,
  candidate: RankedCandidate,
  topLogScore: number,
  atlas: Atlas,
  knownCampaignsByActor: Map<string, Set<string>>,
): PairFeatures {
  const actor: Actor | undefined = atlas.actors.get(candidate.actorId);
  const evDate = (event.start_date ?? event.disclosure_date ?? '').slice(0, 10);
  const evYear = parseInt(evDate.slice(0, 4), 10);

  // Target-org matches: how many of this event's named targets appear
  // in any past event attributed to this actor?
  const actorEvents = atlas.eventsForActor(candidate.actorId);
  const actorTargets = new Set<string>();
  for (const e of actorEvents) {
    for (const t of e.targets ?? []) {
      if (!t.target_id) continue;
      if (t.target_id.startsWith('orgs/') || t.target_id.startsWith('infra/')) {
        actorTargets.add(t.target_id);
      }
    }
  }
  let targetOrgMatches = 0;
  for (const t of event.targets ?? []) {
    if (!t.target_id) continue;
    if (t.target_id.startsWith('orgs/') || t.target_id.startsWith('infra/')) {
      if (actorTargets.has(t.target_id)) targetOrgMatches++;
    }
  }

  // Malware-lineage hit: any lineage-group overlap between event prose
  // and actor's known malware?
  const actorMalware = new Set<string>(actor?.mitre_malware ?? []);
  const actorLineageGroups = new Set<string>();
  for (const m of actorMalware) {
    const lg = atlas.malwareLineageGroup.get(m.toLowerCase());
    if (lg) actorLineageGroups.add(lg);
  }
  const text = ((event.summary ?? '') + ' ' + (event.outcome_summary ?? '')).toLowerCase();
  let malwareLineageHit = 0;
  for (const fam of atlas.malwareLineage.keys()) {
    if (!text.includes(fam)) continue;
    if (actorMalware.has(fam)) {
      malwareLineageHit += 2; // exact match
      continue;
    }
    const lg = atlas.malwareLineageGroup.get(fam);
    if (lg && actorLineageGroups.has(lg)) malwareLineageHit += 1; // lineage match
  }

  // Operator hit: count event.operators_named in actor's known operators
  const actorOps = new Set<string>();
  for (const e of actorEvents) {
    for (const op of e.operators_named ?? []) actorOps.add(op);
  }
  let operatorHit = 0;
  for (const op of event.operators_named ?? []) {
    if (actorOps.has(op)) operatorHit++;
  }

  // Campaign match: event campaign_id appears in actor's known campaigns
  const campaignMatch = event.campaign_id && knownCampaignsByActor.get(candidate.actorId)?.has(event.campaign_id) ? 1 : 0;

  // In active window
  let inActiveWindow = 1;
  if (actor?.active_since) {
    const since = parseInt(actor.active_since.slice(0, 4), 10);
    if (Number.isFinite(since) && Number.isFinite(evYear) && evYear < since) inActiveWindow = 0;
  }
  if (actor?.active_until) {
    const until = parseInt(actor.active_until.slice(0, 4), 10);
    if (Number.isFinite(until) && Number.isFinite(evYear) && evYear > until) inActiveWindow = 0;
  }

  // Same state as target?
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

function vectorize(p: PairFeatures): number[] {
  return FEATURE_KEYS.map((k) => p[k]);
}

/** Z-score normalization computed from the training pairs. */
interface Standardizer {
  mean: number[];
  std: number[];
}

function fitStandardizer(rows: PairFeatures[]): Standardizer {
  const D = FEATURE_KEYS.length;
  const n = rows.length;
  const mean = new Array(D).fill(0);
  const sq = new Array(D).fill(0);
  for (const r of rows) {
    const v = vectorize(r);
    for (let i = 0; i < D; i++) {
      mean[i] += v[i] / n;
      sq[i] += (v[i] * v[i]) / n;
    }
  }
  const std = mean.map((m, i) => Math.sqrt(Math.max(1e-6, sq[i] - m * m)));
  return { mean, std };
}

function standardize(v: number[], s: Standardizer): number[] {
  return v.map((x, i) => (x - s.mean[i]) / s.std[i]);
}

/** L2-regularized logistic regression via batch gradient descent. */
interface LogReg {
  w: number[];
  b: number;
  standardizer: Standardizer;
}

function sigmoid(z: number): number {
  if (z >= 0) {
    const ez = Math.exp(-z);
    return 1 / (1 + ez);
  }
  const ez = Math.exp(z);
  return ez / (1 + ez);
}

function trainLogReg(rows: PairRow[]): LogReg {
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

function predictLogReg(model: LogReg, p: PairFeatures): number {
  const v = standardize(vectorize(p), model.standardizer);
  let z = model.b;
  for (let j = 0; j < model.w.length; j++) z += model.w[j] * v[j];
  return sigmoid(z);
}

export interface FoldMetrics {
  nbHit1: number; nbHit3: number; nbHit5: number; nbMrr: number;
  stHit1: number; stHit3: number; stHit5: number; stMrr: number;
  n: number;
}

export interface StackedEvalResult {
  /** Number of events in the aggregated eval (== total labeled events). */
  scored: number;
  /** Plain-NB top-K hit rates aggregated across all folds. */
  nbHit1: number;
  nbHit3: number;
  nbHit5: number;
  nbMrr: number;
  /** Stacker re-ranked metrics aggregated across all folds. */
  hit1: number;
  hit3: number;
  hit5: number;
  mrr: number;
  /** Per-fold metrics, for mean ± std reporting. */
  folds: FoldMetrics[];
  /** Learned feature weights from a final model trained on ALL labeled
   *  events. Exposes interpretability without contaminating eval —
   *  the per-fold metrics never use this model. */
  featureWeights: Array<{ key: string; weight: number }>;
  /** Bias term from the all-events training. */
  bias: number;
  /** Number of folds used. */
  numFolds: number;
  /** Per-event {0,1} hit arrays for bootstrap CI computation downstream. */
  perEvent: {
    nbHit1: number[];
    nbHit3: number[];
    nbHit5: number[];
    nbRr: number[];
    stHit1: number[];
    stHit3: number[];
    stHit5: number[];
    stRr: number[];
  };
  generatedAt: string;
}

/** Mean and sample std of an array of numbers. */
export function meanStd(xs: number[]): { mean: number; std: number } {
  if (xs.length === 0) return { mean: 0, std: 0 };
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  if (xs.length === 1) return { mean: m, std: 0 };
  const v = xs.reduce((s, x) => s + (x - m) * (x - m), 0) / (xs.length - 1);
  return { mean: m, std: Math.sqrt(v) };
}

/** Light-weight per-event "row" the k-fold loop operates on. */
interface EventTopK {
  event: AuspexEvent;
  state: string;
  candidates: Array<RankedCandidate & { features: PairFeatures }>;
  trueActors: Set<string>;
}

function eventState(event: AuspexEvent, a: Atlas): string {
  for (const aid of actorsOfEvent(event)) {
    const svc = a.actors.get(aid)?.primary_service_id;
    if (svc) return svc.split('/')[0];
    const head = aid.split('/')[0];
    if (head === 'criminal') return 'criminal';
    if (head && head.length === 2) return head;
  }
  for (const attr of event.attributions ?? []) {
    if (attr.service_id) return attr.service_id.split('/')[0];
  }
  return '??';
}

/**
 * Full pipeline (stratified k-fold version):
 *   - LOO NB on the full corpus → per-event top-K candidates + meta-features
 *   - Partition events into K folds, stratified by attacker state
 *     so every fold gets a representative state mix
 *   - For each fold: train logistic regression on other K-1 folds'
 *     (candidate, event) pairs, re-rank the held-out fold's candidates,
 *     record metrics
 *   - Every event participates in eval exactly once
 *   - Report per-fold + aggregated + feature weights from an
 *     all-events training (interpretability only, never used in eval)
 */
export function runStackedAttributionLOO(numFolds: number = DEFAULT_K_FOLDS): StackedEvalResult {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => actorsOfEvent(e).size > 0);

  // Pre-compute per-actor campaign sets for the campaign-match feature.
  const knownCampaigns = new Map<string, Set<string>>();
  for (const e of allEvents) {
    if (!e.campaign_id) continue;
    for (const aid of actorsOfEvent(e)) {
      let s = knownCampaigns.get(aid);
      if (!s) { s = new Set(); knownCampaigns.set(aid, s); }
      s.add(e.campaign_id);
    }
  }

  // LOO NB → top-K candidates + meta-features per labeled event.
  const eventRows: EventTopK[] = [];
  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const opts: ProfileBuildOptions = { servicePriorLambda: 0.1 };
    if (refDate) opts.referenceDate = refDate;
    const profiles = buildProfiles(training, a, opts);
    const vocab = buildVocab(training, a);
    const idf = buildIDF(profiles);
    const features = extractFeatures(heldOut, a);
    const ranked = rankActors(features, profiles, vocab, { idf, malwareLineageGroup: a.malwareLineageGroup });
    const topK = ranked.slice(0, TOP_K);
    const topScore = topK[0]?.logScore ?? 0;
    const cands = topK.map((c) => {
      const pf = pairFeatures(heldOut, c, topScore, a, knownCampaigns);
      return { ...c, features: pf };
    });
    eventRows.push({
      event: heldOut,
      state: eventState(heldOut, a),
      candidates: cands,
      trueActors: actorsOfEvent(heldOut),
    });
  }

  // Stratified fold assignment: for each state, distribute its events
  // across folds in seeded round-robin. Guarantees every fold has
  // approximately the same state distribution.
  let lcg = SPLIT_SEED >>> 0;
  function rand(): number {
    lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0;
    return lcg / 0x100000000;
  }
  const byState = new Map<string, EventTopK[]>();
  for (const r of eventRows) {
    let bucket = byState.get(r.state);
    if (!bucket) { bucket = []; byState.set(r.state, bucket); }
    bucket.push(r);
  }
  const foldOf = new Map<string, number>();
  for (const bucket of byState.values()) {
    // Stable per-state shuffle with the LCG.
    const sorted = [...bucket].sort((x, y) => x.event.id.localeCompare(y.event.id));
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    }
    sorted.forEach((r, i) => foldOf.set(r.event.id, i % numFolds));
  }

  // Per-event accumulators (each event scored exactly once).
  const perEvent = {
    nbHit1: [] as number[], nbHit3: [] as number[], nbHit5: [] as number[], nbRr: [] as number[],
    stHit1: [] as number[], stHit3: [] as number[], stHit5: [] as number[], stRr: [] as number[],
  };
  const folds: FoldMetrics[] = [];
  let aggNbHit1 = 0, aggNbHit3 = 0, aggNbHit5 = 0, aggNbMrr = 0;
  let aggStHit1 = 0, aggStHit3 = 0, aggStHit5 = 0, aggStMrr = 0;
  let scored = 0;

  for (let k = 0; k < numFolds; k++) {
    // Build training pairs from the other K-1 folds.
    const trainPairs: PairRow[] = [];
    for (const r of eventRows) {
      if (foldOf.get(r.event.id) === k) continue;
      for (const c of r.candidates) {
        trainPairs.push({
          ...c.features,
          eventId: r.event.id,
          actorId: c.actorId,
          label: r.trueActors.has(c.actorId) ? 1 : 0,
        });
      }
    }
    const model = trainLogReg(trainPairs);

    // Eval on fold k.
    let fNbH1 = 0, fNbH3 = 0, fNbH5 = 0, fNbRr = 0;
    let fStH1 = 0, fStH3 = 0, fStH5 = 0, fStRr = 0;
    let foldN = 0;
    for (const r of eventRows) {
      if (foldOf.get(r.event.id) !== k) continue;
      if (r.candidates.length === 0) continue;
      const nbRanked = [...r.candidates].sort((x, y) => x.rank - y.rank);
      const stRanked = [...r.candidates]
        .map((c) => ({ ...c, stProb: predictLogReg(model, c.features) }))
        .sort((a, b) => b.stProb - a.stProb);
      const bestRank = (ranked: typeof nbRanked): number | null => {
        const idxs = [...r.trueActors].map((aid) => ranked.findIndex((c) => c.actorId === aid)).filter((i) => i >= 0);
        return idxs.length === 0 ? null : Math.min(...idxs) + 1;
      };
      // Honest scoring: when the true actor is outside the NB top-K
      // (rnb === null), neither NB top-K nor stacker can recover it.
      // Count as miss for both engines (0 across hit@K, 0 reciprocal
      // rank). Previously these were silently skipped, inflating both
      // engines' apparent rates symmetrically.
      const rnb = bestRank(nbRanked);
      const rst = bestRank(stRanked);

      foldN++; scored++;
      const nbH1 = rnb === 1 ? 1 : 0;
      const nbH3 = rnb !== null && rnb <= 3 ? 1 : 0;
      const nbH5 = rnb !== null && rnb <= 5 ? 1 : 0;
      const nbRr = rnb !== null ? 1 / rnb : 0;
      const stH1 = rst === 1 ? 1 : 0;
      const stH3 = rst !== null && rst <= 3 ? 1 : 0;
      const stH5 = rst !== null && rst <= 5 ? 1 : 0;
      const stRr = rst !== null ? 1 / rst : 0;
      fNbH1 += nbH1; fNbH3 += nbH3; fNbH5 += nbH5; fNbRr += nbRr;
      fStH1 += stH1; fStH3 += stH3; fStH5 += stH5; fStRr += stRr;
      aggNbHit1 += nbH1; aggNbHit3 += nbH3; aggNbHit5 += nbH5; aggNbMrr += nbRr;
      aggStHit1 += stH1; aggStHit3 += stH3; aggStHit5 += stH5; aggStMrr += stRr;
      perEvent.nbHit1.push(nbH1); perEvent.nbHit3.push(nbH3); perEvent.nbHit5.push(nbH5); perEvent.nbRr.push(nbRr);
      perEvent.stHit1.push(stH1); perEvent.stHit3.push(stH3); perEvent.stHit5.push(stH5); perEvent.stRr.push(stRr);
    }
    folds.push({
      nbHit1: foldN === 0 ? 0 : fNbH1 / foldN,
      nbHit3: foldN === 0 ? 0 : fNbH3 / foldN,
      nbHit5: foldN === 0 ? 0 : fNbH5 / foldN,
      nbMrr:  foldN === 0 ? 0 : fNbRr / foldN,
      stHit1: foldN === 0 ? 0 : fStH1 / foldN,
      stHit3: foldN === 0 ? 0 : fStH3 / foldN,
      stHit5: foldN === 0 ? 0 : fStH5 / foldN,
      stMrr:  foldN === 0 ? 0 : fStRr / foldN,
      n: foldN,
    });
  }

  // Feature weights: train one final model on ALL pairs. Interpretability
  // surface only — never used in the per-fold eval.
  const allPairs: PairRow[] = [];
  for (const r of eventRows) {
    for (const c of r.candidates) {
      allPairs.push({
        ...c.features,
        eventId: r.event.id,
        actorId: c.actorId,
        label: r.trueActors.has(c.actorId) ? 1 : 0,
      });
    }
  }
  const finalModel = trainLogReg(allPairs);

  const featureWeights = FEATURE_KEYS.map((k, i) => ({ key: k as string, weight: finalModel.w[i] }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return {
    scored,
    nbHit1: scored === 0 ? 0 : aggNbHit1 / scored,
    nbHit3: scored === 0 ? 0 : aggNbHit3 / scored,
    nbHit5: scored === 0 ? 0 : aggNbHit5 / scored,
    nbMrr:  scored === 0 ? 0 : aggNbMrr / scored,
    hit1: scored === 0 ? 0 : aggStHit1 / scored,
    hit3: scored === 0 ? 0 : aggStHit3 / scored,
    hit5: scored === 0 ? 0 : aggStHit5 / scored,
    mrr:  scored === 0 ? 0 : aggStMrr / scored,
    folds,
    numFolds,
    featureWeights,
    bias: finalModel.b,
    perEvent,
    generatedAt: new Date().toISOString(),
  };
}
