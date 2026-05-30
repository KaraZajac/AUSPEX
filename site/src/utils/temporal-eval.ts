/**
 * Temporal holdout evaluation for all four engines.
 *
 * Train on events with start_date ≤ trainEndDate (e.g. "2023-12-31"),
 * then score every event after that boundary without retraining
 * per event. This is the honest forward-prediction test — it measures
 * whether patterns learned from history generalize to future events.
 *
 * Expected to score lower than LOO because: new actors emerge,
 * tradecraft drifts, doctrines supersede each other. The interesting
 * questions are:
 *  - How much lower?
 *  - Which engine degrades least?
 *  - Which states / years degrade most?
 */
import { atlas, eventStateId, isMetaEvent, type AuspexEvent } from './atlas';
import {
  actorsOfEvent,
  buildProfiles,
  buildIDF,
  buildVocab,
  extractFeatures,
  rankActors,
  type ScoringOptions,
} from './attribution';
import {
  buildDoctrineProfiles,
  buildDoctrineIDF,
  doctrinesOfEvent,
  rankDoctrines,
} from './doctrine-prediction';
import {
  buildPillarProfiles,
  buildPillarIDF,
  pillarsOfEvent,
  rankPillars,
} from './pillar-prediction';
import { rankPairs, type JointScoringOptions } from './joint-prediction';

export interface EngineMetrics {
  scored: number;
  hit1: number;
  hit3: number;
  hit5: number;
  hit10: number;
  mrr: number;
}

export interface TemporalTestResult {
  eventId: string;
  eventName: string;
  startDate: string;
  trueLabels: string[];
  trueState: string | undefined;
  bestRank: number | null;
  topPredicted: string | null;
  hit1: boolean;
  hit3: boolean;
  hit5: boolean;
}

export interface EngineTemporalSummary {
  engine: 'attribution' | 'doctrine' | 'pillar' | 'joint';
  trainEnd: string;
  trainSize: number;
  testSize: number;
  scored: number;
  hit1: number;
  hit3: number;
  hit5: number;
  hit10: number;
  mrr: number;
  perYear: Map<string, EngineMetrics>;
  perState: Map<string, EngineMetrics>;
  worst: TemporalTestResult[];
}

function bucketStart(ev: AuspexEvent): string {
  return ev.start_date ?? ev.disclosure_date ?? '';
}

function isInTrain(ev: AuspexEvent, trainEnd: string): boolean {
  const d = bucketStart(ev);
  return d !== '' && d <= trainEnd;
}

function aggregate(events: TemporalTestResult[], scored: TemporalTestResult[]): EngineMetrics {
  const hit1 = scored.filter((r) => r.hit1).length;
  const hit3 = scored.filter((r) => r.hit3).length;
  const hit5 = scored.filter((r) => r.hit5).length;
  const hit10 = scored.filter((r) => r.bestRank !== null && r.bestRank <= 10).length;
  const mrr = scored.reduce((s, r) => s + 1 / (r.bestRank ?? 1e9), 0) / Math.max(scored.length, 1);
  return { scored: scored.length, hit1, hit3, hit5, hit10, mrr };
}

function bucketize(results: TemporalTestResult[]): {
  perYear: Map<string, EngineMetrics>;
  perState: Map<string, EngineMetrics>;
} {
  const byYear = new Map<string, TemporalTestResult[]>();
  const byState = new Map<string, TemporalTestResult[]>();
  for (const r of results) {
    if (r.bestRank === null) continue;
    const yr = r.startDate.slice(0, 4);
    if (!byYear.has(yr)) byYear.set(yr, []);
    byYear.get(yr)!.push(r);
    const s = r.trueState ?? '??';
    if (!byState.has(s)) byState.set(s, []);
    byState.get(s)!.push(r);
  }
  const perYear = new Map<string, EngineMetrics>();
  for (const [k, v] of byYear) perYear.set(k, aggregate(v, v));
  const perState = new Map<string, EngineMetrics>();
  for (const [k, v] of byState) perState.set(k, aggregate(v, v));
  return { perYear, perState };
}

/** Attribution temporal holdout. */
export function runAttributionTemporal(trainEnd: string, opts: ScoringOptions = {}): EngineTemporalSummary {
  const a = atlas();
  const all = [...a.events.values()];
  const train = all.filter((e) => isInTrain(e, trainEnd));
  const test = all.filter((e) => !isInTrain(e, trainEnd) && actorsOfEvent(e).size > 0 && !isMetaEvent(e));

  const vocab = buildVocab(train, a);

  const results: TemporalTestResult[] = [];
  for (const ev of test) {
    const refDate = ev.start_date ?? ev.disclosure_date;
    const profiles = buildProfiles(train, a, refDate ? { referenceDate: refDate } : {});
    const idf = buildIDF(profiles);
    const features = extractFeatures(ev, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null; // holdout hygiene (AUDIT-2026-05-29), consistent with the LOO evals
    const ranked = rankActors(features, profiles, vocab, { ...opts, idf });
    const trueActors = [...actorsOfEvent(ev)];
    const ranks = trueActors.map((t) => ranked.findIndex((c) => c.actorId === t) + 1).filter((r) => r > 0);
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    // Get state from the actual atlas (events held out from training still know their own actors)
    let trueState: string | undefined;
    for (const aid of trueActors) {
      const svc = a.actors.get(aid)?.primary_service_id;
      if (svc) {
        trueState = svc.split('/')[0];
        break;
      }
    }
    if (!trueState) trueState = eventStateId(ev, a);

    results.push({
      eventId: ev.id,
      eventName: ev.name,
      startDate: bucketStart(ev),
      trueLabels: trueActors,
      trueState,
      bestRank,
      topPredicted: ranked[0]?.actorId ?? null,
      hit1: bestRank === 1,
      hit3: bestRank !== null && bestRank <= 3,
      hit5: bestRank !== null && bestRank <= 5,
    });
  }

  const scored = results.filter((r) => r.bestRank !== null);
  const { perYear, perState } = bucketize(results);
  const worst = [...scored].sort((a, b) => (b.bestRank ?? 0) - (a.bestRank ?? 0)).slice(0, 12);

  return {
    engine: 'attribution',
    trainEnd,
    trainSize: train.length,
    testSize: test.length,
    ...aggregate(results, scored),
    perYear,
    perState,
    worst,
  };
}

/** Doctrine temporal holdout. */
export function runDoctrineTemporal(trainEnd: string, opts: ScoringOptions = {}): EngineTemporalSummary {
  const a = atlas();
  const all = [...a.events.values()];
  const train = all.filter((e) => isInTrain(e, trainEnd));
  const test = all.filter((e) => !isInTrain(e, trainEnd) && doctrinesOfEvent(e, a).size > 0 && !isMetaEvent(e));

  const vocab = buildVocab(train, a);

  const results: TemporalTestResult[] = [];
  for (const ev of test) {
    const refDate = ev.start_date ?? ev.disclosure_date;
    const profiles = buildDoctrineProfiles(train, a, refDate ? { referenceDate: refDate } : {});
    const idf = buildDoctrineIDF(profiles);
    const features = extractFeatures(ev, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null; // holdout hygiene (AUDIT-2026-05-29)
    const ranked = rankDoctrines(features, profiles, vocab, { ...opts, idf });
    const trueDoctrines = [...doctrinesOfEvent(ev, a)];
    const ranks = trueDoctrines.map((d) => ranked.findIndex((c) => c.doctrineId === d) + 1).filter((r) => r > 0);
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    results.push({
      eventId: ev.id,
      eventName: ev.name,
      startDate: bucketStart(ev),
      trueLabels: trueDoctrines,
      trueState: eventStateId(ev, a),
      bestRank,
      topPredicted: ranked[0]?.doctrineId ?? null,
      hit1: bestRank === 1,
      hit3: bestRank !== null && bestRank <= 3,
      hit5: bestRank !== null && bestRank <= 5,
    });
  }

  const scored = results.filter((r) => r.bestRank !== null);
  const { perYear, perState } = bucketize(results);
  const worst = [...scored].sort((a, b) => (b.bestRank ?? 0) - (a.bestRank ?? 0)).slice(0, 12);

  return {
    engine: 'doctrine',
    trainEnd,
    trainSize: train.length,
    testSize: test.length,
    ...aggregate(results, scored),
    perYear,
    perState,
    worst,
  };
}

/** Pillar temporal holdout. */
export function runPillarTemporal(trainEnd: string, opts: ScoringOptions = {}): EngineTemporalSummary {
  const a = atlas();
  const all = [...a.events.values()];
  const train = all.filter((e) => isInTrain(e, trainEnd));
  const test = all.filter((e) => !isInTrain(e, trainEnd) && pillarsOfEvent(e, a).size > 0 && !isMetaEvent(e));

  const vocab = buildVocab(train, a);

  const results: TemporalTestResult[] = [];
  for (const ev of test) {
    const refDate = ev.start_date ?? ev.disclosure_date;
    const profiles = buildPillarProfiles(train, a, refDate ? { referenceDate: refDate } : {});
    const idf = buildPillarIDF(profiles);
    const features = extractFeatures(ev, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null; // holdout hygiene (AUDIT-2026-05-29)
    const ranked = rankPillars(features, profiles, vocab, { ...opts, idf });
    const truePillars = [...pillarsOfEvent(ev, a)];
    const ranks = truePillars.map((p) => ranked.findIndex((c) => c.pillarId === p) + 1).filter((r) => r > 0);
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    results.push({
      eventId: ev.id,
      eventName: ev.name,
      startDate: bucketStart(ev),
      trueLabels: truePillars,
      trueState: eventStateId(ev, a),
      bestRank,
      topPredicted: ranked[0]?.pillarId ?? null,
      hit1: bestRank === 1,
      hit3: bestRank !== null && bestRank <= 3,
      hit5: bestRank !== null && bestRank <= 5,
    });
  }

  const scored = results.filter((r) => r.bestRank !== null);
  const { perYear, perState } = bucketize(results);
  const worst = [...scored].sort((a, b) => (b.bestRank ?? 0) - (a.bestRank ?? 0)).slice(0, 12);

  return {
    engine: 'pillar',
    trainEnd,
    trainSize: train.length,
    testSize: test.length,
    ...aggregate(results, scored),
    perYear,
    perState,
    worst,
  };
}

/** Joint (actor × doctrine) temporal holdout. */
export function runJointTemporal(trainEnd: string, opts: JointScoringOptions = {}): EngineTemporalSummary {
  const a = atlas();
  const all = [...a.events.values()];
  const train = all.filter((e) => isInTrain(e, trainEnd));
  const test = all.filter(
    (e) => !isInTrain(e, trainEnd) && actorsOfEvent(e).size > 0 && doctrinesOfEvent(e, a).size > 0,
  );

  const results: TemporalTestResult[] = [];
  for (const ev of test) {
    const features = extractFeatures(ev, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null; // holdout hygiene (AUDIT-2026-05-29)
    const ranked = rankPairs(features, train, a, opts);
    const trueActors = [...actorsOfEvent(ev)];
    const trueDoctrines = [...doctrinesOfEvent(ev, a)];
    const truePairs = new Set<string>();
    for (const t_a of trueActors) for (const t_d of trueDoctrines) truePairs.add(`${t_a}|${t_d}`);

    const ranks = ranked.flatMap((c) =>
      truePairs.has(`${c.actorId}|${c.doctrineId}`) ? [c.rank] : [],
    );
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    let trueState: string | undefined;
    for (const aid of trueActors) {
      const svc = a.actors.get(aid)?.primary_service_id;
      if (svc) {
        trueState = svc.split('/')[0];
        break;
      }
    }

    results.push({
      eventId: ev.id,
      eventName: ev.name,
      startDate: bucketStart(ev),
      trueLabels: [...truePairs],
      trueState,
      bestRank,
      topPredicted: ranked[0] ? `${ranked[0].actorId}|${ranked[0].doctrineId}` : null,
      hit1: bestRank === 1,
      hit3: bestRank !== null && bestRank <= 3,
      hit5: bestRank !== null && bestRank <= 5,
    });
  }

  const scored = results.filter((r) => r.bestRank !== null);
  const { perYear, perState } = bucketize(results);
  const worst = [...scored].sort((a, b) => (b.bestRank ?? 0) - (a.bestRank ?? 0)).slice(0, 12);

  return {
    engine: 'joint',
    trainEnd,
    trainSize: train.length,
    testSize: test.length,
    ...aggregate(results, scored),
    perYear,
    perState,
    worst,
  };
}

/** Run all four engines at the same train-end boundary. */
export function runAllTemporal(trainEnd: string): {
  attribution: EngineTemporalSummary;
  doctrine: EngineTemporalSummary;
  pillar: EngineTemporalSummary;
  joint: EngineTemporalSummary;
  generatedAt: string;
} {
  return {
    attribution: runAttributionTemporal(trainEnd),
    doctrine: runDoctrineTemporal(trainEnd),
    pillar: runPillarTemporal(trainEnd),
    joint: runJointTemporal(trainEnd),
    generatedAt: new Date().toISOString(),
  };
}
