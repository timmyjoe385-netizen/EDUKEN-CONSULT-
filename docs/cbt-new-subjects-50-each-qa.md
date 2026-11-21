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

An exact duplicate screen and a high-threshold near-duplicate screen were run within this 150-row batch; no matches were found. This batch has not yet been compared against the existing eight-subject question bank. The three new subjects were not present in the existing published bank at the time this work was planned.

## Content and answer-key review

The stems, answer keys and explanations were checked for internal consistency during authoring. CRS items use familiar biblical narratives and teachings; Commerce items use general trade and business principles; Principles of Accounts includes worked calculations and applied accounting scenarios.

**Important limitation:** this is an initial draft review, not an independent sign-off by a qualified CRS, Commerce or Financial Accounting subject teacher. Any uncertain item identified during independent review should be corrected or removed before approval.

## Source and originality

Questions are newly written for EDUKEN and are not represented as official JAMB past questions, leaked questions or predictions. The JAMB syllabus is used only as a topic-alignment reference:

- JAMB IBASS syllabus portal: https://ibass.jamb.gov.ng/e-syllabus
- CRS syllabus: https://ibass.jamb.gov.ng/static/media/CRS.7f96f8e535ca408ca474.pdf
- Commerce syllabus: https://ibass.jamb.gov.ng/static/media/Commerce.819d9c6929bc849d1cd9.pdf
- Principles of Accounts syllabus: https://ibass.jamb.gov.ng/static/media/Principles-of-Accounting.64fc902ad37449d1f6ff.pdf

## Release status

**Staged draft only.** The CSV has not been imported into Supabase, approved, or published. No student-facing question bank or production data has been changed. Before import, run the repository's full bank validator with the 50-per-subject batch target, compare against the existing bank, perform independent subject review, and import into the isolated test project first. The eventual 200-per-subject target remains unchanged; this is only the first 50-question tranche for each subject.
