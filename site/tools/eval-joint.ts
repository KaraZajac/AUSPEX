/**
 * CLI runner for joint (actor × doctrine) engine evaluation.
 */
import { runJointLOO } from '../src/utils/joint-prediction-eval.ts';

console.log('Running joint LOO …');
const t0 = Date.now();
const s = runJointLOO();
console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);

console.log(`Scored ${s.scored} events with both actor and doctrine labels`);
console.log(`  top-1:  ${s.hit1} (${pct(s.hit1, s.scored)})`);
console.log(`  top-3:  ${s.hit3} (${pct(s.hit3, s.scored)})`);
console.log(`  top-5:  ${s.hit5} (${pct(s.hit5, s.scored)})`);
console.log(`  top-10: ${s.hit10} (${pct(s.hit10, s.scored)})`);
console.log(`  MRR:    ${s.mrr.toFixed(3)}`);
console.log();

console.log('Per-state:');
const rows = [...s.perState.entries()].sort((a, b) => b[1].scored - a[1].scored);
for (const [state, r] of rows) {
  console.log(
    `  ${state.padEnd(4)} n=${String(r.scored).padStart(3)}` +
      `  top1=${pct(r.hit1, r.scored).padStart(5)}` +
      `  top3=${pct(r.hit3, r.scored).padStart(5)}` +
      `  top5=${pct(r.hit5, r.scored).padStart(5)}` +
      `  mrr=${r.mrr.toFixed(3)}`,
  );
}
console.log();

console.log('Confident hits (top-1 correct, co-occurrence ≥ 2):');
for (const h of s.confidentHits.slice(0, 8)) {
  console.log(`  ${h.startDate ?? '????'}  ${h.eventName.slice(0, 60).padEnd(60)}  ${h.top5[0].actorId.split('/').slice(-1)[0]} × ${h.top5[0].doctrineId} (co=${h.top5[0].coOccurrence})`);
}
console.log();

console.log('Worst predictions:');
for (const w of s.worst.slice(0, 6)) {
  const p = w.top5[0];
  console.log(`  rank=${String(w.bestRank).padStart(4)}  ${w.startDate ?? '????'}  ${w.eventName.slice(0, 50).padEnd(50)}  pred=${p?.actorId.split('/').slice(-1)[0]}×${p?.doctrineId}`);
}

function pct(num: number, den: number): string {
  if (den === 0) return 'n/a';
  return `${((num / den) * 100).toFixed(1)}%`;
}
