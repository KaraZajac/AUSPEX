#!/usr/bin/env python3
"""Backfill archive_url for sources that HAVE a Wayback snapshot but never recorded it.
Uses curl_cffi to resolve https://web.archive.org/web/<year>/<url> (the Wayback availability
API is rate-limiting archive-sources.ts, but this redirect path works). Writes the resolved
snapshot URL back into the source YAML textually (preserving formatting). Sources with no
snapshot are left null (they need an actual Save-Page-Now capture). Gate-safe (archive_url only).

Usage: python3 audit/t1_archive_backfill.py [--write]"""
import os, re, sys, glob, yaml
from concurrent.futures import ThreadPoolExecutor
from curl_cffi import requests as cr
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRITE = "--write" in sys.argv
SNAP = re.compile(r"/web/(\d{14})/")

def candidates():
    out = []
    for f in glob.glob(os.path.join(ROOT, "atlas/sources/**/*.yaml"), recursive=True):
        try: d = yaml.safe_load(open(f))
        except Exception: continue
        if not isinstance(d, dict): continue
        u = d.get("url"); a = d.get("archive_url")
        if u and u not in (None, "null", "") and a in (None, "null", ""):
            yr = str(d.get("published_on") or "2022")[:4]
            if not yr.isdigit(): yr = "2022"
            out.append((f, u, yr))
    return out

def resolve(item):
    f, u, yr = item
    try:
        r = cr.get(f"https://web.archive.org/web/{yr}0601/{u}", impersonate="chrome",
                   timeout=40, allow_redirects=True)
    except Exception:
        return (f, None)
    if r.status_code < 400 and SNAP.search(str(r.url)):
        return (f, str(r.url))
    return (f, None)

def write_archive(path, archive_url):
    lines = open(path).read().split("\n")
    for i, ln in enumerate(lines):
        if re.match(r"^archive_url:\s", ln):
            lines[i] = f"archive_url: {archive_url}"
            open(path, "w").write("\n".join(lines)); return True
    # no archive_url line — insert after url:
    for i, ln in enumerate(lines):
        if ln.startswith("url:"):
            lines.insert(i+1, f"archive_url: {archive_url}")
            open(path, "w").write("\n".join(lines)); return True
    return False

cands = candidates()
print(f"checking {len(cands)} unarchived sources via Wayback (curl_cffi)…")
found = 0; done = 0
with ThreadPoolExecutor(max_workers=6) as ex:
    for path, arc in ex.map(resolve, cands):
        done += 1
        if arc:
            found += 1
            if WRITE: write_archive(path, arc)
        if done % 50 == 0: print(f"  {done}/{len(cands)} … {found} snapshots found")
print(f"\n{'WROTE' if WRITE else 'DRY-RUN'}: {found}/{len(cands)} sources have a Wayback snapshot"
      f"{' (archive_url backfilled)' if WRITE else ''}; {len(cands)-found} still need SPN capture")
