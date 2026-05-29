/**
 * AUSPEX atlas loader (fs side).
 *
 * Reads YAML files from ../atlas/ at build time / dev-server module init,
 * builds the loaded-data bundle, and constructs the pure `Atlas` class
 * (defined in ./atlas-core). Exposes the `atlas()` singleton used by
 * Astro pages and tsx tools.
 *
 * Everything else — the type interfaces, the `Atlas` class, the runtime
 * helpers (eventStateId, markerDisplayName, …), and `atlasFromPayload` —
 * lives in ./atlas-core and is RE-EXPORTED here so the ~40 existing
 * `import { ... } from './atlas'` call sites keep working unchanged.
 *
 * The loader is defensive (never throws on a malformed entry, only warns
 * to stderr).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { inferCampaigns } from './inferred-campaigns';
import {
  Atlas,
  type AtlasData,
  type Actor,
  type MalwareLineageEntry,
  type NationState,
  type Service,
  type Doctrine,
  type AuspexEvent,
  type Source,
  type TimelineMarker,
  type Sector,
  type PolicyAction,
  type Target,
} from './atlas-core';

// Re-export the entire pure core so existing `from './atlas'` imports
// (types, the Atlas class, helpers, atlasFromPayload) keep resolving.
export * from './atlas-core';

/**
 * Locate the atlas/ directory. Tries multiple resolution strategies so this
 * works in (a) Astro dev, (b) Astro static build, (c) tsx-run tools.
 * - First tries the path relative to this module file (dev mode + tsx).
 * - Then walks up from process.cwd() looking for atlas/.
 */
function findAtlasRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidateFromHere = resolve(here, '../../../atlas');
  if (existsSync(candidateFromHere)) return candidateFromHere;

  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const c = resolve(dir, 'atlas');
    if (existsSync(c)) return c;
    const up = resolve(dir, '..');
    if (up === dir) break;
    dir = up;
  }
  // Last-ditch: assume the canonical AUSPEX layout (site/ is sibling of atlas/).
  return resolve(process.cwd(), '../atlas');
}

export const ATLAS_ROOT = findAtlasRoot();

// ───────── loader ─────────

function* walkYaml(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e);
    const s = statSync(full);
    if (s.isDirectory()) yield* walkYaml(full);
    else if (e.endsWith('.yaml') || e.endsWith('.yml')) yield full;
  }
}

// CORE_SCHEMA keeps bool/null/int/float parsing but skips timestamp parsing,
// so ISO-shaped date strings like "2022-03-23" stay as strings rather than
// becoming Date objects. Every dossier and every event ID depends on this.
const YAML_OPTS = { schema: yaml.CORE_SCHEMA } as const;

function loadDir<T extends { id: string }>(sub: string): Map<string, T> {
  const map = new Map<string, T>();
  for (const path of walkYaml(join(ATLAS_ROOT, sub))) {
    try {
      const doc = yaml.load(readFileSync(path, 'utf8'), YAML_OPTS) as T | undefined;
      if (doc && typeof doc === 'object' && (doc as { id?: string }).id) {
        map.set((doc as { id: string }).id, doc);
      }
    } catch (err) {
      console.warn(`[atlas] failed to parse ${path}: ${(err as Error).message}`);
    }
  }
  return map;
}

function loadSectors(): Map<string, Sector> {
  const path = join(ATLAS_ROOT, 'sectors', 'sectors.yaml');
  try {
    const doc = yaml.load(readFileSync(path, 'utf8'), YAML_OPTS) as { sectors: Sector[] };
    return new Map(doc.sectors.filter((s) => s?.id).map((s) => [s.id, s]));
  } catch (err) {
    console.warn(`[atlas] failed to load sectors: ${(err as Error).message}`);
    return new Map();
  }
}

/**
 * Read the malware-lineage table (single file) into the two lookup Maps.
 */
function loadMalwareLineage(): {
  malwareLineage: Map<string, MalwareLineageEntry>;
  malwareLineageGroup: Map<string, string>;
} {
  const malwareLineage = new Map<string, MalwareLineageEntry>();
  const malwareLineageGroup = new Map<string, string>();
  try {
    const lineagePath = join(ATLAS_ROOT, 'malware-lineage.yaml');
    const doc = yaml.load(readFileSync(lineagePath, 'utf8'), YAML_OPTS) as { families?: MalwareLineageEntry[] } | undefined;
    for (const fam of doc?.families ?? []) {
      const lg = fam.lineage_group;
      for (const key of [fam.name, ...(fam.aliases ?? [])]) {
        if (!key) continue;
        const k = key.toLowerCase();
        malwareLineage.set(k, fam);
        if (lg) malwareLineageGroup.set(k, lg);
      }
    }
  } catch (err) {
    console.warn(`[atlas] malware-lineage.yaml unreadable: ${(err as Error).message}`);
  }
  return { malwareLineage, malwareLineageGroup };
}

/**
 * Inject MITRE ATT&CK techniques and malware per actor from the
 * extracted caches. Built by tools/extract-mitre-ttps.ts; if missing,
 * actors silently get nothing and the engines fall back.
 */
function injectMitreCaches(actors: Map<string, Actor>): void {
  const here = dirname(fileURLToPath(import.meta.url));
  function findCache(name: string): string | null {
    const candidates = [
      resolve(here, '..', '..', '.cache', name),
      resolve(process.cwd(), '.cache', name),
      resolve(process.cwd(), 'site', '.cache', name),
    ];
    return candidates.find((p) => existsSync(p)) ?? null;
  }
  try {
    const ttpPath = findCache('mitre-ttps.json');
    if (ttpPath) {
      const ttps = JSON.parse(readFileSync(ttpPath, 'utf8')) as Record<string, string[]>;
      for (const actor of actors.values()) {
        const g = actor.external_refs?.mitre_attack;
        if (g && ttps[g]) actor.mitre_techniques = ttps[g];
      }
    }
  } catch (err) {
    console.warn(`[atlas] failed to load mitre-ttps cache: ${(err as Error).message}`);
  }
  try {
    const malPath = findCache('mitre-malware.json');
    if (malPath) {
      const mal = JSON.parse(readFileSync(malPath, 'utf8')) as Record<string, string[]>;
      for (const actor of actors.values()) {
        const g = actor.external_refs?.mitre_attack;
        if (g && mal[g]) actor.mitre_malware = mal[g];
      }
    }
  } catch (err) {
    console.warn(`[atlas] failed to load mitre-malware cache: ${(err as Error).message}`);
  }
}

/** Read the full atlas/ tree from disk into the loaded-data bundle. */
function loadAtlasData(): AtlasData {
  const actors = loadDir<Actor>('actors');
  injectMitreCaches(actors);
  const { malwareLineage, malwareLineageGroup } = loadMalwareLineage();
  return {
    nationStates: loadDir<NationState>('nation-states'),
    services: loadDir<Service>('services'),
    doctrines: loadDir<Doctrine>('doctrines'),
    actors,
    events: loadDir<AuspexEvent>('events'),
    sources: loadDir<Source>('sources'),
    timelineMarkers: loadDir<TimelineMarker>('timeline-markers'),
    sectors: loadSectors(),
    policyActions: loadDir<PolicyAction>('policy-actions'),
    targets: loadDir<Target>('targets'),
    malwareLineage,
    malwareLineageGroup,
  };
}

// ───────── atlas singleton ─────────

let _atlas: Atlas | null = null;
export function atlas(): Atlas {
  if (!_atlas) {
    _atlas = new Atlas(loadAtlasData());
    _atlas.inferredCampaignByEvent = inferCampaigns(_atlas);
  }
  return _atlas;
}
