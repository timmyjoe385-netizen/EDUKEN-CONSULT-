# EDUKEN CBT — five-workstream continuation report (13 November 2026)

## Safety boundary
- Branch: `work/cbt-r4-next-replacement-drafts-20261112`.
- This is a non-destructive continuation of the existing R4 work.
- No source CSV, staging CSV, canonical proposal inventory, database, Worker, payment/auth setting or production configuration was changed.
- No question was imported or published. No PR was merged and no production deployment was performed.
- No qualified academic reviewer is available to the owner. Assistant checks below are internal QA only; qualified academic approvals remain **0**.

## Workstream 1 — correct the seven flagged question constructions
The existing non-canonical revision proposal file `2026-11-11-proposed-replacement-draft-revisions.json` was inspected in full. It already contains draft-only rewrites for:
- Economics: DUP-228 (capital flight) and DUP-109 (recession).
- Government: DUP-102 (Commonwealth), DUP-221 (caretaker government), DUP-104 (electoral college), and DUP-123 (political ideology).
- Literature: DUP-232 is explicitly held because its proposed epithet item overlaps DUP-59.

All seven rewritten/held records have four options where a rewrite is supplied, and each rewritten record has a valid A–D key. These are proposals only; no canonical inventory or source bank row was replaced. The existing source targets were checked against R4 held CSVs: DUP-228 batch 15 row 28; DUP-109 batch 17 row 27; DUP-102 batch 18 row 32; DUP-221 batch 18 row 35; DUP-104 batch 18 row 36; DUP-123 batch 20 row 33; DUP-232 batch 34 row 37. The source target locations are distinct from the proposed replacement concepts and remain held pending review.

## Workstream 2 — rescreen revised stems against all 1,600 R4 rows
The four retained and four held CSV exports were parsed: **1,600 valid question rows**, exactly **200 per subject**. All eight rewritten stems in the existing revision file were compared only with same-subject source-bank stems using character-trigram Dice similarity. Highest matches:

| Draft | Highest same-subject match | Score |
|---|---|---:|
| DUP-87 | batch 40 row 3 — arson vocabulary | 0.276 |
| DUP-78 | batch 20 row 4 — punctuation in lists | 0.328 |
| DUP-228 | income-inequality measure | 0.266 |
| DUP-109 | income-inequality measure | 0.252 |
| DUP-102 | batch 04 row 35 — constitutionalism | 0.562 |
| DUP-221 | batch 20 row 34 — permanent administrative organisation | 0.422 |
| DUP-104 | batch 34 row 33 — electoral ward | 0.491 |
| DUP-123 | batch 05 row 35 — political legitimacy | 0.395 |

The 0.42 threshold is a lexical review trigger, not proof of duplication. DUP-102, DUP-221 and DUP-104 therefore remain flagged for a manual conceptual comparison; the visible top matches test different stated concepts, but this automated screen cannot certify uniqueness. The other five revised stems did not reach 0.42 against same-subject source stems. Proposal-to-proposal comparisons also remained below 0.42 for these rewrites. No item is marked academically cleared.

## Workstream 3 — Literature concept-variety hold
DUP-232 remains excluded from the retained revision set because the proposed epithet-definition item overlaps the existing DUP-59 epithet example. Its held source row (batch 34 row 37) is a separate source target about catastrophe in classical tragedy; the proposal's epithet overlap is a replacement-draft collision, not evidence that the source target itself is an epithet duplicate. Keep the source target held and prepare a distinct Literature replacement only after checking the current bank and proposal inventory. No speculative substitute was added.

## Workstream 4 — exact source and inventory reconciliation
- R4 held CSV exports contain 161 rows; the seven revised target IDs resolve to their exact held locations as listed above, with subject agreement.
- The revision file is separate from the canonical 116-proposal inventory. It must not be counted as added target coverage.
- The corrected canonical coverage remains **116/161** held locations, leaving **45** uncovered. The 11 earlier draft-only alternatives and these editorial revisions do not alter that canonical count.
- No change was made to the 45-location queue or canonical inventory.

## Workstream 5 — provenance, rank reconciliation and platform status
- Historical approval lineage remains limited to the owner's earlier report for 90 IDs; signed item-level evidence and reviewer identity/credentials are absent. The 26 additional proposals cannot inherit that report. Qualified academic approvals recorded: **0**.
- Cross-window rank reconciliation remains unresolved: ranks 287–1,304 have explicit tail dispositions, but the 286 baseline ranks and the 237 reported targeted reviews still lack an exact rank crosswalk; the 1,007 versus 1,003 counter discrepancy remains. Final reviewed/remaining totals stay null/unverified.
- PR #194 remains open/draft/unmerged at `6ab3e4f018e9d21f95b3d306ea5720b9be5564e6`; its four recorded workflow groups (build, wallet SQL, Playwright browser, build/Cloudflare deploy) completed successfully.
- PR #199 remains open/draft/unmerged at `aea774e0e90955e4425bca7a4edfe072a5a3ccf5`; its four recorded workflow groups completed successfully. Its admin-search/audit Playwright tests use mocked auth/API and do not satisfy real authenticated preview acceptance.
- The five-workstream audit branch itself has no PR-triggered workflow runs recorded for its documentation-only head. No claim of a fresh full application test or authenticated admin walkthrough is made.

## Result and next safe action
This round completed five consolidated review workstreams: editorial corrections, 1,600-row lexical rescreen, Literature collision hold, exact target reconciliation, and provenance/rank/platform checks. The revised drafts remain separate, unpublished proposals. Next work should resolve the three lexical review flags through explicit concept-by-concept comparison, create a distinct non-overlapping Literature alternative only if one can be grounded, and continue the 45-target coverage work without force-filling slots. Keep all questions draft-only; production remains locked.
