/**
 * Fitted temperature-scaling constants for engine probability
 * outputs. Computed by `fitAllCalibrations()` against current LOO
 * predictions; baked here so the /predict UI and any other consumer
 * can apply calibration without re-running LOO at request time.
 *
 * Refit whenever the corpus changes substantially (e.g., a
 * significant batch of new events). Last fit: 2026-05-27, against
 * the temporal + IDF engine over 425 events.
 */
// Refit 2026-05-28 against the full-stack engine over 658 events
// (UK/FR/SK/UAE doctrine-state expansion + per-state backfill pass +
// task-12 latent campaign clustering + ShinyHunters corpus).
// Temperatures stable at T = 2.0 / 3.0 / 3.0; improvement-pct drifted
// slightly down across all three engines as the larger backfilled
// corpus made raw logits marginally less overconfident on average.
export const CALIBRATION = {
  attribution: { temperature: 2.0, improvementPct: 27.8, sampleSize: 502 },
  doctrine:    { temperature: 3.0, improvementPct: 39.1, sampleSize: 554 },
  pillar:      { temperature: 3.0, improvementPct: 43.5, sampleSize: 484 },
} as const;

export type EngineKind = keyof typeof CALIBRATION;
