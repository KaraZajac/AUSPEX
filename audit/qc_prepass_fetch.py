#!/usr/bin/env python3
"""qc_prepass_fetch.py — assemble per-event verification dossiers for the census pre-pass
(CORPUS-VERIFICATION-PLAN T2). For the next N pending events in the worklist, load the event
record + each cited source record, fetch the source content (curl_cffi Chrome impersonation,
pdftotext for PDFs), and write a dossier JSON the assessor reads to pre-check the 6-point
protocol. Does NOT stamp anything — output feeds human (kara) verification.

Usage: python3 audit/qc_prepass_fetch.py [--n 8] [--offset 0] [--out /tmp/qc-dossiers.json]
"""
import os, re, sys, json, glob, subprocess, tempfile
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import yaml
from curl_cffi import requests as cr

def arg(flag, default):
    return sys.argv[sys.argv.index(flag)+1] if flag in sys.argv else default
N = int(arg("--n", "8")); OFF = int(arg("--offset", "0")); OUT = arg("--out", "/tmp/qc-dossiers.json")

wl = json.load(open(os.path.join(ROOT, "research", "qc-verify-worklist.json")))
batch = wl["pending"][OFF:OFF+N]

def src_path(sid):
    g = glob.glob(os.path.join(ROOT, "atlas/sources", f"{sid}.yaml")); return g[0] if g else None

def fetch(url):
    if not url: return {"ok": False, "why": "no url"}
    try:
        r = cr.get(url, impersonate="chrome", timeout=35, allow_redirects=True)
    except Exception as e:
        return {"ok": False, "why": f"{type(e).__name__}", "http": None}
    ct = r.headers.get("content-type", "")
    if "pdf" in ct.lower() or url.lower().endswith(".pdf"):
        try:
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
                tf.write(r.content); tmp = tf.name
            txt = subprocess.run(["pdftotext", "-l", "6", tmp, "-"], capture_output=True, text=True).stdout
            os.unlink(tmp)
        except Exception: txt = ""
    else:
        txt = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", r.text)
        txt = re.sub(r"(?s)<[^>]+>", " ", txt)
        import html as ih; txt = ih.unescape(re.sub(r"\s+", " ", txt))
    return {"ok": r.status_code < 400, "http": r.status_code, "final": str(r.url), "text": txt[:9000]}

def build(item):
    ev = yaml.safe_load(open(os.path.join(ROOT, item["path"])))
    def d(v): return v.isoformat() if hasattr(v, "isoformat") else v
    sources = []
    for sid in ev.get("sources", []):
        p = src_path(sid)
        s = yaml.safe_load(open(p)) if p else None
        if not s: sources.append({"id": sid, "missing": True}); continue
        body = fetch(s.get("url"))
        if not body.get("ok") and s.get("archive_url"):
            body = fetch(s.get("archive_url"))
        sources.append({"id": sid, "tier": s.get("tier"), "kind": s.get("kind"),
                        "title": s.get("title"), "url": s.get("url"),
                        "archive_url": s.get("archive_url"), "fetch": body})
    return {
        "id": ev["id"], "path": item["path"], "name": ev.get("name"),
        "reasons": item["reasons"],
        "start_date": d(ev.get("start_date")), "disclosure_date": d(ev.get("disclosure_date")),
        "incident_type": ev.get("incident_type"),
        "summary": (ev.get("summary") or "").strip(),
        "attributions": [{k: d(a.get(k)) for k in ("actor_id","attributing_org","attributing_org_confidence","auspex_assessment","attribution_source_id")} for a in ev.get("attributions", [])],
        "doctrine_links": [{"doctrine_id": dl.get("doctrine_id"), "confidence": dl.get("confidence"),
                            "perspective": dl.get("perspective"), "attesting_source_id": dl.get("attesting_source_id"),
                            "reasoning": (dl.get("reasoning") or "").strip()} for dl in ev.get("doctrine_links", [])],
        "targets": [{"target_id": t.get("target_id"), "country": t.get("country"), "role": t.get("role")} for t in ev.get("targets", [])],
        "sources": sources,
    }

with ThreadPoolExecutor(max_workers=12) as ex:
    doss = list(ex.map(build, batch))
json.dump(doss, open(OUT, "w"), indent=2)
ok = sum(1 for x in doss for s in x["sources"] if s.get("fetch", {}).get("ok"))
tot = sum(len(x["sources"]) for x in doss)
print(f"built {len(doss)} dossiers ({OFF}..{OFF+N}) → {OUT}; source fetches ok {ok}/{tot}")
