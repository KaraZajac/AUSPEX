#!/usr/bin/env python3
"""
sample_links.py — draw the blinded inter-rater sample (see PROTOCOL.md).

Writes:
  thesis/interrater/worksheet.yaml   — the BLINDED items the candidate fills in
  thesis/interrater/answer-key.yaml  — the stored tags (do not open until done)

Stratified by doctrine state (cn/ru/ir/kp/other) × confidence (attested vs inferred),
attacker-rationale links only, seed=20260609 (reproducible).
"""
import glob, os, random, sys
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.dirname(os.path.abspath(__file__))
SEED = 20260609
N_TARGET = 100
META = {"documentary","disclosure","doctrine-publication","attribution-publication","policy","law-enforcement"}

def load(sub):
    out = {}
    for p in glob.glob(os.path.join(ROOT, "atlas", sub, "**", "*.yaml"), recursive=True):
        d = yaml.safe_load(open(p, encoding="utf-8"))
        if isinstance(d, dict) and d.get("id"):
            out[d["id"]] = d
    return out

events = load("events"); doctrines = load("doctrines"); actors = load("actors")

def is_op(e):
    its = set(e.get("incident_type") or [])
    return not (its and its <= META)

# candidate links: attacker-rationale, operational events, with a doctrine_id
links = []
for e in events.values():
    if not is_op(e): continue
    A = [a.get("actor_id") for a in (e.get("attributions") or []) if a.get("actor_id")]
    for i, dl in enumerate(e.get("doctrine_links") or []):
        did = dl.get("doctrine_id")
        if not did: continue
        if dl.get("perspective") not in (None, "attacker-rationale"): continue
        st = did.split("/")[0]
        stratum_state = st if st in ("cn","ru","ir","kp") else "other"
        stratum_conf = "attested" if dl.get("confidence") == "attested" else "inferred"
        links.append({
            "event": e, "link_index": i, "doctrine_id": did,
            "stratum": f"{stratum_state}|{stratum_conf}",
            "stored_confidence": dl.get("confidence"),
            "stored_pillar": dl.get("pillar_id"),
            "actors": A,
        })

# stratified draw, proportional with a floor of 4 per non-empty stratum
rng = random.Random(SEED)
by_stratum = {}
for L in links: by_stratum.setdefault(L["stratum"], []).append(L)
total = len(links)
sample = []
for s, pool in sorted(by_stratum.items()):
    k = max(4, round(N_TARGET * len(pool) / total))
    k = min(k, len(pool))
    sample.extend(rng.sample(pool, k))
rng.shuffle(sample)
sample = sample[:N_TARGET]

# doctrine menu: id + name + first summary line, grouped by state (the FULL menu —
# blinding means the candidate must not be steered to the stored state either)
menu = {}
for did, d in sorted(doctrines.items()):
    st = did.split("/")[0]
    summ = (d.get("summary") or "").strip().split("\n")[0][:140]
    menu.setdefault(st, []).append({"id": did, "name": d.get("name"), "summary": summ})

worksheet = {
    "protocol": "thesis/interrater/PROTOCOL.md — fill kara_doctrine_ids / kara_confidence per item; do NOT open the event YAML or answer-key.yaml",
    "seed": SEED,
    "doctrine_menu": menu,
    "items": [],
}
key = {"seed": SEED, "items": []}
for n, L in enumerate(sample, 1):
    e = L["event"]
    worksheet["items"].append({
        "item": n,
        "event_id": e["id"],
        "name": e.get("name"),
        "actors": [{ "id": a, "canonical_name": (actors.get(a) or {}).get("canonical_name") } for a in L["actors"]] or "UNATTRIBUTED",
        "summary": e.get("summary"),
        "outcome_summary": e.get("outcome_summary"),
        "incident_type": e.get("incident_type"),
        "targets": e.get("targets"),
        "source_ids": e.get("sources"),
        "kara_doctrine_ids": [],
        "kara_confidence": None,
        "kara_notes": None,
    })
    key["items"].append({
        "item": n,
        "event_id": e["id"],
        "stored_doctrine_id": L["doctrine_id"],
        "stored_pillar_id": L["stored_pillar"],
        "stored_confidence": L["stored_confidence"],
        "stratum": L["stratum"],
        "all_stored_doctrines": [dl.get("doctrine_id") for dl in (e.get("doctrine_links") or [])
                                 if dl.get("doctrine_id") and dl.get("perspective") in (None,"attacker-rationale")],
    })

for fname, data in (("worksheet.yaml", worksheet), ("answer-key.yaml", key)):
    with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False, width=100)
print(f"sampled {len(sample)} links across {len(by_stratum)} strata "
      f"({', '.join(f'{s}:{len(p)}' for s,p in sorted(by_stratum.items()))})")
print(f"wrote {OUT}/worksheet.yaml (fill this) and {OUT}/answer-key.yaml (DO NOT OPEN until done)")
