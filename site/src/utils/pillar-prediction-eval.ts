/**
 * Leave-one-out cross-validation for the pillar-prediction engine.
 * Multi-label evaluation on the ~129-pillar label space.
 */
import { atlas, eventStateId, type AuspexEvent } from './atlas';
import { extractFeatures, buildVocab, type Vocab } from './attribution';
import {
  buildPillarProfiles,
  buildPillarIDF,
  pillarsOfEvent,
  rankPillars,
  type PillarScoringOptions,
  type RankedPillar,
} from './pillar-prediction';

export interface PillarEventResult {
  eventId: string;
  eventName: string;
  startDate: string | undefined;
  truePillars: string[];
  trueState: string | undefined;
  bestRank: number | null;
  top5: RankedPillar[];
  recall1: number;
  recall3: number;
  recall5: number;
  avgPrecision: number;
  hit1: boolean;
  hit3: boolean;
  hit5: boolean;
  /** Did the top-1 pillar match a different pillar within the same doctrine?
   *  (i.e., "doctrine right, pillar wrong") */
  doctrineMatch: boolean;
}

export interface PillarEvalSummary {
  events: PillarEventResult[];
  scored: number;
  hit1: number;
  hit3: number;
  hit5: number;
  meanRecall1: number;
  meanRecall3: number;
  meanRecall5: number;
  mAP: number;
  /** Top-1 wrong but at least at the right doctrine. */
  doctrineRightPillarWrong: number;
  perState: Map<string, { scored: number; hit1: number; hit3: number; meanRecall3: number; mAP: number }>;
  confusion: Array<{ predicted: string; actual: string; count: number }>;
  worst: PillarEventResult[];
  options: PillarScoringOptions;
  generatedAt: string;
}

function averagePrecisionForEvent(true_: Set<string>, ranked: RankedPillar[]): number {
  if (true_.size === 0) return 0;
  let hits = 0;
  let sum = 0;
  for (let i = 0; i < ranked.length; i++) {
    if (true_.has(ranked[i].pillarId)) {
      hits++;
      sum += hits / (i + 1);
      if (hits === true_.size) break;
    }
  }
  return sum / true_.size;
}

/** Parent doctrine id of a pillar id (everything before the last segment). */
function pillarToDoctrine(pillarId: string, a: ReturnType<typeof atlas>): string | undefined {
  return a.pillars.get(pillarId)?.doctrineId;
}

export function runPillarLOO(opts: PillarScoringOptions = {}): PillarEvalSummary {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => pillarsOfEvent(e, a).size > 0);

  const results: PillarEventResult[] = [];
  const confusionRaw = new Map<string, number>();

  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const profiles = buildPillarProfiles(training, a, refDate ? { referenceDate: refDate } : {});
    const vocab: Vocab = buildVocab(training, a);
    const idf = buildPillarIDF(profiles);
    const features = extractFeatures(heldOut, a);
    const ranked = rankPillars(features, profiles, vocab, { ...opts, idf });

    const truePillars = [...pillarsOfEvent(heldOut, a)];
    // Expand with pillar-supersession-equivalence (e.g. byungjin/revenue
    // ≡ 8th-congress/revenue when those pillars exist under both doctrines).
    const trueSet = new Set<string>();
    for (const p of truePillars) {
      for (const eq of a.pillarEquivalenceClass(p)) trueSet.add(eq);
    }
    const trueDoctrines = new Set(truePillars.map((p) => pillarToDoctrine(p, a)).filter((d): d is string => !!d));

    let bestRank: number | null = null;
    for (const c of ranked) {
      if (trueSet.has(c.pillarId)) {
        bestRank = c.rank;
        break;
      }
    }

    function recallAt(k: number): number {
      const topK = new Set(ranked.slice(0, k).map((c) => c.pillarId));
      const classesHit = new Set<string>();
      for (const p of truePillars) {
        const cls = a.pillarEquivalenceClass(p);
        for (const e of cls) {
          if (topK.has(e)) {
            classesHit.add(p);
            break;
          }
        }
      }
      return truePillars.length > 0 ? classesHit.size / truePillars.length : 0;
    }

    const recall1 = recallAt(1);
    const recall3 = recallAt(3);
    const recall5 = recallAt(5);
    const avgPrecision = averagePrecisionForEvent(trueSet, ranked);

    const hit1 = bestRank === 1;
    const hit3 = bestRank !== null && bestRank <= 3;
    const hit5 = bestRank !== null && bestRank <= 5;

    // Did top-1 land on the right doctrine even if not the exact pillar?
    let doctrineMatch = false;
    if (ranked[0]) {
      const predD = pillarToDoctrine(ranked[0].pillarId, a);
      if (predD && trueDoctrines.has(predD)) doctrineMatch = true;
    }

    if (!hit1 && bestRank !== null && ranked[0]) {
      const predicted = ranked[0].pillarId;
      const actual = truePillars[0];
      const key = `${predicted}|${actual}`;
      confusionRaw.set(key, (confusionRaw.get(key) ?? 0) + 1);
    }

    results.push({
      eventId: heldOut.id,
      eventName: heldOut.name,
      startDate: heldOut.start_date,
      truePillars,
      trueState: eventStateId(heldOut, a),
      bestRank,
      top5: ranked.slice(0, 5),
      recall1, recall3, recall5,
      avgPrecision,
      hit1, hit3, hit5,
      doctrineMatch,
    });
  }

  const scored = results.filter((r) => r.bestRank !== null);
  const hit1Count = scored.filter((r) => r.hit1).length;
  const hit3Count = scored.filter((r) => r.hit3).length;
  const hit5Count = scored.filter((r) => r.hit5).length;
  const meanRecall1 = scored.reduce((s, r) => s + r.recall1, 0) / Math.max(scored.length, 1);
  const meanRecall3 = scored.reduce((s, r) => s + r.recall3, 0) / Math.max(scored.length, 1);
  const meanRecall5 = scored.reduce((s, r) => s + r.recall5, 0) / Math.max(scored.length, 1);
  const mAP = scored.reduce((s, r) => s + r.avgPrecision, 0) / Math.max(scored.length, 1);
  // Doctrine-right-but-pillar-wrong = events where top-1 was wrong but landed on the right parent doctrine.
  const doctrineRightPillarWrong = scored.filter((r) => !r.hit1 && r.doctrineMatch).length;

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

  const worst = [...scored].sort((a, b) => (b.bestRank ?? 0) - (a.bestRank ?? 0)).slice(0, 15);

  return {
    events: results,
    scored: scored.length,
    hit1: hit1Count,
    hit3: hit3Count,
    hit5: hit5Count,
    meanRecall1,
    meanRecall3,
    meanRecall5,
    mAP,
    doctrineRightPillarWrong,
    perState,
    confusion,
    worst,
    options: opts,
    generatedAt: new Date().toISOString(),
  };
}
