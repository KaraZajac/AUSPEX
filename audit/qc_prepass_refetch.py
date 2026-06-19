#!/usr/bin/env python3
"""Patch failed/thin source fetches in /tmp/qc-dossiers-all.json using a dated Wayback
fallback (defeats justice.gov/Europol/NCSC Akamai interstitials that return 200 + empty body,
and recovers PDFs that didn't extract). Re-fetches ONLY sources whose current fetch is
failed/thin/interstitial, keyed by URL (deduped). Writes the patched dossier file back."""
import os, re, json, glob, subprocess, tempfile, html as ihtml
from concurrent.futures import ThreadPoolExecutor
from curl_cffi import requests as cr
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSS = "/tmp/qc-dossiers-all.json"
INTERSTITIAL = re.compile(r"bm-verify|doj-interstitial|triggerInterstitialChallenge|Just a moment|Checking your browser|Access Denied", re.I)

def clean_html(t):
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", t)
    return ihtml.unescape(re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", t)))

def is_bad(fetch):
    if not fetch or not fetch.get("ok"): return True
    txt = fetch.get("text", "") or ""
    if len(txt) < 400: return True
    if INTERSTITIAL.search(txt): return True
    return False

def wayback(url, year):
    wb = f"https://web.archive.org/web/{year}0601/{url}"
    r = None
    for attempt in range(3):
        try:
            r = cr.get(wb, impersonate="chrome", timeout=50, allow_redirects=True)
            if r.status_code < 400: break
        except Exception:
            import time; time.sleep(2 + attempt*3)
    if r is None:
        return {"ok": False, "why": "wb:exhausted"}
    if r.status_code >= 400: return {"ok": False, "http": r.status_code, "why": "wb-http"}
    ct = r.headers.get("content-type", "")
    if "pdf" in ct.lower() or url.lower().endswith(".pdf"):
        try:
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
                tf.write(r.content); tmp = tf.name
            txt = subprocess.run(["pdftotext", "-l", "6", tmp, "-"], capture_output=True, text=True).stdout
            os.unlink(tmp)
        except Exception: txt = ""
    else:
        txt = clean_html(r.text)
    # strip the wayback banner prefix (capture count / toolbar) — keep from the real title on
    return {"ok": len(txt) > 400, "http": r.status_code, "final": str(r.url),
            "text": txt[:9000], "via": "wayback"}

def year_for(src, ev_year):
    # prefer a snapshot ~2y after the source's own date; fall back to event year+2
    for key in ("published_on",):
        pass
    return min(int(ev_year) + 2, 2024) if ev_year else 2020

doss = json.load(open(DOSS))
# collect unique bad URLs with a representative year
bad = {}
for e in doss:
    yr = (e.get("start_date") or "2018")[:4]
    for s in e["sources"]:
        if s.get("missing"): continue
        if is_bad(s.get("fetch", {})):
            url = s.get("url") or s.get("archive_url")
            if url and url not in bad:
                bad[url] = year_for(s, yr)
print(f"bad/thin unique source URLs to re-fetch via Wayback: {len(bad)}")

def go(item):
    url, yr = item
    return url, wayback(url, yr)
results = {}
with ThreadPoolExecutor(max_workers=4) as ex:
    for url, res in ex.map(go, list(bad.items())):
        results[url] = res
ok = sum(1 for r in results.values() if r.get("ok"))
print(f"recovered via Wayback: {ok}/{len(bad)}")

# patch back
patched = 0
for e in doss:
    for s in e["sources"]:
        url = s.get("url") or s.get("archive_url")
        if url in results and results[url].get("ok") and is_bad(s.get("fetch", {})):
            s["fetch"] = results[url]; patched += 1
json.dump(doss, open(DOSS, "w"), indent=2)
print(f"patched {patched} source slots → {DOSS}")
