/** Isolation test: run the native trainCNB/rankCNB on sklearn's EXACT feature
 *  matrix (.cache/feature-matrix.json), same setup as nb_loo.py (keep>=2 primary,
 *  active>=3 cols, year one-hot). If this ~= 60.4, the CNB code is correct and any
 *  gap in eval-cnb.ts is feature extraction; if ~53, the scorer has a bug. */
import { readFileSync } from 'node:fs';
import { trainCNB, rankCNB } from '../src/utils/complement-nb.ts';

const d = JSON.parse(readFileSync('.cache/feature-matrix.json', 'utf8'));
const cols: Array<{ name: string }> = d.columns;
const rows = d.rows.filter((r: any) => r.yTrue.length && !r.isMeta);
const N = rows.length;

const active = new Array(cols.length).fill(0);
for (const r of rows) for (const ci of r.x) active[ci]++;
const keepCol = new Set<number>(cols.map((_c, i) => i).filter((i) => active[i] >= 3));

const toksByRow: string[][] = rows.map((r: any) => {
  const t: string[] = [];
  for (const ci of r.x) if (keepCol.has(ci)) t.push(cols[ci].name);
  if (r.yearNum != null) t.push('yr:' + r.yearNum);
  return t;
});

const primFreq = new Map<string, number>();
for (const r of rows) if (r.yLabel) primFreq.set(r.yLabel, (primFreq.get(r.yLabel) ?? 0) + 1);
const keep = new Set([...primFreq].filter(([, c]) => c >= 2).map(([k]) => k));

let h1 = 0, h3 = 0;
for (let i = 0; i < N; i++) {
  const docs: Array<{ tokens: string[]; actors: string[] }> = [];
  for (let j = 0; j < N; j++) {
    if (j === i) continue;
    const p = rows[j].yLabel;
    if (p && keep.has(p)) docs.push({ tokens: toksByRow[j], actors: [p] });
  }
  const model = trainCNB(docs, { alpha: 1, minDf: 1 }); // matrix already pruned to active>=3
  const ranked = rankCNB(toksByRow[i], model);
  const truth = rows[i].yTrue.filter((t: string) => keep.has(t));
  const ranks = truth.map((t: string) => ranked.findIndex((c) => c.actorId === t) + 1).filter((r: number) => r > 0);
  const br = ranks.length ? Math.min(...ranks) : null;
  if (br === 1) h1++;
  if (br !== null && br <= 3) h3++;
}
console.log(`native CNB on sklearn matrix: top-1 ${(h1 / N * 100).toFixed(1)}  top-3 ${(h3 / N * 100).toFixed(1)}   (sklearn on same: 60.4 / 72.1)`);
