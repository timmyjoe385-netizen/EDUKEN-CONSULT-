# R4 Replacement Draft Batch 3 — 12 November 2026

## Working standard for a one-person project

This batch follows the owner-led, AI-assisted internal QA approach. No external academic reviewer is assumed to be available. The assistant checks wording, answer logic, distractors and similarity against the available R4 subject bank and proposal inventory. These checks are not represented as independent academic approval, official JAMB approval or a substitute for a qualified examiner.

## Scope

- Full R4 bank screened: 1,600 rows across all eight subjects.
- Existing proposal inventory screened: 116 proposals.
- Five target alternatives explored.
- Two new draft questions retained for owner review.
- Three target alternatives held because close or conceptually overlapping bank questions were found.
- New proposals imported: 0.
- Questions published: 0.
- Original CSVs, R4 staging CSVs, canonical proposal inventory and databases changed: no.

The mechanical similarity screen uses character-trigram Dice similarity. Scores at or above 0.42 trigger a close-match hold. Scores below that threshold do not prove conceptual uniqueness; the closest matching questions were also checked for topic overlap.

## Draft 1 — DUP-108 (Government)

**Held source location:** batch 22, row 35  
**Held source topic:** Public administration / Accountability  
**Draft ID:** R4-ADD-2026-11-12-DUP-108

**Question:** An applicant's file is delayed because several offices demand unnecessary forms and repeated approvals. This administrative problem is best described as

A. red-tapism  
B. delegation  
C. decentralisation  
D. transparency

**Correct option:** A

**Explanation:** Red-tapism refers to excessive official procedures, paperwork and formalities that delay administrative decisions or services.

**Internal QA:** The scenario describes unnecessary procedural delay. Delegation is the assignment of authority to another person or office; decentralisation distributes authority more widely; transparency concerns openness and access to information. These alternatives do not fit the scenario.

**Full-subject-bank screen:** Highest same-subject character-trigram Dice score 0.292 across the 200 Government questions; no score at or above 0.42. Highest existing-proposal score was below 0.42; no close lexical match was found.

**Caution:** Red-tapism is a standard public-administration concept, but its exact placement in the current UTME Government syllabus has not been independently confirmed. Keep as a draft for owner review.

## Draft 2 — DUP-96 (Economics)

**Held source location:** batch 28, row 27  
**Held source topic:** Demand and supply / Price ceiling  
**Draft ID:** R4-ADD-2026-11-12-DUP-96

**Question:** A government distributes ration coupons to consumers to share a scarce commodity fairly when quantity demanded exceeds the available supply. This is an example of

A. rationing  
B. devaluation  
C. privatisation  
D. nationalisation

**Correct option:** A

**Explanation:** Rationing is a method of allocating a limited supply of a good among consumers, often by setting quantities that each person may obtain.

**Internal QA:** The stem describes controlled allocation of a scarce good. Devaluation concerns a reduction in the value of a currency; privatisation transfers ownership or control from the public to the private sector; nationalisation transfers ownership or control to the state.

**Full-subject-bank screen:** Highest same-subject character-trigram Dice score 0.396 across the 200 Economics questions; no score at or above 0.42. Highest existing-proposal score was below 0.42; no close lexical match was found.

**Caution:** Rationing is conceptually related to shortages that may arise under price controls, but it tests a separate allocation method rather than repeating the held question's shortage outcome. Keep as a draft for owner review.

## Alternatives held after screening

| Target | Alternative | Finding | Decision |
|---|---|---|---|
| DUP-99 — Literature in English | Tragic flaw | 0.773 against an existing bank question on tragic flaw | Hold; duplicate |
| DUP-99 — Literature in English | Parody | 0.461 against an existing sound-device question; possible unrelated lexical collision, but not sufficiently clear to accept without a stronger distinct alternative | Hold |
| DUP-99 — Literature in English | Foreshadowing | 0.449 against an existing bank question on foreshadowing | Hold; duplicate |
| DUP-233 — Literature in English | Dramatic monologue | 0.564 against an existing bank question on a speech revealing inner thoughts | Hold; conceptually close |
| DUP-233 — Literature in English | Prologue | 0.618 against an existing bank question on a play's introductory section | Hold; duplicate |
| DUP-233 — Literature in English | Epilogue | 0.422 against an existing bank question on an epilogue | Hold; duplicate |
| DUP-171 — Government | Checks and balances / separation of powers | 0.754 against an existing separation-of-powers question | Hold; duplicate |
| DUP-171 — Government | Delegated legislation | 0.492 against an existing bank question on delegated legislation | Hold; duplicate |
| DUP-171 — Government | Impeachment | Existing bank already includes an impeachment question | Hold; duplicate |
| DUP-171 — Government | Rule of law | Existing bank already tests the meaning of rule of law; keep out of this replacement slot |

## Owner review notes

The two retained drafts have received AI-assisted internal checks only. The owner can read and accept, revise or reject them. No reviewer identity, qualification, approval date or independent decision has been invented. A qualified review can be added if one becomes available, but its absence does not prevent this draft-preparation workflow from continuing.

## Release boundary

- Draft-only work on the separate work branch.
- No canonical inventory update.
- No original held row or R4 staging row modified.
- No database writes, imports, publication, merge or production deployment.
- These questions are not officially approved, JAMB-endorsed or independently academically validated.
