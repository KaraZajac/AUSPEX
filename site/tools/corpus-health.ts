/** Corpus-health diagnostic: depth distribution, accuracy-by-depth, feature + doctrine coverage. */
import { readFileSync } from 'node:fs';
import { atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent } from '../src/utils/attribution.ts';
import { isMetaEvent } from '../src/utils/atlas-core.ts';

const a: any = atlas();
const evs = [...a.events.values()];
const ops = evs.filter((e: any) => !isMetaEvent(e));

const depth: Record<string, number> = {};
for (const ev of ops) for (const ac of actorsOfEvent(ev)) depth[ac] = (depth[ac] || 0) + 1;
const actors = Object.keys(depth);
const bucket = (k: number) => k >= 10 ? '10+' : k >= 5 ? '5-9' : k >= 3 ? '3-4' : k >= 2 ? '2' : '1(singleton)';
const ORDER = ['1(singleton)', '2', '3-4', '5-9', '10+'];

const bk: Record<string, { actors: number; events: number }> = {};
for (const ac of actors) { const b = bucket(depth[ac]); (bk[b] ??= { actors: 0, events: 0 }); bk[b].actors++; bk[b].events += depth[ac]; }

console.log('\n===== CORPUS HEALTH (815-event QC\'d corpus) =====');
console.log(`events: ${evs.length} | meta: ${evs.length - ops.length} | ops: ${ops.length} | attributed actors: ${actors.length}`);
console.log('\n-- actor depth distribution (attributed ops actors) --');
for (const b of ORDER) { const v = bk[b] ?? { actors: 0, events: 0 }; console.log(`  k=${b.padEnd(12)} ${String(v.actors).padStart(3)} actors  ${String(v.events).padStart(4)} events`); }
const singl = (bk['1(singleton)'] ?? { actors: 0 }).actors;
const thin = singl + (bk['2'] ?? { actors: 0 }).actors;
console.log(`  => ${singl} singletons, ${thin} thin (k<=2) of ${actors.length} actors (${(100 * thin / actors.length).toFixed(0)}% CV-fragile)`);

const dump = JSON.parse(readFileSync('/tmp/cnb-final.json', 'utf8'));
const rows = dump.rows;
const dB: Record<string, { h: number; n: number }> = {};
for (const id of Object.keys(rows)) {
  const ta: string[] = rows[id].trueActors;
  const maxk = ta.reduce((m, x) => Math.max(m, depth[x] || 0), 0);
  const b = bucket(maxk); (dB[b] ??= { h: 0, n: 0 }); dB[b].h += rows[id].hit1; dB[b].n++;
}
console.log(`\n-- attribution top-1 by actor depth (overall ${(100 * dump.hit1).toFixed(1)}%, n=${Object.keys(rows).length}) --`);
for (const b of [...ORDER].reverse()) { const v = dB[b]; if (v) console.log(`  events on k=${b.padEnd(12)} ${(100 * v.h / v.n).toFixed(1).padStart(5)}%  (n=${v.n})`); }

const cov = (f: (e: any) => boolean) => ops.filter(f).length;
const pc = (n: number) => `${n} (${(100 * n / ops.length).toFixed(0)}%)`;
console.log(`\n-- feature coverage (of ${ops.length} ops events) --`);
console.log(`  targets[]:       ${pc(cov(e => e.targets?.length))}`);
console.log(`  initial_vector:  ${pc(cov(e => e.initial_vector))}`);
console.log(`  campaign_id:     ${pc(cov(e => e.campaign_id))}`);
console.log(`  operators_named: ${pc(cov(e => e.operators_named?.length))}`);
console.log(`  doctrine_links:  ${pc(cov(e => e.doctrine_links?.length))}  <- WHY-engine coverage`);

const st: Record<string, number> = {};
for (const ev of ops) for (const ac of actorsOfEvent(ev)) { const s = ac.split('/')[0]; st[s] = (st[s] || 0) + 1; }
console.log('\n-- events per attacker namespace (top 12) --');
Object.entries(st).sort((x, y) => y[1] - x[1]).slice(0, 12).forEach(([s, n]) => console.log(`  ${s.padEnd(10)} ${n}`));
