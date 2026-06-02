/**
 * eval-joint-stacked.ts — EVAL-ONLY experiment: does a learned logistic re-ranker
 * beat the hand-weighted joint product (actorWeight=2.0)?
 *
 * The deployed joint ranks (actor,doctrine) pairs by a FIXED linear blend:
 *     joint = 2.0·actorLogScore + 1.0·doctrineLogScore + 1.0·log(1+cooccurrence)
 * This harness keeps the SAME LOO candidate pairs (CNB actor × NB doctrine), then asks
 * whether an L2-logistic stacker — which *learns* the blend + an interaction term + a
 * doctrine/actor state-consistency feature — re-ranks them better, under the SAME
 * null=miss convention as runJointLOO so the baseline reproduces the 46.7% headline.
 *
 * Methodology (mirrors the attribution stacker, stacked-attribution.ts):
 *   1. LOO: per labeled event, CNB×NB rankPairs → top-K candidate pairs + features + label
 *      (label=1 iff actor∈trueActors AND doctrine∈trueDoctrines).
 *   2. Stratified 5-fold CV by attacker state (seeded). Stacker never trains on an event
 *      it re-ranks; every event scored once.
 *   3. Compare, within the top-K window, baseline (product order) vs stacker (P(correct)).
 *   4. Per-fold mean±std + paired bootstrap 95% CI on the top-1 lift. Learned weights printed.
 *
 * Nothing here touches the deployed path. pnpm exec tsx tools/eval-joint-stacked.ts
 */
import { atlas, eventStateId, isMetaEvent, type AuspexEvent, type Atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures, type EventFeatures } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';
import { doctrinesOfEvent } from '../src/utils/doctrine-prediction.ts';
import { rankPairs } from '../src/utils/joint-prediction.ts';

const K_WINDOW = 30;          // candidate pairs the stacker re-ranks (null=miss outside)
const N_FOLDS = 5;
const LR = 0.05, ITER = 400, L2 = 0.5;   // same hyperparameters as stacked-core.ts
const SEED = 0xAB13C0DE;
const ACTOR_WEIGHT = 2.0;     // the deployed hand-set weight we are testing against
// v2 features: per-event NORMALIZED (z-scored within each event's candidate window so they are
// comparable ACROSS events — the fix for the v1 failure where pooled logistic ignored the
// per-event scores and latched onto global co-occurrence). zJoint is the product backbone
// (worst case the stacker recovers the baseline); precedence is a NEW signal the product lacks.
const FEATS = ['zJoint', 'zActorLog', 'zDoctrineLog', 'zLogCooc', 'stateConsist', 'precedence', 'interaction'];
const yrOf = (s?: string | null) => { const y = parseInt(String(s ?? '').slice(0, 4), 10); return Number.isFinite(y) ? y : null; };
const zfit = (arr: number[]) => {
  const m = arr.reduce((s, x) => s + x, 0) / arr.length;
  const sd = Math.sqrt(Math.max(1e-9, arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length));
  return (x: number) => (x - m) / sd;
};

const a = atlas();
const all = [...a.events.values()];

// Pre-tokenize once for the CNB actor ranker (matches eval-joint-cnb.ts).
const tok = new Map<string, string[]>();
const act = new Map<string, string[]>();
for (const e of all) { tok.set(e.id, eventTokens(extractFeatures(e, a))); act.set(e.id, [...actorsOfEvent(e)]); }
const cnbActorRanker = (features: EventFeatures, training: AuspexEvent[], _atl: Atlas) => {
  const docs = training.map((e) => ({ tokens: tok.get(e.id)!, actors: act.get(e.id)! })).filter((d) => d.actors.length > 0);
  const m = trainCNB(docs, { alpha: 1, minDf: 2 });
  return rankCNB(eventTokens(features), m).map((r) => ({ actorId: r.actorId, logScore: r.score }));
};

const labeled = all.filter((e) => actorsOfEvent(e).size > 0 && doctrinesOfEvent(e, a).size > 0 && !isMetaEvent(e));

interface WinRow { actorId: string; doctrineId: string; f: number[]; label: number; }
interface EvRec {
  id: string; state: string; window: WinRow[]; fullBaselineRank: number | null;
  base?: Hit; st?: Hit; full?: Hit;
}
interface Hit { h1: number; h3: number; h5: number; rr: number; }
const hitOf = (rank: number | null): Hit =>
  rank === null ? { h1: 0, h3: 0, h5: 0, rr: 0 }
                : { h1: rank === 1 ? 1 : 0, h3: rank <= 3 ? 1 : 0, h5: rank <= 5 ? 1 : 0, rr: 1 / rank };

// ── Level 1: LOO candidate generation ──
process.stderr.write(`LOO over ${labeled.length} labeled events (CNB×NB, aW=${ACTOR_WEIGHT})…\n`);
const recs: EvRec[] = [];
for (const heldOut of labeled) {
  const training = all.filter((e) => e.id !== heldOut.id);
  const refDate = heldOut.start_date ?? heldOut.disclosure_date;
  const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
  features.inferredCampaign = null;   // LOO hygiene (matches runJointLOO)
  const ranked = rankPairs(features, training, a, { actorRanker: cnbActorRanker, actorWeight: ACTOR_WEIGHT, referenceDate: refDate });

  const trueActors = [...actorsOfEvent(heldOut)], trueDoctrines = [...doctrinesOfEvent(heldOut, a)];
  const truePairs = new Set<string>();
  for (const ta of trueActors) for (const td of trueDoctrines) truePairs.add(`${ta}|${td}`);

  const fullRanks = ranked.filter((c) => truePairs.has(`${c.actorId}|${c.doctrineId}`)).map((c) => c.rank);
  const fullBaselineRank = fullRanks.length ? Math.min(...fullRanks) : null;

  const evYear = yrOf(refDate);
  const win = ranked.slice(0, K_WINDOW);
  const zA = zfit(win.map((p) => p.actorLogScore));
  const zD = zfit(win.map((p) => p.doctrineLogScore));
  const zC = zfit(win.map((p) => Math.log(1 + p.coOccurrence)));
  const zJ = zfit(win.map((p) => p.jointScore));
  const window: WinRow[] = win.map((p) => {
    const za = zA(p.actorLogScore), zd = zD(p.doctrineLogScore);
    const docYear = yrOf((a.doctrines.get(p.doctrineId) as any)?.issued_on);
    const precedence = docYear !== null && evYear !== null && docYear <= evYear ? 1 : 0;
    return {
      actorId: p.actorId, doctrineId: p.doctrineId,
      label: truePairs.has(`${p.actorId}|${p.doctrineId}`) ? 1 : 0,
      f: [
        zJ(p.jointScore),                                                 // backbone: per-event z of the product
        za, zd, zC(Math.log(1 + p.coOccurrence)),                         // per-event z of each component
        p.actorId.split('/')[0] === p.doctrineId.split('/')[0] ? 1 : 0,   // state consistency
        precedence,                                                       // doctrine predates the event (F1)
        za * zd,                                                          // interaction (now comparable scale)
      ],
    };
  });
  recs.push({ id: heldOut.id, state: eventStateId(heldOut, a) ?? '??', window, fullBaselineRank });
}

// ── logistic regression (generic over number[]; same recipe as stacked-core.ts) ──
function fitStd(rows: number[][]) {
  const D = rows[0].length, n = rows.length, mean = Array(D).fill(0), sq = Array(D).fill(0);
  for (const v of rows) for (let i = 0; i < D; i++) { mean[i] += v[i] / n; sq[i] += (v[i] * v[i]) / n; }
  return { mean, std: mean.map((m, i) => Math.sqrt(Math.max(1e-6, sq[i] - m * m))) };
}
const z1 = (v: number[], s: { mean: number[]; std: number[] }) => v.map((x, i) => (x - s.mean[i]) / s.std[i]);
const sig = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
function train(rows: WinRow[]) {
  const s = fitStd(rows.map((r) => r.f)); const D = rows[0].f.length, N = rows.length;
  const X = rows.map((r) => z1(r.f, s)), y = rows.map((r) => r.label); const w = Array(D).fill(0); let b = 0;
  for (let it = 0; it < ITER; it++) {
    let gB = 0; const gW = Array(D).fill(0);
    for (let i = 0; i < N; i++) {
      let z = b; for (let j = 0; j < D; j++) z += w[j] * X[i][j];
      const e = sig(z) - y[i]; gB += e / N; for (let j = 0; j < D; j++) gW[j] += (e * X[i][j]) / N;
    }
    b -= LR * gB; for (let j = 0; j < D; j++) w[j] -= LR * (gW[j] + (L2 * w[j]) / N);
  }
  return { w, b, s };
}
const predict = (m: { w: number[]; b: number; s: { mean: number[]; std: number[] } }, f: number[]) => {
  const v = z1(f, m.s); let z = m.b; for (let j = 0; j < m.w.length; j++) z += m.w[j] * v[j]; return sig(z);
};

// ── stratified fold assignment (seeded), then CV scoring ──
let lcg = SEED >>> 0; const rand = () => { lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0; return lcg / 0x100000000; };
const byState = new Map<string, EvRec[]>();
for (const r of recs) { const b = byState.get(r.state); if (b) b.push(r); else byState.set(r.state, [r]); }
const foldOf = new Map<string, number>();
for (const bucket of byState.values()) {
  const sorted = [...bucket].sort((x, y) => x.id.localeCompare(y.id));
  for (let i = sorted.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [sorted[i], sorted[j]] = [sorted[j], sorted[i]]; }
  sorted.forEach((r, i) => foldOf.set(r.id, i % N_FOLDS));
}

const foldStTop1: number[] = [];
for (let k = 0; k < N_FOLDS; k++) {
  const trainRows = recs.filter((r) => foldOf.get(r.id) !== k).flatMap((r) => r.window);
  const model = train(trainRows);
  let n = 0, st1 = 0;
  for (const r of recs) {
    if (foldOf.get(r.id) !== k) continue;
    const baseIdx = r.window.findIndex((p) => p.label === 1);            // window pre-sorted by joint score
    const scored = r.window.map((p) => ({ p, s: predict(model, p.f) })).sort((x, y) => y.s - x.s);
    const stIdx = scored.findIndex((o) => o.p.label === 1);
    r.base = hitOf(baseIdx >= 0 ? baseIdx + 1 : null);
    r.st = hitOf(stIdx >= 0 ? stIdx + 1 : null);
    r.full = hitOf(r.fullBaselineRank);
    n++; st1 += r.st.h1;
  }
  foldStTop1.push(st1 / n);
}

// ── aggregate ──
const N = recs.length;
const agg = (sel: (r: EvRec) => Hit) => ({
  h1: recs.reduce((s, r) => s + sel(r).h1, 0) / N, h3: recs.reduce((s, r) => s + sel(r).h3, 0) / N,
  h5: recs.reduce((s, r) => s + sel(r).h5, 0) / N, rr: recs.reduce((s, r) => s + sel(r).rr, 0) / N,
});
const full = agg((r) => r.full!), base = agg((r) => r.base!), st = agg((r) => r.st!);
const pct = (x: number) => (x * 100).toFixed(1);
const fmean = foldStTop1.reduce((s, x) => s + x, 0) / N_FOLDS;
const fstd = Math.sqrt(foldStTop1.reduce((s, x) => s + (x - fmean) ** 2, 0) / (N_FOLDS - 1));

// paired bootstrap CI on the top-1 lift (stacker − baseline), seeded
let lc = 0x1234567 >>> 0; const rnd = () => { lc = (Math.imul(lc, 1664525) + 1013904223) >>> 0; return lc / 0x100000000; };
const B = 3000, deltas: number[] = [];
for (let b = 0; b < B; b++) {
  let bs = 0, ss = 0; for (let i = 0; i < N; i++) { const r = recs[Math.floor(rnd() * N)]; bs += r.base!.h1; ss += r.st!.h1; }
  deltas.push(((ss - bs) / N) * 100);
}
deltas.sort((x, y) => x - y);
const ciLo = deltas[Math.floor(0.025 * B)], ciHi = deltas[Math.floor(0.975 * B)], dMean = deltas.reduce((s, x) => s + x, 0) / B;

// learned weights (final model on all pairs) — does it rediscover ~2× actor weight?
const finalModel = train(recs.flatMap((r) => r.window));
const weights = FEATS.map((k, i) => ({ k, w: finalModel.w[i] })).sort((x, y) => Math.abs(y.w) - Math.abs(x.w));

console.log(`\n===== JOINT: hand-weighted product vs learned re-ranker (eval-only) =====`);
console.log(`labeled events: ${N}  ·  candidate window: top-${K_WINDOW} pairs  ·  ${N_FOLDS}-fold CV, null=miss\n`);
console.log(`anchor — full-list baseline (== runJointLOO headline):  top-1 ${pct(full.h1)}  top-3 ${pct(full.h3)}  top-5 ${pct(full.h5)}  MRR ${full.rr.toFixed(3)}`);
console.log(`         (sanity: should reproduce ~46.7 / 59.3 / .545)\n`);
console.log(`within the top-${K_WINDOW} window:`);
console.log(`  baseline (product, aW=2.0):  top-1 ${pct(base.h1)}  top-3 ${pct(base.h3)}  top-5 ${pct(base.h5)}  MRR ${base.rr.toFixed(3)}`);
console.log(`  STACKER (learned re-rank):   top-1 ${pct(st.h1)}  top-3 ${pct(st.h3)}  top-5 ${pct(st.h5)}  MRR ${st.rr.toFixed(3)}`);
console.log(`\n  top-1 lift: ${(st.h1 - base.h1 >= 0 ? '+' : '')}${pct(st.h1 - base.h1)} pp  ·  per-fold stacker top-1 ${pct(fmean)} ± ${pct(fstd)}`);
console.log(`  paired bootstrap 95% CI on top-1 lift: [${ciLo >= 0 ? '+' : ''}${ciLo.toFixed(1)}, ${ciHi >= 0 ? '+' : ''}${ciHi.toFixed(1)}] pp  (mean ${dMean >= 0 ? '+' : ''}${dMean.toFixed(1)})`);
const verdict = ciLo > 0 ? 'STACKER WINS — CI excludes 0; promote candidate'
  : ciHi < 0 ? 'STACKER LOSES — CI below 0; keep the product'
  : 'INCONCLUSIVE — CI spans 0; lift not distinguishable from noise at this corpus size';
console.log(`  verdict: ${verdict}\n`);
console.log(`learned weights (standardized; sign = direction, |mag| = influence):`);
for (const { k, w } of weights) console.log(`  ${w >= 0 ? '+' : ''}${w.toFixed(2)}  ${k}`);
console.log(`  bias ${finalModel.b.toFixed(2)}`);
console.log(`\nNote: eval-only. baseline & stacker re-rank the SAME CNB×NB candidates; only the combination differs.`);
