#!/usr/bin/env python3
"""Deep re-fetch for truncation/thin-affected events: fuller source bodies (40k chars),
curl_cffi Chrome impersonation + dated-Wayback fallback (justice.gov/Europol interstitials,
ODNI PDFs) + pdftotext. Reads event ids from /tmp/trunc-targets.json, writes fuller dossiers
to /tmp/qc-trunc-dossiers.json for re-assessment."""
import os, re, json, glob, subprocess, tempfile, html as ihtml
from concurrent.futures import ThreadPoolExecutor
from curl_cffi import requests as cr
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import yaml
LIMIT = 40000
INTERSTITIAL = re.compile(r"bm-verify|doj-interstitial|triggerInterstitialChallenge|Just a moment|Checking your browser|Access Denied", re.I)
ids = set(json.load(open("/tmp/trunc-targets.json")))
alld = {e["id"]: e for e in json.load(open("/tmp/qc-dossiers-all.json"))}

def clean(t):
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", t)
    return ihtml.unescape(re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", t)))

def pdftext(content):
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
            tf.write(content); tmp = tf.name
        txt = subprocess.run(["pdftotext", "-l", "12", tmp, "-"], capture_output=True, text=True).stdout
        os.unlink(tmp); return txt
    except Exception:
        return ""

def fetch_one(url, is_pdf_hint=False):
    try:
        r = cr.get(url, impersonate="chrome", timeout=40, allow_redirects=True)
    except Exception as e:
        return None
    ct = r.headers.get("content-type", "")
    if "pdf" in ct.lower() or url.lower().endswith(".pdf"):
        txt = pdftext(r.content)
    else:
        txt = clean(r.text)
    ok = r.status_code < 400 and len(txt) >= 400 and not INTERSTITIAL.search(txt)
    return {"ok": ok, "http": r.status_code, "final": str(r.url), "text": txt[:LIMIT]}

def fetch(url, year):
    f = fetch_one(url)
    if f and f["ok"]:
        return f
    # dated wayback fallback
    wb = f"https://web.archive.org/web/{year}0601/{url}"
    for _ in range(2):
        try:
            r = cr.get(wb, impersonate="chrome", timeout=50, allow_redirects=True)
            if r.status_code < 400:
                ct = r.headers.get("content-type", "")
                txt = pdftext(r.content) if ("pdf" in ct.lower() or url.lower().endswith(".pdf")) else clean(r.text)
                if len(txt) > 400:
                    return {"ok": True, "http": r.status_code, "final": str(r.url), "text": txt[:LIMIT], "via": "wayback"}
        except Exception:
            import time; time.sleep(3)
    return f or {"ok": False, "why": "unrecoverable"}

def src_path(sid):
    g = glob.glob(os.path.join(ROOT, "atlas/sources", f"{sid}.yaml")); return g[0] if g else None

def build(eid):
    base = alld.get(eid)
    if not base: return None
    ev_year = (base.get("start_date") or "2018")[:4]
    yr = min(int(ev_year) + 2, 2024) if ev_year.isdigit() else 2020
    new = dict(base); newsrc = []
    for s in base["sources"]:
        if s.get("missing"): newsrc.append(s); continue
        url = s.get("url") or s.get("archive_url")
        f = fetch(url, yr) if url else {"ok": False, "why": "no url"}
        s2 = dict(s); s2["fetch"] = f; newsrc.append(s2)
    new["sources"] = newsrc
    return new

with ThreadPoolExecutor(max_workers=10) as ex:
    out = [d for d in ex.map(build, list(ids)) if d]
json.dump(out, open("/tmp/qc-trunc-dossiers.json", "w"), indent=2)
ok = sum(1 for e in out for s in e["sources"] if s.get("fetch", {}).get("ok"))
tot = sum(len(e["sources"]) for e in out)
avg = sum(len(s.get("fetch", {}).get("text", "")) for e in out for s in e["sources"]) // max(1, tot)
print(f"deep-fetched {len(out)} events; source fetch ok {ok}/{tot}; avg text len {avg}")
