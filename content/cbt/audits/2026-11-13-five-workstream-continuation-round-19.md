# EDUKEN CBT — five-workstream continuation round 19
Date: 13 November 2026

## Scope and current-state verification
The active audit branch was re-read from GitHub. Its exact head before this round was `46785eaa9a64e23db99c06bc4ee59875a458f09d` (Round 18). The latest PR snapshots were fetched directly:
- PR #194: `feat/cbt-subject-combination-reconciled`, head `6ab3e4f018e9d21f95b3d306ea5720b9be5564e6`, open, draft, unmerged.
- PR #195: `fix/cbt-practice-available-counts`, head `e58978c4e81d6bc9bfe39760881f2a53320db973`, open, draft, unmerged.
- PR #197 and #199 remain open, draft, unmerged (latest snapshots retained from prior checkpoint; no new workflow result is asserted here).
The audit branch is separate from main. No merge, deployment, production data/configuration change, import or publication was performed.

## Workstream 1 — replacement coverage
The latest authoritative R4 coverage remains 116 unique proposal targets matched to 116 distinct held locations out of 161; 45 held locations remain uncovered. The two retained alternatives DUP-147 (Chemistry) and DUP-226 (Biology), plus the earlier nine draft candidates, remain outside the canonical inventory. No candidate was promoted or imported in this round.

## Workstream 2 — content quality
The seven construction/concept-variety flags remain open: Economics DUP-228 and DUP-109; Government DUP-102, DUP-221, DUP-104 and DUP-123; Literature DUP-59/DUP-232. No qualified academic reviewer is available to the project owner. Assistant checks therefore remain supplemental and no draft is relabelled academically approved.

## Workstream 3 — bank coverage and uniqueness
R4 source coverage remains 1,600 source rows, exactly 200 per subject, provisionally split into 1,439 retained and 161 held. The canonical replacement inventory remains 116. This round did not alter source CSVs, retained/held staging, canonical proposals or the production question bank. Structural validity and exact-stem scans are not subject-expert approval.

## Workstream 4 — disposition, provenance and rank
Round 18's reconciled register totals remain the current checkpoint: 199 relationship records (90 confirmed semantic-duplicate records; 77 confirmed semantic-duplicate records pending qualified review; 27 assistant-contextual confirmations pending qualified review; 4 cluster extensions pending qualified review; 1 related-skill variant pending qualified review). These are relationship records, not 199 unique held rows.
The exact crosswalk still maps 217 unique ranks across the 184 register mappings and 49-row shortlist (16 overlaps); 178 baseline ranks in 1–286 remain unrepresented by these exact pair crosswalks. The reported 237 targeted reviews still lack exact rank IDs; 1,007/1,003 and legacy 472/237 and 685/717 counter conflicts remain unresolved. Final aggregate totals remain null.

## Workstream 5 — platform integration and release readiness
### Confirmed integration conflict
Direct file inspection confirms PR #194's `src/CbtPage.tsx` deliberately disables all local sample fallback when the published API is empty or unavailable. It reports the empty/unavailable state and prevents starting a student attempt without published questions.
PR #195's version of the same file reintroduces local sample questions on empty/error responses and enables local attempts. Its tests explicitly expect this behaviour. That conflicts with the PR #194 safety requirement and must not be copied.

### Safe integration specification
The useful PR #195 changes can be selectively retained without its local-fallback policy:
1. Keep PR #194's published-only/no-local-fallback behaviour and its empty/error regression tests.
2. Keep availability-aware practice counts derived only from actually published questions.
3. Keep availability-aware mixed-mock options only when the exact per-subject published inventory can satisfy the requested allocation.
4. Keep the 10-question default and the 180-question/120-minute full-mock duration helper.
5. Add the four-question starter only when one published question exists for each of the four selected subjects; the server must enforce the same published-only rule and use a four-minute timer for this starter.
6. Repair the PR #194 180-question browser fixture: its current test seeds only one question per subject while expecting a 180-question option. The fixture must seed 60 English and 40 for each of the three selected subjects before asserting that the option is available. A four-question fixture must seed one per subject. Do not weaken availability assertions to make the test pass.
7. Do not port PR #195's tests that expect local fallback when the published bank is empty or unavailable.

The two PRs' `src/CbtPage.tsx`, API handler, package and E2E files overlap. No code patch was made in this round because a selective port must be applied and tested as one coherent change; a partial UI-only change could expose counts the server cannot satisfy. The previous failed patch attempts remain unapplied.

### Verification boundaries
The PR #194 and #195 snapshots are confirmed, but this round did not run repository-wide tests or GitHub Actions. The isolated helper harness results from Round 18 remain separate from CI. No authenticated preview admin/non-admin walkthrough, complete live mock-size acceptance or live AI-assistant POST is newly claimed. Production remains untouched.

## Round result
All five workstreams were consolidated into one current-state pass. The platform blocker is now specified precisely: retain PR #194's safety model, selectively port only PR #195's availability/count/timer logic, and correct test fixtures to match real published inventory. The question-bank and academic gates remain honestly held. No merge, deployment, database write, source-bank edit, question import or publication occurred.
