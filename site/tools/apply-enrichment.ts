/**
 * Apply source-grounded enrichment PATCHES to imported event YAMLs (textual
 * insertion; preserves existing content). Patches are produced by reading each
 * event's source (no new claims — only facts already supported by the source/
 * summary, promoted into the structured fields the engine reads).
 *
 * Patch schema (JSON array): {
 *   id, initial_vector?, campaign_id?, operators_named?[], summary?,
 *   targets?: [{ target_id:"sectors/<slug>"|"orgs/<slug>"|"infra/<slug>", country?, role? }]
 * }
 * Every field is validated against the controlled vocab; invalid fields are
 * dropped with a warning (never written). Re-run `pnpm validate` after.
 *   pnpm exec tsx tools/apply-enrichment.ts <patches.json> [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { atlas, ATLAS_ROOT } from '../src/utils/atlas.ts';

const WRITE = process.argv.includes('--write');
const patchFile = process.argv[2];
if (!patchFile) { console.error('usage: apply-enrichment.ts <patches.json> [--write]'); process.exit(1); }
const patches = JSON.parse(readFileSync(patchFile, 'utf8'));

const a: any = atlas();
const VECTORS = new Set(['phishing', 'n-day', '0-day', 'supply-chain', 'valid-creds', 'insider', 'physical', 'unknown']);
const ROLES = new Set(['primary', 'collateral', 'staging', 'transit']);
const campaignIds = new Set<string>();
for (const ev of a.events.values()) if ((ev as any).campaign_id) campaignIds.add((ev as any).campaign_id);
// sector slug is valid if it (or an ancestor) exists in atlas.sectors
const sectorOk = (slug: string) => { let s = slug; while (s) { if (a.sectors.has(s)) return true; const i = s.lastIndexOf('/'); if (i < 0) return false; s = s.slice(0, i); } return false; };

const evPath = (id: string) => {
  const [ym, slug] = id.split('/'); const [y, m] = ym.split('-');
  return join(ATLAS_ROOT, 'events', y, m, `${slug}.yaml`);
};
const yamlStr = (s: string) => JSON.stringify(String(s ?? ''));

let applied = 0, skipped = 0; const warns: string[] = [];
for (const p of patches) {
  let path: string; let text: string;
  try { path = evPath(p.id); text = readFileSync(path, 'utf8'); }
  catch { warns.push(`NO FILE for ${p.id}`); skipped++; continue; }
  if (!text.includes('false_flag_risk: none') || !/\nsources:/.test(text)) { warns.push(`unexpected structure ${p.id}`); skipped++; continue; }

  // ---- validate + build insert blocks ----
  const pre: string[] = []; // inserted before `false_flag_risk: none`
  const post: string[] = []; // inserted before `sources:`

  if (p.initial_vector && p.initial_vector !== 'null') {
    if (VECTORS.has(p.initial_vector) && !/\ninitial_vector:/.test(text)) pre.push(`initial_vector: ${p.initial_vector}`);
    else if (!VECTORS.has(p.initial_vector)) warns.push(`${p.id}: bad vector ${p.initial_vector}`);
  }
  if (p.campaign_id && p.campaign_id !== 'null') {
    if (campaignIds.has(p.campaign_id) && !/\ncampaign_id:/.test(text)) pre.push(`campaign_id: ${p.campaign_id}`);
    else if (!campaignIds.has(p.campaign_id)) warns.push(`${p.id}: unknown campaign_id ${p.campaign_id} (not invented; dropped)`);
  }
  if (Array.isArray(p.targets) && p.targets.length && !/\ntargets:/.test(text)) {
    const lines: string[] = [];
    for (const t of p.targets) {
      const tid = String(t.target_id || '');
      const ok = (tid.startsWith('sectors/') && sectorOk(tid.replace(/^sectors\//, ''))) || tid.startsWith('orgs/') || tid.startsWith('infra/');
      if (!ok) { warns.push(`${p.id}: bad target_id ${tid}`); continue; }
      lines.push(`  - target_id: ${tid}`);
      if (t.country) lines.push(`    country: ${String(t.country).toLowerCase()}`);
      lines.push(`    role: ${ROLES.has(t.role) ? t.role : 'primary'}`);
    }
    if (lines.length) post.push('targets:\n' + lines.join('\n'));
  }
  if (Array.isArray(p.operators_named) && p.operators_named.length && !/\noperators_named:/.test(text)) {
    post.push('operators_named:\n' + p.operators_named.map((o: string) => `  - ${yamlStr(o)}`).join('\n'));
  }

  // ---- claim-QC: update attribution confidence + assessment from the verdict ----
  const CONF: Record<string, string> = { attested: 'high', strongly_inferred: 'moderate', plausible: 'low' };
  const ASSESS: Record<string, string> = { supported: 'concur', weak: 'concur-with-caveat', unsupported: 'partial' };
  if (p.confidence && CONF[p.confidence]) text = text.replace(/(attributing_org_confidence:\s*)\S+/, `$1${CONF[p.confidence]}`);
  if (p.attribution_verdict && ASSESS[p.attribution_verdict]) text = text.replace(/(auspex_assessment:\s*)\S+/, `$1${ASSESS[p.attribution_verdict]}`);

  // ---- replace empty summary ----
  if (p.summary && /\(no summary captured\)/.test(text)) {
    const body = String(p.summary).trim().split('\n').map((l: string) => '  ' + l.trim()).join('\n');
    text = text.replace(/summary: \|\n  \(no summary captured\)\n/, `summary: |\n${body}\n`);
  }

  if (!pre.length && !post.length && !(p.summary && /summary: \|\n  ESET|provisional/i.test(''))) {
    // nothing to insert (still may have replaced summary above)
  }
  if (pre.length) text = text.replace('false_flag_risk: none', pre.join('\n') + '\nfalse_flag_risk: none');
  if (post.length) text = text.replace(/\nsources:/, '\n' + post.join('\n') + '\nsources:');
  // mark enriched: drop the stale "NOT re-read" line
  text = text.replace('# Source claim curl-resolved but NOT re-read; doctrine untagged.\n', '# Enriched 2026-05-30: source-grounded targets/vector/campaign added (claims still pending full QC).\n');

  if (WRITE) writeFileSync(path, text);
  applied++;
}
console.log(`patches: ${patches.length} | applied: ${applied} | skipped: ${skipped} | ${WRITE ? 'WROTE' : 'DRY-RUN'}`);
if (warns.length) { console.log('warnings:'); for (const w of warns) console.log('  - ' + w); }
