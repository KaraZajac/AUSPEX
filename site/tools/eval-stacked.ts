/**
 * Run the stratified-k-fold stacked attribution evaluation and write
 * the result to `.cache/stacked-eval.json` for the
 * /research/stacked-eval page to consume.
 *
 * Standalone because the LOO + K logistic-regression trainings are
 * too slow to bundle into the static build.
 */
import { runStackedAttributionLOO, meanStd } from '../src/utils/stacked-attribution';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT_PATH = resolve(import.meta.dirname, '..', '.cache', 'stacked-eval.json');

console.log('Running stratified k-fold stacked attribution …');
const t0 = Date.now();
const result = runStackedAttributionLOO();
const elapsed = (Date.now() - t0) / 1000;

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
console.log(`\nDone in ${elapsed.toFixed(1)}s · scored ${result.scored} events · ${result.numFolds} folds`);

console.log(`\n  ────────── aggregated across folds ──────────`);
console.log(`            top-1   top-3   top-5    MRR`);
console.log(`Plain NB    ${pct(result.nbHit1)}  ${pct(result.nbHit3)}  ${pct(result.nbHit5)}  ${result.nbMrr.toFixed(3)}`);
console.log(`Stacked     ${pct(result.hit1)}  ${pct(result.hit3)}  ${pct(result.hit5)}  ${result.mrr.toFixed(3)}`);
console.log(`Δ (st - nb) ${((result.hit1 - result.nbHit1) * 100).toFixed(1)}pp  ${((result.hit3 - result.nbHit3) * 100).toFixed(1)}pp  ${((result.hit5 - result.nbHit5) * 100).toFixed(1)}pp  ${(result.mrr - result.nbMrr).toFixed(3)}`);

console.log(`\n  ────────── per-fold (mean ± std) ──────────`);
const nbH1 = meanStd(result.folds.map((f) => f.nbHit1));
const nbH3 = meanStd(result.folds.map((f) => f.nbHit3));
const stH1 = meanStd(result.folds.map((f) => f.stHit1));
const stH3 = meanStd(result.folds.map((f) => f.stHit3));
const stMrr = meanStd(result.folds.map((f) => f.stMrr));
console.log(`Plain NB    top-1 ${pct(nbH1.mean)} ± ${pct(nbH1.std)}   top-3 ${pct(nbH3.mean)} ± ${pct(nbH3.std)}`);
console.log(`Stacked     top-1 ${pct(stH1.mean)} ± ${pct(stH1.std)}   top-3 ${pct(stH3.mean)} ± ${pct(stH3.std)}   MRR ${stMrr.mean.toFixed(3)} ± ${stMrr.std.toFixed(3)}`);

console.log(`\nPer-fold detail:`);
result.folds.forEach((f, i) => {
  console.log(`  fold ${i + 1}  n=${String(f.n).padStart(3)}  NB top-1 ${pct(f.nbHit1).padStart(6)}  Stk top-1 ${pct(f.stHit1).padStart(6)}  Stk top-3 ${pct(f.stHit3).padStart(6)}  Stk MRR ${f.stMrr.toFixed(3)}`);
});

console.log(`\nFeature weights (from all-events fit; never used in eval):`);
for (const f of result.featureWeights) {
  const arrow = f.weight >= 0 ? '+' : '−';
  console.log(`  ${arrow} ${Math.abs(f.weight).toFixed(3)}  ${f.key}`);
}
console.log(`\nbias = ${result.bias.toFixed(3)}`);

const outDir = dirname(OUT_PATH);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
console.log(`\nWrote ${OUT_PATH}`);
