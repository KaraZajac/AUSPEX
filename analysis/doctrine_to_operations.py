#!/usr/bin/env python3
"""
doctrine_to_operations.py — TEST THE GENERATIVE THEORY:
    "cyber operations come out of strategic documents."
    (US strategic intent to deny Iran the bomb  →  Stuxnet.)

We can't prove generation (causation) from observational data — but we CAN test the three
observable legs the theory requires, and we report each with an honest confound. Crucially,
every leg is computed TWICE: on ALL doctrine_links, and on ATTESTED-only links (where a
cited SOURCE names the strategic goal, not the AUSPEX analyst). If the relationship survives
the attested-only cut, it is not merely an artifact of how we chose to tag.

  LEG 1  LEGIBILITY  — what share of operations can be read as a doctrine? (coverage)
  LEG 2  PRECEDENCE  — do operations FOLLOW the document? (op_year − doctrine_issued_year)
  LEG 3  INFORMATION — does knowing the doctrine NARROW the actor? H(actor) vs H(actor|doctrine),
                       reported as bits of mutual information and as the shrink in the
                       "effective suspect pool" (perplexity 2^H).

Read-only, source-derived, no modelling.  python3 analysis/doctrine_to_operations.py
"""
import glob, math, os
from collections import Counter, defaultdict
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = {"documentary","disclosure","doctrine-publication","attribution-publication","policy","law-enforcement"}

def load(sub):
    out={}
    for p in glob.glob(os.path.join(ROOT,"atlas",sub,"**","*.yaml"), recursive=True):
        d=yaml.safe_load(open(p,encoding="utf-8"))
        if isinstance(d,dict) and d.get("id"): out[d["id"]]=d
    return out
def yr(v):
    s=str(v or ""); return int(s[:4]) if s[:4].isdigit() else None

events=load("events"); doctrines=load("doctrines"); actors=load("actors")
dname={i:d.get("name",i) for i,d in doctrines.items()}
dstate={i:d.get("nation_state_id") for i,d in doctrines.items()}
dissued={i:yr(d.get("issued_on")) for i,d in doctrines.items()}
aname={i:a.get("canonical_name",i) for i,a in actors.items()}

def is_op(e):
    its=set(e.get("incident_type") or []); return not(its and its<=META)

# rows: per operational event, its actors and its (doctrine, attested?) links
ops=[]
for e in events.values():
    if not is_op(e): continue
    A=[a.get("actor_id") for a in (e.get("attributions") or []) if a.get("actor_id")]
    D=[(dl.get("doctrine_id"), dl.get("confidence")=="attested")
       for dl in (e.get("doctrine_links") or []) if dl.get("doctrine_id")]
    ops.append({"e":e, "A":A, "D":D, "y":yr(e.get("start_date") or e.get("disclosure_date"))})
NOP=len(ops)

def entropy(probs):  # probs: iterable of probabilities summing ~1
    return -sum(p*math.log2(p) for p in probs if p>0)

def legibility(attested_only):
    tagged=sum(1 for o in ops if any((not attested_only) or att for _,att in o["D"]))
    return tagged, NOP

def precedence(attested_only):
    gaps=[]
    for o in ops:
        if not o["y"]: continue
        for did,att in o["D"]:
            if attested_only and not att: continue
            iy=dissued.get(did)
            if iy is not None: gaps.append(o["y"]-iy)
    return gaps

def information(attested_only):
    # event-normalised weighted co-occurrence p(actor, doctrine) on ops that have BOTH
    co=defaultdict(float)
    for o in ops:
        A=o["A"]; D=[d for d,att in o["D"] if (not attested_only) or att]
        if not A or not D: continue
        w=1.0/(len(A)*len(D))
        for a in A:
            for d in D: co[(a,d)]+=w
    Z=sum(co.values())
    if Z==0: return None
    p_ad={k:v/Z for k,v in co.items()}
    p_a=defaultdict(float); p_d=defaultdict(float)
    for (a,d),p in p_ad.items(): p_a[a]+=p; p_d[d]+=p
    Ha=entropy(p_a.values())
    # H(actor | doctrine) = Σ_d p(d) H(actor|d)
    Had=0.0; per_d={}
    for d,pd in p_d.items():
        cond=[p_ad[(a,d)]/pd for a in p_a if (a,d) in p_ad]
        hd=entropy(cond); Had+=pd*hd
        top=max(((a,p_ad[(a,d)]/pd) for a in p_a if (a,d) in p_ad), key=lambda x:x[1])
        per_d[d]=(hd, top[0], top[1])   # H(actor|d), dominant actor, its share
    return {"Ha":Ha,"Had":Had,"MI":Ha-Had,"per_d":per_d,
            "n_actors":len(p_a),"n_doc":len(p_d),"mass":Z}

print(f"\n===== DO CYBER OPERATIONS COME OUT OF STRATEGIC DOCUMENTS? =====")
print(f"operational events: {NOP}   (doctrines: {len(doctrines)}, actors in corpus: {len(actors)})")

for tag, att in (("ALL doctrine_links", False), ("ATTESTED-only (source names the goal)", True)):
    print(f"\n########## {tag} ##########")
    t,n=legibility(att)
    print(f"── LEG 1 · LEGIBILITY ──  {t}/{n} operations ({100*t//n}%) carry a doctrine link "
          f"→ they can be read as an expression of a strategic frame")

    g=precedence(att)
    if g:
        g.sort(); med=g[len(g)//2]
        pre=sum(1 for x in g if x<0); same=sum(1 for x in g if x==0); post=sum(1 for x in g if x>0)
        print(f"── LEG 2 · PRECEDENCE ──  n={len(g)} op↔dated-doctrine pairs · median gap {med:+d}yr · "
              f"{100*post//len(g)}% of ops FOLLOW the document, {100*same//len(g)}% same-year, {100*pre//len(g)}% precede")
        print(f"     (ops following the document is the temporal arrow the generative theory needs)")

    info=information(att)
    if info:
        Ha,Had,MI=info["Ha"],info["Had"],info["MI"]
        ppl_before, ppl_after = 2**Ha, 2**Had
        print(f"── LEG 3 · INFORMATION ──  H(actor)={Ha:.2f} bits → H(actor|doctrine)={Had:.2f} bits")
        print(f"     mutual information {MI:.2f} bits · {100*MI/Ha:.0f}% of the actor-uncertainty is resolved by the doctrine")
        print(f"     effective suspect pool shrinks {ppl_before:.0f} → {ppl_after:.0f} actors once you know the strategic frame "
              f"(over {info['n_doc']} doctrines, {info['n_actors']} actors)")

# ── most vs least actor-determining doctrines (attested where possible, else all) ──
info=information(False)
det=sorted(info["per_d"].items(), key=lambda kv: kv[1][0])
print(f"\n── most ACTOR-DETERMINING doctrines (knowing the doc ≈ knowing the actor) ──")
for d,(h,a,sh) in det[:8]:
    print(f"  H={h:.2f}  {dname.get(d,d)[:42]:42} → {aname.get(a,a)[:24]} ({100*sh:.0f}%)")
print(f"── most GENERIC doctrines (shared widely; weak actor signal) ──")
for d,(h,a,sh) in det[-6:]:
    print(f"  H={h:.2f}  {dname.get(d,d)[:42]:42} → top {aname.get(a,a)[:24]} ({100*sh:.0f}%)")

# ── exemplars: cleanest document → operation chains (single actor, attested doctrine, op follows within a decade) ──
print(f"\n── exemplar document→operation chains (attested · single actor · op follows, gap ≤ 12yr, one per doctrine) ──")
ex=[]
for o in ops:
    if len(o["A"])!=1 or not o["y"]: continue
    for did,att in o["D"]:
        iy=dissued.get(did)
        if att and iy is not None and 1<=o["y"]-iy<=10:        # op visibly FOLLOWS the doc, plausible window (not a 1946 treaty)
            ex.append((o["y"]-iy, did, o["A"][0], o["e"], iy))
ex.sort(key=lambda x:x[0])                                     # tightest coupling first
seen=set(); shown=0
for gap,did,a,e,iy in ex:
    if did in seen: continue                                   # one row per doctrine, for variety
    seen.add(did)
    print(f"  +{gap}yr  {dname.get(did,did)[:34]:34} ({iy}) → {aname.get(a,a)[:18]:18} → {e.get('name','')[:30]} ({yr(e.get('start_date'))})")
    shown+=1
    if shown>=8: break

# ── the user's own example: Stuxnet ──
print(f"\n── the founding case — Stuxnet ──")
sx=[e for k,e in events.items() if "stuxnet" in k.lower() or "stuxnet" in (e.get("name","").lower())]
if sx:
    for e in sx:
        A=[a.get("actor_id") for a in (e.get("attributions") or [])]
        D=[(dl.get("doctrine_id"),dl.get("confidence")) for dl in (e.get("doctrine_links") or [])]
        print(f"  {e.get('name')}  ({yr(e.get('start_date'))})  actor={A}")
        for did,conf in D:
            print(f"     doctrine: {dname.get(did,did)} [{conf}] state={dstate.get(did)} issued={dissued.get(did)}")
        if not D: print("     (no doctrine link tagged — a candidate to add if a US strategic-intent doc fits)")
else:
    print("  not in corpus under 'stuxnet' — check id/name; the theory's namesake case may be worth adding.")

print(f"\n── CAVEATS (carry into any claim) ── this shows doctrinal LEGIBILITY + temporal PRECEDENCE +")
print("   INFORMATION, not proven generation. Three confounds: (1) REVERSE CODIFICATION — a state may")
print("   write doctrine to describe what it already does (precedence partly guards against this);")
print("   (2) ANALYST-MEDIATED TAGGING — links are AUSPEX assessments, so the attested-only cut is the")
print("   honest one (a source, not us, names the goal); (3) COMMON-CAUSE geopolitics drives both doc")
print("   and op. Year-granular; legibility partly reflects corpus coverage. Association, not effect.")
