/**
 * Run the stacked attribution evaluation and write the result to
 * `.cache/stacked-eval.json` for the /research/stacked-eval page to
 * consume. Standalone because the LOO + logistic-regression training
 * is too slow to bundle into the static build.
 */
import { runStackedAttributionLOO } from '../src/utils/stacked-attribution';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT_PATH = resolve(import.meta.dirname, '..', '.cache', 'stacked-eval.json');

console.log('Running stacked attribution LOO …');
const t0 = Date.now();
const result = runStackedAttributionLOO();
const elapsed = (Date.now() - t0) / 1000;

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
console.log(`\nDone in ${elapsed.toFixed(1)}s · scored ${result.scored} events`);
console.log(`\n            top-1   top-3   top-5    MRR`);
console.log(`Plain NB    ${pct(result.nbHit1)}  ${pct(result.nbHit3)}  ${pct(result.nbHit5)}  ${result.nbMrr.toFixed(3)}`);
console.log(`Stacked     ${pct(result.hit1)}  ${pct(result.hit3)}  ${pct(result.hit5)}  ${result.mrr.toFixed(3)}`);
console.log(`Δ (st - nb) ${((result.hit1 - result.nbHit1) * 100).toFixed(1)}pp  ${((result.hit3 - result.nbHit3) * 100).toFixed(1)}pp  ${((result.hit5 - result.nbHit5) * 100).toFixed(1)}pp  ${(result.mrr - result.nbMrr).toFixed(3)}`);
console.log(`\nFeature weights (post-standardization), top by |w|:`);
for (const f of result.featureWeights) {
  const arrow = f.weight >= 0 ? '+' : '−';
  console.log(`  ${arrow} ${Math.abs(f.weight).toFixed(3)}  ${f.key}`);
}
console.log(`\nbias = ${result.bias.toFixed(3)}`);

const outDir = dirname(OUT_PATH);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
console.log(`\nWrote ${OUT_PATH}`);
