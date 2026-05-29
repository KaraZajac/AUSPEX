/**
 * Predict-engine parity harness.
 *
 *   npx tsx tools/verify-predict-parity.ts
 *
 * Proves the isomorphic refactor is sound: the SAME engine code
 * (attribution / doctrine-prediction / pillar-prediction / ood) produces
 * IDENTICAL rankings whether it runs against
 *   (a) the fs-loaded server Atlas  (atlas()), or
 *   (b) a browser-style Atlas rebuilt from the /api/atlas.json payload
 *       via atlasFromPayload(JSON.parse(JSON.stringify(payload))).
 *
 * Since both paths call the exact same engine functions, the only thing
 * under test is that atlasFromPayload reconstructs the Atlas identically
 * to the fs loader (entity Maps, derived indices, knownMalware, the
 * malware-lineage table, and the shipped inferredCampaignByEvent map).
 *
 * Config mirrors the deployed engine + the eval: actor profiles with
 * servicePriorLambda=0.2, doctrine/pillar with none, no temporal
 * reference date (build once on the full corpus), malware-lineage
 * grouping on the actor path.
 *
 * Asserts, per sample event:
 *   - extracted features deep-equal family-by-family
 *   - top-10 actor / top-3 doctrine / top-3 pillar id-lists identical
 *   - per-candidate scores equal within 1e-9 (all candidates)
 *   - OOD tier + distance equal within 1e-9
 * Prints "PARITY OK over N events" or fails loudly on first divergence.
 */
import { atlas } from '../src/utils/atlas.ts';
import { atlasFromPayload, type Atlas, type AuspexEvent } from '../src/utils/atlas-core.ts';
import {
  actorsOfEvent,
  buildProfiles,
  buildVocab,
  buildIDF,
  extractFeatures,
  rankActors,
  type EventFeatures,
} from '../src/utils/attribution.ts';
import {
  buildDoctrineProfiles,
  buildDoctrineIDF,
  doctrinesOfEvent,
  rankDoctrines,
} from '../src/utils/doctrine-prediction.ts';
import {
  buildPillarProfiles,
  buildPillarIDF,
  pillarsOfEvent,
  rankPillars,
} from '../src/utils/pillar-prediction.ts';
import { computeOOD } from '../src/utils/ood.ts';

const LAMBDA = 0.2;
const SCORE_EPS = 1e-9;
const SAMPLE_SIZE = 30; // >= 20 required

function fail(msg: string): never {
  console.error('\n✗ PARITY FAIL: ' + msg);
  process.exit(1);
}

/** Serialize the atlas exactly like /api/atlas.json.ts, then JSON
 *  round-trip it (Maps→arrays, undefined-stripping) — the same transform
 *  the browser sees over the wire. */
function serializeLikeApi(a: Atlas): unknown {
  const payload = {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    counts: a.stats(),
    nation_states: [...a.nationStates.values()],
    services: [...a.services.values()],
    doctrines: [...a.doctrines.values()],
    actors: [...a.actors.values()],
    events: [...a.events.values()],
    sources: [...a.sources.values()],
    timeline_markers: [...a.timelineMarkers.values()],
    sectors: [...a.sectors.values()],
    policy_actions: [...a.policyActions.values()],
    malwareLineage: (() => {
      const seen = new Set<unknown>();
      const out: unknown[] = [];
      for (const fam of a.malwareLineage.values()) {
        if (seen.has(fam)) continue;
        seen.add(fam);
        out.push(fam);
      }
      return out;
    })(),
    inferredCampaignByEvent: Object.fromEntries(a.inferredCampaignByEvent),
  };
  // Round-trip through JSON to mirror the actual fetch().json() the
  // browser performs (strips undefined, normalizes everything to plain
  // JSON values).
  return JSON.parse(JSON.stringify(payload));
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

function assertFeatureParity(id: string, sf: EventFeatures, bf: EventFeatures): void {
  const setFamilies: Array<keyof EventFeatures> = [
    'sectors', 'countries', 'incidentTypes', 'ttps', 'ttpPairs',
    'malware', 'targets', 'markers', 'proseTerms', 'operators',
  ];
  for (const fam of setFamilies) {
    if (!setsEqual(sf[fam] as Set<string>, bf[fam] as Set<string>)) {
      fail(`feature family "${String(fam)}" diverged on event ${id}\n` +
        `  server: [${[...(sf[fam] as Set<string>)].sort().join(', ')}]\n` +
        `  browser:[${[...(bf[fam] as Set<string>)].sort().join(', ')}]`);
    }
  }
  for (const scalar of ['vector', 'year', 'campaign', 'inferredCampaign'] as const) {
    if (sf[scalar] !== bf[scalar]) {
      fail(`feature scalar "${scalar}" diverged on event ${id}: server=${sf[scalar]} browser=${bf[scalar]}`);
    }
  }
}

function assertRankingParity(
  id: string,
  kind: string,
  server: Array<{ id: string; score: number }>,
  browser: Array<{ id: string; score: number }>,
  topK: number,
): void {
  // Full candidate-set length must match (both ranked the same label set).
  if (server.length !== browser.length) {
    fail(`${kind} candidate-set size differs on event ${id}: server=${server.length} browser=${browser.length}`);
  }
  // Top-K id-list identical.
  const sTop = server.slice(0, topK).map((x) => x.id);
  const bTop = browser.slice(0, topK).map((x) => x.id);
  for (let i = 0; i < sTop.length; i++) {
    if (sTop[i] !== bTop[i]) {
      fail(`${kind} top-${topK} order diverged on event ${id} at rank ${i + 1}:\n` +
        `  server: [${sTop.join(', ')}]\n` +
        `  browser:[${bTop.join(', ')}]`);
    }
  }
  // Per-candidate score equality across ALL candidates (catches silent
  // weight/profile drift even where order coincidentally matches). Compare
  // by id since both rank the same set.
  const bScore = new Map(browser.map((x) => [x.id, x.score]));
  for (const s of server) {
    const b = bScore.get(s.id);
    if (b === undefined) fail(`${kind} candidate ${s.id} missing from browser ranking on event ${id}`);
    if (Math.abs(s.score - (b as number)) > SCORE_EPS) {
      fail(`${kind} score diverged for ${s.id} on event ${id}: server=${s.score} browser=${b} (|Δ|=${Math.abs(s.score - (b as number))})`);
    }
  }
}

/** Pick a spread of events across states and years for the sample. */
function pickSample(all: AuspexEvent[], a: Atlas, n: number): AuspexEvent[] {
  // Require both actor and doctrine+pillar labels so all three engines
  // produce a meaningful ranking for the event.
  const labeled = all.filter((e) =>
    actorsOfEvent(e).size > 0 &&
    doctrinesOfEvent(e, a).size > 0 &&
    pillarsOfEvent(e, a).size > 0,
  );
  // Deterministic spread: sort by (year, id) and take an even stride.
  labeled.sort((x, y) => {
    const yx = (x.start_date ?? x.disclosure_date ?? '').slice(0, 4);
    const yy = (y.start_date ?? y.disclosure_date ?? '').slice(0, 4);
    return yx === yy ? x.id.localeCompare(y.id) : yx.localeCompare(yy);
  });
  if (labeled.length <= n) return labeled;
  const stride = labeled.length / n;
  const out: AuspexEvent[] = [];
  for (let i = 0; i < n; i++) out.push(labeled[Math.floor(i * stride)]);
  return out;
}

function main(): void {
  console.log('Building server atlas (fs)…');
  const aServer = atlas();

  console.log('Serializing like /api/atlas.json + reconstructing browser atlas…');
  const payload = serializeLikeApi(aServer);
  const aBrowser = atlasFromPayload(payload as Parameters<typeof atlasFromPayload>[0]);

  // Structural sanity before scoring. Compare every collection EXCEPT
  // `targets` — the /api/atlas.json payload intentionally omits the
  // target-dossier Map (atlas.targets) because no engine path reads it;
  // event-side targets live on event.targets[].target_id, which IS shipped.
  const sc = aServer.stats();
  const bc = aBrowser.stats();
  for (const k of Object.keys(sc) as Array<keyof typeof sc>) {
    if (k === 'targets') continue;
    if (sc[k] !== bc[k]) fail(`atlas.stats().${String(k)} differs: server=${sc[k]} browser=${bc[k]}`);
  }
  if (aServer.knownMalware.size !== aBrowser.knownMalware.size) {
    fail(`knownMalware size differs: server=${aServer.knownMalware.size} browser=${aBrowser.knownMalware.size}`);
  }
  if (aServer.inferredCampaignByEvent.size !== aBrowser.inferredCampaignByEvent.size) {
    fail(`inferredCampaignByEvent size differs: server=${aServer.inferredCampaignByEvent.size} browser=${aBrowser.inferredCampaignByEvent.size}`);
  }
  console.log(`  atlas reconstructed: ${bc.events} events, ${bc.actors} actors, ` +
    `${aBrowser.knownMalware.size} known-malware, ${aBrowser.inferredCampaignByEvent.size} inferred-campaign tags`);

  const allServer = [...aServer.events.values()];
  const allBrowser = [...aBrowser.events.values()];

  // Build profiles ONCE on each atlas (deployed config: full corpus, λ=0.2
  // for actors, none for doctrine/pillar, no temporal reference date).
  console.log('Building profiles on both atlases (λ=0.2, no temporal decay)…');
  const sActorP = buildProfiles(allServer, aServer, { servicePriorLambda: LAMBDA });
  const sVocab = buildVocab(allServer, aServer);
  const sActorIdf = buildIDF(sActorP);
  const sDocP = buildDoctrineProfiles(allServer, aServer);
  const sDocIdf = buildDoctrineIDF(sDocP);
  const sPilP = buildPillarProfiles(allServer, aServer);
  const sPilIdf = buildPillarIDF(sPilP);

  const bActorP = buildProfiles(allBrowser, aBrowser, { servicePriorLambda: LAMBDA });
  const bVocab = buildVocab(allBrowser, aBrowser);
  const bActorIdf = buildIDF(bActorP);
  const bDocP = buildDoctrineProfiles(allBrowser, aBrowser);
  const bDocIdf = buildDoctrineIDF(bDocP);
  const bPilP = buildPillarProfiles(allBrowser, aBrowser);
  const bPilIdf = buildPillarIDF(bPilP);

  const sample = pickSample(allServer, aServer, SAMPLE_SIZE);
  if (sample.length < 20) fail(`only ${sample.length} fully-labeled sample events available (need >= 20)`);
  console.log(`Scoring ${sample.length} sample events through BOTH atlases…\n`);

  for (const ev of sample) {
    // The browser scores the SAME event object out of its own corpus.
    const evB = aBrowser.events.get(ev.id);
    if (!evB) fail(`event ${ev.id} present in server atlas but missing in browser atlas`);

    const sf = extractFeatures(ev, aServer);
    const bf = extractFeatures(evB as AuspexEvent, aBrowser);
    assertFeatureParity(ev.id, sf, bf);

    const sActors = rankActors(sf, sActorP, sVocab, { idf: sActorIdf, malwareLineageGroup: aServer.malwareLineageGroup })
      .map((x) => ({ id: x.actorId, score: x.logScore }));
    const bActors = rankActors(bf, bActorP, bVocab, { idf: bActorIdf, malwareLineageGroup: aBrowser.malwareLineageGroup })
      .map((x) => ({ id: x.actorId, score: x.logScore }));
    assertRankingParity(ev.id, 'actor', sActors, bActors, 10);

    const sDoc = rankDoctrines(sf, sDocP, sVocab, { idf: sDocIdf }).map((x) => ({ id: x.doctrineId, score: x.logScore }));
    const bDoc = rankDoctrines(bf, bDocP, bVocab, { idf: bDocIdf }).map((x) => ({ id: x.doctrineId, score: x.logScore }));
    assertRankingParity(ev.id, 'doctrine', sDoc, bDoc, 3);

    const sPil = rankPillars(sf, sPilP, sVocab, { idf: sPilIdf }).map((x) => ({ id: x.pillarId, score: x.logScore }));
    const bPil = rankPillars(bf, bPilP, bVocab, { idf: bPilIdf }).map((x) => ({ id: x.pillarId, score: x.logScore }));
    assertRankingParity(ev.id, 'pillar', sPil, bPil, 3);

    const sOod = computeOOD(ev, allServer, aServer);
    const bOod = computeOOD(evB as AuspexEvent, allBrowser, aBrowser);
    if (sOod.tier !== bOod.tier) fail(`OOD tier diverged on event ${ev.id}: server=${sOod.tier} browser=${bOod.tier}`);
    if (Math.abs(sOod.distance - bOod.distance) > SCORE_EPS) {
      fail(`OOD distance diverged on event ${ev.id}: server=${sOod.distance} browser=${bOod.distance}`);
    }

    const yr = (ev.start_date ?? ev.disclosure_date ?? '????').slice(0, 4);
    console.log(`  ✓ ${ev.id.padEnd(42)} ${yr}  actor#1=${sActors[0]?.id.split('/').slice(-1)[0] ?? '-'}  doc#1=${sDoc[0]?.id ?? '-'}  ood=${sOod.tier}`);
  }

  console.log(`\nPARITY OK over ${sample.length} events`);
}

main();
