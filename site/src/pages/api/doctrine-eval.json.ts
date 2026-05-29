/**
 * /api/doctrine-eval.json — backtest output for the doctrine-prediction engine.
 * Companion to /api/attribution-eval.json. Regenerated on every site build.
 */
import type { APIRoute } from 'astro';
import { runDoctrineLOO } from '../../utils/doctrine-prediction-eval';

export const GET: APIRoute = () => {
  const summary = runDoctrineLOO();
  const payload = {
    schema_version: '0.1',
    generated_at: summary.generatedAt,
    summary: {
      scored: summary.scored,
      hit1: summary.hit1,
      hit3: summary.hit3,
      hit5: summary.hit5,
      mean_recall_1: summary.meanRecall1,
      mean_recall_3: summary.meanRecall3,
      mean_recall_5: summary.meanRecall5,
      mAP: summary.mAP,
      per_state: Object.fromEntries(summary.perState),
      confusion: summary.confusion,
      worst: summary.worst,
      options: summary.options,
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
