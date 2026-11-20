# EDUKEN CBT — paired execution update
Date: 18 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
PR: #194

## Workstream A — slow-network acceptance test added

Commit: `709cfd7ac2275a18beaa1f49645ab2c0e655a5cb`

Added a Playwright test in `tests/e2e/cbt.spec.js` that runs at a 375×812 viewport and delays both published-question and availability responses by 1.2 seconds. It asserts:

- the student sees the published-bank checking state while requests are pending;
- practice buttons remain disabled until both responses arrive;
- the practice controls become enabled only after a valid published question and verified subject availability arrive;
- the mobile viewport has no horizontal overflow after loading.

This is a deterministic latency simulation, not a full radio/3G packet-loss or bandwidth-throttling test. It does not change application behavior or production configuration.

CI triggered on this commit:
- Playwright browser checks: run `44411008791`
- Build check: run `44411008797`
- Build and preview deployment: run `44411008948`
- Wallet migration SQL integration: run `44411011535`

At the time this note was written, these runs were in progress. No pass is claimed until their completed results are inspected. Production deploy remains prohibited/skipped.

## Workstream B — baseline evidence recovery, read-only

A fresh recursive Git tree inventory was performed at this commit. It returned 92 paths matching rank/baseline/cross-window terms under `content/cbt`, including the complete persisted tail review set (parts 2–83), the candidate list, the disposition register, the baseline crosswalks and the high-similarity review.

The authoritative records were re-read:
- `2026-11-08-cross-window-baseline-rank-crosswalk-r2.json`
- `2026-11-09-cross-window-register-rank-crosswalk.json`
- `2026-11-06-cross-window-rank-reconciliation-r1.json`
- `cross-window-tail-review-2026-11-06-part63.json`

Findings remain consistent:
- 1,304 candidate pairs in the source set.
- 1,018 explicit tail ranks, 287–1,304.
- 217 unique exact pair-crosswalk ranks, including 108 in baseline ranks 1–286.
- 178 baseline-band ranks are not represented by those pair crosswalks.
- The reported 237 targeted reviews still have no exact rank IDs or endpoint list.
- Part63 records 14 newly reviewed ranks (625–629 and 631–639), one previously registered rank (630), and a persisted counter movement from 993 to 1,007. The separate baseline-plus-earlier-tail derivation is 1,003, leaving four unexplained records.
- Historical counter conflicts 472 versus 237 and 685 versus 717 remain unresolved.

The recursive repository inventory did not reveal a separate item-level baseline review ledger or source note that maps the 237 targeted reviews to exact candidate ranks. The 8 November crosswalk explicitly marks those exact IDs as null; this is not a basis for inferring the missing ranks.

No review rank IDs, decisions, or counter values were created or changed. No question data, staging rows, academic approvals, imports, publications, production resources, or release settings were changed.

## Current disposition

- Slow-network acceptance test: added; CI result pending.
- Baseline evidence recovery: repository search exhausted for relevant tracked file paths; original external/source ledger is still required to identify the 237 exact ranks and reconcile the four-count discrepancy.
- PR #194 remains open, draft and unmerged.
- Production remains untouched.
