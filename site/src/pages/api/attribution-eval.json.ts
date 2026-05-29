/**
 * /api/attribution-eval.json — backtest output for the attribution engine.
 * Regenerated on every site build. See /research/attribution-eval for
 * the human-readable rendering.
 */
import type { APIRoute } from 'astro';
import { runLeaveOneOut, runStability } from '../../utils/attribution-eval';

export const GET: APIRoute = () => {
  const summary = runLeaveOneOut();
  const stability = runStability(8, 0.1);
  const payload = {
    schema_version: '0.1',
    generated_at: summary.generatedAt,
    summary: {
      scored: summary.scored,
      hit1: summary.hit1,
      hit3: summary.hit3,
      hit5: summary.hit5,
      hit10: summary.hit10,
      mrr: summary.mrr,
      per_state: Object.fromEntries(summary.perState),
      confusion: summary.confusion,
      worst: summary.worst,
      options: summary.options,
    },
    stability,
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};
