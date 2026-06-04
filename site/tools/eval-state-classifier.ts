/**
 * eval-state-classifier.ts — EVAL-ONLY: a DEDICATED nation-state classifier + its payoff.
 *
 * Trains a ComplementNB whose CLASS is the attacker state (not the actor) — the "predict state
 * first" backbone for a coarse-to-fine model. One LOO pass, two questions:
 *
 *   PART A — how accurately can we predict the STATE on its own? Compared against the
 *            actor-collapse baseline (top-1 actor's state, 80.2% in eval-state-structure),
 *            with per-state recall and the top confusions. A dedicated state class pools all a
 *            state's events (no actor-count bias, more data/class) so it should match or beat it.
 *
 *   PART B — does it PAY for attribution? Re-rank the actor CNB by a SOFT state prior:
 *               adjusted(actor) = actorLogScore + β · logP(actorState | features)
 *            sweep β (β=0 recovers the 55.8% CNB actor baseline). The lift at the best β, vs the
 *            +5.6pp true-state ORACLE ceiling, is the realistic payoff of the backbone. Soft, not
 *            a hard mask — so legitimate cross-state ops (counter-ops/false-flags) aren't destroyed.
 *
 * Eval-only; no deployed path touched. pnpm exec tsx tools/eval-state-classifier.ts
 */
import { atlas, eventStateId, isMetaEvent } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';

const a = atlas();
const all = [...a.events.values()];
const tok = new Map<string, string[]>(); const act = new Map<string, string[]>(); const stt = new Map<string, string | undefined>();
for (const e of all) { tok.set(e.id, eventTokens(extractFeatures(e, a))); act.set(e.id, [...actorsOfEvent(e)]); stt.set(e.id, eventStateId(e, a)); }
const actorState = (id: string) => (a.actors.get(id)?.primary_service_id ?? id).split('/')[0];
const labeled = all.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));

const BETAS = [0, 0.5, 1, 2, 3, 5, 10];
let n = 0, sTop1 = 0, sTop2 = 0, sTop3 = 0, collapseTop1 = 0, oracleTop1 = 0;
const betaHit = new Map<number, number>(BETAS.map((b) => [b, 0]));
const conf = new Map<string, number>();
const perState = new Map<string, { tot: number; hit: number }>();

process.stderr.write(`LOO over ${labeled.length} events (actor CNB + dedicated state CNB)…\n`);
for (const heldOut of labeled) {
  const training = all.filter((e) => e.id !== heldOut.id);
  const aDocs = training.map((e) => ({ tokens: tok.get(e.id)!, actors: act.get(e.id)! })).filter((d) => d.actors.length > 0);
  const sDocs = training.map((e) => ({ tokens: tok.get(e.id)!, actors: stt.get(e.id) ? [stt.get(e.id)!] : [] })).filter((d) => d.actors.length > 0);
  const aCNB = trainCNB(aDocs, { alpha: 1, minDf: 2 });
  const sCNB = trainCNB(sDocs, { alpha: 1, minDf: 2 });
  const q = tok.get(heldOut.id)!;
  const aRank = rankCNB(q, aCNB);   // [{actorId, score}]
  const sRank = rankCNB(q, sCNB);   // [{actorId=state, score}]

  const trueActors = new Set(act.get(heldOut.id)!);
  const trueStates = new Set([...trueActors].map(actorState)); const es = stt.get(heldOut.id); if (es) trueStates.add(es);
  const ts0 = [...trueStates][0];
  n++;

  // ── Part A: dedicated state classifier ──
  if (sRank.length) {
    const p1 = sRank[0].actorId;
    if (trueStates.has(p1)) sTop1++; else conf.set(`${ts0}→${p1}`, (conf.get(`${ts0}→${p1}`) ?? 0) + 1);
    if (sRank.slice(0, 2).some((r) => trueStates.has(r.actorId))) sTop2++;
    if (sRank.slice(0, 3).some((r) => trueStates.has(r.actorId))) sTop3++;
    const row = perState.get(ts0) ?? { tot: 0, hit: 0 }; row.tot++; if (trueStates.has(p1)) row.hit++; perState.set(ts0, row);
  }
  if (aRank.length && trueStates.has(actorState(aRank[0].actorId))) collapseTop1++;   // actor-collapse baseline
  const oracle = aRank.filter((r) => trueStates.has(actorState(r.actorId)));          // true-state oracle
  if (oracle.length && trueActors.has(oracle[0].actorId)) oracleTop1++;

  // ── Part B: soft state-prior re-rank of actors ──
  const sScores = sRank.map((r) => r.score); const M = sScores.length ? Math.max(...sScores) : 0;
  const lse = M + Math.log(sScores.reduce((s, x) => s + Math.exp(x - M), 0) || 1);
  const slp = new Map<string, number>(); for (const r of sRank) slp.set(r.actorId, r.score - lse);  // logP(state|features)
  const floor = (slp.size ? Math.min(...slp.values()) : -10) - 2;
  for (const b of BETAS) {
    let best = -Infinity, bestActor = '';
    for (const r of aRank) { const adj = r.score + b * (slp.get(actorState(r.actorId)) ?? floor); if (adj > best) { best = adj; bestActor = r.actorId; } }
    if (trueActors.has(bestActor)) betaHit.set(b, betaHit.get(b)! + 1);
  }
}

const pct = (x: number) => ((x / n) * 100).toFixed(1);
console.log(`\n===== DEDICATED STATE CLASSIFIER + attribution payoff (CNB, LOO, n=${n}) =====\n`);
console.log(`── PART A · state prediction ──`);
console.log(`  dedicated state CNB:   top-1 ${pct(sTop1)}%   top-2 ${pct(sTop2)}%   top-3 ${pct(sTop3)}%`);
console.log(`  actor-collapse (ref):  top-1 ${pct(collapseTop1)}%   (top-1 actor's state; the eval-state-structure 80.2%)`);
console.log(`  → dedicated ${sTop1 > collapseTop1 ? 'BEATS' : sTop1 === collapseTop1 ? 'matches' : 'trails'} actor-collapse by ${((sTop1 - collapseTop1) / n * 100).toFixed(1)}pp\n`);
console.log(`  per-state recall (true state → predicted top-1), states with ≥10 events:`);
for (const [s, r] of [...perState.entries()].filter(([, r]) => r.tot >= 10).sort((x, y) => y[1].tot - x[1].tot))
  console.log(`    ${s.padEnd(9)} ${(100 * r.hit / r.tot).toFixed(0).padStart(3)}%  (${r.hit}/${r.tot})`);
console.log(`\n  top state confusions (true→predicted):`);
for (const [k, c] of [...conf.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8)) console.log(`    ${c}×  ${k}`);

const base = betaHit.get(0)! / n * 100, oracleP = oracleTop1 / n * 100;
let bestB = 0, bestV = base; for (const b of BETAS) { const v = betaHit.get(b)! / n * 100; if (v > bestV) { bestV = v; bestB = b; } }
console.log(`\n── PART B · attribution lift from the soft state prior ──`);
console.log(`  actor top-1 by prior weight β  (β=0 = plain CNB baseline):`);
for (const b of BETAS) {
  const v = betaHit.get(b)! / n * 100;
  console.log(`    β=${String(b).padStart(4)}   ${v.toFixed(1)}%${b === bestB && b !== 0 ? '  ← best' : ''}${b === 0 ? '  (baseline)' : ''}`);
}
console.log(`  true-state ORACLE ceiling: ${oracleP.toFixed(1)}%`);
console.log(`\n── READING ──`);
console.log(`  PART A: the dedicated state classifier reaches ${pct(sTop1)}% top-1 (${pct(sTop3)}% top-3) — ${sTop1 >= collapseTop1 ? 'as good as or better than' : 'a bit below'}`);
console.log(`  collapsing actors, and free of the actor-count bias (the naive prob-sum was 58.9%). It is a usable backbone.`);
const lift = bestV - base;
if (lift >= 1) {
  console.log(`  PART B: as a SOFT prior it lifts actor top-1 +${lift.toFixed(1)}pp (β=${bestB}: ${base.toFixed(1)}→${bestV.toFixed(1)}%), capturing`);
  console.log(`  ${(100 * lift / (oracleP - base)).toFixed(0)}% of the ${(oracleP - base).toFixed(1)}pp oracle ceiling — the realistic, deployable gain. Same backbone then feeds the`);
  console.log(`  joint cross-state gate and doctrine state-gating. Worth promoting (re-run with bootstrap CI before deploy).`);
} else {
  console.log(`  PART B: as a soft prior it does NOT move actor top-1 (best β=${bestB}: ${bestV.toFixed(1)}% vs ${base.toFixed(1)}% baseline) — the actor`);
  console.log(`  CNB already encodes the state implicitly (shared prose). The backbone's value is the JOINT gate + doctrine, not attribution.`);
}
