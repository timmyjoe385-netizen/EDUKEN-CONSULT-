# R4 Replacement Draft Batches 24 and 25 — 20 November 2026

## Scope and safeguards

Continuation of the 45-location uncovered-target queue after batches 22–23.

- Batch 24: **DUP-95 — Chemistry**, held source batch 34, row 21
- Batch 25: **DUP-212 — Literature in English**, held source batch 34, row 38
- Full subject banks screened: 200 Chemistry rows and 200 Literature in English rows.
- Full subject-specific canonical proposal sets screened: 17 Chemistry proposals and 14 Literature in English proposals.
- New canonical inventory entries: 0.
- Imports / publications / database writes: 0.

The lexical screen uses normalized character-trigram Dice similarity on the combined question and options. A score at or above 0.42 is a review prompt, not an automatic semantic-duplicate verdict. Lower scores do not prove conceptual uniqueness.

---

## Batch 24 — DUP-95 (Chemistry)

- **Held source location:** batch 34, row 21
- **Held topic:** Rates of reaction / Rates and temperature
- **Held source concept:** Explain why increasing temperature usually increases reaction rate.
- **Draft ID:** R4-ADD-2026-11-20-DUP-95-B24
- **Proposed topic:** Nuclear chemistry / Penetrating power of nuclear radiation
- **Difficulty:** Medium

**Question:** Which type of nuclear radiation has the greatest penetrating power?

A. Gamma radiation  
B. Alpha radiation  
C. Beta radiation  
D. Proton radiation

**Correct option:** A

**Explanation:** Gamma radiation consists of high-energy electromagnetic waves and is more penetrating than alpha or beta radiation. Alpha particles are stopped by paper or the outer layer of skin, while beta radiation is more penetrating than alpha but less penetrating than gamma.

**Internal content checks**

- **Answer logic:** Gamma radiation is the most penetrating of the three common nuclear emissions considered at this level. Alpha and beta are charged particles; gamma radiation is uncharged electromagnetic radiation.
- **Concept distinction:** The held item tests the effect of temperature on reaction rate. This draft tests the relative penetrating powers of nuclear emissions.
- **Full Chemistry bank screen:** all 200 rows. Highest combined stem-and-options Dice score: **0.249**, against a crystallisation question. The closest nuclear item is the retained beta-minus emission question at **0.246**, which tests the identity of a particle emitted in beta decay, not relative penetrating power.
- **Existing-proposal screen:** all 17 Chemistry proposals. Highest score: **0.228**, against DUP-174 (saponification). The nuclear proposal DUP-64 (half-life) scored **0.154**. No proposal score reached 0.42.
- **Syllabus caution:** A qualified Chemistry reviewer should confirm the treatment of nuclear radiation and verify the comparison and distractors against the current UTME syllabus.

---

## Batch 25 — DUP-212 (Literature in English): alternatives screened and held

- **Held source location:** batch 34, row 38
- **Held topic:** Poetry / Stanza
- **Held source concept:** Identify a group of lines forming a unit within a poem.

### Alternative A — caesura

Proposed stem: “In poetry, a deliberate pause within a line, often indicated by punctuation, is called a:”

- Full Literature bank: highest similarity **0.714** against an existing retained question defining a pause within a line of poetry.
- Existing proposal inventory: highest similarity **0.494** against DUP-62 (enjambment).
- **Decision: REJECT.** The candidate repeats an existing learning outcome and is not a distinct replacement.

### Alternative B — elegy

Proposed stem: “A poem written to mourn the death of a person is known as a/an:”

- Full Literature bank: closest items include an existing question defining an elegy (score **0.323**) and a poem-form item on praise or celebration (score **0.417**).
- Existing proposal inventory: no high lexical match, but the source-bank evidence shows the same elegy learning outcome is already present.
- **Decision: REJECT.** The bank already tests the meaning and purpose of an elegy; a reworded version would not provide a distinct learning outcome.

**Batch 25 disposition:** **HOLD — no replacement draft retained.** DUP-212 remains uncovered until a genuinely different, syllabus-aligned learning outcome can be identified. Do not force-fill the target.

---

## Combined screening summary

| Batch | Target | Subject | Result | Highest source-bank score | Highest proposal score |
|---|---|---|---:|---:|---:|
| 24 | DUP-95 | Chemistry | Draft for owner/reviewer consideration | 0.249 | 0.228 |
| 25 | DUP-212 | Literature in English | Alternatives rejected; target remains held | 0.714 (rejected caesura) | 0.494 (rejected caesura) |

The Batch 24 draft did not trigger the 0.42 lexical review threshold in its complete subject bank or existing proposal set. Its closest nuclear-bank item tests a different fact, but academic review remains necessary. Batch 25 was deliberately left uncovered rather than introducing a duplicate.

## Release boundary

- The Batch 24 draft is recorded in this audit report only; it is not added to the canonical 116-proposal inventory.
- Batch 25 has no retained replacement draft.
- Original source questions, R4 staging CSVs and canonical inventory remain unchanged.
- No database write, import, approval or publication occurred.
- No merge or production deployment occurred.
- These are AI-assisted internal drafts, not independently approved questions, official JAMB questions or JAMB-endorsed content.
