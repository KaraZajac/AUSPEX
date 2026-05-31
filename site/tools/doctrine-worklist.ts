/** Build the doctrine-tagging worklist + per-state doctrine/pillar vocab + batches. */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent } from '../src/utils/attribution.ts';
import { isMetaEvent } from '../src/utils/atlas-core.ts';

const a: any = atlas();
const filesIn = (c: string, sub: string) => execSync(`git -C .. diff --name-only ${c}^ ${c} -- ${sub}`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const importedFiles = [...filesIn('af80f62', 'atlas/events'), ...filesIn('945f788', 'atlas/events')];

// per-state doctrine vocab (doctrine + nested pillars)
const vocab: Record<string, any[]> = {};
for (const d of a.doctrines.values()) {
  const st = d.nation_state_id; if (!st) continue;
  const pillars = (d.pillars || []).map((p: any) => ({ pillar_id: p.id || p.pillar_id || p.pillar?.id, name: p.name || p.title || p.pillar?.name })).filter((p: any) => p.pillar_id);
  (vocab[st] ??= []).push({ doctrine_id: d.id, name: d.name, summary: (d.summary || d.cyber_relevance || '').slice(0, 160), pillars });
}
writeFileSync('/tmp/doctrine-vocab.json', JSON.stringify(vocab, null, 1));
const doctrineStates = new Set(Object.keys(vocab));

// worklist: imported ops events on doctrine-states with EMPTY doctrine_links
const work: any[] = [];
let skipMeta = 0, skipNoDoctrineState = 0, skipAlreadyTagged = 0;
for (const f of importedFiles) {
  const raw = readFileSync('../' + f, 'utf8');
  const id = raw.match(/^id:\s*(\S+)/m)?.[1]; if (!id) continue;
  const ev: any = a.events.get(id); if (!ev) continue;
  if (isMetaEvent(ev)) { skipMeta++; continue; }
  if ((ev.doctrine_links || []).length) { skipAlreadyTagged++; continue; }
  const actor = [...actorsOfEvent(ev)][0] || '';
  const state = actor.split('/')[0];
  if (!doctrineStates.has(state)) { skipNoDoctrineState++; continue; }
  const suggested = raw.match(/suggested doctrine fit\s+(\S+)/)?.[1] || null;
  work.push({ id, name: ev.name, actor, state, suggested_fit: suggested, summary: (ev.summary || '').trim().slice(0, 600) });
}
work.sort((x, y) => x.state.localeCompare(y.state));
writeFileSync('/tmp/doctrine-worklist.json', JSON.stringify(work, null, 1));

console.log(`imported event files: ${importedFiles.length}`);
console.log(`skip: meta ${skipMeta}, no-doctrine-state (criminal/ps/sa) ${skipNoDoctrineState}, already-tagged ${skipAlreadyTagged}`);
console.log(`TO TAG: ${work.length} events`);
const byState: Record<string, number> = {}; work.forEach(w => byState[w.state] = (byState[w.state] || 0) + 1);
console.log('by state:', JSON.stringify(byState));
console.log('with a suggested_fit hint:', work.filter(w => w.suggested_fit).length);
// even ~14-event chunks (sorted by state so vocab stays localized; agents get full vocab anyway)
const TARGET = 14; const batches: any[][] = [[]];
for (let i = 0; i < work.length; i++) {
  if (batches[batches.length - 1].length >= TARGET) batches.push([]);
  batches[batches.length - 1].push(work[i]);
}
batches.forEach((b, k) => writeFileSync(`/tmp/doctrine-batch-${k}.json`, JSON.stringify(b, null, 1)));
console.log(`batches: ${batches.map(b => b.length).join(', ')}`);
