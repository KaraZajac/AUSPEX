/**
 * Learning curve — is the corpus the bottleneck?
 *
 * For a grid of corpus fractions f, we Bernoulli-subsample the atlas to ~f·N
 * events (seeded), run the SAME leave-one-out protocol the headline numbers
 * use (λ=0.2 service prior, prose-DF self-exclusion, inferred-campaign
 * suppression, supersession-equivalence folding for doctrine), and record
 * top-1 / top-3 over the labeled, non-meta (operations-only) events in the
 * subsample. Multiple seeds per fraction give a spread.
 *
 * Reading the curve: if accuracy is still climbing as f→1, more data pays;
 * if it has flattened, feature/model work matters more than collection.
 *
 *   pnpm exec tsx tools/learning-curve.ts
 *
 * Writes site/.cache/learning-curve.json. Fully reproducible (seeded LCG).
 */
import { atlas, isMetaEvent, type AuspexEvent } from '../src/utils/atlas.ts';
import {
  actorsOfEvent, buildProfiles, buildVocab, buildIDF, extractFeatures, rankActors,
} from '../src/utils/attribution.ts';
import {
  doctrinesOfEvent, buildDoctrineProfiles, buildDoctrineIDF, rankDoctrines,
} from '../src/utils/doctrine-prediction.ts';
import { writeFileSync, mkdirSync } from 'node:fs';

const FRACTIONS = [0.3, 0.5, 0.7, 0.85, 1.0];
const SEEDS = 4; // seeds per fraction (f=1.0 is deterministic → 1 run)
const BASE_SEED = 0xc0ffee;

type Head = { n: number; top1: number; top3: number };

// Numerical-Recipes LCG — same family as the stability resampler, so the
// curve is reproducible build-to-build.
function mkRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const a = atlas();
const allEvents = [...a.events.values()];

function attrLOO(sample: AuspexEvent[]): Head {
  const labeled = sample.filter((e) => actorsOfEvent(e).size > 0 && !isMetaEvent(e));
  let h1 = 0, h3 = 0;
  for (const heldOut of labeled) {
    const training = sample.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const profiles = buildProfiles(training, a, { referenceDate: refDate, servicePriorLambda: 0.2 });
    const vocab = buildVocab(training, a);
    const idf = buildIDF(profiles);
    const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null;
    const ranked = rankActors(features, profiles, vocab, { idf, malwareLineageGroup: a.malwareLineageGroup });
    const ranks = [...actorsOfEvent(heldOut)]
      .map((tid) => ranked.findIndex((c) => c.actorId === tid) + 1)
      .filter((r) => r > 0);
    const bestRank = ranks.length ? Math.min(...ranks) : null;
    if (bestRank === 1) h1++;
    if (bestRank !== null && bestRank <= 3) h3++;
  }
  const n = Math.max(labeled.length, 1);
  return { n: labeled.length, top1: h1 / n, top3: h3 / n };
}

function docLOO(sample: AuspexEvent[]): Head {
  const labeled = sample.filter((e) => doctrinesOfEvent(e, a).size > 0 && !isMetaEvent(e));
  let h1 = 0, h3 = 0;
  for (const heldOut of labeled) {
    const training = sample.filter((e) => e.id !== heldOut.id);
    const refDate = heldOut.start_date ?? heldOut.disclosure_date;
    const profiles = buildDoctrineProfiles(training, a, refDate ? { referenceDate: refDate } : {});
    const vocab = buildVocab(training, a);
    const idf = buildDoctrineIDF(profiles);
    const features = extractFeatures(heldOut, a, { excludeSelfFromProseDF: true });
    features.inferredCampaign = null;
    const ranked = rankDoctrines(features, profiles, vocab, { idf });
    const trueSet = new Set<string>();
    for (const d of doctrinesOfEvent(heldOut, a)) for (const eq of a.doctrineEquivalenceClass(d)) trueSet.add(eq);
    let bestRank: number | null = null;
    for (const c of ranked) { if (trueSet.has(c.doctrineId)) { bestRank = c.rank; break; } }
    if (bestRank === 1) h1++;
    if (bestRank !== null && bestRank <= 3) h3++;
  }
  const n = Math.max(labeled.length, 1);
  return { n: labeled.length, top1: h1 / n, top3: h3 / n };
}

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(xs.length, 1);
const std = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
};
const pct = (x: number) => (x * 100).toFixed(1);

interface Point {
  fraction: number;
  seeds: number;
  attrN: number; docN: number;
  attrTop1Mean: number; attrTop1Std: number; attrTop3Mean: number;
  docTop1Mean: number; docTop1Std: number; docTop3Mean: number;
}

const points: Point[] = [];
const t0 = Date.now();
console.log('frac  seeds  ~N(attr/doc)   attr top1 (±sd) / top3      doctrine top1 (±sd) / top3');
console.log('────────────────────────────────────────────────────────────────────────────────');
for (const f of FRACTIONS) {
  const nSeeds = f >= 0.999 ? 1 : SEEDS;
  const aT1: number[] = [], aT3: number[] = [], dT1: number[] = [], dT3: number[] = [], aN: number[] = [], dN: number[] = [];
  for (let k = 0; k < nSeeds; k++) {
    const rand = mkRand(BASE_SEED + Math.round(f * 1000) * 97 + k * 7919);
    const sample = f >= 0.999 ? allEvents : allEvents.filter(() => rand() < f);
    const A = attrLOO(sample); const D = docLOO(sample);
    aT1.push(A.top1); aT3.push(A.top3); aN.push(A.n);
    dT1.push(D.top1); dT3.push(D.top3); dN.push(D.n);
  }
  const p: Point = {
    fraction: f, seeds: nSeeds,
    attrN: Math.round(mean(aN)), docN: Math.round(mean(dN)),
    attrTop1Mean: mean(aT1), attrTop1Std: std(aT1), attrTop3Mean: mean(aT3),
    docTop1Mean: mean(dT1), docTop1Std: std(dT1), docTop3Mean: mean(dT3),
  };
  points.push(p);
  console.log(
    `${f.toFixed(2)}   ${String(nSeeds).padStart(2)}    ${String(p.attrN).padStart(3)}/${String(p.docN).padStart(3)}` +
    `        ${pct(p.attrTop1Mean).padStart(5)} (±${pct(p.attrTop1Std)}) / ${pct(p.attrTop3Mean).padStart(5)}` +
    `      ${pct(p.docTop1Mean).padStart(5)} (±${pct(p.docTop1Std)}) / ${pct(p.docTop3Mean).padStart(5)}` +
    `   [${((Date.now() - t0) / 1000).toFixed(0)}s]`,
  );
}

// Tail slope: top-1 gain per +100 events over the last segment (0.85→1.0).
function tailSlope(get: (p: Point) => number, getN: (p: Point) => number): number {
  const a2 = points[points.length - 2], b = points[points.length - 1];
  const dN = getN(b) - getN(a2);
  return dN !== 0 ? ((get(b) - get(a2)) * 100) / (dN / 100) : 0; // pp per +100 events
}
const attrSlope = tailSlope((p) => p.attrTop1Mean, (p) => p.attrN);
const docSlope = tailSlope((p) => p.docTop1Mean, (p) => p.docN);

console.log('\nTail slope (top-1 pp per +100 events, over 0.85→1.0):');
console.log(`  attribution: ${attrSlope >= 0 ? '+' : ''}${attrSlope.toFixed(2)} pp/100   doctrine: ${docSlope >= 0 ? '+' : ''}${docSlope.toFixed(2)} pp/100`);
console.log(attrSlope > 1 || docSlope > 1
  ? '  → still climbing: more data is likely to pay off.'
  : '  → flattening: feature/model work likely beats raw collection.');

mkdirSync('.cache', { recursive: true });
writeFileSync('.cache/learning-curve.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  method: 'Bernoulli subsample → full LOO at each fraction; ops-only (non-meta); λ=0.2; seeded LCG.',
  fractions: FRACTIONS, seedsPerFraction: SEEDS, baseSeed: BASE_SEED,
  points, tailSlopePer100: { attribution: attrSlope, doctrine: docSlope },
}, null, 2));
console.log('\nWrote .cache/learning-curve.json');
