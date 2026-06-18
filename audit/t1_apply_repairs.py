#!/usr/bin/env python3
"""Apply the T1 repair plan to source YAML files (textual line edits, formatting preserved).
 - set_url:     rewrite the `url:` line to the verified new URL; reset `archive_url:` to null
                so a fresh Wayback snapshot of the NEW url is captured on the next archive run.
 - set_archive: leave `url:` (original, canonical-but-dead) and set `archive_url:` to the
                verified Wayback snapshot.
Dry-run by default; pass --write to modify files."""
import os, re, sys, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plan = json.load(open(os.path.join(ROOT, "research", "repair-apply-plan.json")))
WRITE = "--write" in sys.argv

def path_for(sid):
    g = glob.glob(os.path.join(ROOT, "atlas/sources", f"{sid}.yaml"))
    return g[0] if g else None

def set_line(lines, key, value):
    """Replace top-level `key:` line value; returns (lines, changed_old_or_None, inserted_bool)."""
    pat = re.compile(rf"^{re.escape(key)}:\s?(.*)$")
    for i, ln in enumerate(lines):
        m = pat.match(ln)
        if m:
            old = m.group(1)
            lines[i] = f"{key}: {value}"
            return lines, old, False
    return lines, None, True  # not found

changes = []
for item in plan["set_url"]:
    p = path_for(item["id"])
    if not p: changes.append((item["id"], "MISSING FILE", "", "")); continue
    lines = open(p).read().split("\n")
    lines, oldurl, _ = set_line(lines, "url", item["new_url"])
    lines, oldarc, ins = set_line(lines, "archive_url", "null")
    if ins:  # no archive_url line — add right after url line
        for i, ln in enumerate(lines):
            if ln.startswith("url:"): lines.insert(i+1, "archive_url: null"); break
    if WRITE: open(p, "w").write("\n".join(lines))
    changes.append((item["id"], "url", oldurl, item["new_url"]))

for item in plan["set_archive"]:
    p = path_for(item["id"])
    if not p: changes.append((item["id"], "MISSING FILE", "", "")); continue
    lines = open(p).read().split("\n")
    lines, oldarc, ins = set_line(lines, "archive_url", item["archive_url"])
    if ins:
        for i, ln in enumerate(lines):
            if ln.startswith("url:"): lines.insert(i+1, f"archive_url: {item['archive_url']}"); break
    if WRITE: open(p, "w").write("\n".join(lines))
    changes.append((item["id"], "archive_url", oldarc, item["archive_url"]))

print(f"{'WROTE' if WRITE else 'DRY-RUN'} — {len(changes)} edits\n")
for sid, field, old, new in changes:
    print(f"  {sid}\n    {field}: {str(old)[:60]}  →  {str(new)[:60]}")
