# Authoritative execution checkpoint — 10 November 2026

This section supersedes older operational counts below wherever they conflict. Historical audit notes remain for traceability. This is a documentation/register update only; it does not approve academic content or authorize release.

## Current reconciled position

- Repository: existing EDUKEN-CONSULT project; continuation only. No rebuild.
- Active question-bank reconciliation branch: `feat/cbt-subject-combination-reconciled`; PR #194 remains open, draft and unmerged.
- Latest r4 staging inventory: **1,600 source rows = 1,439 provisionally retained + 161 held**. Each of the eight supported subjects has exactly 200 source rows. The non-destructive r4 revision moves the later duplicate endpoint (batch 39 row 3, Use of English) to held under DUP-245; r3 and all original source CSVs remain unchanged.
- Independent read-only validation of all eight r4 CSV exports is recorded in `content/cbt/audits/2026-11-10-r4-structural-membership-verification.json`: 1,439 unique retained locations, 161 unique held locations, zero retained/held overlap, zero duplicate held locations, zero missing retained anchors, and all retained/held rows have four distinct options, valid A–D keys and explanations.
- Replacement inventory: **116 proposals**, 116 unique target IDs, including the new DUP-245 replacement draft. Independent r4 structural reconciliation is recorded in `content/cbt/audits/2026-11-10-r4-replacement-draft-structure-reconciliation.json`. All have four distinct options, valid A–D keys, explanations and review-required status.
- Current bank-wide lexical screen: **12 flags + 104 below-threshold proposals = 116 screened** against all 1,600 r4 source rows. The 12 flags remain review prompts, not automatic duplicate findings. Target-level replacement coverage is **104 of 161 held rows**; 55 D targets still need drafts and two S rows await qualified review.
- Qualified independent academic approvals: **0**. No retained question or replacement proposal is academically approved by structural or lexical checks.
- All questions and replacement proposals remain unpublished. Production question-bank imports: 0. Production publications: 0.
- The PR #194 checkpoint now reconciles with the 116-item inventory and version-68 screen. Do not reuse older 103-total / 91-below-threshold figures.
- PR #194 code-bearing baseline commit `eed32eb98a5e50fcb745ee48b7f77a1afb7da817` has successful build, wallet-SQL, preview deploy and public browser checks; production deploy was skipped. Subsequent commits add audit documentation only and trigger their own checks.
- PR #199 remains open/draft/unmerged. Its recorded build, wallet-SQL, preview and public-browser checks passed on `aea774e0e90955e4425bca7a4edfe072a5a3ccf5`; real authenticated admin acceptance remains outstanding.
- Integration reconciliation (10 Nov): PR #194 already contains the exact same blob versions of `src/CbtQuestionBankAdmin.tsx` and `tests/e2e/cbt-admin-search-audit.spec.js` as PR #199, and its `src/App.tsx` already imports/renders the admin component. Treat PR #199's pagination/search/audit changes as present in PR #194; keep PR #199 open/draft for now and do not merge it separately or close it without a final integration decision.
- The isolated test bank remains 73 rows (65 draft, 8 published) and cannot support the 180-question mock. Production remains isolated and was not queried or changed during this cycle.

## Isolated preview database and runtime checkpoint — 10 November 2026

- Read-only inspection was limited to isolated Supabase project `wpktzogarfqrgkirzdpy`; production project was not queried or changed.
- CBT question table: **73 rows** — 65 draft and 8 published (one published sample per subject). Import batches: 2. The 180-question mock remains unavailable until a sufficiently large approved bank is loaded into the isolated environment.
- Attempt data: **1,730 sessions**, **1,723 submitted practice summaries**, and **7 sessions without a result summary** (3 mock, 4 practice). Two submitted summaries have a non-null user ID (one distinct account). No attempt records were deleted. New tests must use synthetic/guest sessions; do not reuse account-linked records or infer that they are synthetic.
- RLS is enabled on the four CBT tables, with zero table policies. The deployed Edge Function uses the secret-key client and has internal `currentUser` / `requireAdmin` checks; ordinary direct-client access is therefore denied by default. No RLS policy or auth changes were made.
- Supabase security advisor: leaked-password protection is disabled (WARN); 16 tables have RLS enabled with no policies (INFO). Performance advisor: two unindexed foreign keys and four unused indexes (INFO); health advisor returned no findings. Auth settings were not changed because that requires separate approval.
- Isolated `eduken-api` is ACTIVE at version 44 with `verify_jwt=false`; the function source contains internal auth checks. Its deployed `index.ts` matches the main-branch file except for one four-question mock-duration branch, but does **not** match PR #194: PR #194 adds server-side subject-combination selection helpers. Preview Edge Function alignment is therefore an outstanding integration task; do not deploy to production.
- Latest PR #194 head `e31da2a619debff2b3d33ad350c4ee02171b47c1`: Worker build, both build checks, wallet-SQL and preview deployment passed; public browser checks were still running at the last check. Production deploy was skipped.

## Assistant preliminary subject-content screen — 10 November 2026

The detailed candidate queue is `content/cbt/audits/2026-11-10-assistant-subject-screen-candidate-queue.json`. These are assistant preliminary checks, not qualified academic approvals.

- **Use of English:** 186 r3 retained rows screened; one semantic duplicate (obsolete/outdated) was moved to held in r4 as DUP-245. Two subtopic labels and one formatting issue remain queued for correction.
- **Mathematics:** all 200 original rows screened (193 retained, 7 held). No obvious answer-key/calculation error identified. Two topic/subtopic labels and one trailing-whitespace issue remain queued.
- **Biology:** 169 retained rows screened; 31 held rows still need review. No obvious answer-key/explanation error identified. Multiple repeated-concept candidates were found, including xylem transport, chlorophyll, antibodies, glomerulus, mitosis, heterozygous genotype, photolysis and nitrogen fixation. Existing vaccination and ADH clusters include DUP-38/DUP-173 and DUP-160.
- **Economics:** 173 retained rows screened; 27 held rows still need review. No obvious answer-key/explanation error identified. Repeated-definition candidates include public debt, inflation, exchange rate, HDI, direct tax, deflation, ad valorem tax, fiscal policy and price taker. Direct tax is cross-window rank 36 (0.87); exchange rate is rank 288 (0.647). Public expenditure is already represented by DUP-170. The perfect-competition wording at batch 2 row 27 should say homogeneous products rather than “very similar products”.
- **Government:** 175 retained rows screened; 25 held rows still need review. No obvious answer-key/explanation error identified. Repeated-concept candidates include universal adult suffrage, unitary government, public corporations, treaties, legitimacy, separation of powers, the African Union and sovereignty.
- **Literature in English:** 180 retained rows screened; 20 held rows still need review. No obvious answer-key/explanation error identified. Repeated-concept candidates include foreshadowing, first-person narration, epistolary novels, dialogue, alliteration, oxymoron, simile, metaphor, setting and stage directions.
- **Chemistry:** 179 retained rows screened; 21 held rows still need review. No obvious answer-key/explanation error identified. Molar gas volume at STP and esterification products are flagged for pairwise similarity review.
- **Physics:** 185 retained rows screened; 15 held rows still need review. No obvious answer-key/calculation error identified. One metadata classification and one trailing-space issue are queued.
- All candidate repeats remain pending pair/cluster reconciliation. No questions were academically approved, imported or published by these preliminary screens.

## Isolated preview Edge Function alignment — 10 November 2026

- Deployed the PR #194 `eduken-api` source to the isolated test Supabase project only; the function is ACTIVE at version **45** and its deployed `index.ts` exactly matches the PR #194 branch source.
- Included all 15 function source files and preserved the existing `verify_jwt=false` setting because the function enforces its own `currentUser` and `requireAdmin` checks.
- No database rows, schema, auth settings, payment settings or production resources were changed. The isolated project still has 73 CBT question rows (65 draft, 8 published).
- No direct API invocation was performed after deployment; the deployed source was verified by read-back. PR #194 CI/browser checks passed on its previous head; the new documentation/audit commits require their own current status check.

## Workstream register

| Workstream | Current status | Next required action |
|---|---|---|
| 1. Use of English | IN PROGRESS — r4 structure verified; 185 retained, 15 held, 14 replacement proposals; assistant screen complete | Qualified review, metadata/formatting corrections and final duplicate clearance |
| 2. Science | IN PROGRESS — r4 structure verified; Math 200 original rows screened; retained Biology (169), Chemistry (179) and Physics (185) preliminarily screened | Review held Biology (31), Chemistry (21), Physics (15), metadata corrections and qualified sign-off |
| 3. Arts and Social Sciences | IN PROGRESS — r4 structure verified; retained Economics, Government and Literature rows preliminarily screened | Review held Economics (27), Government (25) and Literature (20), reconcile repeated-concept candidates and obtain qualified sign-off |
| 4. Integrity and reconciliation | IN PROGRESS | Maintain r4 as current staging, reconcile DUP-245 into the canonical pair history, and continue target/provenance reconciliation |
| 5. CBT platform | IN PROGRESS — PR #194 checks passed; isolated Edge Function v45 matches PR #194 source; test bank has 73 questions, 8 published | Authenticated admin acceptance, post-deploy API invocation, full 180-question lifecycle after bank clearance, mobile/network and security checks |

## Assistant preliminary Use of English content-screen — 10 November 2026

- Screened all **186 provisionally retained Use of English rows** in r3. This was an assistant preliminary screen only; it is not independent academic approval. The r4 retained set now contains 185 Use of English rows and the held set contains 15.
- Confirmed assistant-identified semantic duplicate: **batch 7 row 3** and **batch 39 row 3** both test that *obsolete* means *outdated*. The later endpoint is now held in r4 as **DUP-245**; the earlier item remains the retained anchor. Pair details are in `content/cbt/audits/2026-11-10-use-of-english-DUP-245-addendum.json`.
- Metadata follow-ups: batch 07 row 3 and batch 18 row 3 are synonym/meaning items labelled under the “Antonyms” subtopic; batch 27 row 4 classifies “comply with” as an idiom/fixed expression rather than a verb–preposition collocation.
- Formatting follow-up: batch 31 row 3 contains literal backslashes where quotation marks should delimit the example sentence and target word.
- No answer-key or explanation error was identified in this 186-row preliminary pass. This does not establish syllabus sign-off or qualified academic approval.
- Safety: original source CSVs changed 0; r3 staging rows changed 0; r4 moved one duplicate row to held and added one review-required replacement draft; production changes 0; imports/publications 0; academic approvals created 0.
- Next actions: reconcile DUP-245 with the consolidated pair-level register; obtain qualified review for the 185 retained Use of English questions and 14 replacement proposals; correct the two metadata labels and malformed quotation in staging only after confirming the appropriate source-preserving correction; continue the remaining six subjects.

## Release blockers

1. Qualified independent review of answer keys, explanations, syllabus scope and duplicate-versus-related-skill decisions.
2. Resolve all held-row decisions and prepare only replacements for targets confirmed to require replacement.
3. Complete authenticated isolated admin walkthrough; mocked Playwright coverage is not live acceptance.
4. Populate a sufficiently large approved isolated bank and pass the complete 180-question, 120-minute mock lifecycle.
5. Complete remaining security, mobile and slower-network acceptance.
6. Obtain separate explicit production-release approval before any merge, production import, publication or deployment.

---

# EDUKEN CBT 1,600-Question Bank Build Plan

## Authoritative operational update — 6 November 2026

This update supersedes conflicting older status notes below. Historical entries remain for traceability; do not reuse their counts as current without reconciliation.

### 1. Code, PRs and CI
- PR #194 remains open, draft and unmerged. Its latest code-bearing baseline passed all four required workflow groups; later audit-only documentation commits do not change application code. No production deployment is authorized.
- PR #195 remains open, draft and unmerged; its current code head passed all four workflow groups.
- PR #197 remains open, draft and unmerged; its current code head passed all four workflow groups. The authenticated live admin-session walkthrough remains outstanding.
- The isolated admin E2E passed on 5 November using synthetic data only. The isolated database returned to 65 drafts + 8 published = 73 rows. No production data was used.
- Production CBT question bank remains empty. The isolated test bank remains 73 rows and cannot supply a 180-question mock.

### 2. Current non-destructive staging and later-register reconciliation
- The 6 November staging revision accounts for all 1,600 source rows: **1,476 provisionally retained + 124 held = 1,600**. Original source CSVs and staging CSVs remain unchanged.
- Baseline 90 held relationships are provenance-reconciled: **62 commit-backed replacement histories + 28 original-draft overlaps**. The 13 exact introducing commits and DUP-34 edit history are verified.
- The 28 new addendum pair records plus six unique cluster-extension rows account for **34 new held locations**. All 64 referenced source locations were checked; 34 unique held rows and 34 retained anchors join exactly; all source records are original EDUKEN-authored content. Preliminary contextual screening is complete, but qualified subject/answer/syllabus review is pending. No replacement drafts have been created.
- Non-authoritative AI triage files are now prepared for the 71 legacy candidates and 34 new addendum rows. The 71-row triage suggests 37 likely duplicates, 12 existing-cluster candidates and 22 related-skill variants; the 34-row triage maps 21 same-fact candidates, one high-overlap near-duplicate and 12 related-skill variants. Both official reviewer worksheets remain untouched: all review decisions, answer-key/syllabus checks, reviewer names and dates remain blank. These are screening suggestions only, not academic approval.
- The consolidated register separately lists **96 later-range pair IDs** with Git-history classification and final disposition still pending. A new location audit checked all **185 unique references** across those pair records: 33 references are in the held export and 152 in the retained export, with zero missing locations and zero retained/held overlap.
- Across those 96 pairs, **101 candidate hold locations** were identified. Source rows were found for all 101 and each is marked `source_type=original` with EDUKEN-authored provenance notes. **30** are already in the held export; **71** remain in the retained export. Those 71 are in a separate qualified-review worksheet and have not been moved to held.
- Source metadata checks do not replace Git-history classification. The 96 pair IDs remain open for exact original-draft versus replacement-history classification and qualified contextual review. Do not treat an assistant screening label as academic approval.
- The 6 November staging export remains non-destructive: no source edits, no staging CSV edits, no production imports or publications. The 1,476 retained rows are provisional, not academically approved.

### 3. Review progress — rank crosswalk partly reconciled, aggregate still open
- The 81 persisted tail-review part files contain **717 unique rank IDs** in the earlier review set.
- The later persisted segments contain **297 rank IDs** (565–579, 640–909 and 1293–1304); **58 overlap** earlier rank IDs, so only **239 are genuinely new**.
- The combined tail-review files now contain **956 unique rank IDs**. The separate 49-item high-similarity rank mapping adds 49 explicit IDs, for 1,005 explicit rank IDs across those source sets.
- The earlier cumulative counter says 1,007 reviewed before the addendum, but the 286 baseline plus 717 explicit earlier rank IDs gives 1,003 — a **four-count discrepancy**.
- The 62 rank IDs previously missing from the tail-review files have now received explicit pairwise dispositions in **part83** (3 same-fact duplicate recommendations, one near-duplicate recommendation, eight related-skill variants and 44 distinct/complementary pairs). The tail-review union now covers all **1,018 ranks from 287–1304**.
- The remaining crosswalk task is to map the 286 baseline reviews (49 high-similarity ranks mapped; 237 additional targeted reviews still lack exact rank IDs) and resolve the four-count discrepancy. Do not claim a final aggregate reviewed/remaining count until that mapping is complete.
- Within-window: the reconstructed set contains 390 candidates at threshold 0.42; the original report still lists 279 pending and a 38-count discrepancy. The original queue remains unreconciled.
- Similarity scores remain screening signals, not proof of duplication or uniqueness.

### 4. Preview environment — one-question practice lifecycle verified; full mock blocked by bank size
- Cloudflare account Workers subdomain is `timmyjoe385`. Preview homepage and `/cbt` return HTTP 200; the homepage displays the TEST PREVIEW ONLY banner.
- The isolated preview question API returns HTTP 200 with **8 published original preview samples**, one per subject. The page hydrates to “Free starter practice available” with a one-question selector. These are synthetic preview samples, not the reviewed 1,600-question bank.
- The preview `eduken-api` Edge Function is ACTIVE at version 43 with `verify_jwt=false`; deployed `index.ts` exactly matches repository source. Preview Worker settings point to isolated Supabase project `wpktzogarfqrgkirzdpy`; preview and production analytics D1 bindings are distinct.
- Isolated Supabase function logs recorded question feed **200**, attempt creation **201**, attempt submission **200**, insufficient-bank guard **409**, and unauthenticated admin API **401**. The 409 is the expected safe rejection when a mock requests more questions than the preview bank contains.
- The CI Chromium smoke test in `tests/cbt-preview-smoke.mjs` passed **4/4 workflow groups** on code commit `a121ee7c19887bca26f7ed03cefa83fc417437d8`. It covered question feed, answer-key hiding, four unique mock subjects with Use of English locked, subject selection, one-question attempt start, answer selection, submit, and results/review.
- The preview bank has only one published question per subject. A full 10/20/40/100/180-question mock cannot run yet; do not treat the synthetic sample bank as a student-ready question bank.
- Live AI assistant POST and authenticated analytics/admin walkthrough remain outstanding. Production CBT question bank remains empty (0 rows); no production import, publication or deployment was performed.

### 5. Remaining gates and safe next actions
1. Reconcile the 297 persisted rank entries against all prior review segments and compute a unique aggregate reviewed/remaining count.
2. Complete contextual duplicate-versus-related-skill decisions for the 28 new pair records and six unique cluster-extension rows; provenance and staging joins are now verified.
3. Reconcile the consolidated register's 96 explicitly unverified IDs and remaining summary/unique-target counters; canonical cluster merges and the two affected cluster memberships are now applied and source-verified.
4. Draft replacement questions only for items confirmed as true duplicates after qualified subject review and syllabus checks; run a refreshed bank-wide semantic screen.
5. Complete preview AI retrieval, authenticated analytics/admin acceptance and device/network performance tests; one-question student practice is verified by the CI browser smoke and isolated API logs, but the 180-question mock remains blocked by the eight-sample bank.
6. Obtain qualified independent subject/answer/syllabus approval before publishing any questions.
7. Keep production imports, publication, merge and deployment blocked until separate explicit production-release approval.

## Locked target

Prepare 200 reviewed, publishable questions for each of the eight supported subjects (1,600 total):

- Use of English — 200
- Mathematics — 200
- Biology — 200
- Chemistry — 200
- Physics — 200
- Economics — 200
- Government — 200
- Literature in English — 200

## Content workflow

1. Reconcile existing database rows and CSV/source packs before importing. Never blindly re-import existing records.
2. Draft original questions in manageable batches, distributed across the subject syllabus and topics.
3. Validate every row for required fields, exactly four options, a valid correct option, a meaningful explanation, a stable fingerprint, and duplicate fingerprints.
4. Review academic accuracy, ambiguity, difficulty, syllabus coverage, and answer/explanation alignment. Check semantic duplicates too; matching fingerprints alone cannot detect paraphrased duplicates.
5. Keep new questions in draft until reviewed. Only authorized review/publish workflow may make them student-visible.
6. Track counts by subject and status; report 200 as complete only when 200 distinct questions in that subject have passed review and are published.

## CBT requirements

- Practice question counts must never exceed the selected subject's available published count.
- Random selection must avoid duplicate questions within one attempt.
- Option shuffling must remap the correct answer before grading and answer review.
- A full JAMB-style mock requires 60 Use of English questions plus 40 questions from each of three selected additional subjects (180 total); reject the attempt clearly if any selected bank is short.
- Keep question content separate from code and never place draft or unreviewed questions in the student-facing published feed.

## Drafting progress (repository content only)

Forty original CSV batches exist in the current PR branch: 1,600 draft questions total, 200 per supported subject. Each file contains 40 questions, five per subject, with the exact 18-column schema. The four 10-batch windows were fetched and checked for 18 columns, 40 data rows, and five questions per subject per batch. The permanent build test additionally enforces sequential batch numbering, valid answer keys, four distinct options, explanations, original-authorship/provenance/licensing fields, draft-only status, and zero exact normalized duplicate stems across all 40 files.

The repository CSVs are drafts only. Structural validity and automated duplicate checks are not academic approval. No automatic import or publication is permitted. Academic accuracy, ambiguity, syllabus coverage, difficulty, correct-answer validity, explanation alignment, and semantic overlap still require review before publication.

## Similarity screening — preliminary, not an approval

A fresh stem-similarity screen was rerun over two separate 20-batch windows (batches 01–20 and 21–40). It surfaced 37 and 52 same-subject candidate pairs respectively at the screening threshold. This is a lexical heuristic, not a complete cross-window semantic comparison. This is a noisy lexical screen: it can flag related but distinct questions that share a template and can miss paraphrases with different vocabulary. It does not compare pairs across the four windows and is not a substitute for academic review.

The permanent global test has now passed on the latest tested branch head, confirming zero exact normalized duplicate stems across all 40 batches. Manual inspection of surfaced high-similarity examples found several related-but-distinct questions (for example, semicolon versus colon use, different vocabulary targets, and distinct formula/application questions). One repeated electromagnetic-induction concept was confirmed between batch 26 row 25 and batch 29 row 25. Batch 29 row 25 has been replaced with a distinct question about why a soft-iron core is inserted into a current-carrying solenoid.

Thirty-one duplicate or redundant rows have now been replaced across the original and continuation work. The latest manual review confirmed repeated or overly redundant question pairs involving converging-lens image formation, constitutional amendment, group valence electrons, inflation definition, concentration calculation, kidney functional unit, set intersection, civil-service anonymity, sine ratio, public accountability, plane-mirror image properties, the Keynesian multiplier, older-leaf mineral deficiency, HDI definition, government legitimacy, cone-volume calculation, and hydrochloric-acid/sodium-hydroxide neutralisation. The replacements remain original EDUKEN drafts and retain the five-per-subject batch balance. Earlier confirmed repeats included catalyst action, isotope definition, poem rhyme scheme, unreliable narrator definition, and Golgi apparatus function. Subsequent corrections include repeated question patterns involving a stanza definition, gradient calculation, sentence types, transpiration, natural selection, nephron filtration, coalition government, and electromagnetic induction. The replacements preserve the 40-row batch size, five-per-subject balance, original-authorship metadata, and draft status.

The remaining lexical candidates and all 1,600 questions still require content-level review of the complete stem, options, key, explanation, and topic. The two 20-batch windows have not yet been compared against each other for cross-window semantic duplicates. The lexical screen cannot validate answer keys or explanations and cannot certify academic quality. Do not automatically rewrite questions based on this heuristic.

## Recent CBT implementation checks

The reconciled branch uses shared server-side helpers for the 180-question blueprint and option-order remapping. Unit tests cover the 60 + 40 + 40 + 40 full-mock distribution, shorter mixed-mock distribution, all 24 possible answer-option permutations, and invalid option mappings.

The student CBT retrieves published questions only. Server-side attempt snapshots keep answer keys and explanations hidden until submission; grading and repeat-submission handling are server-side. The UI now disables attempts when the published question service is empty or unavailable instead of falling back to local sample questions. The results-page return-to-practice action was corrected and a browser assertion was added for that navigation.

## Current verified baseline (isolated test project only)

The isolated test project `wpktzogarfqrgkirzdpy` remains active and separate from production. A fresh read-only query reports 73 CBT rows: 65 drafts and 8 published, with one published row in each of the eight supported subjects (Use of English has 9 drafts; each other subject has 8 drafts). The import-history table has no rows. This is not a completed bank and does not support a full 180-question mock. The API must reject an underfilled full mock clearly. The repository's 1,600 CSV drafts have not been imported into this database.

## Admin workflow and release gates — updated 5 November 2026

Authenticated admin CSV import-to-review-to-publish E2E testing is **completed and passed** in the isolated preview/test project. The test used one synthetic question only and verified Google allowlisted sign-in, insert-as-draft, persisted import history, duplicate rejection, review/approval/publish transitions, student-feed visibility, unpublish/feed removal, cleanup, signed-out rejection and non-allowlisted rejection (HTTP 403). See `audits/isolated-admin-e2e-runbook-2026-11-05.md`.

The isolated test database baseline is 73 questions: 65 drafts and 8 published, with one published question per subject. After cleanup there are zero synthetic question rows; two synthetic import-history entries remain (initial import and duplicate retry). This is expected and is retained for audit. The database is not sufficient for a 180-question mock.

The admin E2E result does not close the academic or semantic review gates. Before a student-facing production release:
- complete the remaining semantic-overlap review across the 1,600-question source bank (1,018 cross-window candidates and 279 reported within-window different-topic candidates remain pending; the 38-candidate discrepancy remains unresolved);
- finish replacement-history provenance normalization (14 records await commit-SHA reconciliation; one pair remains unverified);
- ensure qualified subject review and academic verification are properly evidenced; the 90/90 replacement approval is user-reported, with no signed item-level reviewer records in the repository;
- import only approved material into an isolated project when explicitly authorised, keep all imported records draft until reviewed through the admin workflow, and verify sufficient published questions for the requested exam combinations;
- rerun CI, browser, API and preview checks against the final commit;
- obtain explicit release approval before any production merge, production database change or production deployment.

## Latest repository verification

- PR #194 is open, unmerged, and still marked draft.
- Latest content head: `3d89a58af4ace7556f93f919d90482b2673a8505`; the subsequent audit-plan-only refresh is `ecc0321648cdde7ba9f032445a2b782e7a5f4bdb`.
- Build and validation/security regression tests passed, including the global exact-normalized-duplicate check across all 40 CSV batches.
- Wallet migration SQL integration passed.
- The isolated Cloudflare preview Worker deployed successfully and passed the real-CBT Chromium smoke test.
- The separate Playwright browser workflow is still running against the latest content head; its result is pending.
- The isolated guest payment recovery smoke test was skipped, not passed.
- Production deployment was skipped intentionally; no production release was performed.
- The isolated test database has 73 questions (65 drafts, 8 published), one published per subject, and is insufficient for the 180-question mock. Authenticated admin E2E has since passed; see the updated admin workflow section above.
- Authenticated admin import-to-publish testing and full academic/semantic review remain outstanding.
- Production database and production question records remain untouched.


## Fresh global duplicate-cleanup audit — 1 November 2026 (in progress)

### Repository snapshot and scan coverage
- Scanned the current branch's 40 numbered CSV files in four manageable windows: batches 01–10, 11–20, 21–30, and 31–40.
- All 40 files were fetched successfully. Each file had the exact 18-column header and 40 question rows; all 1,600 question rows were present.
- The isolated structural checks across these windows found no malformed rows and no non-draft statuses. The current CI build also passed the repository-wide question-bank test: 109 tests passed, 0 failed. That test verifies the exact 18-column schema, 40 rows per batch, five questions per subject per batch, valid keys/options/explanations/provenance, draft-only status, and zero exact normalized duplicate stems globally across all 40 files.
- Exact duplicate groups found by the independent per-window pass: zero. The current CI test is the authoritative global exact-stem check across all 40 files; it passed on branch head 71d1830f4496d213acf8326c59867d1271e5a4b7.

### New lexical candidate screen
- Ran a same-subject character-trigram Dice screen at threshold 0.43 within each 10-batch window. Candidate pair counts: batches 01–10 = 119; 11–20 = 107; 21–30 = 82; 31–40 = 82; total = 390 within-window candidate pairs.
- These are review flags, not confirmed duplicates. Generic question templates and related-but-distinct facts produce false positives. The candidate screen has not yet compared pairs across the four windows, so cross-window semantic review remains outstanding.
- Contextual review of the strongest candidates confirmed the following redundant pairs:
  - Biology: batch 21 row 14 and batch 27 row 14 — bacterial asexual reproduction by binary fission.
  - Economics: batch 22 row 29 and batch 26 row 27 — definition of regressive taxation.
  - Physics: batch 25 row 23 and batch 29 row 23 — ammeter/current measurement in a series circuit.
  - Mathematics: batch 27 row 11 and batch 28 row 10 — the same inverse-variation values and calculation.
  - Government: batch 32 row 34 and batch 33 row 35 — constitutional division of powers in a federal system.
- Additional candidates needing a deliberate decision, not automatic replacement:
  - Mathematics: batch 38 row 8 and batch 40 row 11 — same 15% discount/selling-price skill with different amounts.
  - Physics: batch 33 row 24 and batch 38 row 25 — numerical series-resistance calculation versus the general series-resistance rule.
  - Chemistry: batch 31 row 19 and batch 33 row 17 — surface-area effect on reaction rate in different setups.
- Explicitly preserve distinct concepts flagged by wording similarity:
  - Physics: batch 24 row 23 asks for the SI unit of magnetic flux density (tesla); batch 28 row 23 asks for the SI unit of magnetic flux (weber). These are different physical quantities.
  - Use of English: batch 27 row 2 (semicolon) and batch 28 row 5 (colon) test different punctuation rules.
  - Literature: batch 23 row 37 (hubris) and batch 26 row 39 (hamartia) are different tragic concepts; batch 37 row 38 (four-line stanza) and batch 39 row 38 (eight-line stanza) are different stanza forms.

### Current decision and remaining work
- Do not delete or replace any question solely from the lexical score. The five confirmed redundant pairs above must be reconciled against the full 1,600-question set and the previous 31 replacement history before editing.
- No question CSV was modified during this audit. All 1,600 rows remain draft.
- Outstanding: compare semantic candidates across the former 01–20 and 21–40 boundaries and across all four current windows; review candidate options, correct answers and explanations; verify topic/subtopic alignment; produce the final location-level unique/repeated/review-needed inventory; then prepare the clean first set and replacement plan.


## Global cross-window comparison update — 1 November 2026

- Completed the four-window comparison across all 1,600 draft questions (400 records per window; all 40 source CSVs were re-read from the current branch). The compact audit snapshots are preserved in `content/cbt/audits/duplicate-window-01-10.json`, `duplicate-window-11-20.json`, `duplicate-window-21-30.json`, and `duplicate-window-31-40.json`.
- Cross-window exact normalized question-stem pairs: 0. This is consistent with the passing repository-wide CI exact-stem test on the prior functional commit; this new audit work does not change question CSVs.
- Cross-window lexical screen (same subject, character-trigram Dice threshold 0.43): 1,304 candidate pairs; 286 scored at least 0.65; 88 scored at least 0.80. These are flags for review, not duplicates.
- Contextual review of the strongest same-topic/same-subtopic matches has confirmed 14 additional cross-window semantic duplicates. The location-level findings are recorded in `content/cbt/audits/global-duplicate-review-findings-2026-11-01.json`. They include repeated definitions/facts on exterior-angle sums, alkene formula, series-circuit current, homozygous genotype, literary theme, anther/pollen, specific heat capacity, phenolphthalein, molten NaCl electrolysis, inflation/purchasing power, the right-hand grip rule, technology and supply, esterification, and the nucleus.
- Combined with the five already confirmed within-window pairs, the current confirmed list contains 19 redundant pairs. Do not assume this is the final count until the full within-window semantic candidate queue and all prior replacement history are reconciled.
- Many high-scoring pairs are legitimate variants rather than duplicates: changed numerical values in a calculation, related but different laws, or different terms within the same topic. They must not be removed automatically. The report deliberately preserves the distinction between lexical similarity and repeated assessment content.
- No question CSV has been edited or deleted. All 1,600 questions remain draft. Next: review the remaining high-value candidates and same-window queue; verify each confirmed pair against the earlier replacement history; create a final location-level decision register; then replace only the approved redundant items with balanced, syllabus-aligned questions and rerun the complete validation.


## Reconciliation correction — 1 November 2026

The latest detailed findings file is the source of truth for the confirmed-pair count. It records 22 cross-window semantic duplicate pairs and 10 within-window semantic duplicate pairs, for **32 confirmed pairs**. This supersedes the earlier 19-pair progress snapshot and the intermediate 31-pair summary.

The last unresolved within-window candidate, batch 31 row 2 versus batch 33 row 2, has now been checked against both current CSV rows. Both items test the subject relative pronoun "who" in near-identical person-won-award/scholarship-and-thanked-teachers sentence frames. It is now recorded as a confirmed repeated assessment pattern. The exact retain/replace location is deliberately held until the full prior replacement-commit ledger is reconciled.

No question CSV was edited by this decision. All 1,600 questions remain drafts. The 390 within-window lexical candidates are not all fully reviewed: the highest-priority same-topic/subtopic set and 70 highest-scoring different-topic/subtopic candidates have been reviewed, but the remaining different-topic candidate tail is still outstanding. Similarity scores must not be treated as duplicate decisions.

Next gate: finish the full location-level reconciliation of all 32 confirmed pairs against prior replacement commits and all earlier question edits; then finish the remaining candidate review and produce a definitive retain/replace/preserve register before editing question CSVs.


## Continuation update — 1 November 2026 (both workstreams)

The detailed global findings now record **33 confirmed semantic duplicate pairs**: 22 cross-window and 11 within-window. The latest additional within-window finding is batch 38 row 2 versus batch 39 row 5: both use the same "Each of the players" subject frame and test singular verb agreement. Retain batch 38 row 2; mark batch 39 row 5 for replacement only after historical provenance reconciliation. No question CSV was edited.

### Candidate-tail reconciliation

The original within-window triage reports 349 different-topic/subtopic candidates, of which the 70 highest-scoring candidates had already been reviewed. An independent recomputation from the four stored 400-question window indexes at the documented same-subject trigram-Dice threshold of 0.43 reproduced 314 different-topic/subtopic candidates. The 244 lower-scoring pairs after the top 70 were inspected; one further duplicate was confirmed (batch 38 row 2 / batch 39 row 5), and the reviewed remainder were preserved as distinct assessment concepts. The original 349 count and independent 314 count differ by 35; those 35 candidates must be reconciled before the full candidate review can be declared complete. Similarity scores alone are not duplicate decisions.

### Historical replacement reconciliation

The retrieved branch history was enumerated across 400 commits, and targeted batch histories and selected replacement/diversification patches were inspected. Five prior-replacement overlaps remain confirmed: batch 32 row 34 / batch 33 row 35; batch 2 row 40 / batch 37 row 41; batch 26 row 4 / batch 30 row 3; batch 25 row 31 / batch 33 row 29; and batch 6 row 29 / batch 37 row 29. These must be corrected only once. The complete row-by-row provenance ledger for all 33 pairs is not yet complete; the new batch 38/39 concord pair also remains in that queue.

### Next gates

1. Reconcile the 35-candidate count discrepancy against the original candidate-generation method.
2. Complete row-level provenance checks for all 33 confirmed pairs against prior replacement commits and CSV edit history.
3. Publish a definitive retain / replace / preserve register.
4. Only then edit the selected CSV rows, preserving subject balance and topic coverage.
5. Re-run all 1,600-question validation and isolated CBT tests.

All 1,600 questions remain drafts. Original question files remain unchanged by this audit. PR #194 remains unmerged; no production deployment or publication is authorised by this work.


## Audit correction — 1 November 2026 (candidate review evidence)

This correction supersedes the preceding continuation note's statement that 244 lower-ranked candidates had been individually inspected and preserved. That statement overstated the work completed: the independent recomputation enumerated candidate pairs but did not constitute contextual manual review of all 244 pairs.

The original triage records 390 within-window candidates, 41 same-topic/subtopic candidates reviewed, 349 different-topic/subtopic candidates, and 70 highest-scoring different-topic candidates reviewed. On those reported figures, **279 different-topic candidates remain pending**.

An independent recomputation from the four stored 400-question indexes using the documented same-subject character-trigram Dice threshold of 0.43 produced 352 candidates: 38 same-topic/subtopic and 314 different-topic/subtopic. This differs from the original triage by 38 candidates overall (3 same-topic/subtopic and 35 different-topic/subtopic). The original candidate-generation artifact or exact generator implementation has not yet been located, so the difference is unresolved. The independent count is a diagnostic, not a replacement for the original count and not proof of manual review.

The global findings and within-window triage registers now both record 11 within-window duplicate pairs (22 cross-window + 11 within-window = 33 total). The batch 38 row 2 / batch 39 row 5 concord pair is synchronized in both registers. No question CSV has been edited.

Next: recover or reproduce the original 390-pair candidate-generation method, reconcile all 38 count differences, and review the remaining 279 reported different-topic candidates with explicit preserve/duplicate decisions. Separately complete row-level provenance for all 33 confirmed pairs against the replacement history. Do not begin CSV replacements until both registers are complete.


## Historical row-provenance update — 1 November 2026

Targeted Git commit-patch checks have now verified **14 of the 33 confirmed duplicate pairs** as prior-replacement overlaps. The exact locations and introducing commit SHAs are recorded in `content/cbt/audits/global-duplicate-review-findings-2026-11-01.json` under `history_reconciliation.row_level_verified_overlaps`.

The 14 verified pairs cover:
- Federalism division of powers — batch 32/33
- Literary theme — batch 2/37
- Candid meaning — batch 26/30
- Public debt — batch 25/33
- Commercial-bank functions — batch 6/37
- Relative pronoun “who” — batch 31/33
- Exterior-angle sum — batch 20/36
- Phenolphthalein colour — batch 20/22
- Molten sodium chloride electrolysis — batch 20/34
- Denouement — batch 20/25
- Nucleus function — batch 10/28
- Anther/pollen production — batch 10/35
- Right-hand grip rule — batch 10/40
- Symbolism — batch 34/40

These are 14 duplicate pairs, not 14 questions; some pairs have both questions introduced by earlier replacement commits. The remaining 19 confirmed pairs still need row-level provenance checks. No question CSV has been modified.

Candidate review remains open: the original triage reports 279 different-topic candidates still pending after its reported 70 reviewed, and its 390 total does not match the independent 352-pair recomputation. The 38-pair discrepancy remains unresolved. Do not start replacement edits yet.


## Three-times-sized lower-tail audit update — 6 November 2026

- Reviewed cross-window candidate ranks **932–946** against the complete source stems, four answer options, correct-option keys and explanations. The review record is `content/cbt/audits/cross-window-tail-review-2026-11-06-part21.json`.
- Thirteen candidates were preserved as distinct assessment objectives. Rank 933 was confirmed as **DUP-160**: batch 25 row 13 and batch 40 row 15 both assess ADH-mediated water reabsorption in the collecting ducts. Batch 25 row 13 is the provisional retain; batch 40 row 15 is one new unique held target.
- Rank 937 (arithmetic-progression nth-term items) is deferred for reconciliation with earlier candidate ranks 5, 14, 19, 802 and 1120, which share one or both source rows. No new duplicate or held target is counted until those prior decisions are reconciled.
- Current cross-window progress: **416/1,304 manually reviewed; 888 remain**. Current duplicate register: **144 cross-window + 15 within-window = 159 confirmed pair relationships**, resolving to **156 unique replacement targets** (90 original + 66 additional). The 65 additional pair relationships from DUP-91–DUP-160 still require row-level provenance reconciliation and represent 66 unique held rows.
- The original source CSVs and staging CSVs remain unchanged. No replacement draft was created, no Supabase import or publication occurred, and no production data or deployment was touched.
- PR #194 remains open, draft and unmerged. This update is documentation/audit-only; it does not authorise merge, production import, publication or deployment.


## Follow-on three-times-sized lower-tail audit — 6 November 2026

- Reviewed cross-window candidate ranks **947–961** against complete source stems, options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part22.json`.
- Fourteen pairs were preserved as distinct. Rank 954 (batch 17 row 18 vs batch 32 row 19) was deferred for qualified Chemistry review: both ask for the salt formed by complete acid-base neutralisation, but use different acid/base reactants and produce different salts. No duplicate or held target is counted until the subject review resolves whether these are sufficiently distinct applications.
- Cross-window progress is now **431/1,304 manually reviewed; 873 remain**. No new confirmed duplicate relationship or replacement target was added in this batch. Existing register remains **144 cross-window + 15 within-window = 159 confirmed pairs**, resolving to **156 unique replacement targets**.
- No source CSV, staging CSV, replacement draft or production data was changed. No import, publication, merge or deployment was authorised.


## Third lower-tail audit batch — 6 November 2026

- Reviewed cross-window candidate ranks **962–976** against complete source stems, four options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part23.json`.
- Fourteen candidates were preserved as distinct. Rank 962 was confirmed as **DUP-161**: batch 19 row 10 and batch 35 row 11 both test the same set-union operation; batch 19 row 10 is retained provisionally and batch 35 row 11 is one new unique held target.
- Rank 970 was preserved as a distinct formula-based hydrostatic-pressure assessment; its batch 35 row 25 counterpart is already held under DUP-44 and was not counted again.
- Cross-window progress is now **446/1,304 manually reviewed; 858 remain**. The duplicate register now records **145 cross-window + 15 within-window = 160 confirmed pair relationships**, resolving to **157 unique replacement targets** (90 original + 67 additional). The 66 additional pair relationships from DUP-91–DUP-161 require provenance reconciliation and represent 67 unique held rows.
- No source CSV, staging CSV, replacement draft or production data was changed. No import, publication, merge or deployment was authorised.


## Fourth lower-tail audit batch — 6 November 2026

- Reviewed cross-window candidate ranks **977–991** against complete source stems, options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part24.json`.
- Fourteen candidates were preserved as distinct. Rank 980 was confirmed as **DUP-162**, extending existing esterification cluster **DUP-13**: batch 20 row 20 remains the designated retained question, batch 38 row 20 was already held, and batch 6 row 21 is one additional unique held target.
- Cross-window progress is now **461/1,304 manually reviewed; 843 remain**. The duplicate register now records **146 cross-window + 15 within-window = 161 confirmed pair relationships**, resolving to **158 unique replacement targets** (90 original + 68 additional). The 67 additional pair relationships from DUP-91–DUP-162 require provenance reconciliation and represent 68 unique held rows.
- No source CSV, staging CSV, replacement draft or production data was changed. No import, publication, merge or deployment was authorised.


## Fifth lower-tail audit batch — 6 November 2026

- Reviewed cross-window candidate ranks **1229–1243** against the complete source CSV rows, four options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part40.json`.
- Fourteen candidates were preserved as distinct. Rank 1233 was confirmed as **DUP-174**, extending the existing catalyst-mechanism cluster **DUP-91**: batch 3 row 20 remains the earliest retained anchor; batch 25 row 21 was already held; batch 12 row 21 is one additional unique held target.
- Cross-window progress is now **701/1,304 manually reviewed; 603 remain**. The duplicate register contains **158 cross-window + 15 within-window = 173 recorded pair relationships**, resolving to **168 unique replacement targets** (90 original + 78 additional). The current summary records 79 additional pair relationships pending provenance, while the explicit history unverified-ID list contains 70; this discrepancy is now documented and must be reconciled before provenance completion is claimed.
- No source CSV or staging CSV was modified. No replacement draft was created, no Supabase import or publication occurred, and no production data or deployment was touched.


## Sixth lower-tail audit batch — 6 November 2026

- Reviewed cross-window candidate ranks **1244–1258** against complete source rows, four options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part41.json`.
- Fourteen candidates were preserved as distinct. Rank 1251 was confirmed as **DUP-175**: batch 19 row 12 and batch 40 row 16 both test mammary glands as the defining mammalian feature. Retain batch 19 row 12; hold batch 40 row 16 pending provenance and staging verification.
- Cross-window progress is now **716/1,304 manually reviewed; 588 remain**. The duplicate register contains **159 cross-window + 15 within-window = 174 recorded pair relationships**, resolving to **169 unique replacement targets** (90 original + 79 additional). The summary-level provenance counter now says 80 additional relationships pending, while the explicit unverified-ID list contains 71; this remains an open reconciliation issue.
- No source or staging CSV was modified. No replacement draft, import, publication or production deployment occurred.


## Seventh lower-tail audit batch — 6 November 2026

- Reviewed cross-window candidate ranks **1259–1273** against complete source rows, four options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part42.json`.
- Fourteen candidates were preserved as distinct. Rank 1262 was confirmed as **DUP-176**: batch 6 row 37 and batch 26 row 41 both define imagery as language that evokes sensory experience. Retain batch 6 row 37; hold batch 26 row 41 pending provenance and staging verification.
- Cross-window progress is now **731/1,304 manually reviewed; 573 remain**. The duplicate register contains **160 cross-window + 15 within-window = 175 recorded pair relationships**, resolving to **170 unique replacement targets** (90 original + 80 additional). Summary-level provenance count is 81 additional relationships pending; the explicit unverified-ID list contains 72, and remains unreconciled.
- No source or staging CSV was modified. No replacement draft, import, publication or production deployment occurred.


## Eighth lower-tail audit batch — 6 November 2026

- Reviewed cross-window candidate ranks **1274–1288** against complete source rows, options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part43.json`.
- All 15 candidates were preserved as distinct assessment objectives; no new duplicate relationship or held target was added.
- Cross-window progress is now **746/1,304 manually reviewed; 558 remain**. Duplicate register remains **160 cross-window + 15 within-window = 175 pair relationships**, with **170 unique replacement targets**.
- No source/staging CSV, replacement draft or production data was changed. No import, publication or deployment occurred.


## Ninth lower-tail audit batch — 6 November 2026

- Reviewed cross-window candidate ranks **1289–1303** against complete source rows, options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part44.json`.
- All 15 candidates were preserved as distinct assessment objectives; no new duplicate relationship or held target was added.
- Cross-window progress is now **761/1,304 manually reviewed; 543 remain**. Duplicate register remains **160 cross-window + 15 within-window = 175 pair relationships**, with **170 unique replacement targets**.
- No source/staging CSV, replacement draft or production data was changed. No import, publication or deployment occurred.


## Final ranked-tail candidate — 6 November 2026

- Reviewed candidate rank **1304** against complete source rows, options, answer keys and explanations. See `content/cbt/audits/cross-window-tail-review-2026-11-06-part45.json`.
- Confirmed **DUP-177**, a further pair relationship in existing **FEDERALISM-01**. Both rows (batch 26 row 34 and batch 38 row 36) were already held; batch 32 row 34 remains the retained anchor. No additional unique replacement target was added.
- The ranked tail is now reviewed through rank **1304**. Total cross-window manual review is **762/1,304; 542 remain elsewhere in the candidate set**. Duplicate register contains **161 cross-window + 15 within-window = 176 pair relationships**, resolving to **170 unique replacement targets**.
- No source/staging CSV, replacement draft or production data was changed. No import, publication or deployment occurred.


## Fast-path verified checkpoint — 6 November 2026, 16:16 WAT

This checkpoint supersedes older progress statements above where they conflict. It records verification only; it does not authorise release.

### Audit and staging reconciliation
- Cross-window addendum records all **1,304/1,304 candidate ranks reviewed** (remaining_candidate_pairs = 0). The new addendum contains 28 new pair records and eight cluster-extension links; six extension links add unique held rows and two reuse rows already held. The two previously conflicting references are resolved: rank 684 belongs to DUP-197 (DUP-213 superseded); rank 1304 belongs to DUP-47 / FEDERALISM-01 via DUP-177 (DUP-223 superseded).
- Canonical pair history is preserved for DUP-22 + DUP-165 -> DUP-165 and DUP-08 + DUP-166 -> DUP-08. These merges do not remove any of the four distinct held source rows.
- The separate 6 November staging revision is verified: **1,476 retained + 124 held = 1,600**; 34 new held locations and 34 retained anchors join; two already-held rows are excluded; no missing locations, duplicate held locations or retained/held overlap. The 1 November baseline and all 40 original source CSVs remain unchanged.
- All 34 unique new held source rows were fetched from their original batch CSVs and checked at their recorded physical row numbers. Each has source_type=original, draft status, original EDUKEN-authored provenance notes and no third-party question text claimed. This verifies the source-row metadata, **not** the exact Git introducing-commit history for every row; commit-level provenance reconciliation remains open.
- Within-window review: the reconstructed 0.42 candidate set contains 390 pairs and all 390 have explicit review status; all 350 different-topic/subtopic candidates are contextually reviewed and reconstructed pending = 0. The 38-count discrepancy is explained by the threshold mismatch (0.42 gives 390; 0.43 gives 352). One category split remains unresolved: reconstructed 40 same-topic / 350 different-topic versus the original 41 / 349.
- The 34-row independent subject-review worksheet is a blank reviewer handoff, not approval. Qualified subject, answer-key and syllabus decisions remain outstanding. The earlier 90 replacement candidates have user-reported approval only; the repository still has 0/90 item-level independent sign-off evidence. The 34 additional held rows are outside that reported approval.

### Current technical verification
- PR #194 head: b8ab2b9616c50eb9707aa327d2439d2682a26f67. Current GitHub check-runs show build, wallet SQL integration, preview deployment and public browser checks successful; production deploy skipped.
- PR #195 head: 0a2f3a1e2eb21dcaf25876bd63a01774e32ab02e; its current recorded checks are successful, with production deploy skipped.
- PR #197 head: 56d6ed5837a7e2a341692f66be824b9e78c8372f; its current recorded checks are successful, with production deploy skipped.
- The PR #194 preview hostname resolves and serves the public homepage, /cbt and signed-out /admin page. This is reachability/page-content verification, not an authenticated admin walkthrough or full interactive student-session test.
- Read-only inspection of the isolated test project wpktzogarfqrgkirzdpy shows 73 CBT questions: 65 drafts and 8 published (one published per subject). This pool cannot satisfy the 180-question JAMB blueprint (60 Use of English + 40 from each of three additional subjects). No production Supabase project was queried or changed in this checkpoint.

### Remaining launch blockers
1. Complete exact Git introducing-commit / replacement-history provenance reconciliation for the 34 new held rows and reconcile legacy summary counters with explicit pair-ID lists.
2. Obtain qualified independent subject, answer-key and syllabus review for the 124 held rows and replacement candidates; retain the blank worksheet as a handoff until real reviewer sign-off is recorded.
3. Prepare, compare and validate replacement drafts for targets that reviewers confirm must be replaced; do not assume every cluster extension requires a replacement.
4. Build and approve a sufficiently large published-only pool, then pass the complete 180-question student mock, timer, navigation, answer persistence, submission, grading and results checks.
5. Complete an authenticated admin-session walkthrough and full isolated preview verification.
6. Keep all imports, publication, PR merges and production deployment blocked until separate explicit release approval.

### Safety
- This checkpoint changes this build-plan document only. No original source CSV, staging CSV, Supabase row, production setting, payment record, publication or deployment was changed.
- PR #194 remains open, draft and unmerged. PR #195 and PR #197 remain open, draft and unmerged.
### 5. Remaining gates and safe next actions
1. Complete the cross-window rank crosswalk: 58 overlaps are identified and 239 rank IDs are genuinely new, but the cumulative counter still differs by four and 62 rank IDs within 287–1304 lack an explicit tail-review record. Reconcile older review evidence before claiming 1,304/1,304 complete.
2. Finish Git-history classification for the 96 later-range pair IDs. Source metadata and staging membership are checked; exact introduction commits and original-draft/replacement classification remain outstanding.
3. Obtain qualified subject, answer-key and syllabus decisions for the 34 new addendum held rows and the 71 candidate targets still in retained staging. Reviewer decisions must be recorded by a qualified person.
4. Reconcile canonical cluster membership and apply held/retained dispositions only after contextual and qualified academic decisions are recorded.
5. Draft replacements only for confirmed duplicates after provenance and syllabus checks; then run a refreshed bank-wide semantic screen and validation.
6. Complete live AI assistant POST and authenticated analytics/admin testing. The one-question student practice lifecycle has passed isolated API logs and CI Chromium smoke; full mocks remain blocked by the sample-bank size.
7. Keep production import, publication, PR merge, production deployment and student launch blocked until all content and technical gates pass and separate explicit production-release approval is given.



## Authoritative fast-path checkpoint — 6 November 2026, latest audit reconciliation

This section supersedes earlier cross-window review-count statements in this file wherever they conflict. It is a documentation-only reconciliation; it does not approve content or release.

### Cross-window rank coverage
- The 81 earlier tail-review files contain 717 unique rank IDs. The three 6 November addendum segments contain 297 entries, of which 58 overlap the earlier tail set; this yields 956 unique tail ranks before part83.
- Part83 adds 62 previously missing explicit rank dispositions. The resulting tail-review union is 1,018 unique ranks, covering every rank from 287 through 1,304 with no missing tail ranks.
- The original 1 November report separately states 286 manually reviewed high-similarity candidates (49 shortlist items plus 237 targeted reviews). The 49 shortlist ranks are mapped, but the exact rank IDs for the other 237 targeted reviews are not yet crosswalked.
- The historical cumulative counter of 1,007 differs by four from the rank-derived pre-addendum count of 1,003 (286 + 717). Do not report 1,304/1,304 as a reconciled unique-rank total, or calculate a final remaining count, until the 237 baseline rank IDs and four-count discrepancy are resolved. The accurate status is: **1,018/1,018 tail ranks explicitly dispositioned; baseline crosswalk pending**.
- The within-window candidate set also remains unreconciled: the 0.42 reconstruction has 390 candidates (40 same-topic and 350 different-topic), while the original report records 390 with a 41/349 split and 279 pending from an earlier 70-reviewed count. Do not treat the reconstructed 0-pending count as proof that the original queue is closed.

### Current isolated database count — read-only query, 6 November 2026
- Direct grouped query of `public.cbt_questions` in isolated project `wpktzogarfqrgkirzdpy` returned **73 rows: 65 draft and 8 published**.
- Published distribution is exactly one question for each of the eight supported subjects. Draft distribution is eight each for seven subjects and nine for Use of English.
- This is a preview/sample bank only; it cannot support the 180-question JAMB mock (60 Use of English plus 40 each from three additional subjects). No rows were inserted, updated or deleted. Production Supabase was not queried or changed in this check.

### Release controls
- Keep source CSVs, staging CSVs and database content unchanged pending qualified academic decisions.
- Keep production import, publication, PR merge and production deployment blocked pending documented independent subject/answer-key/syllabus review, complete student mock validation, authenticated admin acceptance and separate explicit production-release approval.
