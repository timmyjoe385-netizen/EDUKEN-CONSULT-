# EDUKEN CBT — Replacement Question Independent Review Packet

**Branch:** `feat/cbt-subject-combination-reconciled`  
**Scope:** 90 replacement proposals for 90 held duplicate rows in the 1,600-question bank.  
**Purpose:** independent subject-competent review; this packet is not an approval or import file.

## Reviewer instructions

- Review each question for factual accuracy, one unambiguous correct answer, distractor quality, explanation accuracy and appropriate JAMB syllabus depth.
- Compare the concept against the full existing subject bank, not wording alone. Lexical flags are prompts, not automatic duplicate decisions.
- Check the syllabus mapping and cite the relevant syllabus topic/subtopic where possible.
- Record **Approve / Revise / Reject**, reviewer name/qualification, date and concise rationale. Do not mark an item approved based only on the assistant's preliminary checks.
- Any unresolved issue means the item remains excluded. Original CSVs and production data must remain untouched until the controlled approval gate is passed.

## Overall status

- Draft proposals: **90/90** (unique target IDs)
- Full-bank screening: **90/90**; 12 lexical flags, 78 below 0.42
- Syllabus mapping: **90/90**; 25 provisionally aligned, 65 require subject review
- Assistant preliminary answer/context checks: **90/90**; independent human sign-off: **0**
- Inserted into source CSVs / Supabase / student feed: **0**

## Pair-by-pair assistant review log (not independent academic approval)

### Pair 04 — DUP-33 and DUP-34 (2026-11-02)

**DUP-33 — Use of English: relative-pronoun function**
- **Bankwide finding:** The previous replacement draft (“whose” expresses possession) overlapped with retained batch 20 row 2, which also tests “whose” as a possessive relative pronoun. This was a genuine semantic overlap missed by the earlier lexical screen.
- **Correction:** Replaced it with a new question testing “whom” as the object of the preposition “to” in a relative construction. The correct answer is B. The explanation identifies the objective case form and its relationship to the preposition.
- **Bank comparison:** Retained batch 33 row 2 and held DUP-33 test “who” as subject relative pronoun; retained batch 20 row 2 tests “whose” possession; batch 36 row 5 asks candidates to identify a relative clause. The revised item tests “whom” as object of a preposition, a different grammatical function. Retained and held staging files were checked for this function; no exact same-function item was found in inspected entries. Independent English review remains required.
- **Official syllabus mapping:** Broad alignment to Use of English Section B, Lexis and Structure: word classes and their functions; clause and sentence patterns; objective to identify grammatical patterns.
- **Assistant disposition:** Superseded draft rejected for bank overlap; revised draft is a new proposal, not cleared or approved for import.

**DUP-34 — Use of English: concord with plural-only noun**
- **Answer and explanation:** C (“are”) is correct. “Cattle” is a plural-only noun in standard English and takes a plural verb in this sentence.
- **Quality check:** The sentence is grammatical and has one correct answer. The explanation is specific to “cattle”; it should not imply that all nouns denoting groups behave identically.
- **Bank comparison:** Nearest matches test agreement with a nearer subject after “neither…nor” (batch 01 row 3), a singular head noun (“list of items”, batch 33 row 3), and another proximity-concord pattern (batch 16 row 5). Retained “each of…” items test a different singular agreement trigger. The replacement tests plural-only “cattle”; inspected retained and held staging entries contained no same cattle-agreement question. Related concord domain, different rule.
- **Official syllabus mapping:** Directly within Use of English Section B, Lexis and Structure, which explicitly lists number and agreement/concord and the objective to identify grammatical patterns.
- **Assistant disposition:** Preliminary answer, explanation, contextual and syllabus checks passed. Independent English reviewer confirmation remains required; not approved for import.

**Pair 04 outcome:** 2 drafts reviewed; 1 existing-bank semantic overlap discovered and corrected by replacing the draft; 1 concord item checked; revised DUP-33 fresh manual subject-bank check completed; 0 independent subject approvals; neither target is cleared for insertion.

---

### Pair 03 — DUP-18 and DUP-22 (2026-11-02)

**DUP-18 — Physics: law of reflection**
- **Answer and explanation:** B (35°) is correct. By the law of reflection, the angle of reflection equals the angle of incidence; both are measured from the normal.
- **Quality correction:** The stem now explicitly says the 35° incidence angle is measured to the normal and asks for the reflected angle from the normal. This prevents confusion with an angle measured from the mirror surface.
- **Bank comparison:** Highest same-subject trigram score 0.4271. The nearest held-bank match is DUP-51 on total internal reflection; another close item tests plane-mirror image formation. The draft tests the equality of incidence and reflection angles, not critical-angle conditions or image characteristics. The similarity flag is therefore a review prompt, not a duplicate verdict.
- **Official syllabus mapping:** Directly aligned to the official JAMB Physics syllabus Topic 24, “Reflection of Light at Plane and Curved Surfaces”, including the laws of reflection and the objective to interpret those laws.
- **Assistant disposition:** Preliminary answer, wording and syllabus check passed; independent Physics reviewer must still confirm academic suitability and contextual uniqueness. Not approved for import.

**DUP-22 — Biology: plasma transport**
- **Answer and explanation:** B (plasma) is correct. Plasma is the liquid portion of blood and carries dissolved nutrients, hormones and metabolic waste products.
- **Quality correction:** Replaced the vague word “many” with a direct description of plasma as the main transport medium for dissolved substances; explanation now specifies the relevant classes of substances.
- **Bank comparison:** Highest same-subject trigram score 0.4785. The closest retained-bank item tests haemoglobin and oxygen transport by red blood cells; the held duplicate tests platelet function in clotting. The replacement tests plasma transport of dissolved substances. These are distinct blood components and functions, but the relatively high lexical score requires a human contextual decision.
- **Official syllabus mapping:** Directly aligned at the broad-topic level to the official JAMB Biology syllabus Topic 3, “Transport”, especially the media/processes section and the objective to know the composition and functions of blood and lymph.
- **Assistant disposition:** Preliminary answer, wording and syllabus check passed; independent Biology reviewer must still confirm academic suitability and contextual uniqueness. Not approved for import.

**Pair 03 outcome:** 2 drafts reviewed; 2 wording clarifications; 2 official syllabus mappings checked; 2 lexical flags contextually triaged; 0 independent subject approvals; both remain blocked from insertion.

---

### Pair 02 — DUP-14 and DUP-17 (2026-11-02)

**DUP-14 — Biology: prokaryotic cell classification**
- **Answer and explanation:** B is correct. Prokaryotic cells lack a membrane-bound nucleus; their genetic material occupies a nucleoid region.
- **Quality check:** Clear one-best-answer stem; options are distinct classifications. No wording change needed at preliminary review.
- **Bank comparison:** Highest same-subject trigram score 0.315; closest match concerns selective permeability of the cell membrane, a different cell function. This lexical screen does not independently prove uniqueness.
- **Official syllabus mapping:** Confirmed broad alignment to Biology syllabus A.1(b), “Cell structure and functions of cell components”, and A.2(a), “Monera (prokaryotes)” (official PDF lines 23–35, objectives lines 46–49). The existing mapping is now made more precise with the actual syllabus headings.
- **Assistant disposition:** Preliminary answer/quality pass; mapping directly supported by official syllabus. Still requires independent Biology review and full-bank contextual decision. Not approved for import.

**DUP-17 — Biology: auxin and positive phototropism**
- **Answer and explanation:** A (auxin) is correct for the specified redistribution and differential-elongation mechanism in a young shoot.
- **Quality correction:** The original wording was too broad: gibberellins can also promote stem elongation, and the original animal-hormone distractors were implausibly easy. The revised stem asks specifically about auxin accumulation on the shaded side during positive phototropism; distractors are now other plant hormones.
- **Bank comparison:** Highest same-subject trigram score 0.4172, below the 0.42 lexical flag threshold. Closest lexical match concerns human sex chromosomes, not plant hormones. The result is a lexical screen only; full conceptual comparison and human review remain required.
- **Official syllabus mapping:** Directly aligned to Biology syllabus B.6(a), tropic movements and roles of auxins (official PDF lines 529–533), and B.9(c)(ii), plant hormones and their effects on growth/tropism (lines 688–703).
- **Assistant disposition:** Revised draft and mapping are supported by the official syllabus. Independent Biology review remains required; not approved for import.

**Pair 02 outcome:** 2 drafts reviewed; 1 question wording/distractor correction (DUP-17); 1 mapping made more precise (DUP-14); both syllabus mappings supported by explicit official syllabus topics; 0 independent subject approvals; both remain blocked from insertion.



### Pair 01 — DUP-04 and DUP-06 (2026-11-02)

**DUP-04 — Biology: inheritance / dominance**
- **Answer and explanation:** B is correct for complete dominance.
- **Quality correction:** The original stem did not distinguish complete dominance from codominance or incomplete dominance, and two distractors (“mutant only”, “incomplete”) were weak/non-parallel. The stem now explicitly specifies a complete-dominance relationship; distractors are now the three alternative inheritance descriptions.
- **Bank comparison:** The closest same-subject item asks candidates to identify the genotype Tt (heterozygous). This draft asks for the meaning of a dominant allele under complete dominance. The concepts are related but test different definitions; the trigram flag (0.5344) still warrants human contextual review.
- **Syllabus evidence:** Official JAMB Biology syllabus, section D.2 “Heredity”, specifically “Inheritance of characters in organisms”; this directly supports the broad mapping “Heredity — inheritance of characters”. Source: https://ibass.jamb.gov.ng/assets/uploads/Biology.pdf (section D, lines 1073–1110 in the retrieved official PDF text).
- **Assistant disposition:** Corrected draft; mapping supported by the official topic; still requires independent Biology review and human decision on bank variety. Not approved for import.

**DUP-06 — Biology: fruit/seed dispersal**
- **Answer and explanation:** C is correct; hooks/barbs attach fruits to animal fur or clothing (animal-mediated dispersal).
- **Quality check:** Stem and options are clear; explanation correctly describes the mechanism. No obvious competing option.
- **Bank comparison:** Highest same-subject trigram score is 0.3284; closest lexical match is an ectoparasite definition, not fruit dispersal. This is only a lexical screen, not proof of semantic uniqueness.
- **Syllabus mapping correction:** The previous “Reproduction — sexual reproduction in flowering plants” label is too specific for a question about the dispersal mechanism. Proposed broader label: “Variety of organisms — structural adaptations in plants (fruit/seed dispersal)”. The official syllabus includes structural adaptations and plant adaptation, but does not expressly list fruit/seed dispersal by hooks; retain subject_review_required rather than claiming exact syllabus coverage.
- **Assistant disposition:** Answer/explanation pass at preliminary level; syllabus mapping requires qualified confirmation. Not approved for import.

**Pair 01 outcome:** 2 drafts reviewed; 1 wording/distractor correction (DUP-04); 1 syllabus mapping correction (DUP-06); 0 independent subject approvals; 2 remain blocked from insertion.

## Assistant contextual triage of the 12 lexical flags (not independent approval)

The refreshed trigram screen produced 12 flags. The following assistant-only comparison checks the actual concept tested by each draft against its closest same-subject match. These are not human subject sign-offs and do not clear any draft for import. No flag is being treated as an automatic duplicate solely because of lexical similarity.

| Target | Closest match / concept | Preliminary contextual finding | Human reviewer focus |
|---|---|---|---|
| DUP-04 | Batch 39 row 12: identify the genotype Tt | Related heredity vocabulary, but the draft tests dominant-allele expression while the match tests genotype description. Distinct learning outcomes; moderate same-topic overlap. | Confirm the bank has adequate variety before retaining both. |
| DUP-10 | Batch 02 row 29: inflation | Deflation is the opposite movement from inflation, not the same answer. Distinct terms but directly paired concepts. | Confirm deflation is within the intended syllabus depth and adds value beyond the inflation item. |
| DUP-16 | Batch 17 row 21: separating an insoluble solid from a liquid | Separating immiscible liquids with a separating funnel differs from filtration of a solid-liquid mixture. | Confirm terminology and that the question tests apparatus choice clearly. |
| DUP-18 | Held row: condition for total internal reflection | Draft tests the law of reflection at a plane mirror; held item tests the conditions for total internal reflection. Different optical principles. | Confirm angle is explicitly measured from the normal (the explanation does so). |
| DUP-22 | Batch 35 row 13: oxygen transport by haemoglobin in red cells | Draft tests plasma transport of dissolved substances; match tests oxygen transport by red blood cells. Different blood components and functions. | Confirm the scope of the phrase “many dissolved” and expected level. |
| DUP-33 | Batch 12 row 2: meaning of “put off” | Relative-pronoun possession is unrelated to the meaning of a phrasal verb; likely a lexical false positive. | Confirm grammar objective and the relative-pronoun classification. |
| DUP-34 | Batch 01 row 3: concord with “neither…nor” | Draft tests plural-only noun “cattle”; match tests proximity concord after “neither…nor”. Same broad grammar area, distinct rules. | Check for excessive concord-question concentration in the English bank. |
| DUP-35 | Batch 20 row 41: epilogue | Epigraph (opening quotation) and epilogue (concluding section) are distinct literary terms. | Confirm the term is within the relevant Literature syllabus and that distractors are unambiguous. |
| DUP-36 | Batch 26 row 35: party manifesto | Draft tests internal party rules/structure; match tests a party's policy document. Distinct civic concepts. | Confirm constitutional wording is appropriate to the syllabus context. |
| DUP-45 | Batch 01 row 29: wages as reward for labour | Economic rent above transfer earnings is distinct from the ordinary reward to labour, though both concern factor rewards. | Confirm the definition and its place in the current Economics syllabus. |
| DUP-48 | Batch 36 row 38: diction | Denotation (literal meaning of a word) differs from diction (a writer's choice/use of words), but both are literary terminology and can be confused. | Strong review priority: confirm the intended Literature syllabus scope and that this is not too close to existing terminology coverage. |
| DUP-53 | Batch 17 row 18: salt formed in an acid-base reaction | Copper(II) hydroxide precipitation from Cu²⁺ and OH⁻ is a different qualitative-analysis reaction from salt formation by neutralisation. | Confirm ionic equation, precipitate colour and the “insoluble in excess” explanation. |

**Assistant triage outcome:** 12/12 flags have a written concept-level comparison; 0/12 are confirmed duplicates by this preliminary review. This is not equivalent to independent manual contextual review. All 12 remain awaiting a qualified human decision, and all 90 drafts remain blocked from insertion.

## Biology (17)

### DUP-04 — Genetics / Alleles and inheritance

**Question:** In a complete-dominance relationship, an allele whose effect is expressed in the phenotype of a heterozygous organism is described as:

- A. recessive
- B. dominant
- C. codominant
- D. incompletely dominant

**Draft key:** B  
**Draft explanation:** In complete dominance, the dominant allele determines the heterozygote's phenotype, while the recessive allele is masked. Codominance and incomplete dominance describe different patterns in which the heterozygote does not show the complete-dominance pattern.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Heredity — inheritance of characters  
**Mapping status:** provisionally_aligned

**Lexical flag:** 0.5344 (threshold 0.42); closest match batch 39 row 12 — An organism with genotype Tt is described as.

**Assistant preliminary check:** Preliminary answer check: B is correct; a dominant allele is expressed in a heterozygote. The flagged comparison asks for the genotype description of Tt, not the expression rule, but both sit within basic inheritance; independent Biology review must decide whether the distinction is sufficiently useful.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-06 — Reproduction / Seed dispersal

**Question:** The presence of hooks or barbs on the surface of some fruits helps in:

- A. dispersal by wind
- B. dispersal by water
- C. dispersal by attaching to animals
- D. self-pollination

**Draft key:** C  
**Draft explanation:** Hooks and barbs can cling to animal fur or clothing, carrying the fruit or seeds away from the parent plant.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Variety of organisms — structural adaptations in plants (proposed broad fit; fruit/seed dispersal is not expressly named in the syllabus)  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3284).

**Assistant preliminary check:** Preliminary answer check: C is correct; hooks or barbs attach to animal fur and aid dispersal. The explanation matches epizoochory; subject/syllabus review remains required.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-14 — Cell biology / Prokaryotic cells

**Question:** A cell that lacks a membrane-bound nucleus is classified as:

- A. eukaryotic
- B. prokaryotic
- C. multicellular
- D. specialised

**Draft key:** B  
**Draft explanation:** Prokaryotic cells do not have a membrane-bound nucleus; their genetic material is located in a nucleoid region.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Variety of organisms — A.1(b) cell structure and functions of cell components; A.2(a) Monera (prokaryotes)  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.315).

**Assistant preliminary check:** Preliminary answer check: B is correct; prokaryotic cells lack a membrane-bound nucleus and have DNA in a nucleoid region. The explanation is accurate at the intended introductory level.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-17 — Plant physiology / Plant hormones

**Question:** During positive phototropism in a young shoot, which plant hormone accumulates more on the shaded side and promotes greater cell elongation there?

- A. auxin
- B. gibberellin
- C. cytokinin
- D. ethylene

**Draft key:** A  
**Draft explanation:** In a young shoot exposed to light from one direction, auxin becomes more concentrated on the shaded side and promotes greater cell elongation there. The unequal growth causes the shoot to bend towards the light.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Form and functions — B.6(a) tropic movements and roles of auxins; B.9(c)(ii) plant hormones and their effects on growth and tropism  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.4172).

**Assistant preliminary check:** Preliminary answer check: A is correct; auxin promotes shoot-cell elongation and participates in tropic responses. The wording 'chiefly associated' is appropriate for the basic syllabus level.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-22 — Human physiology / Blood plasma

**Question:** Which component of blood is the main medium for transporting dissolved nutrients, hormones and metabolic waste products around the body?

- A. platelets
- B. plasma
- C. red blood cells
- D. lymphocytes

**Draft key:** B  
**Draft explanation:** Plasma is the liquid portion of blood. It carries dissolved substances, including absorbed nutrients, hormones and metabolic waste products, between tissues and organs.  
**Draft status:** revised_draft_needs_independent_subject_and_contextual_review  
**Syllabus area:** Biology — Transport: media and processes; composition and functions of blood and lymph  
**Mapping status:** provisionally_aligned_to_explicit_official_topic

**Lexical flag:** 0.4785 (threshold 0.42); closest match batch 35 row 13 — red blood cells contain haemoglobin and transport most oxygen. The held duplicate row tests platelet function in clotting.

**Assistant preliminary check:** B is correct. The replacement tests plasma as the transport medium for dissolved substances; the highest-scoring bank match tests haemoglobin-mediated oxygen transport by red blood cells, while the held duplicate tests platelet-mediated clotting. These are different blood components and functions. The wording now avoids the vague qualifier “many”. This remains a preliminary distinction, not independent proof of uniqueness.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-24 — Microbiology / Bacterial structure

**Question:** The rigid cell wall of most bacteria is made mainly of:

- A. cellulose
- B. chitin
- C. peptidoglycan
- D. starch

**Draft key:** C  
**Draft explanation:** Most bacterial cell walls contain peptidoglycan, which helps maintain cell shape and resist osmotic pressure.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Variety of organisms — Monera/prokaryotes and bacteria  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3566).

**Assistant preliminary check:** Preliminary answer check: C is correct; peptidoglycan is the principal wall material in most bacteria. 'Most' appropriately avoids exceptions such as wall-less bacteria; confirm syllabus depth.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-38 — Disease / Immunity

**Question:** Which structure allows maternal IgG antibodies to pass from the mother to the fetus before birth, providing temporary passive immunity?

- A. the placenta
- B. the pancreas
- C. the kidney
- D. the bone marrow

**Draft key:** A  
**Draft explanation:** Maternal IgG antibodies cross the placenta from the mother to the fetus before birth, providing temporary passive immunity.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Humans and environment — disease prevention/vaccination; reproduction and development  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.293).

**Assistant preliminary check:** Preliminary answer check: A is correct; maternal IgG crosses the placenta and provides temporary passive immunity. Breast milk also transfers antibodies, but it is not among the options; the stem asks specifically for the transfer route offered here.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-41 — Human physiology / Endocrine hormones

**Question:** Which hormone stimulates the production of milk in the mammary glands after childbirth?

- A. oxytocin
- B. prolactin
- C. adrenaline
- D. thyroxine

**Draft key:** B  
**Draft explanation:** Prolactin stimulates milk production in the mammary glands. Oxytocin is involved in milk ejection.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Coordination and control — endocrine glands and hormones  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3951).

**Assistant preliminary check:** Preliminary answer check: B is correct; prolactin stimulates milk production, while oxytocin supports milk ejection. The explanation makes the key distinction clear.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-50 — Cell biology / Golgi apparatus and protein packaging

**Question:** Which organelle modifies, sorts and packages proteins into vesicles for transport within or out of a cell?

- A. Golgi apparatus
- B. Ribosome
- C. Mitochondrion
- D. Lysosome

**Draft key:** A  
**Draft explanation:** The Golgi apparatus modifies, sorts and packages proteins into vesicles for transport to other cell locations or for secretion. Ribosomes synthesise proteins, mitochondria release energy, and lysosomes contain digestive enzymes.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Cell biology — cell organelles  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3135).

**Assistant preliminary check:** revised_preliminary_pass. A is correct: the Golgi apparatus modifies, sorts and packages proteins into vesicles. The distractors describe other cell structures. The previous ABO cross draft was withdrawn because the bank already contains an ABO blood-group inheritance item. The revised Golgi item is a different cell-organelle concept; refresh screen includes this revision. Provisionally fits cell structure and organelle functions.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-58 — Ecology / Quadrat sampling

**Question:** Which field method is most suitable for estimating the abundance of grasses in a study area?

- A. Using a quadrat
- B. Using a pooter
- C. Using a sweep net
- D. Using a pitfall trap

**Draft key:** A  
**Draft explanation:** A quadrat is a square frame placed in sample areas to estimate the abundance, density or frequency of plants and other relatively stationary organisms. Pooters and sweep nets collect mobile small animals, while pitfall traps sample ground-dwelling invertebrates.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Ecology — field sampling methods  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2895).

**Assistant preliminary check:** revised_preliminary_pass. A is correct. Quadrat sampling estimates abundance, density or frequency of plants and other relatively stationary organisms. The earlier homologous-structures draft was withdrawn after the bank-wide comparison found an existing question on that concept (batch 23 row 13). The revised quadrat-sampling stem has a highest same-subject lexical score of 0.2895; concept-level review remains required. Provisionally fits ecological sampling methods and fieldwork.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-60 — Sense organs / Hearing

**Question:** The sensory hair cells that detect sound vibrations are located in the:

- A. Organ of Corti
- B. Semicircular canals
- C. Eustachian tube
- D. Auditory nerve

**Draft key:** A  
**Draft explanation:** The Organ of Corti lies within the cochlea and contains hair cells that convert sound-induced mechanical vibrations into nerve impulses carried by the auditory nerve.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Human physiology — sense organs and hearing  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2783).

**Assistant preliminary check:** preliminary_pass_pending_human_review. A is correct. The Organ of Corti is located in the cochlea and contains sensory hair cells that transduce mechanical vibrations into nerve impulses. Full 1,600-row staged-bank lexical screen: highest same-subject Dice score 0.2783; closest match concerns water uptake by root hair cells, not hearing. Contextual review remains required. Provisionally fits sense organs and the physiology of hearing.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-61 — Plant physiology / Phototropism

**Question:** A young plant shoot bends towards light because cells on its shaded side undergo greater:

- A. cell elongation
- B. cell division only
- C. loss of chlorophyll
- D. water loss

**Draft key:** A  
**Draft explanation:** In positive phototropism, auxin promotes greater cell elongation on the shaded side of a shoot. The unequal growth causes the shoot to bend towards the light.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Plant physiology — tropic responses  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2262).

**Assistant preliminary check:** preliminary_pass_pending_human_review. A is correct. Unequal cell elongation on the shaded side causes a shoot to bend towards the light; auxin distribution mediates the response. Full 1,600-row staged-bank lexical screen: highest same-subject Dice score 0.2262; closest match concerns xylem transport, not phototropism. Contextual review remains required. Provisionally fits plant responses and tropic movements.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-65 — Animal physiology / Insect respiration

**Question:** The fine terminal branches of an insect's tracheal system that deliver oxygen directly to body cells are called:

- A. Tracheoles
- B. Spiracles
- C. Malpighian tubules
- D. Air sacs

**Draft key:** A  
**Draft explanation:** Tracheoles are the fine terminal branches of the insect tracheal system. They extend close to body cells and provide the route for oxygen to diffuse directly to tissues. Spiracles are the external openings of the system.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Animal physiology — insect respiration  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3462).

**Assistant preliminary check:** preliminary_pass_pending_human_review. A is correct. Tracheoles are fine terminal branches of the insect tracheal system where gas exchange with tissues occurs; spiracles are external openings. Full 1,600-row same-subject lexical screen: highest Dice score 0.3462 against a ureter question, with no concept overlap identified. Contextual review remains required. Provisionally fits insect respiration and animal physiology; confirm exact JAMB Biology syllabus coverage.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-70 — Cell biology / Vacuole

**Question:** In a mature plant cell, the large central vacuole helps maintain the cell's shape mainly by:

- A. Producing proteins
- B. Maintaining turgor pressure
- C. Releasing digestive enzymes into blood
- D. Carrying genetic information

**Draft key:** B  
**Draft explanation:** The vacuole stores cell sap. Water entering it creates turgor pressure, which helps keep the plant cell firm and supports the plant.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Cell biology — vacuole and turgor  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3333).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: water in the central vacuole contributes to turgor pressure, helping maintain cell firmness. Highest same-subject Dice 0.3333; no vacuole/turgor match was found in the bank. Cell structure and functions; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-73 — Coordination / Reflex action

**Question:** Which part of the central nervous system coordinates a simple withdrawal reflex before conscious interpretation of pain?

- A. Cerebrum
- B. Spinal cord
- C. Cerebellum
- D. Hypothalamus

**Draft key:** B  
**Draft explanation:** A simple withdrawal reflex is coordinated through a reflex arc in the spinal cord, allowing a rapid response before conscious processing by the brain.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Coordination — nervous system and reflex action  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3297).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: a simple withdrawal reflex is integrated through the spinal cord before conscious interpretation of pain. Highest same-subject Dice 0.3297; closest matches concern brain and neuron functions, not withdrawal-reflex integration. Coordination and reflex actions; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-74 — Excretion / Ultrafiltration

**Question:** The high pressure that drives ultrafiltration in a mammalian kidney is produced mainly because the:

- A. Afferent arteriole is wider than the efferent arteriole
- B. Efferent arteriole is wider than the afferent arteriole
- C. Bowman's capsule has a muscular wall
- D. Collecting duct actively pumps blood

**Draft key:** A  
**Draft explanation:** The afferent arteriole is wider than the efferent arteriole, creating relatively high hydrostatic pressure in the glomerular capillaries and forcing small molecules into Bowman's capsule.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Excretion — kidney structure and urine formation (glomerular ultrafiltration)  
**Mapping status:** subject_review_required
**Mapping correction log (2026-11-02):** The earlier “Genetics — DNA replication” label was an evident metadata mismatch with this kidney-ultrafiltration question and was corrected to the excretion topic. The corrected mapping still requires independent confirmation against the current JAMB IBASS syllabus.


**Lexical screen:** below 0.42 (highest score 0.2971).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: the afferent arteriole is wider than the efferent arteriole, helping create high hydrostatic pressure in glomerular capillaries. Highest same-subject Dice 0.2971; closest match asks the site of filtration, a related but distinct objective. Excretion and kidney ultrafiltration; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-84 — Genetics / DNA replication

**Question:** During DNA replication, which enzyme joins adjacent Okazaki fragments on the lagging strand?

- A. DNA ligase
- B. DNA helicase
- C. RNA polymerase
- D. Amylase

**Draft key:** A  
**Draft explanation:** DNA ligase seals the breaks between adjacent Okazaki fragments by forming phosphodiester bonds in the sugar-phosphate backbone of the newly synthesised DNA strand.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Genetics — DNA replication  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3286).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: DNA ligase joins adjacent Okazaki fragments by sealing breaks in the DNA sugar-phosphate backbone. Highest same-subject Dice 0.3286. The earlier pulmonary-vein draft was withdrawn because it duplicated batch 21 row 12; this replacement has been re-screened. Genetics and DNA replication; confirm whether this level of molecular detail is within the current JAMB Biology syllabus.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Chemistry (13)

### DUP-02 — Electrochemistry / Salt bridge

**Question:** In a simple galvanic cell, the main function of the salt bridge is to:

- A. Supply electrons to the cathode
- B. Maintain electrical neutrality by allowing ions to migrate
- C. Increase the temperature of the electrolyte
- D. Prevent the redox reaction from occurring

**Draft key:** B  
**Draft explanation:** Ions migrate through the salt bridge to prevent charge build-up in the half-cells and maintain electrical neutrality, allowing the cell to continue operating.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Electrochemistry — Salt bridge  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4144).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: ions migrate through the salt bridge to prevent charge build-up and maintain electrical neutrality in the two half-cells. Full 1,600-row same-subject lexical screen: maximum Dice 0.4144 against a galvanic-cell anode question. Related cell context, but different function. Human Chemistry review required. Electrochemistry and galvanic cells; confirm salt-bridge detail and depth against the current JAMB Chemistry syllabus.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-08 — Organic chemistry / Natural gas

**Question:** The principal constituent of most natural gas is:

- A. Ethene
- B. Methane
- C. Carbon monoxide
- D. Sulfur dioxide

**Draft key:** B  
**Draft explanation:** Natural gas consists mainly of methane, although its exact composition varies by source and it may contain smaller amounts of other hydrocarbons and gases.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Organic chemistry — Natural gas  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.381).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: methane is the principal constituent of most natural gas, though composition varies by source. Full 1,600-row same-subject lexical screen: maximum Dice 0.3810; closest matches are gas-law and aluminium-ore questions, not natural-gas composition. Hydrocarbons and natural gas; confirm the exact syllabus scope and depth.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-09 — Electrochemistry / Electrolysis of water

**Question:** A small amount of dilute sulphuric acid is added to water before electrolysis mainly to: 

- A. increase the electrical conductivity
- B. remove all dissolved ions
- C. produce chlorine gas
- D. prevent the electrodes from conducting

**Draft key:** A  
**Draft explanation:** Pure water conducts electricity poorly. The acid supplies ions and increases conductivity.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Electrolysis — electrolysis of dilute sulphuric acid  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3019).

**Assistant preliminary check:** Preliminary answer check: A is correct; dilute sulphuric acid supplies mobile ions and improves water's electrical conductivity during electrolysis. The explanation is accurate; ensure the practical setup specifies inert electrodes elsewhere if products are discussed.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-13 — Organic chemistry / Substitution reactions of alkanes

**Question:** The reaction between methane and chlorine in ultraviolet light is classified as: 

- A. addition
- B. substitution
- C. neutralisation
- D. polymerisation

**Draft key:** B  
**Draft explanation:** Ultraviolet light initiates free-radical substitution, replacing a hydrogen atom in methane with chlorine.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Organic chemistry — alkanes and substitution reactions  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3796).

**Assistant preliminary check:** Preliminary answer check: B is correct; methane chlorination under ultraviolet light proceeds by free-radical substitution. The explanation accurately identifies replacement of hydrogen by chlorine.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-16 — Separation techniques / Separating immiscible liquids

**Question:** Which apparatus is most suitable for separating two immiscible liquids such as kerosene and water?

- A. Burette
- B. Separating funnel
- C. Evaporating dish
- D. Condenser

**Draft key:** B  
**Draft explanation:** A separating funnel allows the immiscible liquids to form separate layers and be drained off individually.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Separation of mixtures and purification of chemical substances  
**Mapping status:** provisionally_aligned

**Lexical flag:** 0.5181 (threshold 0.42); closest match batch 17 row 21 — Which method is most suitable for separating an insoluble solid from a liquid?.

**Assistant preliminary check:** Preliminary answer check: B is correct; a separating funnel is suitable for immiscible liquid layers such as kerosene and water. The nearest flagged comparison concerns separating an insoluble solid from a liquid, which is a different separation method; contextual reviewer confirmation remains required.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-39 — Metals / Extraction of aluminium

**Question:** During the electrolytic extraction of aluminium, cryolite is added to alumina mainly to:

- A. raise the melting point of alumina
- B. lower the melting point of the mixture and improve its electrical conductivity
- C. act as the reducing agent that forms aluminium
- D. prevent oxygen from being released at the anode

**Draft key:** B  
**Draft explanation:** Cryolite dissolves alumina, lowers the operating temperature and improves the conductivity of the electrolyte, reducing the energy required for extraction.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Metals — extraction of aluminium  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3968).

**Assistant preliminary check:** Preliminary answer check: B is correct; cryolite lowers the operating/melting temperature of the electrolyte and improves conductivity during aluminium extraction. The explanation is accurate for the Hall–Héroult process.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-40 — Chemical industry / Contact process catalyst

**Question:** In the Contact process, which substance is commonly used as the catalyst for converting sulphur dioxide to sulphur trioxide?

- A. iron
- B. nickel
- C. vanadium(V) oxide
- D. manganese(IV) oxide

**Draft key:** C  
**Draft explanation:** Vanadium(V) oxide, V₂O₅, catalyses the oxidation of sulphur dioxide to sulphur trioxide in the Contact process.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Chemical industry — Contact process  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3875).

**Assistant preliminary check:** Preliminary answer check: C is correct; vanadium(V) oxide is the catalyst used in the Contact process oxidation of sulphur dioxide. The explanation is accurate.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-46 — Chemical bonding / Alloys

**Question:** Brass is an alloy made mainly from:

- A. copper and tin
- B. copper and zinc
- C. iron and carbon
- D. aluminium and magnesium

**Draft key:** B  
**Draft explanation:** Brass is primarily an alloy of copper and zinc. Bronze, by contrast, is mainly copper and tin.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Chemical bonding / metals — alloys  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2917).

**Assistant preliminary check:** Preliminary answer check: B is correct; brass is primarily copper and zinc, unlike bronze, which is mainly copper and tin. The explanation correctly distinguishes the common alloys.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-53 — Qualitative analysis / Identification of copper(II) ions

**Question:** Which solid is formed when Cu²⁺(aq) reacts with OH⁻(aq)?

- A. Cu(OH)₂, a blue precipitate
- B. Cu₂O, a red precipitate
- C. CuCO₃, a green precipitate
- D. CuS, a black precipitate

**Draft key:** A  
**Draft explanation:** Copper(II) ions react with hydroxide ions to form copper(II) hydroxide, Cu(OH)₂, which is a blue precipitate and is insoluble in excess aqueous sodium hydroxide.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Qualitative analysis — tests for cations  
**Mapping status:** subject_review_required

**Lexical flag:** 0.458 (threshold 0.42); closest match batch 17 row 18 — When nitric acid reacts completely with potassium hydroxide, which salt is formed?.

**Assistant preliminary check:** preliminary_pass. A is correct: Cu²⁺ + 2OH⁻ forms Cu(OH)₂, a blue precipitate insoluble in excess aqueous sodium hydroxide. Refreshed screen: highest same-subject score 0.458; closest item is a chloride-ion qualitative test. This item tests copper(II) hydroxide precipitation, a different ion and reaction; shared assessment format is not semantic duplication. Provisionally fits qualitative analysis and identification of cations.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-64 — Nuclear chemistry / Half-life

**Question:** A radioactive isotope has a half-life of 6 hours. What fraction of the original sample remains after 18 hours?

- A. 1/2
- B. 1/4
- C. 1/8
- D. 1/16

**Draft key:** C  
**Draft explanation:** Eighteen hours represents three half-lives (18 ÷ 6 = 3). The remaining fraction is (1/2)³ = 1/8.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Nuclear chemistry — half-life  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2623).

**Assistant preliminary check:** preliminary_pass_pending_human_review. C is correct. Eighteen hours is three half-lives, so (1/2)^3 = 1/8 remains. Full 1,600-row same-subject lexical screen: highest Dice score 0.2623 against a first-order rate-constant unit question. No concept overlap identified in the screen; contextual review remains required. Provisionally fits radioactivity and half-life calculations; confirm exact JAMB Chemistry syllabus coverage.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-67 — Chemical bonding / Coordinate covalent bond

**Question:** In the formation of the ammonium ion, NH₄⁺, the bond formed when NH₃ combines with H⁺ is initially described as a:

- A. Ionic bond
- B. Metallic bond
- C. Coordinate covalent bond
- D. Hydrogen bond

**Draft key:** C  
**Draft explanation:** The nitrogen atom in NH₃ donates its lone pair to H⁺ to form the N–H bond. Both bonding electrons are supplied by nitrogen, so it is a coordinate covalent bond.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Chemical bonding — coordinate covalent bonding  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4094).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. C is correct: nitrogen donates its lone pair to H⁺ to form a coordinate covalent N–H bond in NH₄⁺. Highest same-subject Dice 0.4094 against the ammonium-ion formula question. Similar species, different learning objective; require Chemistry review. Chemical bonding and coordinate covalent bonds; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-86 — Qualitative analysis / Test for nitrate ions

**Question:** In the brown-ring test for nitrate ions, the characteristic brown ring forms at the:

- A. Bottom of the test tube
- B. Junction of the two liquid layers
- C. Surface of the solution
- D. Outside of the test tube

**Draft key:** B  
**Draft explanation:** In the brown-ring test, freshly prepared iron(II) sulfate is added, followed carefully by concentrated sulfuric acid. A brown ring forms at the interface between the two liquid layers.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Qualitative analysis — nitrate test  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3158).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: nitrate ions give a brown ring at the interface in the brown-ring test using FeSO₄ and concentrated H₂SO₄. Highest same-subject Dice 0.3158; closest results are other qualitative tests, not nitrate identification. Qualitative analysis and tests for anions; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-90 — Crystallisation / Water of crystallisation

**Question:** In hydrated copper(II) sulfate, CuSO₄·5H₂O, the number 5 indicates that each formula unit contains:

- A. Five sulfate ions
- B. Five water molecules of crystallisation
- C. Five copper ions
- D. Five hydrogen ions

**Draft key:** B  
**Draft explanation:** The dot formula CuSO₄·5H₂O shows five water molecules associated with each formula unit of hydrated copper(II) sulfate.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Chemical formulae and salts — water of crystallisation  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3021).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: CuSO₄·5H₂O contains five water molecules of crystallisation per formula unit. Highest same-subject Dice 0.3021; closest match is copper(II) sulfate electrolysis, not hydrate formula interpretation. Chemical formulae, hydrated salts and water of crystallisation; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Economics (16)

### DUP-10 — Inflation / Deflation

**Question:** A continuous fall in the general price level of goods and services in an economy is known as:

- A. inflation
- B. deflation
- C. devaluation
- D. stagflation

**Draft key:** B  
**Draft explanation:** Deflation is a sustained decrease in the general price level, meaning the purchasing power of money rises.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Money and inflation — deflation  
**Mapping status:** provisionally_aligned

**Lexical flag:** 0.4507 (threshold 0.42); closest match batch 02 row 29 — A sustained rise in the general price level is called:.

**Assistant preliminary check:** Preliminary answer check: B is correct; deflation is a sustained fall in the general price level. The flagged comparison defines inflation, the opposite movement; the concepts are related but not the same answer, so independent contextual review should confirm the replacement adds useful coverage.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-12 — Macroeconomics / Per capita income

**Question:** A country has a national income of ₦900 billion and a population of 30 million. What is its per capita income?

- A. ₦3,000
- B. ₦30,000
- C. ₦300,000
- D. ₦3,000,000

**Draft key:** B  
**Draft explanation:** Per capita income = national income ÷ population = ₦900,000,000,000 ÷ 30,000,000 = ₦30,000.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** National income — measurement and estimates  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3521).

**Assistant preliminary check:** Preliminary calculation check: B is correct; ₦900,000,000,000 ÷ 30,000,000 = ₦30,000 per person. The units and arithmetic are consistent.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-15 — Public finance / Recurrent expenditure

**Question:** Government payment of monthly salaries to public school teachers is generally classified as:

- A. capital expenditure
- B. recurrent expenditure
- C. public debt repayment only
- D. foreign investment

**Draft key:** B  
**Draft explanation:** Recurrent expenditure covers regular operating costs such as salaries, utilities and routine administration.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Public finance — public expenditure  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3827).

**Assistant preliminary check:** Preliminary answer check: B is correct; routine teacher salaries are recurrent expenditure rather than capital expenditure. The explanation accurately identifies ongoing operating costs.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-19 — International trade / Customs unions

**Question:** A customs union is a trade arrangement in which member countries: 

- A. apply a common external tariff to non-members
- B. ban all trade among themselves
- C. use different external tariffs for every non-member
- D. abolish all domestic taxes

**Draft key:** A  
**Draft explanation:** A customs union removes or reduces trade barriers among members and adopts a common external tariff toward non-members.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** International trade — trade arrangements/customs unions  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3519).

**Assistant preliminary check:** Preliminary answer check: A is correct; a customs union combines internal free trade (or removal of internal tariffs) with a common external tariff. The explanation states both essential features.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-20 — Money and banking / Commercial banking

**Question:** When a commercial bank grants a loan to a customer, it primarily creates:

- A. a new tax liability
- B. a deposit balance in the borrower's account
- C. new currency notes issued by the central bank
- D. a government budget surplus

**Draft key:** B  
**Draft explanation:** When a bank makes a loan, it normally credits the borrower's deposit account, creating a corresponding bank deposit and loan asset.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Financial institutions — deposit money banks and creation of money  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3273).

**Assistant preliminary check:** Preliminary answer check: B is correct; when a commercial bank grants a loan it normally records a loan asset and credits a deposit in the borrower's account. This is deposit creation, not the printing of central-bank notes.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-23 — International trade / Foreign direct investment

**Question:** A foreign company establishes and operates a manufacturing plant in Nigeria. This is an example of:

- A. foreign direct investment
- B. an import quota
- C. a trade embargo
- D. a balance-of-trade deficit

**Draft key:** A  
**Draft explanation:** Foreign direct investment involves an investor from another country establishing or acquiring a lasting business interest in the host country.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** International trade / economic growth and development — foreign investment  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2963).

**Assistant preliminary check:** Preliminary answer check: A is correct; establishing and operating a manufacturing plant in another country is foreign direct investment because it creates a lasting business interest. The distractors describe trade restrictions or external-balance outcomes.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-25 — Public finance / Tax avoidance and evasion

**Question:** Knowingly concealing taxable income to avoid paying legally due tax is known as:

- A. tax evasion
- B. tax incidence
- C. tax shifting
- D. public borrowing

**Draft key:** A  
**Draft explanation:** Tax evasion is the illegal concealment or misrepresentation of income or transactions to avoid tax liability.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Public finance — taxation and tax principles  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2628).

**Assistant preliminary check:** Preliminary answer check: A is correct; knowingly concealing taxable income to avoid legally due tax is tax evasion. The explanation appropriately distinguishes illegal evasion from lawful tax planning/avoidance.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-42 — Production / Law of diminishing returns

**Question:** In the short run, the law of diminishing returns states that when additional units of a variable factor are combined with fixed factors, the marginal product of the variable factor will eventually:

- A. increase without limit
- B. remain constant at every level of output
- C. decline
- D. become negative immediately

**Draft key:** C  
**Draft explanation:** With other factors fixed, adding more units of a variable input will eventually cause the marginal product of that input to fall, assuming the production process is otherwise unchanged.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Production — law of variable proportions / diminishing returns  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3211).

**Assistant preliminary check:** Preliminary answer check: C is correct; with fixed factors in the short run, marginal product eventually declines as more units of a variable factor are added. It does not necessarily become negative immediately; the stem correctly says 'eventually decline'.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-45 — Factors of production / Economic rent

**Question:** Economic rent is the payment received by a factor of production in excess of its:

- A. marginal product
- B. transfer earnings
- C. total revenue
- D. fixed cost

**Draft key:** B  
**Draft explanation:** Economic rent is the surplus payment to a factor over the minimum amount required to keep it in its present use, known as transfer earnings.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Factors of production — factor rewards  
**Mapping status:** subject_review_required

**Lexical flag:** 0.4286 (threshold 0.42); closest match batch 01 row 29 — Which factor of production receives wages as its typical reward?.

**Assistant preliminary check:** Preliminary answer check: B is correct; economic rent is the payment earned above transfer earnings. The definition is sound; the lexical flag is against a question on wages as a factor reward, a related but different concept, and needs independent contextual review.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-49 — Public finance / Tax incidence

**Question:** After the effects of tax shifting have worked through a market, the tax incidence refers to:

- A. The authority that collects the tax
- B. The date on which the tax becomes payable
- C. The final distribution of the tax burden between buyers and sellers
- D. The total quantity of goods produced before the tax

**Draft key:** C  
**Draft explanation:** Tax incidence describes who ultimately bears the economic burden of a tax, which may differ from the person or firm legally required to remit it.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Public finance — taxation and tax incidence  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2807).

**Assistant preliminary check:** preliminary_pass. C is correct: tax incidence is the final economic distribution of a tax burden between buyers and sellers, which can differ from the party legally remitting the tax. No same-subject stem reached the 0.42 lexical threshold; top match was 0.2807. Lexical screening alone cannot exclude semantic overlap. Provisionally fits public finance, taxation principles and tax incidence/effects.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-54 — Demand and supply / Cross elasticity of demand

**Question:** The cross elasticity of demand between two goods is +0.8. What does this value indicate about the relationship between the goods?

- A. They are substitutes.
- B. They are complements.
- C. They are unrelated goods.
- D. Both are inferior goods.

**Draft key:** A  
**Draft explanation:** A positive cross elasticity of demand means that an increase in the price of one good is associated with an increase in the quantity demanded of the other. The goods are substitutes.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Demand — elasticity and relationships between goods  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4141).

**Assistant preliminary check:** preliminary_pass. A is correct. A positive cross elasticity means the goods are substitutes; a negative value would indicate complements. After rewriting the stem to focus on interpreting the sign of cross elasticity, the refreshed screen's highest same-subject score is 0.4141. It remains distinct from own-price elasticity, but human contextual review is required. Provisionally fits elasticity of demand and relationships between goods.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-75 — International trade / Comparative advantage

**Question:** Country A can produce either 10 units of rice or 5 units of cloth with the same resources. Country B can produce either 8 units of rice or 8 units of cloth. Which country has a comparative advantage in cloth?

- A. Country A
- B. Country B
- C. Both countries equally
- D. Neither country

**Draft key:** B  
**Draft explanation:** The opportunity cost of one unit of cloth is 2 units of rice in A and 1 unit of rice in B. B has the lower opportunity cost and therefore the comparative advantage in cloth.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** International trade — comparative advantage  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4022).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: opportunity cost of cloth is 2 units of rice in A and 1 in B; B has comparative advantage. Highest same-subject Dice 0.4022 against an absolute-advantage question. Related trade theory but different criterion; human Economics review required. International trade and comparative advantage; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-76 — Market failure / Negative externalities

**Question:** A factory releases untreated waste into a river, imposing costs on nearby residents that are not reflected in the market price of its product. This is an example of:

- A. A positive externality
- B. A negative externality
- C. A public good
- D. A transfer payment

**Draft key:** B  
**Draft explanation:** A negative externality occurs when production or consumption imposes external costs on third parties that are not included in the market price.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Market failure — externalities  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3622).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: untreated waste imposes external costs on third parties, a negative production externality. Highest same-subject Dice 0.3622; no negative-externality match identified in the screen. Market failure and externalities; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-80 — Economic systems / Mixed economy

**Question:** An economy in which private businesses operate alongside state-owned enterprises and government regulation is generally described as:

- A. A command economy
- B. A traditional economy
- C. A mixed economy
- D. A subsistence economy

**Draft key:** C  
**Draft explanation:** A mixed economy combines private economic activity with government ownership, regulation or provision of selected goods and services.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Economic systems — mixed economy  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3524).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. C is correct: a mixed economy combines private enterprise with government ownership, regulation or provision. Highest same-subject Dice 0.3524 against a command-economy definition; distinct system characteristics. Economic systems; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-82 — Consumer behaviour / Law of diminishing marginal utility

**Question:** As a consumer consumes additional units of a good within a given period, the marginal utility from each successive unit generally:

- A. Increases continuously
- B. Diminishes
- C. Remains permanently zero
- D. Becomes equal to total expenditure

**Draft key:** B  
**Draft explanation:** The law of diminishing marginal utility states that, other things being equal, the additional satisfaction from each extra unit consumed tends to fall as consumption increases.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Consumer behaviour — diminishing marginal utility  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.413).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: marginal utility from successive units generally diminishes, other things equal. Highest same-subject Dice 0.4130 against existing marginal-utility definition questions. This is conceptually close and requires explicit human review before approval. Consumer behaviour and utility; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-88 — Inflation / Cost-push inflation

**Question:** A sharp increase in the cost of imported fuel raises production expenses across an economy. This is most likely to cause:

- A. Demand-pull inflation
- B. Cost-push inflation
- C. Deflation
- D. A fall in the general price level

**Draft key:** B  
**Draft explanation:** Cost-push inflation occurs when rising production costs, such as fuel and imported input costs, push firms to raise prices.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Inflation — cost-push inflation  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4167).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: rising production costs can push firms to raise prices, causing cost-push inflation. Highest same-subject Dice 0.4167 against a production-cost/supply question. Related cost shock, different outcome; human Economics review required. Inflation and causes of inflation; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Government (5)

### DUP-28 — Federalism / Exclusive legislative powers

**Question:** In Nigeria, which level of government has exclusive legislative authority over matters on the Exclusive Legislative List?

- A. Local government councils
- B. State governments
- C. The federal legislature
- D. Traditional councils

**Draft key:** C  
**Draft explanation:** The National Assembly legislates on matters assigned to the Exclusive Legislative List by the Constitution.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Arms of government — legislature; structures of governance — federalism; constitution  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3375).

**Assistant preliminary check:** Preliminary answer check: C is correct; under Nigeria's constitutional federal arrangement, the National Assembly legislates on matters in the Exclusive Legislative List. The explanation is appropriately specific to the federal legislature.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-36 — Political parties / Party organisation

**Question:** The document that formally sets out the rules and internal structure of a political party is its:

- A. party constitution
- B. national budget
- C. electoral register
- D. standing orders of the courts

**Draft key:** A  
**Draft explanation:** A party constitution sets out the organisation, membership rules, offices and procedures of the political party.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Political parties and party systems — organization and functions  
**Mapping status:** provisionally_aligned

**Lexical flag:** 0.4459 (threshold 0.42); closest match batch 26 row 35 — A political party manifesto is primarily a document that.

**Assistant preliminary check:** Preliminary answer check: A is correct; a party constitution sets out internal organisation, membership and procedures. The flagged comparison concerns a party manifesto, which sets out policies/promises rather than internal governing rules; independent contextual review remains required.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-37 — Legislature / Private members' bills

**Question:** A private member's bill is generally introduced by: 

- A. a legislator who is not acting as a government minister
- B. the Chief Justice
- C. the national electoral commission
- D. a local government chairman

**Draft key:** A  
**Draft explanation:** A private member's bill is introduced by a legislator who is not introducing it on behalf of the executive government.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Arms of government — legislature; processes of legislation  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.4167).

**Assistant preliminary check:** Preliminary answer check: A is correct; a private member's bill is introduced by a legislator acting in an individual/non-executive capacity rather than as a government bill. The wording is acceptable, though the precise procedural rules depend on the legislature.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-47 — Legislature / Legislative privilege

**Question:** The privilege of freedom of speech in legislative proceedings primarily allows a legislator to:

- A. express views during parliamentary proceedings without being sued or prosecuted for those statements
- B. avoid criminal responsibility for offences committed outside the legislature
- C. ignore lawful court orders
- D. prevent the public from scrutinising legislative debates

**Draft key:** A  
**Draft explanation:** Parliamentary privilege protects statements made as part of legislative proceedings so members can debate freely. It is not a general immunity from criminal law or unrelated legal duties.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Legislature — powers, functions and privileges  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3893).

**Assistant preliminary check:** Preliminary answer check: A is the intended answer; freedom of speech in legislative proceedings protects statements made as part of those proceedings. The explanation correctly warns that this is not blanket immunity for conduct outside the legislature; subject review should confirm the local constitutional framing.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-77 — Political concepts / Rule of law

**Question:** Which principle of the rule of law requires that public officials and ordinary citizens are subject to the same law?

- A. Equality before the law
- B. Collective responsibility
- C. Separation of powers
- D. Political neutrality

**Draft key:** A  
**Draft explanation:** Equality before the law means that no person is above the law and that the law applies to public officials and ordinary citizens alike.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Political principles — rule of law  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3724).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: equality before the law means public officials and ordinary citizens are subject to the same law. Highest same-subject Dice 0.3724; closest matches concern accountability, neutrality and checks/balances. Rule of law and constitutional principles; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Literature in English (12)

### DUP-05 — Poetry / Iambic pentameter

**Question:** A line of verse made up of five iambic feet is said to be written in:

- A. Iambic tetrameter
- B. Iambic pentameter
- C. Trochaic trimeter
- D. Dactylic hexameter

**Draft key:** B  
**Draft explanation:** An iambic foot has an unstressed syllable followed by a stressed syllable. Five such feet form iambic pentameter.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Poetry — Iambic pentameter  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3673).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: an iamb is an unstressed syllable followed by a stressed syllable; five iambs form iambic pentameter. Full 1,600-row same-subject lexical screen: maximum Dice 0.3673 against a blank-verse question. Blank verse is commonly written in unrhymed iambic pentameter, so this is related and requires explicit Literature reviewer confirmation. Poetry and metre; confirm the level of metrical terminology against the current JAMB Literature syllabus.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-21 — Narrative structure / Flashback

**Question:** A narrative technique that interrupts the present action to show an event from an earlier time is called:

- A. foreshadowing
- B. flashback
- C. climax
- D. denouement

**Draft key:** B  
**Draft explanation:** A flashback takes the reader or audience back to an earlier event to provide background or context.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Literary principles and terminology — narrative techniques (flashback)  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4103).

**Assistant preliminary check:** Preliminary answer check: B is correct; a flashback interrupts the present narrative to present an earlier event. The explanation accurately distinguishes it from foreshadowing and the climax/denouement.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-32 — Drama / Comedy of manners

**Question:** A comedy that satirises the manners, social conventions and behaviour of a particular social class is called a:

- A. Comedy of manners
- B. Tragedy
- C. Pastoral elegy
- D. Epic

**Draft key:** A  
**Draft explanation:** Comedy of manners uses wit, irony and satire to expose the artificial behaviour and social conventions of a particular class or society.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Drama — Comedy of manners  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3483).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: comedy of manners satirises the behaviour and social conventions of a particular class or society. Full 1,600-row same-subject lexical screen: maximum Dice 0.3483; closest matches test lyric poetry, epilogue and plot development, not comedy of manners. Drama and dramatic genres; confirm the exact genre terminology against the current JAMB Literature syllabus.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-35 — Literary criticism / Epigraph

**Question:** A short quotation placed at the beginning of a book or chapter to suggest its theme is called an:

- A. epigraph
- B. epilogue
- C. aside
- D. prologue

**Draft key:** A  
**Draft explanation:** An epigraph is a quotation or brief statement placed at the beginning of a literary work or section, often to introduce its theme.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** General literary principles — literary terms  
**Mapping status:** provisionally_aligned

**Lexical flag:** 0.4311 (threshold 0.42); closest match batch 20 row 41 — A short concluding section that follows the main action of a play is called an:.

**Assistant preliminary check:** Preliminary answer check: A is correct; an epigraph is a quotation placed at the beginning of a work or section to suggest a theme. The flagged nearest item concerns an epilogue, a concluding section, so the terms are distinct despite lexical similarity; independent Literature review remains required.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-48 — Literary criticism / Denotation and connotation

**Question:** In literary analysis, the denotation of a word refers to its:

- A. Emotional associations in a particular context
- B. Literal or direct meaning
- C. Sound pattern when spoken
- D. Historical origin and development

**Draft key:** B  
**Draft explanation:** Denotation is the direct or dictionary meaning of a word, while connotation refers to the ideas or feelings associated with it.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Literary principles and terminology — denotation  
**Mapping status:** subject_review_required

**Lexical flag:** 0.6667 (threshold 0.42); closest match batch 36 row 38 — In literary analysis, diction refers to the writer's:.

**Assistant preliminary check:** conditional_pass_subject_content. B is correct: denotation is a word's literal or direct meaning; connotation concerns associated ideas or feelings. The refreshed lexical screen flags 0.6667 similarity with batch 36 row 38 (diction). Diction concerns a writer's choice/use of words; denotation concerns a word's direct meaning. Related vocabulary concepts, but not the same definition or learning objective. Provisionally fits general literary principles and literary terminology; verify exact expected scope against the current JAMB Literature syllabus.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-55 — Sound devices / Cacophony

**Question:** A poet deliberately uses harsh, discordant combinations of sounds to create an unpleasant or jarring effect. This sound device is called:

- A. Euphony
- B. Cacophony
- C. Assonance
- D. Alliteration

**Draft key:** B  
**Draft explanation:** Cacophony is the deliberate use of harsh or discordant sounds to create a jarring effect. Euphony creates a pleasing sound; assonance repeats vowel sounds; alliteration repeats initial consonant sounds.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Poetry — sound devices  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3396).

**Assistant preliminary check:** preliminary_pass. B is correct. Cacophony is the deliberate use of harsh, discordant sounds; the other options describe distinct sound devices. Refreshed screen highest same-subject similarity 0.3396; manual concept comparison still required. The current bank contains assonance, alliteration and sibilance questions, but not an equivalent definition of cacophony identified in the topic index. Provisionally fits poetic sound devices and literary terminology.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-56 — Sound devices / Euphony

**Question:** A poet arranges words and sounds to produce a smooth, harmonious and pleasing auditory effect. This technique is known as:

- A. Cacophony
- B. Euphony
- C. Sibilance
- D. Onomatopoeia

**Draft key:** B  
**Draft explanation:** Euphony is the use or arrangement of pleasing, harmonious sounds. Cacophony produces harsh or discordant sounds; sibilance repeats hissing consonants; onomatopoeia imitates sounds.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Poetry — sound devices  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2793).

**Assistant preliminary check:** preliminary_pass. B is correct. Euphony produces smooth, harmonious sounds; cacophony produces harsh or discordant sounds. Refreshed same-subject screen highest similarity 0.2793. Existing questions cover assonance, alliteration and sibilance; this draft tests euphony. Human concept-level review remains required. Provisionally fits poetic sound devices and literary terminology.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-59 — Literary devices / Epithet

**Question:** In the expression “swift-footed Achilles”, the words “swift-footed” function as a/an:

- A. Epithet
- B. Euphemism
- C. Paradox
- D. Onomatopoeia

**Draft key:** A  
**Draft explanation:** An epithet is a descriptive expression attached to a person or thing to highlight a characteristic. “Swift-footed” is a recurring descriptive epithet associated with Achilles.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Poetry — literary terminology  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4113).

**Assistant preliminary check:** preliminary_pass. A is correct. “Swift-footed” is a descriptive epithet traditionally associated with Achilles. After replacing the earlier generic and Richard-the-Lionheart stems, the refreshed screen's highest same-subject score is 0.4113. Human contextual review remains required. Provisionally fits literary devices and terminology.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-62 — Poetic techniques / Enjambment

**Question:** When a poet carries a sentence beyond the end of a line without a pause, the technique is called:

- A. Enjambment
- B. Caesura
- C. Alliteration
- D. Refrain

**Draft key:** A  
**Draft explanation:** Enjambment occurs when the sense of a sentence or phrase continues from one poetic line into the next without a grammatical pause at the line ending. Caesura is a pause within a line.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Poetry — poetic techniques  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4046).

**Assistant preliminary check:** preliminary_pass_pending_human_review. A is correct. Enjambment carries grammatical sense across a line ending without a pause; caesura is a pause within a line. Highest same-subject Dice score is 0.4046 against a caesura definition. The concepts are distinct but lexically close; human Literature review is important. Provisionally fits poetic techniques and sound/structure devices; confirm exact syllabus coverage.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-69 — Drama / Dramatic irony

**Question:** A character confidently predicts success while the audience already knows that the character's plan is doomed. This contrast is an example of:

- A. Dramatic irony
- B. Comic relief
- C. Soliloquy
- D. Foreshadowing

**Draft key:** A  
**Draft explanation:** Dramatic irony occurs when the audience knows something important that a character does not, creating a contrast between the character's understanding and the audience's knowledge.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Drama — dramatic irony  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3182).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: dramatic irony occurs when the audience knows important information that a character does not. Highest same-subject Dice 0.3182; closest lexical matches concern narrative technique and stage remarks, not dramatic irony. Drama and dramatic techniques; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-83 — Literary terms / Pseudonym

**Question:** A writer who publishes under an assumed name different from their own is using a:

- A. Pseudonym
- B. Prologue
- C. Refrain
- D. Soliloquy

**Draft key:** A  
**Draft explanation:** A pseudonym is an assumed or pen name used by an author instead of their actual name.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Literary terminology — pseudonym  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3514).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: a pseudonym is an assumed or pen name used by an author. Highest same-subject Dice 0.3514; no pseudonym match identified. Literary terminology; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-85 — Drama and stagecraft / Blocking

**Question:** In theatre, the planned movement and positioning of actors on stage during a performance is known as:

- A. Blocking
- B. Casting
- C. Diction
- D. Catharsis

**Draft key:** A  
**Draft explanation:** Blocking is the planned arrangement and movement of performers on stage to support the action and visual composition of a production.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Drama and stagecraft — blocking  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3723).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: blocking is the planned movement and positioning of performers on stage. Highest same-subject Dice 0.3723; no stage-blocking match identified. Drama and stagecraft; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Mathematics (5)

### DUP-01 — Geometry / Properties of rectangles

**Question:** Which statement about the diagonals of a rectangle is correct?

- A. They are unequal and do not bisect each other
- B. They are equal in length and bisect each other
- C. They are perpendicular in every rectangle
- D. They are parallel to the shorter sides

**Draft key:** B  
**Draft explanation:** The diagonals of a rectangle are equal in length and bisect one another.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Geometry/Trigonometry — Euclidean geometry  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.35).

**Assistant preliminary check:** Preliminary answer check: B is correct; a rectangle's diagonals are equal and bisect one another. They are not necessarily perpendicular, so option C is a valid distractor.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-27 — Variation / Joint variation

**Question:** If z varies jointly as x and y, which equation represents the relationship?

- A. z = k(x + y)
- B. z = kxy
- C. z = k/x + y
- D. z = kx/y²

**Draft key:** B  
**Draft explanation:** Joint variation means z is proportional to the product of x and y, so z = kxy.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Algebra — variation (joint variation)  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3967).

**Assistant preliminary check:** Preliminary answer check: B is correct; joint variation of z with x and y is represented by z = kxy, where k is the constant of variation. The distractors represent different relationships.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-43 — Functions / One-to-one functions

**Question:** A function is one-to-one if:

- A. every element of its domain has the same image
- B. different elements of its domain have different images
- C. every element of the codomain must be an image
- D. the function has no inverse

**Draft key:** B  
**Draft explanation:** A one-to-one function maps distinct domain elements to distinct values; no two different inputs share the same output.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Algebra — functions  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2143).

**Assistant preliminary check:** Preliminary answer check: B is correct; injectivity means distinct domain elements map to distinct images. Option C instead describes surjectivity, making it a useful contrasting distractor.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-52 — Matrices / Matrix multiplication

**Question:** Evaluate the matrix product [[1, 2], [0, 3]] × [[2, 1], [4, 0]].

- A. [[10, 1], [12, 0]]
- B. [[2, 4], [0, 9]]
- C. [[10, 4], [12, 3]]
- D. [[6, 1], [12, 0]]

**Draft key:** A  
**Draft explanation:** Multiply each row of A by each column of B. The entries are 1×2 + 2×4 = 10, 1×1 + 2×0 = 1, 0×2 + 3×4 = 12, and 0×1 + 3×0 = 0. Therefore AB = [[10, 1], [12, 0]].  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Algebra — matrices  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4).

**Assistant preliminary check:** preliminary_pass. A is correct. Row-by-column multiplication gives [[10, 1], [12, 0]]. Refreshed screen: highest same-subject score 0.4; top matches are unrelated arithmetic/matrix-trace stems. The matrix product operation is distinct; this is a lexical/template flag, not a duplicate finding. Provisionally fits matrix operations; matrix multiplication is distinct from the existing determinant and trace items.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-63 — Ratio and proportion / Map scales

**Question:** A map has a scale of 1:50,000. What actual distance is represented by 4 cm on the map?

- A. 500 m
- B. 1 km
- C. 2 km
- D. 20 km

**Draft key:** C  
**Draft explanation:** A scale of 1:50,000 means 1 cm on the map represents 50,000 cm on the ground. Therefore 4 cm represents 200,000 cm, which is 2,000 m or 2 km.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Ratio and proportion — map scales  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3648).

**Assistant preliminary check:** preliminary_pass_pending_human_review. C is correct. 4 × 50,000 cm = 200,000 cm = 2,000 m = 2 km. Highest same-subject Dice score is 0.3648 against a circle-sector question. No concept-level duplicate identified in the screen; contextual review remains required. Provisionally fits ratio, proportion and scale conversion; confirm map-scale coverage in the current JAMB Mathematics syllabus.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Physics (11)

### DUP-03 — Electricity / Alternating current

**Question:** An electric current that repeatedly changes direction at regular intervals is called:

- A. direct current
- B. alternating current
- C. static charge
- D. induced resistance

**Draft key:** B  
**Draft explanation:** Alternating current periodically reverses direction, unlike direct current, which flows in one direction.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Simple A.C. circuits  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.4138).

**Assistant preliminary check:** Preliminary answer check: B is correct; alternating current periodically changes direction, unlike direct current. The explanation matches the defining distinction.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-07 — Heat / Heat transfer by radiation

**Question:** Which method of heat transfer can occur through a vacuum?

- A. conduction
- B. convection
- C. radiation
- D. evaporation

**Draft key:** C  
**Draft explanation:** Radiation transfers energy by electromagnetic waves and does not require a material medium.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Heat transfer  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.4094).

**Assistant preliminary check:** Preliminary answer check: C is correct; radiation transfers energy by electromagnetic waves and can travel through a vacuum, unlike conduction and convection. The explanation is accurate.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-11 — Optics / Thin lenses

**Question:** A ray of light directed through the optical centre of a thin lens emerges:

- A. parallel to the principal axis in every case
- B. without deviation
- C. through the principal focus
- D. perpendicular to the principal axis

**Draft key:** B  
**Draft explanation:** A paraxial ray passing through the optical centre of a thin lens is transmitted without appreciable deviation.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Refraction of light through plane and curved surfaces — lenses  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3577).

**Assistant preliminary check:** Preliminary answer check: B is correct under the thin-lens/paraxial-ray approximation; a ray through the optical centre emerges with negligible deviation. The stem's thin-lens assumption is important and is stated.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-18 — Optics / Law of reflection

**Question:** A ray of light strikes a plane mirror at an angle of incidence of 35° to the normal. What is its angle of reflection, measured from the normal?

- A. 25°
- B. 35°
- C. 55°
- D. 70°

**Draft key:** B  
**Draft explanation:** The law of reflection states that the angle of reflection equals the angle of incidence. Both angles are measured between the ray and the normal to the reflecting surface.  
**Draft status:** revised_draft_needs_independent_subject_and_contextual_review  
**Syllabus area:** Physics — Reflection of light at plane and curved surfaces (Topic 24: laws of reflection)  
**Mapping status:** provisionally_aligned_to_explicit_official_topic

**Lexical flag:** 0.4271 (threshold 0.42); closest match held duplicate row DUP-51 — total internal reflection at a boundary. Other close match: a plane-mirror image question (0.3485).

**Assistant preliminary check:** B is correct. The explicit reference to the normal removes the possible angle-measurement ambiguity. The closest held-bank match tests the critical-angle condition for total internal reflection, not equality of incidence and reflection angles; the other close match tests image formation. These are related optics content but different learning objectives. This is a preliminary distinction, not independent proof of uniqueness.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-26 — Electricity / Capacitance calculations

**Question:** A capacitor stores a charge of 24 μC when connected to a 6 V supply. What is its capacitance?

- A. 2 μF
- B. 4 μF
- C. 6 μF
- D. 12 μF

**Draft key:** B  
**Draft explanation:** C = Q/V = 24 μC ÷ 6 V = 4 μF.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Capacitors  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3833).

**Assistant preliminary check:** Preliminary calculation check: B is correct; C = Q/V = 24 μC ÷ 6 V = 4 μF. The units are consistent.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-31 — Mechanics / Impulse and momentum

**Question:** A 0.2 kg ball moving at 10 m/s is brought to rest in 0.5 s. What is the magnitude of the average force applied?

- A. 2 N
- B. 4 N
- C. 5 N
- D. 20 N

**Draft key:** B  
**Draft explanation:** Average force equals change in momentum divided by time: F = (0.2 × 10) ÷ 0.5 = 4 N.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Mechanics — Newton's laws, impulse and momentum  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.3766).

**Assistant preliminary check:** Preliminary calculation check: B is correct; the initial momentum is 0.2 × 10 = 2 kg m/s, so the average force magnitude is 2 ÷ 0.5 = 4 N. The explanation is dimensionally consistent.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-44 — Waves / Diffraction

**Question:** The bending or spreading of waves as they pass through a narrow opening or around an obstacle is called:

- A. reflection
- B. diffraction
- C. refraction
- D. polarisation

**Draft key:** B  
**Draft explanation:** Diffraction is the spreading of waves when they pass through an opening or around an obstacle. It is most noticeable when the opening or obstacle is comparable in size to the wavelength.  
**Draft status:** new_draft_pending_subject_review_and_bankwide_screen  
**Syllabus area:** Waves — wave properties  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.325).

**Assistant preliminary check:** Preliminary answer check: B is correct; diffraction is the spreading of waves around obstacles or through openings, especially when dimensions are comparable to wavelength. The explanation includes the key condition.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-51 — Waves / Resonance

**Question:** A system is said to be in resonance when the frequency of an applied periodic force is equal to its:

- A. amplitude
- B. natural frequency
- C. wavelength
- D. wave speed

**Draft key:** B  
**Draft explanation:** Resonance occurs when the driving frequency matches the natural frequency of a system, producing a large response under suitable conditions.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Waves and vibrations — resonance  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3952).

**Assistant preliminary check:** preliminary_pass. B is correct: resonance occurs when the driving frequency matches a system's natural frequency; response amplitude depends on damping and system conditions. No same-subject stem reached the 0.42 lexical threshold; top match was 0.3952. Check concept-level overlap with the full Physics bank during human review. Provisionally fits vibrations, forced vibrations and resonance within wave/vibration topics.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-66 — Electromagnetism / Transformer efficiency

**Question:** A transformer receives 240 V on its primary coil and supplies 12 V across its secondary coil. If the primary current is 0.5 A and the secondary current is 8 A, what is its efficiency?

- A. 60%
- B. 70%
- C. 80%
- D. 90%

**Draft key:** C  
**Draft explanation:** Input power = 240 × 0.5 = 120 W. Output power = 12 × 8 = 96 W. Efficiency = (96/120) × 100 = 80%.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Electricity and magnetism — transformer efficiency  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3285).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. C is correct: input power = 240 × 0.5 = 120 W; output power = 12 × 8 = 96 W; efficiency = 96/120 × 100 = 80%. Highest same-subject Dice 0.3285; closest match is a machine-efficiency question, not a transformer calculation. Human Physics review must confirm the distinction. Transformer performance/efficiency; confirm syllabus depth.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-71 — Electrostatics / Coulomb's law

**Question:** Two point charges are separated by a distance r and exert an electrostatic force F on each other. If their separation is increased to 2r without changing the charges, what is the new force?

- A. 4F
- B. 2F
- C. F/2
- D. F/4

**Draft key:** D  
**Draft explanation:** By Coulomb's law, electrostatic force is inversely proportional to the square of separation. Doubling the distance gives F/(2²) = F/4.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Electrostatics — Coulomb's law  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3117).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. D is correct: Coulomb's law gives F proportional to 1/r²; doubling separation reduces force to F/4. Highest same-subject Dice 0.3117; closest matches are resistor and charging questions, not Coulomb's inverse-square law. Electrostatics and Coulomb's law; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-81 — Heat / Linear expansion

**Question:** A metal rod of length 2.0 m increases in length by 0.002 m when heated through 50 °C. What is its coefficient of linear expansion?

- A. 2.0 × 10⁻⁵ °C⁻¹
- B. 5.0 × 10⁻⁵ °C⁻¹
- C. 2.0 × 10⁻⁴ °C⁻¹
- D. 5.0 × 10⁻⁴ °C⁻¹

**Draft key:** A  
**Draft explanation:** Using ΔL = αLΔT, α = 0.002 ÷ (2.0 × 50) = 0.00002 °C⁻¹ = 2.0 × 10⁻⁵ °C⁻¹.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Heat — linear expansion  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3587).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: α = ΔL/(LΔT) = 0.002/(2 × 50) = 2.0 × 10⁻⁵ °C⁻¹. Highest same-subject Dice 0.3587 against a definition of the coefficient; this item is a calculation. Thermal expansion; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Use of English (11)

### DUP-29 — Grammar / Prepositions

**Question:** The patient was deprived _____ sleep during the long journey. 

- A. from
- B. of
- C. with
- D. by

**Draft key:** B  
**Draft explanation:** The correct expression is “deprived of” something.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Lexis and structure — ordinary/idiomatic usage and word classes/functions  
**Mapping status:** provisionally_aligned

**Lexical screen:** below 0.42 (highest score 0.1923).

**Assistant preliminary check:** Preliminary answer check: B is correct; the standard collocation is 'deprived of sleep'. The distractors do not fit the required preposition.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-30 — Vocabulary / Specialised vocabulary

**Question:** A person whose profession involves compiling dictionaries is called a:

- A. Lexicographer
- B. Biographer
- C. Cartographer
- D. Choreographer

**Draft key:** A  
**Draft explanation:** A lexicographer is a person who compiles, edits or writes dictionaries.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Vocabulary — Specialised vocabulary  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2637).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: a lexicographer compiles, edits or writes dictionaries. Full 1,600-row same-subject lexical screen: maximum Dice 0.2637. The nearest related occupation is an etymologist, a different role (word origins rather than dictionary compilation). Vocabulary and specialised word meanings; confirm expected vocabulary depth against the current JAMB Use of English syllabus.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-33 — Grammar / Relative pronouns

**Question:** In the sentence “The officer to whom I submitted the form acknowledged its receipt,” the word “whom” functions as:

- A. the subject of the relative clause
- B. the object of the preposition “to”
- C. the direct object of a verb
- D. the possessor in a noun phrase

**Draft key:** B  
**Draft explanation:** “Whom” is the object form of the relative pronoun “who”. In this sentence it is governed by the preposition “to” and refers to the person who received the form.  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Lexis and Structure — word classes and their functions; clause and sentence patterns  
**Mapping status:** provisionally_aligned_to_explicit_official_topic

**Bankwide collision found and corrected:** The previous draft asked what “whose” expresses. That overlapped semantically with retained batch 20 row 2, which also tests “whose” as a possessive relative pronoun. The earlier lexical screen did not surface this semantic overlap. The draft has therefore been replaced with a different relative-pronoun function: “whom” as the object of a preposition. The retained and held staging files were checked for this function; no same-function item was found in the inspected bank entries. Human English reviewer confirmation remains required.

**Lexical flag:** 0.4459 (threshold 0.42) applied only to the superseded draft. It is not a similarity score for this revised question.

**Assistant preliminary check:** B is correct: “whom” is the object form governed by the preposition “to”. The revised draft no longer asks the same possession question as retained batch 20 row 2. Related relative-pronoun content remains in the bank, but the grammatical function tested is different. Independent contextual and subject review remains required.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________
---

### DUP-34 — Grammar / Concord

**Question:** Choose the correct verb: “The cattle _____ grazing near the river.”

- A. is
- B. was
- C. are
- D. has

**Draft key:** C  
**Draft explanation:** “Cattle” is a plural noun and takes a plural verb: “are.”  
**Draft status:** revised_draft_needs_bank_wide_check  
**Syllabus area:** Lexis and structure — number and agreement/concord  
**Mapping status:** provisionally_aligned

**Lexical flag:** 0.5 (threshold 0.42); closest match batch 01 row 3 — Choose the correct verb: “Neither the teacher nor the students ___ ready.”.

**Assistant preliminary check:** Preliminary answer check: C is correct; 'cattle' is a plural-only noun and takes a plural verb in standard usage. The nearest flagged comparison tests concord with a nearer plural subject after 'neither...nor'; both involve agreement but use different grammatical rules, so an English reviewer should confirm the distinction.  

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-57 — Cohesion / Ellipsis as a cohesive device

**Question:** In the sentence “Ada chose the blue dress, while Tola the red one,” which cohesive device allows the verb phrase “chose” to be omitted from the second clause?

- A. Substitution
- B. Ellipsis
- C. Reference
- D. Conjunction

**Draft key:** B  
**Draft explanation:** Ellipsis is the omission of a word or group of words that can be understood from the surrounding text. Here, “chose” is understood after “Tola” and is therefore omitted.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Cohesion — ellipsis  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3367).

**Assistant preliminary check:** preliminary_pass. B is correct. The verb phrase 'chose' is omitted in the second clause but understood from the first, which is ellipsis. Refreshed same-subject screen highest similarity 0.3367. No equivalent ellipsis item was found by the topic/text scan; contextual review remains required. Provisionally fits cohesion and textual devices in English usage.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-68 — Vocabulary / Homographs

**Question:** In “Strong winds damaged the roof”, the noun “winds” refers to:

- A. Moving air
- B. A winding path
- C. A musical instrument
- D. A direction on a map

**Draft key:** A  
**Draft explanation:** Here “winds” means moving air. The word “wind” can also be a verb meaning to turn or twist, with a different pronunciation.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Lexis — homographs and context  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.2653).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: “winds” means moving air; the homograph “wind” can also mean to turn or twist, with a different pronunciation. Highest same-subject Dice 0.2653; no close conceptual match identified in the lexical screen. Lexis and meaning in context; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-72 — Lexis and structure / Idiomatic expressions

**Question:** When someone says that a plan “fell through”, the expression means that the plan:

- A. Was completed successfully
- B. Failed to happen
- C. Was postponed for one hour
- D. Was kept secret

**Draft key:** B  
**Draft explanation:** “Fall through” means to fail or not be completed as planned.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Lexis — idiomatic expressions  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3894).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: “fall through” means to fail or not happen as planned. Highest same-subject Dice 0.3894; closest items test different idioms. Human English review should confirm idiom selection. Lexis and idiomatic expressions; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-78 — Lexis and structure / Punctuation

**Question:** Which punctuation mark should separate the two independent clauses in this sentence when no coordinating conjunction is used: “The rain stopped _____ the match resumed”?

- A. Apostrophe
- B. Semicolon
- C. Hyphen
- D. Quotation mark

**Draft key:** B  
**Draft explanation:** A semicolon can join two closely related independent clauses when no coordinating conjunction is used.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Punctuation — semicolon  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.4105).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. B is correct: a semicolon can join two closely related independent clauses without a coordinating conjunction. Highest same-subject Dice 0.4105 against a question about semicolons in complex lists. Related punctuation mark but a different use; human review required. Punctuation; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-79 — Grammar / Infinitive of purpose

**Question:** In the sentence “She visited the library to borrow a textbook”, the infinitive phrase “to borrow a textbook” expresses:

- A. Reason or purpose
- B. Possession
- C. Comparison
- D. A condition

**Draft key:** A  
**Draft explanation:** The infinitive phrase explains the purpose of her visit to the library.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Syntax — infinitive phrases  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.381).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: “to borrow a textbook” explains the purpose of visiting the library. Highest same-subject Dice 0.3810; no same-function match identified in the top results. Phrases and infinitive functions; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-87 — Vocabulary / Specialised vocabulary

**Question:** A person who deliberately gives up the use of alcoholic drinks is commonly called a:

- A. Teetotaller
- B. Vegetarian
- C. Philanthropist
- D. Pessimist

**Draft key:** A  
**Draft explanation:** A teetotaller is a person who abstains from drinking alcohol.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Vocabulary — specialised vocabulary  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.406).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: a teetotaller abstains from drinking alcoholic beverages. Highest same-subject Dice 0.4060; closest lexical match is a different occupation/person descriptor. Vocabulary and word meaning; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

### DUP-89 — Oral English / Nasal consonants

**Question:** Which pair consists of two nasal consonant sounds in English?

- A. /m/ and /n/
- B. /p/ and /b/
- C. /f/ and /v/
- D. /s/ and /z/

**Draft key:** A  
**Draft explanation:** /m/ and /n/ are nasal consonants because air passes through the nasal cavity during their production.  
**Draft status:** draft_needs_subject_and_bankwide_review  
**Syllabus area:** Oral English — nasal consonants  
**Mapping status:** subject_review_required

**Lexical screen:** below 0.42 (highest score 0.3964).

**Assistant preliminary check:** preliminary_answer_check_pass_pending_human_review. A is correct: /m/ and /n/ are nasal consonants. Highest same-subject Dice 0.3964 against a consonant-sound comparison question; different phonetic objective. Oral English and consonant classification; confirm syllabus scope.

**Independent reviewer decision:** ☐ Approve  ☐ Revise  ☐ Reject  
**Reviewer / date:** ____________________  
**Rationale / corrections:** ______________________________________________

---

## Official JAMB IBASS source-access note — 2026-11-02

The official IBASS E-syllabus catalogue was retrieved directly at https://ibass.jamb.gov.ng/e-syllabus. Its visible catalogue includes Biology, Chemistry, Economics and Government, with pagination for additional subjects. The catalogue exposes subject “View details” controls, but the detail view did not complete during the browser retrieval attempt. Therefore, this retrieval confirms the official subject catalogue is accessible; it does **not** verify individual topic/subtopic mappings. The 65 mappings marked `subject_review_required` remain unapproved, and 25 mappings remain provisional. DUP-74's corrected Excretion mapping still requires confirmation against the detailed IBASS Biology syllabus. No mapping is upgraded to approved on the basis of the catalogue alone.

## Mapping correction — DUP-21

DUP-21 asks for the general narrative device that presents an earlier event within the present sequence. Its stem does not establish a specifically dramatic text or stage context. The prior label “Drama — dramatic techniques” was therefore too narrow and unsupported by the question wording. The packet label is changed to “Literary principles and terminology — narrative techniques (flashback)” and downgraded from provisionally aligned to subject review required. This is an assistant metadata correction only; it is not an IBASS-confirmed topic mapping or academic approval.

## Question-clarity correction — DUP-38

The original stem asked generally how maternal antibodies transfer to a baby. That wording could also describe antibody transfer through breast milk, even though the intended key was placenta. The draft stem is narrowed to maternal IgG transfer to the fetus before birth, making the intended placental route unambiguous. The answer remains A (placenta). This wording correction is not independent Biology approval; the revised item remains subject to full review.

## Release restriction

No candidate in this packet is approved for insertion. The 12 lexical flags require independent contextual review; the 65 syllabus mappings marked `subject_review_required` require syllabus review; all answers and explanations require independent subject sign-off. Provenance reconciliation is complete: all 13 later-replacement rows have exact row-level introducing commits, DUP-34 is separately verified, and all 90 retained/held staging-location joins match. Original source CSVs remain unchanged. Final import generation, preview admin import testing and any production release remain blocked until all required approvals and explicit user authorization are recorded.


## Pair 05 — DUP-35 and DUP-36 (2026-11-02)

**DUP-35 — Literature in English: epigraph**
- **Answer and explanation:** A (“epigraph”) is correct. An epigraph is a quotation or brief statement placed at the beginning of a literary work or section, often suggesting its theme.
- **Quality check:** The stem is clear and the four options identify distinct literary/dramatic terms. No answer-key or explanation defect was found in this preliminary check.
- **Bank comparison:** All 200 Literature in English retained-plus-held rows were scanned. Closest related terms are epilogue (retained batch 20 row 41: concluding section), prologue (retained batch 37 row 37: introductory section), aside (retained batch 35 row 37: remark to audience), and dramatis personae (held batch 30 row 41: list of characters). These test different terms and functions; no epigraph item was found. The high lexical flag (0.4311) is explained by the epilogue/prologue terminology and is not itself a duplicate verdict.
- **Official syllabus mapping:** Broad proposed mapping to General Literary Principles — literary terms. The official syllabus lists literary terms and examples “etc.” but does not expressly name “epigraph”; this is not an exact topic confirmation. Independent Literature reviewer must confirm syllabus scope and appropriateness.
- **Assistant disposition:** Preliminary answer, explanation and bankwide contextual checks complete. Not approved for import; independent Literature review remains required.

**DUP-36 — Government: party constitution**
- **Answer and explanation:** A (“party constitution”) is correct. It is the party's internal governing document, setting out its organisation, membership rules, offices and procedures.
- **Quality correction:** Replaced weak, unrelated distractors with parallel political-party documents/messages: party manifesto, party programme and campaign slogan. The explanation distinguishes the constitution's internal governance role from policy communication.
- **Bank comparison:** All 200 Government retained-plus-held rows were scanned. No party-constitution item was found. Closest items are retained batch 08 row 39 (general constitution and the framework of government/citizens' rights), retained batch 26 row 35 (party manifesto and policy proposals), and retained batch 02 row 34 (general political-party function). The candidate asks specifically about the internal governing document of a political party; it is distinct from a state constitution and from a manifesto/programme. The lexical flag (0.4459) is a prompt for contextual review, not evidence of duplication.
- **Official syllabus mapping:** Broad proposed mapping to Part 1, Topic 12, “Political Parties and Party Systems” — party definition, organisation and functions; objective: assess the role of political parties. The syllabus does not expressly name party constitutions, so an independent Government reviewer must confirm the detail is suitable.
- **Assistant disposition:** Preliminary answer, distractor, explanation and bankwide contextual checks complete. Not approved for import; independent Government review remains required.

**Pair 05 outcome:** 2 drafts reviewed; 1 distractor/explanation improvement (DUP-36); both candidates compared against all 200 same-subject retained-plus-held rows; both have broad official syllabus mappings but need qualified confirmation; 0 independent subject approvals; both remain blocked from insertion.


## Pair 06 — DUP-37 and DUP-38 (2026-11-02)

**DUP-37 — Government: private member's bill**
- **Answer and explanation:** A is correct. A private member's bill is introduced by a legislator who is not acting as a minister presenting a government bill; it is distinct from a government bill introduced on behalf of the executive.
- **Quality correction:** The stem now specifies a parliamentary system. Distractors were revised to contrast an executive minister, the head of the judiciary and the electoral commission with the legislator introducing a non-government bill.
- **Bank comparison:** All 200 Government retained-plus-held rows were scanned. No private-member's-bill item was found. Closest related entries are retained batch 17 row 33 (committee-stage examination of a bill), batch 15 row 34 (legislative committee functions), batch 24 row 33 (legislative oversight) and batch 29 row 35 (standing committees). These test scrutiny/committee work, not who may introduce a private member's bill.
- **Official syllabus mapping:** Broad proposed mapping to Part 1, Topic 9, “Processes of Legislation — Legislative Enactments”. The syllabus does not expressly name private members' bills, so qualified Government review must confirm the detail and depth.
- **Assistant disposition:** Preliminary answer, wording, distractor and bankwide contextual checks complete. Not approved for import; independent Government review remains required.

**DUP-38 — Biology: maternal passive immunity**
- **Answer and explanation:** A (placenta) is correct. Maternal IgG antibodies cross the placenta from mother to fetus before birth and provide temporary passive immunity.
- **Quality correction propagated:** The replacement-draft JSON previously still contained the original ambiguous stem even though the reviewer packet recorded a correction. The draft file is now aligned to the narrowed stem: “Which structure allows maternal IgG antibodies to pass from the mother to the fetus before birth, providing temporary passive immunity?” The explanation is correspondingly limited to IgG transfer before birth, avoiding ambiguity with antibodies transferred through breast milk.
- **Bank comparison:** All 200 Biology retained-plus-held rows were scanned. No maternal IgG/placental passive-immunity item was found. Closest entries concern placenta exchange of nutrients/gases (retained batch 15 row 14 and batch 28 row 12), antibody production by plasma cells (batch 08 row 14 and batch 25 row 15), and vaccine-induced active immune memory (batch 05 row 15 and batch 15 row 15; held vaccination duplicates remain excluded). These are related but test different mechanisms.
- **Official syllabus mapping:** The official Biology syllabus Part C, Topic 7, “Humans and Environment — Diseases”, includes disease prevention/control and explicitly mentions principles of inoculation and vaccination. It does **not** expressly name passive maternal immunity or placental IgG transfer. The proposed broad mapping is therefore not syllabus-confirmed; an independent Biology reviewer must decide whether this item is within appropriate JAMB depth or should be replaced.
- **Assistant disposition:** Answer, wording and bankwide contextual checks complete; syllabus scope is an explicit open issue. Not approved for import.

**Pair 06 outcome:** 2 drafts reviewed; DUP-37 wording/distractors refined; DUP-38's earlier clarity correction propagated into the actual draft file and its mapping downgraded to subject review required; both checked against all 200 same-subject retained-plus-held rows; 0 independent subject approvals; both remain blocked from insertion.


## Pair 07 — DUP-39 and DUP-40 (2026-11-02)

DUP-39 (Chemistry): Answer B is correct. Cryolite dissolves alumina, lowers operating temperature and improves electrolyte conductivity; it is not the reducing agent. All 200 Chemistry retained-plus-held rows were checked; no cryolite-role item was found. Closest items concern aluminium extraction by electrolysis (retained batch 19 row 20), bauxite ore (batch 36 row 21), and general catalyst/electrode principles. Broad official syllabus mapping is Topic 16(d), Aluminium and electrolytic extraction. Cryolite itself is not expressly named; qualified Chemistry review is required.

DUP-40 (Chemistry): Answer C is correct. Vanadium(V) oxide catalyses oxidation of sulphur dioxide to sulphur trioxide in the Contact process. All 200 Chemistry retained-plus-held rows were checked; no question naming this catalyst was found. Closest items ask the Contact-process product (batch 22 row 21), general catalyst action (batches 03 row 20, 12 row 21, 25 row 21), and the Haber process (batch 20 row 21). Broad syllabus mapping is Topic 15(c), Contact process, and Topic 16(f), transition-metal catalysis. The syllabus does not name this catalyst; qualified Chemistry review is required.

Pair 07 outcome: both candidates passed preliminary answer/explanation and same-subject bank comparison. No same-concept overlap found. Neither is approved for import; independent Chemistry and syllabus-scope review remain required.


## Pair 11 — DUP-47 and DUP-48 (2026-11-02)

**DUP-47 — Government: legislative privilege**
- **Draft answer:** A is plausible: parliamentary privilege protects speech made as part of legislative proceedings so legislators can debate without fear of proceedings arising from those statements.
- **Bank comparison:** All 200 Government retained-plus-held rows were checked. Nearest matches concern general legislative functions (batch 02 row 32), freedom of expression (batches 03 row 36 and 14 row 35), and party-whip duties (batch 28 row 33). None tests the specific legal protection for statements made in legislative proceedings.
- **Similarity:** 0.3893, below the 0.42 lexical flag threshold.
- **Open issue:** The exact legal scope depends on the applicable constitutional/statutory framework. A qualified Government reviewer must confirm the wording, legal precision and syllabus fit; legislative privilege is not yet confirmed as a specific syllabus item.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-48 — Literature in English: denotation**
- **Draft answer:** B is correct. Denotation is the direct or literal meaning of a word; connotation concerns associated feelings or ideas.
- **Bank comparison:** All 200 Literature in English retained-plus-held rows were checked. The highest lexical match is batch 36 row 38 on diction (0.6667). Diction is a writer's choice/use of words, not the literal meaning of an individual word. Other close matches concern setting and mood; none tests denotation.
- **Similarity:** Flagged at 0.6667. This is a strong lexical flag but not proof of a semantic duplicate.
- **Open issue:** Independent Literature reviewer must confirm that the denotation/connotation distinction is appropriately within JAMB depth and that the distinction from diction is clear.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**Pair 11 outcome:** Both proposals checked against all 200 same-subject retained-plus-held rows. No same-concept overlap identified. DUP-48 remains a high-similarity contextual-review case. 0 independent subject approvals; neither draft is cleared for insertion.

---

## Pair 12 — DUP-49 and DUP-50 (2026-11-02)

**DUP-49 — Economics: tax incidence**
- **Draft answer:** C is correct. Tax incidence concerns the final economic distribution of a tax burden after tax shifting, which may differ from the person legally required to remit the tax.
- **Bank comparison:** All 200 Economics retained-plus-held rows were checked. Nearby questions cover direct/indirect taxes, progressive/regressive taxation, specific and ad valorem taxes, and tax evasion. None tests the distinction between statutory liability and the final economic burden.
- **Similarity:** 0.2807, below the 0.42 lexical flag threshold.
- **Open issue:** Qualified Economics reviewer must confirm syllabus scope and appropriate depth.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-50 — Biology: Golgi apparatus**
- **Draft answer:** A is correct. The Golgi apparatus modifies, sorts and packages proteins into vesicles for intracellular transport or secretion.
- **Bank comparison:** All 200 Biology retained-plus-held rows were checked. Nearest questions test nucleus, mitochondrion, chloroplast, ribosome and lysosome functions. These are related organelle questions but test different structures and functions; no Golgi protein-packaging item was found.
- **Similarity:** 0.3135, below the 0.42 lexical flag threshold.
- **Open issue:** Qualified Biology reviewer must confirm the exact functional detail and syllabus depth.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**Pair 12 outcome:** Both proposals checked against all 200 same-subject retained-plus-held rows. No same-concept overlap identified. 0 independent subject approvals; neither draft is cleared for insertion.

---



## Pair 13 — DUP-51 and DUP-52 (2026-11-02)

**DUP-51 — Physics: resonance**
- **Answer:** B. Resonance occurs when the driving frequency matches the system's natural frequency; a large response is associated with sufficiently low damping.
- **Bank comparison:** All 200 Physics retained-plus-held rows were checked. No resonance/natural-frequency item was found. Nearest lexical matches concern momentum, work-energy and Doppler effect, which test different concepts.
- **Similarity:** 0.3952, below the 0.42 threshold.
- **Official syllabus:** Direct coverage in JAMB Physics Topic 3(i), Simple Harmonic Motion, which includes forced vibration and resonance and asks candidates to enumerate applications of resonance.
- **Assistant disposition:** Preliminary answer, explanation and contextual checks recorded. Independent Physics review remains required; not approved for import.

**DUP-52 — Mathematics: matrix multiplication**
- **Answer:** A. Multiplication gives [[10, 1], [12, 0]].
- **Bank comparison:** All 200 Mathematics retained-plus-held rows were checked. Existing matrix questions test determinants and trace (batches 23 row 11, 27 row 10, 31 row 11 and 33 row 11); none tests matrix multiplication.
- **Similarity:** 0.4000, below the 0.42 threshold.
- **Open issue:** The calculation is correct, but exact JAMB Mathematics syllabus coverage for matrix multiplication must be confirmed by a qualified Mathematics reviewer.
- **Assistant disposition:** Preliminary answer and contextual checks recorded; not approved for import.

**Pair 13 outcome:** Both candidates compared against all 200 same-subject rows. No same-concept overlap identified. DUP-51 has direct official syllabus coverage; DUP-52 requires syllabus confirmation. 0 independent subject approvals.

---

## Pair 14 — DUP-53 and DUP-54 (2026-11-02)

**DUP-53 — Chemistry: copper(II) hydroxide precipitate**
- **Answer:** A. Cu²⁺ reacts with OH⁻ to form blue Cu(OH)₂ precipitate; it is insoluble in excess aqueous sodium hydroxide.
- **Bank comparison:** All 200 Chemistry retained-plus-held rows were checked. Nearby questions cover neutralisation/salt formation, gas tests, copper electrolysis and displacement, not this cation-identification reaction.
- **Similarity:** 0.4580, flagged. The lexical matches are related chemical-reaction language but assess different reactions and observations.
- **Official syllabus:** Broad coverage is supported by JAMB Chemistry Topic 16, including tests for metallic ions, sodium hydroxide precipitation of metallic hydroxides and coloured ions in transition metals. A Chemistry reviewer must confirm the exact Cu²⁺ test and level.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-54 — Economics: cross elasticity of demand**
- **Answer:** A. A positive cross-elasticity coefficient (+0.8) indicates substitute goods.
- **Bank comparison:** All 200 Economics retained-plus-held rows were checked. Existing items test own-price elasticity of demand or supply; none tests cross elasticity or interpretation of its positive sign.
- **Similarity:** 0.4141, below the 0.42 threshold but close enough to note.
- **Official syllabus:** Direct coverage in JAMB Economics Topic 4(c), which explicitly lists price, income and cross elasticity of demand and requires candidates to compute and interpret elasticity coefficients.
- **Assistant disposition:** Preliminary answer/context check recorded. Independent Economics review remains required; not approved for import.

**Pair 14 outcome:** Both candidates compared against all 200 same-subject rows. No same-concept overlap identified. DUP-53 is a flagged but conceptually distinct qualitative-analysis candidate; DUP-54 is directly syllabus-aligned. 0 independent subject approvals; neither is cleared for insertion.

---



## Pair 15 — DUP-55 and DUP-56 (2026-11-02)

**DUP-55 — Literature in English: cacophony**
- **Answer:** B. Cacophony is the deliberate use of harsh or discordant sounds to create a jarring effect.
- **Bank comparison:** All 200 Literature in English retained-plus-held rows were checked. No cacophony item was found. Nearest items test asyndeton and consonance, which assess different sound/language devices.
- **Similarity:** 0.3396, below the 0.42 threshold.
- **Open issue:** Cacophony is closely related by contrast to euphony (DUP-56). An independent Literature reviewer should confirm the distinction, syllabus depth and whether both items add useful variety.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-56 — Literature in English: euphony**
- **Answer:** B. Euphony is the use or arrangement of pleasing, harmonious sounds.
- **Bank comparison:** All 200 Literature in English retained-plus-held rows were checked. No euphony item was found. Nearest items test rhyme, plot sequence and stream of consciousness.
- **Similarity:** 0.2793, below the 0.42 threshold.
- **Open issue:** This is the conceptual counterpart to DUP-55, not a duplicate. A Literature reviewer should confirm both are appropriate and not unnecessarily repetitive within the bank.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**Pair 15 outcome:** Both candidates are distinct from the existing same-subject bank. Their complementary relationship requires human review for syllabus fit and question-bank variety. 0 independent subject approvals.

---

## Pair 16 — DUP-57 and DUP-58 (2026-11-02)

**DUP-57 — Use of English: ellipsis as a cohesive device**
- **Answer:** B. The verb phrase “chose” is recoverable from the first clause and omitted in the second; this is ellipsis.
- **Bank comparison:** All 200 Use of English retained-plus-held rows were checked. No ellipsis-as-cohesive-device question was found. Nearest items test adverb function, conditional completion and infinitive phrase function.
- **Similarity:** 0.3367, below the 0.42 threshold.
- **Open issue:** Broad fit to cohesion/discourse and grammatical structure is plausible; a qualified English reviewer must confirm exact syllabus mapping and JAMB depth.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-58 — Biology: quadrat sampling**
- **Answer:** A. A quadrat is used to estimate abundance, density or frequency of plants and other relatively stationary organisms.
- **Bank comparison:** All 200 Biology retained-plus-held rows were checked. No quadrat-sampling item was found. Nearest items concern biotic factors, photosynthesis and plant cell walls.
- **Similarity:** 0.2895, below the 0.42 threshold.
- **Open issue:** Ecology is a relevant Biology domain, but exact syllabus fit for field sampling methods requires qualified Biology review.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**Pair 16 outcome:** Both candidates passed preliminary answer and same-subject contextual checks. Syllabus confirmation remains open; 0 independent subject approvals.

---



## Pair 17 — DUP-59 and DUP-60 (2026-11-02)

**DUP-59 — Literature in English: epithet**
- **Answer:** A. An epithet is a descriptive expression attached to a person or thing to highlight a characteristic; “swift-footed” is a conventional epithet associated with Achilles.
- **Bank comparison:** All 200 Literature in English retained-plus-held rows were checked. No epithet item was found. The nearest lexical match is batch 23 row 40 on synecdoche (0.4113), which tests part-for-whole reference; other close items concern epilogue and exposition.
- **Similarity:** 0.4113, just below the 0.42 threshold.
- **Open issue:** A Literature reviewer should confirm that the classical example is appropriate for JAMB level and distinguish the device from other descriptive terms.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-60 — Biology: Organ of Corti**
- **Answer:** A. The Organ of Corti, located in the cochlea, contains sensory hair cells that transduce sound-related mechanical vibrations.
- **Bank comparison:** All 200 Biology retained-plus-held rows were checked. No Organ of Corti/hair-cell location item was found. Nearest matches concern root-hair osmosis and red blood cell function, not cochlear hearing.
- **Similarity:** 0.2783, below the 0.42 threshold.
- **Open issue:** Independent Biology reviewer must confirm anatomical wording and syllabus depth.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**Pair 17 outcome:** Both candidates are distinct from the existing same-subject bank. DUP-59 is a near-threshold lexical case; both require independent subject/syllabus review. 0 independent subject approvals.

---

## Pair 18 — DUP-61 and DUP-62 (2026-11-02)

**DUP-61 — Biology: phototropism**
- **Answer:** A. Greater cell elongation on the shaded side of a shoot produces differential growth that bends the shoot towards light; auxin is involved.
- **Bank comparison:** All 200 Biology retained-plus-held rows were checked. No phototropism/auxin shaded-side item was found. Nearest matches concern xylem transport, pollen-tube growth and plasmolysis.
- **Similarity:** 0.2262, below the 0.42 threshold.
- **Open issue:** Independent Biology reviewer must confirm syllabus depth and wording.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-62 — Literature in English: enjambment**
- **Answer:** A. Enjambment occurs when syntax or sense continues across a poetic line break without an end-stop.
- **Bank comparison:** All 200 Literature in English retained-plus-held rows were checked. The nearest item is batch 16 row 37 on caesura (0.4046), a pause within a line. These are related lineation techniques but not duplicates.
- **Similarity:** 0.4046, below the 0.42 threshold but close.
- **Open issue:** Independent Literature reviewer should confirm the distinction from caesura, syllabus scope and question-bank variety.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**Pair 18 outcome:** Both candidates are distinct from the existing same-subject bank. 0 independent subject approvals; both remain excluded from import pending qualified review.

---



## Pair 19 — DUP-63 and DUP-64 (2026-11-02)

**DUP-63 — Mathematics: map scale**
- **Answer:** C (2 km). At a scale of 1:50,000, 4 cm represents 200,000 cm, or 2 km.
- **Bank comparison:** All 200 Mathematics retained-plus-held rows were checked. No map-scale calculation was found. Nearest items concern sector fractions, circle angles and coordinate distance.
- **Similarity:** 0.3648, below the 0.42 threshold.
- **Open issue:** A qualified Mathematics reviewer must confirm map-scale/ratio-proportion coverage against the current JAMB syllabus.
- **Assistant disposition:** Calculation and contextual check recorded; not approved for import.

**DUP-64 — Chemistry: radioactive half-life**
- **Answer:** C (1/8). Eighteen hours is three half-lives; the remaining fraction is (1/2)³.
- **Bank comparison:** All 200 Chemistry retained-plus-held rows were checked. No half-life fraction calculation was found. Nearest items concern rate-constant units, isotopes and catalysts.
- **Similarity:** 0.2623, below the 0.42 threshold.
- **Official syllabus:** Direct coverage under JAMB Chemistry Nuclear Chemistry, which includes simple half-life calculations.
- **Assistant disposition:** Calculation, explanation and syllabus check recorded; independent Chemistry review remains required; not approved for import.

**Pair 19 outcome:** Both candidates are distinct from the existing same-subject bank. DUP-64 has direct syllabus coverage; DUP-63 requires syllabus confirmation. 0 independent subject approvals.

---

## Pair 20 — DUP-65 and DUP-66 (2026-11-02)

**DUP-65 — Biology: tracheoles**
- **Answer:** A. Tracheoles are the fine terminal branches of the insect tracheal system that deliver oxygen close to body cells.
- **Bank comparison:** All 200 Biology retained-plus-held rows were checked. No tracheole item was found. Nearest items concern ureter, xylem and kidney filtration.
- **Similarity:** 0.3462, below the 0.42 threshold.
- **Open issue:** A Biology reviewer must confirm syllabus depth and distinguish tracheoles from spiracles.
- **Assistant disposition:** Preliminary answer/context check recorded; not approved for import.

**DUP-66 — Physics: transformer efficiency**
- **Answer:** C (80%). Input power = 240 × 0.5 = 120 W; output power = 12 × 8 = 96 W; efficiency = 96/120 × 100 = 80%.
- **Bank comparison:** All 200 Physics retained-plus-held rows were checked. No transformer-efficiency calculation was found. Nearest items test resistance/potential difference and general machine efficiency, not transformer input/output power.
- **Similarity:** 0.3285, below the 0.42 threshold.
- **Open issue:** A Physics reviewer must confirm syllabus fit and that voltage/current values are understood as the relevant primary/secondary RMS quantities.
- **Assistant disposition:** Calculation and contextual check recorded; not approved for import.

**Pair 20 outcome:** Both candidates are distinct from the existing same-subject bank. Independent subject/syllabus review remains required; 0 independent subject approvals.

---

