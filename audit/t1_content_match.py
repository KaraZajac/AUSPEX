#!/usr/bin/env python3
"""
t1_content_match.py — T1 check #1 done properly: does each source URL still RESOLVE *and*
serve content that MATCHES the citation? Uses curl_cffi Chrome-impersonation to defeat
TLS/JA3 anti-bot blocks (curl/wget/plain-python get false 000/401/403), then fetches the
actual page and content-matches it against the source record's title + notes.

Catches what status-only checks miss: soft-404s (HTTP 200 served from the homepage or a
rotated/placeholder article — endemic on Reuters/WaPo legacy URLs).

Classification (conservative — only strong signals auto-fail; ambiguous → review):
  ok_match            2xx, real path, decent token overlap with record
  soft404_homepage    2xx but redirected to bare domain "/" (content gone)
  hard_404            404/410 (or 4xx that isn't a known bot-block)
  blocked             401/403/429 even with impersonation (couldn't verify)
  review_low_overlap  2xx, real page, but title/body barely overlaps the record — eyeball it
  error               network/parse failure

Usage:
  python3 audit/t1_content_match.py [--only reuters/ wapo/ ...]   # path-prefix filter
  python3 audit/t1_content_match.py                              # all sources with a url
Output: research/t1-content-match.json  (+ progress to stderr)
"""
import os, re, sys, json, glob, html as ihtml
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import yaml
from curl_cffi import requests as cr
from urllib.parse import urlparse

OUT = os.path.join(ROOT, "research", "t1-content-match.json")
only = []
if "--only" in sys.argv:
    only = sys.argv[sys.argv.index("--only") + 1:]

STOP = set("""a an the of to in on for and or with by from at as is was were be been being
that this these those it its their his her our your into over under after before during
how why what when where who whom which than then but not no nor so such can could will would
should may might must us un re us new news report analysis special exclusive update""".split())

def toks(s):
    s = re.sub(r"&[a-z]+;", " ", (s or "").lower())
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return {w for w in s.split() if len(w) > 2 and w not in STOP}

def load():
    rows = []
    for f in glob.glob(os.path.join(ROOT, "atlas/sources/**/*.yaml"), recursive=True):
        try: d = yaml.safe_load(open(f))
        except Exception: continue
        if not isinstance(d, dict) or not d.get("url"): continue
        sid = d["id"]
        if only and not any(sid.startswith(p.rstrip("/") + "/") or sid.startswith(p) for p in only):
            continue
        rows.append({"id": sid, "url": str(d["url"]), "tier": d.get("tier"),
                     "title": d.get("title") or "", "publisher": d.get("publisher") or "",
                     "notes": d.get("notes") or ""})
    return rows

def text_of(htmltext):
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", htmltext)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return ihtml.unescape(re.sub(r"\s+", " ", t))[:6000]

def page_title(h):
    m = re.search(r"<title[^>]*>(.*?)</title>", h, re.I | re.S)
    t = ihtml.unescape(re.sub(r"\s+", " ", m.group(1)).strip()) if m else ""
    og = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\'](.*?)["\']', h, re.I)
    ogt = ihtml.unescape(og.group(1).strip()) if og else ""
    return t, ogt

def check(r):
    try:
        resp = cr.get(r["url"], impersonate="chrome", timeout=30, allow_redirects=True)
    except Exception as e:
        return {**slim(r), "status": "error", "http": None, "detail": f"{type(e).__name__}: {str(e)[:60]}"}
    code = resp.status_code
    final = str(resp.url)
    fp = urlparse(final)
    orig_path = urlparse(r["url"]).path.strip("/")
    if code in (404, 410):
        return {**slim(r), "status": "hard_404", "http": code, "final": final, "detail": "page not found"}
    if code in (401, 403, 429):
        return {**slim(r), "status": "blocked", "http": code, "final": final, "detail": "blocked even w/ impersonation"}
    if code >= 400:
        return {**slim(r), "status": "hard_404", "http": code, "final": final, "detail": f"http {code}"}
    # 2xx — check soft-404 (redirected to bare homepage) when original had a real path
    if orig_path and fp.path.strip("/") in ("",):
        return {**slim(r), "status": "soft404_homepage", "http": code, "final": final,
                "detail": "redirected to site homepage — content gone"}
    pt, ogt = page_title(resp.text)
    body = text_of(resp.text)
    want = toks(r["title"]) | toks(r["notes"])
    have = toks(pt) | toks(ogt) | toks(body)
    # publisher tokens are noise (appear on every page of a site)
    pub = toks(r["publisher"]); want -= pub; have -= pub
    overlap = (len(want & have) / len(want)) if want else 1.0
    if overlap < 0.20:
        return {**slim(r), "status": "review_low_overlap", "http": code, "final": final,
                "overlap": round(overlap, 2), "page_title": pt[:90], "detail": "title/body barely matches record"}
    return {**slim(r), "status": "ok_match", "http": code, "overlap": round(overlap, 2)}

def slim(r): return {"id": r["id"], "tier": r["tier"], "url": r["url"]}

def main():
    rows = load()
    sys.stderr.write(f"checking {len(rows)} sources (curl_cffi chrome impersonation)…\n")
    out = []
    done = 0
    with ThreadPoolExecutor(max_workers=16) as ex:
        futs = {ex.submit(check, r): r for r in rows}
        for fu in as_completed(futs):
            out.append(fu.result()); done += 1
            if done % 100 == 0: sys.stderr.write(f"  {done}/{len(rows)}…\n")
    buckets = {}
    for o in out: buckets.setdefault(o["status"], []).append(o)
    summary = {k: len(v) for k, v in sorted(buckets.items())}
    report = {"generated": "t1 content-match (curl_cffi chrome)", "total": len(rows),
              "summary": summary,
              "rows": sorted(out, key=lambda x: (x["status"], x["tier"] or "z", x["id"]))}
    json.dump(report, open(OUT, "w"), indent=2)
    sys.stderr.write("\n=== content-match summary ===\n")
    for k, v in summary.items(): sys.stderr.write(f"  {v:4d}  {k}\n")
    sys.stderr.write(f"report → {OUT}\n")

if __name__ == "__main__":
    main()
