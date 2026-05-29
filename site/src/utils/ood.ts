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
import { extractFeatures, type EventFeatures } from './attribution';

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
