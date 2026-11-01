# EDUKEN CBT 1,600-Question Bank Build Plan

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

## Admin workflow and release gates

Authenticated admin CSV import-to-review-to-publish UI testing remains outstanding. Unauthenticated access assertions are covered by automated tests, but they do not prove that an authorized administrator can complete the entire workflow safely. Do not claim that the admin workflow is fully verified until an authenticated end-to-end test is completed.

Before a student-facing production release:
- complete and document the semantic-overlap review across all 1,600 questions;
- have subject-competent reviewers verify academic accuracy, answer keys, explanations, ambiguity, and syllabus coverage;
- test the authenticated admin import, review, approval, and publish workflow in isolation;
- import only reviewed material into the isolated project and confirm that enough published questions exist for the requested exam combinations;
- rerun all CI, browser, API, and preview checks against the final commit;
- obtain explicit release approval before any production merge, production database change, or production deployment.

## Latest repository verification

- PR #194 is open, unmerged, and still marked draft.
- Latest content head: `3d89a58af4ace7556f93f919d90482b2673a8505`; the subsequent audit-plan-only refresh is `ecc0321648cdde7ba9f032445a2b782e7a5f4bdb`.
- Build and validation/security regression tests passed, including the global exact-normalized-duplicate check across all 40 CSV batches.
- Wallet migration SQL integration passed.
- The isolated Cloudflare preview Worker deployed successfully and passed the real-CBT Chromium smoke test.
- The separate Playwright browser workflow is still running against the latest content head; its result is pending.
- The isolated guest payment recovery smoke test was skipped, not passed.
- Production deployment was skipped intentionally; no production release was performed.
- The isolated test database has only 73 questions (65 drafts, 8 published) and is insufficient for the 180-question mock.
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
