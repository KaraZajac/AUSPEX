/**
 * AUSPEX atlas validator.
 *
 * Two passes:
 *   1. Raw YAML integrity. Walk every .yaml file in atlas/, parse it,
 *      flag empties / parse errors / missing required `id`. This is
 *      how we find the YAMLs the live loader silently skips.
 *   2. Cross-reference / FK integrity / enum / date sanity. Uses the
 *      atlas() singleton to walk loaded entities and verify every
 *      slug reference resolves, every confidence label is in the
 *      controlled vocabulary, every date pair is sane.
 *
 * Run with:
 *   pnpm run validate          # or: pnpm exec tsx tools/validate.ts
 *
 * Exit code:
 *   0  -- no errors (warnings/info ok)
 *   1  -- one or more errors
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import yaml from 'js-yaml';
import { atlas, ATLAS_ROOT, type Doctrine } from '../src/utils/atlas.ts';

const YAML_OPTS = { schema: yaml.CORE_SCHEMA } as const;

type Severity = 'error' | 'warning' | 'info';
type Issue = {
  severity: Severity;
  kind: string;
  path: string;
  message: string;
};

const issues: Issue[] = [];
function add(severity: Severity, kind: string, path: string, message: string): void {
  issues.push({ severity, kind, path, message });
}

function* walkYaml(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e);
    const s = statSync(full);
    if (s.isDirectory()) yield* walkYaml(full);
    else if (e.endsWith('.yaml') || e.endsWith('.yml')) yield full;
  }
}

function rel(p: string): string {
  return relative(ATLAS_ROOT, p);
}

// ───── Pass 1: raw YAML integrity ─────

const seenIds = new Map<string, string>(); // id -> first file that claimed it

for (const path of walkYaml(ATLAS_ROOT)) {
  const r = rel(path);
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (e) {
    add('error', 'read-fail', r, (e as Error).message);
    continue;
  }
  if (!text.trim()) {
    add('error', 'empty-file', r, 'file is empty');
    continue;
  }
  let doc: unknown;
  try {
    doc = yaml.load(text, YAML_OPTS);
  } catch (e) {
    add('error', 'parse', r, (e as Error).message);
    continue;
  }
  if (doc === null || doc === undefined) {
    add('error', 'parse', r, 'YAML parsed to null/undefined');
    continue;
  }
  if (typeof doc !== 'object' || Array.isArray(doc)) {
    add('error', 'parse', r, 'top-level is not a mapping');
    continue;
  }
  const obj = doc as Record<string, unknown>;
  if (r === 'sectors/sectors.yaml') {
    if (!Array.isArray(obj.sectors)) {
      add('error', 'schema', r, 'sectors.yaml missing top-level sectors: list');
    }
    continue;
  }
  if (!obj.id || typeof obj.id !== 'string') {
    add('error', 'missing-id', r, 'entry missing required id (string) field');
    continue;
  }
  const id = obj.id;
  const prev = seenIds.get(id);
  if (prev && prev !== r) {
    add('error', 'duplicate-id', r, `id ${id} also defined in ${prev}`);
  } else {
    seenIds.set(id, r);
  }
}

// ───── Pass 2: cross-reference checks against loaded atlas ─────

const a = atlas();

function fkMissing(store: Map<string, unknown>, id: string | null | undefined): boolean {
  if (!id) return false;
  return !store.has(id);
}

// services
for (const svc of a.services.values()) {
  if (svc.nation_state_id && fkMissing(a.nationStates as Map<string, unknown>, svc.nation_state_id)) {
    add('error', 'dangling-fk', `services/${svc.id}`, `nation_state_id not found: ${svc.nation_state_id}`);
  }
  if (svc.parent_service_id && fkMissing(a.services as Map<string, unknown>, svc.parent_service_id)) {
    add('error', 'dangling-fk', `services/${svc.id}`, `parent_service_id not found: ${svc.parent_service_id}`);
  }
  for (const sid of svc.sources ?? []) {
    if (fkMissing(a.sources as Map<string, unknown>, sid)) {
      add('warning', 'dangling-fk', `services/${svc.id}`, `cited source not found: ${sid}`);
    }
  }
}

// doctrines
for (const d of a.doctrines.values() as IterableIterator<Doctrine>) {
  if (d.nation_state_id && fkMissing(a.nationStates as Map<string, unknown>, d.nation_state_id)) {
    add('error', 'dangling-fk', `doctrines/${d.id}`, `nation_state_id not found: ${d.nation_state_id}`);
  }
  if (d.superseded_by_id && fkMissing(a.doctrines as Map<string, unknown>, d.superseded_by_id)) {
    add('error', 'dangling-fk', `doctrines/${d.id}`, `superseded_by_id not found: ${d.superseded_by_id}`);
  }
  for (const inh of d.inherits_from_ids ?? []) {
    if (fkMissing(a.doctrines as Map<string, unknown>, inh)) {
      add('warning', 'dangling-fk', `doctrines/${d.id}`, `inherits_from_id not found: ${inh}`);
    }
  }
  for (const sid of d.sources ?? []) {
    if (fkMissing(a.sources as Map<string, unknown>, sid)) {
      add('warning', 'dangling-fk', `doctrines/${d.id}`, `cited source not found: ${sid}`);
    }
  }
  for (const p of d.pillars ?? []) {
    if (!p.id) {
      add('error', 'missing-id', `doctrines/${d.id}`, `pillar without id under ${d.id}`);
      continue;
    }
    // pillar ID should start with the doctrine ID
    if (!p.id.startsWith(d.id + '/')) {
      add('warning', 'slug-shape', `doctrines/${d.id}`, `pillar ${p.id} not nested under ${d.id}/...`);
    }
    for (const sec of p.target_sectors ?? []) {
      if (fkMissing(a.sectors as Map<string, unknown>, sec)) {
        add('warning', 'dangling-fk', `doctrines/${d.id}`, `pillar ${p.id} target_sector not found: ${sec}`);
      }
    }
    for (const prog of p.programs ?? []) {
      if (!prog.id) {
        add('error', 'missing-id', `doctrines/${d.id}`, `program without id under ${p.id}`);
        continue;
      }
      if (!prog.id.startsWith(p.id + '/')) {
        add('warning', 'slug-shape', `doctrines/${d.id}`, `program ${prog.id} not nested under pillar ${p.id}/...`);
      }
    }
  }
}

// actors
for (const act of a.actors.values()) {
  if (act.primary_service_id && fkMissing(a.services as Map<string, unknown>, act.primary_service_id)) {
    add('error', 'dangling-fk', `actors/${act.id}`, `primary_service_id not found: ${act.primary_service_id}`);
  }
  for (const sid of act.additional_service_ids ?? []) {
    if (fkMissing(a.services as Map<string, unknown>, sid)) {
      add('warning', 'dangling-fk', `actors/${act.id}`, `additional service not found: ${sid}`);
    }
  }
  for (const did of act.default_doctrine_alignment_ids ?? []) {
    if (
      fkMissing(a.doctrines as Map<string, unknown>, did) &&
      fkMissing(a.pillars as Map<string, unknown>, did) &&
      fkMissing(a.programs as Map<string, unknown>, did)
    ) {
      add('warning', 'dangling-fk', `actors/${act.id}`, `doctrine alignment not found: ${did}`);
    }
  }
  for (const sec of act.target_sector_ids ?? []) {
    if (fkMissing(a.sectors as Map<string, unknown>, sec)) {
      add('warning', 'dangling-fk', `actors/${act.id}`, `target sector not found: ${sec}`);
    }
  }
  for (const sid of act.sources ?? []) {
    if (fkMissing(a.sources as Map<string, unknown>, sid)) {
      add('warning', 'dangling-fk', `actors/${act.id}`, `cited source not found: ${sid}`);
    }
  }
}

// events
const CONF_LINK = new Set(['attested', 'strongly_inferred', 'plausible']);
const CONF_ORG = new Set(['high', 'moderate', 'low']);
const ASSESS = new Set(['concur', 'concur-with-caveat', 'partial', 'contested']);
const SEC_PREFIXES = ['sectors/']; // anything under targets/sectors/<slug>

let danglingOrgs = 0;
let danglingInfra = 0;
const missingOrgs = new Set<string>();
const missingInfra = new Set<string>();

for (const ev of a.events.values()) {
  for (const attr of ev.attributions ?? []) {
    if (attr.actor_id && fkMissing(a.actors as Map<string, unknown>, attr.actor_id)) {
      add('error', 'dangling-fk', `events/${ev.id}`, `attribution actor_id not found: ${attr.actor_id}`);
    }
    if (attr.service_id && fkMissing(a.services as Map<string, unknown>, attr.service_id)) {
      add('error', 'dangling-fk', `events/${ev.id}`, `attribution service_id not found: ${attr.service_id}`);
    }
    if (attr.attribution_source_id && fkMissing(a.sources as Map<string, unknown>, attr.attribution_source_id)) {
      add('warning', 'dangling-fk', `events/${ev.id}`, `attribution source not found: ${attr.attribution_source_id}`);
    }
    if (attr.attributing_org_confidence && !CONF_ORG.has(attr.attributing_org_confidence)) {
      add(
        'warning',
        'enum',
        `events/${ev.id}`,
        `attributing_org_confidence not in {high,moderate,low}: ${attr.attributing_org_confidence}`,
      );
    }
    if (attr.auspex_assessment && !ASSESS.has(attr.auspex_assessment)) {
      add('warning', 'enum', `events/${ev.id}`, `auspex_assessment unexpected: ${attr.auspex_assessment}`);
    }
  }
  for (const link of ev.doctrine_links ?? []) {
    if (!CONF_LINK.has(link.confidence)) {
      add(
        'warning',
        'enum',
        `events/${ev.id}`,
        `doctrine link confidence not in {attested,strongly_inferred,plausible}: ${link.confidence}`,
      );
    }
    if (link.doctrine_id && fkMissing(a.doctrines as Map<string, unknown>, link.doctrine_id)) {
      add('error', 'dangling-fk', `events/${ev.id}`, `doctrine_id not found: ${link.doctrine_id}`);
    }
    if (link.pillar_id && fkMissing(a.pillars as Map<string, unknown>, link.pillar_id)) {
      add('error', 'dangling-fk', `events/${ev.id}`, `pillar_id not found: ${link.pillar_id}`);
    }
    if (link.program_id && fkMissing(a.programs as Map<string, unknown>, link.program_id)) {
      add('error', 'dangling-fk', `events/${ev.id}`, `program_id not found: ${link.program_id}`);
    }
    if (link.attesting_source_id && fkMissing(a.sources as Map<string, unknown>, link.attesting_source_id)) {
      add('warning', 'dangling-fk', `events/${ev.id}`, `attesting_source_id not found: ${link.attesting_source_id}`);
    }
    if (!link.doctrine_id && !link.pillar_id && !link.program_id) {
      add('error', 'schema', `events/${ev.id}`, 'doctrine_link missing any of doctrine_id/pillar_id/program_id');
    }
  }
  for (const m of ev.anticipated_timeline_markers ?? []) {
    if (m.marker_id && fkMissing(a.timelineMarkers as Map<string, unknown>, m.marker_id)) {
      add('warning', 'dangling-fk', `events/${ev.id}`, `timeline marker not found: ${m.marker_id}`);
    }
    if (m.confidence && !CONF_LINK.has(m.confidence)) {
      add('warning', 'enum', `events/${ev.id}`, `marker confidence unexpected: ${m.confidence}`);
    }
  }
  for (const t of ev.targets ?? []) {
    const tid = t.target_id ?? '';
    if (tid.startsWith('sectors/')) {
      const slug = tid.replace(/^sectors\//, '');
      if (fkMissing(a.sectors as Map<string, unknown>, slug)) {
        add('info', 'unknown-sector-target', `events/${ev.id}`, `target sector not in taxonomy: ${slug}`);
      }
    } else if (tid.startsWith('orgs/')) {
      missingOrgs.add(tid);
      danglingOrgs++;
    } else if (tid.startsWith('infra/')) {
      missingInfra.add(tid);
      danglingInfra++;
    }
  }
  for (const sid of ev.sources ?? []) {
    if (fkMissing(a.sources as Map<string, unknown>, sid)) {
      add('warning', 'dangling-fk', `events/${ev.id}`, `cited source not found: ${sid}`);
    }
  }

  // date sanity — but skip the disclosure-before-start check for
  // documentary events, where an *announcement* legitimately
  // precedes the *event itself* (e.g., UN PoE mandate-end was
  // announced March 28 2024 for the April 30 2024 effective date).
  const sd = ev.start_date;
  const dd = ev.disclosure_date;
  const ed = ev.end_date;
  const isDocumentary = (ev.incident_type ?? []).includes('documentary');
  if (typeof sd === 'string' && typeof dd === 'string' && dd < sd && !isDocumentary) {
    add('warning', 'date', `events/${ev.id}`, `disclosure_date (${dd}) before start_date (${sd})`);
  }
  if (typeof sd === 'string' && typeof ed === 'string' && ed < sd) {
    add('warning', 'date', `events/${ev.id}`, `end_date (${ed}) before start_date (${sd})`);
  }
}

// timeline markers
for (const m of a.timelineMarkers.values()) {
  if (
    m.doctrine_id &&
    fkMissing(a.doctrines as Map<string, unknown>, m.doctrine_id) &&
    fkMissing(a.pillars as Map<string, unknown>, m.doctrine_id) &&
    fkMissing(a.programs as Map<string, unknown>, m.doctrine_id)
  ) {
    add('warning', 'dangling-fk', `timeline-markers/${m.id}`, `doctrine_id not found: ${m.doctrine_id}`);
  }
  for (const sid of m.cited_by ?? []) {
    if (fkMissing(a.sources as Map<string, unknown>, sid)) {
      add('warning', 'dangling-fk', `timeline-markers/${m.id}`, `cited source not found: ${sid}`);
    }
  }
}

// ───── Report ─────

const C = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};
function colorFor(s: Severity): string {
  return s === 'error' ? C.red : s === 'warning' ? C.yellow : C.blue;
}

const stats = a.stats();
console.log(`${C.bold}AUSPEX atlas validation${C.reset}`);
console.log(`  ${stats.events} events · ${stats.doctrines} doctrines · ${stats.pillars} pillars · ${stats.programs} programs`);
console.log(`  ${stats.actors} actors · ${stats.services} services · ${stats.sources} sources · ${stats.timelineMarkers} markers · ${stats.sectors} sectors`);
console.log();

const errorCount = issues.filter((i) => i.severity === 'error').length;
const warnCount = issues.filter((i) => i.severity === 'warning').length;
const infoCount = issues.filter((i) => i.severity === 'info').length;

if (issues.length === 0) {
  console.log(`${C.bold}No issues found.${C.reset}\n`);
} else {
  console.log(
    `${C.bold}${issues.length} issues${C.reset}: ${C.red}${errorCount} error${C.reset} · ${C.yellow}${warnCount} warning${C.reset} · ${C.blue}${infoCount} info${C.reset}\n`,
  );

  const byKind = new Map<string, Issue[]>();
  for (const i of issues) {
    if (!byKind.has(i.kind)) byKind.set(i.kind, []);
    byKind.get(i.kind)!.push(i);
  }

  // Stable ordering
  const order = [
    'parse',
    'empty-file',
    'read-fail',
    'missing-id',
    'duplicate-id',
    'schema',
    'slug-shape',
    'enum',
    'dangling-fk',
    'date',
    'unknown-sector-target',
  ];
  const ordered = [...order.filter((k) => byKind.has(k)), ...[...byKind.keys()].filter((k) => !order.includes(k))];

  const sevRank: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
  for (const kind of ordered) {
    const list = byKind.get(kind)!;
    // Sort: errors first, then warnings, then info — within each, alphabetical by path.
    list.sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || a.path.localeCompare(b.path));
    const counts = list.reduce<Record<string, number>>((acc, i) => {
      acc[i.severity] = (acc[i.severity] ?? 0) + 1;
      return acc;
    }, {});
    console.log(`${C.bold}## ${kind}${C.reset}  ${C.gray}(${list.length}: ${Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(', ')})${C.reset}`);
    // Always show all errors. Limit warnings + info to keep output manageable.
    const errorEntries = list.filter((i) => i.severity === 'error');
    const nonError = list.filter((i) => i.severity !== 'error');
    const nonErrorLimit = 20;
    for (const i of errorEntries) {
      console.log(`  ${colorFor(i.severity)}[${i.severity}]${C.reset} ${C.gray}${i.path}:${C.reset} ${i.message}`);
    }
    for (const i of nonError.slice(0, nonErrorLimit)) {
      console.log(`  ${colorFor(i.severity)}[${i.severity}]${C.reset} ${C.gray}${i.path}:${C.reset} ${i.message}`);
    }
    if (nonError.length > nonErrorLimit) console.log(`  ${C.gray}... and ${nonError.length - nonErrorLimit} more warnings/info${C.reset}`);
    console.log();
  }

  if (danglingOrgs + danglingInfra > 0) {
    console.log(`${C.bold}Target FK gaps (informational — targets/ normalization deferred)${C.reset}`);
    console.log(`  ${missingOrgs.size} unique orgs/ slugs referenced (${danglingOrgs} total refs)`);
    console.log(`  ${missingInfra.size} unique infra/ slugs referenced (${danglingInfra} total refs)`);
    const samples = [...missingOrgs].slice(0, 12);
    if (samples.length) console.log(`  e.g. ${samples.join(', ')}${missingOrgs.size > samples.length ? ', ...' : ''}`);
    console.log();
  }
}

process.exit(errorCount > 0 ? 1 : 0);
