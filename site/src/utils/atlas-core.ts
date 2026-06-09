/**
 * AUSPEX atlas — PURE core (fs-free, isomorphic).
 *
 * Holds the type interfaces, the `Atlas` class (query methods, index
 * building, knownMalware), the standalone runtime helpers used by the
 * engines/eval, and `atlasFromPayload()` which reconstructs an Atlas
 * from the /api/atlas.json shape.
 *
 * This module MUST NOT import node:fs / node:path / node:url / js-yaml,
 * and must not transitively import anything that does. The fs loader and
 * the `atlas()` singleton live in ./atlas, which re-exports everything
 * here so the existing ~40 `from './atlas'` call sites keep working.
 *
 * Types are intentionally loose — the corpus is hand-curated and the
 * occasional optional field will be missing.
 */

// ───────── types ─────────

export interface NationState {
  id: string;
  name: string;
  short_name?: string;
  summary?: string;
}

export interface Service {
  id: string;
  nation_state_id: string;
  name: string;
  short_name?: string;
  aliases?: string[];
  parent_service_id?: string | null;
  active_since?: string;
  active_until?: string | null;
  mission?: string;
  summary?: string;
  sources?: string[];
}

export interface DoctrineProgram {
  id: string;
  name: string;
  summary?: string;
  active_period?: { start?: string; end?: string | null };
  sources?: string[];
}

export interface DoctrinePillar {
  id: string;
  name: string;
  summary?: string;
  target_sectors?: string[];
  key_terms?: string[];
  programs?: DoctrineProgram[];
}

export interface Doctrine {
  id: string;
  nation_state_id: string;
  name: string;
  short_name?: string;
  issued_by?: string;
  issued_on?: string;
  status?: string;
  superseded_by_id?: string | null;
  inherits_from_ids?: string[];
  official_text_url?: string | null;
  summary?: string;
  cyber_relevance?: string;
  pillars?: DoctrinePillar[];
  sources?: string[];
}

export interface ActorAlias {
  alias: string;
  assigning_org?: string;
  confidence?: string;
  note?: string;
}

export interface ExternalRefs {
  /** MITRE ATT&CK Groups ID, e.g. "G0032" (Lazarus). */
  mitre_attack?: string;
  /** MISP Galaxy threat-actor cluster UUID, e.g. "68391641-859f-4a9a-9a1e-3e5cf71ec376". */
  misp_galaxy?: string;
  /** MISP Galaxy canonical name (used to build deep-link URL). */
  misp_galaxy_name?: string;
  /** ETDA / ThaiCERT APT card slug. */
  etda_apt?: string;
  /** Malpedia actor slug. */
  malpedia?: string;
  /** AlienVault OTX correlation ID. */
  otx?: string;
}

export interface Actor {
  id: string;
  primary_service_id?: string | null;
  additional_service_ids?: string[];
  canonical_name: string;
  aliases?: ActorAlias[];
  active_since?: string;
  active_until?: string | null;
  status?: string;
  mission?: string[];
  target_sector_ids?: string[];
  ttp_summary?: string;
  default_doctrine_alignment_ids?: string[];
  sources?: string[];
  summary?: string;
  /** Cross-references to external naming registries. See ExternalRefs. */
  external_refs?: ExternalRefs;
  /**
   * MITRE ATT&CK techniques attributed to this actor. Populated at
   * load time from .cache/mitre-ttps.json via external_refs.mitre_attack.
   * Not present in the YAML — derived at runtime.
   */
  mitre_techniques?: string[];
  /**
   * Malware-family names attributed to this actor by MITRE ATT&CK
   * (lowercase). Populated at load time from .cache/mitre-malware.json
   * via external_refs.mitre_attack.
   */
  mitre_malware?: string[];
}

export interface DoctrineLink {
  doctrine_id?: string;
  pillar_id?: string;
  program_id?: string;
  confidence: string;
  reasoning?: string;
  attesting_source_id?: string | null;
  counter_explanation?: string | null;
  contested?: boolean;
  analyst?: string;
  /** Whose doctrine the link names, relative to the operation it explains.
   *  Absent = 'attacker-rationale' (the conducting party's why — the default
   *  who×why semantics). 'defender-response' = the discloser/prosecutor's
   *  doctrine on an event documenting someone else's operation (e.g. UK NCS
   *  on a Sandworm advisory). 'victim-response' = the victim state's doctrine
   *  (the event's effect on / mirror of it, e.g. Stuxnet → Iran's asymmetric
   *  doctrine). Only attacker-rationale links participate in engine training,
   *  eval label sets, and attacker-state derivation. */
  perspective?: 'attacker-rationale' | 'victim-response' | 'defender-response';
}

/** True iff a doctrine link carries the default who×why semantics (the
 *  conducting party's strategic rationale). Engine training, eval labels,
 *  and state derivation must filter on this. */
export function isAttackerRationale(link: DoctrineLink): boolean {
  return !link.perspective || link.perspective === 'attacker-rationale';
}

export interface Attribution {
  actor_id?: string | null;
  /**
   * Optional service-level attribution. Set when the attributing source
   * named a service (IRGC, MOIS, FSB Center 18, Office 39) without naming
   * a specific actor cluster. Either or both of actor_id/service_id may
   * be populated; either or both may be null. attributing_org is always
   * required.
   */
  service_id?: string | null;
  attributing_org: string;
  attributing_org_confidence?: string;
  auspex_assessment?: string;
  attribution_date?: string;
  attribution_source_id?: string;
  notes?: string;
}

export interface EventTarget {
  target_id: string;
  /** ISO-3166 alpha-2 country code (lowercase). Multi-country campaigns
   *  may use a dashed compound like "uk-us-canada". Optional. */
  country?: string;
  role?: string;
  outcome?: string;
}

export interface AnticipatedMarker {
  marker_id: string;
  confidence?: string;
  reasoning?: string;
}

export interface AuspexEvent {
  id: string;
  name: string;
  start_date?: string;
  disclosure_date?: string;
  end_date?: string | null;
  incident_type?: string[];
  initial_vector?: string;
  outcome_summary?: string;
  quantified_impact?: Record<string, unknown>;
  false_flag_risk?: string;
  /** Optional campaign cluster id linking this event to others in the
   *  same operational thread (e.g., "olympic-games", "solarwinds-chain",
   *  "hermetic-wave-feb-2022"). Editorial — only set when public
   *  reporting explicitly links the events as one campaign. */
  campaign_id?: string;
  /** Indictment-named individual operators (slug `<surname>-<given>`).
   *  The sharpest cross-event link possible — a named human persists
   *  across actor rebrands, agency reorgs, and tool migration. Only
   *  set when primary sources (indictments, OFAC designations, named-
   *  defendant court docs) name the individual. */
  operators_named?: string[];
  summary?: string;
  attributions?: Attribution[];
  doctrine_links?: DoctrineLink[];
  anticipated_timeline_markers?: AnticipatedMarker[];
  targets?: EventTarget[];
  sources?: string[];
}

export interface Source {
  id: string;
  kind?: string;
  publisher?: string;
  title?: string;
  url?: string;
  archive_url?: string;
  published_on?: string;
  retrieved_on?: string;
  tier?: string;
  notes?: string;
}

export interface PolicyAction {
  id: string;
  issued_by_state_id: string;          // 'us', 'multilateral', etc.
  targets_state_ids?: string[];
  action_type: string;                  // sanction | indictment | export-control | etc.
  date: string;
  date_range?: { start?: string; end?: string };
  summary?: string;
  official_url?: string | null;
  significance?: 'high' | 'medium' | 'low' | string;
  confidence?: 'confirmed' | 'scheduled' | 'projected' | string;
  sources?: string[];
  notes?: string;
}

export interface TimelineMarker {
  id: string;
  name?: string;
  doctrine_id?: string;
  date?: string | { start?: string; end?: string };
  date_range?: { start?: string; end?: string };
  description?: string;
  cited_by?: string[];
}

/** Derive a short display name from a marker, falling back to a humanized slug tail. */
export function markerDisplayName(m: TimelineMarker): string {
  if (m.name) return m.name;
  const tail = m.id.split('/').slice(-1)[0] ?? m.id;
  return tail
    .split('-')
    .map((s) => s.length > 3 ? s[0].toUpperCase() + s.slice(1) : s.toUpperCase())
    .join(' ');
}

export interface Sector {
  id: string;
  name: string;
  parent_id?: string | null;
  summary?: string;
}

export interface Target {
  /** Canonical id — matches the `target_id` used in event.targets[]
   *  rows. e.g. "orgs/saudi-aramco", "infra/ukraine-power-grid". */
  id: string;
  name: string;
  nation_state_id?: string;
  sector_id?: string;
  tech_focus?: string[];
  criticality?: 'national-cii' | 'regional-cii' | 'commercial' | 'civil-society' | string;
  summary?: string;
  sources?: string[];
}

/** Single entry in the malware-lineage table. */
export interface MalwareLineageEntry {
  name: string;          // canonical ALL-CAPS family name
  aliases?: string[];
  parent?: string | null;
  lineage_group?: string;
  confidence?: 'high' | 'moderate' | 'low' | string;
  source?: string;
  summary?: string;
}

/**
 * Already-loaded atlas data. The fs loader (./atlas) and the
 * payload reconstructor (atlasFromPayload) both produce this shape
 * and hand it to the Atlas constructor. Actors carry their MITRE
 * `mitre_techniques` / `mitre_malware` already injected.
 */
export interface AtlasData {
  nationStates: Map<string, NationState>;
  services: Map<string, Service>;
  doctrines: Map<string, Doctrine>;
  actors: Map<string, Actor>;
  events: Map<string, AuspexEvent>;
  sources: Map<string, Source>;
  timelineMarkers: Map<string, TimelineMarker>;
  sectors: Map<string, Sector>;
  policyActions: Map<string, PolicyAction>;
  targets: Map<string, Target>;
  /** Lowercase malware name (canonical or alias) → lineage entry. */
  malwareLineage: Map<string, MalwareLineageEntry>;
  /** Lowercase malware name → its lineage_group id. */
  malwareLineageGroup: Map<string, string>;
}

// ───────── atlas ─────────

export class Atlas {
  readonly nationStates: Map<string, NationState>;
  readonly services: Map<string, Service>;
  readonly doctrines: Map<string, Doctrine>;
  readonly actors: Map<string, Actor>;
  readonly events: Map<string, AuspexEvent>;
  readonly sources: Map<string, Source>;
  readonly timelineMarkers: Map<string, TimelineMarker>;
  readonly sectors: Map<string, Sector>;
  readonly policyActions: Map<string, PolicyAction>;
  readonly targets: Map<string, Target>;
  /** Lowercase malware name (canonical or alias) → lineage entry. */
  readonly malwareLineage: Map<string, MalwareLineageEntry>;
  /** Lowercase malware name → its lineage_group id. */
  readonly malwareLineageGroup: Map<string, string>;
  /** event_id → inferred-campaign cluster id. Populated post-construction
   *  from temporal+target+malware+TTP overlap. Events with explicit
   *  `campaign_id` are excluded (the editorial tag takes precedence). */
  inferredCampaignByEvent: Map<string, string> = new Map();

  readonly pillars = new Map<string, { pillar: DoctrinePillar; doctrineId: string }>();
  readonly programs = new Map<string, { program: DoctrineProgram; pillarId: string; doctrineId: string }>();

  /** Union of all malware-family names attached to any actor (lowercase). Used for event-side regex extraction. */
  readonly knownMalware = new Set<string>();

  private _eventsByDoctrine = new Map<string, Set<string>>();
  private _eventsByPillar = new Map<string, Set<string>>();
  private _eventsByProgram = new Map<string, Set<string>>();
  private _eventsByActor = new Map<string, Set<string>>();
  private _eventsBySector = new Map<string, Set<string>>();
  private _eventsByMarker = new Map<string, Set<string>>();
  private _actorsByService = new Map<string, Set<string>>();
  private _actorsByDoctrine = new Map<string, Set<string>>();
  private _markersByDoctrine = new Map<string, Set<string>>();

  /**
   * Build an Atlas from already-loaded data. The data Maps are taken by
   * reference (not copied). Actors are expected to already carry their
   * injected `mitre_techniques` / `mitre_malware`; this constructor only
   * derives `knownMalware`, the pillar/program tables, and the inverted
   * indices.
   */
  constructor(data: AtlasData) {
    this.nationStates = data.nationStates;
    this.services = data.services;
    this.doctrines = data.doctrines;
    this.actors = data.actors;
    this.events = data.events;
    this.sources = data.sources;
    this.timelineMarkers = data.timelineMarkers;
    this.sectors = data.sectors;
    this.policyActions = data.policyActions;
    this.targets = data.targets;
    this.malwareLineage = data.malwareLineage;
    this.malwareLineageGroup = data.malwareLineageGroup;

    // Derive knownMalware from actors' (already-injected) MITRE malware.
    // Skip 1-2 char names that would false-match aggressively.
    for (const actor of this.actors.values()) {
      for (const name of actor.mitre_malware ?? []) {
        if (name.length >= 3) this.knownMalware.add(name);
      }
    }

    // Pillars & programs from nested doctrine entries.
    for (const doctrine of this.doctrines.values()) {
      for (const pillar of doctrine.pillars ?? []) {
        if (pillar?.id) {
          this.pillars.set(pillar.id, { pillar, doctrineId: doctrine.id });
          for (const program of pillar.programs ?? []) {
            if (program?.id) {
              this.programs.set(program.id, {
                program,
                pillarId: pillar.id,
                doctrineId: doctrine.id,
              });
            }
          }
        }
      }
    }

    // Event → doctrine / actor / sector / marker indices.
    for (const event of this.events.values()) {
      for (const link of event.doctrine_links ?? []) {
        if (link.doctrine_id) this._add(this._eventsByDoctrine, link.doctrine_id, event.id);
        if (link.pillar_id) {
          this._add(this._eventsByPillar, link.pillar_id, event.id);
          const p = this.pillars.get(link.pillar_id);
          if (p) this._add(this._eventsByDoctrine, p.doctrineId, event.id);
        }
        if (link.program_id) {
          this._add(this._eventsByProgram, link.program_id, event.id);
          const pg = this.programs.get(link.program_id);
          if (pg) {
            this._add(this._eventsByPillar, pg.pillarId, event.id);
            this._add(this._eventsByDoctrine, pg.doctrineId, event.id);
          }
        }
      }
      for (const attr of event.attributions ?? []) {
        if (attr.actor_id) this._add(this._eventsByActor, attr.actor_id, event.id);
      }
      for (const t of event.targets ?? []) {
        if (t.target_id?.startsWith('sectors/')) {
          this._add(this._eventsBySector, t.target_id.replace(/^sectors\//, ''), event.id);
        }
      }
      for (const m of event.anticipated_timeline_markers ?? []) {
        if (m.marker_id) this._add(this._eventsByMarker, m.marker_id, event.id);
      }
    }

    // Actor → service, actor → doctrine.
    for (const actor of this.actors.values()) {
      if (actor.primary_service_id) {
        this._add(this._actorsByService, actor.primary_service_id, actor.id);
      }
      for (const sid of actor.additional_service_ids ?? []) {
        this._add(this._actorsByService, sid, actor.id);
      }
      for (const did of actor.default_doctrine_alignment_ids ?? []) {
        this._add(this._actorsByDoctrine, did, actor.id);
        // Also expose under containing doctrine if did is a pillar/program
        const p = this.pillars.get(did);
        if (p) this._add(this._actorsByDoctrine, p.doctrineId, actor.id);
        const pg = this.programs.get(did);
        if (pg) this._add(this._actorsByDoctrine, pg.doctrineId, actor.id);
      }
    }

    // Marker → doctrine.
    for (const m of this.timelineMarkers.values()) {
      if (m.doctrine_id) this._add(this._markersByDoctrine, m.doctrine_id, m.id);
    }
  }

  private _add<K, V>(m: Map<K, Set<V>>, k: K, v: V): void {
    let s = m.get(k);
    if (!s) {
      s = new Set();
      m.set(k, s);
    }
    s.add(v);
  }

  // ───────── public queries ─────────

  eventsForDoctrine(id: string): AuspexEvent[] {
    return this._resolve(this._eventsByDoctrine.get(id), this.events).sort(byStartDateDesc);
  }
  eventsForPillar(id: string): AuspexEvent[] {
    return this._resolve(this._eventsByPillar.get(id), this.events).sort(byStartDateDesc);
  }
  eventsForProgram(id: string): AuspexEvent[] {
    return this._resolve(this._eventsByProgram.get(id), this.events).sort(byStartDateDesc);
  }
  eventsForActor(id: string): AuspexEvent[] {
    return this._resolve(this._eventsByActor.get(id), this.events).sort(byStartDateDesc);
  }
  eventsForSector(sectorSlug: string): AuspexEvent[] {
    return this._resolve(this._eventsBySector.get(sectorSlug), this.events).sort(byStartDateDesc);
  }
  eventsForMarker(id: string): AuspexEvent[] {
    return this._resolve(this._eventsByMarker.get(id), this.events).sort(byStartDateDesc);
  }
  actorsForService(id: string): Actor[] {
    return this._resolve(this._actorsByService.get(id), this.actors);
  }
  actorsForDoctrine(id: string): Actor[] {
    return this._resolve(this._actorsByDoctrine.get(id), this.actors);
  }
  markersForDoctrine(id: string): TimelineMarker[] {
    return this._resolve(this._markersByDoctrine.get(id), this.timelineMarkers);
  }
  doctrinesForState(stateId: string): Doctrine[] {
    return [...this.doctrines.values()]
      .filter((d) => d.nation_state_id === stateId)
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }
  actorsForState(stateId: string): Actor[] {
    return [...this.actors.values()].filter((a) => {
      const svc = a.primary_service_id;
      if (svc) return svc.split('/')[0] === stateId;
      // No service: fall back to the actor id's head (so null-service
      // <state>/proxies/* actors appear on their state's page — previously the
      // Russia page omitted LockBit/ALPHV while evals counted them as RU).
      return a.id.split('/')[0] === stateId;
    });
  }
  servicesForState(stateId: string): Service[] {
    return [...this.services.values()].filter((s) => s.nation_state_id === stateId);
  }
  allEventsSorted(): AuspexEvent[] {
    return [...this.events.values()].sort(byStartDateDesc);
  }

  /** Direct child services of the given service. */
  childServices(serviceId: string): Service[] {
    return [...this.services.values()]
      .filter((s) => s.parent_service_id === serviceId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Recursively gather all actors under a service and its descendants. */
  actorsForServiceRecursive(serviceId: string): Actor[] {
    const seen = new Set<string>();
    const out: Actor[] = [];
    const visit = (sid: string): void => {
      if (seen.has(sid)) return;
      seen.add(sid);
      for (const a of this.actorsForService(sid)) {
        if (!out.find((x) => x.id === a.id)) out.push(a);
      }
      for (const child of this.childServices(sid)) visit(child.id);
    };
    visit(serviceId);
    return out;
  }

  /** Direct child sectors of the given sector slug. */
  childSectors(sectorId: string): Sector[] {
    return [...this.sectors.values()]
      .filter((s) => s.parent_id === sectorId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Top-level (parentless) sectors. */
  rootSectors(): Sector[] {
    return [...this.sectors.values()]
      .filter((s) => !s.parent_id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Walk ancestors of a sector — root first, self last. */
  sectorAncestors(sectorId: string): Sector[] {
    const chain: Sector[] = [];
    let cur: Sector | undefined = this.sectors.get(sectorId);
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent_id ? this.sectors.get(cur.parent_id) : undefined;
    }
    return chain;
  }

  /** Actors that have this sector listed in their target_sector_ids. */
  actorsForTargetSector(sectorId: string): Actor[] {
    return [...this.actors.values()]
      .filter((a) => (a.target_sector_ids ?? []).includes(sectorId))
      .sort((a, b) => a.canonical_name.localeCompare(b.canonical_name));
  }

  /** Doctrines whose pillars list this sector as a target. */
  doctrinesForTargetSector(sectorId: string): Doctrine[] {
    return [...this.doctrines.values()]
      .filter((d) => (d.pillars ?? []).some((p) => (p.target_sectors ?? []).includes(sectorId)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Most-recent events (by start_date), capped. */
  recentEvents(n: number): AuspexEvent[] {
    return this.allEventsSorted().slice(0, n);
  }

  /** Events whose attacking state derives to this state id. */
  eventsForState(stateId: string): AuspexEvent[] {
    return this.allEventsSorted().filter((ev) => eventStateId(ev, this) === stateId);
  }

  /** Events whose targets[] include the given ISO-3166-1 alpha-2 country code. */
  eventsTargetingCountry(iso2: string): AuspexEvent[] {
    const lc = iso2.toLowerCase();
    return this.allEventsSorted().filter((ev) =>
      (ev.targets ?? []).some((t) => (t.country ?? '').toLowerCase() === lc),
    );
  }

  /** Top target countries for a given attacking state, ranked by event count. */
  topTargetCountriesForState(stateId: string, limit = 8): Array<{ country: string; count: number }> {
    const events = this.eventsForState(stateId);
    const counts = new Map<string, number>();
    for (const ev of events) {
      const seen = new Set<string>();
      for (const t of ev.targets ?? []) {
        const c = (t.country ?? '').toLowerCase();
        if (!c || seen.has(c)) continue;
        seen.add(c);
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /** Histogram of all target-country mentions across the corpus. */
  targetCountryCounts(): Map<string, number> {
    const counts = new Map<string, number>();
    for (const ev of this.events.values()) {
      const seen = new Set<string>();
      for (const t of ev.targets ?? []) {
        const c = (t.country ?? '').toLowerCase();
        if (!c || seen.has(c)) continue;
        seen.add(c);
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }
    }
    return counts;
  }

  /** Top doctrines for a state, ranked by event-link count. */
  topDoctrinesForState(stateId: string, limit = 10): Array<{ doctrine: Doctrine; count: number }> {
    return this.doctrinesForState(stateId)
      .map((d) => ({ doctrine: d, count: this.eventsForDoctrine(d.id).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /** Top actors for a state, ranked by attributed-event count. */
  topActorsForState(stateId: string, limit = 12): Array<{ actor: Actor; count: number }> {
    return this.actorsForState(stateId)
      .map((act) => ({ actor: act, count: this.eventsForActor(act.id).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /** All distinct years present in the event corpus, sorted descending. */
  eventYears(): string[] {
    const set = new Set<string>();
    for (const ev of this.events.values()) {
      const y = (ev.start_date ?? ev.disclosure_date ?? '').slice(0, 4);
      if (y) set.add(y);
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }

  /** Events in a given year. */
  eventsInYear(year: string): AuspexEvent[] {
    return this.allEventsSorted().filter(
      (ev) => (ev.start_date ?? ev.disclosure_date ?? '').startsWith(year),
    );
  }

  /**
   * For a state: count distinct top-level sectors targeted by events
   * attributed to that state. Each event contributes once per top-level
   * sector it touches.
   */
  sectorAttributionForState(stateId: string): Array<{ id: string | null; name: string; count: number; percent: number }> {
    const events = this.eventsForState(stateId);
    const counts = new Map<string | null, number>();
    for (const ev of events) {
      const seen = new Set<string | null>();
      let hadSector = false;
      for (const t of ev.targets ?? []) {
        if (!t.target_id?.startsWith('sectors/')) continue;
        let slug = t.target_id.replace(/^sectors\//, '');
        // Walk back any country-qualifier tail.
        while (slug && !this.sectors.has(slug)) {
          const i = slug.lastIndexOf('/');
          if (i < 0) {
            slug = '';
            break;
          }
          slug = slug.slice(0, i);
        }
        if (!slug) continue;
        const top = this.sectorAncestors(slug)[0];
        if (!top) continue;
        hadSector = true;
        if (!seen.has(top.id)) {
          seen.add(top.id);
          counts.set(top.id, (counts.get(top.id) ?? 0) + 1);
        }
      }
      if (!hadSector) counts.set(null, (counts.get(null) ?? 0) + 1);
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    return [...counts.entries()]
      .map(([id, c]) => ({
        id,
        name: id ? (this.sectors.get(id)?.name ?? id) : 'No tagged sector',
        count: c,
        percent: total > 0 ? (c / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Event counts per pillar within a doctrine, with the doctrine-direct
   * count separated out. Returns sorted by count descending.
   */
  pillarBreakdownForDoctrine(doctrineId: string): Array<{ pillarId: string | null; pillarName: string; count: number; percent: number }> {
    const d = this.doctrines.get(doctrineId);
    if (!d) return [];
    const counts = new Map<string | null, number>();
    for (const p of d.pillars ?? []) {
      const c = this.eventsForPillar(p.id).length;
      counts.set(p.id, c);
    }
    // Direct-to-doctrine events (no pillar specified).
    let direct = 0;
    for (const ev of this.eventsForDoctrine(doctrineId)) {
      const linksHere = (ev.doctrine_links ?? []).some((l) => {
        if (l.doctrine_id === doctrineId && !l.pillar_id && !l.program_id) return true;
        return false;
      });
      if (linksHere) direct++;
    }
    if (direct > 0) counts.set(null, direct);
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    return [...counts.entries()]
      .filter(([, c]) => c > 0)
      .map(([id, c]) => {
        const pillar = id ? d.pillars?.find((p) => p.id === id) : undefined;
        return {
          pillarId: id,
          pillarName: pillar?.name ?? 'Doctrine-direct (no pillar)',
          count: c,
          percent: total > 0 ? (c / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  /** All descendant sector ids (does not include self). */
  descendantSectors(sectorId: string): string[] {
    const out: string[] = [];
    const visit = (id: string): void => {
      for (const child of this.childSectors(id)) {
        out.push(child.id);
        visit(child.id);
      }
    };
    visit(sectorId);
    return out;
  }

  /** Events tagged to this sector OR any descendant. Deduplicated. */
  eventsForSectorRecursive(sectorId: string): AuspexEvent[] {
    const ids = [sectorId, ...this.descendantSectors(sectorId)];
    const seen = new Set<string>();
    const out: AuspexEvent[] = [];
    for (const sid of ids) {
      for (const ev of this.eventsForSector(sid)) {
        if (!seen.has(ev.id)) {
          seen.add(ev.id);
          out.push(ev);
        }
      }
    }
    return out.sort((a, b) => (b.start_date ?? '').localeCompare(a.start_date ?? ''));
  }

  /**
   * For a sector (rolled up across descendants): count attributed actors.
   */
  actorAttributionForSector(sectorId: string): Array<{ id: string | null; name: string; count: number; percent: number }> {
    const events = this.eventsForSectorRecursive(sectorId);
    const counts = new Map<string | null, number>();
    for (const ev of events) {
      const seen = new Set<string | null>();
      let hadActor = false;
      for (const attr of ev.attributions ?? []) {
        if (attr.actor_id) {
          hadActor = true;
          if (!seen.has(attr.actor_id)) {
            seen.add(attr.actor_id);
            counts.set(attr.actor_id, (counts.get(attr.actor_id) ?? 0) + 1);
          }
        }
      }
      if (!hadActor) counts.set(null, (counts.get(null) ?? 0) + 1);
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    return [...counts.entries()]
      .map(([id, c]) => ({
        id,
        name: id ? (this.actors.get(id)?.canonical_name ?? id) : 'Unattributed (sector-only)',
        count: c,
        percent: total > 0 ? (c / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * For a doctrine: count attributed actors across events tagged to that
   * doctrine (or any of its pillars/programs). Returns sorted by count desc.
   * Includes a synthetic "unattributed" bucket for events with no actor.
   */
  actorAttributionForDoctrine(doctrineId: string): Array<{ id: string | null; name: string; count: number; percent: number }> {
    const events = this.eventsForDoctrine(doctrineId);
    const counts = new Map<string | null, number>();
    for (const ev of events) {
      const seen = new Set<string | null>();
      const attrs = ev.attributions ?? [];
      let hadActor = false;
      for (const attr of attrs) {
        if (attr.actor_id) {
          hadActor = true;
          if (!seen.has(attr.actor_id)) {
            seen.add(attr.actor_id);
            counts.set(attr.actor_id, (counts.get(attr.actor_id) ?? 0) + 1);
          }
        }
      }
      if (!hadActor) {
        counts.set(null, (counts.get(null) ?? 0) + 1);
      }
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    return [...counts.entries()]
      .map(([id, c]) => ({
        id,
        name: id ? (this.actors.get(id)?.canonical_name ?? id) : 'Unattributed (doctrine-only)',
        count: c,
        percent: total > 0 ? (c / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * For an actor: count their attributed events' doctrine-link contributions
   * grouped by top-level doctrine. Returns sorted by count descending.
   */
  doctrineAlignmentForActor(actorId: string): Array<{ doctrineId: string; doctrineName: string; count: number; percent: number }> {
    const events = this.eventsForActor(actorId);
    const counts = new Map<string, number>();
    for (const ev of events) {
      const seen = new Set<string>();
      for (const link of ev.doctrine_links ?? []) {
        const did = link.doctrine_id
          ?? (link.pillar_id ? this.pillars.get(link.pillar_id)?.doctrineId : undefined)
          ?? (link.program_id ? this.programs.get(link.program_id)?.doctrineId : undefined);
        if (did && !seen.has(did)) {
          seen.add(did);
          counts.set(did, (counts.get(did) ?? 0) + 1);
        }
      }
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    return [...counts.entries()]
      .map(([id, c]) => ({
        doctrineId: id,
        doctrineName: this.doctrines.get(id)?.short_name ?? this.doctrines.get(id)?.name ?? id,
        count: c,
        percent: total > 0 ? (c / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Reverse-FK: everything that cites a given source. Walks events,
   * actors, doctrines, services, timeline markers.
   */
  citationsForSource(sourceId: string): {
    events: AuspexEvent[];
    eventAttributions: AuspexEvent[];
    eventDoctrineLinks: AuspexEvent[];
    actors: Actor[];
    doctrines: Doctrine[];
    services: Service[];
    timelineMarkers: TimelineMarker[];
  } {
    const evCited: AuspexEvent[] = [];
    const evAttr: AuspexEvent[] = [];
    const evDocLink: AuspexEvent[] = [];
    for (const ev of this.events.values()) {
      if ((ev.sources ?? []).includes(sourceId)) evCited.push(ev);
      for (const attr of ev.attributions ?? []) {
        if (attr.attribution_source_id === sourceId) {
          evAttr.push(ev);
          break;
        }
      }
      for (const link of ev.doctrine_links ?? []) {
        if (link.attesting_source_id === sourceId) {
          evDocLink.push(ev);
          break;
        }
      }
    }
    const actors = [...this.actors.values()].filter((a) => (a.sources ?? []).includes(sourceId));
    const doctrines = [...this.doctrines.values()].filter((d) => (d.sources ?? []).includes(sourceId));
    const services = [...this.services.values()].filter((s) => (s.sources ?? []).includes(sourceId));
    const timelineMarkers = [...this.timelineMarkers.values()].filter((m) => (m.cited_by ?? []).includes(sourceId));
    return {
      events: evCited.sort(byStartDateDesc),
      eventAttributions: evAttr.sort(byStartDateDesc),
      eventDoctrineLinks: evDocLink.sort(byStartDateDesc),
      actors,
      doctrines,
      services,
      timelineMarkers,
    };
  }

  /** Sectors × years event-count matrix for the heatmap. */
  sectorYearMatrix(): { sectors: Sector[]; years: string[]; counts: Map<string, Map<string, number>> } {
    const counts = new Map<string, Map<string, number>>();
    const sectorSet = new Set<string>();
    const yearSet = new Set<string>();

    for (const ev of this.events.values()) {
      const year = (ev.start_date ?? ev.disclosure_date ?? '').slice(0, 4);
      if (!year) continue;
      yearSet.add(year);
      for (const t of ev.targets ?? []) {
        if (!t.target_id?.startsWith('sectors/')) continue;
        const raw = t.target_id.replace(/^sectors\//, '');
        // Try direct match. If not in taxonomy, walk the slug back to find a parent
        // that *is* in the taxonomy (strips country-qualified tails like /us, /il).
        let slug = raw;
        while (slug && !this.sectors.has(slug)) {
          const i = slug.lastIndexOf('/');
          if (i < 0) {
            slug = '';
            break;
          }
          slug = slug.slice(0, i);
        }
        if (!slug) continue;
        // Walk up to the top-level sector for the heatmap row.
        const ancestors = this.sectorAncestors(slug);
        const top = ancestors[0];
        if (!top) continue;
        sectorSet.add(top.id);
        if (!counts.has(top.id)) counts.set(top.id, new Map());
        const row = counts.get(top.id)!;
        row.set(year, (row.get(year) ?? 0) + 1);
      }
    }

    const sectors = [...sectorSet]
      .map((id) => this.sectors.get(id)!)
      .filter(Boolean)
      .sort((a, b) => {
        const totalA = [...(counts.get(a.id)?.values() ?? [])].reduce((s, v) => s + v, 0);
        const totalB = [...(counts.get(b.id)?.values() ?? [])].reduce((s, v) => s + v, 0);
        return totalB - totalA;
      });
    const years = [...yearSet].sort();
    return { sectors, years, counts };
  }

  private _resolve<T>(ids: Set<string> | undefined, store: Map<string, T>): T[] {
    if (!ids) return [];
    const out: T[] = [];
    for (const id of ids) {
      const v = store.get(id);
      if (v) out.push(v);
    }
    return out;
  }

  stats() {
    return {
      nationStates: this.nationStates.size,
      services: this.services.size,
      doctrines: this.doctrines.size,
      pillars: this.pillars.size,
      programs: this.programs.size,
      actors: this.actors.size,
      events: this.events.size,
      sources: this.sources.size,
      timelineMarkers: this.timelineMarkers.size,
      sectors: this.sectors.size,
      policyActions: this.policyActions.size,
      targets: this.targets.size,
    };
  }

  /** Events whose targets[] array references the given target id. */
  eventsForTarget(targetId: string): AuspexEvent[] {
    return this.allEventsSorted().filter((ev) =>
      (ev.targets ?? []).some((t) => t.target_id === targetId),
    );
  }

  // ───────── PolicyAction queries ─────────

  /** All policy actions, sorted by date ascending. */
  allPolicyActions(): PolicyAction[] {
    return [...this.policyActions.values()].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  }

  /** Policy actions issued by a given state. */
  policyActionsForState(stateId: string): PolicyAction[] {
    return this.allPolicyActions().filter((p) => p.issued_by_state_id === stateId);
  }

  /** Policy actions targeting a given state. */
  policyActionsTargeting(stateId: string): PolicyAction[] {
    return this.allPolicyActions().filter((p) => (p.targets_state_ids ?? []).includes(stateId));
  }

  /** Policy actions within a date window (inclusive). */
  policyActionsInRange(start: string, end: string): PolicyAction[] {
    return this.allPolicyActions().filter((p) => p.date >= start && p.date <= end);
  }

  /**
   * Policy actions occurring within ±days of a target date, with their
   * lag in days (positive = action is before target, negative = after).
   */
  policyActionsNear(targetDate: string, days: number): Array<{ action: PolicyAction; lagDays: number }> {
    const tgt = new Date(targetDate + 'T00:00:00Z').getTime();
    if (isNaN(tgt)) return [];
    const out: Array<{ action: PolicyAction; lagDays: number }> = [];
    for (const p of this.policyActions.values()) {
      if (!p.date) continue;
      const t = new Date(p.date + 'T00:00:00Z').getTime();
      if (isNaN(t)) continue;
      const lagMs = tgt - t;
      const lagDays = Math.round(lagMs / 86_400_000);
      if (Math.abs(lagDays) <= days) out.push({ action: p, lagDays });
    }
    return out.sort((a, b) => Math.abs(a.lagDays) - Math.abs(b.lagDays));
  }

  /** All known action_type values seen in the corpus. */
  policyActionTypes(): string[] {
    const s = new Set<string>();
    for (const p of this.policyActions.values()) if (p.action_type) s.add(p.action_type);
    return [...s].sort();
  }

  /**
   * Doctrine supersession-equivalence class. Walks both directions
   * through `superseded_by_id`. Used by the eval engines to treat
   * supersession-linked doctrines as operationally equivalent —
   * a prediction of Byungjin when the truth is 8th-Congress-Defense-Plan
   * counts as a hit because they're the same program under sequential
   * doctrinal frames.
   */
  doctrineEquivalenceClass(doctrineId: string): Set<string> {
    const out = new Set<string>([doctrineId]);
    let cur: string | undefined = doctrineId;
    while (cur) {
      const d = this.doctrines.get(cur);
      const next = d?.superseded_by_id;
      if (!next || out.has(next)) break;
      out.add(next);
      cur = next;
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const d of this.doctrines.values()) {
        if (d.superseded_by_id && out.has(d.superseded_by_id) && !out.has(d.id)) {
          out.add(d.id);
          changed = true;
        }
      }
    }
    return out;
  }

  /**
   * Pillar supersession-equivalence — pillars under sister doctrines
   * sharing the same trailing path segment.
   */
  pillarEquivalenceClass(pillarId: string): Set<string> {
    const out = new Set<string>([pillarId]);
    const ref = this.pillars.get(pillarId);
    if (!ref) return out;
    const parentDoctrine = ref.doctrineId;
    const equivDoctrines = this.doctrineEquivalenceClass(parentDoctrine);
    const suffix = pillarId.startsWith(parentDoctrine + '/')
      ? pillarId.slice(parentDoctrine.length + 1)
      : null;
    if (!suffix) return out;
    for (const eqDoctrine of equivDoctrines) {
      if (eqDoctrine === parentDoctrine) continue;
      const candidate = `${eqDoctrine}/${suffix}`;
      if (this.pillars.has(candidate)) out.add(candidate);
    }
    return out;
  }
}

export function byStartDateDesc(a: AuspexEvent, b: AuspexEvent): number {
  return (b.start_date ?? '').localeCompare(a.start_date ?? '');
}

// ───────── payload reconstruction (browser-side) ─────────

/** Shape of an entity collection in the /api/atlas.json payload — an
 *  array of entities, each carrying its own `id`. */
type IdArray<T extends { id: string }> = T[] | undefined;

function arrToMap<T extends { id: string }>(arr: IdArray<T>): Map<string, T> {
  const m = new Map<string, T>();
  for (const v of arr ?? []) {
    if (v && typeof v === 'object' && v.id) m.set(v.id, v);
  }
  return m;
}

/**
 * The /api/atlas.json payload shape this reconstructor reads. Loose by
 * design — the API emits arrays of the same entity objects the fs loader
 * builds, plus a deduped `malwareLineage` array and the serialized
 * `inferredCampaignByEvent` map.
 */
export interface AtlasPayload {
  nation_states?: NationState[];
  services?: Service[];
  doctrines?: Doctrine[];
  actors?: Actor[];
  events?: AuspexEvent[];
  sources?: Source[];
  timeline_markers?: TimelineMarker[];
  sectors?: Sector[];
  policy_actions?: PolicyAction[];
  targets?: Target[];
  malwareLineage?: MalwareLineageEntry[];
  inferredCampaignByEvent?: Record<string, string>;
}

/**
 * Build an Atlas from the /api/atlas.json payload. Entity arrays become
 * Maps; actors already carry their injected `mitre_techniques` /
 * `mitre_malware`; the malware-lineage table (deduped array) is expanded
 * back into the two lookup Maps; `inferredCampaignByEvent` is set from the
 * shipped object. The resulting Atlas builds the same derived indices and
 * `knownMalware` set as the fs path.
 */
export function atlasFromPayload(payload: AtlasPayload): Atlas {
  const malwareLineage = new Map<string, MalwareLineageEntry>();
  const malwareLineageGroup = new Map<string, string>();
  for (const fam of payload.malwareLineage ?? []) {
    if (!fam || !fam.name) continue;
    const lg = fam.lineage_group;
    for (const key of [fam.name, ...(fam.aliases ?? [])]) {
      if (!key) continue;
      const k = key.toLowerCase();
      malwareLineage.set(k, fam);
      if (lg) malwareLineageGroup.set(k, lg);
    }
  }

  const data: AtlasData = {
    nationStates: arrToMap(payload.nation_states),
    services: arrToMap(payload.services),
    doctrines: arrToMap(payload.doctrines),
    actors: arrToMap(payload.actors),
    events: arrToMap(payload.events),
    sources: arrToMap(payload.sources),
    timelineMarkers: arrToMap(payload.timeline_markers),
    sectors: arrToMap(payload.sectors),
    policyActions: arrToMap(payload.policy_actions),
    targets: arrToMap(payload.targets),
    malwareLineage,
    malwareLineageGroup,
  };

  const atlas = new Atlas(data);
  atlas.inferredCampaignByEvent = new Map(Object.entries(payload.inferredCampaignByEvent ?? {}));
  return atlas;
}

// ───────── formatting / runtime helpers ─────────

export function flagFor(stateId: string | undefined): string {
  if (!stateId) return '??';
  return stateId.toUpperCase();
}

export function formatDate(d: string | undefined): string {
  if (!d) return '';
  // Already ISO YYYY-MM-DD or YYYY-MM; just return as-is.
  return d;
}

/** CANONICAL actor→state derivation (MODELING-AUDIT-2026-06-09 H3 — this
 *  replaces six divergent reimplementations). Policy:
 *   1) the actor's primary_service_id head (cn/mss → cn);
 *   2) else the actor id's head segment: `criminal` is an explicit
 *      pseudo-state (criminal/shinyhunters → 'criminal'); a 2-letter head is
 *      a nation-state — including `<state>/proxies/*` BY DESIGN (ru/proxies/
 *      lockbit → 'ru': the proxies/ namespace asserts source-documented state
 *      harboring/tolerance, see docs/SCHEMA.md);
 *   3) else undefined (placeholder/unresolvable). */
export function actorStateId(actorId: string, a: Atlas): string | undefined {
  const svc = a.actors.get(actorId)?.primary_service_id;
  if (svc) return svc.split('/')[0];
  const head = actorId.split('/')[0];
  if (head === 'criminal') return 'criminal';
  if (head && head.length === 2) return head;
  return undefined;
}

/** CANONICAL event→state for EVAL TRUTH / stratification: derived from the
 *  attributed actors only (never from doctrine links — doctrine is another
 *  engine's label space). Returns 'criminal' for criminal-actor events so
 *  per-state tables get an explicit criminal bucket instead of '??'. */
export function eventActorStateId(ev: AuspexEvent, a: Atlas): string | undefined {
  for (const attr of ev.attributions ?? []) {
    if (attr.actor_id) {
      const s = actorStateId(attr.actor_id, a);
      if (s) return s;
    }
  }
  for (const attr of ev.attributions ?? []) {
    if (attr.service_id) return attr.service_id.split('/')[0];
  }
  return undefined;
}

/** Event→NATION-STATE mapping for display / markers / null-actor analyses.
 *  Like eventActorStateId but maps only to nation-states ('criminal' is not
 *  one), and may fall back to an attacker-rationale doctrine's state for
 *  null-actor events (a doctrinally-legible op with no named cluster). */
export function eventStateId(ev: AuspexEvent, a: Atlas): string | undefined {
  // 1) The attributed actors' canonical state ('criminal' → not a nation-state).
  const actorState = eventActorStateId(ev, a);
  if (actorState && actorState !== 'criminal') return actorState;
  if (actorState === 'criminal') return undefined;
  // 2) Last resort: derive from the first ATTACKER-RATIONALE doctrine link's
  // nation-state. Doctrine slugs start with the nation-state id (e.g.,
  // cn/mic2025). victim-response / defender-response links are skipped —
  // their state is the victim's or discloser's, NOT the operator's (the old
  // unfiltered fallback labeled Stuxnet as an Iranian operation).
  for (const link of ev.doctrine_links ?? []) {
    if (!isAttackerRationale(link)) continue;
    const did = link.doctrine_id ?? link.pillar_id ?? link.program_id;
    if (did) {
      const head = did.split('/')[0];
      if (a.nationStates.has(head)) return head;
    }
  }
  return undefined;
}

/** incident_type values that mark an event as a meta / announcement (doctrine
 *  publication, attribution/disclosure, policy or law-enforcement action)
 *  rather than a cyber operation. */
export const META_INCIDENT_TYPES = new Set([
  'documentary', 'doctrine-publication', 'disclosure', 'attribution-publication', 'policy', 'law-enforcement',
]);

/** True if EVERY incident_type is a meta type — i.e. the event documents /
 *  announces rather than being a cyber operation. Such events stay in the
 *  atlas and the training corpus (a doctrine-publication is the doctrine's
 *  defining text) but are excluded from the engine EVAL label sets, because
 *  scoring the doctrine of a doctrine-publication is circular. An event with
 *  ANY operational type (intrusion / data-theft / …) is NOT meta even if it is
 *  also documented. See docs/AUDIT-2026-05-29.md. */
export function isMetaEvent(ev: AuspexEvent): boolean {
  const its = ev.incident_type ?? [];
  return its.length > 0 && its.every((t) => META_INCIDENT_TYPES.has(t));
}

export function confidenceClass(conf: string | undefined): string {
  if (!conf) return 'confidence';
  const normalized = conf.toLowerCase().replace(/_/g, '-');
  return `confidence confidence-${normalized}`;
}
