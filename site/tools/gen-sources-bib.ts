/**
 * Generate SOURCES.md — a bibliography of every source in the atlas, grouped by
 * publisher, with a cited-by count derived from the SAME citation traversal the
 * integrity checker uses (tools/list-dangling-sources.ts). Deterministic apart
 * from the generated-on date and git hash in the footer.
 *
 *   pnpm exec tsx tools/gen-sources-bib.ts        # writes ../SOURCES.md
 *
 * Every source record (atlas/sources/<publisher>/<id>.yaml) becomes one entry:
 * title (linked), date, tier, archive link, stable id, and which atlas entities
 * cite it. Copyrighted bodies are never redistributed — only the URL, the archive
 * URL, and (elsewhere) the content hash — consistent with DATA-RIGHTS.md.
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { atlas } from '../src/utils/atlas.ts';

const a = atlas();

// --- citation graph: which atlas entities cite each source -------------------
// Mirrors tools/list-dangling-sources.ts exactly. Attribution- and doctrine-link
// citations collapse to their parent event, so "cited by N events" counts a whole
// event once however many of its claims lean on the source.
type CiterType = 'event' | 'doctrine' | 'actor' | 'service' | 'marker' | 'policy' | 'target';
const citers = new Map<string, Set<string>>();       // sourceId -> {"event:ID", ...}
const dangling = new Map<string, Set<string>>();      // missing sourceId -> citing sites

function cite(sourceId: string | null | undefined, type: CiterType, entityId: string) {
  if (!sourceId) return;
  if (!a.sources.has(sourceId)) {
    if (!dangling.has(sourceId)) dangling.set(sourceId, new Set());
    dangling.get(sourceId)!.add(`${type}:${entityId}`);
    return;
  }
  if (!citers.has(sourceId)) citers.set(sourceId, new Set());
  citers.get(sourceId)!.add(`${type}:${entityId}`);
}

for (const svc of a.services.values())
  for (const sid of svc.sources ?? []) cite(sid, 'service', svc.id);
for (const d of a.doctrines.values())
  for (const sid of d.sources ?? []) cite(sid, 'doctrine', d.id);
for (const act of a.actors.values())
  for (const sid of act.sources ?? []) cite(sid, 'actor', act.id);
for (const ev of a.events.values()) {
  for (const attr of ev.attributions ?? []) cite(attr.attribution_source_id, 'event', ev.id);
  for (const link of ev.doctrine_links ?? []) cite(link.attesting_source_id, 'event', ev.id);
  for (const sid of ev.sources ?? []) cite(sid, 'event', ev.id);
}
for (const m of a.timelineMarkers.values())
  for (const sid of m.cited_by ?? []) cite(sid, 'marker', m.id);
// PolicyAction and Target carry source FKs too — the built-in citationsForSource()
// and list-dangling-sources.ts both omit these, so a source cited only by a policy
// action (e.g. an export-control notice) otherwise looks orphaned. Traverse them here.
for (const pa of a.policyActions.values())
  for (const sid of pa.sources ?? []) cite(sid, 'policy', pa.id);
for (const t of a.targets.values())
  for (const sid of t.sources ?? []) cite(sid, 'target', t.id);

// --- cited-by breakdown per source ------------------------------------------
function breakdown(sourceId: string): { total: number; parts: string } {
  const set = citers.get(sourceId);
  if (!set || set.size === 0) return { total: 0, parts: '' };
  const by: Record<CiterType, number> = { event: 0, doctrine: 0, actor: 0, service: 0, marker: 0, policy: 0, target: 0 };
  for (const s of set) by[s.split(':', 1)[0] as CiterType]++;
  const label: Record<CiterType, [string, string]> = {
    event: ['event', 'events'], doctrine: ['doctrine', 'doctrines'], actor: ['actor', 'actors'],
    service: ['service', 'services'], marker: ['marker', 'markers'],
    policy: ['policy action', 'policy actions'], target: ['target', 'targets'],
  };
  const parts = (Object.keys(by) as CiterType[])
    .filter((k) => by[k] > 0)
    .map((k) => `${by[k]} ${by[k] === 1 ? label[k][0] : label[k][1]}`)
    .join(', ');
  return { total: set.size, parts };
}

// --- group by publisher ------------------------------------------------------
const byPublisher = new Map<string, string[]>();      // publisher -> [sourceId]
for (const s of a.sources.values()) {
  const pub = (s.publisher ?? '(unattributed)').trim();
  if (!byPublisher.has(pub)) byPublisher.set(pub, []);
  byPublisher.get(pub)!.push(s.id);
}
const publishers = [...byPublisher.keys()].sort((x, y) =>
  x.toLowerCase().localeCompare(y.toLowerCase()),
);

const yearOf = (d?: string) => (d && /^\d{4}/.test(d) ? d.slice(0, 4) : '9999');
// collapse embedded newlines/runs of whitespace (YAML block titles), then escape
// only the characters that would break a link label or code span.
const md = (s: string) => s.replace(/\s+/g, ' ').trim().replace(/([\\`\[\]])/g, '\\$1');

// --- tier / kind tallies for the header -------------------------------------
const tierCount: Record<string, number> = {};
const kindCount: Record<string, number> = {};
let withArchive = 0, withUrl = 0;
for (const s of a.sources.values()) {
  tierCount[s.tier ?? 'unrated'] = (tierCount[s.tier ?? 'unrated'] ?? 0) + 1;
  kindCount[s.kind ?? 'unclassified'] = (kindCount[s.kind ?? 'unclassified'] ?? 0) + 1;
  if (s.archive_url) withArchive++;
  if (s.url) withUrl++;
}
const orphans = [...a.sources.keys()].filter((id) => !citers.has(id)).sort();

// --- render ------------------------------------------------------------------
let gitHash = 'unknown';
try { gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch { /* noop */ }
const today = new Date().toISOString().slice(0, 10);
const N = a.sources.size;
const tierLine = ['primary', 'secondary', 'tertiary', 'unrated']
  .filter((t) => tierCount[t])
  .map((t) => `${tierCount[t]} ${t}`)
  .join(' · ');

const out: string[] = [];
out.push('# AUSPEX — source bibliography');
out.push('');
out.push(`Every source cited anywhere in the atlas — ${N.toLocaleString()} records across ` +
  `${publishers.length} publishers — grouped by publisher, each with the atlas entities that cite it. ` +
  'Generated from `atlas/sources/**` by `site/tools/gen-sources-bib.ts`; do not edit by hand.');
out.push('');
out.push(`**Tiers:** ${tierLine}. **Links:** ${withUrl.toLocaleString()} carry a live URL, ` +
  `${withArchive.toLocaleString()} an archive snapshot. Copyrighted source bodies are **not** ` +
  'redistributed — only the URL, the archive URL, and (in the atlas) a `content_sha256`; see ' +
  '[DATA-RIGHTS.md](DATA-RIGHTS.md). "Cited by" collapses per-claim references (an attribution or ' +
  'doctrine-link citation counts its parent event once).');
out.push('');
if (dangling.size > 0 || orphans.length > 0) {
  out.push('> **Integrity:** ' +
    `${dangling.size} dangling reference${dangling.size === 1 ? '' : 's'} ` +
    `(cited id with no source file), ${orphans.length} orphan source${orphans.length === 1 ? '' : 's'} ` +
    '(source file nothing cites). Both are listed at the foot of this file.');
  out.push('');
}
out.push('---');
out.push('');

for (const pub of publishers) {
  const ids = byPublisher.get(pub)!.sort((x, y) => {
    const sx = a.sources.get(x)!, sy = a.sources.get(y)!;
    return (yearOf(sx.published_on) + x).localeCompare(yearOf(sy.published_on) + y);
  });
  out.push(`## ${md(pub)}  <sup>${ids.length}</sup>`);
  out.push('');
  for (const id of ids) {
    const s = a.sources.get(id)!;
    const date = s.published_on && /^\d{4}/.test(s.published_on) ? s.published_on : 'n.d.';
    const title = s.title ? md(s.title) : '(untitled)';
    const titleCell = s.url ? `[**${title}**](${s.url})` : `**${title}**`;
    const links: string[] = [];
    if (s.archive_url) links.push(`[archived](${s.archive_url})`);
    const { total, parts } = breakdown(id);
    const citedBy = total > 0 ? `cited by ${parts}` : '_uncited_';
    const meta = [date, s.tier ?? 'unrated', ...links, citedBy].filter(Boolean).join(' · ');
    out.push(`- ${titleCell}  `);
    out.push(`  <sub>\`${id}\` · ${meta}</sub>`);
  }
  out.push('');
}

// --- integrity appendix ------------------------------------------------------
if (dangling.size > 0) {
  out.push('---');
  out.push('');
  out.push('## Dangling references');
  out.push('');
  out.push('Source ids cited by an atlas entity with **no matching source file** — broken foreign keys to fix.');
  out.push('');
  for (const [id, sites] of [...dangling.entries()].sort()) {
    out.push(`- \`${id}\` — cited by ${[...sites].sort().map((s) => `\`${s}\``).join(', ')}`);
  }
  out.push('');
}
if (orphans.length > 0) {
  out.push('---');
  out.push('');
  out.push('## Orphan sources');
  out.push('');
  out.push(`${orphans.length} source file${orphans.length === 1 ? '' : 's'} that nothing in the atlas cites — ` +
    'either retire them or wire them to the claim they support.');
  out.push('');
  for (const id of orphans) out.push(`- \`${id}\``);
  out.push('');
}

out.push('---');
out.push(`<sub>Generated ${today} · git \`${gitHash}\` · ${N.toLocaleString()} sources · ` +
  `${a.events.size} events. Regenerate: \`cd site && pnpm exec tsx tools/gen-sources-bib.ts\`.</sub>`);
out.push('');

const target = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'SOURCES.md');
writeFileSync(target, out.join('\n'), 'utf8');
console.log(`Wrote ${target}`);
console.log(`  ${N} sources · ${publishers.length} publishers · ${dangling.size} dangling · ${orphans.length} orphans`);
