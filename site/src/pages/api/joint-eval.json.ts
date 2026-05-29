/**
 * /api/joint-eval.json — backtest output for the joint (actor × doctrine) engine.
 */
import type { APIRoute } from 'astro';
import { runJointLOO } from '../../utils/joint-prediction-eval';

export const GET: APIRoute = () => {
  const s = runJointLOO();
  const payload = {
    schema_version: '0.1',
    generated_at: s.generatedAt,
    summary: {
      scored: s.scored,
      hit1: s.hit1,
      hit3: s.hit3,
      hit5: s.hit5,
      hit10: s.hit10,
      mrr: s.mrr,
      per_state: Object.fromEntries(s.perState),
      worst: s.worst,
      confident_hits: s.confidentHits,
      options: s.options,
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
