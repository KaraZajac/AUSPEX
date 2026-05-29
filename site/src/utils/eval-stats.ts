/**
 * Bootstrap confidence intervals for engine evaluation metrics.
 *
 * Standard non-parametric bootstrap: resample N events with
 * replacement, compute the metric on the resample, repeat. The
 * 2.5% / 97.5% quantiles give a 95% CI under the assumption that
 * the held-out events are i.i.d. samples from the population of
 * "future events the engine might be asked about." That assumption
 * is imperfect (events cluster by year and actor), but it's the
 * standard ML reporting move.
 *
 * Per-event metric values must be precomputed by the caller so the
 * resample operates on a small array of scalars rather than re-
 * running the full LOO.
 */
export interface CI {
  /** Point estimate from the full sample (no resampling). */
  point: number;
  /** 2.5th percentile from the bootstrap distribution. */
  lower: number;
  /** 97.5th percentile from the bootstrap distribution. */
  upper: number;
  /** Number of bootstrap iterations. */
  n: number;
}

/**
 * Bootstrap CI over a metric that aggregates per-event scalars by mean.
 * For hit@K, pass booleans-as-{0,1}. For MRR, pass per-event reciprocal
 * ranks. For mAP, pass per-event average-precision scores. The metric
 * is always the arithmetic mean of the resampled array.
 *
 * Default 2000 iterations, 95% CI. Seeded with a deterministic LCG so
 * that reported numbers are reproducible across builds.
 */
export function bootstrapMeanCI(values: number[], iterations = 2000, alpha = 0.05, seed = 0xC0FFEE): CI {
  const n = values.length;
  if (n === 0) return { point: 0, lower: 0, upper: 0, n: 0 };
  const point = values.reduce((s, v) => s + v, 0) / n;
  if (n === 1) return { point, lower: point, upper: point, n: 1 };

  // Minimal deterministic LCG (Numerical Recipes constants). Replaces
  // Math.random so the CIs don't drift between builds.
  let state = seed >>> 0;
  function rand(): number {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  }

  const draws = new Array<number>(iterations);
  for (let it = 0; it < iterations; it++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const j = Math.floor(rand() * n);
      sum += values[j];
    }
    draws[it] = sum / n;
  }
  draws.sort((a, b) => a - b);
  const loIdx = Math.floor((alpha / 2) * iterations);
  const hiIdx = Math.min(iterations - 1, Math.ceil((1 - alpha / 2) * iterations) - 1);
  return { point, lower: draws[loIdx], upper: draws[hiIdx], n };
}

/** Format a CI as `point%  [lo%, hi%]`. */
export function fmtPctCI(ci: CI, decimals = 1): string {
  const p = (ci.point * 100).toFixed(decimals);
  const lo = (ci.lower * 100).toFixed(decimals);
  const hi = (ci.upper * 100).toFixed(decimals);
  return `${p}%  [${lo}, ${hi}]`;
}

/** Format a CI as `point  [lo, hi]` for non-percentage metrics. */
export function fmtNumCI(ci: CI, decimals = 3): string {
  return `${ci.point.toFixed(decimals)}  [${ci.lower.toFixed(decimals)}, ${ci.upper.toFixed(decimals)}]`;
}
