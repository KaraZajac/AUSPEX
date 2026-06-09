#!/usr/bin/env python3
"""
verify_atlas.py — independent verification harness for the AUSPEX atlas.

Reads the raw atlas YAML directly (NOT via the TS engine) so it is an *independent*
audit: a reviewer can trust it without trusting AUSPEX's own code. It does NOT decide
truth — it surfaces, with reasons, the events/sources/tags a human must verify, turning
"check 1,000+ sources by hand" into "review the flagged subset."

Severities:
  ERROR  — structural breakage (dangling reference, bad enum). Fails the run.
  WARN   — likely defect (orphan/dup source, attested-without-source).
  REVIEW — needs human judgment (directionality, counter-op convention, doctrine-state
           mismatch, source/date gaps). NOT necessarily wrong — that's the point.
  INFO   — backlog trackers (provisional markers, unscoped actors, doctrine coverage).

Deliberate non-checks (false-positive traps):
  * We do NOT require a source's publisher country to match the actor's country. A US
    government source reporting a Russian actor is normal; flagging it would be noise.
  * We do NOT treat a Western-actor → adversary-country event as inherently wrong
    (e.g. Stuxnet US→IR is a real operation). Directionality is surfaced for REVIEW,
    keyed on counter-op conventions, not on a "who-may-attack-whom" prior.

Usage:
  python3 audit/verify_atlas.py [--check-urls] [--json audit/audit-report.json]
  (run from repo root; --check-urls curl-probes every unique source URL — slow)
"""
from __future__ import annotations
import argparse, glob, json, os, re, sys, subprocess
from collections import defaultdict
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ATLAS = os.path.join(ROOT, "atlas")

INCIDENT_TYPE = {"intrusion","data-theft","destructive","wiper","ransomware","financial-theft",
    "extortion","supply-chain","pre-positioning","disruption","espionage","surveillance",
    "bulk-collection","reconnaissance","influence-operation","hack-and-leak","leak","insider",
    "cyber-physical","documentary","disclosure","doctrine-publication","attribution-publication",
    "policy","law-enforcement"}
# incident types that, alone, characterise a META/announcement or state COUNTER-action
META_TYPES = {"documentary","disclosure","doctrine-publication","attribution-publication","policy","law-enforcement"}
# core operational incident types — a real op with one of these but no actor is the strongest
# "missing attribution?" signal. Excludes disruption/supply-chain/recon/influence (ambiguous:
# disruption covers both wiper attacks *and* state takedowns, which legitimately carry null actor).
CORE_OP = (INCIDENT_TYPE - META_TYPES) - {"disruption","supply-chain","reconnaissance","influence-operation"}
INITIAL_VECTOR = {"phishing","n-day","0-day","supply-chain","valid-creds","insider","physical","unknown"}
CONF_LINK = {"attested","strongly_inferred","plausible"}
CONF_ORG = {"high","moderate","low"}
ASSESS = {"concur","concur-with-caveat","partial","contested"}
FALSE_FLAG = {"none","suspected","confirmed"}
TARGET_ROLE = {"primary","collateral","staging","transit"}

findings: list[dict] = []
def add(check, sev, ref, msg): findings.append({"check": check, "sev": sev, "ref": ref, "msg": msg})

def load_dir(sub):
    out = {}
    for p in glob.glob(os.path.join(ATLAS, sub, "**", "*.yaml"), recursive=True):
        raw = open(p, encoding="utf-8").read()
        try:
            doc = yaml.safe_load(raw)
        except yaml.YAMLError as e:
            add("yaml", "ERROR", os.path.relpath(p, ROOT), f"unparseable YAML: {e}"); continue
        if isinstance(doc, dict) and doc.get("id"):
            out[doc["id"]] = {"_path": os.path.relpath(p, ROOT), "_raw": raw, **doc}
        # aggregate / list-shaped files (e.g. sectors.yaml) carry no top-level id — skip silently
    return out

print("loading atlas …")
events  = load_dir("events")
actors  = load_dir("actors")
services= load_dir("services")
states  = load_dir("nation-states")
doctrines = load_dir("doctrines")
sources = load_dir("sources")
markers = load_dir("timeline-markers")      # for source-orphan accounting (markers cite sources)
policy_actions = load_dir("policy-actions")
campaigns = load_dir("campaigns")

# ---- lookups ----
doctrine_state = {d_id: d.get("nation_state_id") for d_id, d in doctrines.items()}
pillar_ids = set()
for d in doctrines.values():
    for p in (d.get("pillars") or []):
        pid = p.get("id") if isinstance(p, dict) else None
        if pid: pillar_ids.add(pid)
program_ids = set()  # programs live under doctrines in some schemas; collect any id we see
def actor_state(aid):  # state = first id segment (criminal/ has no state)
    return aid.split("/")[0] if aid else None
def service_state(sid):
    svc = services.get(sid); return svc.get("nation_state_id") if svc else None

WESTERN = {"us","uk","fr","au","ca","nz","de","nl","be"}  # context only; not used as a hard rule

# =================== CHECKS ===================

def check_referential():
    """ERROR: dangling foreign keys — re-derived independently from raw YAML."""
    for eid, e in events.items():
        for a in (e.get("attributions") or []):
            aid = a.get("actor_id")
            if aid and aid not in actors: add("fk-actor","ERROR",f"events/{eid}",f"attribution actor_id not found: {aid}")
            sid = a.get("attribution_source_id")
            if sid and sid not in sources: add("fk-source","ERROR",f"events/{eid}",f"attribution_source_id not found: {sid}")
        for dl in (e.get("doctrine_links") or []):
            did = dl.get("doctrine_id")
            if did and did not in doctrines: add("fk-doctrine","ERROR",f"events/{eid}",f"doctrine_id not found: {did}")
            pid = dl.get("pillar_id")
            if pid and pid not in pillar_ids: add("fk-pillar","ERROR",f"events/{eid}",f"pillar_id not found: {pid}")
            asrc = dl.get("attesting_source_id")
            if asrc and asrc not in sources: add("fk-source","ERROR",f"events/{eid}",f"attesting_source_id not found: {asrc}")
        for s in (e.get("sources") or []):
            if s not in sources: add("fk-source","ERROR",f"events/{eid}",f"event source not found: {s}")
    for aid, a in actors.items():
        ps = a.get("primary_service_id")
        if ps and ps not in services: add("fk-service","ERROR",f"actors/{aid}",f"primary_service_id not found: {ps}")
    for sid, s in services.items():
        ns = s.get("nation_state_id")
        if ns and ns not in states: add("fk-state","ERROR",f"services/{sid}",f"nation_state_id not found: {ns}")

def check_enums():
    """ERROR: controlled-vocabulary violations."""
    for eid, e in events.items():
        for it in (e.get("incident_type") or []):
            if it not in INCIDENT_TYPE: add("enum","ERROR",f"events/{eid}",f"incident_type not in vocab: {it}")
        iv = e.get("initial_vector")
        if iv and iv not in INITIAL_VECTOR: add("enum","ERROR",f"events/{eid}",f"initial_vector not in vocab: {iv}")
        ff = e.get("false_flag_risk")
        if ff and ff not in FALSE_FLAG: add("enum","WARN",f"events/{eid}",f"false_flag_risk not in vocab: {ff}")
        for a in (e.get("attributions") or []):
            c = a.get("attributing_org_confidence")
            if c and c not in CONF_ORG: add("enum","ERROR",f"events/{eid}",f"attributing_org_confidence not in vocab: {c}")
            asm = a.get("auspex_assessment")
            if asm and asm not in ASSESS: add("enum","ERROR",f"events/{eid}",f"auspex_assessment not in vocab: {asm}")
        for dl in (e.get("doctrine_links") or []):
            c = dl.get("confidence")
            if c and c not in CONF_LINK: add("enum","ERROR",f"events/{eid}",f"doctrine_link confidence not in vocab: {c}")
        for t in (e.get("targets") or []):
            r = t.get("role")
            if r and r not in TARGET_ROLE: add("enum","WARN",f"events/{eid}",f"target role not in vocab: {r}")

def check_sources():
    """WARN: source hygiene — orphans, duplicates, missing url+note."""
    referenced = set()
    for e in events.values():
        for a in (e.get("attributions") or []):
            if a.get("attribution_source_id"): referenced.add(a["attribution_source_id"])
            if a.get("attesting_source_id"): referenced.add(a["attesting_source_id"])
        for s in (e.get("sources") or []): referenced.add(s)
        for dl in (e.get("doctrine_links") or []):
            if dl.get("attesting_source_id"): referenced.add(dl["attesting_source_id"])
    for a in actors.values():
        for s in (a.get("sources") or []): referenced.add(s)
    for d in doctrines.values():
        for s in (d.get("sources") or []): referenced.add(s)
    for svc in services.values():
        for s in (svc.get("sources") or []): referenced.add(s)
    for m in markers.values():                              # markers cite sources via cited_by/sources
        for s in (m.get("cited_by") or []) + (m.get("sources") or []): referenced.add(s)
    for coll in (policy_actions, campaigns, states):
        for o in coll.values():
            for s in (o.get("sources") or []) + (o.get("cited_by") or []): referenced.add(s)
    url_to_ids = defaultdict(list)
    for sid, s in sources.items():
        if sid not in referenced: add("source-orphan","WARN",f"sources/{sid}","referenced by no event/actor/doctrine/service/marker")
        url, arc = s.get("url"), s.get("archive_url")
        has_url = url not in (None, "null", "")
        if not has_url and arc in (None,"null","") and not s.get("note"):
            add("source-url","WARN",f"sources/{sid}","no url, no archive_url, and no explanatory note")
        if has_url:
            url_to_ids[re.sub(r'[#?].*$','',str(url).rstrip('/')).lower()].append(sid)
        if not s.get("kind"): add("source-kind","WARN",f"sources/{sid}","missing kind")
    for url, ids in url_to_ids.items():
        if len(ids) > 1: add("source-dup","WARN","sources",f"{len(ids)} sources share URL {url}: {', '.join(ids[:4])}{' …' if len(ids)>4 else ''}")

def check_attribution_convention():
    """REVIEW: the counter-op / null-actor conventions + directionality gotchas."""
    for eid, e in events.items():
        its = set(e.get("incident_type") or [])
        attrs = e.get("attributions") or []
        actor_ids = [a.get("actor_id") for a in attrs]
        has_actor = any(actor_ids)
        all_meta = bool(its) and its <= META_TYPES
        # (1) a PURELY meta/announcement event that still carries a named attacker. The convention:
        #     a state counter-action (sanctions/indictment/takedown) carries null actor (acting body
        #     in attributing_org; the named actor is the SUBJECT). A pure disclosure *about* an actor
        #     may legitimately keep it. So this is a REVIEW, not an error — verify which it is.
        if all_meta and has_actor:
            add("convention-counterop","REVIEW",f"events/{eid}",
                f"all-meta incident_type {sorted(its)} but actor_id set ({[a for a in actor_ids if a][:2]}) — "
                f"counter-action that should be null-actor, or a disclosure that legitimately names the actor?")
        # (2) a CORE operation (intrusion/theft/wiper/…) with NO attacker — missing attribution, or
        #     genuinely-unattributed? (disruption/supply-chain/recon/influence excluded — see CORE_OP.)
        core = its & CORE_OP
        if core and not has_actor:
            add("convention-nullactor","REVIEW",f"events/{eid}",
                f"core-operation incident_type {sorted(core)} but no actor_id — genuinely unattributed, or missing attribution?")
        # (3) directionality: a target country == the attacker's own state (domestic op). Legit for
        #     surveillance, suspicious otherwise.
        tcountries = {(_t.get("country") or "").lower() for _t in (e.get("targets") or []) if _t.get("country")}
        for aid in actor_ids:
            st = actor_state(aid)
            if st and st in tcountries and st not in {"criminal"}:
                domestic_ok = bool(its & {"surveillance","bulk-collection"})
                add("direction-selftarget", "INFO" if domestic_ok else "REVIEW", f"events/{eid}",
                    f"actor {aid} (state {st}) targets its own country {st}" + (" — domestic surveillance, expected" if domestic_ok else " — verify direction / domestic-op tag"))

def check_doctrine_consistency():
    """REVIEW/WARN: doctrine tags must cohere with the attributed actor's state + ICD-203."""
    nullactor_doctrine = 0
    for eid, e in events.items():
        attrs = e.get("attributions") or []
        actor_states = {actor_state(a.get("actor_id")) for a in attrs if a.get("actor_id")}
        actor_states.discard(None); actor_states.discard("criminal")
        for dl in (e.get("doctrine_links") or []):
            did = dl.get("doctrine_id"); dst = doctrine_state.get(did)
            # State coherence: a doctrine is its OWN state's strategic intent, so for an ATTRIBUTED op
            # the doctrine-state should == the actor's state. A mismatch is the strongest "mis-tagged
            # doctrine" signal (e.g. a RU actor carrying a CN doctrine). Null-actor events are exempt
            # and counted separately: AUSPEX deliberately allows doctrine on null-actor events (an op
            # can be doctrinally legible without a named cluster — the perpetrator's state doctrine).
            persp = dl.get("perspective")  # absent == attacker-rationale (default who×why semantics)
            if persp not in (None, "attacker-rationale", "victim-response", "defender-response"):
                add("enum","ERROR",f"events/{eid}",f"doctrine_link perspective not in vocab: {persp}")
            if did and dst:
                if actor_states and dst not in actor_states:
                    if persp is not None:
                        # Cross-state WITH a perspective tag = reviewed-and-intentional:
                        # victim-response / defender-response record whose doctrine it is;
                        # an EXPLICIT attacker-rationale marks a genuine cross-state rationale
                        # (joint op like Olympic Games US+IL; a proxy executing the sponsor's
                        # strategy like Ghostwriter/BY under RU doctrine).
                        pass
                    else:
                        add("doctrine-state-mismatch","REVIEW",f"events/{eid}",
                            f"doctrine {did} (state {dst}) on event attributed to {sorted(actor_states)} — "
                            f"state mismatch with NO perspective tag (mis-tagged doctrine, a genuine cross-state "
                            f"attacker-rationale case like a joint op/proxy, or missing victim-response/defender-response?)")
                elif not actor_states:
                    nullactor_doctrine += 1
            # ICD-203: attested requires a source naming the strategic goal
            if dl.get("confidence") == "attested" and not dl.get("attesting_source_id"):
                add("icd203-attested","WARN",f"events/{eid}",f"doctrine_link to {did} is 'attested' but has no attesting_source_id")
    if nullactor_doctrine:
        add("doctrine-nullactor","INFO","events",
            f"{nullactor_doctrine} doctrine_links sit on null-actor events — by design (doctrine is independent of "
            f"attribution). Spot-check a sample, especially counter-ops where the doctrine should be the ACTING state's.")

def check_source_date_alignment():
    """REVIEW: attribution_date far from the cited source's published_on (possible mis-cite)."""
    for eid, e in events.items():
        for a in (e.get("attributions") or []):
            sid = a.get("attribution_source_id"); adate = str(a.get("attribution_date") or "")[:4]
            s = sources.get(sid) if sid else None
            sdate = str(s.get("published_on") or "")[:4] if s else ""
            if adate.isdigit() and sdate.isdigit() and abs(int(adate) - int(sdate)) >= 3:
                add("source-date-gap","REVIEW",f"events/{eid}",
                    f"attribution_date {adate} vs source {sid} published_on {sdate} (≥3yr gap) — verify the source supports this dating")

def check_backlog():
    """INFO: QC frontier trackers (provisional markers, unscoped actors, doctrine coverage)."""
    prov = sum(1 for e in events.values() if "PROVISIONAL" in e["_raw"])
    todo = sum(1 for e in events.values() if "TODO(QC)" in e["_raw"] or "QC pending" in e["_raw"])
    if prov: add("backlog-provisional","INFO","events",f"{prov} events still carry a PROVISIONAL header comment")
    if todo: add("backlog-todo","INFO","events",f"{todo} events still carry a TODO(QC)/QC-pending marker")
    unscoped = [aid for aid in actors if "/unscoped/" in aid or aid.split("/")[-2:-1] == ["unscoped"]]
    if unscoped: add("backlog-unscoped","INFO","actors",f"{len(unscoped)} actors under placeholder /unscoped services (service placement QC): {', '.join(sorted(unscoped)[:6])} …")
    # operational, state-attributed events with no doctrine link (the WHY-tagging frontier)
    missing = []
    for eid, e in events.items():
        its = set(e.get("incident_type") or [])
        if its and its <= META_TYPES: continue
        astates = {actor_state(a.get("actor_id")) for a in (e.get("attributions") or []) if a.get("actor_id")}
        astates.discard(None)
        if astates and astates != {"criminal"} and not (e.get("doctrine_links") or []):
            missing.append(eid)
    if missing: add("backlog-doctrine","INFO","events",f"{len(missing)} operational state-actor events have NO doctrine_link (WHY-tagging frontier)")

def check_urls():
    """Optional: curl-probe every unique source URL. Slow (1,000+)."""
    urls = sorted({str(s["url"]) for s in sources.values() if s.get("url") not in (None,"null","")})
    print(f"  probing {len(urls)} unique URLs (this is slow) …")
    bad = 0
    for i, u in enumerate(urls):
        try:
            code = subprocess.run(["curl","-sS","-o","/dev/null","-L","--max-time","20",
                "-A","Mozilla/5.0 (AUSPEX audit)","-w","%{http_code}", u],
                capture_output=True, text=True, timeout=30).stdout.strip()
        except Exception:
            code = "ERR"
        if not re.match(r"^[23]\d\d$", code):
            bad += 1; add("url-dead","REVIEW","sources",f"{code}  {u}")
        if (i+1) % 100 == 0: print(f"    {i+1}/{len(urls)} …")
    add("url-summary","INFO","sources",f"{len(urls)} URLs probed; {bad} non-2xx/3xx (bot-blocks or dead — review the url-dead list)")

# =================== RUN ===================
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check-urls", action="store_true", help="curl every source URL (slow)")
    ap.add_argument("--json", default=os.path.join(ROOT,"audit","audit-report.json"))
    args = ap.parse_args()

    for fn in (check_referential, check_enums, check_sources, check_attribution_convention,
               check_doctrine_consistency, check_source_date_alignment, check_backlog):
        fn()
    if args.check_urls: check_urls()

    by_sev = defaultdict(list)
    for f in findings: by_sev[f["sev"]].append(f)
    print(f"\n===== AUSPEX ATLAS AUDIT =====")
    print(f"events {len(events)} · actors {len(actors)} · services {len(services)} · "
          f"states {len(states)} · doctrines {len(doctrines)} · sources {len(sources)}\n")
    for sev in ("ERROR","WARN","REVIEW","INFO"):
        fs = by_sev.get(sev, [])
        by_check = defaultdict(list)
        for f in fs: by_check[f["check"]].append(f)
        print(f"── {sev}: {len(fs)} ──")
        for chk in sorted(by_check):
            items = by_check[chk]
            print(f"  [{chk}] {len(items)}")
            for it in items[:6]:
                print(f"      {it['ref']}: {it['msg']}")
            if len(items) > 6: print(f"      … +{len(items)-6} more (see {os.path.relpath(args.json, ROOT)})")
        print()
    json.dump({"summary": {s: len(by_sev.get(s,[])) for s in ('ERROR','WARN','REVIEW','INFO')},
               "findings": findings}, open(args.json,"w"), indent=1)
    print(f"full report → {os.path.relpath(args.json, ROOT)}")
    n_err = len(by_sev.get("ERROR", []))
    print(f"\n{'FAIL' if n_err else 'PASS'} ({n_err} errors; WARN/REVIEW are for human verification, not failures)")
    sys.exit(1 if n_err else 0)

if __name__ == "__main__":
    main()
