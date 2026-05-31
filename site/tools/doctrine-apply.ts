/**
 * Apply doctrine_links patches to imported event YAMLs. Validates every
 * doctrine_id + pillar_id against the atlas (drops invalid links, warns).
 * Patch: { id, doctrine_links: [{doctrine_id, pillar_id, program_id?, confidence, reasoning, contested?}] }
 *   pnpm exec tsx tools/doctrine-apply.ts <patches.json> [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { atlas, ATLAS_ROOT } from '../src/utils/atlas.ts';

const WRITE = process.argv.includes('--write');
const patches = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const a: any = atlas();
const CONF = new Set(['attested', 'strongly_inferred', 'plausible']);
const programs = new Set<string>(a.programs?.keys?.() ? [...a.programs.keys()] : []);

const evPath = (id: string) => { const [ym, slug] = id.split('/'); const [y, m] = ym.split('-'); return join(ATLAS_ROOT, 'events', y, m, `${slug}.yaml`); };
const ind = (s: string, n: string) => String(s || '').trim().split('\n').map(l => n + l.trim()).join('\n');

let applied = 0, skipped = 0, linksWritten = 0; const warns: string[] = [];
for (const p of patches) {
  let text: string; const path = evPath(p.id);
  try { text = readFileSync(path, 'utf8'); } catch { warns.push(`NO FILE ${p.id}`); skipped++; continue; }
  if (!/^doctrine_links: \[\]/m.test(text)) { warns.push(`${p.id}: doctrine_links not empty/expected — skip`); skipped++; continue; }

  const valid: any[] = [];
  for (const dl of p.doctrine_links || []) {
    if (!a.doctrines.has(dl.doctrine_id)) { warns.push(`${p.id}: bad doctrine_id ${dl.doctrine_id}`); continue; }
    if (dl.pillar_id && !a.pillars.has(dl.pillar_id)) { warns.push(`${p.id}: bad pillar_id ${dl.pillar_id}`); continue; }
    if (!CONF.has(dl.confidence)) { warns.push(`${p.id}: bad confidence ${dl.confidence} -> plausible`); dl.confidence = 'plausible'; }
    if (dl.program_id && !programs.has(dl.program_id)) dl.program_id = null;
    valid.push(dl);
  }
  if (!valid.length) { warns.push(`${p.id}: no valid doctrine_links — left empty`); skipped++; continue; }

  const block = 'doctrine_links:\n' + valid.map(dl =>
    `  - doctrine_id: ${dl.doctrine_id}\n` +
    `    pillar_id: ${dl.pillar_id || 'null'}\n` +
    `    program_id: ${dl.program_id || 'null'}\n` +
    `    confidence: ${dl.confidence}\n` +
    `    reasoning: |\n${ind(dl.reasoning, '      ')}\n` +
    `    attesting_source_id: null\n` +
    `    contested: ${dl.contested ? 'true' : 'false'}\n` +
    `    analyst: claude`).join('\n');
  text = text.replace(/^doctrine_links: \[\].*$/m, block);
  if (WRITE) writeFileSync(path, text);
  applied++; linksWritten += valid.length;
}
console.log(`patches: ${patches.length} | tagged: ${applied} | skipped: ${skipped} | links written: ${linksWritten} | ${WRITE ? 'WROTE' : 'DRY-RUN'}`);
if (warns.length) { console.log('warnings:'); warns.slice(0, 40).forEach(w => console.log('  - ' + w)); }
