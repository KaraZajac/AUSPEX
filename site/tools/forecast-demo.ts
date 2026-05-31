/**
 * Forecast feature demo — full output on example target profiles.
 * Trains the v2 forecaster on the WHOLE corpus (deployment mode) and, for a query
 * target profile, returns: (1) BY WHOM — ranked likely actors; (2) WHY — the doctrine
 * each would advance against this target (the who x why join); (3) RELATIVE RISK — a
 * corpus-frequency percentile (NOT an absolute probability — no negatives exist);
 * (4) COMPARABLE EVENTS — historical anchors.
 *   pnpm exec tsx tools/forecast-demo.ts
 */
import { atlas } from '../src/utils/atlas.ts';
import { actorsOfEvent } from '../src/utils/attribution.ts';
import { isMetaEvent } from '../src/utils/atlas-core.ts';

const a: any = atlas();
const NOW_Y = 2026, HALF_LIFE = 2, ALPHA = 0.5, BETA = 1.0;
const recency = (date: string) => Math.pow(0.5, (NOW_Y - +date.slice(0, 4)) / HALF_LIFE);

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
const stateOf = (ac: string) => ac.split('/')[0];
const countriesOf = (f: string[]) => f.filter(x => x.startsWith('country:')).map(x => x.slice(8));
const sectorsOf = (f: string[]) => f.filter(x => x.startsWith('sector:')).map(x => x.slice(7));

// ---- train on all ops events ----
const events = [...a.events.values()].filter((e: any) => !isMetaEvent(e)).map((e: any) => ({
  id: e.id, name: e.name, date: (e.start_date || e.disclosure_date || '').slice(0, 10),
  actors: [...actorsOfEvent(e)], feats: targetFeatures(e),
  doctrines: (e.doctrine_links || []).map((d: any) => ({ id: d.doctrine_id, pillar: d.pillar_id })),
})).filter((e: any) => e.actors.length && e.feats.length && e.date);

const aBase: Record<string, number> = {}, aFeatW: Record<string, Record<string, number>> = {}, aTotW: Record<string, number> = {};
const dyad: Record<string, Record<string, number>> = {}, sTot: Record<string, number> = {};
const aEvents: Record<string, any[]> = {};
const vocab = new Set<string>(), cVocab = new Set<string>();
for (const e of events) {
  const w = recency(e.date), cs = countriesOf(e.feats);
  for (const ac of e.actors) {
    aBase[ac] = (aBase[ac] || 0) + w; aFeatW[ac] ??= {}; (aEvents[ac] ??= []).push(e);
    for (const f of e.feats) { aFeatW[ac][f] = (aFeatW[ac][f] || 0) + w; aTotW[ac] = (aTotW[ac] || 0) + w; vocab.add(f); }
    const st = stateOf(ac); dyad[st] ??= {};
    for (const c of cs) { dyad[st][c] = (dyad[st][c] || 0) + w; sTot[st] = (sTot[st] || 0) + w; cVocab.add(c); }
  }
}
const actors = Object.keys(aBase), V = vocab.size, Vc = cVocab.size, totBase = Object.values(aBase).reduce((x, y) => x + y, 0);

const score = (ac: string, feats: string[]) => {
  let s = Math.log(aBase[ac] / totBase); const t = aTotW[ac] || 0;
  for (const f of feats) s += Math.log(((aFeatW[ac]?.[f] || 0) + ALPHA) / (t + ALPHA * V));
  const st = stateOf(ac), st_t = sTot[st] || 0;
  for (const c of countriesOf(feats)) s += BETA * Math.log(((dyad[st]?.[c] || 0) + ALPHA) / (st_t + ALPHA * Vc));
  return s;
};

// ---- relative risk: recency-weighted count of corpus events sharing a sector AND a country ----
const matchScore = (feats: string[]) => {
  const qs = new Set(sectorsOf(feats)), qc = new Set(countriesOf(feats));
  let m = 0;
  for (const e of events) {
    if (sectorsOf(e.feats).some(s => qs.has(s)) && countriesOf(e.feats).some(c => qc.has(c))) m += recency(e.date);
  }
  return m;
};
const allMatch = events.map(e => matchScore(e.feats)).sort((x, y) => x - y);
const pct = (v: number) => 100 * allMatch.filter(x => x <= v).length / allMatch.length;
const band = (p: number) => p >= 90 ? 'CRITICAL' : p >= 70 ? 'HIGH' : p >= 40 ? 'MODERATE' : 'LOW';

// ---- doctrine rationale: actor's dominant doctrine among events matching the query ----
const rationale = (ac: string, feats: string[]) => {
  const qs = new Set(sectorsOf(feats)), qc = new Set(countriesOf(feats));
  const tally: Record<string, number> = {};
  for (const e of aEvents[ac]) {
    const rel = (sectorsOf(e.feats).some(s => qs.has(s)) || countriesOf(e.feats).some(c => qc.has(c))) ? 2 : 1;
    for (const d of e.doctrines) if (d.id) tally[d.pillar || d.id] = (tally[d.pillar || d.id] || 0) + rel * recency(e.date);
  }
  const top = Object.entries(tally).sort((x, y) => y[1] - x[1])[0];
  if (!top) return null;
  const did = top[0].split('/').slice(0, 2).join('/');
  const doc = a.doctrines.get(did);
  return { id: top[0], name: doc?.name || did };
};

const nm = (ac: string) => a.actors.get(ac)?.canonical_name || ac;

function forecast(label: string, feats: string[]) {
  console.log(`\n══════ TARGET: ${label} ══════`);
  console.log(`  profile: ${feats.join(', ')}`);
  const m = matchScore(feats), p = pct(m);
  const comps = events.filter(e => { const qs = new Set(sectorsOf(feats)), qc = new Set(countriesOf(feats)); return sectorsOf(e.feats).some(s => qs.has(s)) && countriesOf(e.feats).some(c => qc.has(c)); }).sort((x, y) => y.date.localeCompare(x.date));
  console.log(`  RELATIVE RISK: ${band(p)} (${p.toFixed(0)}th pctile of corpus attack frequency; ${comps.length} comparable events)`);
  const ranked = actors.map(ac => [ac, score(ac, feats)] as [string, number]).sort((x, y) => y[1] - x[1]).slice(0, 5);
  console.log(`  LIKELY ACTORS (by whom -> why):`);
  for (const [ac] of ranked) {
    const r = rationale(ac, feats);
    console.log(`    • ${nm(ac).slice(0, 38).padEnd(38)} ${r ? '— ' + r.name.slice(0, 44) + ' [' + r.id + ']' : '— (no doctrine on record)'}`);
  }
  console.log(`  COMPARABLE EVENTS:`);
  for (const e of comps.slice(0, 3)) console.log(`    – ${e.date}  ${nm(e.actors[0]).slice(0, 24).padEnd(24)} ${e.name.slice(0, 50)}`);
}

forecast('Taiwanese government agency', ['sector:government', 'country:tw']);
forecast('US electric-grid / ICS operator', ['sector:ics', 'sector:energy', 'country:us']);
forecast('Israeli defense / government', ['sector:defense', 'sector:government', 'country:il']);
forecast('Ukrainian energy utility', ['sector:energy', 'country:ua']);
forecast('European bank (Germany)', ['sector:finance', 'country:de']);
forecast('Indian government ministry', ['sector:government', 'country:in']);
