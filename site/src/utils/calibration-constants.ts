/**
 * Fitted temperature-scaling constants for engine probability
 * outputs. Computed by `fitAllCalibrations()` against current LOO
 * predictions; baked here so the /predict UI and any other consumer
 * can apply calibration without re-running LOO at request time.
 *
 * Refit whenever the corpus changes substantially, or the engine
 * configuration changes.
 */
// Refit 2026-05-29 (AUDIT-2026-05-29) on the DEPLOYED config — the same
// settings the eval/OOD paths use: null=miss LOO, λ=0.2 service prior +
// malware-lineage grouping (attribution), and inferred-campaign LOO
// suppression. Temperatures are unchanged at T = 2.0 / 3.0 / 3.0 (robust
// across config variants). Attribution's improvement-pct fell 27.8 → 17.9
// once fit on the deployed distribution — the prior figure was fit WITHOUT
// the service prior / lineage and overstated the NLL gain. Doctrine and
// pillar are essentially unchanged (those engines use no service prior).
export const CALIBRATION = {
  attribution: { temperature: 2.0, improvementPct: 17.9, sampleSize: 497 },
  doctrine:    { temperature: 3.0, improvementPct: 38.9, sampleSize: 554 },
  pillar:      { temperature: 3.0, improvementPct: 43.2, sampleSize: 484 },
} as const;

export type EngineKind = keyof typeof CALIBRATION;
