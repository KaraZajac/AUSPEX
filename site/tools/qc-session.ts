/**
 * qc-session.ts — generate a verification SESSION PACK for the next N census items
 * (docs/CORPUS-VERIFICATION-PLAN.md T2). Turns each session into read → verify → paste:
 * everything needed per event (summary, claims, sources WITH archive links, the 6-point
 * checklist, a paste-ready qc: stamp) in one markdown file. No file-hopping.
 *
 *   pnpm exec tsx tools/qc-session.ts            # next 6 items → /tmp/qc-session.md
 *   pnpm exec tsx tools/qc-session.ts --n 10
 *   pnpm exec tsx tools/qc-session.ts --out ~/Desktop/session.md
 *
 * Workflow per event: read the pack entry, open the source links (archive first if the live
 * URL is dead), run the checklist, then paste the stamp block into the event YAML at the
 * indicated path. After the session: `make verify` then commit.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..', '..');
const nIdx = process.argv.indexOf('--n');
const N = nIdx >= 0 ? parseInt(process.argv[nIdx + 1], 10) : 6;
const outIdx = process.argv.indexOf('--out');
const OUT = outIdx >= 0 ? process.argv[outIdx + 1] : '/tmp/qc-session.md';

// Regenerate the worklist JSON (single source of truth for ranking), then read it.
execFileSync('pnpm', ['exec', 'tsx', 'tools/qc-verify-worklist.ts', '--json'],
  { cwd: resolve(ROOT, 'site'), stdio: 'ignore' });
const wl = JSON.parse(readFileSync(join(ROOT, 'research', 'qc-verify-worklist.json'), 'utf8'));
const batch = wl.pending.slice(0, N);

const sources = new Map<string, any>();
function loadSource(id: string): any {
  if (sources.has(id)) return sources.get(id);
  // source files live at atlas/sources/<publisher>/<rest>.yaml — derive from id
  const p = join(ROOT, 'atlas', 'sources', `${id}.yaml`);
  let doc: any = null;
  try { doc = yaml.load(readFileSync(p, 'utf8')); } catch { /* missing — flagged below */ }
  sources.set(id, doc);
  return doc;
}

const today = new Date().toISOString().slice(0, 10);
const L: string[] = [];
L.push(`# QC verification session — ${today}`);
L.push(`\n${batch.length} items · burn-down: ${wl.stats.censusDone}/${wl.stats.census} census done, ${wl.stats.pending} remaining`);
L.push(`\n**Checklist per event:** ① source resolves (archive link if live is dead) · ② summary facts + dates supported · ③ attribution named at stated confidence · ④ targets/sectors match · ⑤ doctrine reasoning + confidence honest (perspective correct) · ⑥ paste the stamp.`);
L.push(`**If a check fails:** fix the record (downgrade confidence / correct field / add second source), note it in the stamp's \`notes\`, THEN stamp. After the session: \`make verify\` + commit.\n`);

for (const item of batch) {
  const raw = readFileSync(join(ROOT, item.path), 'utf8');
  const ev = yaml.load(raw) as any;
  L.push(`\n---\n\n## ${ev.id}  \`[${item.reasons.join(' · ')}]\``);
  L.push(`**file:** \`${item.path}\``);
  L.push(`**name:** ${ev.name}`);
  const dstr = (v: any) => (v instanceof Date ? v.toISOString().slice(0, 10) : (v ?? '—'));
  L.push(`**dates:** start ${dstr(ev.start_date)} · disclosure ${dstr(ev.disclosure_date)} · types: ${(ev.incident_type ?? []).join(', ')}`);
  L.push(`\n**summary:**\n> ${String(ev.summary ?? '').trim().replace(/\n/g, '\n> ')}`);
  if (ev.outcome_summary) L.push(`\n**outcome:**\n> ${String(ev.outcome_summary).trim().replace(/\n/g, '\n> ')}`);
  L.push(`\n**attributions:**`);
  for (const a of ev.attributions ?? []) {
    L.push(`- actor: \`${a.actor_id ?? 'null'}\` · org: ${a.attributing_org ?? '—'} · confidence: **${a.attributing_org_confidence ?? '—'}** · auspex: ${a.auspex_assessment ?? '—'}`);
  }
  L.push(`\n**doctrine links:**`);
  for (const d of ev.doctrine_links ?? []) {
    L.push(`- \`${d.doctrine_id}\` [${d.confidence}]${d.perspective ? ` perspective=${d.perspective}` : ''}${d.attesting_source_id ? ` attested-by=\`${d.attesting_source_id}\`` : ''}`);
    if (d.reasoning) L.push(`  > ${String(d.reasoning).trim().replace(/\n/g, ' ')}`);
  }
  if ((ev.targets ?? []).length) {
    L.push(`\n**targets:** ${(ev.targets ?? []).map((t: any) => `${t.target_id}${t.country ? ` (${t.country})` : ''}`).join(' · ')}`);
  }
  L.push(`\n**sources:**`);
  for (const sid of ev.sources ?? []) {
    const s = loadSource(sid);
    if (!s) { L.push(`- \`${sid}\` — ⚠ SOURCE RECORD NOT FOUND`); continue; }
    L.push(`- \`${sid}\` (${s.kind}, tier ${s.tier})`);
    L.push(`  live: ${s.url ?? '(url: null — see note in source record)'}`);
    if (s.archive_url) L.push(`  archive: ${s.archive_url}`);
  }
  L.push(`\n**stamp to paste into \`${item.path}\` (top level, e.g. after \`sources:\`):**`);
  L.push('```yaml');
  L.push(`qc:`);
  L.push(`  verified_by: kara`);
  L.push(`  verified_on: ${today}`);
  L.push(`  level: full`);
  L.push(`  notes: null`);
  L.push('```');
  if (/PROVISIONAL|QC pending|TODO\(QC\)/.test(raw)) {
    L.push(`*(also DELETE the PROVISIONAL / QC-pending header comments — verification supersedes them)*`);
  }
}
L.push(`\n---\nafter the session:  \`make verify\`  →  \`git add atlas/events && git commit -m "QC: verify ${batch.length} events (T2 census)"\``);

writeFileSync(OUT, L.join('\n'));
console.log(`session pack: ${OUT}  (${batch.length} items)`);
console.log(`burn-down: ${wl.stats.censusDone}/${wl.stats.census} done · ${wl.stats.pending} remaining`);
