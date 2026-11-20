# R4 Replacement Draft Batches 20 and 21 — 20 November 2026

## Scope and safeguards

Continuation of the source-grounded 45-location uncovered-target queue after batches 18–19. The next two uncovered targets were selected in queue order:

- Batch 20: **DUP-118 — Government**, batch 32, row 36
- Batch 21: **DUP-112 — Biology**, batch 33, row 14

Both targets were checked against their held source descriptions in the 10 November R4 queue. Each proposed replacement was screened against the complete subject bank (retained + held) and the complete subject-specific proposal inventory.

- Government bank screened: 200 rows; existing proposals screened: 14
- Biology bank screened: 200 rows; existing proposals screened: 18
- New canonical inventory entries: 0
- Imports / publications / database writes: 0

The lexical screen uses normalized character-trigram Dice similarity on the combined stem and options. A score at or above 0.42 is a review prompt, not an automatic semantic-duplicate verdict. A lower score does not prove conceptual uniqueness.

---

## Batch 20 — DUP-118 (Government)

- **Held source location:** batch 32, row 36
- **Retained comparison location:** batch 7, row 36
- **Held topic:** International organisations / African Union
- **Held source concept:** The African Union promotes African unity, cooperation and development.
- **Draft ID:** R4-ADD-2026-11-20-DUP-118-B20
- **Proposed topic:** International organisations / ECOWAS headquarters
- **Difficulty:** Easy

**Question:** The headquarters of the ECOWAS Commission is situated in:

A. Abuja  
B. Accra  
C. Monrovia  
D. Lomé

**Correct option:** A

**Explanation:** The headquarters of the Economic Community of West African States (ECOWAS) Commission is in Abuja, Nigeria.

**Internal content checks**

- **Answer logic:** Abuja is the correct location. Accra, Monrovia and Lomé are distinct West African capitals and are not the ECOWAS Commission's headquarters.
- **Concept distinction:** The held item tests the broad objectives of the African Union. This draft tests the headquarters location of a separate regional organisation, ECOWAS.
- **Full Government source-bank screen:** all 200 rows. Highest combined stem-and-options Dice score: **0.257**, against a parliamentary-system item. The nearest ECOWAS source-bank item scored **0.398** and concerns the organisation's regional cooperation purpose, not its headquarters.
- **Existing-proposal screen:** all 14 Government proposals. Highest score: **0.238**, against a parliamentary-system proposal. No proposal score reached 0.42.
- **Syllabus caution:** A qualified Government reviewer should confirm that the specific headquarters fact is within the current UTME scope and approve the key and distractors. The international-organisations topic is relevant, but this screen alone does not establish syllabus inclusion.

---

## Batch 21 — DUP-112 (Biology)

- **Held source location:** batch 33, row 14
- **Retained comparison location:** batch 9, row 13
- **Held topic:** Plant biology / Transport in plants
- **Held source concept:** Xylem transports water and mineral salts from roots to other parts of a plant.
- **Draft ID:** R4-ADD-2026-11-20-DUP-112-B21
- **Proposed topic:** Plant biology / Seed germination
- **Difficulty:** Easy

**Question:** In a germinating bean seed, the radicle develops into the:

A. root  
B. shoot  
C. first foliage leaf  
D. seed coat

**Correct option:** A

**Explanation:** The radicle is the embryonic root of a seed. During germination it develops into the primary root, while the plumule develops into the shoot.

**Internal content checks**

- **Answer logic:** A is the only defensible answer. The radicle forms the root; the plumule forms the shoot, and the seed coat protects the seed before germination.
- **Concept distinction:** The held item tests the function of xylem in transporting water and mineral ions. This draft tests the fate of the radicle during seed germination, a different plant-biology learning outcome.
- **Full Biology source-bank screen:** all 200 rows. Highest combined stem-and-options Dice score: **0.296**, against an item on the development of the ovule after fertilisation. No source-bank score reached 0.42.
- **Existing-proposal screen:** all 18 Biology proposals. Highest score: **0.189**, against a plant-cell vacuole proposal. No proposal score reached 0.42.
- **Syllabus caution:** A qualified Biology reviewer should confirm the expected level of detail on seed structure and germination in the current UTME syllabus and approve the key and distractors.

---

## Combined screening summary

| Batch | Target | Subject | Result | Highest source-bank score | Highest proposal score |
|---|---|---|---:|---:|---:|
| 20 | DUP-118 | Government | Draft for owner/reviewer consideration | 0.257 | 0.238 |
| 21 | DUP-112 | Biology | Draft for owner/reviewer consideration | 0.296 | 0.189 |

Neither candidate triggered the 0.42 lexical review threshold in its complete subject bank or existing subject proposal set. Lexical screening is not a semantic uniqueness certificate and does not replace syllabus or academic review.

## Release boundary

- Both drafts are recorded in this audit report only; they are not added to the canonical 116-proposal inventory.
- The original source questions and R4 staging CSVs remain unchanged.
- No database write, import, approval or publication occurred.
- No merge or production deployment occurred.
- These are AI-assisted internal drafts, not independently approved questions, official JAMB questions or JAMB-endorsed content.
