/**
 * depth-import.ts — import the targeted thin-actor DEPTH round (source-verified,
 * pre-enriched events for EXISTING actors). Writes event + source YAML into atlas/.
 *   pnpm exec tsx tools/depth-import.ts /tmp/depth-all.json [--write]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { atlas, ATLAS_ROOT } from '../src/utils/atlas.ts';

const WRITE = process.argv.includes('--write');
const events = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const a: any = atlas();
const RETRIEVED = '2026-05-30';

const actorIds = new Set<string>(a.actors.keys());
const eventIds = new Set<string>(a.events.keys());
const sourceIds = new Set<string>(a.sources.keys());
const VECTORS = new Set(['phishing', 'n-day', '0-day', 'supply-chain', 'valid-creds', 'insider', 'physical', 'unknown']);
const ROLES = new Set(['primary', 'collateral', 'staging', 'transit']);
const sectorOk = (slug: string) => { let s = slug; while (s) { if (a.sectors.has(s)) return true; const i = s.lastIndexOf('/'); if (i < 0) return false; s = s.slice(0, i); } return false; };

const slugify = (s: string) => (s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'untitled';
const padDate = (d: string) => { const s = String(d || '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`; if (/^\d{4}$/.test(s)) return `${s}-01-01`; return '2025-01-01'; };
const publisher = (u: string) => { try { const h = new URL(u).hostname.replace(/^www\./, ''); return slugify(h.split('.').slice(0, -1).join('.') || h).replace(/-/g, ''); } catch { return 'unknown'; } };
const kindOf = (u: string) => { const h = (() => { try { return new URL(u).hostname; } catch { return ''; } })(); if (/cisa|fbi|\.gov|ncsc|justice|treasury/.test(h)) return 'government'; if (/record|bleepingcomputer|reuters|wired|theregister|hackernews|therecord/.test(h)) return 'journalism'; return 'industry'; };
const confMap: Record<string, string> = { attested: 'high', strongly_inferred: 'moderate', plausible: 'low' };
const yamlStr = (s: string) => JSON.stringify(String(s ?? ''));
const block = (s: string, ind: string) => String(s || '').trim().split('\n').map(l => ind + l.trim()).join('\n');

const files: { path: string; body: string }[] = [];
const seenEv = new Set<string>(), seenSrc = new Set<string>();
const warns: string[] = []; let resolved = 0, missing = 0;
const uniq = (base: string, taken: Set<string>) => { if (!taken.has(base)) return base; for (let i = 2; i < 50; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`; return `${base}-x`; };

for (const e of events) {
  if (!actorIds.has(e.actor_id)) { warns.push(`actor not found: ${e.actor_id} (${e.name})`); missing++; continue; }
  resolved++;
  const date = padDate(e.date); const [yy, mm] = [date.slice(0, 4), date.slice(5, 7)];
  const evId = uniq(`${date.slice(0, 7)}/${slugify(e.name)}`, new Set([...eventIds, ...seenEv])); seenEv.add(evId);
  const pub = publisher(e.source_url); const srcId = uniq(`${pub}/${date.slice(0, 7)}_${slugify(e.name).slice(0, 40)}`, new Set([...sourceIds, ...seenSrc])); seenSrc.add(srcId);

  // targets (validate)
  const tgtLines: string[] = [];
  for (const t of e.targets || []) {
    const tid = String(t.target_id || '');
    if (tid.startsWith('sectors/') && !sectorOk(tid.replace(/^sectors\//, ''))) { warns.push(`${evId}: bad sector ${tid}`); continue; }
    tgtLines.push(`  - target_id: ${tid}`);
    if (t.country) tgtLines.push(`    country: ${String(t.country).toLowerCase()}`);
    tgtLines.push(`    role: ${ROLES.has(t.role) ? t.role : 'primary'}`);
  }
  const vec = VECTORS.has(e.initial_vector) ? e.initial_vector : null;
  const itypes = (Array.isArray(e.incident_type) && e.incident_type.length) ? e.incident_type : ['intrusion'];

  const evBody =
`# DEPTH backfill 2026-05-30 — targeted thin-actor depth round; source-verified, pre-enriched.
id: ${evId}
name: ${yamlStr(e.name)}
start_date: ${date}
incident_type:
${itypes.map((t: string) => `  - ${t}`).join('\n')}${vec ? `\ninitial_vector: ${vec}` : ''}
false_flag_risk: none
summary: |
${block(e.summary, '  ')}
attributions:
  - actor_id: ${e.actor_id}
    attributing_org: ${yamlStr(e.attributing_org)}
    attributing_org_confidence: ${confMap[e.confidence] || 'moderate'}   # ICD link-confidence: ${e.confidence}
    auspex_assessment: concur-with-caveat     # depth-round backfill, full QC pending
    attribution_date: ${date}
    attribution_source_id: ${srcId}
doctrine_links: []
${tgtLines.length ? 'targets:\n' + tgtLines.join('\n') + '\n' : ''}sources:
  - ${srcId}
`;
  files.push({ path: join(ATLAS_ROOT, 'events', yy, mm, `${evId.split('/').pop()}.yaml`), body: evBody });

  const srcBody =
`# DEPTH backfill 2026-05-30. URL independently curl-verified to resolve.
id: ${srcId}
kind: ${kindOf(e.source_url)}
publisher: ${yamlStr(e.attributing_org || pub)}
title: ${yamlStr(e.name)}
url: ${yamlStr(e.source_url)}
published_on: ${date}
retrieved_on: ${RETRIEVED}
tier: secondary
${e.supporting_quote ? `note: |\n${block('Supporting quote: ' + e.supporting_quote, '  ')}` : ''}`;
  files.push({ path: join(ATLAS_ROOT, 'sources', pub, `${srcId.split('/').pop()}.yaml`), body: srcBody });
}

console.log(`events: ${events.length} | actor-resolved: ${resolved} | unresolved: ${missing}`);
console.log(`files: ${files.length} (${files.filter(f => f.path.includes('/events/')).length} events, ${files.filter(f => f.path.includes('/sources/')).length} sources) | ${WRITE ? 'WRITE' : 'DRY-RUN'}`);
if (warns.length) { console.log('warnings:'); warns.forEach(w => console.log('  - ' + w)); }
if (WRITE) {
  let w = 0, sk = 0;
  for (const f of files) { if (existsSync(f.path)) { sk++; continue; } mkdirSync(dirname(f.path), { recursive: true }); writeFileSync(f.path, f.body); w++; }
  console.log(`WROTE ${w}; skipped ${sk} pre-existing.`);
}
