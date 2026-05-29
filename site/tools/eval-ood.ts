/**
 * Run the OOD baseline evaluation: LOO NB on the full corpus, record
 * per-event calibrated entropy + Jaccard distance + correctness, save
 * to `.cache/ood-eval.json` for the research page to consume.
 *
 * Standalone — expensive (one full NB fit per event). Run when the
 * corpus changes substantially; otherwise the cache is stable.
 */
import { atlas } from '../src/utils/atlas';
import { runOODBaselineEval } from '../src/utils/ood';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT_PATH = resolve(import.meta.dirname, '..', '.cache', 'ood-eval.json');

console.log('Running OOD baseline (LOO over corpus) …');
const t0 = Date.now();
const a = atlas();
const result = runOODBaselineEval(a);
const elapsed = (Date.now() - t0) / 1000;

console.log(`Done in ${elapsed.toFixed(1)}s · n = ${result.events.length} events`);

// Percentile thresholds
const sorted = result.trainingEntropiesSorted;
const q = (p: number) => sorted[Math.floor(p * sorted.length)];
console.log(`\nEntropy ECDF thresholds (nats):`);
console.log(`  10th percentile: ${q(0.10).toFixed(3)}`);
console.log(`  50th percentile: ${q(0.50).toFixed(3)} (median)`);
console.log(`  85th percentile: ${q(0.85).toFixed(3)} (borderline cutoff)`);
console.log(`  95th percentile: ${q(0.95).toFixed(3)} (OOD cutoff)`);
console.log(`  99th percentile: ${q(0.99).toFixed(3)}`);

// Correctness vs entropy: events the engine got right should cluster
// at lower entropy.
const correct = result.events.filter((e) => e.correct);
const wrong = result.events.filter((e) => !e.correct);
const mean = (xs: number[]) => xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length;
console.log(`\nMean entropy by correctness:`);
console.log(`  correct (n=${correct.length}): ${mean(correct.map((e) => e.entropy)).toFixed(3)} nats`);
console.log(`  wrong   (n=${wrong.length}): ${mean(wrong.map((e) => e.entropy)).toFixed(3)} nats`);

// Correlation between entropy and Jaccard distance (do the two
// methodologies agree on which events are weird?)
const Hs = result.events.map((e) => e.entropy);
const Ds = result.events.map((e) => e.jaccardDistance);
const mH = mean(Hs);
const mD = mean(Ds);
let cov = 0, vH = 0, vD = 0;
for (let i = 0; i < Hs.length; i++) {
  cov += (Hs[i] - mH) * (Ds[i] - mD);
  vH += (Hs[i] - mH) ** 2;
  vD += (Ds[i] - mD) ** 2;
}
const pearson = cov / Math.sqrt(vH * vD);
console.log(`\nPearson r(entropy, jaccard distance) = ${pearson.toFixed(3)}`);
console.log(`  (positive → methodologies agree; near zero → orthogonal signals)`);

const outDir = dirname(OUT_PATH);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const out = {
  ...result,
  percentiles: {
    p10: q(0.10), p25: q(0.25), p50: q(0.50), p75: q(0.75),
    p85: q(0.85), p90: q(0.90), p95: q(0.95), p99: q(0.99),
  },
  pearsonEntropyJaccard: pearson,
  meanEntropyCorrect: mean(correct.map((e) => e.entropy)),
  meanEntropyWrong: mean(wrong.map((e) => e.entropy)),
};
writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
console.log(`\nWrote ${OUT_PATH}`);
