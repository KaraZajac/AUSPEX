/**
 * Rank-1 stability of the DEPLOYED attribution engine (ComplementNB + stack)
 * under 10% corpus dropout, seeded (mirrors runStability for NB). The CNB base
 * is rebuilt on each resample; the deployed logreg and the pairFeatures
 * meta-features are held at full-corpus (the deployed artifact) — so this
 * measures the CNB base's contribution to rank-1 robustness.
 *   pnpm exec tsx tools/eval-cnb-stability.ts
 */
import { atlas, isMetaEvent } from '../src/utils/atlas.ts';
import { actorsOfEvent, extractFeatures } from '../src/utils/attribution.ts';
import { eventTokens, trainCNB, rankCNB, type CNBModel } from '../src/utils/complement-nb.ts';
import { pairFeatures, buildKnownCampaigns, predictLogReg } from '../src/utils/stacked-core.ts';
import { buildDeployedAttributionModel } from '../src/utils/stacked-attribution.ts';

const a = atlas();
const all = [...a.events.values()];
const labeled = all.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));
const tok = new Map<string, string[]>();
const act = new Map<string, string[]>();
for (const e of all) { tok.set(e.id, eventTokens(extractFeatures(e, a))); act.set(e.id, [...actorsOfEvent(e)]); }

const logreg = buildDeployedAttributionModel();
const kc = buildKnownCampaigns(all, (e) => actorsOfEvent(e));
const mkDocs = (evs: typeof all) => evs.map((e) => ({ tokens: tok.get(e.id)!, actors: act.get(e.id)! })).filter((d) => d.actors.length > 0);

function rank(cnb: CNBModel, qid: string) {
  const top = rankCNB(tok.get(qid)!, cnb).slice(0, 10).map((c, i) => ({ actorId: c.actorId, logScore: c.score, rank: i + 1 }));
  const ts = top[0]?.logScore ?? 0;
  const ev = a.events.get(qid)!;
  const r = top.map((c) => ({ id: c.actorId, p: predictLogReg(logreg, pairFeatures(ev, c, ts, a, kc)) })).sort((x, y) => y.p - x.p);
  return { top1: r[0]?.id ?? null, top3: new Set(r.slice(0, 3).map((x) => x.id)) };
}

const baseCNB = trainCNB(mkDocs(all), { alpha: 1, minDf: 2 });
const baseR1 = new Map<string, string | null>();
const baseT3 = new Map<string, Set<string>>();
for (const e of labeled) { const r = rank(baseCNB, e.id); baseR1.set(e.id, r.top1); baseT3.set(e.id, r.top3); }

let seed = 0xc0ffee >>> 0;
const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
let r1a = 0, r1c = 0, t3a = 0, t3c = 0;
for (let i = 0; i < 10; i++) {
  const surviving = all.filter(() => rand() >= 0.1);
  const survSet = new Set(surviving.map((e) => e.id));
  const cnb = trainCNB(mkDocs(surviving), { alpha: 1, minDf: 2 });
  for (const e of labeled) {
    if (!survSet.has(e.id)) continue;
    const r = rank(cnb, e.id);
    const b1 = baseR1.get(e.id);
    if (b1 != null && r.top1 != null) { r1c++; if (b1 === r.top1) r1a++; }
    const b3 = baseT3.get(e.id);
    if (b3) { t3c++; const inter = [...b3].filter((x) => r.top3.has(x)).length; const uni = new Set([...b3, ...r.top3]).size; if (uni > 0 && inter / uni >= 0.5) t3a++; }
  }
}
console.log(`CNB+stack rank-1 stability (10% dropout, 10 seeded resamples): ${(r1a / r1c * 100).toFixed(1)}%`);
console.log(`  top-3 set stability (Jaccard ≥ 0.5): ${(t3a / t3c * 100).toFixed(1)}%`);
console.log(`  reference (NB engine): 91.4% / 98.9%`);
