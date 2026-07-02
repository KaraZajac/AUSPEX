"""Shared corpus fingerprint for the analysis ledger.

Every analysis script prints this first so a stale FINDINGS.md is self-evident: the line
carries the event count and the git commit the numbers were generated from. Import-safe
because the scripts run as `python3 analysis/<x>.py`, putting analysis/ on sys.path[0].
"""
import glob, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def fp_line(root: str = ROOT) -> str:
    n = sum(1 for _ in glob.glob(os.path.join(root, "atlas/events/**/*.yaml"), recursive=True))
    try:
        sha = subprocess.run(["git", "-C", root, "rev-parse", "--short", "HEAD"],
                             capture_output=True, text=True, timeout=5).stdout.strip() or "nogit"
        dirty = subprocess.run(["git", "-C", root, "status", "--porcelain", "atlas"],
                               capture_output=True, text=True, timeout=5).stdout.strip()
        if dirty:
            sha += "+dirty"
    except Exception:
        sha = "nogit"
    return f"# corpus fingerprint · {n} events · git {sha}  (regenerate: make findings)"
