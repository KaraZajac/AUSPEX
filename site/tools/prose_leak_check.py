#!/usr/bin/env python3
"""
How much of the prose feature's attribution lift is actor-name LEAK?

Compares ComplementNB (LOO, same setup as complementnb_retest.py) across:
  full  |  name-scrubbed (drop prose tokens that are actor names/aliases)  |  prose-ablated
and reports the direct leak prevalence: share of events whose OWN actor's
name appears among their prose features.

  /tmp/auspex-ml/bin/python -u tools/prose_leak_check.py
(needs /tmp/actor_name_tokens.json from tools/dump-actor-name-tokens.ts)
"""
import json
from collections import defaultdict
import numpy as np
from sklearn.naive_bayes import ComplementNB

d = json.load(open(".cache/feature-matrix.json"))
cols = d["columns"]
rows = [r for r in d["rows"] if r["yTrue"] and not r["isMeta"]]
N = len(rows)
names = json.load(open("/tmp/actor_name_tokens.json"))
name_tokens = set(names["tokens"])
by_actor = names["byActor"]

prim = {}
for r in rows:
    if r["yLabel"]:
        prim[r["yLabel"]] = prim.get(r["yLabel"], 0) + 1
keep = sorted([a for a, c in prim.items() if c >= 2])
amap = {a: i for i, a in enumerate(keep)}
yrs = sorted({r["yearNum"] for r in rows if r["yearNum"] is not None})
ncol = len(cols); D = ncol + len(yrs); yci = {y: ncol + i for i, y in enumerate(yrs)}

# prose column -> its token (strip "pr:")
prose_idx = {j: cols[j]["name"][3:] for j in range(ncol) if cols[j]["family"] == "prose"}
prose_mask = np.zeros(D, bool)
prose_name_mask = np.zeros(D, bool)
for j, t in prose_idx.items():
    prose_mask[j] = True
    if t in name_tokens:
        prose_name_mask[j] = True

X = np.zeros((N, D), np.float32)
y = np.full(N, -1, np.int64); truth = []; tier = []
leak = 0
def tier_of(c): return "1" if c == 1 else "2-4" if c <= 4 else "5-9" if c <= 9 else "10+"
for i, r in enumerate(rows):
    ev_prose = set()
    for ci in r["x"]:
        X[i, ci] = 1.0
        if ci in prose_idx:
            ev_prose.add(prose_idx[ci])
    if r["yearNum"] in yci:
        X[i, yci[r["yearNum"]]] = 1.0
    if r["yLabel"] in amap:
        y[i] = amap[r["yLabel"]]
    truth.append({amap[t] for t in r["yTrue"] if t in amap})
    tier.append(tier_of(prim.get(r["yLabel"], 0)) if r["yLabel"] else "none")
    # direct leak: any of THIS event's true actors' name tokens present in its prose?
    self_name = set()
    for tA in r["yTrue"]:
        self_name |= set(by_actor.get(tA, []))
    if ev_prose & self_name:
        leak += 1

print(f"prose cols {int(prose_mask.sum())} | of which actor-name tokens {int(prose_name_mask.sum())}", flush=True)
print(f"DIRECT LEAK: {leak}/{N} = {leak/N*100:.1f}% of events carry their OWN actor's name as a prose feature\n", flush=True)

def loo(Xu):
    per = np.zeros(N, bool); t1 = t3 = 0
    for i in range(N):
        m = np.ones(N, bool); m[i] = False; m &= (y != -1)
        clf = ComplementNB().fit(Xu[m], y[m]); cl = clf.classes_
        rk = cl[np.argsort(-clf.predict_proba(Xu[i:i+1])[0])]
        if len(rk) and rk[0] in truth[i]:
            t1 += 1; per[i] = True
        if truth[i] & set(rk[:3].tolist()):
            t3 += 1
    return t1 / N, t3 / N, per

variants = {
    "full": X,
    "name-scrubbed": X[:, ~prose_name_mask],
    "prose-ablated": X[:, ~prose_mask],
}
print(f"{'variant':16s}{'top-1':>8s}{'top-3':>8s}", flush=True)
print("-" * 32, flush=True)
out = {}
pers = {}
for tag, Xu in variants.items():
    a1, a3, per = loo(Xu); out[tag] = (a1 * 100, a3 * 100); pers[tag] = per
    print(f"{tag:16s}{a1*100:7.1f}{a3*100:8.1f}", flush=True)

print(f"\nname-leak share of the prose lift: "
      f"(full {out['full'][0]:.1f} - scrubbed {out['name-scrubbed'][0]:.1f}) "
      f"of (full - ablated {out['prose-ablated'][0]:.1f}) = "
      f"{(out['full'][0]-out['name-scrubbed'][0]):.1f} of {(out['full'][0]-out['prose-ablated'][0]):.1f} pp", flush=True)

json.dump({
    "direct_leak_pct": round(leak / N * 100, 1),
    "prose_name_token_cols": int(prose_name_mask.sum()),
    "results": {k: {"top1": round(v[0], 2), "top3": round(v[1], 2)} for k, v in out.items()},
}, open(".cache/prose-leak-check.json", "w"), indent=2)
print("\nWrote .cache/prose-leak-check.json", flush=True)
