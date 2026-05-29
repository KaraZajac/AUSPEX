/**
 * Backfill `external_refs` on actor YAMLs from MITRE ATT&CK Groups
 * (already present in many actors' alias tables) and MISP Galaxy
 * threat-actor cluster (fetched from upstream).
 *
 * Default: dry run. Pass --apply to actually write.
 *
 *   pnpm exec tsx tools/backfill-external-refs.ts           # preview
 *   pnpm exec tsx tools/backfill-external-refs.ts --apply   # write
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { ATLAS_ROOT } from '../src/utils/atlas.ts';

const YAML_OPTS = { schema: yaml.CORE_SCHEMA } as const;
const ACTORS_ROOT = join(ATLAS_ROOT, 'actors');
const MISP_URL = 'https://raw.githubusercontent.com/MISP/misp-galaxy/main/clusters/threat-actor.json';
const CACHE_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'misp-threat-actor.json');

interface MispEntry {
  value: string;
  uuid: string;
  synonyms?: string[];
  meta?: { country?: string; refs?: string[] };
}

const apply = process.argv.includes('--apply');

console.log(apply ? '\x1b[33mAPPLY mode — writing changes\x1b[0m' : '\x1b[36mDRY RUN — pass --apply to write\x1b[0m');

let mispText: string;
if (existsSync(CACHE_PATH)) {
  console.log(`reading MISP Galaxy from cache: ${relative(process.cwd(), CACHE_PATH)}`);
  mispText = readFileSync(CACHE_PATH, 'utf8');
} else {
  console.log(`fetching MISP Galaxy: ${MISP_URL}`);
  console.log(`(if this fails with EBADF, curl-download to ${CACHE_PATH} and re-run)`);
  const resp = await fetch(MISP_URL);
  if (!resp.ok) {
    console.error(`MISP fetch failed: ${resp.status} ${resp.statusText}`);
    process.exit(1);
  }
  mispText = await resp.text();
}
const misp = JSON.parse(mispText) as { values: MispEntry[] };
console.log(`  ${misp.values.length} MISP entries loaded`);

// Build alias→entry lookup (case-insensitive, first writer wins to keep the canonical entry).
const mispByName = new Map<string, MispEntry>();
function addAlias(key: string, e: MispEntry): void {
  const k = key.toLowerCase().trim();
  if (k && !mispByName.has(k)) mispByName.set(k, e);
}
for (const e of misp.values) {
  addAlias(e.value, e);
  for (const syn of e.synonyms ?? []) addAlias(syn, e);
}
console.log(`  ${mispByName.size} MISP names indexed (canonical + synonyms)\n`);

function* walkYaml(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walkYaml(full);
    else if (entry.endsWith('.yaml')) yield full;
  }
}

interface RefSet {
  mitre_attack?: string;
  misp_galaxy?: string;
  misp_galaxy_name?: string;
}

let scanned = 0;
let needWrite = 0;
let mitreFound = 0;
let mispMatched = 0;
let alreadyHasRefs = 0;

for (const path of walkYaml(ACTORS_ROOT)) {
  scanned++;
  const text = readFileSync(path, 'utf8');
  let doc: Record<string, unknown>;
  try {
    doc = yaml.load(text, YAML_OPTS) as Record<string, unknown>;
  } catch (err) {
    console.warn(`  parse fail: ${relative(ATLAS_ROOT, path)}: ${(err as Error).message}`);
    continue;
  }
  if (!doc?.canonical_name) continue;
  if (doc.external_refs) {
    alreadyHasRefs++;
    continue;
  }

  const refs: RefSet = {};

  // MITRE G#### lookup from aliases (highest confidence — we wrote it)
  const aliases = (doc.aliases as Array<{ alias?: string; assigning_org?: string }> | undefined) ?? [];
  for (const al of aliases) {
    if (typeof al?.alias === 'string' && /^G\d{4}$/.test(al.alias)) {
      refs.mitre_attack = al.alias;
      mitreFound++;
      break;
    }
  }

  // MISP match: canonical_name first, then aliases
  const candidates: string[] = [doc.canonical_name as string];
  for (const al of aliases) {
    if (typeof al?.alias === 'string' && !/^G\d{4}$/.test(al.alias)) {
      candidates.push(al.alias);
    }
  }
  let mispMatch: MispEntry | undefined;
  for (const c of candidates) {
    const m = mispByName.get(c.toLowerCase().trim());
    if (m) {
      mispMatch = m;
      refs.misp_galaxy = m.uuid;
      refs.misp_galaxy_name = m.value;
      mispMatched++;
      break;
    }
  }

  // Fall back: derive MITRE G#### from the MISP entry's meta.refs URLs.
  if (!refs.mitre_attack && mispMatch?.meta?.refs) {
    for (const url of mispMatch.meta.refs) {
      const match = url.match(/attack\.mitre\.org\/groups\/(G\d{4})/i);
      if (match) {
        refs.mitre_attack = match[1].toUpperCase();
        mitreFound++;
        break;
      }
    }
  }

  if (!refs.mitre_attack && !refs.misp_galaxy) continue;

  // Append the external_refs block to the end of the file, preserving the
  // original text and any inline comments.
  const append: string[] = ['', 'external_refs:'];
  if (refs.mitre_attack) append.push(`  mitre_attack: ${refs.mitre_attack}`);
  if (refs.misp_galaxy) {
    append.push(`  misp_galaxy: ${refs.misp_galaxy}`);
    if (refs.misp_galaxy_name) {
      // Quote MISP name to be safe against : ' " - special chars.
      const safe = refs.misp_galaxy_name.replace(/'/g, "''");
      append.push(`  misp_galaxy_name: '${safe}'`);
    }
  }
  const newText = text.replace(/\s*$/, '') + '\n' + append.join('\n') + '\n';

  needWrite++;
  const rp = relative(ATLAS_ROOT, path);
  const parts: string[] = [];
  if (refs.mitre_attack) parts.push(`mitre=${refs.mitre_attack}`);
  if (refs.misp_galaxy) parts.push(`misp=${refs.misp_galaxy_name}`);
  console.log(`  ${rp}  ${parts.join(' · ')}`);

  if (apply) writeFileSync(path, newText);
}

console.log();
console.log(`scanned ${scanned} actor files`);
console.log(`  ${alreadyHasRefs} already had external_refs (skipped)`);
console.log(`  ${needWrite} ${apply ? 'updated' : 'would be updated'}`);
console.log(`  mitre_attack populated:   ${mitreFound}`);
console.log(`  misp_galaxy populated:    ${mispMatched}`);
