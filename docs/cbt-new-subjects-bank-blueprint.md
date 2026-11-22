# EDUKEN CBT — new-subject question-bank blueprint

## Scope

Add 200 original questions each for these three JAMB subjects:

| Canonical database subject | Student-facing label | Target |
|---|---|---:|
| Christian Religious Studies | Christian Religious Studies (CRS) | 200 |
| Commerce | Commerce | 200 |
| Principles of Accounts | Financial Accounting (Principles of Accounts) | 200 |

"Accounting" and "Financial Accounting" are not separate UTME subjects in this bank. The canonical subject key is **Principles of Accounts**, aligned to the JAMB subject list and syllabus.

## Syllabus coverage

- **Christian Religious Studies:** cover all four syllabus sections and distribute questions across the 52 listed topics. Target 200 questions, with at least 25 distinct topic labels represented.
- **Commerce:** cover the 16 syllabus topic blocks, with at least 12 distinct topic labels represented.
- **Principles of Accounts:** cover the 18 syllabus topic blocks, with at least 14 distinct topic labels represented.

Question sets must test knowledge, interpretation, application and practical problem-solving rather than repeating definitions in slightly different wording. Accounting items should include worked numerical scenarios where appropriate. CRS items should be grounded in the cited biblical passages and distinguish the relevant people, events and teachings carefully. Commerce items should use realistic Nigerian and international trade/business contexts without inventing current legal rates or policy facts.

## Originality and provenance

All new items must be written as original EDUKEN practice questions. Do not copy JAMB past-question wording, commercial question-bank wording, or textbook exercises. Do not label original questions as official JAMB questions or predictions.

Each row must contain:
- one canonical subject and a syllabus topic;
- a clear stem with exactly four distinct options (A–D);
- one unambiguous correct option;
- a concise explanation that justifies the key;
- difficulty (easy, medium or hard);
- original-content provenance and usage-rights notes.

## Automated release gates

The bank is not eligible for import unless all checks pass:

1. Exactly 200 rows for each of the three canonical subjects.
2. Required fields complete; no blank stems, options, keys or explanations.
3. Exactly four non-empty, distinct options per question.
4. Correct key is A, B, C or D; answer distribution is not excessively concentrated.
5. All rows are original content; no past-question or unlicensed source rows.
6. Required topic coverage and all three difficulty levels are represented.
7. Exact duplicate fingerprint check against the existing bank and within the new batch.
8. High-threshold near-duplicate screen within each new subject.
9. Separate answer-key consistency pass; ambiguous or uncertain items are excluded rather than guessed.
10. Import counts reconcile exactly before any student-facing publication.

The automated validator is implemented in `scripts/cbt-bank-validation.mjs` and can be run with `node scripts/validate-cbt-bank.mjs <csv-file>`. It is a structural and duplication gate, not proof of academic correctness; the separate answer-key consistency pass remains necessary. No teacher approval queue is required for this workflow.

## Low-cost deployment sequence

1. Generate original questions in batches of 50 per subject.
2. Run the automated checks on each batch and the combined 600-row bank.
3. Run the separate answer-key consistency pass and remove unresolved items.
4. Import to the isolated Supabase project first; verify subject totals and sample attempts.
5. Use one production import transaction for the exact approved-by-automation batch; retain its CSV, QA report and import-batch record for traceability.
6. Deploy the subject-selector/API changes and publish the question bank together, then smoke-test subject practice and mixed mocks.

No paid question-bank API, paid AI API, new Supabase project, or additional hosting service is required.

## Reference sources

- JAMB 2026 UTME approved subject list: https://www.jamb.gov.ng/PDFs/2026/2026%20TRAINING%20MANUAL%20%20final.pdf
- JAMB IBASS syllabus portal: https://ibass.jamb.gov.ng/e-syllabus
- Christian Religious Studies syllabus: https://ibass.jamb.gov.ng/static/media/CRS.7f96f8e535ca408ca474.pdf
- Commerce syllabus: https://ibass.jamb.gov.ng/static/media/Commerce.819d9c6929bc849d1cd9.pdf
- Principles of Accounts syllabus: https://ibass.jamb.gov.ng/static/media/Principles-of-Accounting.64fc902ad37449d1f6ff.pdf
