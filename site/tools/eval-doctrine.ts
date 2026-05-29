/**
 * CLI runner for doctrine-prediction evaluation.
 *
 *   pnpm exec tsx tools/eval-doctrine.ts
 *   pnpm exec tsx tools/eval-doctrine.ts --json out/doctrine-eval.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { runDoctrineLOO } from '../src/utils/doctrine-prediction-eval.ts';

const args = process.argv.slice(2);
const jsonIdx = args.indexOf('--json');
const jsonPath = jsonIdx >= 0 ? args[jsonIdx + 1] : null;

console.log('Running doctrine-prediction leave-one-out …');
const t0 = Date.now();
const summary = runDoctrineLOO();
const took = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`  done in ${took}s\n`);

console.log(`Scored ${summary.scored} events with at least one doctrine label`);
console.log(`  top-1 hit:    ${summary.hit1} (${pct(summary.hit1, summary.scored)})`);
console.log(`  top-3 hit:    ${summary.hit3} (${pct(summary.hit3, summary.scored)})`);
console.log(`  top-5 hit:    ${summary.hit5} (${pct(summary.hit5, summary.scored)})`);
console.log(`  recall@1:     ${(summary.meanRecall1 * 100).toFixed(1)}%`);
console.log(`  recall@3:     ${(summary.meanRecall3 * 100).toFixed(1)}%`);
console.log(`  recall@5:     ${(summary.meanRecall5 * 100).toFixed(1)}%`);
console.log(`  mAP:          ${summary.mAP.toFixed(3)}`);
console.log();

console.log('Per-state:');
const stateRows = [...summary.perState.entries()].sort((a, b) => b[1].scored - a[1].scored);
for (const [state, row] of stateRows) {
  console.log(
    `  ${state.padEnd(4)} n=${String(row.scored).padStart(3)}` +
      `  top1=${pct(row.hit1, row.scored).padStart(5)}` +
      `  top3=${pct(row.hit3, row.scored).padStart(5)}` +
      `  recall@3=${(row.meanRecall3 * 100).toFixed(1).padStart(5)}%` +
      `  mAP=${row.mAP.toFixed(3)}`,
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
  const trueD = w.trueDoctrines[0] ?? '?';
  const pred = w.top5[0]?.doctrineId ?? '?';
  console.log(`  rank=${String(w.bestRank).padStart(4)}  ${date}  ${w.eventName.slice(0, 56).padEnd(56)}  true=${trueD.slice(0, 30).padEnd(30)}  pred=${pred}`);
}
console.log();

if (jsonPath) {
  mkdirSync(dirname(jsonPath), { recursive: true });
  const out = {
    scored: summary.scored,
    hit1: summary.hit1,
    hit3: summary.hit3,
    hit5: summary.hit5,
    meanRecall1: summary.meanRecall1,
    meanRecall3: summary.meanRecall3,
    meanRecall5: summary.meanRecall5,
    mAP: summary.mAP,
    perState: Object.fromEntries(summary.perState),
    confusion: summary.confusion,
    worst: summary.worst,
    options: summary.options,
    generatedAt: summary.generatedAt,
  };
  writeFileSync(jsonPath, JSON.stringify(out, null, 2));
  console.log(`wrote ${jsonPath}`);
}

function pct(num: number, den: number): string {
  if (den === 0) return 'n/a';
  return `${((num / den) * 100).toFixed(1)}%`;
}
