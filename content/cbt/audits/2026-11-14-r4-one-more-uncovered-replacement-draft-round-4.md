# R4 Replacement Draft — 14 November 2026 (Round 4)

This is a draft-only proposal for one previously uncovered held location. It does not alter the source CSV, canonical replacement inventory, staging data, database, application code, or production resources.

## DUP-118 — Government: African Court on Human and Peoples' Rights
- Held target: batch 32 row 36
- Held concept: African Union purpose and objectives
- Proposed question: **The African Court on Human and Peoples' Rights has its seat in:**
- A. Arusha, Tanzania
- B. Addis Ababa, Ethiopia
- C. Nairobi, Kenya
- D. Abuja, Nigeria
- Correct answer: **A**
- Explanation: The African Court on Human and Peoples' Rights is based in Arusha, Tanzania. It is a continental judicial institution that complements the protective mandate of the African Commission on Human and Peoples' Rights.
- Difficulty: medium
- Screening: maximum padded character-trigram Dice similarity was **0.2180** against the 200-question Government source bank, **0.2358** against the 116 canonical replacement proposals, and **0.1818** against the 21 previously extracted supplemental draft stems.
- Disposition: below the 0.42 lexical screening threshold. The held target asks about the African Union's broad purpose; this proposal tests the location of a specific African human-rights judicial institution. The common continental-institution context should still be checked by a qualified Government reviewer.

## Screening method and limitations
- Used padded character-trigram Dice similarity: lowercase text, punctuation normalized to spaces, two-space padding, and set-based trigram overlap.
- Compared the full proposed stem plus four options against all 200 Government source questions, all 116 canonical replacement proposals, and 21 supplemental stems extracted from the previously recorded draft documents.
- The 0.42 cutoff is a lexical triage threshold only. It cannot establish semantic uniqueness, factual accuracy, syllabus alignment, or academic quality.
- No qualified independent subject reviewer is available in the current workflow. This proposal remains unapproved and must not be imported or published.
