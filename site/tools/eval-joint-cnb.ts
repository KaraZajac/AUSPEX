/**
 * Joint (actor × doctrine) with a ComplementNB actor side, swept over
 * actorWeight to retune the blend for the new score scale. NB joint is the
 * baseline. Doctrine side stays NB. pnpm exec tsx tools/eval-joint-cnb.ts
 */
import { atlas, type AuspexEvent, type Atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures, type EventFeatures } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';
import { runJointLOO } from '../src/utils/joint-prediction-eval.ts';

const a = atlas();
const all = [...a.events.values()];
const tok = new Map<string, string[]>();
const act = new Map<string, string[]>();
for (const e of all) { tok.set(e.id, eventTokens(extractFeatures(e, a))); act.set(e.id, [...actorsOfEvent(e)]); }

const cnbActorRanker = (features: EventFeatures, training: AuspexEvent[], _atl: Atlas) => {
  const docs = training.map((e) => ({ tokens: tok.get(e.id)!, actors: act.get(e.id)! })).filter((d) => d.actors.length > 0);
  const m = trainCNB(docs, { alpha: 1, minDf: 2 });
  return rankCNB(eventTokens(features), m).map((r) => ({ actorId: r.actorId, logScore: r.score }));
};

const pct = (n: number, d: number) => (n / d * 100).toFixed(1);
const nb = runJointLOO();
console.log(`NB joint (baseline):  top-1 ${pct(nb.hit1, nb.scored)}  top-3 ${pct(nb.hit3, nb.scored)}  MRR ${nb.mrr.toFixed(3)}  (n=${nb.scored})\n`);

for (const aW of [0.5, 1.0, 1.5, 2.0]) {
  const r = runJointLOO({ actorRanker: cnbActorRanker, actorWeight: aW });
  console.log(`CNB joint aW=${aW.toFixed(1)}:   top-1 ${pct(r.hit1, r.scored)}  top-3 ${pct(r.hit3, r.scored)}  MRR ${r.mrr.toFixed(3)}`);
}
