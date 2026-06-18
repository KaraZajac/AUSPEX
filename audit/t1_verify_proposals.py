#!/usr/bin/env python3
"""Independently content-verify agent-proposed replacement URLs with curl_cffi (Chrome
impersonation) before any are written to the corpus. Cross-references each candidate page's
title+body against the source record's title+notes. Emits an APPLY/HOLD decision per proposal."""
import os, re, json, glob, html as ihtml
from concurrent.futures import ThreadPoolExecutor, as_completed
from curl_cffi import requests as cr

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import yaml
props = json.load(open(os.path.join(ROOT, "research", "repair-proposals.json")))
recs = {r["id"]: r for r in json.load(open(os.path.join(ROOT, "research", "t1-broken-to-repair.json")))}

STOP = set("""a an the of to in on for and or with by from at as is was were be been being that
this these those it its their his her our your into over under after before during how why what
when where who whom which than then but not no nor so such can could will would should may might
must us un re new news report analysis special exclusive update inside via amp""".split())
def toks(s):
    s = re.sub(r"&[a-z]+;", " ", (s or "").lower()); s = re.sub(r"[^a-z0-9]+", " ", s)
    return {w for w in s.split() if len(w) > 2 and w not in STOP}
def text_of(h):
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", h)
    return ihtml.unescape(re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", t)))[:6000]
def ptitle(h):
    m = re.search(r"<title[^>]*>(.*?)</title>", h, re.I | re.S)
    return ihtml.unescape(re.sub(r"\s+", " ", m.group(1)).strip()) if m else ""

def verify(p):
    sid = p["id"]; nu = p.get("new_url")
    rec = recs.get(sid, {})
    if not nu:
        return {**p, "vstatus": "no_url", "decision": "HOLD-NULL"}
    try:
        r = cr.get(nu, impersonate="chrome", timeout=30, allow_redirects=True)
    except Exception as e:
        return {**p, "vstatus": f"error:{type(e).__name__}", "overlap": None,
                "decision": "HOLD-MANUAL" if p["confidence"] == "high" else "HOLD"}
    code = r.status_code
    want = toks(rec.get("title")) | toks(rec.get("notes"))
    have = toks(ptitle(r.text)) | toks(text_of(r.text))
    ov = round(len(want & have) / len(want), 2) if want else 1.0
    is_arc = "web.archive.org" in nu
    if code >= 400:
        return {**p, "vstatus": f"http{code}", "overlap": ov,
                "decision": "HOLD-MANUAL" if p["confidence"] in ("high", "medium") else "HOLD"}
    # 2xx
    if ov >= 0.20:
        return {**p, "vstatus": f"http{code}", "overlap": ov, "ptitle": ptitle(r.text)[:80],
                "decision": "APPLY-ARCHIVE" if is_arc else "APPLY"}
    return {**p, "vstatus": f"http{code}", "overlap": ov, "ptitle": ptitle(r.text)[:80],
            "decision": "REVIEW-LOWMATCH"}

out = []
with ThreadPoolExecutor(max_workers=16) as ex:
    for fu in as_completed([ex.submit(verify, p) for p in props]):
        out.append(fu.result())
from collections import Counter
dec = Counter(o["decision"] for o in out)
json.dump(sorted(out, key=lambda x: (x["decision"], x["id"])),
          open(os.path.join(ROOT, "research", "repair-verified.json"), "w"), indent=2)
print("=== decisions ===")
for k, v in sorted(dec.items()): print(f"  {v:3d}  {k}")
print("\n=== APPLY / APPLY-ARCHIVE (will write) ===")
for o in sorted(out, key=lambda x: x["id"]):
    if o["decision"].startswith("APPLY"):
        print(f"  [{o['decision']:13s} ov={o.get('overlap')}] {o['id']}")
print("\n=== REVIEW-LOWMATCH (2xx but weak match — needs eyeball) ===")
for o in sorted(out, key=lambda x: x["id"]):
    if o["decision"] == "REVIEW-LOWMATCH":
        print(f"  {o['id']}  ov={o.get('overlap')}  page={o.get('ptitle','')!r}")
