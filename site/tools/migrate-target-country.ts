/**
 * Migrate event YAML files: pull country-qualified tails off
 * target_id sector slugs and into a dedicated `country:` field.
 *
 *   target_id: sectors/government/sa
 *   role: primary
 *
 * becomes
 *
 *   target_id: sectors/government
 *   country: sa
 *   role: primary
 *
 * Run dry by default; pass --apply to write.
 *   pnpm exec tsx tools/migrate-target-country.ts
 *   pnpm exec tsx tools/migrate-target-country.ts --apply
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ATLAS_ROOT } from '../src/utils/atlas.ts';

const apply = process.argv.includes('--apply');

function* walkYaml(dir: string): Generator<string> {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) yield* walkYaml(full);
    else if (e.endsWith('.yaml')) yield full;
  }
}

/**
 * Match `  - target_id: sectors/<path>/<country>` lines. Captures:
 *   1: leading whitespace
 *   2: the sector path (without leading `sectors/`)
 *   3: the country tail (2-char or dashed-compound)
 *   4: optional trailing comment
 *
 * Country pattern: starts with a 2-letter token, optionally followed by
 * dashed segments of 2-9 letters. Won't match real sector words like
 * "research" or "civilian" because those are >2 chars without a dash.
 */
const RX = /^( *)- target_id: sectors\/(.+)\/([a-z]{2}(?:-[a-z]{2,9})*)(\s*#.*)?$/gm;

let scanned = 0;
let touchedFiles = 0;
let touchedTargets = 0;
const countryDist = new Map<string, number>();

for (const path of walkYaml(join(ATLAS_ROOT, 'events'))) {
  scanned++;
  const orig = readFileSync(path, 'utf8');
  const updated = orig.replace(RX, (match, indent: string, sectorPath: string, country: string, trailing: string | undefined) => {
    touchedTargets++;
    countryDist.set(country, (countryDist.get(country) ?? 0) + 1);
    const trail = trailing ? trailing : '';
    return `${indent}- target_id: sectors/${sectorPath}\n${indent}  country: ${country}${trail}`;
  });
  if (updated !== orig) {
    touchedFiles++;
    const rp = relative(ATLAS_ROOT, path);
    console.log(`  ${rp}`);
    if (apply) writeFileSync(path, updated);
  }
}

console.log();
console.log(`scanned ${scanned} event files`);
console.log(`${touchedFiles} ${apply ? 'updated' : 'would be updated'}; ${touchedTargets} target rows ${apply ? 'migrated' : 'would migrate'}`);
console.log();
console.log('country distribution:');
const sorted = [...countryDist.entries()].sort((a, b) => b[1] - a[1]);
for (const [c, n] of sorted) console.log(`  ${c.padEnd(20)} ${n}`);

if (!apply) {
  console.log();
  console.log('Run with --apply to write changes.');
}
