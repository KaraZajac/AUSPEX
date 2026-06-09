#!/usr/bin/env python3
"""
score_agreement.py — score the completed inter-rater worksheet (see PROTOCOL.md).

Reads worksheet.yaml (candidate's answers) + answer-key.yaml (stored tags); writes results.md
with primary agreement, Cohen's kappa (chance = corpus marginal doctrine frequencies),
mean Jaccard, confidence agreement, per-stratum breakdown, and the full disagreement list
for adjudication.
"""
import glob, os
from collections import Counter
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
ws = yaml.safe_load(open(os.path.join(HERE, "worksheet.yaml"), encoding="utf-8"))
key = yaml.safe_load(open(os.path.join(HERE, "answer-key.yaml"), encoding="utf-8"))

# corpus marginal doctrine frequencies (chance model for kappa)
marg = Counter()
for p in glob.glob(os.path.join(ROOT, "atlas", "events", "**", "*.yaml"), recursive=True):
    d = yaml.safe_load(open(p, encoding="utf-8"))
    if not isinstance(d, dict): continue
    for dl in d.get("doctrine_links") or []:
        if dl.get("doctrine_id") and dl.get("perspective") in (None, "attacker-rationale"):
            marg[dl["doctrine_id"]] += 1
M = sum(marg.values())

kitems = {k["item"]: k for k in key["items"]}
n = agree = answered = 0
jaccards = []
conf_exact = conf_adj = conf_n = 0
CONF_ORDER = {"attested": 0, "strongly_inferred": 1, "plausible": 2}
per_stratum = {}
disagreements = []
p_e = 0.0  # chance agreement under marginal-frequency rater

for it in ws["items"]:
    k = kitems.get(it["item"])
    if k is None: continue
    mine = [d for d in (it.get("kara_doctrine_ids") or []) if d]
    if not mine and it.get("kara_confidence") is None:
        continue  # unanswered item — excluded (report count)
    answered += 1
    n += 1
    stored = k["stored_doctrine_id"]
    stored_all = set(k.get("all_stored_doctrines") or [stored])
    hit = stored in mine
    agree += hit
    inter = len(stored_all & set(mine)); union = len(stored_all | set(mine)) or 1
    jaccards.append(inter / union)
    p_e += (marg.get(stored, 0) / M) if M else 0.0
    s = k["stratum"]
    st = per_stratum.setdefault(s, {"n": 0, "agree": 0})
    st["n"] += 1; st["agree"] += hit
    if hit and it.get("kara_confidence") in CONF_ORDER and k["stored_confidence"] in CONF_ORDER:
        conf_n += 1
        d = abs(CONF_ORDER[it["kara_confidence"]] - CONF_ORDER[k["stored_confidence"]])
        conf_exact += (d == 0); conf_adj += (d <= 1)
    if not hit:
        disagreements.append((it["item"], it["event_id"], stored, mine, it.get("kara_notes")))

if n == 0:
    print("No answered items found in worksheet.yaml — fill it in first (see PROTOCOL.md).")
    raise SystemExit(1)

p_o = agree / n
p_e /= n
kappa = (p_o - p_e) / (1 - p_e) if p_e < 1 else float("nan")

lines = [
    "# Inter-rater results — doctrine-link reliability",
    "",
    f"- answered items: **{n}** (of {len(ws['items'])} sampled; {len(ws['items']) - n} unanswered)",
    f"- **primary-link agreement: {p_o:.1%}** ({agree}/{n})",
    f"- **Cohen's κ: {kappa:.3f}**  (chance = corpus marginal doctrine frequency, p_e={p_e:.3f})",
    f"- mean set Jaccard (your set vs all stored attacker-rationale links): **{sum(jaccards)/len(jaccards):.3f}**",
    f"- confidence agreement on agreeing items: exact {conf_exact}/{conf_n}, within-one {conf_adj}/{conf_n}",
    "",
    "## Per-stratum (doctrine-state | stored-confidence)",
    "",
    "| stratum | n | agreement |",
    "|---|---|---|",
]
for s, v in sorted(per_stratum.items()):
    lines.append(f"| {s} | {v['n']} | {v['agree']/v['n']:.0%} |")
lines += [
    "",
    f"## Disagreements ({len(disagreements)}) — the adjudication worklist",
    "",
    "| item | event | stored | yours | your notes |",
    "|---|---|---|---|---|",
]
for item, eid, stored, mine, notes in disagreements:
    lines.append(f"| {item} | {eid} | {stored} | {', '.join(mine) or '(none)'} | {notes or ''} |")
lines += [
    "",
    "_Adjudicate each disagreement (your call stands or the stored tag stands, with a note);_",
    "_the adjudicated error rate is the label-noise estimate the dissertation cites._",
]
out = os.path.join(HERE, "results.md")
open(out, "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("\n".join(lines[:8]))
print(f"\nwrote {out}")
