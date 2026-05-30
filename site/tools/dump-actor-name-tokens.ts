/**
 * Emit the set of prose tokens that ARE actor names/aliases, tokenized exactly
 * as prose-features.ts does. Used to measure how much of the prose feature's
 * lift is actor-name leak (summaries naming the actor) vs real tradecraft signal.
 *   pnpm exec tsx tools/dump-actor-name-tokens.ts  →  /tmp/actor_name_tokens.json
 */
import { atlas } from '../src/utils/atlas.ts';
import { writeFileSync } from 'node:fs';

// Replicates prose-features.ts tokenize() (stopwords irrelevant for names).
function tok(text: string): string[] {
  const out: string[] = [];
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s\-/]/g, ' ');
  for (const raw of cleaned.split(/\s+/)) {
    if (raw.length < 3) continue;
    const t = raw.replace(/^-+|-+$/g, '');
    if (t.length < 3 || t.length > 30) continue;
    if (/^\d+$/.test(t)) continue;
    if (/^(19|20)\d{2}$/.test(t)) continue;
    out.push(t);
  }
  return out;
}

const a = atlas();
const byActor: Record<string, string[]> = {};
const all = new Set<string>();
for (const actor of a.actors.values()) {
  const names = [actor.canonical_name, ...(actor.aliases ?? []).map((x) => x.alias)];
  const toks = [...new Set(names.flatMap(tok))];
  byActor[actor.id] = toks;
  for (const t of toks) all.add(t);
}
writeFileSync('/tmp/actor_name_tokens.json', JSON.stringify({ tokens: [...all], byActor }));
console.log(`actors ${a.actors.size} | distinct actor-name tokens ${all.size}`);
