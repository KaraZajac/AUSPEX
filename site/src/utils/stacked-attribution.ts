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
 *   3. Stratified 5-fold cross-validation (folds balanced by attacker
 *      state, seeded so numbers reproduce). The stacker NEVER trains on
 *      an event it later re-ranks; every event is scored exactly once.
 *   4. Train L2-regularized logistic regression on each fold's train pairs
 *   5. Re-rank the held-out fold's candidates; report top-K metrics under
 *      the null=miss convention (a true actor outside the NB top-K is a
 *      miss for both NB and stacker, and stays in the denominator).
 *
 * Output is comparable to the plain LOO attribution numbers — same event
 * set, same null=miss denominator, same per-state breakdown.
 */
import { atlas, isMetaEvent, type AuspexEvent, type Atlas } from './atlas';
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
import {
  type PairFeatures,
  type PairRow,
  type LogReg,
  FEATURE_KEYS,
  pairFeatures,
  trainLogReg,
  predictLogReg,
} from './stacked-core';
import { eventTokens, trainCNB, rankCNB } from './complement-nb';

/** Number of NB candidates the stacker considers per event. */
const TOP_K = 10;
/** Random-split seed (deterministic). */
const SPLIT_SEED = 0xAB13C0DE;
/** Default number of stratified k-folds for the stacker evaluation. */
const DEFAULT_K_FOLDS = 5;
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
  /** Full all-events logreg (w + b + standardizer) — the DEPLOYABLE re-ranker. */
  finalModel: LogReg;
  /** Number of folds used. */
  numFolds: number;
  /** Per-event {0,1} hit arrays for bootstrap CI computation downstream. */
  perEvent: {
    eventIds: string[];
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
export function runStackedAttributionLOO(
  numFolds: number = DEFAULT_K_FOLDS,
  baseRanker?: (heldOut: AuspexEvent, training: AuspexEvent[], a: Atlas) => RankedCandidate[],
): StackedEvalResult {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));

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
    let ranked: RankedCandidate[];
    if (baseRanker) {
      ranked = baseRanker(heldOut, training, a); // alternative base learner (e.g. ComplementNB)
    } else {
      const opts: ProfileBuildOptions = { servicePriorLambda: 0.2 }; // λ=0.2, matches headline engine (AUDIT-2026-05-29 B1)
      if (refDate) opts.referenceDate = refDate;
      const profiles = buildProfiles(training, a, opts);
      const vocab = buildVocab(training, a);
      const idf = buildIDF(profiles);
      const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
      ranked = rankActors(features, profiles, vocab, { idf, malwareLineageGroup: a.malwareLineageGroup });
    }
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
    eventIds: [] as string[],
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
      perEvent.eventIds.push(r.event.id);
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
    finalModel,
    perEvent,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Build the DEPLOYABLE stacked-attribution model: ComplementNB base + the
 * all-corpus logistic re-ranker. The CNB base is rebuilt in-browser from the
 * payload events; only the (small) logreg — weights + bias + standardizer —
 * needs to ship. Trained on out-of-fold (LOO) CNB candidates, the standard
 * stacking discipline. Server-side (build time); the result is serialized into
 * /api/atlas.json for the isomorphic /predict to apply via stacked-core.
 */
export function buildDeployedAttributionModel(): LogReg {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const tokensByEvent = new Map<string, string[]>();
  const actorsByEvent = new Map<string, string[]>();
  for (const ev of allEvents) {
    tokensByEvent.set(ev.id, eventTokens(extractFeatures(ev, a)));
    actorsByEvent.set(ev.id, [...actorsOfEvent(ev)]);
  }
  const cnbRanker = (heldOut: AuspexEvent, training: AuspexEvent[], atl: Atlas): RankedCandidate[] => {
    const docs = training
      .map((ev) => ({ tokens: tokensByEvent.get(ev.id)!, actors: actorsByEvent.get(ev.id)! }))
      .filter((d) => d.actors.length > 0);
    const model = trainCNB(docs, { alpha: 1, minDf: 2 });
    const qf = extractFeatures(heldOut, atl, { excludeSelfFromProseDF: true });
    return rankCNB(eventTokens(qf), model).map((r, i) => ({ actorId: r.actorId, logScore: r.score, rank: i + 1 }));
  };
  return runStackedAttributionLOO(5, cnbRanker).finalModel;
}
