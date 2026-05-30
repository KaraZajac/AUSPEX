/**
 * ComplementNB scorer (Rennie, Shih, Teevan & Karger 2003, "Tackling the Poor
 * Assumptions of Naive Bayes Text Classifiers"), over the engine's feature
 * tokens. A faithful re-implementation of scikit-learn's
 * ComplementNB(alpha=1, norm=False, fit_prior=True), so the in-engine number
 * can be cross-validated against the sklearn benchmark.
 *
 * Pure / fs-free (imports only the EventFeatures type) so it can live in the
 * isomorphic engine path if adopted.
 *
 * Why complement: with severe class imbalance (AUSPEX: ~68 actor classes, a
 * steep head + a long tail of ~4-event actors), estimating each class from its
 * own tiny event set is noisy. ComplementNB estimates each class from the
 * COMPLEMENT (every OTHER class), which always has abundant data, then scores
 * by how UNLIKE the complement a document is. Flat token bag, no hand-weights.
 */
import type { EventFeatures } from './attribution';

/** Flatten EventFeatures to a multi-hot token bag. inferredCampaign is omitted
 *  (LOO-leaky — the engine nulls it for the held-out event); prose terms are
 *  already actor-name-scrubbed upstream in extractProseTerms. */
export function eventTokens(f: EventFeatures): string[] {
  const t: string[] = [];
  for (const x of f.sectors) t.push('sec:' + x);
  for (const x of f.countries) t.push('cty:' + x);
  for (const x of f.incidentTypes) t.push('inc:' + x);
  if (f.vector) t.push('vec:' + f.vector);
  if (f.year) t.push('yr:' + f.year);
  for (const x of f.ttps) t.push('ttp:' + x);
  for (const x of f.ttpPairs) t.push('ttpp:' + x);
  for (const x of f.malware) t.push('mal:' + x);
  for (const x of f.targets) t.push('tgt:' + x);
  for (const x of f.markers) t.push('mk:' + x);
  if (f.campaign) t.push('camp:' + f.campaign);
  for (const x of f.proseTerms) t.push('pr:' + x);
  for (const x of f.operators) t.push('op:' + x);
  return t;
}

export interface CNBModel {
  actors: string[];
  logPrior: number[];                       // per actor index
  compTotalLog: number[];                   // log(complement token total) per actor
  tokenActors: Map<string, Map<number, number>>; // token -> (actorIdx -> count)
  featAll: Map<string, number>;             // total count per token across classes
  logFeatAllPlusA: Map<string, number>;     // log(featAll[t] + alpha)
  alpha: number;
}

/** Train over (tokens, actors) docs. A multi-actor event contributes one
 *  document per true actor (binary-relevance), matching the engine's
 *  buildProfiles, which credits every actorsOfEvent. */
export function trainCNB(
  docs: Array<{ tokens: string[]; actors: string[] }>,
  opts: { alpha?: number; minDf?: number } = {},
): CNBModel {
  const alpha = opts.alpha ?? 1.0;
  const minDf = opts.minDf ?? 2;

  const actorIdx = new Map<string, number>();
  const actors: string[] = [];
  const classCount: number[] = [];
  const tokenActors = new Map<string, Map<number, number>>();
  const featAll = new Map<string, number>();
  const df = new Map<string, number>();

  for (const doc of docs) {
    if (doc.actors.length === 0) continue;
    const uniq = [...new Set(doc.tokens)];
    for (const tk of uniq) df.set(tk, (df.get(tk) ?? 0) + 1); // event-level df
    for (const a of doc.actors) {
      let ai = actorIdx.get(a);
      if (ai === undefined) { ai = actors.length; actorIdx.set(a, ai); actors.push(a); classCount.push(0); }
      classCount[ai]++;
      for (const tk of uniq) {
        featAll.set(tk, (featAll.get(tk) ?? 0) + 1);
        let m = tokenActors.get(tk);
        if (!m) { m = new Map(); tokenActors.set(tk, m); }
        m.set(ai, (m.get(ai) ?? 0) + 1);
      }
    }
  }

  // Prune hapax-ish tokens (df < minDf).
  for (const tk of [...featAll.keys()]) {
    if ((df.get(tk) ?? 0) < minDf) { featAll.delete(tk); tokenActors.delete(tk); }
  }

  let TOTAL = 0;
  for (const v of featAll.values()) TOTAL += v;
  const V = featAll.size;
  const actorTotal = new Array(actors.length).fill(0);
  for (const m of tokenActors.values()) for (const [ai, cnt] of m) actorTotal[ai] += cnt;

  const compTotalLog = actors.map((_, c) => Math.log(TOTAL + alpha * V - actorTotal[c]));
  const totalDocs = classCount.reduce((a, b) => a + b, 0);
  const logPrior = classCount.map((cc) => Math.log(cc / totalDocs));
  const logFeatAllPlusA = new Map<string, number>();
  for (const [tk, fa] of featAll) logFeatAllPlusA.set(tk, Math.log(fa + alpha));

  return { actors, logPrior, compTotalLog, tokenActors, featAll, logFeatAllPlusA, alpha };
}

/** Rank actors for a query token bag. ComplementNB decision (norm=False):
 *  argmax over c of  logPrior[c] + Σ_t x_t · (-log(comp_prob[c][t])).  */
export function rankCNB(queryTokens: string[], m: CNBModel): Array<{ actorId: string; score: number }> {
  const alpha = m.alpha;
  const q = [...new Set(queryTokens)].filter((t) => m.featAll.has(t));
  const Q = q.length;
  let base = 0;
  for (const t of q) base += m.logFeatAllPlusA.get(t)!;

  const adj = new Array(m.actors.length).fill(0);
  for (const t of q) {
    const fa = m.featAll.get(t)!;
    const lfa = m.logFeatAllPlusA.get(t)!;
    for (const [ai, cnt] of m.tokenActors.get(t)!) {
      adj[ai] += lfa - Math.log(fa - cnt + alpha); // contribution where actor ai HAS token t
    }
  }

  // NB: sklearn ComplementNB omits the class prior for multiclass
  // (_joint_log_likelihood adds class_log_prior_ only when there is a single
  // class) — the complement weighting already balances class sizes. Including
  // it would bias toward high-frequency actors and crush the long tail.
  const ranked = m.actors.map((actorId, c) => ({
    actorId,
    score: Q * m.compTotalLog[c] - base + adj[c],
  }));
  ranked.sort((x, y) => y.score - x.score);
  return ranked;
}
