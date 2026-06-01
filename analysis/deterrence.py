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
    for a in (e.get("attributions") or []):
        aid=a.get("actor_id")
        if aid:
            st=aid.split("/")[0]
            ops[st][y]+=1;
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

# event study
per_state=defaultdict(list); overall=[]
for st, acts in pun.items():
    for (Y, atype) in acts:
        preS, postS = rate(ops[st],Y-W,Y-1), rate(ops[st],Y+1,Y+W)
        other=Counter()
        for s2,c in ops.items():
            if s2!=st:
                for y,n in c.items(): other[y]+=n
        preO, postO = rate(other,Y-W,Y-1), rate(other,Y+1,Y+W)
        if preS>0 and postS>0 and preO>0 and postO>0:
            did=math.log(postS/preS)-math.log(postO/preO)
            per_state[st].append((Y,atype,preS,postS,did)); overall.append(did)

allyears=sorted(y for c in ops.values() for y in c)
LO,HI=min(allyears),max(allyears)
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
    print(f"\n── aggregate ── mean DiD {md:+.2f} · median {med:+.2f} · {100*neg//len(overall)}% of actions show deceleration-vs-world, {100*pos//len(overall)}% acceleration")
    verdict = ("acceleration — targeted states' op tempo tends to rise FASTER than the world after punitive action "
               "(defiance/escalation-consistent, NOT deterrence)" if md>0.15 else
               "deceleration — consistent with deterrence (but see endogeneity caveat)" if md<-0.15 else
               "≈ no net effect — targeted states track the global trend; no detectable deterrence")
    print(f"  reading: {verdict}")

print("\n── CAVEATS (carry these into any claim) ──")
print("  • Observational, not causal. ENDOGENEITY: punitive actions RESPOND to op surges, so pre-windows")
print("    are elevated by construction — biases toward apparent post-action mean-reversion (false 'deterrence').")
print("  • State-level (policy-actions target states, not actors); year-granular; windows overlap; tempo")
print("    partly reflects corpus-collection coverage. This is association, not effect.")
