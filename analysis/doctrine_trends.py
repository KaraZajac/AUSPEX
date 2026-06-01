#!/usr/bin/env python3
"""
doctrine_trends.py — mine the who×why join for strategic patterns (read-only).

What the join reveals that pure attribution can't:
  1. Doctrine activity over time      (which strategic frames are "hot", and their trajectory)
  2. State doctrine activity by year  (per-attacker-state tempo)
  3. Actor / state doctrine pivots    (whose strategic mix SHIFTED early→late)
  4. Leading vs lagging               (do ops precede or follow the doctrine's publication?)
  5. Doctrine co-occurrence           (which strategic frames travel together)

Descriptive, source-derived; no modelling. Independent of the TS engine.
  python3 analysis/doctrine_trends.py
"""
import datetime, glob, os
from collections import Counter, defaultdict
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = {"documentary","disclosure","doctrine-publication","attribution-publication","policy","law-enforcement"}
SPARK = "▁▂▃▄▅▆▇█"

def load(sub):
    out = {}
    for p in glob.glob(os.path.join(ROOT,"atlas",sub,"**","*.yaml"), recursive=True):
        d = yaml.safe_load(open(p, encoding="utf-8"))
        if isinstance(d, dict) and d.get("id"): out[d["id"]] = d
    return out

def yr(v):
    s = str(v or ""); return int(s[:4]) if s[:4].isdigit() else None

events = load("events"); doctrines = load("doctrines")
dname = {i: d.get("name", i) for i, d in doctrines.items()}
dstate = {i: d.get("nation_state_id") for i, d in doctrines.items()}
dissued = {i: yr(d.get("issued_on")) for i, d in doctrines.items()}

# flatten to (year, state, actor, doctrine_id) rows for doctrine-tagged operations
rows = []
for e in events.values():
    its = set(e.get("incident_type") or [])
    if its and its <= META: continue                       # skip pure-meta
    y = yr(e.get("start_date") or e.get("disclosure_date"))
    actors = [a.get("actor_id") for a in (e.get("attributions") or []) if a.get("actor_id")]
    dls = [(dl.get("doctrine_id")) for dl in (e.get("doctrine_links") or []) if dl.get("doctrine_id")]
    for did in dls:
        rows.append({"y": y, "actors": actors, "did": did, "state": dstate.get(did)})

years = sorted({r["y"] for r in rows if r["y"]})
Y0, Y1 = years[0], years[-1]
def spark(counter):
    vals = [counter.get(y,0) for y in range(Y0, Y1+1)]
    m = max(vals) or 1
    return "".join(SPARK[min(7, v*7//m)] for v in vals)

print(f"\n===== AUSPEX who×why trends =====")
print(f"{len(rows)} doctrine-links across operations, {Y0}–{Y1} ({len(doctrines)} doctrines, {len({r['state'] for r in rows})} states)\n")

# 1. doctrine activity over time
print("── 1. Most-active doctrines (total ops · trajectory {} · recent-3yr share) ──".format(f"{Y0}→{Y1}"))
by_doc = defaultdict(Counter); doc_total = Counter()
for r in rows:
    if r["y"]: by_doc[r["did"]][r["y"]] += 1; doc_total[r["did"]] += 1
recent = {Y1, Y1-1, Y1-2}
for did, tot in doc_total.most_common(15):
    rec = sum(v for y,v in by_doc[did].items() if y in recent)
    print(f"  {tot:3}  {spark(by_doc[did])}  {(100*rec//tot):3}%rec  {did}")

# 2. state activity by year (recent window)
print("\n── 2. State op-tempo by year (doctrine-tagged ops) ──")
by_state = defaultdict(Counter)
for r in rows:
    if r["state"] and r["y"]: by_state[r["state"]][r["y"]] += 1
for st in sorted(by_state, key=lambda s: -sum(by_state[s].values()))[:10]:
    tot = sum(by_state[st].values())
    print(f"  {st:4} {tot:3}  {spark(by_state[st])}")

# 3. doctrine pivots — states whose dominant doctrine shifted first-half→second-half
print("\n── 3. Strategic pivots (state's #1 doctrine: earlier half → later half of its ops) ──")
mid = (Y0 + Y1) // 2
for st in sorted(by_state, key=lambda s: -sum(by_state[s].values()))[:12]:
    early = Counter(r["did"] for r in rows if r["state"]==st and r["y"] and r["y"]<=mid)
    late  = Counter(r["did"] for r in rows if r["state"]==st and r["y"] and r["y"]> mid)
    if not early or not late: continue
    e1, l1 = early.most_common(1)[0][0], late.most_common(1)[0][0]
    if e1 != l1:
        print(f"  {st}: {dname[e1][:34]}  →  {dname[l1][:34]}")

# 4. leading vs lagging — op year minus the doctrine's publication year
print("\n── 4. Leading vs lagging (op year − doctrine published year; <0 = op PRECEDES doctrine) ──")
gaps = [r["y"]-dissued[r["did"]] for r in rows if r["y"] and dissued.get(r["did"])]
if gaps:
    gaps.sort(); med = gaps[len(gaps)//2]
    pre = sum(1 for g in gaps if g < 0); post = sum(1 for g in gaps if g > 0); same = sum(1 for g in gaps if g==0)
    print(f"  n={len(gaps)} ops vs a dated doctrine · median gap {med:+d}yr · {100*pre//len(gaps)}% precede / {100*same//len(gaps)}% same-year / {100*post//len(gaps)}% follow publication")

# 5. doctrine co-occurrence (top pairs on one event)
print("\n── 5. Doctrine co-occurrence (top pairs tagged on the same op) ──")
pair = Counter()
for e in events.values():
    dls = sorted({dl.get("doctrine_id") for dl in (e.get("doctrine_links") or []) if dl.get("doctrine_id")})
    for i in range(len(dls)):
        for j in range(i+1, len(dls)):
            if dstate.get(dls[i]) == dstate.get(dls[j]):  # same-state pairs (cross-state are usually counter-ops)
                pair[(dls[i], dls[j])] += 1
for (a,b), c in pair.most_common(8):
    print(f"  {c:2}×  {a}  +  {b}")
