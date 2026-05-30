/**
 * Temporal holdout for the DEPLOYED attribution engine (ComplementNB + stack):
 * train on events ≤ 2023-12-31 (CNB base + an out-of-fold-within-train logreg),
 * score 2024+ ops-only events cold. Mirrors temporal-eval.ts's split so the
 * number is comparable to the NB temporal reference.
 *   pnpm exec tsx tools/eval-cnb-temporal.ts
 */
import { atlas, isMetaEvent, type AuspexEvent } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures, buildProfiles, buildVocab, buildIDF, rankActors } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';
import { pairFeatures, buildKnownCampaigns, trainLogReg, predictLogReg, type PairRow } from '../src/utils/stacked-core.ts';

const TRAIN_END = '2023-12-31';
const a = atlas();
const all = [...a.events.values()];
const dateOf = (e: AuspexEvent) => e.start_date ?? e.disclosure_date ?? '';
const inTrain = (e: AuspexEvent) => { const d = dateOf(e); return d !== '' && d <= TRAIN_END; };

const train = all.filter(inTrain);
const test = all.filter((e) => !inTrain(e) && actorsOfEvent(e).size > 0 && !isMetaEvent(e));

const tok = new Map<string, string[]>();
const act = new Map<string, string[]>();
for (const e of all) { tok.set(e.id, eventTokens(extractFeatures(e, a))); act.set(e.id, [...actorsOfEvent(e)]); }

const trainDocs = (exclude?: string) =>
  train.filter((e) => e.id !== exclude).map((e) => ({ tokens: tok.get(e.id)!, actors: act.get(e.id)! })).filter((d) => d.actors.length > 0);
const knownCampaigns = buildKnownCampaigns(train, (e) => actorsOfEvent(e));

// (1) Logreg trained on out-of-fold (LOO-within-train) CNB candidates.
const rows: PairRow[] = [];
for (const e of train) {
  const trueA = act.get(e.id)!;
  if (!trueA.length) continue;
  const m = trainCNB(trainDocs(e.id), { alpha: 1, minDf: 2 });
  const top = rankCNB(tok.get(e.id)!, m).slice(0, 10).map((c, i) => ({ actorId: c.actorId, logScore: c.score, rank: i + 1 }));
  const ts = top[0]?.logScore ?? 0;
  const trueSet = new Set(trueA);
  for (const c of top) rows.push({ ...pairFeatures(e, c, ts, a, knownCampaigns), eventId: e.id, actorId: c.actorId, label: trueSet.has(c.actorId) ? 1 : 0 });
}
const logreg = trainLogReg(rows);

// (2) Full-train CNB; score cold 2024+ test.
const cnbFull = trainCNB(trainDocs(), { alpha: 1, minDf: 2 });
let h1 = 0, h3 = 0, h5 = 0;
for (const e of test) {
  const top = rankCNB(tok.get(e.id)!, cnbFull).slice(0, 10).map((c, i) => ({ actorId: c.actorId, logScore: c.score, rank: i + 1 }));
  const ts = top[0]?.logScore ?? 0;
  const trueSet = new Set(act.get(e.id)!);
  const reranked = top.map((c) => ({ id: c.actorId, p: predictLogReg(logreg, pairFeatures(e, c, ts, a, knownCampaigns)) })).sort((x, y) => y.p - x.p);
  const idx = reranked.findIndex((s) => trueSet.has(s.id));
  const rank = idx >= 0 ? idx + 1 : null;
  if (rank === 1) h1++;
  if (rank !== null && rank <= 3) h3++;
  if (rank !== null && rank <= 5) h5++;
}
const n = test.length;
const p = (x: number) => (x / n * 100).toFixed(1);
// (3) NB baseline over the SAME test set + denominator (full ranking, null=miss).
const nbP = buildProfiles(train, a, { servicePriorLambda: 0.2 });
const nbV = buildVocab(train, a);
const nbI = buildIDF(nbP);
let m1 = 0, m3 = 0, m5 = 0;
for (const e of test) {
  const ranked = rankActors(extractFeatures(e, a, { excludeSelfFromProseDF: true }), nbP, nbV, { idf: nbI, malwareLineageGroup: a.malwareLineageGroup });
  const trueSet = new Set(act.get(e.id)!);
  const idx = ranked.findIndex((c) => trueSet.has(c.actorId));
  const rank = idx >= 0 ? idx + 1 : null;
  if (rank === 1) m1++;
  if (rank !== null && rank <= 3) m3++;
  if (rank !== null && rank <= 5) m5++;
}

console.log(`Temporal holdout — train ≤ ${TRAIN_END} (${train.length} ev), test ${n} cold ops (null=miss, matched denominator):`);
console.log(`  CNB + stack:  top-1 ${p(h1)}   top-3 ${p(h3)}   top-5 ${p(h5)}`);
console.log(`  NB (raw):     top-1 ${p(m1)}   top-3 ${p(m3)}   top-5 ${p(m5)}`);
console.log(`  Δ top-1: +${(((h1 - m1) / n) * 100).toFixed(1)}pp`);
