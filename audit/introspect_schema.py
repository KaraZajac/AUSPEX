#!/usr/bin/env python3
"""
introspect_schema.py — derive the ACTUAL atlas schema from the on-disk YAML.

The repo convention is "trust the on-disk YAML; the docs drift." So this profiles every
record of every entity type and reports, per field: presence (% of records that have it →
required vs optional), observed value type(s), and — for low-cardinality scalar fields —
the full value set (i.e. the real enum). Recurses one level into list-of-dict fields
(attributions, doctrine_links, targets, aliases, pillars …). Output feeds docs/SCHEMA.md.

  python3 audit/introspect_schema.py            # text report
  python3 audit/introspect_schema.py --json schema.json
"""
import argparse, glob, json, os
from collections import Counter, defaultdict
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ATLAS = os.path.join(ROOT, "atlas")
ENUM_MAX = 30  # if a scalar field has <= this many distinct values, treat as an enum and list them

def tname(v):
    if v is None: return "null"
    for t, n in ((bool,"bool"),(int,"int"),(float,"float"),(str,"str"),(list,"list"),(dict,"dict")):
        if isinstance(v, t): return n
    return type(v).__name__

def new_field(): return {"present":0,"types":Counter(),"values":Counter(),"elem_types":Counter(),"sub":None,"sub_n":0}

def profile(records):
    fields = defaultdict(new_field)
    for r in records:
        for k, v in r.items():
            if k.startswith("_"): continue
            f = fields[k]; f["present"] += 1; f["types"][tname(v)] += 1
            if isinstance(v,(str,int,bool)) and not isinstance(v,bool) or isinstance(v,str):
                f["values"][str(v)] += 1
            elif isinstance(v,bool):
                f["values"][str(v)] += 1
            if isinstance(v, list):
                for el in v: f["elem_types"][tname(el)] += 1
                dicts = [el for el in v if isinstance(el, dict)]
                if dicts:
                    if f["sub"] is None: f["sub"] = defaultdict(new_field)
                    for el in dicts:
                        f["sub_n"] += 1
                        for sk, sv in el.items():
                            sf = f["sub"][sk]; sf["present"] += 1; sf["types"][tname(sv)] += 1
                            if isinstance(sv,(str,int,bool)): sf["values"][str(sv)] += 1
    return fields

def load(sub):
    recs = []
    for p in sorted(glob.glob(os.path.join(ATLAS, sub, "**", "*.yaml"), recursive=True)):
        try: doc = yaml.safe_load(open(p, encoding="utf-8"))
        except yaml.YAMLError: continue
        if isinstance(doc, dict): recs.append(doc)
        elif isinstance(doc, list): recs.extend(d for d in doc if isinstance(d, dict))
    return recs

ENTITIES = ["events","actors","services","nation-states","doctrines","sources",
            "timeline-markers","policy-actions","targets","sectors"]

def fmt_field(name, f, n, indent="  "):
    pct = 100*f["present"]//max(n,1)
    req = "REQUIRED" if pct >= 99 else f"optional ({pct}%)"
    types = "|".join(t for t,_ in f["types"].most_common())
    if f["elem_types"]:
        types += "<" + "|".join(t for t,_ in f["elem_types"].most_common()) + ">"
    line = f"{indent}{name}: {types}  [{req}]"
    distinct = [v for v in f["values"] if v != "None"]
    # show enum if this looks like a controlled scalar field
    if f["values"] and len(distinct) <= ENUM_MAX and "str" in f["types"] and "dict" not in f["types"] and not f["sub"]:
        vals = ", ".join(sorted(distinct)[:ENUM_MAX])
        line += f"\n{indent}    values: {{{vals}}}"
    print(line)
    if f["sub"]:
        print(f"{indent}    └─ each element (n={f['sub_n']}):")
        for sk in sorted(f["sub"], key=lambda k: -f["sub"][k]["present"]):
            fmt_field(sk, f["sub"][sk], f["sub_n"], indent + "       ")

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--json"); args = ap.parse_args()
    out = {}
    for ent in ENTITIES:
        recs = load(ent); n = len(recs)
        if not n: print(f"\n### {ent}: (no per-record files)\n"); continue
        fields = profile(recs)
        print(f"\n{'='*70}\n### {ent}  —  {n} records\n{'='*70}")
        for k in sorted(fields, key=lambda k: -fields[k]["present"]):
            fmt_field(k, fields[k], n)
        out[ent] = {"n": n, "fields": {k: {"present_pct": 100*fields[k]["present"]//n,
            "types": dict(fields[k]["types"]),
            "distinct_values": (sorted(v for v in fields[k]["values"] if v!="None")
                                if len([v for v in fields[k]["values"] if v!="None"]) <= ENUM_MAX else "(high-cardinality)")}
            for k in fields}}
    # root aggregate files
    for fn in ("sectors/sectors.yaml","malware-lineage.yaml"):
        p = os.path.join(ATLAS, fn)
        if os.path.exists(p):
            doc = yaml.safe_load(open(p))
            print(f"\n### aggregate file atlas/{fn}: top-level type {tname(doc)}", end="")
            if isinstance(doc, dict): print(f", keys: {list(doc.keys())[:8]}")
            elif isinstance(doc, list): print(f", {len(doc)} entries; first keys: {list(doc[0].keys()) if doc and isinstance(doc[0],dict) else doc[:1]}")
            else: print()
    if args.json: json.dump(out, open(args.json,"w"), indent=1); print(f"\njson → {args.json}")

if __name__ == "__main__": main()
