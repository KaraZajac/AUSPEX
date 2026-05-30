/**
 * Significance of the ComplementNB+stack vs NB+stack attribution gain.
 * Runs the stacker with both base learners (same seeded folds → same per-event
 * partition), pairs stacked top-1 hits by event id, and reports a paired McNemar
 * test + a seeded bootstrap CI on the per-event delta.
 *   pnpm exec tsx tools/eval-cnb-significance.ts
 */
import { atlas, type AuspexEvent, type Atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures, type RankedCandidate } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';
import { runStackedAttributionLOO } from '../src/utils/stacked-attribution.ts';
import { bootstrapMeanCI } from '../src/utils/eval-stats.ts';

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
  const m = trainCNB(docs, { alpha: 1, minDf: 2 });
  const qf = extractFeatures(heldOut, atl, { excludeSelfFromProseDF: true });
  return rankCNB(eventTokens(qf), m).map((r, i) => ({ actorId: r.actorId, logScore: r.score, rank: i + 1 }));
};

const nb = runStackedAttributionLOO(5);
const cnb = runStackedAttributionLOO(5, cnbRanker);

const nbById = new Map(nb.perEvent.eventIds.map((id, i) => [id, nb.perEvent.stHit1[i]]));
const cnbById = new Map(cnb.perEvent.eventIds.map((id, i) => [id, cnb.perEvent.stHit1[i]]));
const ids = [...nbById.keys()].filter((id) => cnbById.has(id));

let b = 0, c = 0;
const delta: number[] = [], cnbHits: number[] = [], nbHits: number[] = [];
for (const id of ids) {
  const n = nbById.get(id)!, k = cnbById.get(id)!;
  if (k === 1 && n === 0) b++;
  if (n === 1 && k === 0) c++;
  delta.push(k - n); cnbHits.push(k); nbHits.push(n);
}
const chi2 = b + c > 0 ? (Math.abs(b - c) - 1) ** 2 / (b + c) : 0;
const sig = chi2 > 10.83 ? 'p<0.001' : chi2 > 6.63 ? 'p<0.01' : chi2 > 3.84 ? 'p<0.05' : 'n.s.';
const ciC = bootstrapMeanCI(cnbHits), ciN = bootstrapMeanCI(nbHits), ciD = bootstrapMeanCI(delta);
const p = (x: number) => (x * 100).toFixed(1);

console.log(`paired events: ${ids.length}\n`);
console.log(`CNB+stack top-1  ${p(ciC.point)}%  95% CI [${p(ciC.lower)}, ${p(ciC.upper)}]`);
console.log(`NB+stack  top-1  ${p(ciN.point)}%  95% CI [${p(ciN.lower)}, ${p(ciN.upper)}]`);
console.log(`delta (CNB − NB) ${p(ciD.point)}pp  95% CI [${p(ciD.lower)}, ${p(ciD.upper)}]pp  ${ciD.lower > 0 ? '→ excludes 0 (significant)' : '→ includes 0'}`);
console.log(`\nMcNemar (paired top-1): CNB-only-right=${b}, NB-only-right=${c}, χ²=${chi2.toFixed(2)}  (${sig})`);
