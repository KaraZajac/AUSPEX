#!/usr/bin/env python3
"""
export_release.py — build the publication release bundle from the raw atlas YAML.

Deterministic and engine-independent (same trust philosophy as audit/): what a replicator
downloads is derived from the canonical YAML by this one inspectable script.

  python3 publish/export_release.py [--tag v1.0-dissertation]

Writes release/auspex-<tag>/:
  events.jsonl, actors.jsonl, services.jsonl, nation_states.jsonl, doctrines.jsonl,
  sources.jsonl, targets.jsonl, timeline_markers.jsonl, policy_actions.jsonl, sectors.jsonl
  atlas.schema.json          (the formal JSON Schema, copied)
  stats.json                 (corpus statistics — feeds the datasheet / paper tables)
  DATASHEET.md               (copied from publish/)
  SHA256SUMS                 (integrity manifest)
  README.md                  (bundle-level: what this is, license placeholder, citation)
"""
import argparse, glob, hashlib, json, os, shutil, subprocess, sys
from collections import Counter
from datetime import date
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ENTITIES = {  # atlas subdir -> output name
    "events": "events", "actors": "actors", "services": "services",
    "nation-states": "nation_states", "doctrines": "doctrines", "sources": "sources",
    "targets": "targets", "timeline-markers": "timeline_markers",
    "policy-actions": "policy_actions",
}

def load_dir(sub):
    out = []
    for p in sorted(glob.glob(os.path.join(ROOT, "atlas", sub, "**", "*.yaml"), recursive=True)):
        d = yaml.safe_load(open(p, encoding="utf-8"))
        if isinstance(d, dict) and d.get("id"):
            out.append(d)
    return out

def jdefault(o):
    return o.isoformat() if hasattr(o, "isoformat") else str(o)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tag", default=None, help="release tag (default: git describe)")
    args = ap.parse_args()
    tag = args.tag
    if not tag:
        try:
            tag = subprocess.check_output(
                ["git", "describe", "--tags", "--always"], cwd=ROOT, text=True).strip()
        except Exception:
            tag = "untagged"
    outdir = os.path.join(ROOT, "release", f"auspex-{tag}")
    os.makedirs(outdir, exist_ok=True)

    data = {}
    for sub, name in ENTITIES.items():
        recs = load_dir(sub)
        data[name] = recs
        with open(os.path.join(outdir, f"{name}.jsonl"), "w", encoding="utf-8") as f:
            for r in recs:
                f.write(json.dumps(r, ensure_ascii=False, sort_keys=True, default=jdefault) + "\n")
    # sectors: single aggregate file
    sec = yaml.safe_load(open(os.path.join(ROOT, "atlas", "sectors", "sectors.yaml"), encoding="utf-8"))
    sectors = sec.get("sectors", []) if isinstance(sec, dict) else []
    with open(os.path.join(outdir, "sectors.jsonl"), "w", encoding="utf-8") as f:
        for r in sectors:
            f.write(json.dumps(r, ensure_ascii=False, sort_keys=True, default=jdefault) + "\n")

    # ---- stats.json (the datasheet/paper numbers) ----
    ev = data["events"]
    META = {"documentary","disclosure","doctrine-publication","attribution-publication","policy","law-enforcement"}
    def is_op(e):
        its = set(e.get("incident_type") or []); return not (its and its <= META)
    ops = [e for e in ev if is_op(e)]
    dlinks = [dl for e in ev for dl in (e.get("doctrine_links") or []) if dl.get("doctrine_id")]
    attacker = [dl for dl in dlinks if dl.get("perspective") in (None, "attacker-rationale")]
    attrs = [a for e in ev for a in (e.get("attributions") or [])]
    years = sorted(str(e.get("start_date") or "")[:4] for e in ev if e.get("start_date"))
    src = data["sources"]
    stats = {
        "release_tag": tag,
        "generated_on": date.today().isoformat(),
        "counts": {name: len(recs) for name, recs in data.items()} | {"sectors": len(sectors)},
        "events": {
            "total": len(ev),
            "operational": len(ops),
            "meta": len(ev) - len(ops),
            "year_range": [years[0], years[-1]] if years else None,
            "with_actor_attribution": sum(1 for e in ev if any(a.get("actor_id") for a in (e.get("attributions") or []))),
            "with_doctrine_link": sum(1 for e in ev if e.get("doctrine_links")),
            "human_verified_qc": sum(1 for e in ev if (e.get("qc") or {}).get("verified_by")),
            "false_flag_risk": dict(Counter(e.get("false_flag_risk") for e in ev)),
        },
        "doctrine_links": {
            "total": len(dlinks),
            "attacker_rationale": len(attacker),
            "by_confidence": dict(Counter(dl.get("confidence") for dl in dlinks)),
            "by_perspective": dict(Counter(dl.get("perspective") or "attacker-rationale" for dl in dlinks)),
        },
        "attributions": {
            "rows": len(attrs),
            "by_org_confidence": dict(Counter(a.get("attributing_org_confidence") for a in attrs if a.get("actor_id"))),
            "by_auspex_assessment": dict(Counter(a.get("auspex_assessment") for a in attrs)),
        },
        "doctrines": {"by_kind": dict(Counter(d.get("kind") for d in data["doctrines"]))},
        "sources": {
            "total": len(src),
            "by_kind": dict(Counter(s.get("kind") for s in src)),
            "by_tier": dict(Counter(s.get("tier") for s in src)),
            "with_archive_url": sum(1 for s in src if s.get("archive_url")),
        },
    }
    with open(os.path.join(outdir, "stats.json"), "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    # ---- schema + datasheet copies ----
    shutil.copy(os.path.join(ROOT, "audit", "schemas", "atlas.schema.json"), outdir)
    ds = os.path.join(ROOT, "publish", "DATASHEET.md")
    if os.path.exists(ds):
        shutil.copy(ds, outdir)

    # ---- bundle README ----
    with open(os.path.join(outdir, "README.md"), "w", encoding="utf-8") as f:
        f.write(f"""# AUSPEX — doctrine-tagged cyber-event corpus (release {tag})

Frozen research snapshot of the AUSPEX atlas: state-sponsored cyber events tagged against the
strategic doctrines under which they were tasked, with per-claim sourcing.

- One JSONL file per entity type; formal schema in `atlas.schema.json` (JSON Schema; every
  record validates). Corpus statistics in `stats.json`. Documentation in `DATASHEET.md`.
- Integrity: verify with `shasum -a 256 -c SHA256SUMS`.
- LICENSE: [TO BE SET — see publish/PUBLICATION-PLAN.md Decision 0]
- Cite: see CITATION.cff in the source repository.
- A continuously maintained version exists; this snapshot is frozen for reproducibility.
""")

    # ---- checksums (last) ----
    sums = []
    for name in sorted(os.listdir(outdir)):
        if name == "SHA256SUMS": continue
        h = hashlib.sha256(open(os.path.join(outdir, name), "rb").read()).hexdigest()
        sums.append(f"{h}  {name}")
    open(os.path.join(outdir, "SHA256SUMS"), "w").write("\n".join(sums) + "\n")

    n = stats["counts"]
    print(f"release bundle: {outdir}")
    print(f"  {n['events']} events · {n['actors']} actors · {n['doctrines']} doctrines · {n['sources']} sources")
    print(f"  qc-verified events: {stats['events']['human_verified_qc']} · archived sources: {stats['sources']['with_archive_url']}/{n['sources']}")
    print(f"  files: {len(sums)} (+SHA256SUMS)")

if __name__ == "__main__":
    main()
