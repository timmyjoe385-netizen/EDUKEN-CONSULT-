# EDUKEN CBT — five-workstream continuation round 14 (13 November 2026)

## Baseline and safety
Started from the verified Round 13 branch checkpoint. Rechecked the current R4 source exports, 45-location queue, canonical 116-item inventory, CBT grading helper, its unit tests, rank reconciliation and open PR status. Work remained confined to the isolated work branch.

## Workstream 1 — replacement coverage
- Drafted one new alternative for **DUP-95 (Chemistry)**, exact held location batch 34 row 21.
- The alternative tests measuring average gas-production rate from change in gas volume over elapsed time, rather than repeating the held question about temperature's effect on reaction rate.
- Screened stem plus options against all **200 Chemistry retained-plus-held source rows** and all **17 Chemistry canonical proposals**.
- Highest source-bank lexical score: **0.386** (a gas-law item; shared “volume” wording but a different assessed concept). Highest proposal score: **0.302** (DUP-39). Neither reached the 0.42 lexical review threshold.
- The bank already includes questions on temperature, catalysts, surface area, pressure, collision theory and reaction order; the inspected bank did not include this experimental volume-change-per-time measurement.
- Saved as a separate draft in `2026-11-13-r4-replacement-draft-batch-6.md`. It is **not** added to the canonical inventory and does not reduce the verified 45-location gap.

## Workstream 2 — inventory integrity
- Canonical inventory remains **116 entries / 116 unique target IDs**.
- All existing entries remain structurally complete based on the prior verified structural audit.
- DUP-95 is kept in a separate supplemental draft file so the canonical target-location reconciliation is not silently changed.

## Workstream 3 — CBT attempt correctness
- Inspected `gradeCbtAttempt` and found that a malformed stored question snapshot containing duplicate question IDs would silently overwrite an earlier entry in its ID map. A submitted answer could then be applied to more than one snapshot row and distort the score.
- Added a defensive rejection for duplicate IDs in the stored attempt snapshot.
- Added a regression test requiring such a snapshot to return invalid with a clear duplicate-ID error.
- The change is confined to the work branch. Source and test were re-fetched and statically checked for the guard and regression case.
- **Execution status:** the current branch has no workflow run. The Playwright workflow is configured for pull requests to specified base branches, scheduled runs and manual dispatch; the build workflow runs on main pushes and pull requests to specified base branches. The work branch is not itself a configured push trigger. The existing successful PR #194/#199 runs are on older, different commit heads and do not validate this new code change. Do not call the new regression test passed until it is executed by CI or a local test runner.

## Workstream 4 — rank and provenance
- Rechecked the latest rank crosswalk limits. 178 ranks in the 1–286 baseline band remain unrepresented by the exact pair crosswalks; 237 reported targeted reviews still have no exact rank IDs.
- The 1,007/1,003 discrepancy and stale 472/237 and 685/717 counters remain unresolved.
- Final reviewed/remaining totals remain null. No reviewer identity, approval or rank completion was inferred.

## Workstream 5 — platform and release
- PR #194 and #199 remain open, draft and unmerged on their previously recorded heads.
- Four workflow groups remain successful on each of those exact PR heads. These results are not transferable to the newer work-branch commits.
- Full mock-size preview tests, live AI-assistant POST and authenticated admin/non-admin walkthrough remain outstanding. No new live preview status is claimed.
- No merge, deployment, database write, import or publication occurred.

## Round result
Round 14 completed across five workstreams. It produced one separately screened Chemistry draft and one defensive CBT grading validation plus regression test. The new code test is pending execution; no passing result is claimed.
