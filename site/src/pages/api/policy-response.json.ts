/**
 * /api/policy-response.json — historical lag-distribution analysis.
 */
import type { APIRoute } from 'astro';
import { runPolicyResponseAnalysis } from '../../utils/policy-response-analysis';

export const GET: APIRoute = () => {
  const r = runPolicyResponseAnalysis({ minInstances: 3 });
  return new Response(JSON.stringify(r, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};
