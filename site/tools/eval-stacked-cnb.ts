/**
 * Deciding experiment: ComplementNB as the stacker's BASE learner.
 * Same stratified 5-fold stacker + meta-features + logreg as production, but the
 * top-K candidates come from ComplementNB instead of the bespoke NB.
 * If CNB+stack beats the current NB+stack (de-leaked 68.9), CNB is a genuine
 * top-line win; else the current stacked engine stands.
 *   pnpm exec tsx tools/eval-stacked-cnb.ts
 */
import { atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures, type RankedCandidate } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';
import { runStackedAttributionLOO } from '../src/utils/stacked-attribution.ts';
import type { AuspexEvent, Atlas } from '../src/utils/atlas.ts';

const a = atlas();
const allEvents = [...a.events.values()];

// Precompute training-representation tokens + actor labels once (engine-consistent CNB).
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
  const qf = extractFeatures(heldOut, atl, { excludeSelfFromProseDF: true }); // strict query hygiene
  return rankCNB(eventTokens(qf), model).map((r, i) => ({ actorId: r.actorId, logScore: r.score, rank: i + 1 }));
};

console.log('Running stacked attribution with ComplementNB base …');
const t0 = Date.now();
const r = runStackedAttributionLOO(5, cnbRanker);
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(0)}s · scored ${r.scored} · ${r.numFolds} folds\n`);
console.log(`            top-1   top-3   top-5    MRR`);
console.log(`CNB base    ${pct(r.nbHit1)}  ${pct(r.nbHit3)}  ${pct(r.nbHit5)}  ${r.nbMrr.toFixed(3)}   (expect ~62.8 — validates the integration)`);
console.log(`CNB+stack   ${pct(r.hit1)}  ${pct(r.hit3)}  ${pct(r.hit5)}  ${r.mrr.toFixed(3)}`);
console.log(`Δ stack-base ${((r.hit1 - r.nbHit1) * 100).toFixed(1)}pp top-1`);
console.log(`\nREFERENCE (current, de-leaked features):`);
console.log(`  NB base 56.6 / 74.7 / 0.663   ·   NB+stack 68.9 / 77.0 / 0.733  ← the number to beat`);
