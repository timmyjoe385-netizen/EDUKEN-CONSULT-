# R4 Replacement Draft — 14 November 2026 (Round 3)

This is a draft-only proposal for one previously uncovered held location. It does not alter the source CSV, canonical replacement inventory, staging data, database, application code, or production resources.

## DUP-41 — Biology: speciation
- Held target: batch 40 row 13
- Held concept: evolution / natural selection
- Proposed question: **The evolutionary process in which one ancestral population gives rise to two or more reproductively isolated species is called:**
- A. Adaptation
- B. Speciation
- C. Gene flow
- D. Artificial selection
- Correct answer: **B**
- Explanation: Speciation is the evolutionary process through which populations diverge and become reproductively isolated, forming distinct species. Gene flow is the movement of alleles between populations, while natural and artificial selection describe different mechanisms that can influence inherited traits.
- Difficulty: medium
- Screening: maximum padded character-trigram Dice similarity was **0.3122** against the 200-question Biology source bank, **0.2935** against the 116 canonical replacement proposals, and **0.3963** against the 20 previously extracted supplemental draft stems (nearest stem concerned gene flow).
- Disposition: below the 0.42 lexical screening threshold. The held target tests natural selection; this proposal tests speciation. The closest supplemental draft concerns gene flow, a related population-genetics concept but a distinct process. Qualified Biology review must confirm conceptual distinction and syllabus suitability.

## Screening method and limitations
- Used the existing padded character-trigram Dice method: lowercase text, punctuation normalized to spaces, two-space padding, and set-based trigram overlap.
- Compared the proposed question stem with all 200 Biology source questions, all 116 canonical replacement proposal stems, and 20 supplemental question stems extracted from previously recorded supplemental draft files.
- The 0.42 cutoff is a lexical triage threshold only. It cannot establish semantic uniqueness, answer-key accuracy, syllabus alignment, or academic quality.
- No qualified independent subject reviewer is available in the current workflow. This proposal remains unapproved and must not be imported or published.
