/**
 * Build the QC-enrichment worklist: the imported events that resolved to EXISTING
 * actors ("fills"), which scored 24.3% because they are feature-poor. For each,
 * gather the source URL + supporting quote so the claim can be re-read and
 * source-grounded features (targets / malware / ttps / operators / vector) added.
 *   pnpm exec tsx tools/qc-fill-worklist.ts
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { atlas } from '../src/utils/atlas.ts';

const a: any = atlas();
const IMPORT_COMMIT = process.env.IMPORT_COMMIT || 'af80f62';
const filesIn = (sub: string) => execSync(`git -C .. diff --name-only ${IMPORT_COMMIT}^ ${IMPORT_COMMIT} -- ${sub}`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
// new-actor ids (actors added in the import commit) — events on these are "new-only", excluded here
const newActors = new Set<string>();
for (const f of filesIn('atlas/actors')) { const m = readFileSync('../' + f, 'utf8').match(/^id:\s*(\S+)/m); if (m) newActors.add(m[1]); }

// imported event ids (events added in the import commit)
const evFiles = filesIn('atlas/events');
const importedIds = new Set(evFiles.map(f => {
  const t = readFileSync('../' + f, 'utf8'); const m = t.match(/^id:\s*(\S+)/m); return m ? m[1] : '';
}).filter(Boolean));

const FEATURE_FIELDS = ['targets', 'malware', 'mitre_techniques', 'operators', 'initial_vector', 'campaign_id'];
const fills: any[] = [];
const kinds: Record<string, number> = {};
for (const id of importedIds) {
  const ev: any = a.events.get(id);
  if (!ev) continue;
  const actorIds = (ev.attributions || []).map((x: any) => x.actor_id).filter(Boolean);
  const isFill = actorIds.some((x: string) => !newActors.has(x));
  if (!isFill) continue; // skip new-only
  const srcId = (ev.sources || [])[0];
  const src: any = srcId ? a.sources.get(srcId) : null;
  const have = FEATURE_FIELDS.filter(f => ev[f] && (Array.isArray(ev[f]) ? ev[f].length : true));
  fills.push({
    id, name: ev.name, actor: actorIds[0], start_date: ev.start_date,
    incident_type: ev.incident_type || [],
    summary: (ev.summary || '').trim(),
    url: src?.url || null, kind: src?.kind || '?', sourceId: srcId,
    quote: (src?.note || '').replace(/^Supporting quote:\s*/i, '').slice(0, 300),
    haveFeatures: have,
  });
  kinds[src?.kind || '?'] = (kinds[src?.kind || '?'] || 0) + 1;
}
fills.sort((x, y) => x.actor.localeCompare(y.actor));
writeFileSync('/tmp/qc-fill-worklist.json', JSON.stringify(fills, null, 1));

// controlled vocabulary for enrichment agents (so they map to real slugs, never invent)
const sectorSlugs = [...a.sectors.keys()].sort();
const campaignIds = [...new Set([...a.events.values()].map((e: any) => e.campaign_id).filter(Boolean))].sort();
writeFileSync('/tmp/qc-vocab.json', JSON.stringify({
  initial_vector: ['phishing', 'n-day', '0-day', 'supply-chain', 'valid-creds', 'insider', 'physical', 'unknown'],
  roles: ['primary', 'collateral', 'staging', 'transit'],
  sector_slugs: sectorSlugs,
  campaign_ids: campaignIds,
}, null, 1));
console.log(`wrote /tmp/qc-vocab.json (${sectorSlugs.length} sector slugs, ${campaignIds.length} campaign ids)`);

// split into ~6 actor-coherent batches (never split one actor's fills across agents)
const TARGET = 12; const batches: any[][] = [[]];
for (let i = 0; i < fills.length; i++) {
  const cur = batches[batches.length - 1];
  const actorChanged = i > 0 && fills[i].actor !== fills[i - 1].actor;
  if (cur.length >= TARGET && actorChanged) batches.push([]);
  batches[batches.length - 1].push(fills[i]);
}
batches.forEach((b, k) => writeFileSync(`/tmp/qc-batch-${k}.json`, JSON.stringify(b, null, 1)));
console.log(`wrote ${batches.length} batches: ${batches.map(b => b.length).join(', ')}`);
console.log(`fills (events on existing actors): ${fills.length}`);
console.log(`source kinds:`, JSON.stringify(kinds));
console.log(`events with ANY feature field already: ${fills.filter(f => f.haveFeatures.length).length} (rest have only summary+attribution)`);
console.log(`events with a usable URL: ${fills.filter(f => f.url).length}`);
console.log(`\n=== fills by actor (id | actor | kind | url?) ===`);
for (const f of fills) console.log(`  ${f.id.padEnd(42)} ${f.actor.padEnd(26)} ${String(f.kind).padEnd(12)} ${f.url ? 'url' : 'NO-URL'}`);
