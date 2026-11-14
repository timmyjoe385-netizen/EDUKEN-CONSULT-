# R4 Held-Row Exact-ID Crosswalk — 11 November 2026

## Scope and method
Read-only comparison of all four R4 held CSV exports (revision 2026-11-10) against the 116 proposal records in `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`. The comparison uses the held CSV `pair_id` and proposal `target_id` fields exactly. It does not assume that pair IDs always represent independent replacement needs, nor that one proposal can automatically replace every member of a multi-row cluster.

## Directly verified totals
- R4 held CSV rows: **161**.
- Unique held `pair_id` values: **159**.
- Replacement proposals: **116**, with **116 unique target IDs**.
- Proposal target IDs also present among held pair IDs: **114**.
- Proposal target IDs not present as held pair IDs: **2** (`DUP-47-ADD-2026-11-09`, `DUP-19-ADD-2026-11-09`).
- Held rows whose `pair_id` has an exact proposal `target_id` match: **116**.
- Held rows with no exact proposal-ID match: **45**, representing **45 distinct pair IDs**.

Two pair IDs occur twice in the held CSVs: `DUP-47` and `DUP-19`. Therefore exact ID coverage at row level (116 rows) differs from unique pair-ID coverage (114 IDs).

## Exact-ID unmatched held rows by subject
- Biology: 13
- Chemistry: 4
- Economics: 7
- Government: 11
- Literature in English: 6
- Physics: 3
- Use of English: 1

## Exact-ID unmatched rows
| Pair ID | Subject | Held source location | Current stem |
|---|---|---|---|
| DUP-168 | Biology | batch 19 row 16 | Natural selection favours individuals that ___. |
| DUP-215 | Government | batch 21 row 35 | A formal change to the provisions of a constitution is called a constitutional ___. |
| DUP-108 | Government | batch 22 row 35 | Public accountability requires public officials to ___. |
| DUP-99 | Literature in English | batch 23 row 38 | Satire is a literary mode that uses humour, irony or ridicule mainly to: |
| DUP-133 | Economics | batch 25 row 27 | A negative production externality exists when |
| DUP-128 | Government | batch 26 row 33 | The main aim of proportional representation is to |
| DUP-233 | Literature in English | batch 26 row 37 | In drama, an aside is a speech that is |
| DUP-176 | Literature in English | batch 26 row 41 | Imagery in a literary work refers to language that: |
| DUP-165 | Biology | batch 27 row 12 | Which blood component is especially important in forming a platelet plug during blood clotting? |
| DUP-96 | Economics | batch 28 row 27 | A maximum legal price set below the equilibrium price is likely to create |
| DUP-171 | Government | batch 28 row 32 | The principle of checks and balances allows each arm of government to: |
| DUP-151 | Biology | batch 29 row 12 | In a population, individuals with a heritable trait that improves survival tend to |
| DUP-110 | Biology | batch 29 row 13 | An enzyme speeds up a biochemical reaction mainly by |
| DUP-125 | Government | batch 29 row 33 | The secret ballot is designed mainly to: |
| DUP-116 | Biology | batch 30 row 15 | During swallowing, which structure helps prevent food from entering the trachea? |
| DUP-224 | Biology | batch 30 row 16 | In flowering plants, water is transported from the roots to the leaves mainly through the: |
| DUP-180 | Economics | batch 30 row 28 | A government subsidy to producers is most likely to |
| DUP-169 | Physics | batch 31 row 25 | Calculate the weight of a 5 kg object on Earth. Take g = 10 m/s². |
| DUP-225 | Economics | batch 31 row 30 | An import quota is a government restriction that sets: |
| DUP-117 | Government | batch 31 row 32 | What is the main purpose of a vote of no confidence in a parliamentary system? |
| DUP-118 | Government | batch 32 row 36 | The African Union was established to promote |
| DUP-112 | Biology | batch 33 row 14 | The tissue that transports water and mineral salts from roots to other parts of a plant is |
| DUP-132 | Use of English | batch 34 row 3 | Choose the word nearest in meaning to 'ephemeral'. |
| DUP-147 | Chemistry | batch 34 row 18 | Which indicator is colourless in acidic solution and turns pink in alkaline solution? |
| DUP-95 | Chemistry | batch 34 row 21 | Why does increasing temperature usually increase the rate of a chemical reaction? |
| DUP-212 | Literature in English | batch 34 row 38 | What is a group of lines forming a unit within a poem called? |
| DUP-134 | Biology | batch 35 row 13 | Which blood component contains haemoglobin and transports most oxygen in humans? |
| DUP-242 | Economics | batch 35 row 30 | The additional satisfaction from consuming one more unit of a good is called |
| DUP-220 | Literature in English | batch 35 row 41 | A sudden reversal of a character's fortune in a tragedy is known as |
| DUP-194 | Economics | batch 36 row 27 | In monopolistic competition, firms generally sell products that are: |
| DUP-119 | Government | batch 36 row 35 | An election petition is a formal legal challenge to: |
| DUP-106 | Biology | batch 37 row 13 | Which part of a nephron is the site where blood is ultrafiltered? |
| DUP-226 | Biology | batch 37 row 14 | Which process produces haploid sex cells in animals? |
| DUP-97 | Chemistry | batch 37 row 21 | Which gas is produced when dilute hydrochloric acid reacts with calcium carbonate? |
| DUP-111 | Physics | batch 37 row 25 | The main purpose of a fuse in an electrical circuit is to: |
| DUP-192 | Government | batch 37 row 35 | In a democratic legislature, the opposition mainly |
| DUP-105 | Biology | batch 38 row 14 | In humans, fertilisation normally occurs in the |
| DUP-159 | Government | batch 38 row 36 | A federal constitution typically provides for |
| DUP-167 | Literature in English | batch 38 row 38 | A couplet is a unit of poetry consisting of: |
| DUP-158 | Biology | batch 39 row 12 | An organism with genotype Tt is described as |
| DUP-179 | Chemistry | batch 39 row 21 | In paper chromatography, a component that travels furthest is generally more |
| DUP-156 | Physics | batch 39 row 23 | The wavelength of a wave is the distance between two successive points that are: |
| DUP-103 | Economics | batch 39 row 27 | A market in which one main buyer purchases from many sellers is called: |
| DUP-230 | Government | batch 39 row 34 | The principle of political neutrality requires civil servants to: |
| DUP-175 | Biology | batch 40 row 16 | Which feature is characteristic of mammals? |

## Interpretation and limitations
The 45 entries above are **exact-ID unmatched candidates**, not a final count of new replacement questions required. Some may be covered by a different proposal ID attached to the same canonical duplicate cluster; some relationship IDs may be cluster extensions or may have no new unique target. A valid final count requires a source-location and canonical-cluster crosswalk that joins every held location to all register relationships and to every proposal's declared target location, then verifies the actual proposal content and bank-wide screen.

This exact-ID result does not reproduce the prior R4 summary of 104/161 covered and 55 remaining. The difference is explicitly left unresolved here rather than silently replacing either figure. The prior R4 number is a historical summary; this file reports the independently recomputed exact-ID comparison only.

## Safety
No question text, source batch, staging CSV, proposal inventory, database row or production resource was modified. No approval, import, publication, merge or deployment was performed. All proposals remain drafts and require qualified independent subject/syllabus review.
