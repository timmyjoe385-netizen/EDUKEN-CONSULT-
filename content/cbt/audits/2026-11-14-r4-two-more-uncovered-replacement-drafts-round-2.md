# R4 Replacement Drafts — 14 November 2026 (Round 2)

These are draft-only proposals for two previously uncovered held locations. They do not alter the source CSV, canonical replacement inventory, staging data, database, application code, or production resources.

## DUP-111 — Physics: moment of a force
- Held target: batch 37 row 25
- Held concept: circuit protection / fuse
- Proposed question: **The turning effect of a force about a pivot is called its:**
- A. Moment of force
- B. Momentum
- C. Impulse
- D. Pressure
- Correct answer: **A**
- Explanation: The moment of a force about a pivot is the turning effect produced by the force. Its magnitude is the force multiplied by the perpendicular distance from the pivot to the force's line of action.
- Difficulty: medium
- Screening: maximum padded character-trigram Dice similarity was **0.3710** against the 200-question Physics source bank, **0.3087** against the 116 canonical replacement proposals, and **0.2431** against the 20 previously extracted supplemental draft stems.
- Disposition: below the 0.42 lexical screening threshold. The held target concerns fuse/circuit protection; this draft tests moments, a different Physics learning outcome.

## DUP-226 — Biology: metaphase in mitosis
- Held target: batch 37 row 14
- Held concept: genetics / meiosis
- Proposed question: **During mitosis, the stage at which chromosomes are arranged along the equator of the cell is:**
- A. Prophase
- B. Metaphase
- C. Anaphase
- D. Telophase
- Correct answer: **B**
- Explanation: During metaphase, chromosomes align at the cell's equatorial plane before sister chromatids separate during anaphase.
- Difficulty: medium
- Screening: maximum padded character-trigram Dice similarity was **0.3537** against the 200-question Biology source bank, **0.2957** against the 116 canonical replacement proposals, and **0.2994** against the 20 previously extracted supplemental draft stems.
- Disposition: below the 0.42 lexical screening threshold. The held target tests meiosis and haploid gamete production; this draft tests the chromosome arrangement stage of mitosis. Both relate broadly to cell division, so qualified Biology review must confirm the learning-outcome distinction and syllabus suitability.

## Screening method and limitations
- Used the existing padded character-trigram Dice method: lowercase text, punctuation normalized to spaces, two-space padding, and set-based trigram overlap.
- Compared each proposed question stem with all 200 source questions in its subject, all 116 canonical replacement proposal stems, and the 20 supplemental question stems extracted from the previously recorded supplemental draft files.
- The 0.42 cutoff is a lexical triage threshold only. It cannot establish semantic uniqueness, answer-key accuracy, syllabus alignment, or academic quality.
- No qualified independent subject reviewer is available in the current workflow. Therefore both drafts remain unapproved and must not be imported or published.
