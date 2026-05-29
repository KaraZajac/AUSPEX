/**
 * Run the MITRE ATT&CK Groups baseline and write the result to
 * `.cache/mitre-baseline-eval.json` for the research page to consume.
 * Cheaper than the LOO evals — no retraining, just per-event Jaccard
 * scoring against the fixed MITRE Groups profiles.
 */
import { runMitreBaseline } from '../src/utils/mitre-baseline';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT_PATH = resolve(import.meta.dirname, '..', '.cache', 'mitre-baseline-eval.json');

console.log('Running MITRE Groups baseline …');
const t0 = Date.now();
const result = runMitreBaseline();
const elapsed = (Date.now() - t0) / 1000;

const pct = (n: number, d: number) => d === 0 ? 'n/a' : `${((n / d) * 100).toFixed(1)}%`;

console.log(`\nDone in ${elapsed.toFixed(1)}s`);
console.log(`Candidate space: ${result.groupCount} MITRE Groups`);
console.log(`Scored: ${result.scored}  ·  Skipped (true actor has no G-code): ${result.skipped}`);
console.log(`\n  top-1 ${pct(result.hit1, result.scored)}  ·  top-3 ${pct(result.hit3, result.scored)}  ·  top-5 ${pct(result.hit5, result.scored)}  ·  top-10 ${pct(result.hit10, result.scored)}  ·  MRR ${result.mrr.toFixed(3)}`);

console.log(`\nPer-state:`);
const perState = [...result.perState.entries()].sort((a, b) => b[1].scored - a[1].scored);
for (const [s, row] of perState) {
  console.log(`  ${s.padEnd(4)}  n=${String(row.scored).padStart(3)}  top-1 ${pct(row.hit1, row.scored).padStart(6)}  top-3 ${pct(row.hit3, row.scored).padStart(6)}  top-5 ${pct(row.hit5, row.scored).padStart(6)}  MRR ${row.mrr.toFixed(3)}`);
}

const outDir = dirname(OUT_PATH);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
// Strip the heavy `events[]` field for the JSON output; we only need
// summary stats + per-state breakdown + per-event hit booleans for
// bootstrap CIs. Keep top5 only for the worst-prediction inspection.
const slim = {
  scored: result.scored,
  skipped: result.skipped,
  hit1: result.hit1,
  hit3: result.hit3,
  hit5: result.hit5,
  hit10: result.hit10,
  mrr: result.mrr,
  groupCount: result.groupCount,
  generatedAt: result.generatedAt,
  perState: Object.fromEntries(result.perState),
  perEvent: {
    hit1: result.events.map((e) => (e.hit1 ? 1 : 0)),
    hit3: result.events.map((e) => (e.hit3 ? 1 : 0)),
    hit5: result.events.map((e) => (e.hit5 ? 1 : 0)),
    hit10: result.events.map((e) => (e.hit10 ? 1 : 0)),
    rr:   result.events.map((e) => (e.bestRank ? 1 / e.bestRank : 0)),
  },
  worst: result.events
    .filter((e) => e.bestRank !== null)
    .sort((a, b) => (b.bestRank ?? 0) - (a.bestRank ?? 0))
    .slice(0, 15)
    .map((e) => ({
      eventId: e.eventId,
      eventName: e.eventName,
      startDate: e.startDate,
      trueState: e.trueState,
      trueActors: e.trueActors,
      trueGroups: e.trueGroups,
      bestRank: e.bestRank,
      top5: e.top5,
    })),
};
writeFileSync(OUT_PATH, JSON.stringify(slim, null, 2));
console.log(`\nWrote ${OUT_PATH}`);
