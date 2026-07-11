/**
 * Fitted temperature-scaling constants for engine probability
 * outputs. Computed by `fitAllCalibrations()` against current LOO
 * predictions; baked here so the /predict UI and any other consumer
 * can apply calibration without re-running LOO at request time.
 *
 * Refit whenever the corpus changes substantially, or the engine
 * configuration changes.
 */
// Refit 2026-07-11 on the 785-event corpus after the completed 100% verification
// census (which cleaned the corpus down from 815 by removing fabricated/duplicate
// events). Temperatures are UNCHANGED at T = 2.0 / 3.0 / 3.0 — robust across every
// prior refit, this one included (null=miss LOO, λ=0.2 service prior + malware-lineage
// grouping, inferred-campaign LOO suppression). The eval sample sizes and NLL-improvement
// percentages moved with the corpus (calibration improved on the cleaner label space).
export const CALIBRATION = {
  attribution: { temperature: 2.0, improvementPct: 24.5, sampleSize: 494 },
  doctrine:    { temperature: 3.0, improvementPct: 44.1, sampleSize: 494 },
  pillar:      { temperature: 3.0, improvementPct: 45.4, sampleSize: 420 },
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
