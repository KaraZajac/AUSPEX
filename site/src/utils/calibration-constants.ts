/**
 * Fitted temperature-scaling constants for engine probability
 * outputs. Computed by `fitAllCalibrations()` against current LOO
 * predictions; baked here so the /predict UI and any other consumer
 * can apply calibration without re-running LOO at request time.
 *
 * Refit whenever the corpus changes substantially, or the engine
 * configuration changes.
 */
// Refit 2026-05-30 on the QC'd 815-event corpus (grown from 658 via the backfill
// + targeted depth + actor-wiring QC). Temperatures are UNCHANGED at
// T = 2.0 / 3.0 / 3.0 — robust to the corpus expansion, as in every prior refit
// (null=miss LOO, λ=0.2 service prior + malware-lineage grouping, inferred-campaign
// LOO suppression). Only the eval sample sizes and NLL-improvement percentages moved.
export const CALIBRATION = {
  attribution: { temperature: 2.0, improvementPct: 19.6, sampleSize: 564 },
  doctrine:    { temperature: 3.0, improvementPct: 38.1, sampleSize: 480 },
  pillar:      { temperature: 3.0, improvementPct: 42.8, sampleSize: 426 },
} as const;

export type EngineKind = keyof typeof CALIBRATION;

/**
 * Apply a fitted temperature to a set of log-scores and return calibrated
 * probabilities. Pure math — lives here (rather than in calibration.ts,
 * which pulls in the fs-bound atlas() singleton) so the browser/OOD graph
 * stays fs-free. Re-exported from calibration.ts for existing callers.
 */
export function calibratedProbs(scores: number[], temperature: number): number[] {
  if (scores.length === 0) return [];
  const scaled = scores.map((s) => s / temperature);
  const m = Math.max(...scaled);
  const exp = scaled.map((s) => Math.exp(s - m));
  const sum = exp.reduce((a, b) => a + b, 0);
  return sum > 0 ? exp.map((e) => e / sum) : exp.map(() => 0);
}
