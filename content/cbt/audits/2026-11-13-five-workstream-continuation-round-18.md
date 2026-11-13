# EDUKEN CBT — five-workstream continuation round 18 (13 November 2026)

## Verification baseline
Continued from the isolated work branch after Round 17. Re-read the authoritative 45-location work queue, corrected R4 coverage report, proposal-lineage reconciliation, 199-record disposition register and exact cross-window rank crosswalk. No source question, canonical proposal, staging row or live environment was changed.

## Workstream 1 — exact uncovered-target queue
- Parsed the 45-entry queue: **45 headings, 45 unique held pair IDs, zero duplicate IDs**.
- Subject distribution independently matches the corrected coverage report: Government 11, Biology 13, Economics 7, Literature in English 6, Chemistry 4, Physics 3 and Use of English 1.
- Corrected coverage report confirms 161 unique held source locations, 116 distinct proposal target locations, all 116 matching held locations with zero subject mismatches; **45/161 remain without a canonical proposal target**.
- Supplemental drafts do not change this location-based count. No candidate was force-added to the canonical inventory.

## Workstream 2 — proposal lineage and academic approval boundary
- Current canonical inventory: 116 proposals.
- Exact ID reconciliation: 90 match the historical Order 1 set that the owner previously reported as approved; 26 are additional proposals outside that set.
- The historical 90/90 status remains user-reported, not documentary-verified: the repository has no signed item-level decisions, reviewer identity or credentials.
- The 26 additional proposals cannot inherit that reported status. Repository-recorded qualified academic approvals remain **0**.
- All 116 remain drafts; no import or publication is authorized.

## Workstream 3 — duplicate disposition and review-state integrity
Recounted the 199 disposition-register records:
- 90 confirmed semantic-duplicate records;
- 77 confirmed semantic-duplicate records pending qualified subject review;
- 27 assistant-contextual confirmations pending qualified review;
- 4 cluster extensions pending qualified review;
- 1 related-skill variant pending qualified review.

These are relationship records, not 199 unique held locations or replacement targets. Do not use the pair-record total as a target count or approval count.

## Workstream 4 — exact rank and counter reconciliation
Re-parsed the 9 November exact cross-window register/rank crosswalk:
- 184 register-pair mappings resolve to 184 unique candidate ranks.
- 75 mapped ranks are in baseline ranks 1–286; 109 are in ranks 287–1,304.
- The 49-row high-similarity shortlist maps to 49 exact ranks; 16 overlap the 184 register-pair ranks.
- Combined crosswalks therefore represent 217 unique ranks, including 108 in the baseline 1–286 band; **178 baseline ranks remain unrepresented** by these exact pair crosswalks.
- The reported 237 additional targeted reviews still have no exact rank IDs. The 1,007 vs 1,003 cumulative difference and legacy 472/237 and 685/717 conflicts remain unresolved.
- Later persisted tail-review records cover ranks 287–1,304 with explicit pairwise dispositions (1,018 unique ranks), but this does not resolve the baseline lineage. Final reviewed/remaining totals stay null.

## Workstream 5 — CBT tests and release status
- The fetched grading/selection regression cases passed 10/10 in the isolated Node.js harness in Round 17.
- Added a separate exhaustive property harness for the subject-allocation helper: all 35 supported three-subject combinations across question counts 4–180 passed (6,195 combinations); invalid duplicate/missing subjects and out-of-range counts were rejected (2/2 tests passed).
- This remains isolated harness execution, not the repository-wide `npm run test:validation` or GitHub Actions on the work branch.
- PRs #194/#195/#197/#199 remain open, draft and unmerged; previously freshly verified four workflow groups passed on each exact PR head. Those checks do not validate the work-branch changes.
- Authenticated admin/non-admin preview acceptance, full live preview mock-size validation and live AI-assistant POST remain outstanding. The last recorded preview bank contains eight synthetic published samples; no fresh live preview claim is made.

## Round result and safety
All five workstreams were handled together. New verified results: the uncovered queue is exactly 45 unique IDs with the expected subject distribution; the 199 relationship records are reconciled by disposition class; the exact crosswalk still leaves 178 baseline ranks unmapped; and the mock-allocation helper passed 6,195 property combinations plus invalid-input tests. No source question, canonical proposal, R4 staging row, database, Worker, auth/payment setting, production resource or student data was changed. No merge, deployment, import or publication occurred.
