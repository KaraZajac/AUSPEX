/**
 * List ALL dangling source FK references in the atlas — no display cap.
 * Outputs unique source IDs and where they are cited.
 */
import { atlas } from '../src/utils/atlas.ts';

const a = atlas();
const sources = a.sources;

type Cite = { id: string; site: string };
const dangling: Cite[] = [];

function check(id: string | null | undefined, site: string) {
  if (!id) return;
  if (!sources.has(id)) dangling.push({ id, site });
}

for (const svc of a.services.values()) {
  for (const sid of svc.sources ?? []) check(sid, `service:${svc.id}`);
}
for (const d of a.doctrines.values()) {
  for (const sid of d.sources ?? []) check(sid, `doctrine:${d.id}`);
}
for (const act of a.actors.values()) {
  for (const sid of act.sources ?? []) check(sid, `actor:${act.id}`);
}
for (const ev of a.events.values()) {
  for (const attr of ev.attributions ?? []) {
    if (attr.attribution_source_id) check(attr.attribution_source_id, `event-attr:${ev.id}`);
  }
  for (const link of ev.doctrine_links ?? []) {
    if (link.attesting_source_id) check(link.attesting_source_id, `event-link:${ev.id}`);
  }
  for (const sid of ev.sources ?? []) check(sid, `event:${ev.id}`);
}
for (const m of a.timelineMarkers.values()) {
  for (const sid of m.cited_by ?? []) check(sid, `marker:${m.id}`);
}

const grouped = new Map<string, string[]>();
for (const { id, site } of dangling) {
  if (!grouped.has(id)) grouped.set(id, []);
  grouped.get(id)!.push(site);
}

const sorted = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
for (const [id, sites] of sorted) {
  console.log(`${id}\t${sites.length}\t${sites.slice(0, 3).join(',')}`);
}
console.log(`---\nTotal unique dangling source IDs: ${grouped.size}`);
console.log(`Total dangling refs: ${dangling.length}`);
