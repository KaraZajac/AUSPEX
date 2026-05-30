/**
 * Stage the reviewed backfill candidates as schema-shaped YAML for analyst review.
 * DETERMINISTIC transcription (no LLM) of research/*-candidates-*.json into a
 * staging/ tree OUTSIDE atlas/ — so nothing enters the corpus until Kara reviews,
 * completes the editorial fields, and imports.
 *
 * What it fills (mechanical): id, name, dates, incident_type, summary, the
 * attribution shell (actor_id + attributing_org + source ref), a source stub
 * (the agent-fetched URL), and new-actor stubs.
 * What it leaves as explicit TODO(analyst) (irreducibly editorial / doctoral):
 *   - doctrine_links (the WHY tag) — with the suggested fit as a hint
 *   - attributing_org_confidence + auspex_assessment (ICD-203; never upgraded)
 *   - curl-verification of every source URL (never a fabricated URL)
 *   - new-actor service assignment + slug finalization; new state slices (PS/SA)
 *
 *   pnpm exec tsx tools/stage-candidates.ts
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const STAGE = resolve(ROOT, 'staging');
const RETRIEVED = '2026-05-30';

interface Cand {
  name: string; date: string; actor: string; actor_id_existing?: string;
  vendor_name_for_actor?: string; state: string; attributing_org?: string;
  incident_type: string[]; summary: string; source_url: string; source_kind?: string;
  supporting_quote: string; confidence: string; doctrine_fit?: string; notes?: string;
  _queue?: string;
}

const corpus: Cand[] = JSON.parse(readFileSync(resolve(ROOT, 'research/corpus-backfill-candidates-2026-05-30.json'), 'utf8'));
const attrib: Cand[] = JSON.parse(readFileSync(resolve(ROOT, 'research/attribution-backfill-candidates-2026-05-30.json'), 'utf8'));
corpus.forEach((c) => (c._queue = 'corpus-backfill'));
attrib.forEach((c) => (c._queue = 'attribution'));
const cands = [...corpus, ...attrib];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
const startDate = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? d : `${d}-01`); // pad YYYY-MM → -01
const dateApprox = (d: string) => !/^\d{4}-\d{2}-\d{2}$/.test(d);
const KIND: Record<string, string> = {
  'vendor-report': 'industry', tracker: 'reference', news: 'journalism',
  'govt-advisory': 'government', indictment: 'legal', 'court-doc': 'legal', other: 'reference',
};
const yamlStr = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const block = (s: string, indent: string) => (s || '(none)').trim().split('\n').map((l) => indent + l.trim()).join('\n');
function publisher(c: Cand): string {
  if (c.attributing_org) return c.attributing_org.split('(')[0].trim();
  try { return new URL(c.source_url).hostname.replace(/^www\./, ''); } catch { return 'unknown'; }
}

rmSync(STAGE, { recursive: true, force: true });
for (const d of ['events', 'sources', 'actors']) mkdirSync(resolve(STAGE, d), { recursive: true });

const newActors = new Map<string, Cand>(); // proposed actor slug → first candidate
const newStates = new Set<string>();
const KNOWN_STATES = new Set(['ru', 'cn', 'kp', 'ir', 'us', 'in', 'ae', 'tr', 'pk', 'fr', 'vn', 'uk', 'by', 'il', 'kr']);
const rows: Array<{ id: string; c: Cand; actorId: string; isNewActor: boolean; sourceId: string }> = [];

for (const c of cands) {
  // Defensive coercion — a few verified items may be missing optional fields.
  c.name = c.name || '(unnamed candidate)';
  c.date = c.date || '0000-00';
  c.summary = c.summary || '(no summary provided — see source)';
  c.source_url = c.source_url || '';
  c.supporting_quote = c.supporting_quote || '';
  c.confidence = c.confidence || 'unknown';
  c.incident_type = Array.isArray(c.incident_type) ? c.incident_type : [];
  const st = (c.state || 'xx').toLowerCase();
  if (!KNOWN_STATES.has(st) && st !== 'none' && st !== 'xx') newStates.add(st);
  const evSlug = slugify(c.name);
  const id = `${c.date.slice(0, 7)}/${evSlug}`;
  const isNewActor = !c.actor_id_existing;
  const actorClean = c.actor.replace(/^NEW:\s*/i, '').trim();
  const actorId = c.actor_id_existing || `${st}/TODO-service/${slugify(actorClean.split('/')[0])}`;
  if (isNewActor) { if (!newActors.has(actorId)) newActors.set(actorId, c); }
  const pub = publisher(c);
  const sourceId = `${slugify(pub).slice(0, 24)}/${c.date.slice(0, 10).replace(/-\d{2}$/, '')}_${evSlug}`.replace(/\/+/g, '/');
  rows.push({ id, c, actorId, isNewActor, sourceId });

  // ── event YAML (staging) ────────────────────────────────────────────────
  const ev = [
    `id: ${id}`,
    `name: ${yamlStr(c.name)}`,
    `start_date: ${startDate(c.date)}${dateApprox(c.date) ? '   # TODO(analyst): confirm exact day (date is approximate); record disclosure_date separately' : ''}`,
    `disclosure_date: ${startDate(c.date)}   # TODO(analyst): set true disclosure date if different`,
    `incident_type:`,
    ...c.incident_type.map((t) => `  - ${t}`),
    `# initial_vector: <enum>   # TODO(analyst): set if known`,
    `false_flag_risk: none`,
    `summary: |`,
    block(c.summary, '  '),
    `attributions:`,
    `  - actor_id: ${actorId}${isNewActor ? '   # TODO(analyst): new actor — assign service segment + finalize slug (see staging/actors/)' : ''}`,
    `    attributing_org: ${yamlStr(c.attributing_org || 'TODO(analyst): from source')}`,
    `    attributing_org_confidence: moderate   # TODO(analyst): set high/moderate/low per the source`,
    `    auspex_assessment: concur   # TODO(analyst): concur / partial / dissent — never upgrade`,
    `    attribution_date: ${startDate(c.date)}`,
    `    attribution_source_id: ${sourceId}`,
    `doctrine_links: []   # TODO(analyst): assign doctrine_id + pillar_id (the WHY).${c.doctrine_fit ? ` suggested: ${c.doctrine_fit}` : ' suggested: (none — analyst to determine)'}`,
    `targets: []   # TODO(analyst): add orgs/<slug> or sectors/<slug> targets`,
    `sources:`,
    `  - ${sourceId}`,
    `# fetched confidence (un-upgraded vendor posture): ${c.confidence}`,
    `# source quote: ${c.supporting_quote.replace(/\n/g, ' ').slice(0, 240)}`,
    `# verify caveats: ${(c.notes || '').replace(/\n/g, ' ').slice(0, 300)}`,
  ].join('\n');
  writeFileSync(resolve(STAGE, 'events', `${evSlug}.yaml`), ev + '\n');

  // ── source YAML (staging) ───────────────────────────────────────────────
  const src = [
    `id: ${sourceId}`,
    `kind: ${KIND[c.source_kind || 'other'] || 'reference'}   # TODO(analyst): confirm source-kind enum`,
    `publisher: ${yamlStr(pub)}`,
    `title: |`,
    block(c.name, '  '),
    `url: ${c.source_url}   # TODO(analyst): curl-verify; set url:null + note if unverifiable (never fabricate)`,
    `archive_url: null`,
    `published_on: ${startDate(c.date)}`,
    `retrieved_on: ${RETRIEVED}`,
    `tier: ${c.source_kind === 'govt-advisory' || c.source_kind === 'indictment' || c.source_kind === 'court-doc' ? 'primary' : 'secondary'}`,
  ].join('\n');
  writeFileSync(resolve(STAGE, 'sources', `${slugify(sourceId)}.yaml`), src + '\n');
}

// ── new-actor stubs ─────────────────────────────────────────────────────────
for (const [actorId, c] of newActors) {
  const st = (c.state || 'xx').toLowerCase();
  const canonical = c.actor.replace(/^NEW:\s*/i, '').trim();
  const stub = [
    `id: ${actorId}   # TODO(analyst): finalize slug + service segment (renames are forbidden once published)`,
    `primary_service_id: ${st}/TODO-service   # TODO(analyst): assign the operating service (create it if new)`,
    `additional_service_ids: []`,
    `canonical_name: ${yamlStr(canonical)}`,
    `aliases:${c.vendor_name_for_actor ? '' : ' []'}`,
    ...(c.vendor_name_for_actor ? [
      `  - alias: ${yamlStr(c.vendor_name_for_actor.split('(')[0].trim())}`,
      `    assigning_org: ${yamlStr((c.attributing_org || 'vendor').split('(')[0].trim())}`,
      `    confidence: equivalent   # TODO(analyst): equivalent / overlapping`,
    ] : []),
    `# TODO(analyst): confirm this is NOT an alias of an existing actor before creating a new slug`,
  ].join('\n');
  writeFileSync(resolve(STAGE, 'actors', `${slugify(actorId)}.yaml`), stub + '\n');
}

// ── review index ─────────────────────────────────────────────────────────────
const byState = new Map<string, typeof rows>();
for (const r of rows) { const s = (r.c.state || 'XX').toUpperCase(); (byState.get(s) ?? byState.set(s, []).get(s)!).push(r); }
const md: string[] = [];
md.push('# AUSPEX staging — backfill candidates as schema-shaped YAML (FOR REVIEW)\n');
md.push(`Generated by \`tools/stage-candidates.ts\` from the two verified review queues. **Nothing here is in the atlas.** ${cands.length} candidate events staged under \`staging/\` (events/ sources/ actors/).\n`);
md.push('Each staged event has the mechanical fields filled and **explicit `TODO(analyst)` markers** for the editorial work that cannot be auto-generated:\n');
md.push('1. **`doctrine_links` — the WHY tag.** Assign `doctrine_id` + `pillar_id` (suggested fit noted where the research proposed one). This is the doctoral core; do not skip.');
md.push('2. **ICD-203 confidence.** Set `attributing_org_confidence` (high/moderate/low) + `auspex_assessment` — **never upgrade** the source posture (carried as a comment).');
md.push('3. **Curl-verify every `url`.** `url: null` + note if unverifiable — never a fabricated URL.');
md.push(`4. **New-actor scaffolding.** ${newActors.size} proposed new actors need a service segment + slug confirmation (and confirm each is NOT an alias of an existing actor).`);
md.push(`5. **New state slices.** ${[...newStates].map((s) => s.toUpperCase()).join(', ') || 'none'} need \`nation-states/\` + \`services/\` + doctrine scaffolding before their events validate.\n`);
md.push('**Import flow:** complete the TODOs → move the file into `atlas/events/YYYY/MM/` (+ sources, actors) → `pnpm validate` → re-baseline → commit.\n');
md.push(`**Counts:** ${cands.length} events · ${newActors.size} new actors · ${newStates.size} new state slices.\n`);
md.push('---\n');
for (const [state, rs] of [...byState.entries()].sort()) {
  md.push(`## ${state} — ${rs.length} event(s)\n`);
  for (const r of rs) {
    md.push(`- **${r.c.date} — ${r.c.name}**  \n  actor: \`${r.actorId}\`${r.isNewActor ? ' **(NEW — needs scaffolding)**' : ''} · conf(fetched): ${r.c.confidence} · doctrine: ${r.c.doctrine_fit || '**TODO**'}  \n  source: ${r.c.source_url}  \n  files: \`staging/events/${slugify(r.c.name)}.yaml\``);
  }
  md.push('');
}
writeFileSync(resolve(STAGE, 'STAGING-REVIEW.md'), md.join('\n'));

console.log(`Staged ${cands.length} events, ${newActors.size} new-actor stubs, ${[...newStates].length} new states (${[...newStates].map((s) => s.toUpperCase()).join(',')}) → staging/`);
console.log(`Review index: staging/STAGING-REVIEW.md`);
