/**
 * CLI runner for the temporal-holdout backtest.
 */
import { runAllTemporal } from '../src/utils/temporal-eval.ts';

const trainEnd = process.argv[2] ?? '2023-12-31';

console.log(`Temporal holdout: train ≤ ${trainEnd}, test > ${trainEnd}`);
const t0 = Date.now();
const r = runAllTemporal(trainEnd);
console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);

function pct(num: number, den: number): string {
  if (den === 0) return ' n/a ';
  return `${((num / den) * 100).toFixed(1).padStart(5)}%`;
}

function printEngine(name: string, s: typeof r.attribution): void {
  console.log(`${name}  train=${s.trainSize}  test=${s.testSize}  scored=${s.scored}`);
  console.log(`  top-1: ${pct(s.hit1, s.scored)}   top-3: ${pct(s.hit3, s.scored)}   top-5: ${pct(s.hit5, s.scored)}   top-10: ${pct(s.hit10, s.scored)}   MRR: ${s.mrr.toFixed(3)}`);
  // Per-year
  const years = [...s.perYear.keys()].sort();
  for (const y of years) {
    const m = s.perYear.get(y)!;
    console.log(`    ${y}  n=${String(m.scored).padStart(3)}  top-1:${pct(m.hit1, m.scored)}  top-3:${pct(m.hit3, m.scored)}  top-5:${pct(m.hit5, m.scored)}`);
  }
  console.log();
}

printEngine('ATTRIBUTION', r.attribution);
printEngine('DOCTRINE   ', r.doctrine);
printEngine('PILLAR     ', r.pillar);
printEngine('JOINT      ', r.joint);

// Per-state for attribution (the most informative single view)
console.log('Attribution per-state (test events):');
const rows = [...r.attribution.perState.entries()].sort((a, b) => b[1].scored - a[1].scored);
for (const [state, m] of rows) {
  console.log(`  ${state.padEnd(4)} n=${String(m.scored).padStart(3)}  top-1:${pct(m.hit1, m.scored)}  top-3:${pct(m.hit3, m.scored)}  top-5:${pct(m.hit5, m.scored)}`);
}
console.log();

console.log('Attribution worst predictions:');
for (const w of r.attribution.worst.slice(0, 6)) {
  console.log(`  rank=${String(w.bestRank).padStart(4)}  ${w.startDate}  ${w.eventName.slice(0, 55).padEnd(55)}  true=${w.trueLabels[0]}  pred=${w.topPredicted}`);
}
