/**
 * CLI runner for attribution evaluation. Prints a summary to stdout.
 *
 *   pnpm exec tsx tools/eval-attribution.ts
 *   pnpm exec tsx tools/eval-attribution.ts --json out/attr-eval.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { runLeaveOneOut, runStability } from '../src/utils/attribution-eval.ts';

const args = process.argv.slice(2);
const jsonIdx = args.indexOf('--json');
const jsonPath = jsonIdx >= 0 ? args[jsonIdx + 1] : null;
const skipStability = args.includes('--no-stability');

console.log('Running leave-one-out cross-validation …');
const t0 = Date.now();
const summary = runLeaveOneOut();
const took = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`  done in ${took}s\n`);

console.log(`Scored ${summary.scored} events with attribution`);
console.log(`  top-1 hit: ${summary.hit1} (${pct(summary.hit1, summary.scored)})`);
console.log(`  top-3 hit: ${summary.hit3} (${pct(summary.hit3, summary.scored)})`);
console.log(`  top-5 hit: ${summary.hit5} (${pct(summary.hit5, summary.scored)})`);
console.log(`  top-10 hit: ${summary.hit10} (${pct(summary.hit10, summary.scored)})`);
console.log(`  MRR:       ${summary.mrr.toFixed(3)}`);
console.log();

console.log('Per-state:');
const stateRows = [...summary.perState.entries()].sort((a, b) => b[1].scored - a[1].scored);
for (const [state, row] of stateRows) {
  console.log(
    `  ${state.padEnd(4)} n=${String(row.scored).padStart(3)}` +
      `  top1=${pct(row.hit1, row.scored).padStart(5)}` +
      `  top3=${pct(row.hit3, row.scored).padStart(5)}` +
      `  top5=${pct(row.hit5, row.scored).padStart(5)}` +
      `  mrr=${row.mrr.toFixed(3)}`,
  );
}
console.log();

console.log('Top confusion pairs (rank-1 wrong → predicted vs. actual):');
for (const c of summary.confusion.slice(0, 10)) {
  console.log(`  ${c.predicted.padEnd(40)} → ${c.actual.padEnd(40)} ×${c.count}`);
}
console.log();

console.log('Worst predictions:');
for (const w of summary.worst.slice(0, 8)) {
  const date = w.startDate ?? '????';
  const trueA = w.trueActors[0] ?? '?';
  const pred = w.top5[0]?.actorId ?? '?';
  console.log(`  rank=${String(w.bestRank).padStart(4)}  ${date}  ${w.eventName.slice(0, 60).padEnd(60)}  true=${trueA}  pred=${pred}`);
}
console.log();

let stability: ReturnType<typeof runStability> | null = null;
if (!skipStability) {
  console.log('Running Monte Carlo stability (10 resamples, 10% drop) …');
  const ts = Date.now();
  stability = runStability(10, 0.1);
  console.log(`  done in ${((Date.now() - ts) / 1000).toFixed(1)}s`);
  console.log(`  rank-1 stability:        ${(stability.rank1Stability * 100).toFixed(1)}%`);
  console.log(`  top-3 stability (J≥.5):  ${(stability.top3StabilityJaccard * 100).toFixed(1)}%`);
  console.log();
}

if (jsonPath) {
  mkdirSync(dirname(jsonPath), { recursive: true });
  const out = {
    summary: {
      scored: summary.scored,
      hit1: summary.hit1,
      hit3: summary.hit3,
      hit5: summary.hit5,
      hit10: summary.hit10,
      mrr: summary.mrr,
      perState: Object.fromEntries(summary.perState),
      confusion: summary.confusion,
      worst: summary.worst,
      options: summary.options,
      generatedAt: summary.generatedAt,
    },
    stability,
  };
  writeFileSync(jsonPath, JSON.stringify(out, null, 2));
  console.log(`wrote ${jsonPath}`);
}

function pct(num: number, den: number): string {
  if (den === 0) return 'n/a';
  return `${((num / den) * 100).toFixed(1)}%`;
}
