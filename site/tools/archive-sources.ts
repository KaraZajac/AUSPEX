/**
 * archive-sources.ts — snapshot every source URL against link rot
 * (docs/CORPUS-VERIFICATION-PLAN.md, tier T1).
 *
 * Two modes:
 *   default  — for every source with a url and no archive_url, query the Wayback
 *              AVAILABILITY API (cheap, read-only) and write archive_url back into the
 *              YAML when a snapshot already exists.
 *   --save   — for sources that still lack a snapshot after the default pass, request a
 *              NEW Wayback capture (Save Page Now), throttled to respect rate limits
 *              (~1 request / 15 s ⇒ run overnight for large batches; resumable —
 *              already-archived sources are skipped on every run).
 *
 * Usage:
 *   pnpm exec tsx tools/archive-sources.ts --limit 50          # availability pass, 50 sources
 *   pnpm exec tsx tools/archive-sources.ts                     # availability pass, all
 *   pnpm exec tsx tools/archive-sources.ts --save --limit 20   # capture 20 missing ones
 *
 * Write-back is textual (replaces the `archive_url: null` line; inserts after `url:` if the
 * field is absent) so file formatting and comments are preserved. Run the gate after.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';

// HTTP via curl (not node fetch): robust to proxy/sandbox environments.
const UA = 'AUSPEX-archiver/1.0 (research corpus preservation)';
function curlJson(url: string): any {
  const out = execFileSync('curl', ['-s', '--max-time', '30', '-A', UA, url], { encoding: 'utf8' });
  return JSON.parse(out);
}
function curlSave(url: string): { code: number; location: string | null; timedOut: boolean } {
  // -i to capture headers; SPN responds 200/302 with the snapshot in content-location/location.
  // NOTE: SPN keeps capturing SERVER-SIDE even if our client times out — a timeout means
  // "requested, unverified", not "failed". The next availability pass writes those back
  // (the loop is availability-first and resumable), so re-running converges.
  try {
    const out = execFileSync('curl', ['-s', '-i', '--max-time', '180', '-A', UA, `https://web.archive.org/save/${url}`], { encoding: 'utf8' });
    const code = parseInt(out.match(/^HTTP\/[\d.]+ (\d{3})/m)?.[1] ?? '0', 10);
    const loc = out.match(/^(?:content-location|location):\s*(\S+)/im)?.[1] ?? null;
    return { code, location: loc, timedOut: false };
  } catch (err: any) {
    if (err?.status === 28) return { code: 0, location: null, timedOut: true }; // curl timeout
    throw err;
  }
}

const ROOT = resolve(import.meta.dirname, '..', '..');
const SRC_DIR = join(ROOT, 'atlas', 'sources');
const SAVE_MODE = process.argv.includes('--save');
const limIdx = process.argv.indexOf('--limit');
const LIMIT = limIdx >= 0 ? parseInt(process.argv[limIdx + 1], 10) : Infinity;
const SAVE_DELAY_MS = 15_000;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.yaml')) out.push(p);
  }
  return out;
}

interface Src { path: string; raw: string; id: string; url: string }
const candidates: Src[] = [];
for (const p of walk(SRC_DIR)) {
  const raw = readFileSync(p, 'utf8');
  const doc = yaml.load(raw) as Record<string, any>;
  if (!doc?.id || !doc.url) continue;          // url: null sources are exempt by policy
  if (doc.archive_url) continue;               // already snapshotted — resumable skip
  candidates.push({ path: p, raw, id: doc.id, url: String(doc.url) });
}
console.log(`sources needing a snapshot: ${candidates.length}${Number.isFinite(LIMIT) ? ` (processing ${Math.min(LIMIT, candidates.length)})` : ''} · mode: ${SAVE_MODE ? 'SAVE (capture new)' : 'availability (find existing)'}`);

function writeBack(s: Src, archiveUrl: string) {
  let next: string;
  if (/^archive_url:/m.test(s.raw)) {
    next = s.raw.replace(/^archive_url:.*$/m, `archive_url: "${archiveUrl}"`);
  } else {
    // insert directly after the url: line (handles single- and multi-line url values poorly
    // formatted sources are rare; the gate validates the result)
    next = s.raw.replace(/^(url:.*)$/m, `$1\narchive_url: "${archiveUrl}"`);
  }
  writeFileSync(s.path, next);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let found = 0, captured = 0, missing = 0, errors = 0, n = 0;
for (const s of candidates) {
  if (n >= LIMIT) break;
  n++;
  try {
    // 1) availability check (both modes — never re-capture what exists)
    const avail = curlJson(`https://archive.org/wayback/available?url=${encodeURIComponent(s.url)}`);
    const snap = avail?.archived_snapshots?.closest;
    if (snap?.available && snap?.url) {
      const archiveUrl = String(snap.url).replace(/^http:/, 'https:');
      writeBack(s, archiveUrl);
      found++;
      console.log(`  ✓ found    ${s.id} → ${archiveUrl.slice(0, 80)}`);
      continue;
    }
    if (!SAVE_MODE) {
      missing++;
      console.log(`  · missing  ${s.id} (no snapshot — re-run with --save to capture)`);
      continue;
    }
    // 2) capture (SAVE mode only, throttled)
    const save = curlSave(s.url);
    if (save.timedOut) {
      missing++; // counts as still-missing this run; the next availability pass picks it up
      console.log(`  ⏳ requested ${s.id} (client timeout; SPN continues server-side — re-run to verify)`);
      await sleep(SAVE_DELAY_MS);
      continue;
    }
    if (save.code === 200 || save.code === 302) {
      const loc = save.location;
      const archiveUrl = loc?.startsWith('/web/')
        ? `https://web.archive.org${loc}`
        : loc?.startsWith('https://web.archive.org/')
          ? loc
          : `https://web.archive.org/web/2/${s.url}`; // canonical latest-snapshot form
      writeBack(s, archiveUrl);
      captured++;
      console.log(`  ⊕ captured ${s.id}`);
    } else {
      errors++;
      console.log(`  ✗ save failed (${save.code}) ${s.id}`);
    }
    await sleep(SAVE_DELAY_MS);
  } catch (err) {
    errors++;
    console.log(`  ✗ error    ${s.id}: ${(err as Error).message.slice(0, 90)}`);
    if (SAVE_MODE) await sleep(SAVE_DELAY_MS);
  }
}
console.log(`\ndone: ${found} existing snapshots written back · ${captured} newly captured · ${missing} missing (need --save) · ${errors} errors`);
console.log(`re-run any time — already-archived sources are skipped. Then run the gate (make verify).`);
