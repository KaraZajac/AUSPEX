/**
 * /api/pillar-eval.json — backtest for the pillar-prediction engine.
 */
import type { APIRoute } from 'astro';
import { runPillarLOO } from '../../utils/pillar-prediction-eval';

export const GET: APIRoute = () => {
  const s = runPillarLOO();
  const payload = {
    schema_version: '0.1',
    generated_at: s.generatedAt,
    summary: {
      scored: s.scored,
      hit1: s.hit1,
      hit3: s.hit3,
      hit5: s.hit5,
      mean_recall_1: s.meanRecall1,
      mean_recall_3: s.meanRecall3,
      mean_recall_5: s.meanRecall5,
      mAP: s.mAP,
      doctrine_right_pillar_wrong: s.doctrineRightPillarWrong,
      per_state: Object.fromEntries(s.perState),
      confusion: s.confusion,
      worst: s.worst,
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
