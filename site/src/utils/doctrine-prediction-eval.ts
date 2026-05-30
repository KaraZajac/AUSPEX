/**
 * Leave-one-out cross-validation for the doctrine-prediction engine.
 * Multi-label evaluation: every event has 1+ true doctrines and we
 * score the ranking against the whole set.
 */
import { atlas, eventStateId, isMetaEvent, type AuspexEvent } from './atlas';
import { extractFeatures, buildVocab, type Vocab } from './attribution';
import {
  buildDoctrineProfiles,
  buildDoctrineIDF,
  doctrinesOfEvent,
  rankDoctrines,
  type DoctrineScoringOptions,
  type RankedDoctrine,
} from './doctrine-prediction';

export interface DoctrineEventEvalResult {
  eventId: string;
  eventName: string;
  startDate: string | undefined;
  trueDoctrines: string[];
  trueState: string | undefined;
  /** Min rank of any true doctrine (1 = perfect, null if no doctrine labels). */
  bestRank: number | null;
  /** Top-5 predicted doctrines. */
  top5: RankedDoctrine[];
  /** Number of true doctrines in top-K. */
  recall1: number;
  recall3: number;
  recall5: number;
  /** Average Precision for this event (used for mAP). */
  avgPrecision: number;
  hit1: boolean;
  hit3: boolean;
  hit5: boolean;
}

export interface DoctrineEvalSummary {
  events: DoctrineEventEvalResult[];
  /** All labeled events; null=miss convention. */
  scored: number;
  /** Events whose true doctrine never ranks (singleton); counted as misses. */
  unrankable: number;
  hit1: number;
  hit3: number;
  hit5: number;
  meanRecall1: number;
  meanRecall3: number;
  meanRecall5: number;
  mAP: number;
  perState: Map<string, { scored: number; hit1: number; hit3: number; meanRecall3: number; mAP: number }>;
  confusion: Array<{ predicted: string; actual: string; count: number }>;
  worst: DoctrineEventEvalResult[];
  options: DoctrineScoringOptions;
  generatedAt: string;
}

function eventToVocab(events: AuspexEvent[], a: ReturnType<typeof atlas>): Vocab {
  return buildVocab(events, a);
}

function averagePrecisionForEvent(true_: Set<string>, ranked: RankedDoctrine[]): number {
  if (true_.size === 0) return 0;
  let hits = 0;
  let sum = 0;
  for (let i = 0; i < ranked.length; i++) {
    if (true_.has(ranked[i].doctrineId)) {
      hits++;
      sum += hits / (i + 1);
      if (hits === true_.size) break;
    }
  }
  return sum / true_.size;
}

export function runDoctrineLOO(opts: DoctrineScoringOptions = {}, includeMeta = false): DoctrineEvalSummary {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => doctrinesOfEvent(e, a).size > 0 && (includeMeta || !isMetaEvent(e)));

  const results: DoctrineEventEvalResult[] = [];
  const confusionRaw = new Map<string, number>();

  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const profiles = buildDoctrineProfiles(training, a, refDate ? { referenceDate: refDate } : {});
    const vocab = eventToVocab(training, a);
    const idf = buildDoctrineIDF(profiles);
    const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
    // LOO hygiene (AUDIT-2026-05-29): suppress held-out event's own inferred-campaign id
    // (cluster formed with it present; verified equivalent to per-fold recompute).
    features.inferredCampaign = null;
    const ranked = rankDoctrines(features, profiles, vocab, { ...opts, idf });

    const trueDoctrines = [...doctrinesOfEvent(heldOut, a)];
    // Expand to supersession-equivalence classes: a prediction of
    // Byungjin when truth is 8th-Congress (or vice versa) counts as
    // correct, because they're the same program under sequential
    // doctrinal frames.
    const trueSet = new Set<string>();
    for (const d of trueDoctrines) {
      for (const eq of a.doctrineEquivalenceClass(d)) trueSet.add(eq);
    }

    // Best rank = first rank in the ranking that matches any equivalent.
    let bestRank: number | null = null;
    for (const c of ranked) {
      if (trueSet.has(c.doctrineId)) {
        bestRank = c.rank;
        break;
      }
    }

    function recallAt(k: number): number {
      const topK = new Set(ranked.slice(0, k).map((c) => c.doctrineId));
      // For recall, fold each true doctrine into its class and count
      // unique classes hit.
      const classesHit = new Set<string>();
      for (const d of trueDoctrines) {
        const cls = a.doctrineEquivalenceClass(d);
        for (const e of cls) {
          if (topK.has(e)) {
            classesHit.add(d);  // use original doctrine id as the class key
            break;
          }
        }
      }
      return trueDoctrines.length > 0 ? classesHit.size / trueDoctrines.length : 0;
    }

    const recall1 = recallAt(1);
    const recall3 = recallAt(3);
    const recall5 = recallAt(5);
    const avgPrecision = averagePrecisionForEvent(trueSet, ranked);

    const hit1 = bestRank === 1;
    const hit3 = bestRank !== null && bestRank <= 3;
    const hit5 = bestRank !== null && bestRank <= 5;

    if (!hit1 && bestRank !== null && ranked[0]) {
      const predicted = ranked[0].doctrineId;
      const actual = trueDoctrines[0];
      const key = `${predicted}|${actual}`;
      confusionRaw.set(key, (confusionRaw.get(key) ?? 0) + 1);
    }

    results.push({
      eventId: heldOut.id,
      eventName: heldOut.name,
      startDate: heldOut.start_date,
      trueDoctrines,
      trueState: eventStateId(heldOut, a),
      bestRank,
      top5: ranked.slice(0, 5),
      recall1, recall3, recall5,
      avgPrecision,
      hit1, hit3, hit5,
    });
  }

  // null=miss convention (AUDIT-2026-05-29 A1): all labeled events scored;
  // a true doctrine that never ranks (singleton) counts as a miss (recall/AP = 0,
  // which the per-event values already are), not an exclusion.
  const scored = results;
  const unrankable = results.filter((r) => r.bestRank === null).length;
  const hit1Count = scored.filter((r) => r.hit1).length;
  const hit3Count = scored.filter((r) => r.hit3).length;
  const hit5Count = scored.filter((r) => r.hit5).length;
  const meanRecall1 = scored.reduce((s, r) => s + r.recall1, 0) / Math.max(scored.length, 1);
  const meanRecall3 = scored.reduce((s, r) => s + r.recall3, 0) / Math.max(scored.length, 1);
  const meanRecall5 = scored.reduce((s, r) => s + r.recall5, 0) / Math.max(scored.length, 1);
  const mAP = scored.reduce((s, r) => s + r.avgPrecision, 0) / Math.max(scored.length, 1);

  const perState = new Map<string, { scored: number; hit1: number; hit3: number; meanRecall3: number; mAP: number }>();
  for (const r of scored) {
    const s = r.trueState ?? '??';
    let row = perState.get(s);
    if (!row) {
      row = { scored: 0, hit1: 0, hit3: 0, meanRecall3: 0, mAP: 0 };
      perState.set(s, row);
    }
    row.scored++;
    if (r.hit1) row.hit1++;
    if (r.hit3) row.hit3++;
    row.meanRecall3 += r.recall3;
    row.mAP += r.avgPrecision;
  }
  for (const row of perState.values()) {
    row.meanRecall3 /= row.scored;
    row.mAP /= row.scored;
  }

  const confusion = [...confusionRaw.entries()]
    .map(([k, count]) => {
      const [predicted, actual] = k.split('|');
      return { predicted, actual, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const worst = [...scored].sort((a, b) => (b.bestRank ?? Infinity) - (a.bestRank ?? Infinity)).slice(0, 15);

  return {
    events: results,
    scored: scored.length,
    unrankable,
    hit1: hit1Count,
    hit3: hit3Count,
    hit5: hit5Count,
    meanRecall1,
    meanRecall3,
    meanRecall5,
    mAP,
    perState,
    confusion,
    worst,
    options: opts,
    generatedAt: new Date().toISOString(),
  };
}
