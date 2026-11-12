# R4 Next Replacement Draft Batch — 12 November 2026

## Status and scope

This is a draft-only continuation of the 45-location R4 uncovered-target queue. It is based on the R4 staging bank and the current 116-proposal inventory on `feat/cbt-subject-combination-reconciled` at head `6ab3e4f018e9d21f95b3d306ea5720b9be5564e6`.

- R4 bank screened: 1,600 rows across all eight subjects.
- Existing proposal inventory screened: 116 proposals.
- New draft proposals in this batch: 2.
- Additional targets deliberately held after screening: 3.
- New drafts imported: 0.
- Questions published: 0.
- Qualified academic approvals: 0.
- Source CSVs, R4 staging CSVs, canonical proposal inventory and databases were not changed.

Lexical screening uses character-trigram Dice similarity with a 0.42 review threshold. A score below the threshold is only a screening result; it does not establish semantic uniqueness or syllabus approval.

## Draft 1 — DUP-215 (Government)

**Held source location:** batch 21, row 35  
**Held topic:** Constitution / Amendment  
**Proposed replacement topic:** Constitution / Constitutional supremacy  
**Draft ID:** R4-ADD-2026-11-12-DUP-215

**Question:** When a law made by a state legislature conflicts with a valid provision of the federal constitution, which should prevail?

A. The state law in every circumstance  
B. The federal constitution  
C. A party manifesto  
D. A customary announcement

**Correct option:** B

**Explanation:** The constitution is the supreme law of the land. A conflicting law is invalid to the extent of the inconsistency, subject to the applicable constitutional framework.

**Initial bank-wide screen:** highest same-subject trigram Dice score 0.339; no score at or above 0.42 across the 200 Government bank rows. Highest existing-proposal score 0.256; no score at or above 0.42 across the 14 Government proposals.

**Review still required:** confirm the wording against the current UTME Government syllabus and the applicable Nigerian constitutional framework; independently verify the answer and distractors. This is not academic approval.

## Draft 2 — DUP-128 (Government)

**Held source location:** batch 26, row 33  
**Held topic:** Electoral systems / Proportional representation  
**Proposed replacement topic:** Elections / Election petitions  
**Draft ID:** R4-ADD-2026-11-12-DUP-128

**Question:** In Nigeria, disputes concerning the validity of an election are generally determined by

A. election petition tribunals or the courts with jurisdiction  
B. the national census commission  
C. the ministry of foreign affairs  
D. the political parties' campaign committees

**Correct option:** A

**Explanation:** Election petitions are determined by the tribunal or court that has jurisdiction under the applicable Nigerian electoral and constitutional provisions. The proper forum depends on the office contested and the governing law.

**Initial bank-wide screen:** highest same-subject trigram Dice score 0.301; no score at or above 0.42 across the 200 Government bank rows. Highest existing-proposal score 0.316; no score at or above 0.42 across the 14 Government proposals.

**Review still required:** verify the precise jurisdictional wording and current statutory framework; confirm syllabus fit; independently validate the key and distractors. This is not academic approval.

## Targets held — no replacement added

| Target | Subject | First alternative screened | Reason held |
|---|---|---|---|
| DUP-99 | Literature in English | Writer's tone | Similarity score 0.521 against an existing bank question on poetic tone. |
| DUP-233 | Literature in English | Function of the chorus | Similarity score 0.922 against an existing bank question on the chorus in Greek drama. |
| DUP-96 | Economics | Price elasticity | Similarity score 0.564 against an existing bank question on price elasticity; another bank match scored 0.521. |

These are not approved or completed targets. They remain uncovered until a genuinely distinct, syllabus-aligned replacement is drafted and screened.

## Required independent review

For each of the two proposed questions, a qualified reviewer must record their name and relevant subject qualification, review date, syllabus mapping, answer-key check, distractor check, semantic comparison and explicit decision. Blank reviewer fields must remain blank until an actual review occurs.

## Safety and release boundary

- Draft-only work on a separate work branch.
- No canonical inventory update.
- No original question or R4 staging row modified.
- No database writes, imports, publication, merge or production deployment.
- The two proposals must not be described as approved, accepted or ready for publication.
