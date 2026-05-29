/**
 * /api/atlas.json — full atlas dump as a single JSON document.
 *
 * Generated at build time. Intended for analyst tooling (Jupyter,
 * custom dashboards, ad-hoc scripts) that wants the corpus without
 * re-parsing 1,200+ YAML files. Read-only; canonical source remains
 * the atlas/ YAML tree.
 */
import type { APIRoute } from 'astro';
import { atlas } from '../../utils/atlas';

export const GET: APIRoute = () => {
  const a = atlas();
  const stats = a.stats();
  const payload = {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    counts: stats,
    nation_states: [...a.nationStates.values()],
    services: [...a.services.values()],
    doctrines: [...a.doctrines.values()],
    actors: [...a.actors.values()],
    events: [...a.events.values()],
    sources: [...a.sources.values()],
    timeline_markers: [...a.timelineMarkers.values()],
    sectors: [...a.sectors.values()],
    policy_actions: [...a.policyActions.values()],
    // Malware-lineage table — dedupe entries (each alias points at the same family).
    malwareLineage: (() => {
      const seen = new Set<unknown>();
      const out: unknown[] = [];
      for (const fam of a.malwareLineage.values()) {
        if (seen.has(fam)) continue;
        seen.add(fam);
        out.push(fam);
      }
      return out;
    })(),
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      // Allow analyst tools / notebooks to fetch cross-origin.
      'access-control-allow-origin': '*',
    },
  });
};
