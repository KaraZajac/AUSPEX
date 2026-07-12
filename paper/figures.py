#!/usr/bin/env python3
"""
Generate every figure in paper/main.tex from the atlas, deterministically.

    ../.venv/bin/python figures.py        # writes paper/figures/*.pdf

Figures 1, 2, 4, 5 and the census panel of Figure 6 are recomputed live from the
atlas YAML using exactly the conventions of the analysis/ scripts (META set,
attacker-rationale perspective filter, terminal-MO buckets, year granularity).
The engine-evaluation and information-theoretic constants (Figures 3, 6, 7) are
expensive to recompute (LOO / permutation nulls) and are taken from the published
ledgers, provenance-pinned:

  corpus 785 events · git 4657c60..bfc382d (2026-07-11)
  regenerate:  make findings                    -> analysis/FINDINGS.md (F1-F5)
               cd site && pnpm eval-doctrine / eval-pillar / eval-temporal
               pnpm exec tsx tools/eval-stacked-cnb.ts / eval-mitre-baseline

A stale constant is therefore visible by diffing against a fresh `make findings`.
"""
import glob, os, sys
from collections import Counter, defaultdict

import yaml
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "figures")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- conventions
META = {"documentary", "disclosure", "doctrine-publication",
        "attribution-publication", "policy", "law-enforcement"}
MONEY     = {"financial-theft", "extortion"}
DENIAL    = {"wiper", "destructive", "disruption", "ransomware", "cyber-physical"}
DATA      = {"data-theft", "espionage", "surveillance", "reconnaissance",
             "bulk-collection", "hack-and-leak", "leak", "insider"}
INFLUENCE = {"influence-operation"}

def mo_of(its):
    s = set(its)
    return ("money" if s & MONEY else "denial" if s & DENIAL else
            "data" if s & DATA else "influence" if s & INFLUENCE else "access")

def load(sub):
    out = []
    for p in glob.glob(os.path.join(ROOT, "atlas", sub, "**", "*.yaml"), recursive=True):
        d = yaml.safe_load(open(p, encoding="utf-8"))
        if isinstance(d, dict):
            out.append(d)
    return out

def is_op(e):
    its = set(e.get("incident_type") or [])
    return not (its and its <= META)

def attacker_rationale(dl):
    return dl.get("perspective") in (None, "attacker-rationale")

def yr(d):
    try:
        return int(str(d)[:4])
    except (TypeError, ValueError):
        return None

events    = load("events")
doctrines = {d["id"]: d for d in load("doctrines")}
dissued   = {i: yr(d.get("issued_on")) for i, d in doctrines.items()}
ops       = [e for e in events if is_op(e)]

# ---------------------------------------------------------------- shared style
plt.rcParams.update({
    "font.family": "serif", "font.size": 9.5,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "grid.alpha": 0.25, "grid.linewidth": 0.5,
    "figure.dpi": 150, "savefig.bbox": "tight",
})
# Okabe-Ito colorblind-safe palette
PAL = {"cn": "#D55E00", "ru": "#0072B2", "ir": "#009E73", "kp": "#CC79A7",
       "criminal": "#999999", "us": "#56B4E9", "in": "#E69F00", "il": "#F0E442",
       "other": "#BBBBBB"}
STATE_LABEL = {"cn": "China", "ru": "Russia", "ir": "Iran", "kp": "DPRK",
               "criminal": "criminal", "us": "United States", "in": "India",
               "il": "Israel", "pk": "Pakistan", "vn": "Vietnam", "tr": "Türkiye",
               "ae": "UAE", "by": "Belarus", "other": "other"}

def save(fig, name):
    fig.savefig(os.path.join(OUT, name))
    plt.close(fig)
    print(f"  wrote figures/{name}")

# ============================================================ Fig 1 · corpus
def fig_corpus():
    top = ["cn", "ru", "ir", "kp", "criminal", "us", "in", "il"]
    years = list(range(1996, 2027))
    counts = {s: Counter() for s in top + ["other"]}
    for e in ops:
        y = yr(e.get("start_date")) or yr(e.get("disclosure_date"))
        if y is None or not (1996 <= y <= 2026):
            continue
        st = None
        for a in (e.get("attributions") or []):
            aid = a.get("actor_id")
            if aid:
                st = aid.split("/")[0]
                break
        if st is None:
            continue                       # unattributed ops excluded (counted in text)
        counts[st if st in top else "other"][y] += 1
    fig, ax = plt.subplots(figsize=(6.6, 2.9))
    bottom = np.zeros(len(years))
    for s in top + ["other"]:
        vals = np.array([counts[s].get(y, 0) for y in years], dtype=float)
        ax.bar(years, vals, bottom=bottom, width=0.82, label=STATE_LABEL[s],
               color=PAL.get(s, "#BBBBBB"), linewidth=0)
        bottom += vals
    ax.set_ylabel("attributed operational events")
    ax.set_xlim(1995.4, 2026.6)
    ax.legend(ncol=3, frameon=False, fontsize=7.5, loc="upper left")
    save(fig, "fig-corpus.pdf")

# ====================================================== Fig 2 · confidence ladder
def fig_ladder():
    persp_order = ["attacker-rationale", "victim-response", "defender-response"]
    conf_order  = ["attested", "strongly_inferred", "plausible"]
    m = {p: Counter() for p in persp_order}
    for e in events:
        for dl in (e.get("doctrine_links") or []):
            p = dl.get("perspective") or "attacker-rationale"
            c = dl.get("confidence")
            if p in m and c in conf_order:
                m[p][c] += 1
    fig, ax = plt.subplots(figsize=(5.4, 2.5))
    x = np.arange(len(conf_order))
    w = 0.26
    cols = {"attacker-rationale": "#0072B2", "victim-response": "#D55E00",
            "defender-response": "#009E73"}
    for i, p in enumerate(persp_order):
        vals = [m[p][c] for c in conf_order]
        bars = ax.bar(x + (i - 1) * w, vals, w, label=p, color=cols[p], linewidth=0)
        for b, v in zip(bars, vals):
            if v:
                ax.text(b.get_x() + b.get_width() / 2, v + 4, str(v),
                        ha="center", fontsize=7)
    ax.set_xticks(x, ["attested", "strongly inferred", "plausible"])
    ax.set_ylabel("doctrine links")
    ax.legend(frameon=False, fontsize=8)
    save(fig, "fig-ladder.pdf")

# ========================================================== Fig 4 · precedence
def fig_precedence():
    gaps, gaps_att = [], []
    for e in ops:
        oy = yr(e.get("start_date")) or yr(e.get("disclosure_date"))
        if oy is None:
            continue
        for dl in (e.get("doctrine_links") or []):
            if not attacker_rationale(dl):
                continue
            iy = dissued.get(dl.get("doctrine_id"))
            if iy is None:
                continue
            g = oy - iy
            gaps.append(g)
            if dl.get("confidence") == "attested":
                gaps_att.append(g)
    lo, hi = -18, 18
    clip = [max(lo, min(hi, g)) for g in gaps]      # edge bins = overflow (foundational doctrines, e.g. Begin Doctrine 1981)
    fig, ax = plt.subplots(figsize=(5.8, 2.7))
    bins = np.arange(lo - 0.5, hi + 1.5, 1)
    ax.hist(clip, bins=bins, color="#0072B2", alpha=0.85, linewidth=0)
    ax.axvline(0, color="#333333", lw=1)
    med = float(np.median(gaps))
    ax.axvline(med, color="#D55E00", lw=1.4, ls="--")
    ax.text(med + 0.6, ax.get_ylim()[1] * 0.92, f"median +{med:.0f} yr",
            color="#D55E00", fontsize=8.5)
    follow = 100 * sum(g > 0 for g in gaps) / len(gaps)
    ax.set_xlim(lo - 1, hi + 1)
    ax.set_xlabel("operation year − doctrine year   (>0 = follows)")
    ax.set_ylabel("(op, dated-doctrine) pairs")
    ax.set_title(f"n={len(gaps)} pairs · {follow:.0f}% follow publication "
                 f"(attested-only n={len(gaps_att)}, {100*sum(g>0 for g in gaps_att)/max(len(gaps_att),1):.0f}% follow)",
                 fontsize=8.5, loc="left")
    save(fig, "fig-precedence.pdf")

# ============================================================== Fig 5 · MO map
def fig_mo():
    per = defaultdict(Counter)
    for e in ops:
        acts = {a.get("actor_id") for a in (e.get("attributions") or []) if a.get("actor_id")}
        if len(acts) != 1 or (e.get("false_flag_risk") or "none") != "none":
            continue
        st = next(iter(acts)).split("/")[0]
        per[st][mo_of(e.get("incident_type") or [])] += 1
    states = [s for s, c in sorted(per.items(), key=lambda kv: -sum(kv[1].values()))
              if sum(c.values()) >= 12]
    mos = ["data", "denial", "money", "influence", "access"]
    M = np.array([[per[s][m] / sum(per[s].values()) for m in mos] for s in states])
    fig, ax = plt.subplots(figsize=(4.6, 0.34 * len(states) + 1.1))
    im = ax.imshow(M, cmap="Blues", vmin=0, vmax=1, aspect="auto")
    ax.set_xticks(range(len(mos)), mos)
    ax.set_yticks(range(len(states)),
                  [f"{STATE_LABEL.get(s, s)}  (n={sum(per[s].values())})" for s in states])
    for i in range(len(states)):
        for j in range(len(mos)):
            v = M[i, j]
            if v >= 0.005:
                ax.text(j, i, f"{100*v:.0f}", ha="center", va="center", fontsize=7,
                        color="white" if v > 0.55 else "#1a1a2e")
    ax.grid(False)
    ax.set_title("share of each state's operations by terminal outcome (%)",
                 fontsize=8.5, loc="left")
    save(fig, "fig-mo.pdf")

# ==================================================== Fig 3 · information (F1)
# Constants: analysis/FINDINGS.md F1 LEG 3 (make findings, git 4657c60, K=40 null).
def fig_information():
    fig, axes = plt.subplots(1, 2, figsize=(6.4, 2.6), sharey=False)
    for ax, (title, H, naive, real, pool0, pool1) in zip(axes, [
            ("all attacker-rationale links",  6.46, 4.21, 1.67, 88, 28),
            ("attested-only links",           4.73, 3.69, 0.94, 26, 14)]):
        bars = ax.bar(["H(actor)", "naive MI", "null-corrected\nMI"],
                      [H, naive, real],
                      color=["#999999", "#D55E00", "#0072B2"], width=0.6, linewidth=0)
        for b, v in zip(bars, [H, naive, real]):
            ax.text(b.get_x() + b.get_width() / 2, v + 0.08, f"{v:.2f}",
                    ha="center", fontsize=8)
        ax.set_title(f"{title}\n effective suspect pool {pool0} → {pool1} actors",
                     fontsize=8.5)
        ax.set_ylim(0, 7.2)
    axes[0].set_ylabel("bits")
    fig.suptitle("Doctrine → actor information (permutation null, K=40): "
                 "cite the null-corrected figure", fontsize=9, y=1.04)
    save(fig, "fig-information.pdf")

# ===================================================== Fig 6 · engine accuracy
# Constants: site eval suite on the 785-event corpus (2026-07-11):
#   LOO/CV top-5   — attribution (deployed CNB+stack, 5-fold) 66.1, doctrine 88.1,
#                    pillar 83.4, joint 56.9
#   temporal top-5 — rankable (true label existed pre-2024): attr 56.2, doctrine 74.8,
#                    pillar 61.3, joint 59.3 ; all-test (cold-start = miss): attr 40.8,
#                    doctrine 74.3, pillar 59.8, joint 38.1
#   MITRE ATT&CK Groups naive-lookup baseline top-5 3.4.
def fig_engine():
    engines = ["Attribution", "Doctrine", "Pillar", "Joint"]
    loo      = [66.1, 88.1, 83.4, 56.9]
    rankable = [56.2, 74.8, 61.3, 59.3]
    alltest  = [40.8, 74.3, 59.8, 38.1]
    x = np.arange(len(engines)); w = 0.26
    fig, ax = plt.subplots(figsize=(6.0, 2.8))
    ax.bar(x - w, loo,      w, label="retrodictive (LOO / 5-fold CV)", color="#0072B2", linewidth=0)
    ax.bar(x,     rankable, w, label="temporal holdout — rankable",    color="#009E73", linewidth=0)
    ax.bar(x + w, alltest,  w, label="temporal holdout — all test (cold-start = miss)",
           color="#CC79A7", linewidth=0)
    ax.axhline(3.4, color="#333333", lw=1, ls=":")
    ax.text(len(engines) - 0.55, 5.0, "naive ATT&CK-lookup baseline (3.4)", fontsize=7.5)
    for xi, vals in zip(x, zip(loo, rankable, alltest)):
        for dx, v in zip((-w, 0, w), vals):
            ax.text(xi + dx, v + 1.2, f"{v:.0f}", ha="center", fontsize=7)
    ax.set_xticks(x, engines)
    ax.set_ylabel("top-5 hit rate (%)")
    ax.set_ylim(0, 100)
    ax.legend(frameon=False, fontsize=7.5, loc="upper right")
    save(fig, "fig-engine.pdf")

# ================================================ Fig 7 · census de-circularization
# Constants: pre-census (815-event corpus, 2026-05/06 ledgers) vs post-census
# (785-event corpus, 2026-07-11) top-1, ops-only. Census coverage recomputed live.
def fig_census():
    full = sum(1 for e in events if (e.get("qc") or {}).get("level") == "full")
    part = sum(1 for e in events if (e.get("qc") or {}).get("level") == "partial")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(6.4, 2.6),
                                   gridspec_kw={"width_ratios": [1.7, 1]})
    engines = ["Attribution", "Doctrine", "Pillar", "Joint"]
    pre  = [64.9, 68.5, 61.6, 47.9]
    post = [50.8, 62.8, 57.6, 38.0]
    x = np.arange(len(engines)); w = 0.32
    ax1.bar(x - w/2, pre,  w, label="pre-census corpus",  color="#999999", linewidth=0)
    ax1.bar(x + w/2, post, w, label="post-census corpus", color="#0072B2", linewidth=0)
    for xi, (a, b) in zip(x, zip(pre, post)):
        ax1.text(xi - w/2, a + 1.2, f"{a:.0f}", ha="center", fontsize=7)
        ax1.text(xi + w/2, b + 1.2, f"{b:.0f}", ha="center", fontsize=7)
    ax1.set_xticks(x, engines)
    ax1.set_ylabel("top-1 (%)")
    ax1.set_ylim(0, 80)
    ax1.set_title("engine accuracy before/after the audit\n(drop = de-circularization, not regression)",
                  fontsize=8.5)
    ax1.legend(frameon=False, fontsize=7.5)
    ax2.bar(["full", "partial", "unstamped"], [full, part, len(events) - full - part],
            color=["#0072B2", "#56B4E9", "#D55E00"], width=0.6, linewidth=0)
    for i, v in enumerate([full, part, len(events) - full - part]):
        ax2.text(i, v + 8, str(v), ha="center", fontsize=8)
    ax2.set_ylim(0, 780)
    ax2.set_title(f"verification census\n({full}+{part} = {full+part}/{len(events)} events)",
                  fontsize=8.5)
    save(fig, "fig-census.pdf")

# ================================================= Fig 8 · deterrence (descriptive)
# Constants: analysis/FINDINGS.md F4 (make findings, git 4657c60): per-cluster DiD.
def fig_deterrence():
    clusters = {"China": -1.13, "Russia": -0.76, "DPRK": -0.90, "Iran": +0.03}
    fig, ax = plt.subplots(figsize=(4.8, 2.2))
    ys = np.arange(len(clusters))[::-1]
    vals = list(clusters.values())
    ax.barh(ys, vals, height=0.55,
            color=["#0072B2" if v < 0 else "#D55E00" for v in vals], linewidth=0)
    ax.set_yticks(ys, list(clusters.keys()))
    ax.axvline(0, color="#333333", lw=1)
    for y, v in zip(ys, vals):
        ax.text(v + (0.05 if v >= 0 else -0.05), y, f"{v:+.2f}",
                va="center", ha="left" if v >= 0 else "right", fontsize=8)
    ax.set_xlim(-1.6, 0.7)
    ax.set_xlabel("clustered difference-in-differences (post−pre tempo vs world)")
    ax.set_title("n = 4 independent (state, window) clusters — sign test p = 0.62\n"
                 "DESCRIPTIVE ONLY: the design cannot identify deterrence",
                 fontsize=8.5, loc="left")
    save(fig, "fig-deterrence.pdf")

if __name__ == "__main__":
    print(f"corpus: {len(events)} events ({len(ops)} operational)")
    fig_corpus(); fig_ladder(); fig_precedence(); fig_mo()
    fig_information(); fig_engine(); fig_census(); fig_deterrence()
    print("done.")
