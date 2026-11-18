# R4 Execution Batch 4 — Candidate Screening and Rank Reconciliation

Date: 18 November 2026
Branch: feat/cbt-subject-combination-reconciled

## Scope and method

This was a non-destructive screening and evidence-reconciliation pass. The four retained R4 CSVs and four held R4 CSVs were read together (1,600 rows total; 200 per subject). Candidate stems and options were compared with padded character-trigram Dice similarity against the full same-subject 200-row R4 bank and the 116-item canonical replacement proposal inventory. The screening threshold was 0.42. A score below the threshold is only a lexical screen; it does not establish semantic uniqueness, answer accuracy, syllabus fit or academic approval.

## Candidate concepts screened and not advanced

No candidate in this batch met the lexical threshold and semantic-distinctness gate. The strongest source-bank comparisons were:

| Target | Candidate concept | Highest same-subject score | Highest canonical-proposal score | Outcome |
|---|---|---:|---:|---|
| DUP-215 | Rigid constitution / special amendment procedure | 0.6061 | 0.2745 | Reject; source-bank overlap |
| DUP-242 | Price elasticity calculation (15% quantity response / 5% price change) | 0.5410 | 0.3009 | Reject; source-bank overlap |
| DUP-167 | Omniscient narrator | 0.4262 | 0.2722 | Reject; above 0.42 threshold |
| DUP-156 | Ohm's law resistance calculation (12 V / 3 A) | 0.7085 | 0.3200 | Reject; source-bank overlap |
| DUP-230 | Merit-based public-service recruitment | 0.4889 | 0.3212 | Reject; source-bank overlap |
| DUP-192 | Referendum as direct public vote | 0.6583 | 0.3465 | Reject; source-bank overlap |
| DUP-103 | Improvement in terms of trade | 0.7007 | 0.2789 | Reject; source-bank overlap |
| DUP-158 | Pollination definition | 0.8361 | 0.3146 | Reject; source-bank overlap |
| DUP-220 | Dramatic irony | 0.4313 | 0.3481 | Reject; above 0.42 threshold |

The rejected alternatives are not replacement drafts and must not be counted toward the 45-target coverage. No question was imported or changed.

## Rank reconciliation — verified current position

The existing 9 November exact endpoint-to-rank crosswalk reports:
- 184 existing cross-window disposition records matched uniquely to candidate ranks.
- 49 high-similarity shortlist records matched uniquely.
- 16 ranks overlap between those sets, leaving 217 combined unique mapped ranks.
- 108 mapped ranks fall within ranks 1–286.
- 178 ranks in the 1–286 band are not represented by those pair crosswalks.

The 8 November corrected baseline crosswalk explicitly says the 286 is the number of candidate ranks meeting the score cutoff, not proof that 286 individual manual reviews occurred. Exact rank IDs for the reported baseline review records and the additional 237 targeted reviews remain unavailable in that evidence. The 1,007 cumulative counter versus the 1,003 rank-derived count remains a four-record discrepancy. Historical 472/237 and 685/717 counters also remain unresolved. No rank IDs have been inferred from arithmetic complements or score order.

## Status and safeguards

- New accepted replacement drafts in this batch: 0.
- Previously documented uncovered-target draft coverage remains 23 of 45; remaining uncovered targets without a documented draft: 22.
- Qualified independent subject/syllabus approvals created: 0.
- Question imports, status changes and publications: 0.
- Source CSVs, canonical proposal inventory and staging rows changed: 0.
- Production database and Worker changed: 0.
- PR merge or production deployment: 0.

This file records screening outcomes and the verified evidence gap only. It does not authorize import, approval, publication, merge or deployment.

## Evidence files

- `content/cbt/staging/2026-11-10-r4/retained-batches-01-10.csv`
- `content/cbt/staging/2026-11-10-r4/retained-batches-11-20.csv`
- `content/cbt/staging/2026-11-10-r4/retained-batches-21-30.csv`
- `content/cbt/staging/2026-11-10-r4/retained-batches-31-40.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-01-10.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-11-20.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-21-30.csv`
- `content/cbt/staging/2026-11-10-r4/held-duplicates-31-40.csv`
- `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`
- `content/cbt/audits/2026-11-08-cross-window-baseline-rank-crosswalk-r2.json`
- `content/cbt/audits/2026-11-09-cross-window-register-rank-crosswalk.json`
- `content/cbt/audits/2026-11-06-cross-window-rank-reconciliation-r1.json`
