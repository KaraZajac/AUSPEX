/**
 * Export the engine's feature matrix for the GBT benchmark.
 *
 * Vectorizes each event's EventFeatures (the same families the NB engine uses)
 * into a fixed multi-hot schema: one binary column per family value seen in
 * >=2 events (hapaxes dropped to bound dimensionality), plus a numeric `year`.
 *
 * Notes for defensibility:
 *  - The vocabulary is a label-free statistic built over the whole corpus
 *    (which columns exist), so it does not leak labels; only model fitting is
 *    per-fold on the Python side.
 *  - `inferredCampaign` is EXCLUDED — the engine nulls it for the held-out
 *    event in LOO (the cluster was formed with the event present); a one-shot
 *    export cannot suppress it per-fold, so we drop it rather than leak.
 *  - `campaign` (editorial campaign_id) columns are tagged `family:"camp"` so
 *    the benchmark can reproduce the engine's campaign-ablated floor.
 *  - Prose terms use the corpus-global DF (documented sub-percent approximation,
 *    applied identically to every Python model → the GBT-vs-NB comparison is
 *    fair; only the cross-comparison to the TS engine carries this caveat).
 *
 *   pnpm exec tsx tools/export-features.ts  →  site/.cache/feature-matrix.json
 */
import { atlas, isMetaEvent, eventStateId } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures, type EventFeatures } from '../src/utils/attribution.ts';
import { writeFileSync, mkdirSync } from 'node:fs';

const MIN_COUNT = 2; // drop hapax feature values

const a = atlas();
const events = [...a.events.values()];

// Pull each event's features once.
const feats = new Map<string, EventFeatures>();
for (const ev of events) feats.set(ev.id, extractFeatures(ev, a));

// Families: [prefix, accessor → iterable of string values]
const SET_FAMILIES: Array<[string, string, (f: EventFeatures) => Iterable<string>]> = [
  ['sec', 'sector', (f) => f.sectors],
  ['cty', 'country', (f) => f.countries],
  ['inc', 'incidentType', (f) => f.incidentTypes],
  ['ttp', 'ttp', (f) => f.ttps],
  ['ttpp', 'ttpPair', (f) => f.ttpPairs],
  ['mal', 'malware', (f) => f.malware],
  ['tgt', 'target', (f) => f.targets],
  ['mk', 'marker', (f) => f.markers],
  ['pr', 'prose', (f) => f.proseTerms],
  ['op', 'operator', (f) => f.operators],
];
const SINGLE_FAMILIES: Array<[string, string, (f: EventFeatures) => string | null]> = [
  ['vec', 'vector', (f) => f.vector],
  ['camp', 'camp', (f) => f.campaign], // tagged so Python can ablate
];

// Count occurrences to drop hapaxes.
const counts = new Map<string, number>();
const bump = (k: string) => counts.set(k, (counts.get(k) ?? 0) + 1);
for (const ev of events) {
  const f = feats.get(ev.id)!;
  for (const [pfx, , acc] of SET_FAMILIES) for (const v of acc(f)) bump(`${pfx}:${v}`);
  for (const [pfx, , acc] of SINGLE_FAMILIES) { const v = acc(f); if (v) bump(`${pfx}:${v}`); }
}

const columns: Array<{ name: string; family: string }> = [];
const colIndex = new Map<string, number>();
const addCol = (name: string, family: string) => {
  if (colIndex.has(name)) return;
  colIndex.set(name, columns.length);
  columns.push({ name, family });
};
for (const [pfx, fam, acc] of SET_FAMILIES) {
  for (const ev of events) for (const v of acc(feats.get(ev.id)!)) {
    const k = `${pfx}:${v}`;
    if ((counts.get(k) ?? 0) >= MIN_COUNT) addCol(k, fam);
  }
}
for (const [pfx, fam, acc] of SINGLE_FAMILIES) {
  for (const ev of events) { const v = acc(feats.get(ev.id)!); if (!v) continue;
    const k = `${pfx}:${v}`;
    if ((counts.get(k) ?? 0) >= MIN_COUNT) addCol(k, fam);
  }
}

interface Row {
  id: string; name: string; date: string | null; isMeta: boolean; state: string | null;
  yLabel: string | null; yTrue: string[]; yearNum: number | null; x: number[];
}
const rows: Row[] = [];
for (const ev of events) {
  const f = feats.get(ev.id)!;
  const x: number[] = [];
  for (const [pfx, , acc] of SET_FAMILIES) for (const v of acc(f)) {
    const ci = colIndex.get(`${pfx}:${v}`); if (ci !== undefined) x.push(ci);
  }
  for (const [pfx, , acc] of SINGLE_FAMILIES) { const v = acc(f); if (!v) continue;
    const ci = colIndex.get(`${pfx}:${v}`); if (ci !== undefined) x.push(ci);
  }
  const yTrue = [...actorsOfEvent(ev)];
  rows.push({
    id: ev.id, name: ev.name, date: ev.start_date ?? ev.disclosure_date ?? null,
    isMeta: isMetaEvent(ev), state: eventStateId(ev, a) ?? null,
    yLabel: yTrue[0] ?? null, yTrue,
    yearNum: f.year ? parseInt(f.year, 10) : null,
    x: [...new Set(x)].sort((p, q) => p - q),
  });
}

mkdirSync('.cache', { recursive: true });
writeFileSync('.cache/feature-matrix.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  minCount: MIN_COUNT,
  nColumns: columns.length,
  columns,
  rows,
}));

const attributable = rows.filter((r) => r.yTrue.length > 0 && !r.isMeta);
console.log(`Exported ${rows.length} events × ${columns.length} feature columns.`);
console.log(`  attributable (ops-only, non-meta, >=1 actor): ${attributable.length}`);
console.log(`  campaign columns: ${columns.filter((c) => c.family === 'camp').length}`);
console.log('Wrote .cache/feature-matrix.json');
