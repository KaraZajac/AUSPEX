/**
 * Doctrine-engine accuracy STRATIFIED by the true link's confidence label.
 *
 * Question (enabled by the 2026-06-19 attested re-grade): does the engine
 * predict `attested` doctrine links better than `strongly_inferred` /
 * `plausible` ones? If accuracy is roughly flat across tiers, the inferred
 * links are as learnable as the attested ones — i.e. the WHY-inference is as
 * good as the attestation. If attested >> inferred, attested is the cleaner
 * signal. Either way it is a citable result.
 *
 * Non-invasive: reuses runDoctrineLOO() verbatim (same LOO, same null=miss and
 * supersession-equivalence conventions) and only bins its per-event rankings.
 * Confidence is engine-inert (never read by the engine), so this re-scores the
 * SAME predictions — it cannot change the headline, only partition it.
 *
 * Unit: per-(event, doctrine) instance; a doctrine's confidence on an event is
 * the MAX over its attacker-rationale links (strongest claim AUSPEX makes).
 *
 *   pnpm exec tsx tools/eval-doctrine-by-confidence.ts
 */
import { atlas } from '../src/utils/atlas.ts';
import { isAttackerRationale } from '../src/utils/atlas-core.ts';
import { runDoctrineLOO } from '../src/utils/doctrine-prediction-eval.ts';

const RANK: Record<string, number> = { attested: 3, strongly_inferred: 2, plausible: 1 };
const TIERS = ['attested', 'strongly_inferred', 'plausible'] as const;
type Tier = (typeof TIERS)[number];

const a = atlas();
const eventById = new Map<string, any>();
for (const e of a.events.values()) eventById.set(e.id, e);

const p = (x: number, n: number) => (n ? `${((x / n) * 100).toFixed(1)}%` : 'n/a');

console.log('Running doctrine LOO (the standard eval) and stratifying its results …');
const t0 = Date.now();
const summary = runDoctrineLOO();
console.log(`  LOO done in ${((Date.now() - t0) / 1000).toFixed(1)}s · ${summary.scored} events scored\n`);

// Event-level headline (the README's "doctrine top-1" metric: any true doctrine at rank k).
// Distinct from the per-(event,doctrine) recall reported below.
console.log('Event-level headline (per-event hit; comparable to README "doctrine top-1 68.5%"):');
console.log(`  top-1 ${p(summary.hit1, summary.scored)} · top-3 ${p(summary.hit3, summary.scored)} · top-5 ${p(summary.hit5, summary.scored)} · recall@1 ${(summary.meanRecall1 * 100).toFixed(1)}% · mAP ${summary.mAP.toFixed(3)}\n`);

function linkDoctrine(link: any): string | undefined {
  if (link.doctrine_id) return link.doctrine_id;
  if (link.pillar_id) return a.pillars.get(link.pillar_id)?.doctrineId;
  if (link.program_id) return a.programs.get(link.program_id)?.doctrineId;
  return undefined;
}

const agg = new Map<Tier, { n: number; h1: number; h3: number; h5: number }>();
for (const t of TIERS) agg.set(t, { n: 0, h1: 0, h3: 0, h5: 0 });

for (const ev of summary.events) {
  const event = eventById.get(ev.eventId);
  if (!event) continue;
  const top = ev.top5.map((d) => d.doctrineId);
  // doctrine -> max confidence over its attacker-rationale links
  const conf = new Map<string, Tier>();
  for (const link of event.doctrine_links ?? []) {
    if (!isAttackerRationale(link)) continue;
    const d = linkDoctrine(link);
    const c = link.confidence as Tier;
    if (!d || !(c in RANK)) continue;
    const prev = conf.get(d);
    if (!prev || RANK[c] > RANK[prev]) conf.set(d, c);
  }
  for (const [d, c] of conf) {
    const eq = a.doctrineEquivalenceClass(d);
    const inTopK = (k: number) => top.slice(0, k).some((x) => eq.has(x));
    const row = agg.get(c)!;
    row.n++;
    if (inTopK(1)) row.h1++;
    if (inTopK(3)) row.h3++;
    if (inTopK(5)) row.h5++;
  }
}

const pct = (x: number, n: number) => (n ? `${((x / n) * 100).toFixed(1)}%` : 'n/a');
console.log("Doctrine prediction, stratified by the true link's confidence");
console.log('(per-(event,doctrine) instance; doctrine confidence = max over its attacker-rationale links)\n');
console.log('  tier                 n     top-1    top-3    top-5');
console.log('  ' + '-'.repeat(52));
const all = { n: 0, h1: 0, h3: 0, h5: 0 };
for (const t of TIERS) {
  const r = agg.get(t)!;
  all.n += r.n; all.h1 += r.h1; all.h3 += r.h3; all.h5 += r.h5;
  console.log(`  ${t.padEnd(18)} ${String(r.n).padStart(4)}   ${pct(r.h1, r.n).padStart(6)}  ${pct(r.h3, r.n).padStart(6)}  ${pct(r.h5, r.n).padStart(6)}`);
}
console.log('  ' + '-'.repeat(52));
console.log(`  ${'(all)'.padEnd(18)} ${String(all.n).padStart(4)}   ${pct(all.h1, all.n).padStart(6)}  ${pct(all.h3, all.n).padStart(6)}  ${pct(all.h5, all.n).padStart(6)}`);
