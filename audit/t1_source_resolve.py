#!/usr/bin/env python3
"""
t1_source_resolve.py — T1 source-resolution sweep (CORPUS-VERIFICATION-PLAN tier T1, check #1).

For every source record: does it RESOLVE — live URL (2xx/3xx) OR a usable archive_url?
Classifies each source so the actionable set is the genuinely unrecoverable ones
(dead live URL AND no archive), separate from bot-blocks (live 403/429 but archived).

Live probe is curl, parallelized. Archive snapshots are NOT re-fetched here (the Wayback
copy is immutable once captured); presence of archive_url = recoverable. Resumable: pass
--resume to reuse a prior probe cache.

Output: research/t1-source-resolve.json  (per-source rows + summary)
"""
import os, re, sys, json, glob, subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import yaml

OUT = os.path.join(ROOT, "research", "t1-source-resolve.json")
CACHE = os.path.join(ROOT, "research", ".t1-probe-cache.json")
RESUME = "--resume" in sys.argv

def load_sources():
    rows = []
    for f in glob.glob(os.path.join(ROOT, "atlas/sources/**/*.yaml"), recursive=True):
        try:
            d = yaml.safe_load(open(f))
        except Exception:
            continue
        if not isinstance(d, dict) or "id" not in d:
            continue
        rows.append({
            "id": d["id"],
            "url": (None if d.get("url") in (None, "null", "") else str(d["url"])),
            "archive_url": (None if d.get("archive_url") in (None, "null", "") else str(d["archive_url"])),
            "tier": d.get("tier"),
            "kind": d.get("kind"),
            "title": d.get("title"),
            "publisher": d.get("publisher"),
        })
    return rows

def probe(url):
    try:
        r = subprocess.run(
            ["curl", "-sS", "-o", "/dev/null", "-L", "--max-time", "20",
             "-A", "Mozilla/5.0 (AUSPEX audit)", "-w", "%{http_code}", url],
            capture_output=True, text=True, timeout=30)
        return r.stdout.strip() or "ERR"
    except Exception:
        return "ERR"

def main():
    rows = load_sources()
    urls = sorted({r["url"] for r in rows if r["url"]})
    cache = {}
    if RESUME and os.path.exists(CACHE):
        cache = json.load(open(CACHE))
    todo = [u for u in urls if u not in cache]
    print(f"sources={len(rows)}  unique_urls={len(urls)}  probing={len(todo)} (cached={len(urls)-len(todo)})")
    done = 0
    with ThreadPoolExecutor(max_workers=32) as ex:
        for u, code in zip(todo, ex.map(probe, todo)):
            cache[u] = code
            done += 1
            if done % 100 == 0:
                print(f"  {done}/{len(todo)} probed …")
                json.dump(cache, open(CACHE, "w"))
    json.dump(cache, open(CACHE, "w"))

    def classify(r):
        u, a = r["url"], r["archive_url"]
        if not u:
            return "url_null_exempt"
        code = cache.get(u, "ERR")
        live = bool(re.match(r"^[23]\d\d$", code))
        if live:
            return "live_ok"
        # not live
        if a:
            return "blocked_or_dead_archived" if code in ("403", "429") else "dead_archived"
        return "blocked_no_archive" if code in ("403", "429") else "dead_no_archive"

    cats = {}
    for r in rows:
        r["http"] = cache.get(r["url"], None) if r["url"] else None
        r["resolution"] = classify(r)
        cats.setdefault(r["resolution"], []).append(r)

    summary = {k: len(v) for k, v in sorted(cats.items())}
    # actionable = cannot be recovered from anywhere
    actionable = cats.get("dead_no_archive", []) + cats.get("blocked_no_archive", [])
    report = {
        "generated": "t1 source-resolve sweep",
        "totals": {"sources": len(rows), "unique_urls": len(urls)},
        "summary": summary,
        "actionable_unrecoverable": sorted(
            [{"id": r["id"], "http": r["http"], "url": r["url"], "tier": r["tier"], "kind": r["kind"]}
             for r in actionable], key=lambda x: (x["tier"] or "z", x["id"])),
        "rows": sorted([{k: r[k] for k in ("id","resolution","http","tier","kind","url","archive_url")}
                        for r in rows], key=lambda x: x["id"]),
    }
    json.dump(report, open(OUT, "w"), indent=2)
    print("\n=== T1 source-resolution summary ===")
    for k, v in summary.items():
        print(f"  {k:28s} {v}")
    print(f"\nactionable (unrecoverable): {len(actionable)}")
    print(f"report → {OUT}")

if __name__ == "__main__":
    main()
