/**
 * Joint (actor × doctrine) prediction engine.
 *
 * Runs the actor-attribution engine and doctrine-prediction engine
 * over the same features, then scores every candidate pair (a, d) as:
 *
 *   joint(a, d) = log P(a | f) + log P(d | f) + log(1 + N(a, d))
 *
 * where N(a, d) is how many times the actor-doctrine pair has been
 * observed in training (the co-occurrence count). The third term
 * rewards plausibility — APT41 × MIC2025 has been seen many times,
 * Lazarus × MIC2025 has not.
 */
import { Atlas, type AuspexEvent } from './atlas-core';
import {
  actorsOfEvent,
  buildProfiles,
  buildVocab,
  buildIDF,
  extractFeatures,
  rankActors,
  type EventFeatures,
  type ScoringOptions as ActorScoringOptions,
  type Vocab,
} from './attribution';
import {
  buildDoctrineProfiles,
  buildDoctrineIDF,
  doctrinesOfEvent,
  rankDoctrines,
  type DoctrineScoringOptions,
} from './doctrine-prediction';

/** Build the (actor, doctrine) co-occurrence count map from training events. */
export function buildCooccurrence(events: AuspexEvent[], atlas: Atlas): Map<string, number> {
  const map = new Map<string, number>();
  for (const ev of events) {
    const actors = [...actorsOfEvent(ev)];
    const doctrines = [...doctrinesOfEvent(ev, atlas)];
    for (const a of actors) {
      for (const d of doctrines) {
        const key = `${a}|${d}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }
  return map;
}

export interface JointPair {
  actorId: string;
  doctrineId: string;
  actorLogScore: number;
  doctrineLogScore: number;
  coOccurrence: number;
  jointScore: number;
  rank: number;
}

export interface JointScoringOptions {
  actor?: ActorScoringOptions;
  doctrine?: DoctrineScoringOptions;
  /** How many actor candidates to consider for pair scoring. */
  actorCandidates?: number;
  /** How many doctrine candidates to consider. */
  doctrineCandidates?: number;
  /** Weight on the co-occurrence term. 0 = ignore, 1 = log(1+n), 2 = 2·log(1+n). */
  coOccurrenceWeight?: number;
  /** Weight on the actor log-prob in the joint score. */
  actorWeight?: number;
  /** Weight on the doctrine log-prob in the joint score. */
  doctrineWeight?: number;
  /** Reference date for temporal profile weighting (when supplied,
   *  training events are weighted exp(-|yearsDiff|/tau) toward this
   *  date). Pass the predicted event's date for LOO. */
  referenceDate?: string | null;
  /** Optional alternative actor ranker (e.g. ComplementNB) returning ranked
   *  actors with a comparable log-score. Default is the NB rankActors; when set,
   *  the NB actor profiles are skipped. Tune actorWeight for the new score scale. */
  actorRanker?: (features: EventFeatures, trainingEvents: AuspexEvent[], atlas: Atlas) => Array<{ actorId: string; logScore: number }>;
}

export function rankPairs(
  features: EventFeatures,
  trainingEvents: AuspexEvent[],
  atlas: Atlas,
  opts: JointScoringOptions = {},
): JointPair[] {
  const aN = opts.actorCandidates ?? 30;
  const dN = opts.doctrineCandidates ?? 15;
  const coW = opts.coOccurrenceWeight ?? 1.0;
  const aW = opts.actorWeight ?? 1.0;
  const dW = opts.doctrineWeight ?? 1.0;

  const buildOpts = opts.referenceDate ? { referenceDate: opts.referenceDate } : {};
  const actorVocab = buildVocab(trainingEvents, atlas);
  const doctrineProfiles = buildDoctrineProfiles(trainingEvents, atlas, buildOpts);
  // Re-use vocab — same feature space.
  const doctrineVocab: Vocab = actorVocab;

  const dIDF = buildDoctrineIDF(doctrineProfiles);
  const co = buildCooccurrence(trainingEvents, atlas);

  let actors: Array<{ actorId: string; logScore: number }>;
  if (opts.actorRanker) {
    actors = opts.actorRanker(features, trainingEvents, atlas).slice(0, aN);
  } else {
    const actorProfiles = buildProfiles(trainingEvents, atlas, buildOpts);
    const aIDF = buildIDF(actorProfiles);
    actors = rankActors(features, actorProfiles, actorVocab, { ...(opts.actor ?? {}), idf: aIDF }).slice(0, aN);
  }
  const doctrines = rankDoctrines(features, doctrineProfiles, doctrineVocab, { ...(opts.doctrine ?? {}), idf: dIDF }).slice(0, dN);

  const pairs: Array<Omit<JointPair, 'rank'>> = [];
  for (const a of actors) {
    for (const d of doctrines) {
      const coCount = co.get(`${a.actorId}|${d.doctrineId}`) ?? 0;
      const coTerm = coW * Math.log(1 + coCount);
      const joint = aW * a.logScore + dW * d.logScore + coTerm;
      pairs.push({
        actorId: a.actorId,
        doctrineId: d.doctrineId,
        actorLogScore: a.logScore,
        doctrineLogScore: d.logScore,
        coOccurrence: coCount,
        jointScore: joint,
      });
    }
  }
  pairs.sort((a, b) => b.jointScore - a.jointScore);
  return pairs.map((p, i) => ({ ...p, rank: i + 1 }));
}
