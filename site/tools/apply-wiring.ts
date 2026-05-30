/**
 * apply-wiring.ts — apply actor-to-service placement + dedup-merge decisions.
 *  - place:  re-key actor <state>/unscoped/<slug> -> <service>/<slug>, set primary_service_id
 *  - merge:  move actor's events to target, add alias to target, delete actor file
 *  - keep_*: no change
 * Propagates every actor_id change into event attribution actor_ids. Creates new services.
 *   pnpm exec tsx tools/apply-wiring.ts /tmp/wire-all.json [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { atlas, ATLAS_ROOT } from '../src/utils/atlas.ts';

const WRITE = process.argv.includes('--write');
const decisions = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const a: any = atlas();
const svcExists = new Set<string>(a.services.keys());
const stateExists = new Set<string>(a.nationStates.keys());

// index every actor file: id -> path
const walk = (d: string): string[] => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.yaml') ? [p] : []); });
const actorFiles = walk(join(ATLAS_ROOT, 'actors'));
const idToPath = new Map<string, string>();
for (const p of actorFiles) { const m = readFileSync(p, 'utf8').match(/^id:\s*(\S+)/m); if (m) idToPath.set(m[1], p); }

const slugOf = (id: string) => id.split('/').pop()!;
const NULL_SVC_NS = new Set(['ru/proxies', 'criminal']); // actor-id namespaces with primary_service_id: null

// ---- build remap: oldActorId -> newActorId ----
const remap = new Map<string, string>();
const placeOps: { oldId: string; newId: string; service: string | null }[] = [];
const warns: string[] = [];
for (const d of decisions) {
  if (d.action === 'place') {
    const slug = slugOf(d.actor_id);
    const nullSvc = NULL_SVC_NS.has(d.service_id);
    const newId = `${d.service_id}/${slug}`;
    const service = nullSvc ? null : d.service_id;
    if (!nullSvc && !svcExists.has(d.service_id) && !(d.new_service && d.new_service.id === d.service_id)) { warns.push(`place ${d.actor_id}: service ${d.service_id} missing`); continue; }
    placeOps.push({ oldId: d.actor_id, newId, service });
    if (newId !== d.actor_id) remap.set(d.actor_id, newId);
  }
}
// merges resolved AFTER places (so a merge target that was placed uses its new id, already final in decision)
const mergeOps: { oldId: string; target: string; alias: string }[] = [];
for (const d of decisions) {
  if (d.action === 'merge') {
    mergeOps.push({ oldId: d.actor_id, target: d.merge_into, alias: d.alias_to_add || slugOf(d.actor_id) });
    remap.set(d.actor_id, d.merge_into);
  }
}

// ---- 1. create new services ----
const newServices = decisions.filter((d: any) => d.action === 'place' && d.new_service).map((d: any) => d.new_service)
  .filter((s: any, i: number, arr: any[]) => arr.findIndex(x => x.id === s.id) === i);
const fileWrites: { path: string; body: string }[] = [];
for (const s of newServices) {
  if (svcExists.has(s.id)) continue;
  if (!stateExists.has(s.nation_state_id)) { warns.push(`new service ${s.id}: nation_state ${s.nation_state_id} missing`); continue; }
  const [st] = s.id.split('/');
  fileWrites.push({
    path: join(ATLAS_ROOT, 'services', st, `${slugOf(s.id)}.yaml`),
    body: `# Added 2026-05-30 (actor-wiring QC). Source-backed; see wiring decisions.\nid: ${s.id}\nnation_state_id: ${s.nation_state_id}\nname: ${JSON.stringify(s.name)}\nparent_service_id: ${s.parent_service_id || 'null'}\n`,
  });
}

// ---- 2. propagate actor_id remap into event attribution actor_ids ----
const eventFiles = walk(join(ATLAS_ROOT, 'events'));
let evTouched = 0, refRewrites = 0;
const eventEdits: { path: string; body: string }[] = [];
for (const p of eventFiles) {
  let t = readFileSync(p, 'utf8'); let changed = false;
  t = t.replace(/(\bactor_id:\s*)(\S+)/g, (m, pre, id) => { if (remap.has(id)) { changed = true; refRewrites++; return pre + remap.get(id); } return m; });
  // also attribution_source_id never matches actor ids; safe
  if (changed) { evTouched++; eventEdits.push({ path: p, body: t }); }
}

// ---- 3. actor file edits ----
const actorEdits: { path: string; body: string }[] = [];
const actorDeletes: string[] = [];
// place: edit id + primary_service_id
for (const op of placeOps) {
  const path = idToPath.get(op.oldId); if (!path) { warns.push(`place: no file for ${op.oldId}`); continue; }
  let t = readFileSync(path, 'utf8');
  t = t.replace(/^id:\s*\S+/m, `id: ${op.newId}`);
  t = t.replace(/^primary_service_id:\s*\S+/m, `primary_service_id: ${op.service ?? 'null'}`);
  actorEdits.push({ path, body: t });
}
// merge: add alias to target file, delete source file
const aliasBlock = (name: string) => `  - alias: ${JSON.stringify(name)}\n    assigning_org: vendor-consensus\n    confidence: equivalent\n`;
const targetAliasAdds = new Map<string, string[]>();
for (const op of mergeOps) {
  const srcPath = idToPath.get(op.oldId); if (srcPath) actorDeletes.push(srcPath); else warns.push(`merge: no file for ${op.oldId}`);
  (targetAliasAdds.get(op.target) ?? targetAliasAdds.set(op.target, []).get(op.target)!).push(op.alias);
}
for (const [target, aliases] of targetAliasAdds) {
  // target may be a placed actor (new id) -> find its file via old id or new id
  let path = idToPath.get(target);
  if (!path) { const placed = placeOps.find(o => o.newId === target); if (placed) path = idToPath.get(placed.oldId); }
  if (!path) { warns.push(`merge target file not found: ${target}`); continue; }
  // apply on top of any place-edit already staged for this file
  let t = actorEdits.find(e => e.path === path)?.body ?? readFileSync(path, 'utf8');
  const add = aliases.map(aliasBlock).join('');
  if (/^aliases:\s*\[\]\s*$/m.test(t)) t = t.replace(/^aliases:\s*\[\]\s*$/m, 'aliases:\n' + add.replace(/\n$/, ''));
  else if (/^aliases:\s*$/m.test(t)) t = t.replace(/^aliases:\s*$/m, 'aliases:\n' + add.replace(/\n$/, ''));
  else t = t.replace(/^aliases:\s*\n/m, 'aliases:\n' + add);
  const e = actorEdits.find(e => e.path === path); if (e) e.body = t; else actorEdits.push({ path, body: t });
}

// ---- report / write ----
const counts = decisions.reduce((m: any, d: any) => (m[d.action] = (m[d.action] || 0) + 1, m), {});
console.log(`decisions: ${decisions.length} ${JSON.stringify(counts)}`);
console.log(`new services: ${fileWrites.length} (${newServices.map((s: any) => s.id).join(', ') || 'none'})`);
console.log(`actor remaps: ${remap.size} (place ${placeOps.filter(o => o.newId !== o.oldId).length}, merge ${mergeOps.length})`);
console.log(`event files touched: ${evTouched} (${refRewrites} actor_id refs rewritten)`);
console.log(`actor files edited: ${actorEdits.length} | deleted (merged): ${actorDeletes.length}`);
if (warns.length) { console.log('WARNINGS:'); warns.forEach(w => console.log('  - ' + w)); }
if (WRITE) {
  for (const f of fileWrites) { mkdirSync(dirname(f.path), { recursive: true }); writeFileSync(f.path, f.body); }
  for (const e of eventEdits) writeFileSync(e.path, e.body);
  for (const e of actorEdits) writeFileSync(e.path, e.body);
  for (const p of actorDeletes) rmSync(p);
  console.log('WROTE all changes.');
} else console.log('(dry-run; pass --write)');
