#!/usr/bin/env python3
"""
check_conformance.py — validate EVERY atlas record against audit/schemas/atlas.schema.json.

Proves "all data fits the schema": for each record it checks required fields are present,
types match, enums are valid, nested structures conform, and — via additionalProperties:false
— that there are NO stray/undocumented/typo'd fields. Zero-dependency (stdlib + pyyaml),
consistent with the other audit tools; the schema is standard JSON Schema and re-validates
with ajv/jsonschema if you ever want a second opinion.

  python3 audit/check_conformance.py            # full report
  python3 audit/check_conformance.py --self-test # validate the validator on known cases

Exit non-zero if any record fails to conform.
"""
from __future__ import annotations
import argparse, datetime, glob, json, os, re, sys
from collections import defaultdict
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = json.load(open(os.path.join(os.path.dirname(__file__), "schemas", "atlas.schema.json")))

# entity $def  →  how to load its records  (dir under atlas/, or an aggregate (file,key))
ENTITIES = {
    "event": ("dir", "events"), "actor": ("dir", "actors"), "service": ("dir", "services"),
    "nation_state": ("dir", "nation-states"), "doctrine": ("dir", "doctrines"),
    "source": ("dir", "sources"), "target_entity": ("dir", "targets"),
    "timeline_marker": ("dir", "timeline-markers"), "policy_action": ("dir", "policy-actions"),
    "sector": ("agg", ("sectors/sectors.yaml", "sectors")),
}

# ---- normalise YAML → JSON-shaped (dates → ISO strings) so 'string' types match ----
def norm(v):
    if isinstance(v, (datetime.date, datetime.datetime)): return v.isoformat()
    if isinstance(v, dict): return {k: norm(x) for k, x in v.items()}
    if isinstance(v, list): return [norm(x) for x in v]
    return v

# ---- compact JSON Schema validator (subset: type, enum, required, properties,
#      additionalProperties:false, items, $ref #/$defs/*, minItems) ----
PYTYPE = {"object": dict, "array": list, "string": str, "boolean": bool}
def type_ok(v, t):
    if t == "null": return v is None
    if t == "integer": return isinstance(v, int) and not isinstance(v, bool)
    if t == "number": return isinstance(v, (int, float)) and not isinstance(v, bool)
    if t in PYTYPE: return isinstance(v, PYTYPE[t]) and not (t == "object" and isinstance(v, bool))
    return False

def resolve(schema):
    ref = schema.get("$ref")
    if not ref: return schema
    node = SCHEMA
    for part in ref.lstrip("#/").split("/"):
        node = node[part]
    return node

def validate(inst, schema, path, errs):
    schema = resolve(schema)
    if "type" in schema:
        ts = schema["type"] if isinstance(schema["type"], list) else [schema["type"]]
        if not any(type_ok(inst, t) for t in ts):
            errs.append(f"{path or '(root)'}: expected {'|'.join(ts)}, got {type(inst).__name__}")
            return  # type wrong → don't cascade
    if "enum" in schema and inst not in schema["enum"]:
        errs.append(f"{path}: value {inst!r} not in enum {schema['enum']}")
    if isinstance(inst, list):
        if "minItems" in schema and len(inst) < schema["minItems"]:
            errs.append(f"{path}: needs ≥{schema['minItems']} items")
        if "items" in schema:
            for i, el in enumerate(inst): validate(el, schema["items"], f"{path}[{i}]", errs)
    if isinstance(inst, dict):
        for req in schema.get("required", []):
            if req not in inst: errs.append(f"{path}: missing required field '{req}'")
        props = schema.get("properties", {})
        addl = schema.get("additionalProperties", True)
        for k, v in inst.items():
            if k in props: validate(v, props[k], f"{path}.{k}" if path else k, errs)
            elif addl is False: errs.append(f"{path}.{k}: unexpected field '{k}' (not in schema)")

def load(kind, spec):
    recs = []
    if kind == "dir":
        for p in sorted(glob.glob(os.path.join(ROOT, "atlas", spec, "**", "*.yaml"), recursive=True)):
            doc = yaml.safe_load(open(p, encoding="utf-8"))
            if isinstance(doc, dict): recs.append((doc.get("id", os.path.basename(p)), norm(doc)))
    else:  # aggregate file
        fn, key = spec
        doc = yaml.safe_load(open(os.path.join(ROOT, "atlas", fn), encoding="utf-8"))
        for d in (doc.get(key) or []):
            if isinstance(d, dict): recs.append((d.get("id", "?"), norm(d)))
    return recs

def self_test():
    good = {"id":"x/y/z","primary_service_id":None,"additional_service_ids":[],"canonical_name":"X",
            "aliases":[],"status":"active","mission":["espionage"],"ttp_summary":"…",
            "default_doctrine_alignment_ids":[],"sources":["s/1"]}
    bad = dict(good, status="zombie", surprise=1); del bad["mission"]
    e1, e2 = [], []
    validate(good, {"$ref":"#/$defs/actor"}, "", e1)
    validate(bad, {"$ref":"#/$defs/actor"}, "", e2)
    print("self-test good →", e1 or "OK (0 errors)")
    print("self-test bad  →", e2, "(expect: missing 'mission', bad enum, unexpected 'surprise')")
    sys.exit(0 if (not e1 and len(e2) == 3) else 1)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--self-test", action="store_true"); args = ap.parse_args()
    if args.self_test: self_test()
    total = conforming = 0
    per_entity = {}
    bad_records = []
    for defname, (kind, spec) in ENTITIES.items():
        recs = load(kind, spec)
        ok = 0
        for rid, rec in recs:
            errs = []
            validate(rec, {"$ref": f"#/$defs/{defname}"}, "", errs)
            if errs: bad_records.append((defname, rid, errs))
            else: ok += 1
        per_entity[defname] = (ok, len(recs)); total += len(recs); conforming += ok
    print("===== AUSPEX SCHEMA CONFORMANCE =====")
    for d, (ok, n) in per_entity.items():
        flag = "✓" if ok == n else f"✗ {n-ok} FAIL"
        print(f"  {d:16} {ok}/{n}  {flag}")
    print(f"\n  TOTAL: {conforming}/{total} records conform")
    if bad_records:
        print(f"\n── {len(bad_records)} non-conforming records ──")
        by_ent = defaultdict(list)
        for d, rid, errs in bad_records: by_ent[d].append((rid, errs))
        for d in by_ent:
            print(f"\n  [{d}] {len(by_ent[d])}")
            for rid, errs in by_ent[d][:12]:
                print(f"    {rid}")
                for e in errs[:5]: print(f"        {e}")
            if len(by_ent[d]) > 12: print(f"    … +{len(by_ent[d])-12} more")
    print(f"\n{'PASS — all data fits the schema' if not bad_records else f'FAIL — {len(bad_records)} records do not conform'}")
    sys.exit(1 if bad_records else 0)

if __name__ == "__main__": main()
