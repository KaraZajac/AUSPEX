#!/usr/bin/env python3
"""
deterrence.py — does naming-and-shaming change behaviour? (read-only, descriptive)

Joins punitive policy-actions (sanctions / indictments / export-controls / asset-seizures)
against each TARGET STATE with that state's cyber-op tempo before vs after, using an
event-study with a difference-in-differences control for the secular trend.

For each punitive action against state S in year Y (with data in both windows):
    ratio_S = ops_S[Y+1..Y+2] / ops_S[Y-2..Y-1]            (target's post/pre op rate)
    ratio_O = ops_other[Y+1..Y+2] / ops_other[Y-2..Y-1]    (everyone ELSE — the trend control)
    DiD     = ln(ratio_S) - ln(ratio_O)
DiD < 0 → S decelerated *relative to the world* after being hit (deterrence-consistent);
DiD > 0 → S accelerated relative (provocation/defiance-consistent); ≈0 → tracks the trend.

HEAVY caveats (this is observational, not causal — say so in any write-up):
  • policy-actions target STATES, not specific actors → state-level only.
  • ENDOGENEITY / reverse causality: punitive actions are usually RESPONSES to an op surge,
    so ops are elevated *before* the action by construction — biasing toward apparent
    post-action mean-reversion that is NOT deterrence.
  • year granularity, overlapping windows, and corpus-collection coverage all add noise.
This measures association, not effect.

  python3 analysis/deterrence.py
"""
import glob, math, os
from collections import Counter, defaultdict
import yaml
from _fingerprint import fp_line

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = {"documentary","disclosure","doctrine-publication","attribution-publication","policy","law-enforcement"}
PUNITIVE = {"sanction","indictment","export-control","asset-seizure"}
W = 2  # window (years) each side

def load(sub):
    out=[]
    for p in glob.glob(os.path.join(ROOT,"atlas",sub,"**","*.yaml"), recursive=True):
        d=yaml.safe_load(open(p,encoding="utf-8"))
        if isinstance(d,dict): out.append(d)
    return out
def yr(v):
    s=str(v or ""); return int(s[:4]) if s[:4].isdigit() else None

events=load("events"); pactions=load("policy-actions")

# ops per (attacker-state, year) — exclude pure-meta events
ops=defaultdict(Counter); allops=Counter()
for e in events:
    its=set(e.get("incident_type") or [])
    if its and its<=META: continue
    y=yr(e.get("start_date") or e.get("disclosure_date"))
    if not y: continue
    states_here={a.get("actor_id").split("/")[0] for a in (e.get("attributions") or []) if a.get("actor_id")}
    for st in states_here:
        ops[st][y]+=1   # count each event once per distinct attacker-state, not once per attribution (multi-org attributions were inflating tempo ~8%)
    if any(a.get("actor_id") for a in (e.get("attributions") or [])):
        allops[y]+=1

# punitive actions per (target-state, year)
pun=defaultdict(list); pun_count=Counter()
for pa in pactions:
    if pa.get("action_type") not in PUNITIVE: continue
    y=yr(pa.get("date"))
    if not y: continue
    for st in (pa.get("targets_state_ids") or []):
        if st in ("multilateral",): continue
        pun[st].append((y, pa.get("action_type"))); pun_count[st]+=1

def rate(counter, y0, y1):  # ops/yr summed over [y0,y1]
    return sum(counter.get(y,0) for y in range(y0,y1+1))

SPARK="▁▂▃▄▅▆▇█"
def spark(counter, lo, hi):
    vals=[counter.get(y,0) for y in range(lo,hi+1)]; m=max(vals) or 1
    return "".join(SPARK[min(7,v*7//m)] for v in vals)

# Right-censoring guard (2026-06-09 C4a): an action whose ±W post-window runs past the
# data's last year is dropped, not silently half-windowed (actor_deterrence.py had this
# guard; this script previously did not — 2025 actions were inflating "defiance").
# Right-censoring boundary = last COMPLETE year, NOT the last year present. The newest year in
# the corpus is partial + collection-lagged, so admitting post-windows that reach into it biases
# DiD toward false "deceleration" (2026-06-09 C4a; recurred 2026-07 because the guard used "last
# year present"). Set this to an explicit data-complete-through year at freeze if preferred.
MAXY = max(y for c in ops.values() for y in c) - 1

# Pseudo-replication guard (C4b): actions against the same state within W years of each
# other share overlapping windows and are NOT independent observations. We cluster them —
# one (state, window-cluster) observation, anchored at the cluster's FIRST action year —
# and report both the raw per-action view (legacy) and the clustered effective-N view.
def cluster_actions(years, gap=W):
    out=[]; cur=[]
    for y in sorted(years):
        if cur and y-cur[-1]<=gap: cur.append(y)
        else:
            if cur: out.append(cur)
            cur=[y]
    if cur: out.append(cur)
    return out

# event study
per_state=defaultdict(list); overall=[]            # per-ACTION (legacy, pseudo-replicated)
per_state_cl=defaultdict(list); overall_cl=[]      # per-CLUSTER (effective-N)
censored=0
def did_at(st, Y):
    preS, postS = rate(ops[st],Y-W,Y-1), rate(ops[st],Y+1,Y+W)
    other=Counter()
    for s2,c in ops.items():
        if s2!=st:
            for y,n in c.items(): other[y]+=n
    preO, postO = rate(other,Y-W,Y-1), rate(other,Y+1,Y+W)
    if preS>0 and postS>0 and preO>0 and postO>0:
        return math.log(postS/preS)-math.log(postO/preO), preS, postS
    return None

for st, acts in pun.items():
    for (Y, atype) in acts:
        if Y + W > MAXY: censored += 1; continue
        r = did_at(st, Y)
        if r:
            did, preS, postS = r
            per_state[st].append((Y,atype,preS,postS,did)); overall.append(did)
    cl_years = cluster_actions([Y for (Y,_) in acts if Y + W <= MAXY])
    for cl in cl_years:
        Y = cl[0]
        r = did_at(st, Y)
        if r:
            did, preS, postS = r
            per_state_cl[st].append((Y,len(cl),did)); overall_cl.append(did)

allyears=sorted(y for c in ops.values() for y in c)
LO,HI=min(allyears),max(allyears)
print(fp_line())
print(f"\n===== DETERRENCE / NAMING-AND-SHAMING (event study + DiD) =====")
print(f"punitive policy-actions analysed: {sum(len(v) for v in per_state.values())} (of {sum(pun_count.values())} total, those with usable ±{W}yr windows)")
print(f"DiD < 0 = target decelerated vs the world after action (deterrence-consistent); > 0 = accelerated (defiance)\n")

print("── per target-state ──")
print(f"  {'state':5} {'#pun':>4} {'mean post/pre (target)':>22} {'(world)':>9} {'mean DiD':>9}   op-tempo "+f"{LO}–{HI}")
for st in sorted(per_state, key=lambda s:-len(per_state[s])):
    recs=per_state[st]
    import statistics as S
    rS=S.mean([math.log(r[3]/r[2]) for r in recs]); rO_did=S.mean([r[4] for r in recs])
    print(f"  {st:5} {len(recs):>4} {math.exp(rS):>21.2f}x {'':9} {rO_did:>+9.2f}   {spark(ops[st],LO,HI)}")

if overall:
    import statistics as S
    md=S.mean(overall); med=sorted(overall)[len(overall)//2]
    pos=sum(1 for d in overall if d>0); neg=sum(1 for d in overall if d<0)
    print(f"\n── aggregate (per-ACTION; pseudo-replicated, for continuity) ── mean DiD {md:+.2f} · median {med:+.2f} · "
          f"{100*neg//len(overall)}% deceleration / {100*pos//len(overall)}% acceleration · {censored} actions right-censored (post-window past {MAXY})")
if overall_cl:
    import statistics as S
    mdc=S.mean(overall_cl); medc=sorted(overall_cl)[len(overall_cl)//2]
    print(f"── aggregate (per WINDOW-CLUSTER; the EFFECTIVE-N view — cite this one) ── n={len(overall_cl)} independent")
    print(f"   (state, window) observations (vs {len(overall)} raw actions) · mean DiD {mdc:+.2f} · median {medc:+.2f}")
    for st in sorted(per_state_cl, key=lambda s:-len(per_state_cl[s])):
        recs=per_state_cl[st]
        print(f"     {st:9} clusters={len(recs)} (sizes {[c for _,c,_ in recs]})  mean DiD {S.mean([d for _,_,d in recs]):+.2f}")
    # Sign test on cluster DiD signs (H0: deceleration and acceleration equally likely). A
    # directional reading is only licensed if N is adequate AND the sign isn't chance — otherwise
    # the script must not print "consistent with deterrence" off a handful of clusters.
    from math import comb
    n_cl=len(overall_cl); k_neg=sum(1 for d in overall_cl if d<0)
    tail=sum(comb(n_cl,i) for i in range(0, min(k_neg, n_cl-k_neg)+1))
    p_sign=min(1.0, 2*tail/(2**n_cl)) if n_cl else 1.0
    if n_cl < 6 or p_sign > 0.10:
        verdict = (f"n={n_cl} independent (state,window) clusters is too small for inference — clustered mean "
                   f"DiD {mdc:+.2f} is DESCRIPTIVE ONLY (two-sided sign test p={p_sign:.2f}; not significant). "
                   f"Do NOT read as deterrence or defiance.")
    elif mdc>0.15:
        verdict = f"acceleration — op tempo rises FASTER than the world after punitive action (defiance-consistent, NOT deterrence; sign test p={p_sign:.2f})"
    elif mdc<-0.15:
        verdict = f"deceleration — consistent with deterrence (sign test p={p_sign:.2f}; but see endogeneity caveat)"
    else:
        verdict = "≈ no net effect — targeted states track the global trend; no detectable deterrence"
    print(f"  reading (clustered): {verdict}")

print("\n── CAVEATS (carry these into any claim) ──")
print("  • Observational, not causal. ENDOGENEITY: punitive actions RESPOND to op surges, so pre-windows")
print("    are elevated by construction — biases toward apparent post-action mean-reversion (false 'deterrence').")
print("  • PSEUDO-REPLICATION: per-action rows share overlapping windows (RU: 29 actions but only a handful of")
print("    independent windows) — cite the per-CLUSTER aggregate, not the per-action n.")
print("  • CONTAMINATED CONTROL: the 'rest of world' includes states that are themselves under punitive action")
print("    in overlapping windows (treated units in the control) — the DiD is descriptive, not identified.")
print("  • STATE BUCKETS include <state>/proxies/* criminal crews by design (~31% of RU ops) — sanctions on the")
print("    state are an indirect treatment for proxies; see docs/SCHEMA.md actor-placement rule.")
print("  • State-level; year-granular; right-censored actions dropped; tempo partly reflects corpus-collection")
print("    coverage. This is association, not effect.")
