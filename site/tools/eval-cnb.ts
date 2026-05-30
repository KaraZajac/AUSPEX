/**
 * ComplementNB attribution LOO through the engine harness (ops-only, n=470,
 * null=miss, prose-DF self-exclusion on the held-out query).
 *
 * CONFIG lets us (a) match the sklearn benchmark to VALIDATE the native scorer,
 * then (b) switch to the engine-consistent config for the head-to-head decision.
 *   pnpm exec tsx tools/eval-cnb.ts [sklearn|engine]
 */
import { atlas, isMetaEvent } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB } from '../src/utils/complement-nb.ts';

const MODE = ['engine', 'strict'].includes(process.argv[2]) ? process.argv[2] : 'sklearn';
// sklearn: reproduce the benchmark — train on the 470 attributable, primary label,
//   >=2-event classes, df>=3, and LENIENT query prose (self-included, as the static
//   sklearn matrix had it). Should hit ~60.4 → validates the native scorer.
// strict:  same, but STRICT query prose hygiene (held-out event excluded from its own
//   prose DF) — identical hygiene to the engine's 56.6. The fair comparison.
// engine:  train on ALL events (as buildProfiles does), all actors, df>=2, strict.
const CFG = MODE === 'engine'
  ? { trainAll: true, primaryOnly: false, keepMin: 1, minDf: 2, queryExcludeSelf: true }
  : MODE === 'strict'
  ? { trainAll: false, primaryOnly: true, keepMin: 2, minDf: 3, queryExcludeSelf: true }
  : { trainAll: false, primaryOnly: true, keepMin: 2, minDf: 3, queryExcludeSelf: false };

const a = atlas();
const allEvents = [...a.events.values()];
const labeled = allEvents.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));

const tokensByEvent = new Map<string, string[]>();
const actorsByEvent = new Map<string, string[]>();
for (const ev of allEvents) {
  tokensByEvent.set(ev.id, eventTokens(extractFeatures(ev, a)));
  actorsByEvent.set(ev.id, [...actorsOfEvent(ev)]);
}

// keep = primary-actor frequency >= keepMin over the labeled set (matches sklearn).
const primFreq = new Map<string, number>();
for (const ev of labeled) { const p = actorsByEvent.get(ev.id)![0]; if (p) primFreq.set(p, (primFreq.get(p) ?? 0) + 1); }
const keep = new Set([...primFreq].filter(([, c]) => c >= CFG.keepMin).map(([k]) => k));
const inKeep = (id: string) => CFG.keepMin <= 1 || keep.has(id);

const trainPool = CFG.trainAll ? allEvents : labeled;
const labelsFor = (id: string) => {
  const all = actorsByEvent.get(id)!;
  const sel = CFG.primaryOnly ? all.slice(0, 1) : all;
  return sel.filter(inKeep);
};

const freqAll = new Map<string, number>();
for (const ev of allEvents) for (const id of actorsByEvent.get(ev.id)!) freqAll.set(id, (freqAll.get(id) ?? 0) + 1);
const tierOf = (id: string) => { const c = freqAll.get(id) ?? 0; return c <= 1 ? '1' : c <= 4 ? '2-4' : c <= 9 ? '5-9' : '10+'; };
const tierHit = new Map<string, [number, number]>();

let h1 = 0, h3 = 0, h5 = 0, mrr = 0;
const t0 = Date.now();
for (const heldOut of labeled) {
  const docs: Array<{ tokens: string[]; actors: string[] }> = [];
  for (const ev of trainPool) {
    if (ev.id === heldOut.id) continue;
    const acts = labelsFor(ev.id);
    if (acts.length) docs.push({ tokens: tokensByEvent.get(ev.id)!, actors: acts });
  }
  const model = trainCNB(docs, { alpha: 1, minDf: CFG.minDf });
  const qf = extractFeatures(heldOut, a, { excludeSelfFromProseDF: CFG.queryExcludeSelf });
  const ranked = rankCNB(eventTokens(qf), model);

  const truth = actorsByEvent.get(heldOut.id)!.filter(inKeep);
  const ranks = truth.map((tid) => ranked.findIndex((c) => c.actorId === tid) + 1).filter((r) => r > 0);
  const bestRank = ranks.length ? Math.min(...ranks) : null;
  if (bestRank === 1) h1++;
  if (bestRank !== null && bestRank <= 3) h3++;
  if (bestRank !== null && bestRank <= 5) h5++;
  if (bestRank) mrr += 1 / bestRank;

  const tier = tierOf(actorsByEvent.get(heldOut.id)![0]);
  const row = tierHit.get(tier) ?? [0, 0];
  row[1]++; if (bestRank === 1) row[0]++; tierHit.set(tier, row);
}

const n = labeled.length;
const p = (x: number) => ((x / n) * 100).toFixed(1);
console.log(`ComplementNB attribution LOO — MODE=${MODE}  (n=${n}, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
console.log(`  config: ${JSON.stringify(CFG)}`);
console.log(`  top-1 ${p(h1)}   top-3 ${p(h3)}   top-5 ${p(h5)}   MRR ${(mrr / n).toFixed(3)}`);
console.log(`  refs: engine-NB 56.6/74.7/0.663 (LOO) · sklearn-CNB 60.4/72.1 (current scrubbed features)`);
console.log('  by actor-frequency tier (top-1):');
for (const t of ['1', '2-4', '5-9', '10+']) { const r = tierHit.get(t); if (r) console.log(`    ${t.padEnd(4)} ${r[0]}/${r[1]} = ${(r[0] / r[1] * 100).toFixed(0)}%`); }
