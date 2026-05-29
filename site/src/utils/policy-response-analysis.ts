/**
 * Policy-response correlator.
 *
 * For each policy-action class (e.g. "US export-control against CN"),
 * compute the historical distribution of cyber events attributed to
 * the target state in the days following each instance.
 *
 * Output is conditional statistics, not causal claims. The analytic
 * value: "PRC-attributed events in semis-collection cluster 30-60
 * days after BIS export-control announcements (n=N instances, 2.7x
 * baseline)" — falsifiable, backtestable.
 */
import { atlas, eventStateId, type AuspexEvent, type PolicyAction } from './atlas';

export interface ClassKey {
  action_type: string;
  target_state: string;   // ISO-3166 alpha-2 lowercase
}

export interface LagWindow {
  label: string;
  startDays: number;
  endDays: number;
}

const DEFAULT_WINDOWS: LagWindow[] = [
  { label: '0–30d', startDays: 0, endDays: 30 },
  { label: '30–60d', startDays: 30, endDays: 60 },
  { label: '60–90d', startDays: 60, endDays: 90 },
  { label: '90–180d', startDays: 90, endDays: 180 },
];

export interface PostWindowResult {
  window: LagWindow;
  totalEvents: number;          // events in this window across all instances
  meanPerInstance: number;       // average per instance
  topDoctrines: Array<{ id: string; name: string; count: number }>;
  topActors: Array<{ id: string; name: string; count: number }>;
  topSectors: Array<{ id: string; name: string; count: number }>;
}

export interface ClassResult {
  classKey: ClassKey;
  instanceCount: number;        // how many policy actions in this class
  instanceDates: string[];      // dates of the instances
  baselineRatePerMonth: number; // baseline cyber-event rate for target_state, events / 30 days
  postWindows: PostWindowResult[];
}

/** Days between two ISO date strings. Returns null if either is invalid. */
function dayDiff(later: string, earlier: string): number | null {
  const l = new Date(later + 'T00:00:00Z').getTime();
  const e = new Date(earlier + 'T00:00:00Z').getTime();
  if (isNaN(l) || isNaN(e)) return null;
  return Math.round((l - e) / 86_400_000);
}

/** Build event index keyed by attacker state. */
function eventsByAttackerState(a: ReturnType<typeof atlas>): Map<string, AuspexEvent[]> {
  const m = new Map<string, AuspexEvent[]>();
  for (const ev of a.events.values()) {
    const s = eventStateId(ev, a);
    if (!s) continue;
    if (!m.has(s)) m.set(s, []);
    m.get(s)!.push(ev);
  }
  return m;
}

function topN<T>(items: T[], key: (x: T) => string, n: number): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(key(it), (counts.get(key(it)) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * For one class — given the policy actions in that class and the
 * events attributable to the target state — compute the lag-window
 * statistics.
 */
function analyzeClass(
  classKey: ClassKey,
  actions: PolicyAction[],
  targetEvents: AuspexEvent[],
  a: ReturnType<typeof atlas>,
  windows: LagWindow[],
): ClassResult {
  // Baseline rate: target_state's events per 30 days across the full atlas span.
  // Use min/max event date of target state.
  const dates = targetEvents.map((e) => e.start_date ?? e.disclosure_date ?? '').filter((d) => d);
  let baselineRatePerMonth = 0;
  if (dates.length >= 2) {
    const sorted = [...dates].sort();
    const span = dayDiff(sorted[sorted.length - 1], sorted[0]) ?? 0;
    if (span > 0) baselineRatePerMonth = (targetEvents.length / span) * 30;
  }

  // For each policy action, find events in each post window.
  const postWindows: PostWindowResult[] = windows.map((win) => {
    const eventsInWindow: AuspexEvent[] = [];
    for (const action of actions) {
      for (const ev of targetEvents) {
        const evDate = ev.start_date ?? ev.disclosure_date ?? '';
        if (!evDate || !action.date) continue;
        const lag = dayDiff(evDate, action.date);
        if (lag === null) continue;
        if (lag >= win.startDays && lag < win.endDays) {
          eventsInWindow.push(ev);
        }
      }
    }
    // De-dup: an event might match multiple actions in the same class
    const uniqueEvents = [...new Map(eventsInWindow.map((e) => [e.id, e])).values()];

    // Top doctrines (rolled up)
    const doctrineCounts = new Map<string, number>();
    for (const ev of uniqueEvents) {
      const seen = new Set<string>();
      for (const link of ev.doctrine_links ?? []) {
        const did =
          link.doctrine_id ??
          (link.pillar_id ? a.pillars.get(link.pillar_id)?.doctrineId : undefined) ??
          (link.program_id ? a.programs.get(link.program_id)?.doctrineId : undefined);
        if (did && !seen.has(did)) {
          seen.add(did);
          doctrineCounts.set(did, (doctrineCounts.get(did) ?? 0) + 1);
        }
      }
    }
    const topDoctrines = [...doctrineCounts.entries()]
      .map(([id, count]) => ({ id, name: a.doctrines.get(id)?.short_name ?? a.doctrines.get(id)?.name ?? id, count }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 5);

    // Top actors
    const actorCounts = new Map<string, number>();
    for (const ev of uniqueEvents) {
      const seen = new Set<string>();
      for (const attr of ev.attributions ?? []) {
        if (attr.actor_id && !seen.has(attr.actor_id)) {
          seen.add(attr.actor_id);
          actorCounts.set(attr.actor_id, (actorCounts.get(attr.actor_id) ?? 0) + 1);
        }
      }
    }
    const topActors = [...actorCounts.entries()]
      .map(([id, count]) => ({ id, name: a.actors.get(id)?.canonical_name ?? id, count }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 5);

    // Top sectors (top-level)
    const sectorCounts = new Map<string, number>();
    for (const ev of uniqueEvents) {
      const seen = new Set<string>();
      for (const t of ev.targets ?? []) {
        if (!t.target_id?.startsWith('sectors/')) continue;
        let slug = t.target_id.replace(/^sectors\//, '');
        while (slug && !a.sectors.has(slug)) {
          const i = slug.lastIndexOf('/');
          if (i < 0) { slug = ''; break; }
          slug = slug.slice(0, i);
        }
        if (!slug) continue;
        const top = a.sectorAncestors(slug)[0];
        if (top && !seen.has(top.id)) {
          seen.add(top.id);
          sectorCounts.set(top.id, (sectorCounts.get(top.id) ?? 0) + 1);
        }
      }
    }
    const topSectors = [...sectorCounts.entries()]
      .map(([id, count]) => ({ id, name: a.sectors.get(id)?.name ?? id, count }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 5);

    return {
      window: win,
      totalEvents: uniqueEvents.length,
      meanPerInstance: actions.length > 0 ? uniqueEvents.length / actions.length : 0,
      topDoctrines,
      topActors,
      topSectors,
    };
  });

  return {
    classKey,
    instanceCount: actions.length,
    instanceDates: actions.map((a) => a.date).filter(Boolean).sort(),
    baselineRatePerMonth,
    postWindows,
  };
}

/**
 * Run the correlator across all classes with at least minInstances
 * historical policy actions.
 */
export function runPolicyResponseAnalysis(opts: { minInstances?: number; windows?: LagWindow[] } = {}): {
  classes: ClassResult[];
  totalActions: number;
  totalEvents: number;
  generatedAt: string;
} {
  const minInstances = opts.minInstances ?? 3;
  const windows = opts.windows ?? DEFAULT_WINDOWS;
  const a = atlas();

  // Group policy actions by class
  const byClass = new Map<string, PolicyAction[]>();
  for (const p of a.policyActions.values()) {
    if (!p.action_type || !p.date) continue;
    for (const targetState of p.targets_state_ids ?? []) {
      const key = `${p.action_type}|${targetState}`;
      if (!byClass.has(key)) byClass.set(key, []);
      byClass.get(key)!.push(p);
    }
  }

  const events = eventsByAttackerState(a);
  const results: ClassResult[] = [];

  for (const [key, actions] of byClass) {
    if (actions.length < minInstances) continue;
    const [action_type, target_state] = key.split('|');
    const targetEvents = events.get(target_state) ?? [];
    if (targetEvents.length === 0) continue;
    results.push(analyzeClass({ action_type, target_state }, actions, targetEvents, a, windows));
  }

  results.sort((a, b) => b.instanceCount - a.instanceCount);

  return {
    classes: results,
    totalActions: a.policyActions.size,
    totalEvents: a.events.size,
    generatedAt: new Date().toISOString(),
  };
}
