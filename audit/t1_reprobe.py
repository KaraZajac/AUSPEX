#!/usr/bin/env python3
"""Re-probe the T1 'actionable' set with browser-grade headers to separate genuinely-dead
(404/410/gone) from bot-blocked/paywalled (alive but refusing curl). Reads the actionable
list from t1-source-resolve.json; writes t1-actionable-reprobe.json."""
import os, re, json, subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rep = json.load(open(os.path.join(ROOT, "research", "t1-source-resolve.json")))
rows = [r for r in rep["rows"] if r["resolution"] in ("dead_no_archive", "blocked_no_archive")]

UA = ("Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0")
def reprobe(url):
    try:
        r = subprocess.run(
            ["curl", "-sS", "-o", "/dev/null", "-L", "--compressed", "--max-time", "25",
             "--http1.1", "-A", UA,
             "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
             "-H", "Accept-Language: en-US,en;q=0.9",
             "-H", "Sec-Fetch-Mode: navigate", "-H", "Sec-Fetch-Site: none",
             "-w", "%{http_code}", url],
            capture_output=True, text=True, timeout=35)
        return r.stdout.strip() or "ERR"
    except Exception:
        return "ERR"

with ThreadPoolExecutor(max_workers=24) as ex:
    codes = list(ex.map(reprobe, [r["url"] for r in rows]))

def verdict(c):
    if re.match(r"^[23]\d\d$", c): return "ALIVE (browser UA)"
    if c in ("401","402","403","429"): return "bot-block/paywall (alive, needs archive)"
    if c in ("404","410"): return "GONE (404/410 — fix URL or replace source)"
    if c == "000" or c == "ERR": return "unreachable (000 — verify by hand/browser)"
    return f"other ({c})"

out = []
for r, c in zip(rows, codes):
    out.append({"id": r["id"], "tier": r["tier"], "first": r["http"], "reprobe": c,
                "verdict": verdict(c), "url": r["url"]})

buckets = {}
for o in out: buckets.setdefault(o["verdict"], []).append(o)
summary = {k: len(v) for k, v in sorted(buckets.items())}
json.dump({"summary": summary, "rows": sorted(out, key=lambda x:(x["verdict"], x["id"]))},
          open(os.path.join(ROOT, "research", "t1-actionable-reprobe.json"), "w"), indent=2)
print("=== re-probe verdicts (browser-grade UA) ===")
for k, v in summary.items(): print(f"  {v:3d}  {k}")
print("\n--- GONE (genuine 404/410) ---")
for o in sorted(buckets.get("GONE (404/410 — fix URL or replace source)", []), key=lambda x:x["id"]):
    print(f"  [{o['tier']}] {o['id']}")
print("\n--- unreachable 000 (needs hand check) ---")
for o in buckets.get("unreachable (000 — verify by hand/browser)", []):
    print(f"  [{o['tier']}] {o['id']}  {o['url']}")
