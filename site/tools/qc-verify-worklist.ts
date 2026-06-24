/**
 * qc-verify-worklist.ts — the risk-ranked human-verification worklist
 * (docs/CORPUS-VERIFICATION-PLAN.md, tier T2).
 *
 * FULL-CENSUS MODE: every event is in scope (verify everything). Risk priority is the
 * verification ORDER (hardest first), not an inclusion filter — the queue covers all 818.
 *   P1 un-QC'd backfill import (research/qc-backfill-cohort.json — least-scrutinized records)
 *   P2 carries an `attested` doctrine link (the strong evidentiary claims)
 *   P3 single-source + high-confidence attribution on a secondary/tertiary source
 *   P4 load-bearing: event id cited by name in FINDINGS.md / README.md / thesis/
 *   P5 the lower-risk tail (still verified — just last)
 *
 * Usage:
 *   pnpm exec tsx tools/qc-verify-worklist.ts            # burn-down + next 25 census items
 *   pnpm exec tsx tools/qc-verify-worklist.ts --all      # the full census worklist
 *   pnpm exec tsx tools/qc-verify-worklist.ts --json     # also write research/qc-verify-worklist.json
 *
 * Stamp an event verified by adding to its YAML:
 *   qc: {verified_by: kara, verified_on: 2026-06-15, level: full}
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..', '..');
const ATLAS = join(ROOT, 'atlas');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.yaml')) out.push(p);
  }
  return out;
}
type Rec = Record<string, any>;
function loadAll(sub: string): Array<{ path: string; raw: string; doc: Rec }> {
  return walk(join(ATLAS, sub)).flatMap((p) => {
    const raw = readFileSync(p, 'utf8');
    const doc = yaml.load(raw) as Rec;
    return doc && doc.id ? [{ path: p, raw, doc }] : [];
  });
}

const events = loadAll('events');
const sources = new Map(loadAll('sources').map((s) => [s.doc.id as string, s.doc]));

// The backfill cohort (157 events promoted from provisional imports in 6508da5). Promotion
// stripped the PROVISIONAL headers this tool used to detect them, but added NO verification —
// they are the least-scrutinized records in the corpus, so they stay P1. Tracked, auditable
// file; regenerate per its own _provenance note. Missing file → empty set (tool still runs).
const cohortPath = join(ROOT, 'research', 'qc-backfill-cohort.json');
const backfillCohort = new Set<string>(
  existsSync(cohortPath) ? (JSON.parse(readFileSync(cohortPath, 'utf8')).ids ?? []) : [],
);

// P4: event ids cited in the load-bearing documents. The docs mostly cite events by NAME
// (exemplar chains), and those are attested-link events already census'd under P2 — but the
// records discussed at length by name are seeded here explicitly so they can't slip to P5.
const LOAD_BEARING_DOCS = ['analysis/FINDINGS.md', 'README.md', 'thesis/outline-and-evidence.md'];
const citedIds = new Set<string>([
  '2007-01/olympic-games-stuxnet',
  '2010-06/stuxnet-natanz',
  '2025-04/predatory-sparrow-iran-fuel-pumps',
  '2025-06/predatory-sparrow-bank-sepah',
  '2015-03/khnp-dprk-attribution',
  '2022-02/aa22-054a-cyclops-blink-sandworm',
]);
const idPattern = /\b(\d{4}-\d{2}\/[a-z0-9][a-z0-9-]+)\b/g;
for (const rel of LOAD_BEARING_DOCS) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  for (const m of readFileSync(p, 'utf8').matchAll(idPattern)) citedIds.add(m[1]);
}

interface Item {
  priority: number;          // 1..4 census, 5 = sampling pool
  reasons: string[];
  id: string;
  name: string;
  path: string;
  sources: string[];
  qc: Rec | null;
}
const items: Item[] = [];
for (const { path, raw, doc } of events) {
  const reasons: string[] = [];
  if (/PROVISIONAL/.test(raw) || backfillCohort.has(doc.id))
    reasons.push("P1 un-QC'd backfill import");
  if ((doc.doctrine_links ?? []).some((l: Rec) => l?.confidence === 'attested'))
    reasons.push('P2 attested doctrine link');
  const srcIds: string[] = doc.sources ?? [];
  const highConf = (doc.attributions ?? []).some(
    (a: Rec) => a?.actor_id && a?.attributing_org_confidence === 'high',
  );
  if (srcIds.length === 1 && highConf) {
    const tier = sources.get(srcIds[0])?.tier;
    if (tier !== 'primary') reasons.push(`P3 single ${tier ?? 'unknown'}-tier source + high confidence`);
  }
  if (citedIds.has(doc.id)) reasons.push('P4 load-bearing (cited in FINDINGS/README/thesis)');
  const priority = reasons.length
    ? Math.min(...reasons.map((r) => parseInt(r[1], 10)))
    : 5;
  items.push({
    priority, reasons, id: doc.id, name: doc.name ?? '',
    path: path.replace(ROOT + '/', ''), sources: srcIds, qc: doc.qc ?? null,
  });
}

// FULL CENSUS: every event is in scope. Risk priority is the verification ORDER (hardest
// first), not an inclusion filter — pending covers all 818, ranked.
const verified = items.filter((i) => i.qc);
const verifiedHuman = verified.filter((i) => i.qc?.verified_by === 'kara');
const verifiedLLM = verified.filter((i) => i.qc && i.qc.verified_by !== 'kara');
const highRisk = items.filter((i) => i.priority <= 4);
const pending = items
  .filter((i) => !i.qc)
  .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

const pct = (a: number, b: number) => ((100 * a) / Math.max(b, 1)).toFixed(1);
console.log(`\n===== VERIFICATION BURN-DOWN — FULL CENSUS (verify every event) =====`);
console.log(`corpus: ${items.length} events · verified: ${verified.length} (${pct(verified.length, items.length)}%) — ${verifiedHuman.length} human, ${verifiedLLM.length} LLM-audit · REMAINING ${pending.length}`);
console.log(`ranked hardest-first (P1 highest risk → P5 lowest); burn down top to bottom.`);
for (const p of [1, 2, 3, 4, 5]) {
  const tot = items.filter((i) => i.priority === p).length;
  const done = items.filter((i) => i.priority === p && i.qc).length;
  const tail = p === 5 ? '  (lowest-risk tail)' : '';
  console.log(`  P${p}: ${done}/${tot} verified${tail}`);
}
console.log(`high-risk front (P1–P4): ${highRisk.filter((i) => i.qc).length}/${highRisk.length} verified\n`);

const showAll = process.argv.includes('--all');
const show = showAll ? pending : pending.slice(0, 25);
console.log(`── next ${show.length}${showAll ? '' : ' (use --all for the full list)'} ──`);
for (const i of show) {
  console.log(`  [P${i.priority}] ${i.id}`);
  console.log(`        ${i.reasons.join(' · ')}`);
  console.log(`        file: ${i.path}`);
  console.log(`        sources: ${i.sources.join(', ') || '(none)'}`);
}
console.log(`\nprotocol per event (stamp when ALL pass — see the plan doc):`);
console.log(`  1 source resolves (live or archive_url)   4 targets/sectors match source`);
console.log(`  2 summary facts supported, dates match    5 doctrine reasoning + confidence honest`);
console.log(`  3 attribution named at stated confidence  6 add qc: {verified_by: kara, verified_on: YYYY-MM-DD, level: full}`);

if (process.argv.includes('--json')) {
  const out = join(ROOT, 'research', 'qc-verify-worklist.json');
  writeFileSync(out, JSON.stringify({ generated: 'qc-verify-worklist.ts', stats: {
    total: items.length, verified: verified.length,
    census: items.length, censusDone: verified.length,
    pending: pending.length, highRisk: highRisk.length,
  }, pending }, null, 2));
  console.log(`\nwrote ${out}`);
}
