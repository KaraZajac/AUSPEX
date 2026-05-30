#!/usr/bin/env python3
"""
ComplementNB matched re-test (steps 1-2 of the engine-recalibration lead).

Uses the FULL exported feature matrix (.cache/feature-matrix.json — same
EventFeatures the engine consumes; min_count=2, NOT the benchmark's df>=3 prune)
and runs everything under LEAVE-ONE-OUT to match the engine's headline protocol.

Reports ComplementNB three ways + controls:
  * vs the engine's plain-NB headline (57.4 / 74.9 LOO) and stacked re-ranker (69.6)
  * MultinomialNB on the same features (controls for "is it the *complement* trick?")
  * prose-ablated (drop the TF-IDF summary terms) — the summary often NAMES the
    actor, a leak you would not have when attributing a genuinely unknown event;
    this is the real-world-attribution number, and the honesty check on the gap.
  * per actor-frequency tier (1 / 2-4 / 5-9 / 10+ events) — theory says
    ComplementNB's edge is on the long tail.

Attribution, ops-only, n=470, null=miss. Training labels = actors with >=2 events
(singletons are forced LOO misses regardless; kept in the denominator). Seeded /
deterministic (LOO + counting NB → no randomness). OSS: scikit-learn (BSD).

  /tmp/auspex-ml/bin/python -u tools/complementnb_retest.py
"""
import json
from collections import defaultdict
import numpy as np
from sklearn.naive_bayes import ComplementNB, MultinomialNB

ENGINE_PLAIN_NB = (57.4, 74.9)   # TS LOO headline (reproduced by learning-curve f=1.0)
ENGINE_STACKED = 69.6            # TS stacked re-ranker top-1

d = json.load(open(".cache/feature-matrix.json"))
cols = d["columns"]
rows = [r for r in d["rows"] if r["yTrue"] and not r["isMeta"]]
N = len(rows)

prim = {}
for r in rows:
    if r["yLabel"]:
        prim[r["yLabel"]] = prim.get(r["yLabel"], 0) + 1
keep = sorted([a for a, c in prim.items() if c >= 2])
amap = {a: i for i, a in enumerate(keep)}

yrs = sorted({r["yearNum"] for r in rows if r["yearNum"] is not None})
ncol = len(cols)
D = ncol + len(yrs)
yci = {y: ncol + i for i, y in enumerate(yrs)}

def tier_of(c):
    return "1 (singleton)" if c == 1 else "2-4" if c <= 4 else "5-9" if c <= 9 else "10+"

X = np.zeros((N, D), dtype=np.float32)
y = np.full(N, -1, dtype=np.int64)
truth, tier = [], []
for i, r in enumerate(rows):
    for ci in r["x"]:
        X[i, ci] = 1.0
    if r["yearNum"] in yci:
        X[i, yci[r["yearNum"]]] = 1.0
    if r["yLabel"] in amap:
        y[i] = amap[r["yLabel"]]
    truth.append({amap[t] for t in r["yTrue"] if t in amap})
    tier.append(tier_of(prim.get(r["yLabel"], 0)) if r["yLabel"] else "none")

prose_mask = np.array([c["family"] == "prose" for c in cols] + [False] * len(yrs))
n_prose = int(prose_mask.sum())
print(f"n={N} | classes(>=2ev)={len(keep)} | features={D} (prose cols={n_prose}) | "
      f"forced-miss singletons={sum(1 for t in tier if t.startswith('1'))}\n", flush=True)

def loo(make, Xu):
    per = np.zeros(N, dtype=bool)
    t1 = t3 = 0
    for i in range(N):
        m = np.ones(N, dtype=bool); m[i] = False; m &= (y != -1)
        clf = make().fit(Xu[m], y[m])
        cl = clf.classes_
        rk = cl[np.argsort(-clf.predict_proba(Xu[i:i+1])[0])]
        if len(rk) and rk[0] in truth[i]:
            t1 += 1; per[i] = True
        if truth[i] & set(rk[:3].tolist()):
            t3 += 1
    return t1 / N, t3 / N, per

Xabl = X[:, ~prose_mask]
res = {}
print(f"{'model':16s}{'features':16s}{'top-1':>8s}{'top-3':>8s}", flush=True)
print("-" * 48, flush=True)
for name, make in [("ComplementNB", ComplementNB), ("MultinomialNB", MultinomialNB)]:
    for tag, Xu in [("full", X), ("prose-ablated", Xabl)]:
        a1, a3, per = loo(make, Xu)
        res[(name, tag)] = (a1, a3, per)
        print(f"{name:16s}{tag:16s}{a1*100:7.1f}{a3*100:8.1f}", flush=True)

print(f"\nengine references (TS, LOO):  plain-NB {ENGINE_PLAIN_NB[0]}/{ENGINE_PLAIN_NB[1]}   stacked re-ranker {ENGINE_STACKED}", flush=True)

c_full = res[("ComplementNB", "full")][0] * 100
c_abl = res[("ComplementNB", "prose-ablated")][0] * 100
print(f"\nComplementNB vs plain-NB:  {c_full - ENGINE_PLAIN_NB[0]:+.1f} pp top-1", flush=True)
print(f"ComplementNB vs stacked:   {c_full - ENGINE_STACKED:+.1f} pp top-1", flush=True)
print(f"prose contribution (leak risk): full {c_full:.1f} - ablated {c_abl:.1f} = {c_full - c_abl:+.1f} pp", flush=True)

print("\nComplementNB top-1 by actor-frequency tier:", flush=True)
for tag in ["full", "prose-ablated"]:
    per = res[("ComplementNB", tag)][2]
    byt = defaultdict(lambda: [0, 0])
    for i in range(N):
        byt[tier[i]][1] += 1
        if per[i]:
            byt[tier[i]][0] += 1
    order = ["1 (singleton)", "2-4", "5-9", "10+"]
    line = "  ".join(f"{k}: {byt[k][0]}/{byt[k][1]}={byt[k][0]/max(byt[k][1],1)*100:.0f}%" for k in order if k in byt)
    print(f"  {tag:14s} {line}", flush=True)

out = {
    "protocol": "LOO; attribution ops-only; n=470; null=miss; labels=actors>=2ev; full feature matrix (min_count=2)",
    "engine_refs": {"plain_nb_top1": ENGINE_PLAIN_NB[0], "plain_nb_top3": ENGINE_PLAIN_NB[1], "stacked_top1": ENGINE_STACKED},
    "results": {f"{n}|{t}": {"top1": round(v[0]*100, 2), "top3": round(v[1]*100, 2)} for (n, t), v in res.items()},
    "prose_contribution_pp": round(c_full - c_abl, 2),
}
json.dump(out, open(".cache/complementnb-retest.json", "w"), indent=2)
print("\nWrote .cache/complementnb-retest.json", flush=True)
