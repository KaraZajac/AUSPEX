/**
 * Out-of-distribution detection.
 *
 * Given an event, compute how unlike it is to anything in the
 * training corpus. Independent of which actor / doctrine the
 * engine predicts — the OOD score answers a different question:
 * "does this event fit ANY known pattern?"
 *
 * Use case: catch label-level deception (NotPetya-as-ransomware
 * counterfactual). Even if the attribution engine picks an
 * actor with high apparent confidence, a high OOD score warns
 * "this doesn't look like anything in training" — flag for
 * human review.
 *
 * Method: Jaccard similarity over a multi-family feature set.
 * For each training event, compute Jaccard with the query
 * event; the OOD distance is 1 - max(similarity) across the
 * training set. k-NN max-similarity is more robust than mean
 * because it only requires the event to look like SOMETHING
 * familiar — outliers fail every comparison.
 */
import { Atlas, type AuspexEvent } from './atlas';
import {
  extractFeatures,
  type EventFeatures,
  buildProfiles,
  buildVocab,
  buildIDF,
  rankActors,
  actorsOfEvent,
} from './attribution';
import { calibratedProbs } from './calibration';
import { CALIBRATION } from './calibration-constants';

/** Build the flat feature-string set used for Jaccard comparison. */
function featureSet(f: EventFeatures): Set<string> {
  const s = new Set<string>();
  for (const v of f.sectors) s.add('sec:' + v);
  for (const v of f.countries) s.add('cn:' + v);
  if (f.vector) s.add('vec:' + f.vector);
  for (const v of f.incidentTypes) s.add('it:' + v);
  for (const v of f.ttps) s.add('ttp:' + v);
  for (const v of f.malware) s.add('mw:' + v);
  for (const v of f.targets) s.add('tgt:' + v);
  return s;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface OODResult {
  /** 0 = identical to a training event, 1 = no shared features with any training event. */
  distance: number;
  /** Max Jaccard similarity (== 1 - distance). */
  nearestSimilarity: number;
  /** Event id of the closest training event. null if training set was empty. */
  nearestEventId: string | null;
  /** Tier label for UI: "in-distribution" / "borderline" / "out-of-distribution". */
  tier: 'in-distribution' | 'borderline' | 'out-of-distribution';
  /** Number of training events with Jaccard >= 0.3 — measures how broadly the event fits. */
  closeNeighborCount: number;
}

/**
 * Compute OOD for one query event against a training set.
 *
 * Thresholds chosen by inspection of the LOO eval distribution:
 *   distance < 0.55  → in-distribution (well-represented)
 *   0.55 – 0.75      → borderline
 *   > 0.75           → out-of-distribution (no close match)
 */
export function computeOOD(event: AuspexEvent, training: AuspexEvent[], atlas: Atlas): OODResult {
  const queryFV = featureSet(extractFeatures(event, atlas));
  let bestSim = 0;
  let bestId: string | null = null;
  let closeCount = 0;
  for (const train of training) {
    if (train.id === event.id) continue;
    const trainFV = featureSet(extractFeatures(train, atlas));
    const sim = jaccard(queryFV, trainFV);
    if (sim >= 0.3) closeCount++;
    if (sim > bestSim) {
      bestSim = sim;
      bestId = train.id;
    }
  }
  const distance = 1 - bestSim;
  let tier: OODResult['tier'];
  if (distance < 0.55) tier = 'in-distribution';
  else if (distance < 0.75) tier = 'borderline';
  else tier = 'out-of-distribution';
  return {
    distance,
    nearestSimilarity: bestSim,
    nearestEventId: bestId,
    tier,
    closeNeighborCount: closeCount,
  };
}

// ─── calibrated-softmax-entropy OOD (Hendrycks & Gimpel 2016 style) ───

/**
 * Shannon entropy of a probability vector, in nats. Higher entropy =
 * the model is spread thin across many candidates = it doesn't know.
 */
export function entropy(probs: number[]): number {
  let H = 0;
  for (const p of probs) {
    if (p > 0) H -= p * Math.log(p);
  }
  return H;
}

export interface EntropyOODResult {
  /** Calibrated softmax entropy in nats. */
  entropy: number;
  /** Top-1 calibrated probability (the "maximum softmax probability"
   *  signal from the Hendrycks-Gimpel paper). Higher = more confident. */
  maxProb: number;
  /** Where this event's entropy sits in the training-event entropy
   *  distribution (0 = lowest entropy, 1 = highest). null if no
   *  training distribution provided. */
  entropyPercentile: number | null;
  /** Tier label using the percentile against the training distribution:
   *   < 0.85  in-distribution
   *  0.85-0.95 borderline
   *  > 0.95  out-of-distribution
   *  Falls back to 'in-distribution' if no training distribution. */
  tier: 'in-distribution' | 'borderline' | 'out-of-distribution';
}

/**
 * Compute calibrated-softmax-entropy OOD for a query event.
 *
 * Methodology: train NB on the training corpus, score the query
 * event, softmax-with-temperature the top-K log-scores, take Shannon
 * entropy. Compare to the entropy distribution on training events
 * (held-out via LOO) — high-entropy queries are OOD.
 *
 * The entropy signal is principled (no hand-tuned thresholds beyond
 * the percentile cutoffs) and aligns with the standard ML literature
 * on OOD detection. Complementary to the Jaccard nearest-neighbor
 * measure, which catches structural novelty even when the engine
 * happens to be peaky for the wrong reason.
 *
 * @param trainingEntropies Pre-computed entropy distribution on
 *        training events (via runOODBaselineEval). Sorted ascending.
 *        If omitted, returns the entropy without a tier classification.
 */
export function computeEntropyOOD(
  event: AuspexEvent,
  training: AuspexEvent[],
  atlas: Atlas,
  trainingEntropies?: number[],
): EntropyOODResult {
  // Train NB on the training set.
  const profiles = buildProfiles(training, atlas, { servicePriorLambda: 0.1 });
  const vocab = buildVocab(training, atlas);
  const idf = buildIDF(profiles);
  // Score the query.
  const features = extractFeatures(event, atlas);
  const ranked = rankActors(features, profiles, vocab, { idf, malwareLineageGroup: atlas.malwareLineageGroup });
  // Calibrated softmax over the top-K (K=10).
  const topK = ranked.slice(0, 10).map((r) => r.logScore);
  const probs = calibratedProbs(topK, CALIBRATION.attribution.temperature);
  const H = entropy(probs);
  const maxProb = probs.length > 0 ? probs[0] : 0;

  let entropyPercentile: number | null = null;
  let tier: EntropyOODResult['tier'] = 'in-distribution';
  if (trainingEntropies && trainingEntropies.length > 0) {
    // ECDF: fraction of training entropies strictly less than H.
    let i = 0;
    while (i < trainingEntropies.length && trainingEntropies[i] < H) i++;
    entropyPercentile = i / trainingEntropies.length;
    if (entropyPercentile >= 0.95) tier = 'out-of-distribution';
    else if (entropyPercentile >= 0.85) tier = 'borderline';
  }

  return { entropy: H, maxProb, entropyPercentile, tier };
}

/**
 * Compute the training-event entropy distribution under LOO. Each
 * event held out, NB retrained on the rest, calibrated entropy
 * recorded. Returns ascending-sorted entropies (and per-event
 * Jaccard distance for cross-methodology comparison).
 *
 * Standalone-tool function — expensive. Cache the result.
 */
export function runOODBaselineEval(atlas: Atlas): {
  events: Array<{
    eventId: string;
    eventName: string;
    startDate: string | undefined;
    trueState: string | undefined;
    entropy: number;
    maxProb: number;
    jaccardDistance: number;
    correct: boolean;
    bestRank: number | null;
  }>;
  trainingEntropiesSorted: number[];
  generatedAt: string;
} {
  const allEvents = [...atlas.events.values()];
  const labeled = allEvents.filter((e) => actorsOfEvent(e).size > 0);

  const events: ReturnType<typeof runOODBaselineEval>['events'] = [];
  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    // Score with NB.
    const profiles = buildProfiles(training, atlas, { servicePriorLambda: 0.1 });
    const vocab = buildVocab(training, atlas);
    const idf = buildIDF(profiles);
    const features = extractFeatures(heldOut, atlas);
    const ranked = rankActors(features, profiles, vocab, { idf, malwareLineageGroup: atlas.malwareLineageGroup });
    const topK = ranked.slice(0, 10).map((r) => r.logScore);
    const probs = calibratedProbs(topK, CALIBRATION.attribution.temperature);
    const H = entropy(probs);
    const maxProb = probs.length > 0 ? probs[0] : 0;
    // Jaccard distance to nearest training event (max-similarity).
    const jacRes = computeOOD(heldOut, training, atlas);
    // Correctness of rank-1.
    const trueActorSet = actorsOfEvent(heldOut);
    const top1 = ranked[0]?.actorId;
    const correct = top1 ? trueActorSet.has(top1) : false;
    const trueRanks = [...trueActorSet].map((aid) => ranked.findIndex((c) => c.actorId === aid) + 1).filter((r) => r > 0);
    const bestRank = trueRanks.length > 0 ? Math.min(...trueRanks) : null;

    // Derive trueState
    let trueState: string | undefined;
    for (const aid of trueActorSet) {
      const svc = atlas.actors.get(aid)?.primary_service_id;
      if (svc) { trueState = svc.split('/')[0]; break; }
      const head = aid.split('/')[0];
      if (head === 'criminal') { trueState = 'criminal'; break; }
      if (head && head.length === 2) { trueState = head; break; }
    }

    events.push({
      eventId: heldOut.id,
      eventName: heldOut.name,
      startDate: heldOut.start_date,
      trueState,
      entropy: H,
      maxProb,
      jaccardDistance: jacRes.distance,
      correct,
      bestRank,
    });
  }

  const trainingEntropiesSorted = events.map((e) => e.entropy).sort((a, b) => a - b);
  return { events, trainingEntropiesSorted, generatedAt: new Date().toISOString() };
}
