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
/** Fraction of events used to train the stacker. */
const TRAIN_FRAC = 0.8;
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

export interface StackedEvalResult {
  /** Number of events in the stacker-eval split. */
  scored: number;
  /** Plain-NB top-K hit rates on the same eval slice (for direct comparison). */
  nbHit1: number;
  nbHit3: number;
  nbHit5: number;
  nbMrr: number;
  /** Stacker re-ranked metrics on the eval slice. */
  hit1: number;
  hit3: number;
  hit5: number;
  mrr: number;
  /** Learned feature weights (post-standardization), for interpretability. */
  featureWeights: Array<{ key: string; weight: number }>;
  /** Eval split fraction used. */
  trainFrac: number;
  /** Bias term. */
  bias: number;
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

/**
 * Full pipeline:
 *   - LOO NB on the full corpus
 *   - Random 80/20 split of events (seeded)
 *   - Train logistic regression on train-split (cand, event) pairs
 *   - Re-rank top-K on eval-split events
 *   - Compare stacked metrics to plain-NB on the same eval slice
 */
export function runStackedAttributionLOO(): StackedEvalResult {
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

  // Deterministic split.
  let state = SPLIT_SEED >>> 0;
  function rand(): number {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  }
  const eventsShuf = [...labeled].sort((x, y) => x.id.localeCompare(y.id));
  // Fisher-Yates with seeded rand
  for (let i = eventsShuf.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [eventsShuf[i], eventsShuf[j]] = [eventsShuf[j], eventsShuf[i]];
  }
  const splitIdx = Math.floor(eventsShuf.length * TRAIN_FRAC);
  const trainEvents = new Set(eventsShuf.slice(0, splitIdx).map((e) => e.id));
  const evalEvents  = new Set(eventsShuf.slice(splitIdx).map((e) => e.id));

  // LOO + meta-feature extraction. For each labeled event, train NB
  // on the rest, score, and produce pair rows for the top-K.
  const trainPairs: PairRow[] = [];
  const evalRankings: Array<{ event: AuspexEvent; candidates: Array<RankedCandidate & { features: PairFeatures }> }> = [];

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
    const trueActors = actorsOfEvent(heldOut);

    const cands = topK.map((c) => {
      const pf = pairFeatures(heldOut, c, topScore, a, knownCampaigns);
      return { ...c, features: pf };
    });

    if (trainEvents.has(heldOut.id)) {
      for (const c of cands) {
        trainPairs.push({
          ...c.features,
          eventId: heldOut.id,
          actorId: c.actorId,
          label: trueActors.has(c.actorId) ? 1 : 0,
        });
      }
    } else if (evalEvents.has(heldOut.id)) {
      evalRankings.push({ event: heldOut, candidates: cands });
    }
  }

  // Train.
  const model = trainLogReg(trainPairs);

  // Evaluate: re-rank candidates on eval events.
  let nbHit1 = 0, nbHit3 = 0, nbHit5 = 0, nbMrrSum = 0;
  let stHit1 = 0, stHit3 = 0, stHit5 = 0, stMrrSum = 0;
  let scored = 0;
  const perEvent = {
    nbHit1: [] as number[], nbHit3: [] as number[], nbHit5: [] as number[], nbRr: [] as number[],
    stHit1: [] as number[], stHit3: [] as number[], stHit5: [] as number[], stRr: [] as number[],
  };

  for (const { event, candidates } of evalRankings) {
    if (candidates.length === 0) continue;
    const trueActors = actorsOfEvent(event);
    if (trueActors.size === 0) continue;

    // NB original ranking (already in `candidates` order)
    const nbRanked = [...candidates].sort((x, y) => x.rank - y.rank);
    // Stacker ranking
    const stRanked = [...candidates]
      .map((c) => ({ ...c, stProb: predictLogReg(model, c.features) }))
      .sort((a, b) => b.stProb - a.stProb);

    function bestRank(ranked: typeof nbRanked): number | null {
      const idxs = [...trueActors].map((aid) => ranked.findIndex((c) => c.actorId === aid)).filter((i) => i >= 0);
      if (idxs.length === 0) return null;
      return Math.min(...idxs) + 1;
    }
    const rnb = bestRank(nbRanked);
    const rst = bestRank(stRanked);
    if (rnb === null || rst === null) continue;

    scored++;
    const nbH1 = rnb === 1 ? 1 : 0;
    const nbH3 = rnb <= 3 ? 1 : 0;
    const nbH5 = rnb <= 5 ? 1 : 0;
    const nbRr = 1 / rnb;
    const stH1 = rst === 1 ? 1 : 0;
    const stH3 = rst <= 3 ? 1 : 0;
    const stH5 = rst <= 5 ? 1 : 0;
    const stRr = 1 / rst;
    nbHit1 += nbH1; nbHit3 += nbH3; nbHit5 += nbH5; nbMrrSum += nbRr;
    stHit1 += stH1; stHit3 += stH3; stHit5 += stH5; stMrrSum += stRr;
    perEvent.nbHit1.push(nbH1); perEvent.nbHit3.push(nbH3); perEvent.nbHit5.push(nbH5); perEvent.nbRr.push(nbRr);
    perEvent.stHit1.push(stH1); perEvent.stHit3.push(stH3); perEvent.stHit5.push(stH5); perEvent.stRr.push(stRr);
  }

  const featureWeights = FEATURE_KEYS.map((k, i) => ({ key: k as string, weight: model.w[i] }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return {
    scored,
    nbHit1: scored === 0 ? 0 : nbHit1 / scored,
    nbHit3: scored === 0 ? 0 : nbHit3 / scored,
    nbHit5: scored === 0 ? 0 : nbHit5 / scored,
    nbMrr:  scored === 0 ? 0 : nbMrrSum / scored,
    hit1: scored === 0 ? 0 : stHit1 / scored,
    hit3: scored === 0 ? 0 : stHit3 / scored,
    hit5: scored === 0 ? 0 : stHit5 / scored,
    mrr:  scored === 0 ? 0 : stMrrSum / scored,
    featureWeights,
    trainFrac: TRAIN_FRAC,
    bias: model.b,
    perEvent,
    generatedAt: new Date().toISOString(),
  };
}
