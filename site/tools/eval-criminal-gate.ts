/**
 * eval-criminal-gate.ts — EVAL-ONLY: can a focused binary detector fix the criminal↔state seam?
 *
 * eval-state-classifier found the multiclass state CNB recalls only 5% of "criminal" events
 * (they get absorbed into ru/cn/kp). This tests a TWO-STAGE gate: a binary CNB (criminal vs
 * state, which ComplementNB suits given the 63-vs-562 imbalance) decides criminal-or-not FIRST;
 * if "not criminal", fall through to the multiclass state CNB.
 *
 * Reports, LOO: the binary detector's criminal recall/precision across a decision-threshold
 * sweep, and the COMBINED overall state top-1 vs the multiclass-only 83.5% baseline. The honest
 * question is whether criminal can be flagged at useful recall WITHOUT tanking precision
 * (false-flagging KP-financial / RU-harboured ops as criminal — they genuinely overlap).
 *
 * Eval-only; no deployed path touched. pnpm exec tsx tools/eval-criminal-gate.ts
 */
import { atlas, eventStateId, isMetaEvent, type AuspexEvent } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';

const a = atlas();
const all = [...a.events.values()];
const tok = new Map<string, string[]>(); const act = new Map<string, string[]>(); const stt = new Map<string, string | undefined>();
for (const e of all) { tok.set(e.id, eventTokens(extractFeatures(e, a))); act.set(e.id, [...actorsOfEvent(e)]); stt.set(e.id, eventStateId(e, a)); }
const actorState = (id: string) => (a.actors.get(id)?.primary_service_id ?? id).split('/')[0];
const labeled = all.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));
const trueStateOf = (e: AuspexEvent) => { const s = new Set([...act.get(e.id)!].map(actorState)); const es = stt.get(e.id); if (es) s.add(es); return s; };
const isCriminal = (e: AuspexEvent) => trueStateOf(e).has('criminal');

interface Rec { crimMargin: number; mcTop1: string; trueStates: Set<string>; trueCrim: boolean; }
const recs: Rec[] = [];
process.stderr.write(`LOO over ${labeled.length} events (binary criminal CNB + multiclass state CNB)…\n`);
for (const heldOut of labeled) {
  const training = all.filter((e) => e.id !== heldOut.id);
  const binDocs = training.map((e) => ({ tokens: tok.get(e.id)!, actors: [isCriminal(e) ? 'criminal' : 'state'] }));
  const mcDocs = training.map((e) => ({ tokens: tok.get(e.id)!, actors: stt.get(e.id) ? [stt.get(e.id)!] : [] })).filter((d) => d.actors.length > 0);
  const binCNB = trainCNB(binDocs, { alpha: 1, minDf: 2 });
  const mcCNB = trainCNB(mcDocs, { alpha: 1, minDf: 2 });
  const q = tok.get(heldOut.id)!;
  const sc = new Map(rankCNB(q, binCNB).map((r) => [r.actorId, r.score]));
  const crimMargin = (sc.get('criminal') ?? -Infinity) - (sc.get('state') ?? -Infinity);
  const mcRank = rankCNB(q, mcCNB);
  recs.push({ crimMargin, mcTop1: mcRank.length ? mcRank[0].actorId : '??', trueStates: trueStateOf(heldOut), trueCrim: isCriminal(heldOut) });
}

const n = recs.length, nCrim = recs.filter((r) => r.trueCrim).length;
const mcCrimRecall = recs.filter((r) => r.trueCrim && r.mcTop1 === 'criminal').length;
const mcStateTop1 = recs.filter((r) => r.trueStates.has(r.mcTop1)).length;

console.log(`\n===== CRIMINAL↔STATE GATE (binary CNB), LOO n=${n}, criminal events=${nCrim} =====\n`);
console.log(`baseline (multiclass state CNB only):  criminal recall ${(100 * mcCrimRecall / nCrim).toFixed(0)}% (${mcCrimRecall}/${nCrim})  ·  overall state top-1 ${(100 * mcStateTop1 / n).toFixed(1)}%\n`);
console.log(`binary criminal detector — threshold sweep (flag criminal if margin > θ):`);
console.log(`    ${'θ'.padStart(5)}  ${'crim recall'.padStart(11)}  ${'crim prec'.padStart(9)}  ${'state-cost'.padStart(10)}  ${'combined state top-1'.padStart(20)}`);
const THS = [-4, -3, -2, -1, -0.5, 0, 0.5, 1, 2];
let best = { th: NaN, top1: mcStateTop1, rec: mcCrimRecall / nCrim, prec: 1 };
for (const th of THS) {
  const flagged = recs.filter((r) => r.crimMargin > th);
  const tp = flagged.filter((r) => r.trueCrim).length;
  const rec = tp / nCrim, prec = flagged.length ? tp / flagged.length : 0;
  const fpStateLost = flagged.filter((r) => !r.trueCrim && r.trueStates.has(r.mcTop1)).length; // correct state preds we'd clobber
  const comb = recs.filter((r) => r.trueStates.has(r.crimMargin > th ? 'criminal' : r.mcTop1)).length;
  console.log(`    ${String(th).padStart(5)}  ${(100 * rec).toFixed(0).padStart(10)}%  ${(100 * prec).toFixed(0).padStart(8)}%  ${String(fpStateLost).padStart(10)}  ${(100 * comb / n).toFixed(1).padStart(19)}%`);
  if (comb > best.top1) best = { th, top1: comb, rec, prec };
}

console.log(`\n── READING ──`);
console.log(`  state-cost = correct nation-state predictions a criminal-flag would clobber (false positives that hurt).`);
if (best.top1 > mcStateTop1 + 3) {
  console.log(`  WINS: the binary gate at θ=${best.th} lifts criminal recall ${(100 * mcCrimRecall / nCrim).toFixed(0)}%→${(100 * best.rec).toFixed(0)}% (prec ${(100 * best.prec).toFixed(0)}%) and overall`);
  console.log(`  state top-1 ${(100 * mcStateTop1 / n).toFixed(1)}%→${(100 * best.top1 / n).toFixed(1)}% (+${(100 * (best.top1 - mcStateTop1) / n).toFixed(1)}pp). A two-stage criminal→state gate is worth building.`);
} else if (Number.isNaN(best.th)) {
  console.log(`  NO GAIN: every threshold that adds criminal recall costs more nation-state precision than it`);
  console.log(`  recovers — criminal and state ops are not separable at the prose level (KP-financial / RU-harboured`);
  console.log(`  ops genuinely look criminal). "criminal" is an inherently fuzzy class; flag it, don't model it as a peer.`);
} else {
  console.log(`  MARGINAL: best gate θ=${best.th} → criminal recall ${(100 * best.rec).toFixed(0)}% (prec ${(100 * best.prec).toFixed(0)}%), overall state top-1`);
  console.log(`  ${(100 * mcStateTop1 / n).toFixed(1)}%→${(100 * best.top1 / n).toFixed(1)}% (+${(100 * (best.top1 - mcStateTop1) / n).toFixed(1)}pp). Real but small; the criminal/state boundary is intrinsically fuzzy.`);
}
console.log(`  (binary detector argmax = θ=0 row; the criminal class is rare so the PR tradeoff is the whole story.)`);
