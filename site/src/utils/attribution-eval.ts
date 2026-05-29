/**
 * Leave-one-out cross-validation for the attribution engine,
 * plus Monte Carlo corpus-stability resampling.
 */
import { atlas, type AuspexEvent } from './atlas';
import {
  actorsOfEvent,
  buildProfiles,
  buildVocab,
  buildIDF,
  extractFeatures,
  rankActors,
  scoreActor,
  type ScoringOptions,
  type RankedCandidate,
} from './attribution';

export interface EventEvalResult {
  eventId: string;
  eventName: string;
  startDate: string | undefined;
  trueActors: string[];
  trueState: string | undefined;
  /** Rank of the best-matching true actor (1 = perfect). null if no actor in atlas. */
  bestRank: number | null;
  /** Top-5 predicted candidates. */
  top5: RankedCandidate[];
  /** Did rank-1 hit a true actor? */
  hit1: boolean;
  hit3: boolean;
  hit5: boolean;
  hit10: boolean;
}

export interface EvalSummary {
  events: EventEvalResult[];
  /** All labeled events. Under the null=miss convention every labeled event is scored. */
  scored: number;
  /** Events whose sole true actor is a corpus singleton (no other training event),
   *  hence unrankable under LOO. Counted as misses (RR=0), not excluded. */
  unrankable: number;
  hit1: number;
  hit3: number;
  hit5: number;
  hit10: number;
  mrr: number;
  perState: Map<string, { scored: number; hit1: number; hit3: number; hit5: number; mrr: number }>;
  /** Top confusion pairs: predicted-actor → actual-actor counts when rank-1 was wrong. */
  confusion: Array<{ predicted: string; actual: string; count: number }>;
  /** Worst predictions (highest bestRank). */
  worst: EventEvalResult[];
  /** Engine options used. */
  options: ScoringOptions;
  /** Generated timestamp. */
  generatedAt: string;
}

function trueStateFor(event: AuspexEvent, a: ReturnType<typeof atlas>): string | undefined {
  for (const actorId of actorsOfEvent(event)) {
    const svc = a.actors.get(actorId)?.primary_service_id;
    if (svc) return svc.split('/')[0];
  }
  for (const attr of event.attributions ?? []) {
    if (attr.service_id) return attr.service_id.split('/')[0];
  }
  return undefined;
}

/**
 * Leave-one-out evaluation. For each labeled event, rebuild profiles
 * on the remaining N-1, score, find the rank of the true actor.
 */
export function runLeaveOneOut(opts: ScoringOptions = {}): EvalSummary {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => actorsOfEvent(e).size > 0);

  const results: EventEvalResult[] = [];
  const confusionRaw = new Map<string, number>(); // key: predicted|actual

  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    // servicePriorLambda=0.2: corrected Empirical-Bayes prior (Set-flood fixed), λ selected
    // by LOO sweep — peak top-1/top-3/MRR at 0.2, declines by 0.3 (AUDIT-2026-05-29 B1).
    const profiles = buildProfiles(training, a, { referenceDate: refDate, servicePriorLambda: 0.2 });
    const vocab = buildVocab(training, a);
    const idf = buildIDF(profiles);
    const features = extractFeatures(heldOut, a);
    // LOO hygiene (AUDIT-2026-05-29): suppress the held-out event's own inferred-campaign
    // membership — the cluster was formed with this event present, so scoring against it
    // leaks label-correlated structure. Verified equivalent to recomputing clusters on N-1.
    features.inferredCampaign = null;
    const ranked = rankActors(features, profiles, vocab, { ...opts, idf, malwareLineageGroup: a.malwareLineageGroup });

    const trueActors = [...actorsOfEvent(heldOut)];
    // Best rank = min rank achieved by ANY of the true actors. (Multi-attribution events
    // count as a hit if any true actor is ranked well.)
    const ranks = trueActors.map((tid) => ranked.findIndex((c) => c.actorId === tid) + 1).filter((r) => r > 0);
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    const hit1 = bestRank === 1;
    const hit3 = bestRank !== null && bestRank <= 3;
    const hit5 = bestRank !== null && bestRank <= 5;
    const hit10 = bestRank !== null && bestRank <= 10;

    if (!hit1 && bestRank !== null && ranked[0]) {
      const predicted = ranked[0].actorId;
      const actual = trueActors[0];
      const key = `${predicted}|${actual}`;
      confusionRaw.set(key, (confusionRaw.get(key) ?? 0) + 1);
    }

    results.push({
      eventId: heldOut.id,
      eventName: heldOut.name,
      startDate: heldOut.start_date,
      trueActors,
      trueState: trueStateFor(heldOut, a),
      bestRank,
      top5: ranked.slice(0, 5),
      hit1, hit3, hit5, hit10,
    });
  }

  // null=miss convention (AUDIT-2026-05-29 A1): every labeled event is scored.
  // An event whose sole true actor has no other corpus event is unrankable
  // under LOO and counts as a miss (RR=0) — it is NOT excluded from the
  // denominator. This is the IR-standard treatment and matches the stacked
  // eval. (Previously these events were dropped, inflating top-1 by ~4.5pp.)
  const scored = results;
  const unrankable = results.filter((r) => r.bestRank === null).length;
  const hit1Count = scored.filter((r) => r.hit1).length;
  const hit3Count = scored.filter((r) => r.hit3).length;
  const hit5Count = scored.filter((r) => r.hit5).length;
  const hit10Count = scored.filter((r) => r.hit10).length;
  const mrr = scored.reduce((sum, r) => sum + (r.bestRank ? 1 / r.bestRank : 0), 0) / Math.max(scored.length, 1);

  // Per-state breakdown
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

  // Confusion top pairs
  const confusion = [...confusionRaw.entries()]
    .map(([k, count]) => {
      const [predicted, actual] = k.split('|');
      return { predicted, actual, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Worst predictions (largest bestRank; unrankable events sort first as the worst case)
  const worst = [...scored].sort((a, b) => (b.bestRank ?? Infinity) - (a.bestRank ?? Infinity)).slice(0, 15);

  return {
    events: results,
    scored: scored.length,
    unrankable,
    hit1: hit1Count,
    hit3: hit3Count,
    hit5: hit5Count,
    hit10: hit10Count,
    mrr,
    perState,
    confusion,
    worst,
    options: opts,
    generatedAt: new Date().toISOString(),
  };
}

export interface StabilityResult {
  /** N resamples performed. */
  n: number;
  dropFraction: number;
  /** Fraction of events where the rank-1 candidate stayed the same across resamples. */
  rank1Stability: number;
  /** Fraction of events where the top-3 set Jaccard-overlap stayed >= 0.5. */
  top3StabilityJaccard: number;
}

/**
 * Resample the corpus with `dropFraction` of events removed at
 * random, retrain, score all labeled events, measure how often the
 * top candidate is the same as on the full corpus.
 */
export function runStability(n: number = 10, dropFraction: number = 0.1, opts: ScoringOptions = {}, seed: number = 0xc0ffee): StabilityResult {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => actorsOfEvent(e).size > 0);

  // Baseline rank-1 prediction for each labeled event using full-corpus LOO.
  const baselineRank1 = new Map<string, string | null>();
  const baselineTop3 = new Map<string, Set<string>>();
  for (const ev of labeled) {
    const training = allEvents.filter((e) => e.id !== ev.id);
    const refDate = ev.start_date ?? ev.disclosure_date;
    const profiles = buildProfiles(training, a, refDate ? { referenceDate: refDate } : {});
    const vocab = buildVocab(training, a);
    const idf = buildIDF(profiles);
    const ranked = rankActors(extractFeatures(ev, a), profiles, vocab, { ...opts, idf });
    baselineRank1.set(ev.id, ranked[0]?.actorId ?? null);
    baselineTop3.set(ev.id, new Set(ranked.slice(0, 3).map((c) => c.actorId)));
  }

  let rank1Agreements = 0;
  let rank1Comparisons = 0;
  let top3Agreements = 0;
  let top3Comparisons = 0;

  // Seeded LCG (same generator family as eval-stats.ts) so the stability figure is
  // reproducible build-to-build (AUDIT-2026-05-29; previously an unseeded RNG, so the
  // published 91.2% could not be regenerated). Numerical Recipes LCG constants.
  let rngState = seed >>> 0;
  const rand = () => {
    rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
    return rngState / 4294967296;
  };
  for (let i = 0; i < n; i++) {
    const surviving = allEvents.filter(() => rand() >= dropFraction);
    const profiles = buildProfiles(surviving, a);
    const vocab = buildVocab(surviving, a);

    for (const ev of labeled) {
      // Skip if held-out event was dropped from training (can't evaluate it apples-to-apples)
      if (!surviving.find((e) => e.id === ev.id)) continue;
      const trainingMinusHeld = surviving.filter((e) => e.id !== ev.id);
      const refDate = ev.start_date ?? ev.disclosure_date;
      const profilesP = buildProfiles(trainingMinusHeld, a, refDate ? { referenceDate: refDate } : {});
      const vocabP = buildVocab(trainingMinusHeld, a);
      const idfP = buildIDF(profilesP);
      const ranked = rankActors(extractFeatures(ev, a), profilesP, vocabP, { ...opts, idf: idfP });

      const baseR1 = baselineRank1.get(ev.id);
      const resR1 = ranked[0]?.actorId ?? null;
      if (baseR1 !== null && resR1 !== null) {
        rank1Comparisons++;
        if (baseR1 === resR1) rank1Agreements++;
      }

      const baseTop3 = baselineTop3.get(ev.id);
      const resTop3 = new Set(ranked.slice(0, 3).map((c) => c.actorId));
      if (baseTop3) {
        top3Comparisons++;
        const inter = [...baseTop3].filter((x) => resTop3.has(x)).length;
        const union = new Set([...baseTop3, ...resTop3]).size;
        if (union > 0 && inter / union >= 0.5) top3Agreements++;
      }
    }
  }

  return {
    n,
    dropFraction,
    rank1Stability: rank1Comparisons > 0 ? rank1Agreements / rank1Comparisons : 0,
    top3StabilityJaccard: top3Comparisons > 0 ? top3Agreements / top3Comparisons : 0,
  };
}
