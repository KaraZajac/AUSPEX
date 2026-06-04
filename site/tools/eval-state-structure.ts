/**
 * eval-state-structure.ts — EVAL-ONLY: does a nation-state-factored model have headroom?
 *
 * The atlas hierarchy makes the state a latent backbone (actor_id / primary_service_id
 * prefixes). Question: would explicitly modelling "only certain states have certain actors"
 * help attribution — or is the state ALREADY captured (so errors are within-state sibling
 * confusion, which a state model can't fix)?
 *
 * Runs the deployed CNB actor ranker under LOO (the foundation the stacker sits on) and reports:
 *   1. actor top-1 (anchor) and STATE top-1 (is the top actor in the right state?)
 *   2. ERROR STRUCTURE — of the actor misses, what share are right-state/wrong-sibling vs
 *      wrong-state? (the whole question: a state model only helps the wrong-state ones)
 *   3. ORACLE CEILING — constrain candidates to the TRUE state, take top-1: the absolute lift
 *      a perfect state model could buy. (Bounded by the wrong-state miss rate.)
 *   4. state predictability (marginalised state argmax) and the top cross-state confusions.
 *
 * Eval-only; touches no deployed path. pnpm exec tsx tools/eval-state-structure.ts
 */
import { atlas, eventStateId, isMetaEvent } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';

const a = atlas();
const all = [...a.events.values()];
const tok = new Map<string, string[]>();
const act = new Map<string, string[]>();
for (const e of all) { tok.set(e.id, eventTokens(extractFeatures(e, a))); act.set(e.id, [...actorsOfEvent(e)]); }

const actorState = (id: string) => (a.actors.get(id)?.primary_service_id ?? id).split('/')[0];
const labeled = all.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));

let n = 0, actorTop1 = 0, stateTop1 = 0, stateTop3 = 0, stateMargin = 0;
let missRightState = 0, missWrongState = 0;     // of actor misses: sibling vs cross-state
let oracleTop1 = 0;                              // constrain to true state, top-1
let wrongStateRecovered = 0;                    // of wrong-state misses, how many oracle recovers
const confusion = new Map<string, number>();    // "trueState→predState" when wrong-state

process.stderr.write(`LOO CNB over ${labeled.length} labeled events…\n`);
for (const heldOut of labeled) {
  const training = all.filter((e) => e.id !== heldOut.id);
  const docs = training.map((e) => ({ tokens: tok.get(e.id)!, actors: act.get(e.id)! })).filter((d) => d.actors.length > 0);
  const model = trainCNB(docs, { alpha: 1, minDf: 2 });
  const feats = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
  const ranked = rankCNB(eventTokens(feats), model);   // [{actorId, score}] desc

  const trueActors = new Set(act.get(heldOut.id)!);
  const trueStates = new Set([...trueActors].map(actorState));
  const evState = eventStateId(heldOut, a); if (evState) trueStates.add(evState);
  n++;
  if (ranked.length === 0) { missWrongState++; continue; }

  const top1 = ranked[0].actorId, top1State = actorState(top1);
  const actorHit = trueActors.has(top1), stateHit = trueStates.has(top1State);
  if (actorHit) actorTop1++;
  if (stateHit) stateTop1++;
  if (ranked.slice(0, 3).some((r) => trueStates.has(actorState(r.actorId)))) stateTop3++;

  if (!actorHit) {
    if (stateHit) missRightState++;
    else { missWrongState++; confusion.set(`${[...trueStates][0]}→${top1State}`, (confusion.get(`${[...trueStates][0]}→${top1State}`) ?? 0) + 1); }
  }

  // proper state model: marginalise actor probability mass by state, argmax
  const maxS = ranked[0].score; const byState: Record<string, number> = {};
  for (const r of ranked) { const s = actorState(r.actorId); byState[s] = (byState[s] ?? 0) + Math.exp(r.score - maxS); }
  const bestState = Object.entries(byState).sort((x, y) => y[1] - x[1])[0][0];
  if (trueStates.has(bestState)) stateMargin++;

  // oracle: keep only true-state candidates, take top-1
  const oracle = ranked.filter((r) => trueStates.has(actorState(r.actorId)));
  if (oracle.length && trueActors.has(oracle[0].actorId)) {
    oracleTop1++;
    if (!actorHit) wrongStateRecovered++;   // a miss the oracle fixed (necessarily a wrong-state one)
  }
}

const pct = (x: number) => ((x / n) * 100).toFixed(1);
const misses = n - actorTop1;
console.log(`\n===== STATE-FACTORED MODEL: is there headroom? (CNB base, LOO, n=${n}) =====\n`);
console.log(`── 1. accuracy ──`);
console.log(`  actor top-1 (anchor)          ${pct(actorTop1)}%`);
console.log(`  STATE top-1 (top actor's state right)   ${pct(stateTop1)}%   ·  state in top-3 actors  ${pct(stateTop3)}%`);
console.log(`  state predictable (prob-marginalised argmax)  ${pct(stateMargin)}%`);
console.log(`\n── 2. error structure (of ${misses} actor misses) ──`);
console.log(`  right-state / wrong-SIBLING  ${missRightState}  (${(100 * missRightState / misses).toFixed(0)}% of misses) ← a state model CANNOT fix these`);
console.log(`  WRONG-state                  ${missWrongState}  (${(100 * missWrongState / misses).toFixed(0)}% of misses) ← only these are addressable`);
console.log(`\n── 3. oracle ceiling (constrain candidates to TRUE state) ──`);
console.log(`  actor top-1 with perfect state knowledge   ${pct(oracleTop1)}%   (vs ${pct(actorTop1)}% baseline → +${(100 * (oracleTop1 - actorTop1) / n).toFixed(1)}pp ceiling)`);
console.log(`  wrong-state misses the oracle recovers     ${wrongStateRecovered}/${missWrongState}`);
console.log(`\n── 4. top cross-state confusions (trueState→predictedState) ──`);
for (const [k, c] of [...confusion.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8)) console.log(`  ${c}×  ${k}`);

const ceiling = (oracleTop1 - actorTop1) / n * 100;
console.log(`\n── READING ──`);
if (ceiling < 2) {
  console.log(`  NEGLIGIBLE headroom for attribution (+${ceiling.toFixed(1)}pp even with PERFECT state knowledge). The CNB`);
  console.log(`  already gets the state right ${pct(stateTop1)}% of the time; ${(100 * missRightState / misses).toFixed(0)}% of misses are within-state sibling`);
  console.log(`  confusion, which a state model cannot fix (that's the stacker's job). → Put the state structure`);
  console.log(`  where it CAN pay: the JOINT (hard-prune cross-state actor×doctrine pairs) and DOCTRINE/TARGET.`);
} else {
  console.log(`  MODEST-BUT-REAL headroom: perfect state knowledge is a +${ceiling.toFixed(1)}pp CEILING on actor top-1`);
  console.log(`  (${(100 * missWrongState / misses).toFixed(0)}% of misses are cross-state). Realistic gain is BELOW that: even knowing the state, the`);
  console.log(`  oracle recovers only ${wrongStateRecovered}/${missWrongState} wrong-state misses (the true actor usually isn't the top same-state`);
  console.log(`  candidate either). State itself is ~${pct(stateTop1)}% accurate (top-actor's-state); ignore the marginalised`);
  console.log(`  ${pct(stateMargin)}% — naive sum-over-actors is biased toward populous states, so a state model needs a`);
  console.log(`  DEDICATED classifier, not summed actor mass. Best ROI: the JOINT (hard-prune cross-state actor×`);
  console.log(`  doctrine pairs) + the criminal↔state boundary (KP-financial vs criminal, RU-state vs RU-criminal).`);
}
console.log(`\n  caveat: wrong-state "errors" include legitimate cross-state ops (counter-ops/false-flags/Stuxnet),`);
console.log(`  so the addressable share is an UPPER bound. Measured on CNB base; the deployed stacker already`);
console.log(`  fixes some sibling confusion on top of this.`);
