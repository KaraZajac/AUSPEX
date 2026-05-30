/**
 * Dump per-event CNB+stack top-1 hits to a JSON {eventId: 0|1}, plus true actors.
 * Used to decompose the corpus-growth effect (same original events, pre vs post).
 *   pnpm exec tsx tools/dump-cnb-perevent.ts <out.json>
 */
import { writeFileSync } from 'node:fs';
import { atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures, type RankedCandidate } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';
import { runStackedAttributionLOO } from '../src/utils/stacked-attribution.ts';
import type { AuspexEvent, Atlas } from '../src/utils/atlas.ts';

const out = process.argv[2] || '/tmp/cnb-perevent.json';
const a = atlas();
const allEvents = [...a.events.values()];
const tokensByEvent = new Map<string, string[]>();
const actorsByEvent = new Map<string, string[]>();
for (const ev of allEvents) {
  tokensByEvent.set(ev.id, eventTokens(extractFeatures(ev, a)));
  actorsByEvent.set(ev.id, [...actorsOfEvent(ev)]);
}
const cnbRanker = (heldOut: AuspexEvent, training: AuspexEvent[], atl: Atlas): RankedCandidate[] => {
  const docs = training.map((ev) => ({ tokens: tokensByEvent.get(ev.id)!, actors: actorsByEvent.get(ev.id)! }))
    .filter((d) => d.actors.length > 0);
  const model = trainCNB(docs, { alpha: 1, minDf: 2 });
  const qf = extractFeatures(heldOut, atl, { excludeSelfFromProseDF: true });
  return rankCNB(eventTokens(qf), model).map((r, i) => ({ actorId: r.actorId, logScore: r.score, rank: i + 1 }));
};

const r: any = runStackedAttributionLOO(5, cnbRanker);
const pe = r.perEvent;
const rows: Record<string, { hit1: number; trueActors: string[] }> = {};
for (let i = 0; i < pe.eventIds.length; i++) {
  const id = pe.eventIds[i];
  rows[id] = { hit1: pe.stHit1[i], trueActors: actorsByEvent.get(id) || [] };
}
writeFileSync(out, JSON.stringify({ scored: r.scored, hit1: r.hit1, rows }, null, 0));
console.log(`wrote ${out}: scored ${r.scored}, CNB+stack top-1 ${(r.hit1 * 100).toFixed(1)}%`);
