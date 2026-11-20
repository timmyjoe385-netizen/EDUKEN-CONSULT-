# R4 Held-Row Location-to-Proposal Crosswalk — 11 November 2026

## Purpose
This audit extends the exact-ID comparison by joining held-row source locations to the `replace` locations in the duplicate-disposition register. It tests whether a held location has a draft proposal under either its own pair ID or another register relationship that explicitly points to the same held source location.

This remains a conservative crosswalk. It does not infer that proposals for different locations in the same conceptual cluster are interchangeable.

## Inputs
- Four R4 held CSVs in `content/cbt/staging/2026-11-10-r4/`.
- `content/cbt/audits/duplicate-disposition-register-2026-11-01.json`.
- `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`.

## Verified results
- Held CSV rows: **161**.
- Distinct held pair IDs: **159**.
- Proposal records / unique proposal IDs: **116 / 116**.
- Held rows covered by exact pair-ID to proposal-ID match: **116**.
- One additional held location, batch 19 row 16 (`DUP-168`), is covered through register relationship `DUP-41`, which explicitly points to that same source location and has a matching proposal.
- Unique held locations covered by either exact pair-ID match or same-location register relationship: **117 of 161**.
- Held rows with no proposal match through either route: **44**.

## Remaining exact-location candidates by subject
- Biology: **12**
- Government: **11**
- Economics: **7**
- Literature in English: **6**
- Chemistry: **4**
- Physics: **3**
- Use of English: **1**

## Remaining candidates
| Pair ID | Subject | Held source location | Current stem |
|---|---|---|---|
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

## Cluster caveats
- `DUP-168` is not an uncovered location: its held location is explicitly referenced by `DUP-41`, and `DUP-41` has a draft proposal.
- `DUP-128` shares cluster `PROPORTIONAL-REPRESENTATION-01` with `DUP-123`, but the register's `DUP-123` record does not identify the same held source location. Do not treat it as coverage without a location-level target mapping.
- `DUP-165` belongs to `PLATELET-CLOTTING-01`; other cluster relationships point to different held locations. A proposal for one member cannot automatically be treated as a replacement for another member.
- `DUP-147` is associated with `PHENOLPHTHALEIN-01`; the related register entry is marked `already_counted_in_existing_cluster`, but the current proposal inventory does not establish a same-location draft for batch 34 row 18. Retain it as a candidate pending cluster-target evidence.
- `DUP-159` is a federalism cluster extension; the same-location register entry `DUP-177` is already counted in the existing cluster, but neither entry has a proposal ID in the current draft inventory that matches this location.

## Interpretation
The verified 44 is a count of held locations without a proposal match by exact pair ID or by a register relationship that explicitly names the same held source location. It is a stronger measure than the earlier 45 exact-ID-only figure, but it is still not a final number of new drafts required. The remaining 44 must be reconciled against canonical cluster membership, proposal target semantics and full-bank screening before deciding whether to create a new replacement.

## Safety
No source question, held CSV, canonical register, replacement draft, database record or production resource was modified. No academic approval, import, publication, merge or deployment was performed.
