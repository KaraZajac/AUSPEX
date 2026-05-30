/**
 * All-events column (meta events INCLUDED) for the two-column README table.
 * Same LOO, just includeMeta=true. Ops-only numbers come from the standard
 * eval-* scripts. pnpm exec tsx tools/eval-all-events.ts
 */
import { runLeaveOneOut } from '../src/utils/attribution-eval.ts';
import { runDoctrineLOO } from '../src/utils/doctrine-prediction-eval.ts';
import { runPillarLOO } from '../src/utils/pillar-prediction-eval.ts';
import { runJointLOO } from '../src/utils/joint-prediction-eval.ts';

const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(1) : 'n/a');

const a = runLeaveOneOut({}, true);
console.log(`attribution all-events  n=${a.scored}  top1=${pct(a.hit1, a.scored)}  top3=${pct(a.hit3, a.scored)}  MRR=${a.mrr.toFixed(3)}`);
const d = runDoctrineLOO({}, true);
console.log(`doctrine    all-events  n=${d.scored}  top1=${pct(d.hit1, d.scored)}  top3=${pct(d.hit3, d.scored)}  mAP=${d.mAP.toFixed(3)}`);
const p = runPillarLOO({}, true);
console.log(`pillar      all-events  n=${p.scored}  top1=${pct(p.hit1, p.scored)}  top3=${pct(p.hit3, p.scored)}  mAP=${p.mAP.toFixed(3)}`);
const j = runJointLOO({}, true);
console.log(`joint       all-events  n=${j.scored}  top1=${pct(j.hit1, j.scored)}  top3=${pct(j.hit3, j.scored)}  MRR=${j.mrr.toFixed(3)}`);
