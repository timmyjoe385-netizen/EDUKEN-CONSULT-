# EDUKEN CBT — execution checkpoint (13 November 2026)

## Execution boundary
- Work continued on `work/cbt-r4-next-replacement-drafts-20261112`, separate from `main`.
- Current work-branch head before this checkpoint: `d1538d9fde735721d857f7c158c386d82b569fd6` (`docs(cbt): record owner-led draft bank cross-check`).
- No merge, production deployment, production database change, question import, question publication, payment/auth change or production configuration change was performed.
- No academic reviewer is available to the project owner at this time. This is treated as a real constraint, not as a reason to fabricate approvals or claim assistant QA is independent review.

## Latest platform verification
### PR #194
- Current PR head: `6ab3e4f018e9d21f95b3d306ea5720b9be5564e6`.
- Latest commit adds `pragma` to the Edge Function CORS allow-header list.
- Four current-head workflow groups completed successfully: build check, wallet migration SQL integration, Playwright browser checks, and build/Cloudflare deployment workflow.
- This supersedes the 11 November checkpoint's pending/failed preview-smoke status for the earlier PR head. The current recorded workflow results are green.
- This does not itself prove a fresh authenticated administrator walkthrough or academic approval. Production remains untouched.

### PR #199
- Current verified head: `aea774e0e90955e4425bca7a4edfe072a5a3ccf5`.
- Four current-head workflow groups completed successfully: build check, wallet migration SQL integration, Playwright browser checks, and build/Cloudflare deployment workflow.
- Admin-search/audit Playwright coverage still uses mocked authentication/API. It does not replace real isolated-preview admin/non-admin acceptance.

### PR #197 and PR #195
- Prior checkpoint records their automated checks passing. No newer head-level workflow evidence was retrieved in this execution; do not extend those results to a different head.

## Question-bank / content boundary
- R4 source bank remains 1,600 rows: 1,439 provisionally retained + 161 held, exactly 200 per subject.
- The canonical replacement inventory remains 116 proposals, covering 116 of 161 held source locations by explicit target-location crosswalk; 45 held locations remain without a proposal target. Non-canonical draft alternatives remain separate and do not increase this coverage count.
- The 12 November owner-led cross-check records two additional retained-bank comparisons (DUP-147 Chemistry/burette and DUP-226 Biology/crossing-over) and related-topic cautions for earlier drafts. These are draft-only findings.
- Qualified academic approvals recorded: 0. Do not promote, import or publish any question on the basis of assistant QA, lexical similarity scores or owner-led comparison alone.
- Cross-window rank reconciliation remains unresolved; final reviewed/remaining totals must remain null/unverified rather than being inferred.

## Next safe execution
1. Continue non-destructive source-bank comparisons and draft-only content QA against all 1,600 source rows and current proposal inventory.
2. Keep new proposals in a separate draft queue until exact target IDs, source provenance, option/key validity, full-bank similarity results and related-topic cautions are recorded.
3. Do not label any draft academically approved. With no qualified reviewer available, the bank can remain in internal draft/preview status; release readiness cannot be claimed.
4. Keep platform PRs open/unmerged and production deployment/import/publication disabled until the owner explicitly authorizes release and the remaining acceptance/review gates are genuinely satisfied.


## Additional replacement-coverage execution — 13 November 2026

The latest consolidated draft pass was re-read against the 45-location uncovered queue and the existing batch reports.

- The consolidated pass assessed the remaining 26 targets identified after the prior draft batches.
- Two alternatives were retained as draft-only candidates: DUP-147 (Chemistry, burette function) and DUP-226 (Biology, crossing-over mechanism).
- Twenty-four alternatives were held rather than force-filled because the existing subject bank or proposal inventory already covered the concept, or a distinct syllabus-appropriate alternative was not established.
- Earlier batch reports also retain draft-only alternatives for DUP-215, DUP-128, DUP-165, DUP-133, DUP-108, DUP-96, DUP-151, DUP-110 and DUP-169; rejected alternatives remain explicitly excluded.
- This is progress on the uncovered-target queue, not completion of the entire replacement programme. The canonical 116-proposal inventory and R4 staging files remain unchanged; target coverage remains 116/161 by the explicit target-location crosswalk, with 45 held locations still uncovered.
- The consolidated report's two retained candidates and 24 held targets do not create academic approvals. Qualified academic approvals remain 0.
- No source CSV, staging CSV, canonical inventory, database, Worker, payment/auth configuration or production setting was changed. No question was imported or published.


## Five-workstream execution round — 13 November 2026

This round was executed as five parallel review workstreams rather than one-item-at-a-time batches.

### Workstream 1 — held-target coverage reconciliation
Re-read the corrected location-based coverage report. It verifies 116 of 116 proposal target locations match distinct held source locations, with zero subject mismatches. The remaining gap is 45 held locations. The corrected count is 116/161, not the superseded 117/161 interpretation.

### Workstream 2 — proposal content QA
Re-read the cross-subject QA of all 116 proposals. Seven high-priority construction/concept-variety issues remain flagged: Economics DUP-228 and DUP-109; Government DUP-102, DUP-221, DUP-104 and DUP-123; Literature DUP-59/DUP-232 overlap. Additional syllabus/jurisdiction review flags remain. These issues are not silently treated as fixed.

### Workstream 3 — provenance and approval lineage
Re-read the lineage reconciliation: 90 proposals match the owner-reported historical approval set, but signed item-level evidence, reviewer identity and credentials are absent from the repository; 26 proposals are outside that historical set and cannot inherit its reported approval. Qualified academic approvals recorded in the repository remain 0.

### Workstream 4 — uncovered replacement queue
Re-read the consolidated pass for the 26 targets assessed after the earlier batches: two draft-only alternatives retained (DUP-147 and DUP-226), 24 held rather than force-filled. Earlier batches contain nine other retained draft alternatives. These 11 candidates remain outside the canonical 116-item inventory; canonical coverage remains 116/161 by the explicit target-location crosswalk, with 45 held locations still uncovered. The 45-target queue is not complete.

### Workstream 5 — platform and release safety
Rechecked PR #194 and #199: both remain open draft PRs; all four recorded workflow groups on each inspected head completed successfully. Mocked admin Playwright tests do not prove real authenticated preview acceptance. No merge, production deployment, import, publication, database write or production configuration change was performed.

### Round result
All five review workstreams completed as non-destructive repository checks and checkpoint reconciliation. No unresolved issue was relabelled as complete. Next execution should continue across five workstreams, prioritising draft-only correction of the seven question-construction flags, exact target/proposal reconciliation for the uncovered queue, bank-wide uniqueness checks, provenance/rank reconciliation, and isolated-preview acceptance evidence. Production remains locked pending explicit owner approval.


## Five-workstream continuation round 2 — 13 November 2026

- The three Government lexical flags (DUP-102, DUP-221, DUP-104) were compared conceptually with their top same-subject lexical matches. The concepts differ (Commonwealth vs constitutionalism; caretaker government vs permanent administration; electoral college vs electoral ward). They remain draft-only and not academically approved.
- The full Literature bank and 14 Literature proposals were inspected. DUP-232 remains held because its epithet proposal overlaps DUP-59; no safe distinct substitute was established.
- Coverage reporting was reconciled to the explicit target-location crosswalk: **116/161**, 45 uncovered. Older 104/161 checkpoint text is stale and corrected above.
- Rank reconciliation remains unresolved only for the exact baseline/targeted review crosswalk and four-count discrepancy; ranks 287–1,304 have explicit dispositions. Aggregate totals remain null.
- PR #194 and #199 remain open/draft/unmerged; their previously verified four workflow groups each passed. Authenticated preview acceptance remains outstanding. Production remains untouched.
- Detailed report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-2.md`.


## Five-workstream continuation round 3 — 13 November 2026

- Explicit target-location coverage reconfirmed at **116/161**, with 45 uncovered. The earlier 117/161 relationship-based interpretation is superseded because it counted a cluster relationship rather than a distinct proposal target.
- Reviewed all uncovered-target draft-batch reports and the consolidated pass. Twelve distinct uncovered targets have at least one recorded draft candidate; 33 of the 45 have no retained candidate in the reviewed reports. Drafts remain outside the canonical 116-item inventory.
- Revalidated the canonical proposal JSON structure: 116 unique target IDs; no missing core fields; four distinct non-empty options and A–D key per proposal. Structural checks are not academic approval.
- Seven known construction/concept-variety flags and other syllabus/jurisdiction cautions remain open. Rank reconciliation remains unresolved; aggregate totals stay null.
- Preview evidence remains one-question practice/API lifecycle only; the eight-sample preview bank cannot support full mocks. Authenticated admin/non-admin and live AI-assistant acceptance remain outstanding.
- PR #194 and #199 remain open/draft/unmerged at previously inspected heads, with four recorded workflow groups passed on each. No merge or production deployment.
- No manual action was needed for this audit round. A later authenticated preview acceptance test will require the owner to sign in through the isolated preview site; never send passwords or authentication codes in chat.
- Production, source CSVs, canonical inventory, staging CSVs, databases and Worker configuration remain unchanged. No questions imported or published. Qualified academic approvals remain 0.
- Detailed report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-3.md`.


## Five-workstream continuation round 4 — 13 November 2026

- Reconfirmed branch and PR evidence: #194 and #199 remain open, draft, unmerged and mergeable. Their four recorded workflow groups each passed on the exact inspected PR head; the newer audit-only branch head has no PR-triggered workflow runs.
- Reconciled the 45-location queue without changing canonical target coverage: 116/161, 45 uncovered. Twelve uncovered targets have at least one recorded draft candidate; 33 have no retained candidate in reviewed reports. Two alternatives from the consolidated pass remain draft-only (DUP-147 Chemistry and DUP-226 Biology); 24 assessed targets were held.
- Rechecked semantic exclusions: DUP-112 overlaps proposal DUP-61; DUP-212 overlaps proposal DUP-62. DUP-147 remains a draft-only burette-function alternative, not an academic approval.
- Rank/provenance gaps remain open: baseline ranks 1–286 and 237 targeted reviews lack complete exact crosswalk evidence; 1,007 versus 1,003 cumulative discrepancy unresolved; no complement inferred. Qualified academic approvals remain 0.
- Preview acceptance remains incomplete: eight sample questions only; authenticated admin/non-admin walkthrough and live AI-assistant POST outstanding. No owner action required for this audit round; future preview acceptance requires owner sign-in on isolated preview.
- No source questions, canonical inventory, staging, database, Worker, auth/payment settings or production resources changed. No import, publication, merge or deployment.
- Full report: [Round 4 five-workstream continuation](2026-11-13-five-workstream-continuation-round-4.md).


## Five-workstream continuation round 5 — 13 November 2026

- Rechecked the 6 November cross-window tail review: five full-content semantic pairs at ranks 291, 293, 304, 308 and 319; that historical checkpoint records 291 manually reviewed and 1,013 remaining then.
- Rechecked 6 November holdout index/delta: 28 new pair candidates + six unique cluster extensions; two reused held rows excluded; 34 new held locations. Rank span 565–909. Source/staging join audit records 56/56 pair locations and 8/8 extension locations checked, 34 held locations joined, 34 anchors present, and 1,476 retained + 124 held = 1,600 with no overlap.
- These dated records are from the earlier branch and do not close the current rank crosswalk. Baseline ranks 1–286, 237 targeted reviews, and 1,007 vs 1,003 discrepancy remain unresolved.
- Identified the 10 November structural report's 104/161 coverage statement as historical/older-branch evidence predating later additions. Current basis remains 116/161 and 45 uncovered; do not quote 104/161 as current.
- Order 1's 90/90 is assistant preliminary review, not independent approval; 0/90 qualified approvals. It is a separate earlier set and cannot approve R4 proposals. R4 qualified academic approvals remain 0.
- PR #194/#199 remain open/draft/unmerged; four workflow groups passed on each inspected PR head. Preview still lacks authenticated admin/non-admin walkthrough and live AI POST; eight sample questions cannot validate full mocks.
- No question content, canonical inventory, staging CSV, database, Worker, auth/payment configuration or production resource changed. No import, publication, merge or deployment.
- Full report: [Round 5 five-workstream continuation](2026-11-13-five-workstream-continuation-round-5.md).


## Five-workstream continuation round 6 — 13 November 2026

- Re-read the corrected R4 location-based coverage: 116/161 unique held locations have explicit proposal targets; 45 remain uncovered (Biology 13, Government 11, Economics 7, Literature 6, Chemistry 4, Physics 3, Use of English 1). ID equality alone is not a valid target-location match.
- Re-read the consolidated 26-target pass: two draft alternatives retained for owner review (DUP-147 Chemistry; DUP-226 Biology); 24 targets held due bank/proposal conceptual overlap or insufficient distinction. DUP-112 vs DUP-61, DUP-212 vs DUP-62, and DUP-103 price-discrimination overlap remain exclusions.
- Canonical inventory remains 116 structurally complete proposals; seven known construction/concept-variety flags and additional syllabus cautions remain open. Proposed editorial revisions remain separate and have not been applied to canonical inventory. Qualified academic approvals: 0.
- Clarified staging snapshots: 6 Nov = 1,476 retained + 124 held; 10 Nov R4 = 1,439 retained + 161 held. Distinct revisions; do not combine their counts.
- Cross-window rank reconciliation remains open: baseline ranks 1–286 incomplete exact crosswalk; 237 targeted reviews lack exact rank lists; 1,007 vs 1,003 and stale register conflicts unresolved. Final reviewed/remaining totals remain null.
- Re-fetched exact PR-head workflows: PR #194 head `6ab3e4f018e9d21f95b3d306ea5720b9be5564e6` and PR #199 head `aea774e0e90955e4425bca7a4edfe072a5a3ccf5` each have all four workflow groups completed successfully. Both PRs remain open/draft/unmerged. Authenticated preview walkthrough and live AI POST still outstanding; eight synthetic questions cannot validate full mock modes.
- No source/canonical/staging/database/Worker/auth/payment/production changes; no import, publication, merge or deployment.
- Full report: [Round 6 five-workstream continuation](2026-11-13-five-workstream-continuation-round-6.md).


## Continuation round 7 — 13 November 2026
- Verified branch before work at `71a5a908d0338aa22b00dabbcf8ba5c8af1c05ac`; round report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-7.md`.
- Re-opened the four R4 retained CSV exports, four held CSV partitions, canonical 116-proposal JSON, proposed editorial revisions, owner-led cross-check, 45-target queue and rank crosswalks.
- Current R4 remains 1,439 provisionally retained + 161 held = 1,600; 116 canonical target locations covered; 45 held locations without a canonical proposal target (Biology 13, Government 11, Economics 7, Literature 6, Chemistry 4, Physics 3, Use of English 1). Twelve uncovered locations have recorded candidate drafts; 33 have no retained candidate.
- Six proposed stem repairs remain non-canonical: Economics DUP-228/DUP-109 and Government DUP-102/DUP-221/DUP-104/DUP-123. Literature DUP-59/DUP-232 overlap remains open. Related syllabus/jurisdiction flags remain open; no new proposal was force-added.
- DUP-147 Chemistry and DUP-226 Biology remain draft alternatives only. Related-topic candidates remain subject to explicit learning-outcome review. Qualified academic approvals remain 0.
- Rank crosswalk limitations remain: 178 baseline ranks in 1–286 unrepresented by the explicit pair crosswalks; 237 targeted reviews lack exact rank lists; 1,007 vs 1,003 and stale 472/237 and 685/717 conflicts unresolved. Final reviewed/remaining totals remain null.
- Re-fetched exact PR #194 and #199 heads and workflows. Four workflow groups passed on each head; both PRs remain open/draft/unmerged. This does not replace authenticated preview acceptance.
- Last recorded preview evidence is isolated to test Supabase and separate analytics D1, with eight synthetic questions only. Full mocks, live AI POST and authenticated admin/non-admin walkthrough remain unverified/outstanding. No fresh live preview check was claimed.
- Round 7 changed only this audit report and checkpoint. No source/canonical question, staging row, database, Worker, auth/payment config or production resource changed. No import, publication, merge or deployment. No manual action was needed this round.


## Continuation round 8 — 13 November 2026
- Verified branch before work at `caf8398ab7279458e6b53b08cb20f5bbe85c6486`; round report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-8.md`.
- Reviewed all eight separate proposed editorial revisions: Use of English DUP-87/DUP-78; Economics DUP-228/DUP-109; Government DUP-102/DUP-221/DUP-104/DUP-123. They remain non-canonical. DUP-104's “person for a public office” wording is overly broad; refine to an indirect-election/selection context before any acceptance. Caretaker-government explanation remains framed as a general convention, not absolute rule.
- Literature DUP-59/DUP-232 epithet overlap remains held. Government DUP-47, Literature DUP-05/55/56/48/62, Chemistry DUP-64 and Mathematics DUP-52/63 remain syllabus/jurisdiction review flags. Qualified academic approvals: 0.
- Reconfirmed R4: 1,439 provisional retained + 161 held = 1,600. Location-based replacement coverage remains 116/161; 45 held locations lack a proposal target (Biology 13, Government 11, Economics 7, Literature 6, Chemistry 4, Physics 3, Use of English 1). Twelve uncovered locations have recorded candidate drafts; 33 have no retained candidate. Two alternatives DUP-147 and DUP-226 remain draft-only; 24 of the latest 26-target pass were held.
- Rank/provenance crosswalk remains incomplete: 178 baseline ranks 1–286 unrepresented by exact pair crosswalks; 237 targeted reviews lack exact rank IDs; 1,007 vs 1,003 and stale 472/237 and 685/717 conflicts unresolved. Final reviewed/remaining totals remain null.
- Re-fetched exact PR heads: #194 `6ab3e4f018e9d21f95b3d306ea5720b9be5564e6` and #199 `aea774e0e90955e4425bca7a4edfe072a5a3ccf5`. Four workflow groups passed on each; both remain open/draft/unmerged. PR #199 admin tests are mocked, not authenticated acceptance.
- Last recorded preview evidence remains eight synthetic samples, one-question practice/API lifecycle only. Full mocks, live AI POST and authenticated admin/non-admin walkthrough remain outstanding; no fresh live preview check claimed.
- Round 8 changed only this audit report and checkpoint. No source/canonical question, staging row, database, Worker, auth/payment config or production resource changed. No import, publication, merge or deployment. No manual action needed this round.


## Continuation round 9 — 13 November 2026
- Verified branch before work at `b70229e64305381ae452cec6f4709760c8089b2b`; round report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-9.md`.
- Recounted the uncovered-target queue: exactly 45 entries and 45 unique IDs; subject distribution matches the R4 coverage report. Current R4 remains 1,439 provisionally retained + 161 held = 1,600; 116/161 held locations have proposal targets and 45 do not.
- Re-read all four November replacement-draft batches and the 26-target consolidated pass. DUP-147 and DUP-226 remain the two final-pass alternatives; 24 other targets were held. Previously reported 12 candidate locations and 33 without retained candidates remain unchanged.
- Parsed the canonical proposal JSON: 116 items, 116 unique target IDs, all with a question, four distinct options and valid A-D key. Subject distribution: Mathematics 7, Chemistry 17, Physics 12, Biology 18, Literature 14, Economics 20, Government 14, Use of English 14.
- Found stale descriptive metadata in the canonical JSON: its prose says 115 proposals / original 90 plus 25, while `draft_count` and actual item array both equal 116. Recorded as metadata/history mismatch; canonical JSON not edited in this audit-only round.
- Recounted separate revision file: eight unique editorial proposals (Use of English 2, Economics 2, Government 4) plus one Literature hold DUP-232. All remain non-canonical. DUP-104 needs narrower indirect-election wording; proposed wording direction recorded in the round report only.
- Recounted the disposition register: 199 relationship records across five decision classes (90 confirmed duplicates; 77 confirmed duplicates pending qualified review; 27 assistant-contextual confirmations pending qualified review; 4 cluster extensions pending qualified review; 1 related-skill variant pending qualified review). Do not equate relationship count with unique held targets.
- Reconfirmed rank/provenance limitations: 178 baseline ranks 1-286 not represented by exact pair crosswalks; 237 reported targeted reviews lack exact rank IDs; 1,007 vs 1,003 and stale 472/237 and 685/717 conflicts unresolved. Final reviewed/remaining totals remain null.
- Re-fetched exact PR #194 and #199 heads: four workflow groups passed on each. Both PRs remain open/draft/unmerged; PR #199 admin tests use mocked auth/API.
- Generic page fetch could not retrieve preview /cbt; this is not evidence the Worker is down. No fresh live status claimed. Full mock tests, live AI POST and authenticated admin/non-admin walkthrough remain outstanding; last recorded preview bank had eight synthetic questions.
- Round 9 changed only this audit report and checkpoint. No source/canonical question, staging row, database, Worker, auth/payment config or production resource changed. No import, publication, merge or deployment. No manual action needed this round.


## Consolidated continuation rounds 10 and 11 — 13 November 2026
- Round 10 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-10.md`.
- Round 11 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-11.md`.
- Corrected descriptive metadata in `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`: 115 / 90+25 was stale; it now accurately says 116 / 90+26. Post-edit validation: 116 actual entries, 116 unique target IDs, all with a question, four distinct options and valid A-D key. No question content was changed by this metadata correction.
- Refined the separate non-canonical DUP-104 editorial proposal to ask the role of an electoral college in an indirect election. The explanation now explicitly qualifies jurisdiction-specific membership and procedure. The stem's highest recorded trigram Dice score was 0.403 against the 175 retained Government bank questions and 0.315 against other Government proposals; lexical screening is not academic approval. Canonical inventory remains unchanged by this editorial proposal.
- Re-read all eight R4 CSV exports: 1,439 retained + 161 held = 1,600; 200 per subject. Recounted the 45-entry uncovered-target queue. Coverage remains 116/161 target locations; 45 uncovered. Previously reported 12 candidate locations and 33 without retained candidates remain unchanged; no speculative draft was added.
- Rechecked rank evidence: 178 baseline ranks 1-286 not represented by exact pair crosswalks; 237 targeted reviews lack exact rank IDs; 1,007 vs 1,003 and stale 472/237 and 685/717 conflicts remain unresolved. Tail ranks 287-1,304 have pairwise dispositions, but baseline review lineage is not reconciled. Final aggregate remains null.
- Re-fetched exact PR #194 and #199 heads and workflows. Both remain open/draft/unmerged; all four workflow groups passed on each exact head. PR #199 browser tests use mocked auth/API; authenticated admin acceptance remains outstanding.
- Last recorded preview bank remains eight synthetic published samples. Full mock modes, live AI-assistant POST and authenticated admin/non-admin walkthrough remain outstanding; no new live preview status claimed.
- Rounds 10 and 11 changed only inventory descriptive metadata, the separate DUP-104 editorial proposal, two round reports and this checkpoint. No source question, R4 staging row, database, Worker, auth/payment setting or production resource changed. No import, publication, merge or deployment.

## Consolidated continuation rounds 12 and 13 — 13 November 2026
- Round 12 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-12.md`.
- Round 13 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-13.md`.
- Added a separate candidate-screen record for uncovered target DUP-132 (Use of English). A proposed “photographic” primary-stress question was rejected because the retained bank already contains closely related primary-stress questions; the highest lexical match was 0.772 and the assessed learning outcome was also conceptually repeated. DUP-132 remains uncovered.
- No replacement was added to the canonical inventory. It remains 116 entries / 116 unique IDs, with all entries structurally complete. The 45-location uncovered queue and 116/161 coverage count are unchanged.
- Rank/provenance limitations remain unchanged: 178 baseline ranks 1–286 are not represented by exact pair crosswalks; 237 reported targeted reviews have no exact rank IDs; the 1,007/1,003 discrepancy and stale 472/237 and 685/717 counters remain unresolved. Final reviewed/remaining totals remain null.
- PR #194 and #199 remain open/draft/unmerged. Their exact recorded heads retain four successful automated workflow groups each; PR #199's admin tests still use mocked authentication/API. Full mock-size tests, live AI-assistant POST and authenticated admin/non-admin walkthrough remain outstanding.
- Rounds 12–13 changed only audit documentation. No source question, R4 staging row, database, Worker, auth/payment setting or production resource changed. No import, publication, merge or deployment.

## Consolidated continuation rounds 14 and 15 — 13 November 2026
- Round 14 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-14.md`.
- Round 15 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-15.md`.
- Added a separately screened draft for DUP-95 (Chemistry; held source batch 34 row 21). It tests average gas-production rate as change in gas volume divided by elapsed time. Screened all 200 Chemistry source rows and all 17 Chemistry canonical proposals: highest lexical scores 0.386 and 0.302 respectively. It remains outside the canonical inventory; the 116/161 coverage count and 45 uncovered targets are unchanged.
- Added a defensive check in `supabase/functions/eduken-api/cbt-attempt-validation.mjs` rejecting duplicate question IDs in a stored attempt snapshot, plus a regression test in `tests/cbt-attempt-validation.test.mjs`. Both changes are on the work branch only.
- **Important test limitation:** no workflow run exists for the new work-branch commit. Existing successful workflows on PR #194/#199 run on older, different heads and do not validate this change. The regression test is present but its execution is pending; do not describe it as passed.
- Rank/provenance limits remain: 178 baseline ranks 1–286 unrepresented by exact pair crosswalks; 237 targeted reviews lack exact rank IDs; 1,007/1,003 and 472/237 and 685/717 discrepancies unresolved; final aggregate remains null.
- PR #194 and #199 remain open/draft/unmerged. Full mock-size preview testing, live AI-assistant POST and authenticated admin/non-admin walkthrough remain outstanding.
- No production Worker/database/auth/payment changes, student data access, import, publication, merge or deployment occurred.



## Five-workstream continuation round 16 — 13 November 2026
- Round 16 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-16.md`.
- Reconfirmed canonical target-location coverage at 116/161, with 45 uncovered held locations; DUP-95 remains supplemental and outside the canonical 116.
- Re-fetched the duplicate-ID guard and regression test. A focused isolated Node harness passed four assertions (valid attempt, duplicate IDs, unknown answer ID, malformed snapshot). This is not the repository test file or full validation suite; the branch test remains unverified.
- Confirmed workflow triggers do not run the build workflow for direct pushes to this work branch; no workflow-dispatch action was available and no new branch CI run exists.
- Reconfirmed rank gaps: 178 baseline ranks unrepresented by exact pair crosswalks; 237 targeted reviews lack exact rank IDs; counter conflicts remain unresolved and aggregate totals remain null.
- PR #194 and #199 remain open/draft/unmerged, with four successful workflow groups on each exact older PR head. These runs do not validate the current work-branch head. Authenticated acceptance, full mock-size tests and live AI-assistant POST remain open.
- No production Worker/database/auth/payment changes, student data access, import, publication, merge or deployment occurred. Qualified academic approvals remain 0.


## Five-workstream continuation round 17 — 13 November 2026
- Round 17 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-17.md`.
- Re-parsed the canonical replacement inventory: 116 declared and actual items, 116 unique target IDs, zero duplicate IDs, and zero structural defects in question text/options/A–D keys. Subject counts: Mathematics 7, Chemistry 17, Physics 12, Biology 18, Literature 14, Economics 20, Government 14, Use of English 14.
- R4 target-location coverage remains 116/161, with 45 held locations uncovered. Supplemental DUP-95 remains outside the canonical inventory. No speculative replacement was added.
- Ran the fetched CBT grading and subject-selection helper/test contents in an isolated Node.js v22.16.0 harness: 10 tests passed, 0 failed. This is not a checkout-based full `npm run test:validation` or CI run.
- Rank/provenance gaps remain: 178 baseline ranks 1–286 lack exact pair crosswalk representation; 237 reported targeted reviews lack exact rank IDs; 1,007/1,003 and stale 472/237 and 685/717 discrepancies remain unresolved. Aggregate totals remain null.
- Freshly re-fetched PR #194/#195/#197/#199: all remain open/draft/unmerged. Four workflow groups passed on each exact inspected PR head; production deploy jobs were skipped. These runs do not validate separate work-branch changes.
- Authenticated admin/non-admin preview acceptance, full mock-size validation and live AI-assistant POST remain outstanding. Latest recorded preview bank remains eight synthetic published samples; no fresh live preview status claimed.
- Round 17 changed only the two audit documents. No source question, canonical proposal content, R4 staging row, database, Worker, auth/payment setting or production resource changed. No import, publication, merge or deployment. Qualified academic approvals remain 0.


## Five-workstream continuation round 18 — 13 November 2026
- Round 18 report: `content/cbt/audits/2026-11-13-five-workstream-continuation-round-18.md`.
- Re-parsed the 45-target queue: 45 headings, 45 unique held pair IDs, zero duplicates. Subject counts: Government 11, Biology 13, Economics 7, Literature 6, Chemistry 4, Physics 3, Use of English 1.
- Re-read corrected R4 coverage: 116/161 held locations have distinct proposal target locations matching held source locations with zero subject mismatches; 45 remain uncovered.
- Reconciled the 116 proposal lineage: 90 IDs match the owner-reported historical Order 1 approval set, 26 are additional; no documentary reviewer sign-off or qualified academic approvals are recorded (0).
- Recounted 199 disposition records: 90 confirmed semantic duplicates, 77 pending qualified review, 27 assistant-contextual pending, 4 cluster extensions pending and 1 related-skill variant pending. These are pair relationships, not unique held targets.
- Re-parsed the exact rank crosswalk: 184 register mappings, 49 shortlist mappings with 16 overlaps, 217 combined unique ranks; 108 baseline ranks mapped and 178 baseline ranks still unrepresented. The 237 targeted-review count lacks exact IDs; 1,007/1,003 and 472/237 and 685/717 conflicts remain unresolved. Tail ranks 287–1,304 have 1,018 explicit pairwise dispositions, without resolving baseline lineage.
- Subject-allocation property harness passed all 6,195 supported three-subject/count combinations (35 combinations × 177 counts, 4–180) and 2 invalid-input tests. Together with Round 17's isolated grading/selection harness, 12 test cases/groups passed. This is not repository-wide `npm run test:validation` or work-branch CI.
- PR #194/#195/#197/#199 remain open/draft/unmerged; their previously freshly checked exact-head workflows passed. They do not validate work-branch changes. Authenticated preview acceptance, full live mock-size tests and live AI-assistant POST remain outstanding.
- Round 18 changed only audit documentation. No source question, canonical proposal, staging row, database, Worker, auth/payment setting or production resource changed. No import, publication, merge or deployment.
