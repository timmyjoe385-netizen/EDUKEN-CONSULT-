# R4 Replacement Draft Batch 2 — 12 November 2026

## Working approach

EDUKEN is currently being built and maintained by one person. This workflow therefore does not assume that an external academic reviewer is available. The assistant can help with question drafting, answer-key checks, distractor checks, syllabus-topic checks where the syllabus text is available, and duplicate screening. These checks are documented as **AI-assisted internal QA**, not as independent academic approval or a substitute for a qualified human examiner.

The owner can continue building the question bank without recruiting a reviewer at this stage. The safe boundary is that unverified questions remain draft-only and are not represented as officially approved, JAMB-endorsed, or publication-ready.

## Scope and checks

- R4 bank screened: 1,600 rows across all eight subjects.
- Existing proposal inventory screened: 116 proposals.
- Candidate alternatives prepared for five targets.
- Two proposals retained for draft-only use after the initial lexical screen.
- Three alternatives rejected or held because close matches already exist.
- New proposals imported: 0.
- Questions published: 0.
- Database, original CSVs, R4 staging CSVs and canonical proposal inventory changed: no.

The lexical screen uses character-trigram Dice similarity. A score at or above 0.42 triggers a close-match hold. A lower score is only a mechanical screening result; it cannot establish conceptual uniqueness.

## Draft 1 — DUP-165 (Biology)

**Held source location:** batch 27, row 12  
**Held source topic:** Transport / Blood clotting  
**Draft ID:** R4-ADD-2026-11-12-DUP-165

**Question:** Which type of white blood cell can engulf and digest invading microorganisms?

A. Phagocytes  
B. Red blood cells  
C. Platelets  
D. Plasma

**Correct option:** A

**Explanation:** Phagocytes are white blood cells that protect the body by engulfing and digesting pathogens through phagocytosis.

**Internal checks:** The question tests a different biological function from the held platelet-plug question. The key is consistent with the definition of phagocytosis. The distractors are other blood components or blood constituents, rather than alternative names for phagocytes.

**Initial bank-wide screen:** highest same-subject trigram Dice score 0.290; no score at or above 0.42 across the 200 Biology bank rows. No score at or above 0.42 against the 14 existing Biology proposals.

**Remaining caution:** The concept is standard human defence/transport content, but its exact placement in the current UTME Biology syllabus has not been independently confirmed. Keep as a draft.

## Draft 2 — DUP-133 (Economics)

**Held source location:** batch 25, row 27  
**Held source topic:** Market failure / Externalities  
**Draft ID:** R4-ADD-2026-11-12-DUP-133

**Question:** A public good is generally characterised by

A. rivalry in consumption and easy exclusion of non-payers  
B. non-rivalry in consumption and difficulty excluding non-payers  
C. production only by private monopolies  
D. consumption by one person preventing all others from using it

**Correct option:** B

**Explanation:** A public good is generally non-rival in consumption and non-excludable, meaning one person's use does not substantially reduce availability to others and it is difficult to prevent people from benefiting.

**Internal checks:** The key captures the two standard characteristics of a pure public good. Option A describes characteristics associated with private goods; C and D are not defining characteristics of public goods.

**Initial bank-wide screen:** highest same-subject trigram Dice score 0.349; no score at or above 0.42 across the 200 Economics bank rows. No score at or above 0.42 against the 14 existing Economics proposals.

**Remaining caution:** The wording describes a pure public good; some real-world goods are mixed or quasi-public. Keep as a draft.

## Alternatives held after screening

| Target | Alternative screened | Highest same-subject match | Decision |
|---|---|---|---|
| DUP-176 — Literature in English | Symbolism definition | 0.633 against an existing bank question on symbolism | Hold; too close |
| DUP-176 — Literature in English | Stream of consciousness | 0.792 against an existing bank question on stream of consciousness | Hold; duplicate |
| DUP-176 — Literature in English | Caesura | 0.800 against an existing bank question on caesura | Hold; duplicate |
| DUP-171 — Government | Separation of powers | 0.754 against an existing bank question on separation of powers | Hold; duplicate |
| DUP-171 — Government | Delegated legislation | 0.492 against an existing bank question on delegated legislation | Hold; duplicate |
| DUP-133 — Economics | Opportunity cost | 0.444 against an existing bank question on opportunity cost | Hold; duplicate |
| DUP-133 — Economics | Free-rider problem | 1.000 against an existing bank question on the free-rider problem | Hold; exact duplicate |
| DUP-165 — Biology | Pulmonary circulation / heart valves | 0.938 / 0.712 against existing bank questions | Hold; too close |
| DUP-165 — Biology | White-cell phagocytosis | 0.290 against nearest same-subject question | Retained as a draft |

## Owner-friendly quality process

For this one-person project, the repeatable process is:

1. Draft a replacement that tests a distinct learning outcome.
2. Check that the answer key is correct and that only one option is defensible.
3. Check each distractor for plausibility and ambiguity.
4. Compare it with all 200 questions in its subject and the current proposal inventory.
5. Mark the result as AI-assisted internal QA, with any uncertainty recorded.
6. Keep it in draft status. Do not import or publish until the owner has reviewed the wording and is comfortable accepting responsibility for the content.

No external reviewer name, credential, date or approval is fabricated or required to be filled in. A future qualified review can be added if it ever becomes available, but it is not a blocker to continuing the draft preparation work.

## Safety and release boundary

- Draft-only work on a separate work branch.
- No canonical inventory update.
- No original question or R4 staging row modified.
- No database writes, imports, publication, merge or production deployment.
- These proposals are not officially approved, JAMB-endorsed or independently academically validated.
