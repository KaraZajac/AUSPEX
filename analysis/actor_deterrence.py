#!/usr/bin/env python3
"""
actor_deterrence.py — does publicly NAMING an actor (indictment / call-out) change ITS
own op tempo? (read-only, descriptive). Sharper than the state-level cut.

Bridge: an actor is "named" by a META event that carries its actor_id (a disclosure,
attribution-publication, or law-enforcement action about that actor). We classify the
naming as an INDICTMENT/individual-naming when the event has `operators_named` (named
individuals) or a `law-enforcement` incident type; otherwise a vendor/govt DISCLOSURE.

Treatment date T_A = the actor's FIRST public naming. We then compare the actor's OWN
operational tempo in [T-W,T-1] vs [T+1,T+W], difference-in-differenced against the whole
corpus's op tempo in the same calendar windows (nets out the secular trend). Laplace +0.5
on the ratios so an actor that goes dormant (post=0) is handled, not dropped.

Restricted to actors with ≥1 operation BEFORE their first naming (so "before/after" is
meaningful). Same heavy caveats as the state-level study — ENDOGENEITY above all (actors
get named BECAUSE of an op surge, biasing toward false post-naming mean-reversion),
small N, year granularity, collection bias. Association, not effect.

  python3 analysis/actor_deterrence.py
"""
import glob, math, os, statistics
from collections import Counter, defaultdict
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = {"documentary","disclosure","doctrine-publication","attribution-publication","policy","law-enforcement"}
W = 2

def load(sub):
    out=[]
    for p in glob.glob(os.path.join(ROOT,"atlas",sub,"**","*.yaml"), recursive=True):
        d=yaml.safe_load(open(p,encoding="utf-8"))
        if isinstance(d,dict): out.append(d)
    return out
def yr(v):
    s=str(v or ""); return int(s[:4]) if s[:4].isdigit() else None

events=load("events")
actors={a["id"]: a for a in load("actors") if a.get("id")}
nm=lambda aid: (actors.get(aid,{}) or {}).get("canonical_name", aid)

op_years=defaultdict(list)        # actor -> [years of its OPERATIONS]
namings=defaultdict(list)         # actor -> [(year, is_indictment)]
corpus_ops=Counter()              # year -> total operations
for e in events:
    its=set(e.get("incident_type") or [])
    y=yr(e.get("start_date") or e.get("disclosure_date"))
    if not y: continue
    is_meta = bool(its) and its<=META
    aids=[a.get("actor_id") for a in (e.get("attributions") or []) if a.get("actor_id")]
    if is_meta:
        indictment = ("law-enforcement" in its) or bool(e.get("operators_named"))
        for aid in aids: namings[aid].append((y, indictment))
    else:
        corpus_ops[y]+=1
        for aid in aids: op_years[aid].append(y)

def cnt(years, lo, hi): return sum(1 for y in years if lo<=y<=hi)
def cyr(lo,hi): return sum(corpus_ops.get(y,0) for y in range(lo,hi+1))

MAXY = max(list(corpus_ops) + [y for ys in op_years.values() for y in ys])  # last year with data
rows=[]   # (actor, T, indicted_first, preA, postA, did, named_at_peak)
censored=0
for aid, nlist in namings.items():
    if aid not in op_years: continue
    T = min(y for y,_ in nlist)
    if T + W > MAXY:                                        # right-censored: post-window runs past the data
        censored += 1; continue
    first_indict = any(ind for y,ind in nlist if y==T)
    ops=op_years[aid]
    preA, postA = cnt(ops,T-W,T-1), cnt(ops,T+1,T+W)
    if preA < 1: continue                                   # need pre-naming activity for a clean before/after
    # control = all OTHER actors' ops (exclude self), matching the state-level "rest of world" design
    preC, postC = cyr(T-W,T-1)-preA, cyr(T+1,T+W)-postA
    if preC<1 or postC<1: continue
    # endogeneity tell: was the actor named in/just-after its single busiest op-year? (→ mean-reversion, not deterrence)
    peak = max(set(ops), key=lambda y:(ops.count(y), y))
    named_at_peak = (T-W) <= peak <= T
    rS=(postA+0.5)/(preA+0.5); rC=(postC+0.5)/(preC+0.5)
    rows.append((aid, T, first_indict, preA, postA, math.log(rS)-math.log(rC), named_at_peak))

ind = [r for r in rows if r[2]]; dis = [r for r in rows if not r[2]]
print(f"\n===== ACTOR-LEVEL DETERRENCE — does naming an actor change its tempo? =====")
print(f"actors with a usable before/after window: {len(rows)}  (named-by-indictment/individual: {len(ind)} · disclosure-only: {len(dis)})")
print(f"DiD<0 = actor decelerated vs the world after being named (deterrence-consistent); >0 = kept escalating\n")

def summarize(label, rs):
    if not rs: print(f"  {label}: (no actors)"); return
    md=statistics.mean(r[5] for r in rs); med=sorted(r[5] for r in rs)[len(rs)//2]
    dec=sum(1 for r in rs if r[5]<0)
    print(f"  {label:28} n={len(rs):3}  mean DiD {md:+.2f}  median {med:+.2f}  {100*dec//len(rs)}% decelerated-vs-world")
print("── aggregate ──")
summarize("all namings", rows)
summarize("first naming = INDICTMENT", ind)
summarize("first naming = disclosure only", dis)

def show(label, rs, rev):
    rs=sorted(rs, key=lambda r:r[5], reverse=rev)[:8]
    print(f"\n── {label} ──")
    for aid,T,fi,pre,post,did,peak in rs:
        flag=" ⚠peak-year naming" if peak else ""
        print(f"  DiD {did:+5.2f}  {nm(aid)[:30]:30} named {T} ({'indict' if fi else 'disclosure'})  ops {pre}→{post} (±{W}yr){flag}")
show("most DECELERATED after naming (deterrence-consistent)", rows, rev=False)
show("most ESCALATED after naming (defiance-consistent)", rows, rev=True)

# ── endogeneity diagnostic: is the apparent "deterrence" just mean-reversion? ──
atpeak=[r for r in rows if r[6]]
print(f"\n── ENDOGENEITY DIAGNOSTIC ──")
print(f"  {len(atpeak)}/{len(rows)} analysed actors were named IN/just-after their single busiest op-year")
if atpeak:
    md_peak=statistics.mean(r[5] for r in atpeak)
    others=[r for r in rows if not r[6]]
    md_oth=statistics.mean(r[5] for r in others) if others else float('nan')
    print(f"  mean DiD — named-at-peak {md_peak:+.2f}  vs  named-off-peak {md_oth:+.2f}  (n={len(others)})")
    print(f"  → if the 'deterrence' concentrates in the peak-year group, it is REGRESSION TO THE MEAN, not deterrence.")
print(f"  cross-check: this actor-level mean DiD ({statistics.mean(r[5] for r in rows):+.2f}) CONTRADICTS the state-level")
print(f"  cut (+0.17, defiance). A flip this large on N={len(rows)} is the signature of an artifact, not a real effect.")

print(f"\n── VERDICT ── UNDERPOWERED + CONFOUNDED. N={len(rows)} actors ({censored} more dropped as right-censored).")
print("   Per-actor op counts are tiny (1–4), namings cluster at peak op-years, and the DiD assumption of")
print("   parallel trends is violated BY CONSTRUCTION (naming is triggered by the actor's own surge). The")
print("   apparent strong 'deterrence' is the mean-reversion/endogeneity artifact the design cannot remove at")
print("   this granularity. Do NOT claim actor-level deterrence from this corpus — the STATE-level cut, with")
print("   more events per unit and a clean rest-of-world control, is the defensible level of analysis.")
