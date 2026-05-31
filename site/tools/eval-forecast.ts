/**
 * Forecast prototype v2 — temporal forward-validation with geopolitical context.
 * From a TARGET PROFILE ALONE (sectors/countries/orgs), rank the likely actor.
 * v1 used flat (time-blind) feature counts -> tied the affinity baseline. v2 adds:
 *   (a) recency-weighted targeting   (recent victimology predicts future)
 *   (b) state-level dyad             (a thin actor inherits its STATE's history vs
 *                                     the target's country -> the real tension signal)
 * Markers are NOT used: AUSPEX timeline markers are state capability/doctrine events,
 * not attacker-victim tension, so they don't map to "by whom".
 *   pnpm exec tsx tools/eval-forecast.ts
 */
import { atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent } from '../src/utils/attribution.ts';
import { isMetaEvent } from '../src/utils/atlas-core.ts';

const a: any = atlas();
const SPLIT = '2023-12-31';
const SPLIT_Y = 2024, HALF_LIFE = 2, ALPHA = 0.5, BETA_DYAD = 1.0;

function targetFeatures(ev: any): string[] {
  const f = new Set<string>();
  for (const t of ev.targets ?? []) {
    const tid = t.target_id || '';
    if (tid.startsWith('sectors/')) {
      let slug = tid.replace(/^sectors\//, '');
      while (slug && !a.sectors.has(slug)) { const i = slug.lastIndexOf('/'); if (i < 0) { slug = ''; break; } slug = slug.slice(0, i); }
      if (slug) { const top = a.sectorAncestors(slug)[0]; if (top) f.add('sector:' + top.id); }
    }
    if (tid.startsWith('orgs/') || tid.startsWith('infra/')) f.add('tgt:' + tid);
    if (t.country) f.add('country:' + String(t.country).toLowerCase());
  }
  return [...f];
}
const countriesOf = (feats: string[]) => feats.filter(f => f.startsWith('country:')).map(f => f.slice(8));
const stateOf = (actor: string) => actor.split('/')[0];

const ops = [...a.events.values()].filter((e: any) => !isMetaEvent(e)).map((e: any) => ({
  date: (e.start_date || e.disclosure_date || '').slice(0, 10),
  actors: [...actorsOfEvent(e)], feats: targetFeatures(e),
})).filter((e: any) => e.actors.length && e.feats.length && e.date);
const train = ops.filter((e: any) => e.date <= SPLIT);
const test = ops.filter((e: any) => e.date > SPLIT);

const aBase: Record<string, number> = {};                          // recency prior
const aFeat: Record<string, Record<string, number>> = {};          // flat counts (v1/affinity)
const aFeatW: Record<string, Record<string, number>> = {};         // recency-weighted (v2)
const aTot: Record<string, number> = {}, aTotW: Record<string, number> = {};
const dyad: Record<string, Record<string, number>> = {};           // state -> country -> recency wt
const sTot: Record<string, number> = {};
const vocab = new Set<string>(), cVocab = new Set<string>();
for (const e of train) {
  const w = Math.pow(0.5, (SPLIT_Y - +e.date.slice(0, 4)) / HALF_LIFE);
  const cs = countriesOf(e.feats);
  for (const ac of e.actors) {
    aBase[ac] = (aBase[ac] || 0) + w; aFeat[ac] ??= {}; aFeatW[ac] ??= {};
    for (const f of e.feats) { aFeat[ac][f] = (aFeat[ac][f] || 0) + 1; aFeatW[ac][f] = (aFeatW[ac][f] || 0) + w; aTot[ac] = (aTot[ac] || 0) + 1; aTotW[ac] = (aTotW[ac] || 0) + w; vocab.add(f); }
    const st = stateOf(ac); dyad[st] ??= {};
    for (const c of cs) { dyad[st][c] = (dyad[st][c] || 0) + w; sTot[st] = (sTot[st] || 0) + w; cVocab.add(c); }
  }
}
const actors = Object.keys(aBase), V = vocab.size, Vc = cVocab.size;
const totBase = Object.values(aBase).reduce((x, y) => x + y, 0);

const rankPopularity = (_f: string[]) => actors.slice().sort((x, y) => aBase[y] - aBase[x]);
const rankAffinity = (feats: string[]) => actors.map(ac => [ac, feats.reduce((s, f) => s + (aFeat[ac]?.[f] || 0), 0)] as [string, number]).sort((x, y) => y[1] - x[1]).map(x => x[0]);
const rankV1 = (feats: string[]) => actors.map(ac => {
  let s = Math.log(aBase[ac] / totBase); const t = aTot[ac] || 0;
  for (const f of feats) s += Math.log(((aFeat[ac]?.[f] || 0) + ALPHA) / (t + ALPHA * V));
  return [ac, s] as [string, number];
}).sort((x, y) => y[1] - x[1]).map(x => x[0]);
const rankV2 = (feats: string[]) => {
  const cs = countriesOf(feats);
  return actors.map(ac => {
    let s = Math.log(aBase[ac] / totBase); const t = aTotW[ac] || 0;
    for (const f of feats) s += Math.log(((aFeatW[ac]?.[f] || 0) + ALPHA) / (t + ALPHA * V));
    const st = stateOf(ac), st_t = sTot[st] || 0;
    for (const c of cs) s += BETA_DYAD * Math.log(((dyad[st]?.[c] || 0) + ALPHA) / (st_t + ALPHA * Vc));
    return [ac, s] as [string, number];
  }).sort((x, y) => y[1] - x[1]).map(x => x[0]);
};

const K = [1, 3, 5, 10];
const evalR = (rank: (f: string[]) => string[], rankableOnly: boolean) => {
  let n = 0; const hit: Record<number, number> = { 1: 0, 3: 0, 5: 0, 10: 0 };
  for (const e of test) {
    if (rankableOnly && !e.actors.some((ac: string) => aBase[ac])) continue;
    n++; const r = rank(e.feats);
    for (const k of K) if (r.slice(0, k).some((ac: string) => e.actors.includes(ac))) hit[k]++;
  }
  return `n=${String(n).padStart(3)}  ` + K.map(k => `top-${k} ${(100 * hit[k] / n).toFixed(1).padStart(5)}%`).join('  ');
};

const rankableN = test.filter((e: any) => e.actors.some((ac: string) => aBase[ac])).length;
console.log(`\n===== FORECAST v2 — temporal forward-validation (train <= ${SPLIT}) =====`);
console.log(`train ${train.length} | test ${test.length} | rankable ${rankableN} | actors ${actors.length} | random top-5 ~${(100 * 5 / actors.length).toFixed(1)}%`);
for (const [label, ro] of [['ALL test (cold-start=miss)', false], ['RANKABLE subset', true]] as const) {
  console.log(`\n-- ${label} --`);
  console.log(`  Popularity      ${evalR(rankPopularity, ro)}`);
  console.log(`  Affinity (flat) ${evalR(rankAffinity, ro)}`);
  console.log(`  Model v1        ${evalR(rankV1, ro)}`);
  console.log(`  Model v2 (+ctx) ${evalR(rankV2, ro)}`);
}
