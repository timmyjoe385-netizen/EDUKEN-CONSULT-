# EDUKEN CBT — within-window threshold reconciliation

**Date:** 2026-11-08  
**Branch:** `feat/cbt-subject-combination-reconciled`  
**Scope:** Audit-only reconciliation of the previously reported 38-candidate within-window count difference. No question text, source CSV, staging CSV, database row, review decision, or publication was changed.

## Reconciled counts

The source audit reports 390 within-window candidates and a 41/349 split between same-topic/subtopic and different-topic/subtopic candidates. The independent reconstruction establishes that the 390 total is reproduced at Dice threshold **0.42**, with a **40/350** split.

A separate reconstruction at threshold **0.43** produces **352** candidates, split **38/314**. Therefore:

- The apparent **38-candidate total difference** is explained by comparing different similarity thresholds (390 at 0.42 versus 352 at 0.43). It is not evidence that 38 candidate decisions are missing.
- The one-pair category split remains unresolved: the original report says 41/349, while the 0.42 reconstruction says 40/350. Preserve this as a documented one-pair classification/normalization boundary discrepancy.
- The original report's **279 pending** figure is calculated as 349 reported different-topic candidates minus 70 previously reviewed. It must not be treated as a fully materialized current review queue because the 0.43 reconstruction finds only 314 different-topic candidates and the original pair-level rank mapping is incomplete.

## Safe disposition

1. Record the 38-count difference as **threshold mismatch explained**.
2. Keep the one-pair category-boundary check open.
3. Do not mark the 279 figure as a verified current pending queue.
4. Do not convert lexical similarity candidates into duplicate verdicts without contextual review.
5. Keep all source and staging rows unchanged pending qualified subject review.

## Evidence references

- `content/cbt/audits/within-window-candidate-triage-2026-11-01.json`
- `content/cbt/audits/within-window-reconstructed-candidates-2026-11-01.json`
- `content/cbt/audits/within-window-review-queue-2026-11-01.json`

**Result:** The 38-count discrepancy is reconciled by threshold provenance; the one-pair category boundary and independent subject review remain open.
