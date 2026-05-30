/**
 * /api/search-index.json — flat, lightweight search index over atlas entities.
 *
 * Powers the client-side search on /search. Unlike Pagefind (which indexes the
 * built HTML and is therefore unavailable under `pnpm dev`), this endpoint is
 * served by Astro in BOTH dev and production, so search works everywhere. It is
 * entity-level (titles, aliases, dates, summaries) rather than full-page text.
 */
import type { APIRoute } from 'astro';
import { atlas } from '../../utils/atlas';

interface IndexRec {
  t: string; // type label: event | actor | doctrine | pillar | service | sector | state
  id: string;
  title: string; // primary display
  sub?: string; // secondary line (date / short_name / kind)
  url: string; // link target
  hay: string; // lowercased search haystack
}

export const GET: APIRoute = () => {
  const a = atlas();
  const recs: IndexRec[] = [];
  const add = (r: Omit<IndexRec, 'hay'>, extra = '') => {
    recs.push({ ...r, hay: `${r.title} ${r.sub ?? ''} ${extra}`.toLowerCase() });
  };

  for (const ev of a.events.values()) {
    const date = (ev.start_date ?? ev.disclosure_date ?? '').slice(0, 10);
    add(
      { t: 'event', id: ev.id, title: ev.name, sub: date || undefined, url: `/event/${ev.id}` },
      `${ev.summary ?? ''} ${ev.outcome_summary ?? ''}`,
    );
  }
  for (const ac of a.actors.values()) {
    const aliases = (ac.aliases ?? []).map((x) => x.alias).filter(Boolean).join(' ');
    add(
      { t: 'actor', id: ac.id, title: ac.canonical_name, sub: aliases.slice(0, 70) || undefined, url: `/actor/${ac.id}` },
      aliases,
    );
  }
  for (const d of a.doctrines.values()) {
    const sub = d.short_name && d.short_name !== d.name ? d.short_name : d.nation_state_id.toUpperCase();
    add({ t: 'doctrine', id: d.id, title: d.name, sub, url: `/doctrine/${d.id}` }, `${d.short_name ?? ''} ${d.nation_state_id}`);
  }
  for (const { pillar, doctrineId } of a.pillars.values()) {
    add({ t: 'pillar', id: pillar.id, title: pillar.name, sub: 'pillar', url: `/doctrine/${doctrineId}` });
  }
  for (const s of a.services.values()) {
    add({ t: 'service', id: s.id, title: s.name, sub: s.nation_state_id.toUpperCase(), url: `/service/${s.id}` });
  }
  for (const sec of a.sectors.values()) {
    add({ t: 'sector', id: sec.id, title: sec.name, sub: 'sector', url: `/sector/${sec.id}` });
  }
  for (const ns of a.nationStates.values()) {
    add({ t: 'state', id: ns.id, title: ns.name, sub: ns.short_name || 'state', url: `/state/${ns.id}` });
  }

  return new Response(JSON.stringify({ generated_at: new Date().toISOString(), count: recs.length, records: recs }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};
