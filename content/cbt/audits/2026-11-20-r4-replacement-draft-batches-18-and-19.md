# R4 Replacement Draft Batches 18 and 19 — 20 November 2026

## Scope and safeguards

This continuation uses the next two targets identified in the original 45-location queue after the Batch 16–17 work: DUP-180 and DUP-117. Each target was checked against its exact held source location in the 10 November R4 staging export. Screening covers the full 200-question subject bank (retained plus held) and the complete subject-specific portion of the 116-item proposal inventory.

- Batch 18 target: **DUP-180 — Economics**, held source batch 30, row 28
- Batch 19 target: **DUP-117 — Government**, held source batch 31, row 32
- Full subject-bank rows screened: 200 Economics; 200 Government
- Existing proposal inventory screened: all 20 Economics proposals and all 14 Government proposals (from the 116-item inventory)
- New canonical inventory entries: 0
- Imports / publications / database writes: 0

The lexical screen uses character-trigram Dice similarity on the combined stem and options. A score at or above 0.42 is a review prompt, not an automatic semantic-duplicate verdict. A lower score does not prove conceptual uniqueness.

---

## Batch 18 — DUP-180 (Economics)

- **Held source location:** batch 30, row 28
- **Retained comparison location:** batch 5, row 31
- **Held topic:** Production / Producer subsidies
- **Held source concept:** A government subsidy lowers producers' effective production costs and may encourage supply.
- **Draft ID:** R4-ADD-2026-11-20-DUP-180-B18
- **Proposed topic:** Industry and industrialisation / Localization of industry
- **Difficulty:** Medium

**Question:** A group of cement manufacturers establishes several plants in the same area near limestone deposits and major transport routes. This concentration of similar industries in one area is best described as:

A. localization of industry  
B. diversification of production  
C. nationalization of industry  
D. price discrimination

**Correct option:** A

**Explanation:** Localization of industry occurs when firms in the same or closely related industries concentrate in a particular geographical area. Such concentration may be encouraged by access to raw materials, transport, skilled labour, suppliers and supporting infrastructure.

**Internal content checks**

- **Answer logic:** A is the only defensible answer. The stem describes a geographical concentration of similar industrial firms. Diversification concerns expanding into different products or activities; nationalization transfers ownership to the state; price discrimination concerns charging different prices to different buyers.
- **Concept distinction:** The held item tests the effect of producer subsidies on production costs. This alternative tests the geographical concentration of related industries, a separate Economics learning outcome.
- **Source-bank screen:** Highest combined stem-and-options character-trigram Dice score: **0.330**, against a Price discrimination item. The shared wording is general commercial/economic language; the tested concepts differ. No source-bank score reached 0.42 across all 200 Economics rows.
- **Existing-proposal screen:** Highest score: **0.320**, against proposal DUP-76 (negative externalities). No proposal score reached 0.42 across all 20 Economics proposals.
- **Syllabus fit:** JAMB Economics syllabus Topic 17, Industry and Industrialization, explicitly includes the concepts and effects of location and localization of industry in Nigeria. Its objectives include distinguishing location from localization and identifying factors influencing them. The proposed item tests localization. 
- **Remaining caution:** A qualified Economics reviewer should confirm the distinction between location and localization, check that the phrase “similar industries” is sufficiently precise, and approve the key and distractors before any future import.

---

## Batch 19 — DUP-117 (Government): screened and held

- **Held source location:** batch 31, row 32
- **Retained comparison location:** batch 7, row 33
- **Held topic:** Parliamentary system / Vote of no confidence
- **Held source concept:** A vote of no confidence indicates that the legislature has withdrawn support for the government.

**Alternative screened but not retained**

When a government loses a formal vote of confidence in a parliamentary legislature, the prime minister is generally expected to:

A. resign or advise the dissolution of parliament  
B. appoint judges to the superior courts  
C. suspend the constitution indefinitely  
D. transfer legislative powers to the armed forces

**Screen result**

- **Full Government source-bank screen:** all 200 retained-plus-held rows.
- **Highest combined stem-and-options character-trigram Dice score:** **0.488**, against a retained question on the meaning of a successful motion of no confidence.
- **Other close source-bank matches:** **0.471** against the held DUP-117 source question itself; **0.452** against a ministerial-responsibility question.
- **Existing-proposal screen:** all 14 Government proposals. Highest score: **0.394**, against proposal DUP-47-ADD-2026-11-09 (confederation).
- **Decision:** **HOLD — DO NOT RETAIN.** Although the alternative changes the wording and asks about a possible consequence, it still tests the same confidence-motion outcome already covered in the bank. The 0.488 match and contextual overlap make it unsuitable as a distinct replacement for this slot.
- **Next action:** Leave DUP-117 uncovered until a genuinely different, syllabus-aligned learning outcome is identified. Do not force-fill this target.

---

## Combined screening summary

| Batch | Target | Subject | Result | Highest source-bank score | Highest proposal score |
|---|---|---|---|---:|---:|
| 18 | DUP-180 | Economics | Draft retained for owner review | 0.330 | 0.320 |
| 19 | DUP-117 | Government | Alternative rejected; target remains held | 0.488 | 0.394 |

Batch 18 is an AI-assisted internal draft, not an independent academic approval or JAMB-endorsed question. Its lexical scores are below the 0.42 review threshold but do not certify semantic uniqueness. Batch 19 remains held because the candidate repeats a learning outcome already present in the Government bank.

## Release boundary

- The Batch 18 draft is recorded only in this audit report; it is not added to the canonical 116-proposal inventory.
- Batch 19 has no retained replacement draft.
- No original question or R4 staging row modified.
- No canonical inventory or staging CSV modified.
- No database write, import, approval or publication.
- No merge or production deployment.
- These are AI-assisted internal screening results, not independent academic approvals, official JAMB questions or JAMB-endorsed content.
