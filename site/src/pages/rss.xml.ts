import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { atlas, eventStateId } from '../utils/atlas';

export const GET: APIRoute = (context) => {
  const a = atlas();
  const events = a.recentEvents(50);
  const site = context.site?.toString() ?? 'https://auspex.blackflagintel.com';

  return rss({
    title: 'AUSPEX — Black Flag Intelligence',
    description:
      'Doctrine-tagged state-sponsored cyber events. The strategic frame behind the cyber news cycle.',
    site,
    items: events.map((ev) => {
      const state = eventStateId(ev, a);
      const stateLabel = state ? state.toUpperCase() : '??';
      const date = ev.start_date ?? ev.disclosure_date ?? '1970-01-01';
      const pubDate = new Date(date);
      const incidentTypes = (ev.incident_type ?? []).join(', ');
      const summary = ev.outcome_summary ?? ev.summary ?? '';
      const linkCount = (ev.doctrine_links ?? []).length;
      const attrCount = (ev.attributions ?? []).length;
      const description = `[${stateLabel}]${incidentTypes ? ` ${incidentTypes} ·` : ''} ${summary}\n\n${attrCount} attribution${attrCount === 1 ? '' : 's'} · ${linkCount} doctrine link${linkCount === 1 ? '' : 's'}`;
      return {
        title: ev.name,
        link: `/event/${ev.id}`,
        pubDate,
        description,
      };
    }),
    customData: '<language>en-us</language>',
  });
};
