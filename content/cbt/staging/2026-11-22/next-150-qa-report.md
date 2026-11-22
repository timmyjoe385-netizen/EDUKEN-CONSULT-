# EDUKEN CBT — next 150 question batch QA report

Date: 2026-11-22
Branch: `content/cbt-next-150-new-subjects`
Scope: staging content only; production database and published questions were not changed.

## Files
- `crs-next-50.csv` — 50 Christian Religious Studies questions
- `commerce-next-50.csv` — 50 Commerce questions
- `principles-of-accounts-next-50.csv` — 50 Principles of Accounts questions
- `next-150-combined.csv` — combined import candidate

## Confirmed counts
| Subject | Questions | Easy | Moderate | Challenging | Distinct topic labels |
|---|---:|---:|---:|---:|---:|
| Christian Religious Studies | 50 | 8 | 25 | 17 | 50 |
| Commerce | 50 | 8 | 25 | 17 | 19 |
| Principles of Accounts | 50 | 8 | 25 | 17 | 18 |
| **Total** | **150** | **24** | **75** | **51** | — |

## Automated structural and duplication checks
- 150 rows total; 50 rows per canonical subject.
- Required fields complete.
- Four distinct options per question.
- Valid A–D answer keys.
- Allowed difficulty labels only.
- Answer-key positions balanced per subject: A=13, B=13, C=12, D=12.
- Topic coverage meets the staging thresholds (CRS 25+, Commerce 12+, Principles of Accounts 14+).
- No exact stem duplicates against the existing 150-question first batch.
- No high-threshold near-duplicate pairs (0.88 similarity threshold) within this batch or against the existing first batch.
- No near-duplicate pairs found within the new batch.

## Content QA notes
- Numerical accounting items were recalculated during review. The bank-reconciliation adjustment and straight-line depreciation key/explanation were corrected before this report.
- Questions are original EDUKEN practice items with source/provenance and licensing notes; they are not represented as official JAMB past questions.
- The checks above are structural and screening checks, not a substitute for a subject specialist's final review or a live test import.

## Release status
**Ready for isolated test import as drafts only. Not imported or published.**
No production changes were made. Production import/publication still requires explicit approval.
