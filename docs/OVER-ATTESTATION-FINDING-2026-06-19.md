# The over-attestation finding — quantifying the `attested`-label defect (2026-06-19)

_Derived from the census pre-pass (`research/QC-PREPASS.{md,json}`, 492 risk-pool events,
deep-fetched + adversarially refuted). This memo is **analysis, not a verification stamp** — no
`qc:` block is written here; the `verified_by: kara` decision stays Kara's. It quantifies the
single largest quality signal the pre-pass surfaced and gives the remediation a defensible shape._

## The one-paragraph finding

The corpus systematically over-uses `confidence: attested` on doctrine links. The schema defines
`attested` strictly — _"the attributing government or vendor **explicitly names the strategic
goal**"_ — but in practice the label was applied wherever a source named the **behaviour** (a
theft, a takedown, a sanction) even when it never named the **goal** the doctrine encodes. Of the
**269 events carrying ≥1 `attested` doctrine link**, the pre-pass judged **168 (62%)** to
over-attest at least one link; those events carry **216 of the corpus's 350 `attested` links
(62%)**. Crucially, **0 of the 350 attested links violate the machine gate** (every one has a
non-null `attesting_source_id`) — so this entire defect class is **invisible to T0/T1** and lives
exactly in the gap the T2 human census exists to close. That is the dissertation point: the gate
proves the *structural* attested rule (a source is cited); only a human can prove the *semantic*
one (the cited source says it).

## Scale and concentration

| metric | value |
|---|---:|
| `attested` doctrine links, corpus-wide | **350** (on 269 events) |
| …with null `attesting_source_id` (gate-catchable) | **0** |
| risk-pool events flagged `overclaimed` on the doctrine check | **178 / 492** (36%) |
| …of which carry ≥1 `attested` link | 168 |
| …pure inferred-side overreach (no `attested` link; a `strongly_inferred` that should be `plausible`) | 10 |
| `attested` links sitting on a flagged event (upper bound on bad links) | **216 / 350** (62%) |

**By doctrine** (attested links on flagged events): `kp/8th-congress-defense-plan` **25**,
`us/ncs-2023` **20**, `ru/sanctions-response-2022` **10**, `kp/byungjin` **10**, `ru/russkiy-mir`
9, `cn/national-intelligence-law-2017` 8, `ir/cyber-deniable-retaliation` 8, `cn/mcf` 8,
`ru/info-security-2016` 8, `cn/mic2025` 6.

**By state:** kp 42 · ru 39 · us 39 · cn 29 · ir 23 · uk 11 · kr 10 · fr 9 · ae 8.

**By year** (flagged events): the defect is concentrated in the **2023–2025 corpus-growth cohort**
— 2024 alone is 45 of 178, and 2023–25 together are 93. This is composition, not drift: the
backfilled long-tail events were doctrine-tagged faster and looser than the original curated core.

## The remediation is smaller than 216 — separate two things the pre-pass conflates

The pre-pass's `overclaimed` verdict bundles two materially different cases. Splitting them is the
most important calibration step before any downgrade, because **only the first is a true defect**:

**(a) GOAL not named — true over-attestation → must downgrade.** The source names only a *weaker
or different* goal than the link claims.
- `2018-01/applejeus-campaign` — link claims "WMD financing"; CISA **AA21-048A** says only
  _"circumvent international sanctions on North Korea."_
- `2022-08/h0lygh0st-ransomware` — claims WMD funding; **AA23-040A** says proceeds support
  _"DPRK national-level priorities and objectives, including cyber operations"_ — a generic goal.
- `2025-02/bybit-safe-wallet` — claims the 8th-Congress plan; the **IC3 PSA** text contains
  **no** WMD-financing language at all.
- `2023-03/3cx-supply-chain` — claims WMD financing; **Mandiant** names only crypto/fintech
  targeting.

**(b) GOAL named, doctrine LABEL not named — defensible under the schema → keep `attested`,
tighten reasoning.** The schema bar is _names the **goal**_, not _names the AUSPEX doctrine
slug_. Where the source explicitly states the goal the doctrine encodes, the literal absence of
"8th Congress" / "Office 39" is not disqualifying.
- `2022-05/treasury-blender-mixer-sanction` — Treasury: _"generate revenue for its unlawful
  weapons of mass destruction (WMD) and ballistic missile programs."_ Goal named verbatim.
- `2026-01/state-dept-dprk-msmt-consolidation` — State MSMT: _"These activities generate revenue
  for the DPRK's unlawful weapons of mass destruction (WMD) and ballistic missile programs."_
- `2025-11/treasury-dprk-bankers-laundering` — Treasury names _"fund the regime's nuclear weapons
  program."_

**Implication.** The headline "78 downgrade-confidence" (and the broader 216) overstates the true
correction. A meaningful share of the DPRK and `ir/sanctions-evasion` links are case (b): the goal
is on the page, only the slug is not. The defensible disposition for those is **keep `attested`,
rewrite the link reasoning to quote the goal the source actually states** (and, if desired, record
that the doctrine slug is an AUSPEX mapping of that goal). Recommend re-tagging every flagged
attested link as **(a) downgrade** vs **(b) keep+tighten** before editing — the split is the
finding's real deliverable.

## Failure-mode taxonomy

Each flagged link reduces to one of these. Modes 1–4 are *attestation* defects; 5 is an
*evidence-resolution* defect; 6–7 are *reasoning-integrity* defects that ride along with an
attested label.

1. **Goal-gradient inflation** — source states a weaker/adjacent goal (sanctions evasion, "revenue
   for the regime", "national priorities"), link asserts the stronger one (WMD/nuclear financing).
   The dominant DPRK signature. → downgrade to `strongly_inferred`.
2. **Label-vs-goal** — source names the goal but not the doctrine slug. The contestable, often
   **defensible** class (see (b) above). → keep `attested`, tighten reasoning.
3. **Thematic-verb-to-strategy** — generic action verbs ("disrupt and dismantle", "all available
   authorities and tools") mapped to a named strategy the source never names. The entire
   `us/ncs-2023` cluster: DOJ/Treasury/Europol takedown & sanction releases, almost all
   `perspective: defender-response` counter-ops. → downgrade; the strategy is an AUSPEX mapping.
4. **Anachronism** — the cited source *predates* the doctrine and so *cannot* name it:
   `cn/mic2025` attested to a **2014** indictment (MIC2025 announced 2015); `us/defend-forward`
   attested to a 2016 op (doctrine 2018); `us/ncs-2023` attested to pre-2023 actions. → downgrade,
   or re-point to a contemporaneous source (e.g. the 12th-Five-Year-Plan for the 2014 cases).
5. **Dead / non-resolving attesting source** — the `attesting_source_id` returned empty text (DOJ
   indictments at 3 chars, 404 pages, nav-index stubs). Attestation is *unverifiable*, not
   necessarily *wrong*. Many DOJ indictments do name WMD financing once they resolve → **re-fetch
   before deciding** (the blocked Wayback run will rescue a chunk of these). But several notes warn
   DOJ press releases "typically don't name the strategy" even at full text — those collapse to
   mode 3.
6. **Unsupported reasoning premise (mis-paraphrase)** — the link reasoning quotes or paraphrases
   the source asserting a fact it does not contain: Wray's testimony "does NOT contain the word
   [Taiwan]"; the Albania Treasury release contains no "MEK"/"Mujahedin"; the Conti self-attestation
   the reasoning leans on never loaded. The attribution may be sound; the *attestation quote* is
   invented or mislocated. → fix reasoning; re-assess label against what the source actually says.
7. **Wrong source tier / false self-attestation** — a journalist paraphrasing an official treated
   as a government "self-attestation" (`2023-10/al-kuwaiti-gitex…`, AGBI tertiary outlet); a
   Wikipedia nav-sidebar token treated as body attestation (`2018-01/mossad-iran-nuclear-archive`).
   → re-point to the primary, or downgrade.

## Adjacent finding (different defect class, same pass): predicate failure

A distinct cluster — **not** over-*attestation* — surfaced on `ru/sanctions-response-2022`'s
"tolerated criminal-proxy" links (Play, Trigona, Storm-1811, BlackSuit). These are already labelled
`plausible`/`strongly_inferred`, so the *confidence* is honest; the problem is the doctrine link's
**precondition** — a Russia-state nexus — is itself unestablished in the cited source ("financially
motivated", no Russia attribution). The doctrine is hung on an attribution the evidence doesn't
carry. Worth a separate worklist line: these need the Russia predicate sourced *or* the doctrine
link dropped, independent of the confidence label.

## Why this is the strong viva answer, not a weakness

The machine gate enforces `attested ⇒ attesting_source_id present` and passes 350/350. This finding
is the empirical demonstration that the *structural* check cannot reach the *semantic* claim — which
is exactly the documented rationale for the T2 human census (`docs/CORPUS-VERIFICATION-PLAN.md`).
Reported honestly, it reads: _"Our integrity gate guarantees every strong evidentiary claim cites a
source; our human census found that 62% of those citations, in the high-risk pool, over-stated what
the cited source says, dominated by a goal-gradient inflation on DPRK WMD-financing and a
verb-to-strategy mapping on the US National Cybersecurity Strategy — corrected as follows."_ That is
a calibration story, and it is stronger than an unverifiable claim of having eyeballed everything.

## Resolution adopted (2026-06-19)

The `attested` definition is **redefined in place** to the WHY-ladder above — `attested` =
*authoritative source states the strategic purpose in substance* (goal-level, slug-optional,
attributing-authority's assessment not perpetrator confession). This is now the authoritative
rubric in [`SCHEMA.md`](SCHEMA.md) (doctrine-link confidence) and `research/SCHEMA.md`. A new
**optional** `inference_basis` field on `doctrine_links` (in `audit/schemas/atlas.schema.json`,
gate-green: 2,942/2,942 still conform) makes each WHY-claim auditable — `source_quote`+`source_id`
for attested, `signals`+`ruled_out` for strongly_inferred, `alternatives` for plausible —
backfilled over time. **This must be locked before the `v1.0-dissertation` freeze**, since the
pre-registration's tagging rules reference the attested definition.

## The re-grade worklist — `research/ATTESTED-REGRADE-WORKLIST.md`

Assistive triage of all 178 flagged events against the new ladder (heuristic from the pre-pass
notes; **no labels edited, no `qc:` stamp written**). The "216 suspicious links" resolves to:

| bucket | events | disposition |
|---|---:|---|
| **R — re-fetch first** | 64 | attesting source returned empty/dead text; undecidable until resolved (the blocked Wayback run rescues many) |
| **a — downgrade** | 74 | goal not named (only behaviour / weaker goal) → `attested → strongly_inferred` |
| **F — fix reasoning** | 14 | reasoning asserts a quote/fact absent from the source |
| **M — split per-link** | 11 | one link honest (goal named), another overclaimed — grade each separately |
| **Z — inferred-side overreach** | 10 | no attested link; a `strongly_inferred` that should be `plausible` |
| **C — re-point source** | 3 | anachronism: cited source predates the doctrine |
| **b — keep + add quote** | 2 | goal named in substance, slug absent → stays `attested`, add `source_quote` |

**The headline correction is smaller than it first looked.** 64 of 178 (36%) are blocked on
source-resolution, not genuine over-attestation — so **re-fetching is the highest-leverage next
step**, not downgrading. The true confirmed-downgrade core is ~74 (plus the overclaimed halves of
the 11 mixed) — close to the original "78 downgrade-confidence" headline, but now with the
defensible-keep, re-fetch, and reasoning-fix sets carved out and routed.

## Order of operations

1. **Re-fetch the R bucket (64)** once archive.org throttling clears (`archive-sources.ts --save`),
   then re-run the doctrine check on just those — several resolve to genuine attestations.
2. **Work b/M (13):** keep `attested`, add the `source_quote` to `inference_basis`.
3. **Apply a downgrades (74):** `attested → strongly_inferred`, with the proximate-goal quote in
   `inference_basis.signals`; re-run `gate.sh` (stays green — none of this touches FK/enum/structure).
4. **C/F/Z (27):** re-point anachronistic sources, fix mis-paraphrased reasoning, soften the
   inferred-side overreach.
5. **Hold the line on stamping:** none of the above writes `verified_by: kara` — that is the
   separate human pass over `research/QC-PREPASS.md`.
