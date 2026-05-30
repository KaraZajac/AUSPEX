/**
 * import-staging.ts — PROVISIONAL theory-test import of backfill candidates into atlas/.
 *
 * Reads the two verified candidate queues (corpus + attribution) and writes
 * coherent, *validating* YAML directly into atlas/:
 *   - events   -> atlas/events/YYYY/MM/<slug>.yaml
 *   - sources  -> atlas/sources/<publisher>/<date>_<slug>.yaml
 *   - actors   -> atlas/actors/<ns>/<slug>.yaml   (new actors only)
 *   - services -> atlas/services/<state>/unscoped.yaml   (placeholder, per state w/ new state-actors)
 *   - states   -> atlas/nation-states/<id>.yaml          (stubs for genuinely-new states)
 *
 * Editorial QC is DEFERRED by explicit instruction ("just testing our theory"):
 *   - source URLs are curl-verified to RESOLVE (anti-fabrication) but claims are NOT re-read
 *   - doctrine_links left [] (suggested fit carried as a comment for QC)
 *   - new state actors keyed under a placeholder `<state>/unscoped` service (real service = QC)
 *   - auspex_assessment = concur-with-caveat (caveat: provisional backfill, QC pending)
 *
 * Idempotency: additive only. Exact event-slug / source-id collisions with the
 * existing atlas are suffixed; within-batch duplicates are dropped.
 *
 * Run:  pnpm exec tsx tools/import-staging.ts [--write]
 *       (dry-run by default; --write actually writes files)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { atlas, ATLAS_ROOT } from '../src/utils/atlas.ts';

const WRITE = process.argv.includes('--write');
const REPO = join(ATLAS_ROOT, '..'); // ATLAS_ROOT = .../AUSPEX/atlas
const RESEARCH = join(REPO, 'research');
const RETRIEVED = '2026-05-30';

// ---- load candidates -------------------------------------------------------
type Cand = Record<string, any>;
const corpus: Cand[] = JSON.parse(readFileSync(join(RESEARCH, 'corpus-backfill-candidates-2026-05-30.json'), 'utf8'));
const attrib: Cand[] = JSON.parse(readFileSync(join(RESEARCH, 'attribution-backfill-candidates-2026-05-30.json'), 'utf8'));
const all: Cand[] = [...corpus, ...attrib];

// ---- url-verify results (status\turl) --------------------------------------
const urlStatus = new Map<string, string>();
try {
  for (const line of readFileSync('/tmp/url-verify.tsv', 'utf8').split('\n')) {
    const [code, url] = line.split('\t');
    if (url) urlStatus.set(url.trim(), (code || '').trim());
  }
} catch { /* no verify file -> treat all as unknown-ok */ }
const urlOk = (u: string) => { const s = urlStatus.get(u); return !s || /^[23]\d\d$/.test(s); };

// ---- atlas indexes ---------------------------------------------------------
const a: any = atlas();
const actorIds = new Set<string>(a.actors.keys());
const eventIds = new Set<string>(a.events.keys());
const sourceIds = new Set<string>(a.sources.keys());
const serviceIds = new Set<string>(a.services.keys());
const stateIds = new Set<string>(a.nationStates.keys());

const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
// name/alias -> actor id (for resolution); first writer wins on collision
const actorByName = new Map<string, string>();
for (const [id, act] of a.actors) {
  const reg = (k: string) => { if (k && !actorByName.has(k)) actorByName.set(k, id); };
  reg(norm(act.canonical_name));
  for (const al of act.aliases || []) reg(norm(al.alias));
  // also the slug tail of the id (e.g. apt40)
  reg(norm(id.split('/').pop() || ''));
}

// ---- helpers ---------------------------------------------------------------
const slugify = (s: string) =>
  (s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim()
    .replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'untitled';

const padDate = (d: string): string => {
  const s = String(d || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  return '2025-01-01'; // last-resort; flagged in notes
};

// source_kind (free text from agents) -> atlas `kind` enum
const KIND: Record<string, string> = {
  'vendor-report': 'industry', 'vendor': 'industry', 'industry': 'industry',
  'threat-intel': 'industry', 'tracker': 'reference', 'reference': 'reference',
  government: 'government', 'gov': 'government', advisory: 'government',
  journalism: 'journalism', news: 'journalism', press: 'journalism',
  legal: 'legal', indictment: 'legal', court: 'legal',
};
const kindOf = (k: string) => KIND[norm(k).replace(/report$/, '-report').replace(/^vendorreport$/, 'vendor-report')] || KIND[(k || '').toLowerCase().trim()] || 'industry';

const publisherFromUrl = (u: string): string => {
  try {
    const h = new URL(u).hostname.replace(/^www\./, '');
    const core = h.split('.').slice(0, -1).join('.') || h;
    return slugify(core).replace(/-/g, '');
  } catch { return 'unknown-publisher'; }
};

const confMap: Record<string, string> = { attested: 'high', strongly_inferred: 'moderate', plausible: 'low' };
const yamlStr = (s: string) => JSON.stringify(String(s ?? '')); // safe one-line scalar
const block = (s: string, indent: string) =>
  (String(s || '(none)').trim().split('\n').map(l => indent + l.trimEnd()).join('\n'));

// ---- resolve an actor candidate -> { id, isNew, ns, kindLabel } ------------
function cleanActorNames(c: Cand): string[] {
  let raw = String(c.actor || '').replace(/^NEW:\s*/i, '');
  raw = raw.replace(/\([^)]*\)/g, ''); // strip parentheticals (service hints)
  raw = raw.split(/—|–| - | -- /)[0];  // drop trailing descriptor after em/en dash
  const parts = raw.split('/').map(s => s.trim()).filter(Boolean);
  const extra = [c.vendor_name_for_actor].filter(Boolean).map(String);
  return [...parts, ...extra].filter(Boolean);
}

const newStateServices = new Set<string>(); // `<state>/unscoped` to create
const newStates = new Set<string>();        // state ids to stub

function resolveActor(c: Cand, state: string): { id: string; isNew: boolean; hint: string } {
  // 1) literal existing id
  const lit = String(c.actor_id_existing || '').trim();
  if (lit && actorIds.has(lit)) return { id: lit, isNew: false, hint: '' };
  // 2) name / alias match. Try the authoritative `actor` field names FIRST; the
  //    agent-entered actor_id_existing is a fallback (it is sometimes a wrong
  //    name, e.g. "Mustang Panda" keyed onto an APT15 BADBAZAAR/MOONSHINE event).
  for (const nm of [...cleanActorNames(c), lit]) {
    const hit = actorByName.get(norm(nm));
    if (hit) return { id: hit, isNew: false, hint: '' };
  }
  // 3) NEW actor
  const names = cleanActorNames(c);
  const canonical = names[0] || c.actor || 'unknown';
  const slug = slugify(canonical);
  const hint = String(c.actor || ''); // full string carries service hint for QC
  const isCriminal = !state || state === 'none' || /ransomware|extortion|spyware|criminal|affiliate|com-aligned/i.test(c.actor || '');
  if (isCriminal && (!state || state === 'none')) {
    return { id: `criminal/${slug}`, isNew: true, hint };
  }
  // state actor under placeholder service
  newStateServices.add(`${state}/unscoped`);
  if (!stateIds.has(state)) newStates.add(state);
  return { id: `${state}/unscoped/${slug}`, isNew: true, hint };
}

// ---- process ---------------------------------------------------------------
const files: { path: string; body: string }[] = [];
const seenEvent = new Set<string>();
const seenSource = new Set<string>();
const newActors = new Map<string, { id: string; canonical: string; state: string; hint: string; srcId: string; itypes: string[] }>();
const resolutions: { raw: string; state: string; id: string; isNew: boolean }[] = [];
const report = { resolvedExisting: 0, newState: 0, newCriminal: 0, urlFlagged: 0, collisionSuffixed: 0, dupDropped: 0, skipped: [] as string[] };

const uniq = (base: string, taken: Set<string>, suffixed: () => void): string => {
  if (!taken.has(base)) return base;
  for (let i = 2; i < 50; i++) { const x = `${base}-${i}`; if (!taken.has(x)) { suffixed(); return x; } }
  return `${base}-${Math.min(99, taken.size)}`;
};

for (let idx = 0; idx < all.length; idx++) {
  const c = all[idx];
  c.name ||= `Untitled backfill candidate ${idx}`;
  c.summary ||= '(no summary captured)';
  c.incident_type = Array.isArray(c.incident_type) ? c.incident_type : [];
  const state = norm(c.state) === 'none' || !c.state ? 'none' : String(c.state).toLowerCase().trim();
  const url = String(c.source_url || '').trim();
  const date = padDate(c.date);
  const [yy, mm] = [date.slice(0, 4), date.slice(5, 7)];
  const evId = `${date.slice(0, 7)}/${slugify(c.name)}`;

  // dedup within batch + vs atlas (exact id)
  const evBase = evId;
  if (seenEvent.has(evBase)) { report.dupDropped++; continue; }
  const evFinal = uniq(evBase, new Set([...eventIds, ...seenEvent]), () => report.collisionSuffixed++);
  seenEvent.add(evFinal);

  // resolve actor
  const { id: actorId, isNew, hint } = resolveActor(c, state);
  if (isNew) actorId.startsWith('criminal/') ? report.newCriminal++ : report.newState++;
  else report.resolvedExisting++;
  resolutions.push({ raw: String(c.actor || ''), state, id: actorId, isNew });

  // source
  const pub = url ? publisherFromUrl(url) : 'unknown-publisher';
  const srcBase = `${pub}/${date.slice(0, 7)}_${slugify(c.name).slice(0, 40)}`;
  const srcFinal = uniq(srcBase, new Set([...sourceIds, ...seenSource]), () => report.collisionSuffixed++);
  seenSource.add(srcFinal);
  const urlBad = url && !urlOk(url);
  if (urlBad) report.urlFlagged++;

  const attributingOrg = c.attributing_org || c.vendor_name_for_actor || (pub ? pub : 'vendor-report');
  const orgConf = confMap[String(c.confidence || '').trim()] || 'moderate';

  // ---- event YAML ----
  const doctrineFit = c.doctrine_fit ? ` # TODO(QC): suggested doctrine fit ${c.doctrine_fit}` : ' # TODO(QC): assign doctrine link';
  const evBody =
`# PROVISIONAL backfill import 2026-05-30 (theory-test; editorial QC pending).
# Source claim curl-resolved but NOT re-read; doctrine untagged.
id: ${evFinal}
name: ${yamlStr(c.name)}
start_date: ${date}
incident_type:
${c.incident_type.map((t: string) => `  - ${t}`).join('\n') || '  - intrusion'}
false_flag_risk: none
summary: |
${block(c.summary, '  ')}
attributions:
  - actor_id: ${actorId}
    attributing_org: ${yamlStr(attributingOrg)}
    attributing_org_confidence: ${orgConf}   # mapped from ICD link-confidence: ${c.confidence || 'n/a'}
    auspex_assessment: concur-with-caveat     # caveat: provisional backfill, QC pending
    attribution_date: ${date}
    attribution_source_id: ${srcFinal}
doctrine_links: []${doctrineFit}
sources:
  - ${srcFinal}
`;
  files.push({ path: join(ATLAS_ROOT, 'events', yy, mm, `${evFinal.split('/').pop()}.yaml`), body: evBody });

  // ---- source YAML ----
  const srcBody =
`# PROVISIONAL backfill import 2026-05-30. URL curl-verified to resolve.${urlBad ? ` # WARNING: curl returned ${urlStatus.get(url)} (real-publisher block/redirect); agent-fetched; QC re-verify.` : ''}
id: ${srcFinal}
kind: ${kindOf(c.source_kind)}
publisher: ${yamlStr(c.attributing_org || pub)}
title: ${yamlStr(c.name)}
url: ${url ? yamlStr(url) : 'null'}
published_on: ${date}
retrieved_on: ${RETRIEVED}
tier: secondary
${c.supporting_quote ? `note: |\n${block('Supporting quote: ' + c.supporting_quote, '  ')}` : ''}`;
  files.push({ path: join(ATLAS_ROOT, 'sources', pub, `${srcFinal.split('/').pop()}.yaml`), body: srcBody });

  // ---- new actor (defer YAML build until after loop; collect) ----
  if (isNew && !newActors.has(actorId)) {
    newActors.set(actorId, { id: actorId, canonical: cleanActorNames(c)[0] || c.actor, state, hint, srcId: srcFinal, itypes: c.incident_type });
  }
}

// ---- new actor YAMLs -------------------------------------------------------
for (const na of newActors.values()) {
  const ns = na.id.split('/')[0];
  const criminal = ns === 'criminal';
  const mission = /ransomware|extortion|financial/i.test((na.itypes || []).join(' ') + na.hint) ? 'financial' : 'espionage';
  const body =
`# PROVISIONAL backfill import 2026-05-30 (theory-test). Service placement & aliases = QC.
id: ${na.id}
primary_service_id: ${criminal ? 'null' : `${na.state}/unscoped`}
additional_service_ids: []
canonical_name: ${yamlStr(na.canonical)}
aliases: []
status: active
mission:
  - ${mission}
ttp_summary: |
  PROVISIONAL stub from corpus backfill. Original analyst hint:
  ${na.hint.replace(/\n/g, ' ')}
default_doctrine_alignment_ids: []
sources:
  - ${na.srcId}
`;
  const file = criminal ? join(ATLAS_ROOT, 'actors', 'criminal', `${na.id.split('/').pop()}.yaml`)
    : join(ATLAS_ROOT, 'actors', na.state, `${na.id.split('/').pop()}.yaml`);
  files.push({ path: file, body });
}

// ---- placeholder services --------------------------------------------------
for (const svc of newStateServices) {
  if (serviceIds.has(svc)) continue;
  const st = svc.split('/')[0];
  files.push({
    path: join(ATLAS_ROOT, 'services', st, 'unscoped.yaml'),
    body:
`# PROVISIONAL placeholder service 2026-05-30 — holds backfilled actors pending QC service placement.
id: ${svc}
nation_state_id: ${st}
name: Unscoped cluster (provisional backfill — QC pending)
short_name: UNSCOPED
parent_service_id: null
summary: |
  Placeholder service created by the 2026-05-30 backfill theory-test import to
  hold new actors whose real service placement (FSB/GRU/MSS/RGB/etc.) has not
  yet been QC'd. NOT a real organizational unit. Re-home actors and delete on QC.
`,
  });
}

// ---- new nation-state stubs ------------------------------------------------
const STATE_NAMES: Record<string, [string, string]> = {
  ps: ['Palestinian Territories', 'Palestine'], sa: ['Saudi Arabia', 'Saudi Arabia'],
};
for (const st of newStates) {
  if (stateIds.has(st)) continue;
  const [name, short] = STATE_NAMES[st] || [st.toUpperCase(), st.toUpperCase()];
  files.push({
    path: join(ATLAS_ROOT, 'nation-states', `${st}.yaml`),
    body:
`# PROVISIONAL nation-state stub 2026-05-30 (backfill theory-test). Expand on QC.
id: ${st}
name: ${name}
short_name: ${short}
summary: |
  PROVISIONAL stub created by the 2026-05-30 backfill import so that backfilled
  ${name} actors/events validate. No doctrine modeling yet — QC to expand.
`,
  });
}

// ---- write / report --------------------------------------------------------
const byKind = (suffix: string) => files.filter(f => f.path.includes(`/${suffix}/`)).length;
console.log(`\n=== import-staging (${WRITE ? 'WRITE' : 'DRY-RUN'}) ===`);
console.log(`candidates: ${all.length} | events: ${seenEvent.size} | sources: ${seenSource.size}`);
console.log(`actor resolution -> existing: ${report.resolvedExisting} | new-state: ${report.newState} | new-criminal: ${report.newCriminal}`);
console.log(`new actor YAMLs: ${newActors.size} | placeholder services: ${[...newStateServices].filter(s => !serviceIds.has(s)).length} (${[...newStateServices].join(', ') || 'none'})`);
console.log(`new state stubs: ${[...newStates].filter(s => !stateIds.has(s)).join(', ') || 'none'}`);
console.log(`url-flagged (curl block/redirect, kept+noted): ${report.urlFlagged} | slug collisions suffixed: ${report.collisionSuffixed} | within-batch dups dropped: ${report.dupDropped}`);
console.log(`total files to write: ${files.length} (events ${byKind('events')}, sources ${byKind('sources')}, actors ${byKind('actors')}, services ${byKind('services')}, nation-states ${files.filter(f=>f.path.includes('/nation-states/')).length})`);

if (process.argv.includes('--dump')) {
  console.log('\n=== EXISTING-actor matches (verify these are correct, not false merges) ===');
  for (const r of resolutions.filter(r => !r.isNew)) console.log(`  [${r.state}] ${r.raw.slice(0, 60).padEnd(60)} -> ${r.id}`);
  console.log('\n=== NEW actors (verify none of these is a missed duplicate of an existing actor) ===');
  const seen = new Set<string>();
  for (const r of resolutions.filter(r => r.isNew)) { if (seen.has(r.id)) continue; seen.add(r.id); console.log(`  [${r.state}] ${r.raw.slice(0, 60).padEnd(60)} -> ${r.id}`); }
}

if (WRITE) {
  let w = 0, skip = 0;
  for (const f of files) {
    if (existsSync(f.path)) { skip++; continue; } // never overwrite existing atlas files
    mkdirSync(dirname(f.path), { recursive: true });
    writeFileSync(f.path, f.body.endsWith('\n') ? f.body : f.body + '\n');
    w++;
  }
  console.log(`WROTE ${w} files; skipped ${skip} pre-existing.`);
} else {
  console.log('(dry-run; pass --write to emit files)');
}
