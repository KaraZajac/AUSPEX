#!/usr/bin/env python3
"""Merge all /tmp/qc-prepass-result-*.json agent assessments into a single ranked report.
Output: research/QC-PREPASS.json + research/QC-PREPASS.md (the worklist Kara stamps from)."""
import os, json, glob
from collections import Counter, defaultdict
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

rows = []
seen = set()
for f in sorted(glob.glob("/tmp/qc-prepass-result-*.json")):
    try: data = json.load(open(f))
    except Exception as e: print("skip", f, e); continue
    for r in data:
        if r.get("id") in seen: continue
        seen.add(r.get("id")); rows.append(r)

action = Counter(r.get("recommended_action", "?") for r in rows)
ORDER = {"stamp-clean": 0, "add-second-source": 1, "fix-then-stamp": 2,
         "downgrade-confidence": 3, "needs-human-judgment": 4}
rows.sort(key=lambda r: (ORDER.get(r.get("recommended_action"), 9), r.get("id", "")))
json.dump(rows, open(os.path.join(ROOT, "research", "QC-PREPASS.json"), "w"), indent=2)

def verd(c): return f"{c.get('verdict','?')} — {c.get('note','')}" if isinstance(c, dict) else str(c)
L = ["# Census pre-pass — assistive verification worklist\n"]
L.append("_Machine pre-check of the 6-point protocol against fetched source text. NOT a verification stamp — flags + draft notes for Kara's `qc: {verified_by: kara}` decision. Integrity rule: the human stamp stays Kara's act._\n")
L.append(f"**{len(rows)} events assessed.** Recommended actions:\n")
for k, v in sorted(action.items(), key=lambda x: ORDER.get(x[0], 9)):
    L.append(f"- {v} — **{k}**")
for act in sorted(action, key=lambda a: ORDER.get(a, 9)):
    L.append(f"\n---\n## {act} ({action[act]})\n")
    for r in [x for x in rows if x.get("recommended_action") == act]:
        L.append(f"### `{r['id']}`  _(prepass: {r.get('prepass_confidence','?')})_")
        if r.get("draft_qc_note"): L.append(f"- **draft note:** {r['draft_qc_note']}")
        if r.get("second_source_needed") and r["second_source_needed"] not in (None, "null"):
            L.append(f"- **add 2nd source:** {r['second_source_needed']}")
        L.append(f"- event_support: {verd(r.get('check_event_support',{}))}")
        L.append(f"- attribution: {verd(r.get('check_attribution_support',{}))}")
        L.append(f"- targets: {verd(r.get('check_targets_match',{}))}")
        L.append(f"- doctrine: {verd(r.get('check_doctrine_honest',{}))}")
        sr = r.get("check_source_resolves")
        if sr and sr != "ok": L.append(f"- source_resolves: {sr}")
open(os.path.join(ROOT, "research", "QC-PREPASS.md"), "w").write("\n".join(L))
print(f"consolidated {len(rows)} events → research/QC-PREPASS.md + .json")
print("actions:", dict(action))
