/**
 * Extract per-group MITRE ATT&CK techniques (T-codes) from the
 * downloaded enterprise-attack STIX bundle. Writes
 * .cache/mitre-ttps.json with shape:
 *   { "G0032": ["T1003", "T1059.001", ...], "G0034": [...], ... }
 *
 * The full STIX bundle is ~45 MB; the extracted map is tiny.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '..', '.cache');
const IN_PATH = join(CACHE_DIR, 'mitre-enterprise-attack.json');
const OUT_PATH = join(CACHE_DIR, 'mitre-ttps.json');
const MALWARE_OUT_PATH = join(CACHE_DIR, 'mitre-malware.json');

interface StixRef { source_name?: string; external_id?: string; url?: string }
interface StixObj {
  id: string;
  type: string;
  name?: string;
  x_mitre_aliases?: string[];
  external_references?: StixRef[];
  source_ref?: string;
  target_ref?: string;
  relationship_type?: string;
  revoked?: boolean;
  x_mitre_deprecated?: boolean;
}

console.log(`reading ${IN_PATH} …`);
const bundle = JSON.parse(readFileSync(IN_PATH, 'utf8')) as { objects: StixObj[] };
console.log(`  ${bundle.objects.length} STIX objects loaded`);

// Index STIX ids by ATT&CK external id (Gxxxx, Txxxx, Sxxxx)
const stixToAttack = new Map<string, string>();
const attackToType = new Map<string, string>();
const malwareNames = new Map<string, string[]>();  // ATT&CK Sxxxx -> [canonical, aliases…]
for (const obj of bundle.objects) {
  if (obj.revoked || obj.x_mitre_deprecated) continue;
  if (obj.type !== 'intrusion-set' && obj.type !== 'attack-pattern' && obj.type !== 'malware') continue;
  const ref = (obj.external_references ?? []).find((r) => r.source_name === 'mitre-attack');
  if (!ref?.external_id) continue;
  stixToAttack.set(obj.id, ref.external_id);
  attackToType.set(ref.external_id, obj.type);
  if (obj.type === 'malware' && obj.name) {
    const names = [obj.name, ...(obj.x_mitre_aliases ?? []).filter((a) => a !== obj.name)];
    malwareNames.set(ref.external_id, names);
  }
}
console.log(`  ${stixToAttack.size} mappable STIX objects (intrusion-sets + attack-patterns + malware)`);
console.log(`  ${malwareNames.size} non-deprecated malware entries indexed`);

// Walk relationships: source=intrusion-set, target=attack-pattern OR malware, rel=uses
const groupToTechniques = new Map<string, Set<string>>();
const groupToMalware = new Map<string, Set<string>>();
let techniqueRels = 0;
let malwareRels = 0;
for (const obj of bundle.objects) {
  if (obj.type !== 'relationship') continue;
  if (obj.relationship_type !== 'uses') continue;
  const src = obj.source_ref ? stixToAttack.get(obj.source_ref) : undefined;
  const tgt = obj.target_ref ? stixToAttack.get(obj.target_ref) : undefined;
  if (!src || !tgt) continue;
  if (attackToType.get(src) !== 'intrusion-set') continue;
  const tgtType = attackToType.get(tgt);
  if (tgtType === 'attack-pattern') {
    techniqueRels++;
    let s = groupToTechniques.get(src);
    if (!s) {
      s = new Set();
      groupToTechniques.set(src, s);
    }
    s.add(tgt);
  } else if (tgtType === 'malware') {
    malwareRels++;
    let s = groupToMalware.get(src);
    if (!s) {
      s = new Set();
      groupToMalware.set(src, s);
    }
    s.add(tgt);
  }
}
console.log(`  ${techniqueRels} technique "uses" relationships; ${groupToTechniques.size} groups have ≥1 technique`);
console.log(`  ${malwareRels} malware  "uses" relationships; ${groupToMalware.size} groups have ≥1 malware`);

// Write techniques map (Gxxxx -> [Txxxx, ...])
const techOut: Record<string, string[]> = {};
for (const [g, ts] of groupToTechniques.entries()) techOut[g] = [...ts].sort();
writeFileSync(OUT_PATH, JSON.stringify(techOut, null, 2));
console.log(`wrote ${OUT_PATH} (${Object.keys(techOut).length} groups)`);

// Write malware map (Gxxxx -> [malware names, lowercased]).
// We use names rather than Sxxxx ids because event-side extraction
// matches on free-text malware mentions (ShadowPad, PlugX, Mimikatz),
// not on STIX ids.
const malwareOut: Record<string, string[]> = {};
for (const [g, sids] of groupToMalware.entries()) {
  const names = new Set<string>();
  for (const sid of sids) {
    for (const n of malwareNames.get(sid) ?? []) {
      // Lowercase and strip common variations for matching.
      names.add(n.toLowerCase().trim());
    }
  }
  if (names.size > 0) malwareOut[g] = [...names].sort();
}
writeFileSync(MALWARE_OUT_PATH, JSON.stringify(malwareOut, null, 2));
console.log(`wrote ${MALWARE_OUT_PATH} (${Object.keys(malwareOut).length} groups)`);

// Sample stats
const techCounts = [...groupToTechniques.values()].map((s) => s.size).sort((a, b) => b - a);
console.log(`technique counts — max=${techCounts[0]}, median=${techCounts[Math.floor(techCounts.length / 2)]}, mean=${(techCounts.reduce((a, b) => a + b, 0) / techCounts.length).toFixed(1)}`);
const malwareCounts = [...groupToMalware.values()].map((s) => s.size).sort((a, b) => b - a);
if (malwareCounts.length > 0) {
  console.log(`malware counts   — max=${malwareCounts[0]}, median=${malwareCounts[Math.floor(malwareCounts.length / 2)]}, mean=${(malwareCounts.reduce((a, b) => a + b, 0) / malwareCounts.length).toFixed(1)}`);
}
