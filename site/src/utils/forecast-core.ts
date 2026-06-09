/**
 * forecast-core.ts — pure, fs-free attack forecaster (isomorphic: server eval + browser /forecast).
 * Given a prospective TARGET profile (sectors/countries/orgs), rank likely actors + the doctrine
 * each would advance (who×why), a relative-risk percentile, and comparable historical events.
 * Uses ONLY forecast-available features (target side + state dyad + recency) — no TTP/malware/prose.
 * See docs/FORECASTING-2026-05-31.md. Validated temporally in tools/eval-forecast.ts.
 */
import type { Atlas, AuspexEvent } from './atlas-core';
import { isMetaEvent, isAttackerRationale } from './atlas-core';
import { actorsOfEvent } from './attribution';

const HALF_LIFE = 2, ALPHA = 0.5, BETA_DYAD = 1.0;

export interface TargetProfile { sectors: string[]; countries: string[]; orgs?: string[]; }
export interface ForecastActor { actorId: string; name: string; score: number; doctrine: { id: string; name: string } | null; }
export interface ForecastResult {
  riskPercentile: number; riskBand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'; comparableCount: number;
  actors: ForecastActor[];
  comparables: { date: string; actorId: string; name: string; title: string }[];
  basis: 'ok' | 'insufficient';
}

const stateOf = (ac: string) => ac.split('/')[0];

function topSector(atlas: Atlas, tid: string): string | null {
  let slug = tid.replace(/^sectors\//, '');
  while (slug && !atlas.sectors.has(slug)) { const i = slug.lastIndexOf('/'); if (i < 0) return null; slug = slug.slice(0, i); }
  if (!slug) return null;
  const top = atlas.sectorAncestors(slug)[0];
  return top ? top.id : null;
}
function eventFeats(atlas: Atlas, ev: AuspexEvent): string[] {
  const f = new Set<string>();
  for (const t of ev.targets ?? []) {
    const tid = (t as any).target_id || '';
    if (tid.startsWith('sectors/')) { const s = topSector(atlas, tid); if (s) f.add('sector:' + s); }
    else if (tid.startsWith('orgs/') || tid.startsWith('infra/')) f.add('tgt:' + tid);
    if ((t as any).country) f.add('country:' + String((t as any).country).toLowerCase());
  }
  return [...f];
}
const profileFeats = (p: TargetProfile): string[] => [
  ...p.sectors.map(s => 'sector:' + s.replace(/^sectors\//, '')),
  ...p.countries.map(c => 'country:' + c.toLowerCase()),
  ...(p.orgs ?? []).map(o => 'tgt:' + (o.startsWith('orgs/') ? o : 'orgs/' + o)),
];
const sectorsOf = (f: string[]) => f.filter(x => x.startsWith('sector:')).map(x => x.slice(7));
const countriesOf = (f: string[]) => f.filter(x => x.startsWith('country:')).map(x => x.slice(8));

export interface Forecaster { forecast(p: TargetProfile, topK?: number): ForecastResult; sectorOptions: string[]; countryOptions: string[]; }

export function buildForecaster(atlas: Atlas, opts: { asOf?: string; nowYear?: number } = {}): Forecaster {
  const nowYear = opts.nowYear ?? 2026;
  const recency = (date: string) => Math.pow(0.5, (nowYear - +date.slice(0, 4)) / HALF_LIFE);

  const events = [...atlas.events.values()]
    .filter((e) => !isMetaEvent(e))
    .map((e) => ({
      id: e.id, name: e.name, date: (e.start_date || e.disclosure_date || '').slice(0, 10),
      actors: [...actorsOfEvent(e)], feats: eventFeats(atlas, e),
      doctrines: (e.doctrine_links ?? []).filter(isAttackerRationale).map((d: any) => ({ id: d.doctrine_id, pillar: d.pillar_id })),
    }))
    .filter((e) => e.actors.length && e.feats.length && e.date && (!opts.asOf || e.date <= opts.asOf));

  const aBase: Record<string, number> = {}, aFeatW: Record<string, Record<string, number>> = {}, aTotW: Record<string, number> = {};
  const dyad: Record<string, Record<string, number>> = {}, sTot: Record<string, number> = {};
  const aEvents: Record<string, typeof events> = {};
  const vocab = new Set<string>(), cVocab = new Set<string>();
  const sectorOpts = new Set<string>(), countryOpts = new Set<string>();
  for (const e of events) {
    const w = recency(e.date), cs = countriesOf(e.feats);
    for (const s of sectorsOf(e.feats)) sectorOpts.add(s);
    for (const c of cs) countryOpts.add(c);
    for (const ac of e.actors) {
      aBase[ac] = (aBase[ac] || 0) + w; (aFeatW[ac] ??= {}); (aEvents[ac] ??= []).push(e);
      for (const f of e.feats) { aFeatW[ac][f] = (aFeatW[ac][f] || 0) + w; aTotW[ac] = (aTotW[ac] || 0) + w; vocab.add(f); }
      const st = stateOf(ac); (dyad[st] ??= {});
      for (const c of cs) { dyad[st][c] = (dyad[st][c] || 0) + w; sTot[st] = (sTot[st] || 0) + w; cVocab.add(c); }
    }
  }
  const actors = Object.keys(aBase), V = vocab.size, Vc = cVocab.size, totBase = Object.values(aBase).reduce((x, y) => x + y, 0);
  const allMatch = events.map((e) => matchScore(e.feats)).sort((x, y) => x - y);

  function matchScore(feats: string[]): number {
    const qs = new Set(sectorsOf(feats)), qc = new Set(countriesOf(feats)); let m = 0;
    for (const e of events) if (sectorsOf(e.feats).some((s) => qs.has(s)) && countriesOf(e.feats).some((c) => qc.has(c))) m += recency(e.date);
    return m;
  }
  function rationale(ac: string, feats: string[]): { id: string; name: string } | null {
    const qs = new Set(sectorsOf(feats)), qc = new Set(countriesOf(feats)); const tally: Record<string, number> = {};
    for (const e of aEvents[ac] ?? []) {
      const rel = (sectorsOf(e.feats).some((s) => qs.has(s)) || countriesOf(e.feats).some((c) => qc.has(c))) ? 2 : 1;
      for (const d of e.doctrines) if (d.id) tally[d.pillar || d.id] = (tally[d.pillar || d.id] || 0) + rel * recency(e.date);
    }
    const top = Object.entries(tally).sort((x, y) => y[1] - x[1])[0];
    if (!top) return null;
    const did = top[0].split('/').slice(0, 2).join('/');
    return { id: top[0], name: (atlas.doctrines.get(did) as any)?.name || did };
  }

  return {
    sectorOptions: [...sectorOpts].sort(),
    countryOptions: [...countryOpts].sort(),
    forecast(p: TargetProfile, topK = 6): ForecastResult {
      const feats = profileFeats(p);
      const qs = new Set(sectorsOf(feats)), qc = new Set(countriesOf(feats));
      const comps = events.filter((e) => sectorsOf(e.feats).some((s) => qs.has(s)) && countriesOf(e.feats).some((c) => qc.has(c)))
        .sort((x, y) => y.date.localeCompare(x.date));
      const m = matchScore(feats);
      const pctile = allMatch.length ? 100 * allMatch.filter((x) => x <= m).length / allMatch.length : 0;
      const band = pctile >= 90 ? 'CRITICAL' : pctile >= 70 ? 'HIGH' : pctile >= 40 ? 'MODERATE' : 'LOW';
      const ranked = actors.map((ac) => {
        let s = Math.log(aBase[ac] / totBase); const t = aTotW[ac] || 0;
        for (const f of feats) s += Math.log(((aFeatW[ac]?.[f] || 0) + ALPHA) / (t + ALPHA * V));
        const st = stateOf(ac), stt = sTot[st] || 0;
        for (const c of countriesOf(feats)) s += BETA_DYAD * Math.log(((dyad[st]?.[c] || 0) + ALPHA) / (stt + ALPHA * Vc));
        return { ac, s };
      }).sort((x, y) => y.s - x.s).slice(0, topK);
      return {
        riskPercentile: Math.round(pctile), riskBand: band, comparableCount: comps.length,
        basis: feats.some((f) => vocab.has(f)) || comps.length ? 'ok' : 'insufficient',
        actors: ranked.map((r) => ({
          actorId: r.ac, name: (atlas.actors.get(r.ac) as any)?.canonical_name || r.ac, score: r.s, doctrine: rationale(r.ac, feats),
        })),
        comparables: comps.slice(0, 5).map((e) => ({ date: e.date, actorId: e.actors[0], name: (atlas.actors.get(e.actors[0]) as any)?.canonical_name || e.actors[0], title: e.name })),
      };
    },
  };
}
