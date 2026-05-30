/**
 * Temperature scaling for engine probabilities.
 *
 * The Bayesian engines return log-scores whose softmax produces
 * peaky probabilities that DON'T reflect actual confidence — a
 * top-1 prediction at "P=85%" is wrong half the time. Temperature
 * scaling fits a single scalar T such that scaling the log-scores
 * by 1/T before softmax minimizes log-loss against held-out truth.
 *
 * T > 1 spreads probabilities out (less confident); T < 1 sharpens.
 * Calibrated probabilities give the UI's abstain threshold actual
 * meaning: "P < 0.4 across all candidates → likely non-state /
 * out-of-distribution."
 *
 * Fit by grid search; the underlying loss is convex in 1/T so
 * a coarse grid finds the minimum cleanly.
 */
import { atlas, isMetaEvent } from './atlas';
// calibratedProbs lives in calibration-constants (pure, fs-free) so the
// browser/OOD graph never pulls in the fs-bound atlas() singleton. Re-export
// it here for existing callers (research/*-eval.astro).
export { calibratedProbs } from './calibration-constants';
import {
  actorsOfEvent,
  buildProfiles,
  buildVocab,
  buildIDF,
  extractFeatures,
  rankActors,
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

export interface CalibrationFit {
  temperature: number;
  baselineLoss: number;   // loss at T=1
  calibratedLoss: number; // loss at fitted T
  improvementPct: number; // (baselineLoss - calibratedLoss) / baselineLoss * 100
  sampleSize: number;
}

export interface PredictionRecord {
  scores: number[];
  trueIdx: number;        // index in `scores` of the true label
}

const TEMPS = [0.25, 0.4, 0.55, 0.7, 0.85, 1.0, 1.2, 1.5, 2.0, 3.0, 5.0, 8.0, 12.0, 20.0];

/** Fit the temperature that minimizes negative-log-likelihood. */
export function fitTemperature(predictions: PredictionRecord[]): CalibrationFit {
  let bestT = 1.0;
  let bestLoss = Infinity;
  let baselineLoss = 0;
  for (const T of TEMPS) {
    let loss = 0;
    for (const pred of predictions) {
      const scaled = pred.scores.map((s) => s / T);
      const m = Math.max(...scaled);
      const exp = scaled.map((s) => Math.exp(s - m));
      const sum = exp.reduce((a, b) => a + b, 0);
      const trueProb = sum > 0 ? exp[pred.trueIdx] / sum : 0;
      loss += -Math.log(Math.max(trueProb, 1e-12));
    }
    if (T === 1.0) baselineLoss = loss;
    if (loss < bestLoss) {
      bestLoss = loss;
      bestT = T;
    }
  }
  return {
    temperature: bestT,
    baselineLoss,
    calibratedLoss: bestLoss,
    improvementPct: baselineLoss > 0 ? ((baselineLoss - bestLoss) / baselineLoss) * 100 : 0,
    sampleSize: predictions.length,
  };
}

/** Run LOO over the attribution engine and collect predictions for calibration. */
function attributionPredictions(): PredictionRecord[] {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));
  const recs: PredictionRecord[] = [];
  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    // Calibration must be fit on the SAME config the deployed eval uses (AUDIT-2026-05-29):
    // λ=0.2 service prior, malware-lineage grouping, and inferred-campaign LOO suppression —
    // otherwise T is fit on a score distribution the engine no longer produces.
    const profiles = buildProfiles(training, a, refDate ? { referenceDate: refDate, servicePriorLambda: 0.2 } : { servicePriorLambda: 0.2 });
    const vocab = buildVocab(training, a);
    const idf = buildIDF(profiles);
    const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null;
    const ranked = rankActors(features, profiles, vocab, { idf, malwareLineageGroup: a.malwareLineageGroup });
    const scores = ranked.map((r) => r.logScore);
    // Multi-label: pick the best-ranking true actor for the calibration target.
    const trueActors = actorsOfEvent(heldOut);
    let bestRank = -1;
    for (let i = 0; i < ranked.length; i++) {
      if (trueActors.has(ranked[i].actorId)) {
        bestRank = i;
        break;
      }
    }
    if (bestRank >= 0) recs.push({ scores, trueIdx: bestRank });
  }
  return recs;
}

function doctrinePredictions(): PredictionRecord[] {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => doctrinesOfEvent(e, a).size > 0 && !isMetaEvent(e));
  const recs: PredictionRecord[] = [];
  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const profiles = buildDoctrineProfiles(training, a, refDate ? { referenceDate: refDate } : {});
    const vocab = buildVocab(training, a);
    const idf = buildDoctrineIDF(profiles);
    const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null; // match deployed eval (AUDIT-2026-05-29)
    const ranked = rankDoctrines(features, profiles, vocab, { idf });
    const scores = ranked.map((r) => r.logScore);
    const trueSet = doctrinesOfEvent(heldOut, a);
    let bestRank = -1;
    for (let i = 0; i < ranked.length; i++) {
      if (trueSet.has(ranked[i].doctrineId)) {
        bestRank = i;
        break;
      }
    }
    if (bestRank >= 0) recs.push({ scores, trueIdx: bestRank });
  }
  return recs;
}

function pillarPredictions(): PredictionRecord[] {
  const a = atlas();
  const allEvents = [...a.events.values()];
  const labeled = allEvents.filter((e) => pillarsOfEvent(e, a).size > 0 && !isMetaEvent(e));
  const recs: PredictionRecord[] = [];
  for (const heldOut of labeled) {
    const training = allEvents.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const profiles = buildPillarProfiles(training, a, refDate ? { referenceDate: refDate } : {});
    const vocab = buildVocab(training, a);
    const idf = buildPillarIDF(profiles);
    const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null; // match deployed eval (AUDIT-2026-05-29)
    const ranked = rankPillars(features, profiles, vocab, { idf });
    const scores = ranked.map((r) => r.logScore);
    const trueSet = pillarsOfEvent(heldOut, a);
    let bestRank = -1;
    for (let i = 0; i < ranked.length; i++) {
      if (trueSet.has(ranked[i].pillarId)) {
        bestRank = i;
        break;
      }
    }
    if (bestRank >= 0) recs.push({ scores, trueIdx: bestRank });
  }
  return recs;
}

export interface CalibrationConstants {
  attribution: CalibrationFit;
  doctrine: CalibrationFit;
  pillar: CalibrationFit;
}

/** Fit temperature for all three engines using current LOO predictions. */
export function fitAllCalibrations(): CalibrationConstants {
  return {
    attribution: fitTemperature(attributionPredictions()),
    doctrine:    fitTemperature(doctrinePredictions()),
    pillar:      fitTemperature(pillarPredictions()),
  };
}
