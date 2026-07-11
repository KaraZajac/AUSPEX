# Data rights and attribution

AUSPEX is a **derived research dataset** — an original curation, doctrine-tagging, and analysis
built on top of public reporting — plus the engine and site code. Rights are **layered**. The
umbrella license for the dataset release is **[CC BY 4.0](LICENSE)** (attribution required, reuse
including commercial permitted); the layers below record where the underlying facts come from and
what each upstream's own terms require.

**The one rule that governs everything here:** AUSPEX publishes *facts and original analysis*, not
third-party content. The copyrighted **source bodies** (vendor report HTML, news articles, PDFs)
are **NOT redistributed** — they live only in the gitignored `atlas/sources/raw/` working
directory; what is committed and published is the source **URL plus a SHA-256 content hash**
(`content_sha256`), an integrity anchor that lets anyone re-fetch and verify a source without AUSPEX
having to re-host it. Facts (dates, victims, techniques, who-attributed-what) are not
copyrightable; AUSPEX re-expresses them in its own schema.

| layer | contents | provenance | terms |
|---|---|---|---|
| **Original contribution** | the event/actor/doctrine/service/target/policy-action YAML records, all doctrine tagging + confidence + perspective coding, the attribution/doctrine engines, verification harness, site, and documentation | this project | **CC BY 4.0** (data + docs); original code additionally offered under **MIT** — see note |
| Actor-identity baseline | actor canonical names, aliases, and `external_refs` (UUID/galaxy pointers) | [MISP galaxy](https://github.com/MISP/misp-galaxy) `threat-actor.json`, adopted as the canonical actor reference | MISP galaxy is **CC0-1.0** (public domain dedication); attribution appreciated |
| MITRE ATT&CK mappings | technique T-codes and tactic references on events/actors | [MITRE ATT&CK](https://attack.mitre.org) | free use **with attribution** per MITRE's Terms of Use; ATT&CK® is a trademark of The MITRE Corporation |
| Government-source claims | attributions, indictments, sanctions, advisories drawn from DOJ, Treasury/OFAC, CISA/FBI/NSA, UK NCSC/FCDO, ANSSI, and allied releases | U.S. and allied governments | U.S. government works are **public domain** (17 U.S.C. § 105); allied releases are official public records — each event cites its own |
| Vendor / journalism-derived facts | dates, victimology, tradecraft, malware families, figures | commercial threat-intelligence reports and news outlets (each cited per-claim) | **facts, extracted and re-expressed** — not the copyrighted text; the source **body is not redistributed** (URL + `content_sha256` only) |
| Source snapshots | `atlas/sources/raw/` (HTML/PDF captures) | the cited publishers, who retain copyright | **NOT redistributed / gitignored**; only the SHA-256 hash is published as an integrity anchor |

**Note on the code license [KARA — confirm].** The `LICENSE` file is CC BY 4.0 and governs the
dataset. If you want the *tooling* (engine, pipeline, site) to carry a permissive software license
instead — the common split for dataset repos is **data CC BY 4.0 / code MIT** — add a `LICENSE-CODE`
(MIT) and say so here. Left as CC BY 4.0 umbrella until you decide.

**Required attribution.** Any work built on AUSPEX should cite the dataset (see
[CITATION.cff](CITATION.cff) and the archival DOI once minted) and, where relevant, the two
structural upstreams it standardizes against: **MISP galaxy** (actor identities) and **MITRE
ATT&CK** (technique taxonomy). Individual factual claims each carry their own source in the record.

**Named individuals.** The corpus names indicted or sanctioned operators. Every named individual
traces to a public indictment, OFAC designation, or court record — public-record data only. No
private-person information is collected or published.

**Scope and disclaimers.** AUSPEX is an analytic atlas of publicly reported events; it contains no
exploit code and no operational tradecraft beyond what the cited public sources already disclose.
It is **unaffiliated** with, and takes no funding from, any government, intelligence service, or
commercial vendor named in the atlas. Research and educational use; nothing here is operational
guidance or a claim of legal culpability beyond what the cited government charging or designation
documents themselves assert.

*Upstream terms change — verify MISP galaxy and MITRE ATT&CK's current licenses before formal
publication; both are recorded above as of 2026-07.*
