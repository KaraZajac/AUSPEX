/**
 * Leave-one-out cross-validation for the joint (actor × doctrine) engine.
 * Pair-level multi-label evaluation.
 */
import { atlas, eventStateId, isMetaEvent, type AuspexEvent } from './atlas';
import { memoizeEval } from './eval-cache';
import { actorsOfEvent, extractFeatures } from './attribution';
import { doctrinesOfEvent } from './doctrine-prediction';
import { rankPairs, type JointPair, type JointScoringOptions } from './joint-prediction';

export interface JointEventResult {
  eventId: string;
  eventName: string;
  startDate: string | undefined;
  trueActors: string[];
  trueDoctrines: string[];
  truePairs: string[];  // "actor|doctrine"
  trueState: string | undefined;
  bestRank: number | null;
  top5: JointPair[];
  hit1: boolean;
  hit3: boolean;
  hit5: boolean;
  hit10: boolean;
}

export interface JointEvalSummary {
  events: JointEventResult[];
  /** All labeled (actor+doctrine) events; null=miss convention. */
  scored: number;
  /** Events with no rankable true pair (unrankable under LOO); counted as misses. */
  unrankable: number;
  hit1: number;
  hit3: number;
  hit5: number;
  hit10: number;
  mrr: number;
  perState: Map<string, { scored: number; hit1: number; hit3: number; hit5: number; mrr: number }>;
  worst: JointEventResult[];
  /** Pairs the engine had high confidence in that were actually correct — the "confident hits" highlight. */
  confidentHits: JointEventResult[];
  options: JointScoringOptions;
  generatedAt: string;
}

export function runJointLOO(opts: JointScoringOptions = {}, includeMeta = false): JointEvalSummary {
  return memoizeEval('joint-loo', { opts, includeMeta }, () => runJointLOOImpl(opts, includeMeta));
}
function runJointLOOImpl(opts: JointScoringOptions = {}, includeMeta = false): JointEvalSummary {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter(
    (e) => actorsOfEvent(e).size > 0 && doctrinesOfEvent(e, a).size > 0 && (includeMeta || !isMetaEvent(e)),
  );

  const results: JointEventResult[] = [];

  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
    // LOO hygiene (AUDIT-2026-05-29): suppress held-out event's own inferred-campaign id
    // (cluster formed with it present; verified equivalent to per-fold recompute).
    features.inferredCampaign = null;
    const ranked = rankPairs(features, training, a, { ...opts, referenceDate: refDate });

    const trueActors = [...actorsOfEvent(heldOut)];
    const trueDoctrines = [...doctrinesOfEvent(heldOut, a)];
    const truePairs: string[] = [];
    for (const t_a of trueActors) for (const t_d of trueDoctrines) truePairs.push(`${t_a}|${t_d}`);
    const truePairSet = new Set(truePairs);

    const ranks = ranked.flatMap((c) =>
      truePairSet.has(`${c.actorId}|${c.doctrineId}`) ? [c.rank] : [],
    );
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    results.push({
      eventId: heldOut.id,
      eventName: heldOut.name,
      startDate: heldOut.start_date,
      trueActors,
      trueDoctrines,
      truePairs,
      trueState: eventStateId(heldOut, a),
      bestRank,
      top5: ranked.slice(0, 5),
      hit1: bestRank === 1,
      hit3: bestRank !== null && bestRank <= 3,
      hit5: bestRank !== null && bestRank <= 5,
      hit10: bestRank !== null && bestRank <= 10,
    });
  }

  // null=miss convention (AUDIT-2026-05-29 A1): all labeled events scored;
  // unrankable pairs count as misses, not exclusions.
  const scored = results;
  const unrankable = results.filter((r) => r.bestRank === null).length;
  const hit1 = scored.filter((r) => r.hit1).length;
  const hit3 = scored.filter((r) => r.hit3).length;
  const hit5 = scored.filter((r) => r.hit5).length;
  const hit10 = scored.filter((r) => r.hit10).length;
  const mrr = scored.reduce((s, r) => s + (r.bestRank ? 1 / r.bestRank : 0), 0) / Math.max(scored.length, 1);

  const perState = new Map<string, { scored: number; hit1: number; hit3: number; hit5: number; mrr: number }>();
  for (const r of scored) {
    const s = r.trueState ?? '??';
    let row = perState.get(s);
    if (!row) {
      row = { scored: 0, hit1: 0, hit3: 0, hit5: 0, mrr: 0 };
      perState.set(s, row);
    }
    row.scored++;
    if (r.hit1) row.hit1++;
    if (r.hit3) row.hit3++;
    if (r.hit5) row.hit5++;
    row.mrr += r.bestRank ? 1 / r.bestRank : 0;
  }
  for (const row of perState.values()) row.mrr /= row.scored;

  const worst = [...scored].sort((a, b) => (b.bestRank ?? Infinity) - (a.bestRank ?? Infinity)).slice(0, 15);
  const confidentHits = [...scored]
    .filter((r) => r.hit1 && (r.top5[0]?.coOccurrence ?? 0) >= 2)
    .sort((a, b) => (b.top5[0]?.coOccurrence ?? 0) - (a.top5[0]?.coOccurrence ?? 0))
    .slice(0, 12);

  return {
    events: results,
    scored: scored.length,
    unrankable,
    hit1, hit3, hit5, hit10, mrr,
    perState,
    worst,
    confidentHits,
    options: opts,
    generatedAt: new Date().toISOString(),
  };
}
