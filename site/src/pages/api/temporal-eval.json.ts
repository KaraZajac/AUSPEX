/**
 * /api/temporal-eval.json — temporal-holdout backtest for all four engines.
 */
import type { APIRoute } from 'astro';
import { runAllTemporal } from '../../utils/temporal-eval';

export const GET: APIRoute = () => {
  const trainEnd = '2023-12-31';
  const r = runAllTemporal(trainEnd);
  function flat(s: typeof r.attribution) {
    return {
      engine: s.engine,
      train_end: s.trainEnd,
      train_size: s.trainSize,
      test_size: s.testSize,
      scored: s.scored,
      unrankable: s.unrankable, // cold-start events counted as misses (null=miss)
      hit1: s.hit1,
      hit3: s.hit3,
      hit5: s.hit5,
      hit10: s.hit10,
      mrr: s.mrr,
      per_year: Object.fromEntries(s.perYear),
      per_state: Object.fromEntries(s.perState),
      worst: s.worst,
    };
  }
  const payload = {
    schema_version: '0.1',
    generated_at: r.generatedAt,
    train_end: trainEnd,
    summary: {
      attribution: flat(r.attribution),
      doctrine: flat(r.doctrine),
      pillar: flat(r.pillar),
      joint: flat(r.joint),
    },
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};
