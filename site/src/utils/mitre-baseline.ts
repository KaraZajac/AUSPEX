/**
 * MITRE ATT&CK Groups baseline classifier — the "public-data floor"
 * that AUSPEX engines must beat.
 *
 * Methodology:
 *   - Load MITRE Groups → TTP profiles from .cache/mitre-ttps.json
 *   - For each labeled event, extract TTPs (same extractor the NB
 *     engine uses), roll to parent
 *   - For each MITRE Group, compute Jaccard(event-TTPs, group-TTPs)
 *   - Rank groups by Jaccard score
 *   - Map top-K Groups back to AUSPEX actor IDs via external_refs.mitre_attack
 *   - Score: did the event's true AUSPEX actor appear in top-K?
 *
 * This is the canonical "what would a naive analyst with just MITRE
 * Groups attribution data do?" baseline. Required for the thesis-
 * defensible claim "AUSPEX beats the public baseline by X%."
 *
 * Methodology choices:
 *   - Events whose true actor has no MITRE G-code mapping are SKIPPED
 *     (not counted as misses). The baseline genuinely can't predict
 *     them — including them would unfairly inflate the AUSPEX-vs-
 *     baseline delta. Skip rate is reported in the result.
 *   - Both event-side and group-side TTPs are rolled to parent
 *     T-codes before Jaccard. The AUSPEX engine does the same; this
 *     keeps the comparison apples-to-apples.
 *   - Multi-attribution events count a hit if ANY of the true actors'
 *     G-codes appears in top-K, same as the AUSPEX LOO eval.
 */
import { atlas, type AuspexEvent } from './atlas';
import { actorsOfEvent } from './attribution';
import { inferEventTTPs, parentTechnique } from './ttp-extract';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface RankedGroup {
  groupId: string;
  jaccard: number;
  rank: number;
}

export interface MitreBaselineEventResult {
  eventId: string;
  eventName: string;
  startDate: string | undefined;
  trueState: string | undefined;
  /** True AUSPEX actor IDs. */
  trueActors: string[];
  /** True actors' MITRE G-codes (mapped via external_refs); excludes nulls. */
  trueGroups: string[];
  /** Top-5 ranked G-codes the baseline produced. */
  top5: RankedGroup[];
  /** Min rank of any true G-code (1 = perfect, null if no overlap in ranked list). */
  bestRank: number | null;
  hit1: boolean;
  hit3: boolean;
  hit5: boolean;
  hit10: boolean;
}

export interface MitreBaselineSummary {
  events: MitreBaselineEventResult[];
  /** Events where the true actor has a G-code mapping (and were scored). */
  scored: number;
  /** Events skipped because none of the true actors map to a G-code. */
  skipped: number;
  hit1: number;
  hit3: number;
  hit5: number;
  hit10: number;
  mrr: number;
  perState: Map<string, { scored: number; hit1: number; hit3: number; hit5: number; mrr: number }>;
  /** Total MITRE Groups loaded (candidate space size). */
  groupCount: number;
  generatedAt: string;
}

function loadMitreGroupTTPs(): Map<string, Set<string>> | null {
  // Try a few candidate paths so this runs in dev, in tools/, and in the build.
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, '..', '..', '.cache', 'mitre-ttps.json'),
    resolve(process.cwd(), '.cache', 'mitre-ttps.json'),
    resolve(process.cwd(), 'site', '.cache', 'mitre-ttps.json'),
  ];
  let raw: Record<string, string[]> | null = null;
  for (const p of candidates) {
    if (existsSync(p)) {
      raw = JSON.parse(readFileSync(p, 'utf8'));
      break;
    }
  }
  if (!raw) return null;

  // Roll every group's TTPs to parent T-codes so the comparison is
  // apples-to-apples with the AUSPEX engine's parent-rollup features.
  const out = new Map<string, Set<string>>();
  for (const [g, list] of Object.entries(raw)) {
    const parents = new Set<string>();
    for (const t of list) parents.add(parentTechnique(t));
    if (parents.size > 0) out.set(g, parents);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  if (union === 0) return 0;
  return inter / union;
}

function trueStateFor(event: AuspexEvent, a: ReturnType<typeof atlas>): string | undefined {
  for (const actorId of actorsOfEvent(event)) {
    const svc = a.actors.get(actorId)?.primary_service_id;
    if (svc) return svc.split('/')[0];
    const head = actorId.split('/')[0];
    if (head === 'criminal' || (head && head.length === 2)) return head;
  }
  for (const attr of event.attributions ?? []) {
    if (attr.service_id) return attr.service_id.split('/')[0];
  }
  return undefined;
}

export function runMitreBaseline(): MitreBaselineSummary {
  const a = atlas();
  const groupTtps = loadMitreGroupTTPs();
  if (!groupTtps) {
    throw new Error('MITRE Groups data not found (.cache/mitre-ttps.json missing). Run pnpm exec tsx tools/extract-mitre-ttps.ts first.');
  }
  const groupCount = groupTtps.size;

  // Map AUSPEX actor ID → MITRE G-code (the inverse of external_refs).
  // Also build the inverse: G-code → set of AUSPEX actor IDs.
  const actorToGroup = new Map<string, string>();
  const groupToActors = new Map<string, Set<string>>();
  for (const actor of a.actors.values()) {
    const g = actor.external_refs?.mitre_attack;
    if (!g) continue;
    actorToGroup.set(actor.id, g);
    let s = groupToActors.get(g);
    if (!s) { s = new Set(); groupToActors.set(g, s); }
    s.add(actor.id);
  }

  const events: MitreBaselineEventResult[] = [];
  let skipped = 0;
  let hit1 = 0, hit3 = 0, hit5 = 0, hit10 = 0;
  let mrrSum = 0;
  const perState = new Map<string, { scored: number; hit1: number; hit3: number; hit5: number; mrr: number }>();

  for (const event of a.events.values()) {
    const truA = actorsOfEvent(event);
    if (truA.size === 0) continue;

    // Map true AUSPEX actors → true G-codes (skip nulls).
    const trueGroups: string[] = [];
    for (const actorId of truA) {
      const g = actorToGroup.get(actorId);
      if (g) trueGroups.push(g);
    }
    if (trueGroups.length === 0) {
      // Baseline can't predict an actor not in MITRE Groups data.
      skipped++;
      continue;
    }

    // Extract event TTPs at parent level (mirror the NB engine).
    const evTtps = new Set<string>();
    for (const t of inferEventTTPs(event)) evTtps.add(parentTechnique(t));

    // Score every MITRE Group.
    const ranked: RankedGroup[] = [];
    for (const [g, groupTtpSet] of groupTtps) {
      const j = jaccard(evTtps, groupTtpSet);
      if (j > 0) ranked.push({ groupId: g, jaccard: j, rank: 0 });
    }
    ranked.sort((a, b) => b.jaccard - a.jaccard);
    // Assign ranks (1-indexed).
    for (let i = 0; i < ranked.length; i++) ranked[i].rank = i + 1;

    // Best rank of any true group.
    const ranks = trueGroups.map((g) => ranked.findIndex((r) => r.groupId === g) + 1).filter((r) => r > 0);
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;
    const h1 = bestRank === 1;
    const h3 = bestRank !== null && bestRank <= 3;
    const h5 = bestRank !== null && bestRank <= 5;
    const h10 = bestRank !== null && bestRank <= 10;

    if (bestRank !== null) {
      hit1 += h1 ? 1 : 0;
      hit3 += h3 ? 1 : 0;
      hit5 += h5 ? 1 : 0;
      hit10 += h10 ? 1 : 0;
      mrrSum += 1 / bestRank;
    }

    const trueState = trueStateFor(event, a);
    const row: MitreBaselineEventResult = {
      eventId: event.id,
      eventName: event.name,
      startDate: event.start_date,
      trueState,
      trueActors: [...truA],
      trueGroups,
      top5: ranked.slice(0, 5),
      bestRank,
      hit1: h1, hit3: h3, hit5: h5, hit10: h10,
    };
    events.push(row);

    if (trueState) {
      let ps = perState.get(trueState);
      if (!ps) { ps = { scored: 0, hit1: 0, hit3: 0, hit5: 0, mrr: 0 }; perState.set(trueState, ps); }
      ps.scored++;
      if (h1) ps.hit1++;
      if (h3) ps.hit3++;
      if (h5) ps.hit5++;
      if (bestRank !== null) ps.mrr += 1 / bestRank;
    }
  }
  for (const row of perState.values()) row.mrr = row.scored > 0 ? row.mrr / row.scored : 0;

  const scored = events.length;
  return {
    events,
    scored,
    skipped,
    hit1, hit3, hit5, hit10,
    mrr: scored > 0 ? mrrSum / scored : 0,
    perState,
    groupCount,
    generatedAt: new Date().toISOString(),
  };
}
