#!/usr/bin/env python3
"""
GBT vs Naive Bayes benchmark on the AUSPEX attribution features.

Reads site/.cache/feature-matrix.json (from tools/export-features.ts) and
compares, on IDENTICAL features + an identical CV protocol:

  * GBT  — sklearn HistGradientBoostingClassifier (LightGBM-style histogram GBT;
           BSD, open source)
  * NB   — sklearn ComplementNB (natural baseline for sparse multi-hot)
  * GBT − campaign_id — GBT with the editorial campaign columns removed, to
           mirror the engine's published campaign-ablation floor.

Task: attribution, operations-only (non-meta), single primary-actor label;
top-k scored against the FULL true-actor set, denominator = all 470 events.

Faithful-but-tractable choices (documented):
  * Training label space = actors with >=2 events. Singleton actors (1 event)
    are unpredictable under CV regardless (their only event can't be both train
    and test), so they're forced misses either way; dropping them from the
    LABELS doesn't change the score, it just removes ~53 dead output classes
    that make multiclass GBT pathologically slow. Singleton-true test events
    stay in the denominator and count as misses (null=miss).
  * Features pruned to those active in >=3 of the 470 events (applied to BOTH
    models — fair).

All deps OSS (scikit-learn BSD, numpy BSD). Run unbuffered:
  /tmp/auspex-ml/bin/python -u tools/gbt_benchmark.py [repeats]
"""
import json, time, sys
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.naive_bayes import ComplementNB
from sklearn.model_selection import KFold, train_test_split
from sklearn.inspection import permutation_importance
from scipy.stats import chi2

RNG = 42
N_SPLITS = 5
REPEATS = int(sys.argv[1]) if len(sys.argv) > 1 else 2
MIN_FEATURE_ACTIVE = 3

with open(".cache/feature-matrix.json") as fh:
    data = json.load(fh)
columns = data["columns"]
rows = [r for r in data["rows"] if r["yTrue"] and not r["isMeta"]]   # attributable, ops-only
N = len(rows)

# Label space = primary actors with >=2 events (others are forced CV misses).
prim_count = {}
for r in rows:
    if r["yLabel"]:
        prim_count[r["yLabel"]] = prim_count.get(r["yLabel"], 0) + 1
keep = sorted([a for a, c in prim_count.items() if c >= 2])
amap = {a: i for i, a in enumerate(keep)}
n_single = sum(1 for r in rows if r["yLabel"] and prim_count[r["yLabel"]] == 1)

# Feature pruning: columns active in >=MIN_FEATURE_ACTIVE of the 470 rows.
active = np.zeros(len(columns), dtype=int)
for r in rows:
    for ci in r["x"]:
        active[ci] += 1
keep_cols = [i for i in range(len(columns)) if active[i] >= MIN_FEATURE_ACTIVE]
col_remap = {old: j for j, old in enumerate(keep_cols)}
years = sorted({r["yearNum"] for r in rows if r["yearNum"] is not None})
year_base = len(keep_cols)
D = len(keep_cols) + len(years)
year_col = {y: year_base + i for i, y in enumerate(years)}

X = np.zeros((N, D), dtype=np.float32)
y = np.full(N, -1, dtype=np.int64)          # -1 = singleton/untrainable
truth = []                                   # set of kept-class indices per row
for i, r in enumerate(rows):
    for ci in r["x"]:
        if ci in col_remap:
            X[i, col_remap[ci]] = 1.0
    if r["yearNum"] in year_col:
        X[i, year_col[r["yearNum"]]] = 1.0
    if r["yLabel"] in amap:
        y[i] = amap[r["yLabel"]]
    truth.append({amap[t] for t in r["yTrue"] if t in amap})

camp_mask = np.array([c["family"] == "camp" for c in columns])
camp_keep = np.zeros(D, dtype=bool)
for old in keep_cols:
    if camp_mask[old]:
        camp_keep[col_remap[old]] = True

print(f"rows {N} | classes(>=2ev) {len(keep)} | forced-miss singleton events {n_single} | "
      f"features {D} (pruned from {len(columns)})", flush=True)

def make_gbt():
    return HistGradientBoostingClassifier(
        max_iter=60, learning_rate=0.18, max_leaf_nodes=15,
        l2_regularization=1.0, early_stopping=False, random_state=RNG,
    )

def run(model_factory, Xuse, repeats=REPEATS):
    t1s, t3s, oof0 = [], [], None
    for rep in range(repeats):
        kf = KFold(n_splits=N_SPLITS, shuffle=True, random_state=RNG + rep)
        oof = np.zeros(N, dtype=bool)
        t1 = t3 = 0
        for tr, te in kf.split(Xuse):
            tr_keep = tr[y[tr] != -1]
            m = model_factory(); m.fit(Xuse[tr_keep], y[tr_keep])
            classes = m.classes_
            order = np.argsort(-m.predict_proba(Xuse[te]), axis=1)
            for j, idx in enumerate(te):
                ranked = classes[order[j]]
                tset = truth[idx]
                if len(ranked) and ranked[0] in tset:
                    t1 += 1; oof[idx] = True
                if tset & set(ranked[:3].tolist()):
                    t3 += 1
        t1s.append(t1 / N); t3s.append(t3 / N)
        if rep == 0:
            oof0 = oof
    return float(np.mean(t1s)), float(np.std(t1s)), float(np.mean(t3s)), float(np.std(t3s)), oof0

t0 = time.time()
probe = make_gbt(); probe.fit(X[y != -1][: 300], y[y != -1][: 300])
print(f"single GBT fit ~{time.time()-t0:.1f}s\n", flush=True)
print(f"Protocol: {N_SPLITS}-fold CV x {REPEATS} repeats (seeded). Denominator={N}. null=miss.\n", flush=True)

res = {}
for name, factory, Xuse in [
    ("NB (ComplementNB)", lambda: ComplementNB(), X),
    ("GBT (HistGBT)", make_gbt, X),
    ("GBT - campaign_id", make_gbt, X[:, ~camp_keep]),
]:
    t = time.time()
    m1, s1, m3, s3, oof = run(factory, Xuse)
    res[name] = dict(top1=m1, top1_sd=s1, top3=m3, top3_sd=s3, oof=oof)
    print(f"  {name:22s} top1 {m1*100:5.1f} (±{s1*100:.1f})  top3 {m3*100:5.1f} (±{s3*100:.1f})  [{time.time()-t:.0f}s]", flush=True)

gbt_oof, nb_oof = res["GBT (HistGBT)"]["oof"], res["NB (ComplementNB)"]["oof"]
b = int(np.sum(gbt_oof & ~nb_oof)); c = int(np.sum(~gbt_oof & nb_oof))
stat = (abs(b - c) - 1) ** 2 / (b + c) if (b + c) else 0.0
p = float(chi2.sf(stat, 1))
print(f"\nMcNemar GBT-vs-NB (top-1, seed 0): GBT-only-right={b}, NB-only-right={c}, chi2={stat:.2f}, p={p:.3f}", flush=True)

# Permutation importance on one split (indicative).
keep_idx = np.where(y != -1)[0]
Xtr, Xte, ytr, yte = train_test_split(X[keep_idx], y[keep_idx], test_size=0.25, random_state=RNG, shuffle=True)
gi = make_gbt(); gi.fit(Xtr, ytr)
colnames = [columns[old]["name"] for old in keep_cols] + [f"year:{yy}" for yy in years]
imp = permutation_importance(gi, Xte, yte, n_repeats=5, random_state=RNG, n_jobs=-1)
top = np.argsort(-imp.importances_mean)[:15]
print("\nTop-15 features by permutation importance (one 75/25 split):", flush=True)
for k in top:
    print(f"  {colnames[k]:30s} {imp.importances_mean[k]:.4f}", flush=True)

out = {
    "protocol": f"{N_SPLITS}-fold x {REPEATS} repeats, seeded; attribution ops-only; null=miss; "
                f"labels=actors>=2ev; features active>={MIN_FEATURE_ACTIVE}",
    "n_rows": N, "n_classes_trained": len(keep), "forced_miss_singletons": n_single, "n_features": D,
    "results": {k: {kk: vv for kk, vv in v.items() if kk != "oof"} for k, v in res.items()},
    "mcnemar": {"gbt_only_right": b, "nb_only_right": c, "chi2": stat, "p": p},
    "ts_engine_reference_loo": {"attribution_top1": 57.4, "top3": 74.9, "campaign_ablated_top1": 50.9},
    "top_features": [{"feature": colnames[int(k)], "importance": float(imp.importances_mean[int(k)])} for k in top],
}
with open(".cache/gbt-benchmark.json", "w") as fh:
    json.dump(out, fh, indent=2)
print("\nWrote .cache/gbt-benchmark.json", flush=True)
