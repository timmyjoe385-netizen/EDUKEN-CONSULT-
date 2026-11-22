# EDUKEN CBT — 50-question starter bank QA

## Scope

This staged batch contains 150 original EDUKEN practice questions:

| Canonical subject | Student-facing name | Questions | Distinct topic labels |
|---|---|---:|---:|
| Christian Religious Studies | Christian Religious Studies (CRS) | 50 | 48 |
| Commerce | Commerce | 50 | 21 |
| Principles of Accounts | Financial Accounting (Principles of Accounts) | 50 | 27 |
| **Total** | | **150** | |

The question CSV is at `content/cbt/staging/2026-11-21/new-subjects-50-each.csv`.

## Automated structural checks performed

- Exactly 50 rows for each canonical subject (150 rows total).
- All required template columns populated; optional source year left blank for original questions.
- Four non-empty, distinct options per row.
- Every answer key is A, B, C or D.
- Explanation, difficulty, original-source, provenance and licensing fields are populated.
- Answer-key distribution is balanced.

| Subject | A | B | C | D | Easy | Medium | Hard |
|---|---:|---:|---:|---:|---:|---:|---:|
| Christian Religious Studies | 13 | 12 | 13 | 12 | 28 | 17 | 5 |
| Commerce | 13 | 12 | 13 | 12 | 34 | 12 | 4 |
| Principles of Accounts | 13 | 12 | 14 | 11 | 25 | 19 | 6 |

An exact duplicate screen and a high-threshold near-duplicate screen were run within this 150-row batch; no matches were found.

## Comparison against the existing question bank

The 150 draft stems were compared against the 1,563 question rows present in the isolated EDUKEN test database (the existing eight-subject bank: Biology, Chemistry, Economics, Government, Literature in English, Mathematics, Physics and Use of English).

The first cross-bank screen flagged two Commerce items for manual review:
- One was an exact stem overlap with an Economics item about the traditional reward for land. It was replaced with an applied natural-resource classification question.
- One was a high-similarity overlap with an Economics balance-of-trade definition item. It was replaced with a numerical balance-of-trade scenario.

After those revisions, the full 150-versus-1,563 stem comparison returned **no candidates at the configured 0.50 similarity-review threshold**. This is a text-similarity screen, not proof of conceptual uniqueness. The comparison used the isolated test database and did not alter its records.

## Editorial content pass (22 November 2026)

A full editorial read-through of all 150 stems, options, answer keys and explanations was completed. It covered biblical names, events and chronology; Commerce terminology and trade concepts; and accounting treatment, concepts and worked calculations. No clear factual, answer-key or calculation error was identified in that pass. This was an editorial review by the project assistant, not a substitute for subject-teacher review.

## Independent subject-teacher review (22 November 2026)

Independent subject-review confirmations have now been received for all three sets:

| Subject | Syllabus relevance / academic correctness | Options and answer keys | Corrections requested | Result |
|---|---|---|---|---|
| Christian Religious Studies (CRS) | Yes | Yes | No | Suitable for student practice |
| Commerce | Yes | Yes | No | Suitable for student practice |
| Financial Accounting (canonical subject: Principles of Accounts) | Yes | Yes | No | Suitable for student practice |

**Review outcome: 3 of 3 subjects reviewed; 150 of 150 questions covered by positive subject-review confirmations. No corrections were requested.** The confirmations were supplied as written responses to the three review questions. Reviewer names, qualifications and individual question-level annotations were not supplied in the responses; this report therefore records the confirmations without inventing reviewer identities or claiming a named certification.

## Source and originality

Questions are newly written for EDUKEN and are not represented as official JAMB past questions, leaked questions or predictions. The JAMB syllabus is used as a topic-alignment reference:

- JAMB IBASS syllabus portal: https://ibass.jamb.gov.ng/e-syllabus
- CRS syllabus: https://ibass.jamb.gov.ng/static/media/CRS.7f96f8e535ca408ca474.pdf
- Commerce syllabus: https://ibass.jamb.gov.ng/static/media/Commerce.819d9c6929bc849d1cd9.pdf
- Principles of Accounts syllabus: https://ibass.jamb.gov.ng/static/media/Principles-of-Accounting.64fc902ad37449d1f6ff.pdf

## Release status

**Staged draft only.** The CSV has been imported into the isolated EDUKEN test project only (batch `5978a235-0ed8-41f6-8195-60a8c510a313`): 150 rows inserted, 150 unique fingerprints, all 150 remain in `draft` status, and zero are published. No production Supabase project, live student data, or production question bank was changed.

Teacher review confirmations are complete. Remaining release gates include final CI/browser verification, any required repository-level bank validation, and explicit owner approval before any production import, merge or publication. The eventual 200-per-subject target remains unchanged; this is only the first 50-question tranche for each subject.
