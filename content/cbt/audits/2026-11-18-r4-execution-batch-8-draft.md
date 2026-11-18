# R4 Execution Batch 8 — Screened Replacement Draft

Date: 18 November 2026  
Branch: `feat/cbt-subject-combination-reconciled`  
Status: Assistant-authored draft only; pending qualified Chemistry and syllabus review.

## Target

- Held target: DUP-179
- Held source location: batch 39 row 21
- Subject: Chemistry
- Held concept: Separation techniques / Chromatography
- Draft learning outcome: Calculate the retention factor (Rf) in paper chromatography.

## Proposed replacement

**Question:** In a paper chromatography experiment, a dye spot moves 4.0 cm from the baseline while the solvent front moves 8.0 cm from the same baseline. What is the Rf value of the dye?

A. 0.25  
B. 0.50  
C. 2.0  
D. 4.0

**Correct answer:** B

**Explanation:** The Rf value is the distance travelled by the substance divided by the distance travelled by the solvent front, both measured from the baseline. Therefore, Rf = 4.0 ÷ 8.0 = 0.50. Rf has no unit.

**Difficulty:** Medium  
**Topic:** Separation techniques  
**Subtopic:** Paper chromatography / Retention factor

## Screening

The complete proposed stem and options were screened using the existing padded character-trigram Dice method.

- Retained Chemistry source rows inspected: **179**. Highest score: **0.3083**, against an item asking which method separates coloured dyes in ink.
- Canonical replacement inventory: all **116** proposals checked. Highest score: **0.2390**, against DUP-81 (Physics).
- Previously documented supplemental drafts: all **26** extracted draft stems checked. Highest score: **0.2213**, against the circular-flow draft.
- All reported maxima are below the existing **0.42** lexical review threshold.

The nearest source-bank item asks which method separates ink dyes; this proposal instead tests a numerical Rf calculation. The existing chromatography questions on mobile/stationary-phase affinity are related subject matter, so a qualified reviewer must still decide whether this is sufficiently distinct and appropriate for the exact held location.

The retained-row inspection count is 179, not the full 200-row subject allocation. This is therefore a partial source-bank lexical screen, not a complete subject-bank clearance. No claim of semantic uniqueness is made.

## Required independent review

A qualified Chemistry reviewer must verify:
1. The Rf formula and calculation.
2. That both distances are measured from the same baseline.
3. Alignment with the current UTME Chemistry syllabus and expected depth.
4. Whether the calculation adds sufficient distinct learning value relative to existing chromatography items.
5. Whether the distractors are fair and unambiguous.

Record the reviewer's identity, relevant qualification, date and item-level decision. No reviewer approval is implied.

## Safety and release boundary

- New draft candidates documented in this batch: **1**.
- Cumulative documented draft coverage: **27 of 45**, conditional on the prior 26 target-location records remaining valid.
- Remaining targets without a documented draft: **18**.
- Qualified independent academic approvals created: **0**.
- Source CSVs, canonical proposal inventory and staging rows changed: **0**.
- Question imports, status changes and publications: **0**.
- Production database or Worker changed: **0**.
- PR merged or production deployment performed: **0**.

This file is an audit note on the existing feature branch only. It does not authorize import, approval, publication, merge or deployment.
