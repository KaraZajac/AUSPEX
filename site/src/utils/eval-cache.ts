/**
 * Build-time memoization for the expensive backtests (leave-one-out,
 * stability, temporal, …). The math is UNCHANGED — this only avoids
 * recomputing an identical result:
 *   - within one build: the /api/*-eval.json endpoint and the matching
 *     /research/*-eval page call the same function; the second call reuses
 *     the first's result instead of re-running the backtest.
 *   - across builds: the result is written to .cache/eval-*.json keyed by a
 *     content hash of the corpus (+ MITRE features + options), so a rebuild
 *     with unchanged data is instant; any data change recomputes.
 *
 * .cache/ is gitignored. Delete it (or bump EVAL_REV) to force a recompute.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { atlas } from './atlas';

// Bump when the scoring/eval math changes so stale caches are ignored.
const EVAL_REV = 1;

const cacheDir = () => resolve(process.cwd(), '.cache');

// Map/Set-aware (de)serialization — the eval results carry Maps (perState,
// confusion tallies, …). Plain JSON would silently drop them to {}.
const replacer = (_k: string, v: unknown) => {
	if (v instanceof Map) return { __t: 'Map', v: [...v.entries()] };
	if (v instanceof Set) return { __t: 'Set', v: [...v.values()] };
	return v;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reviver = (_k: string, v: any) => {
	if (v && typeof v === 'object') {
		if (v.__t === 'Map') return new Map(v.v);
		if (v.__t === 'Set') return new Set(v.v);
	}
	return v;
};

let _corpusSig: string | null = null;
/** Content hash of everything the backtests read: the atlas events + actors
 *  and the MITRE feature caches. Any change invalidates every cached eval. */
function corpusSig(): string {
	if (_corpusSig) return _corpusSig;
	const a = atlas();
	const h = createHash('sha256').update(`rev${EVAL_REV}`);
	h.update(JSON.stringify([...a.events.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1))));
	h.update(JSON.stringify([...a.actors.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1))));
	for (const f of ['mitre-ttps.json', 'mitre-malware.json']) {
		const p = resolve(cacheDir(), f);
		if (existsSync(p)) h.update(readFileSync(p));
	}
	_corpusSig = h.digest('hex');
	return _corpusSig;
}

const mem = new Map<string, unknown>();

/** Return a cached result for (name, args) if the corpus is unchanged,
 *  otherwise run `compute()` once and cache it (in memory + on disk). */
export function memoizeEval<T>(name: string, args: unknown, compute: () => T): T {
	const key = createHash('sha256')
		.update(corpusSig())
		.update(JSON.stringify(args ?? null))
		.digest('hex')
		.slice(0, 16);
	const memKey = `${name}:${key}`;
	if (mem.has(memKey)) return mem.get(memKey) as T;

	const file = resolve(cacheDir(), `eval-${name}-${key}.json`);
	if (existsSync(file)) {
		try {
			const v = JSON.parse(readFileSync(file, 'utf8'), reviver) as T;
			mem.set(memKey, v);
			return v;
		} catch {
			/* corrupt cache — fall through and recompute */
		}
	}

	const v = compute();
	try {
		mkdirSync(cacheDir(), { recursive: true });
		writeFileSync(file, JSON.stringify(v, replacer));
	} catch {
		/* read-only fs — memoize in-process only */
	}
	mem.set(memKey, v);
	return v;
}
