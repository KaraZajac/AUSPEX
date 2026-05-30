/**
 * One-shot: dump a corpus inventory brief for the backfill-research agents.
 * Writes /tmp/auspex-corpus-inventory.md — grouped by attacker state, with the
 * existing events (for de-dup), the known actors + doctrines (to map onto), and
 * a gap summary (singletons + thin states). Read-only.
 *
 *   pnpm exec tsx tools/dump-inventory.ts
 */
import { atlas, eventStateId, isMetaEvent } from '../src/utils/atlas.ts';
import { actorsOfEvent } from '../src/utils/attribution.ts';
import { doctrinesOfEvent } from '../src/utils/doctrine-prediction.ts';
import { writeFileSync } from 'node:fs';

const a = atlas();
const STATE_NAMES: Record<string, string> = {
  ru: 'Russia', cn: 'China', kp: 'North Korea', ir: 'Iran', us: 'United States',
  in: 'India', ae: 'UAE', tr: 'Türkiye', pk: 'Pakistan', fr: 'France', vn: 'Vietnam',
  uk: 'United Kingdom', by: 'Belarus', il: 'Israel', kr: 'South Korea',
};

const byState = new Map<string, { name: string; date: string; actors: string[]; meta: boolean }[]>();
const actorCount = new Map<string, number>();
for (const ev of a.events.values()) {
  const sid = eventStateId(ev, a) ?? 'none';
  const actors = [...actorsOfEvent(ev)].map((id) => a.actors.get(id)?.canonical_name ?? id);
  for (const id of actorsOfEvent(ev)) actorCount.set(id, (actorCount.get(id) ?? 0) + 1);
  if (!byState.has(sid)) byState.set(sid, []);
  byState.get(sid)!.push({
    name: ev.name, date: (ev.start_date ?? ev.disclosure_date ?? '????').slice(0, 10),
    actors, meta: isMetaEvent(ev),
  });
}

const singletons = [...actorCount.entries()].filter(([, n]) => n === 1)
  .map(([id]) => a.actors.get(id)?.canonical_name ?? id).sort();

const out: string[] = [];
out.push('# AUSPEX corpus inventory — backfill-research brief (2026-05-30)\n');
out.push('Read this in full, then focus on your assigned state/slice. The goal is to');
out.push('propose NEW, well-sourced cyber events that are NOT already listed below.\n');
out.push('## Controlled incident_type vocabulary (use these exact tokens)');
out.push('intrusion, data-theft, destructive, wiper, ransomware, financial-theft, extortion,');
out.push('supply-chain, pre-positioning, disruption, espionage, surveillance, bulk-collection,');
out.push('reconnaissance, influence-operation, hack-and-leak, leak, insider, cyber-physical.');
out.push('(meta/announcement, lower priority: documentary, disclosure, doctrine-publication,');
out.push('attribution-publication, policy, law-enforcement)\n');
out.push('## Confidence labels (ICD-203 style)');
out.push('attested (source explicitly states it) · strongly_inferred · plausible\n');
out.push('## Gap summary — prioritize these');
out.push(`Thin states (<25 events, highest leverage): il(8) kr(6) by(15) uk(17) vn(21) fr(21) pk(22) tr(23) ae(24)`);
out.push(`Singleton actors (exactly 1 event — a 2nd well-sourced event makes them LOO-rankable):`);
out.push(singletons.join(', ') + '\n');

const order = ['ru', 'by', 'cn', 'kp', 'ir', 'us', 'uk', 'fr', 'in', 'pk', 'tr', 'ae', 'vn', 'il', 'kr', 'none'];
for (const sid of order) {
  const evs = byState.get(sid);
  if (!evs) continue;
  evs.sort((x, y) => y.date.localeCompare(x.date));
  const doctrines = [...a.doctrines.values()].filter((d) => d.nation_state_id === sid)
    .map((d) => `${d.id} — ${d.short_name ?? d.name}`);
  out.push(`\n### ${sid.toUpperCase()} — ${STATE_NAMES[sid] ?? sid} (${evs.length} events)`);
  if (doctrines.length) out.push(`Doctrines: ${doctrines.join(' · ')}`);
  out.push('Existing events (do NOT re-propose — find OTHERS, ideally 2023–2026):');
  for (const e of evs) out.push(`- ${e.date} — ${e.name}${e.actors.length ? ` [${e.actors.join(', ')}]` : ''}${e.meta ? ' (meta)' : ''}`);
}

writeFileSync('/tmp/auspex-corpus-inventory.md', out.join('\n'));
console.log(`Wrote /tmp/auspex-corpus-inventory.md (${out.join('\n').length} bytes)`);
console.log(`states: ${[...byState.keys()].join(',')}  singleton actors: ${singletons.length}`);
