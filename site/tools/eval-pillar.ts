/**
 * CLI runner for pillar-prediction evaluation.
 */
import { runPillarLOO } from '../src/utils/pillar-prediction-eval.ts';

console.log('Running pillar LOO …');
const t0 = Date.now();
const s = runPillarLOO();
console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);

console.log(`Scored ${s.scored} events with at least one pillar label`);
console.log(`  top-1:        ${s.hit1} (${pct(s.hit1, s.scored)})`);
console.log(`  top-3:        ${s.hit3} (${pct(s.hit3, s.scored)})`);
console.log(`  top-5:        ${s.hit5} (${pct(s.hit5, s.scored)})`);
console.log(`  recall@3:     ${(s.meanRecall3 * 100).toFixed(1)}%`);
console.log(`  recall@5:     ${(s.meanRecall5 * 100).toFixed(1)}%`);
console.log(`  mAP:          ${s.mAP.toFixed(3)}`);
console.log(`  doctrine-right pillar-wrong: ${s.doctrineRightPillarWrong} (${pct(s.doctrineRightPillarWrong, s.scored)})`);
console.log();

console.log('Per-state:');
const rows = [...s.perState.entries()].sort((a, b) => b[1].scored - a[1].scored);
for (const [state, r] of rows) {
  console.log(
    `  ${state.padEnd(4)} n=${String(r.scored).padStart(3)}` +
      `  top1=${pct(r.hit1, r.scored).padStart(5)}` +
      `  top3=${pct(r.hit3, r.scored).padStart(5)}` +
      `  recall@3=${(r.meanRecall3 * 100).toFixed(1).padStart(5)}%` +
      `  mAP=${r.mAP.toFixed(3)}`,
  );
}
console.log();

console.log('Top confusion pairs:');
for (const c of s.confusion.slice(0, 8)) {
  console.log(`  ${c.predicted.padEnd(60)} → ${c.actual.padEnd(60)} ×${c.count}`);
}

function pct(num: number, den: number): string {
  if (den === 0) return 'n/a';
  return `${((num / den) * 100).toFixed(1)}%`;
}
