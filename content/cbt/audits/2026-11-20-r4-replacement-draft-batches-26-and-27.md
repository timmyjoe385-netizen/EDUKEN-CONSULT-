# R4 Replacement Draft Batches 26 and 27 — 20 November 2026

## Scope

- Batch 26: **DUP-134 — Biology**, held source batch 35, row 13
- Batch 27: **DUP-242 — Economics**, held source batch 35, row 30
- Full subject banks screened: 200 Biology rows and 200 Economics rows.
- Full subject-specific canonical proposal sets screened: 18 Biology proposals and 20 Economics proposals.
- No new draft was retained; no canonical inventory change, import, publication or database write occurred.

Lexical similarity uses normalized character-trigram Dice on the combined question and options. A score at or above 0.42 is a review prompt, not an automatic semantic-duplicate verdict.

---

## Batch 26 — DUP-134 (Biology): candidate rejected

- **Held concept:** Red blood cells contain haemoglobin and transport most oxygen.
- **Candidate screened:** A question asking which blood component forms a temporary plug at a damaged blood vessel.
- **Full Biology bank:** highest similarity **0.599** against an existing question on the blood component responsible for clot formation; another platelet-plug question scored **0.548**.
- **Existing proposal inventory:** highest similarity **0.498** against DUP-22 (blood plasma).
- **Decision: REJECT.** The candidate repeats an already-covered blood-clotting learning outcome and is too close to existing blood-component coverage. DUP-134 remains uncovered.

## Batch 27 — DUP-242 (Economics): candidate rejected

- **Held concept:** Marginal utility is the additional satisfaction from consuming one more unit.
- **Candidate screened:** A question asking when total utility is at its maximum in relation to marginal utility.
- **Full Economics bank:** highest similarity **0.429** against an equi-marginal consumer-equilibrium question and **0.427** against the retained marginal-utility definition.
- **Existing proposal inventory:** highest similarity **0.378** against DUP-82 (law of diminishing marginal utility).
- **Decision: REJECT.** The candidate remains within the same narrow utility/marginal-utility learning-outcome cluster and does not provide a sufficiently distinct replacement. DUP-242 remains uncovered.

---

## Combined disposition

| Batch | Target | Subject | Result | Highest source-bank score | Highest proposal score |
|---|---|---|---:|---:|---:|
| 26 | DUP-134 | Biology | Candidate rejected; target held | 0.599 | 0.498 |
| 27 | DUP-242 | Economics | Candidate rejected; target held | 0.429 | 0.378 |

No candidate is added to the proposal inventory. Do not force-fill either target. New alternatives must test genuinely different syllabus-aligned learning outcomes.

## Release boundary

- No source questions, staging CSVs or canonical proposal records were modified.
- No database write, import, approval or publication occurred.
- No merge or production deployment occurred.
- No independent academic approval is claimed.
