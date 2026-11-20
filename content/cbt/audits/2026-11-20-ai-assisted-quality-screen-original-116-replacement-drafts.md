# AI-Assisted Quality Screen — Original 116 Replacement Drafts

Date: 20 November 2026  
Branch: `work/cbt-r4-next-replacement-drafts-20261112`  
Source: `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json`

## Purpose and limits

This is an internal first-pass AI-assisted content-quality review of all 116 entries in the canonical replacement-draft inventory. It checks the question stem, answer key, explanation, option construction, obvious ambiguity, internal consistency and apparent overlap between proposals. It is not an independent academic review, formal JAMB syllabus sign-off, or publication approval.

The previous bank-wide lexical/semantic screening notes embedded in the inventory were inspected as context; this pass does not claim to have rerun every candidate against all 1,600 bank rows. Similarity scores are prompts for review, not proof of duplication.

No source question CSVs, canonical inventory entries, database records, approval states, imports, or publication states were changed.

## First-pass outcome

- Inventory entries read: **116 / 116**.
- Content-quality pass: **AI-screened; no obvious answer-key or explanation error detected on first pass** for the majority of items.
- Items requiring revision or a closer hold before any human sign-off: **see priority register below**.
- Human academic approvals recorded by this review: **0**.
- Import/publication approvals created: **0**.

All 116 remain provisional. A clean first-pass AI screen does not establish JAMB syllabus coverage or replace a qualified subject review.

## Priority findings

### Revise or hold for internal correction

1. **DUP-17 and DUP-61 — Biology, phototropism:** Both test the same core outcome: greater cell elongation on the shaded side of a young shoot causing bending towards light, with auxin involved. Treat as an internal proposal-level overlap. Keep one candidate or rewrite one to test a genuinely different plant-physiology outcome. Do not count both as distinct coverage.
2. **DUP-59 and DUP-232 — Literature in English, epithet:** DUP-59 asks candidates to identify “swift-footed Achilles” as an epithet; DUP-232 asks for the definition of an epithet. These substantially duplicate the same term. Retain only one, or replace one with a different literary concept.
3. **DUP-228 — Economics, capital flight:** The stem is currently a declarative definition (“Capital flight occurs when…”) followed by options that are labels, rather than a direct question or a clear sentence-completion prompt. Rewrite as “The movement of financial assets out of a country is known as:” and make the options parallel terms. Key A is correct for the intended concept.
4. **DUP-109 — Economics, recession:** The stem is a definition followed by answer options, one of which repeats the definition. Rewrite as a direct question, e.g. “A significant decline in overall economic activity is known as:”. Check that the other options are parallel economic conditions.
5. **DUP-102 — Government, Commonwealth:** The stem is a statement that already gives the definition, while option A repeats it almost verbatim. Convert it to a direct question such as “Which statement best describes the Commonwealth of Nations?” and retain concise, mutually exclusive options.
6. **DUP-123 — Government, political ideology:** The stem itself states the definition and option A restates it. Convert to a direct identification question; retain option A as the intended key only after the options are made parallel.
7. **DUP-221 — Government, caretaker government:** The stem already defines the term and option A repeats it. Convert to a direct question (“A temporary administration that manages routine affairs pending the formation of a substantive government is called a…”) and make the options parallel.
8. **DUP-48 — Literature in English, denotation:** The stored prior screen reports a high lexical similarity (0.6667) to a diction item. The concepts are not identical, but this requires a deliberate semantic distinction check and human Literature review before acceptance. Do not treat the lexical score alone as a duplicate verdict.
9. **DUP-62 — Literature in English, enjambment:** The stored prior screen reports similarity 0.4046 to a caesura item. They are distinct techniques, but closely related lineation concepts. Keep only if the bank benefits from testing both and the wording clearly distinguishes continuation across a line break from a pause within a line.
10. **DUP-82 — Economics, diminishing marginal utility:** Prior notes already flag proximity to existing marginal-utility definition items. The law-specific learning outcome is valid, but retain only after a human Economics reviewer confirms that it adds a distinct test rather than restating the general definition.
11. **DUP-55 and DUP-56 — Literature in English, cacophony/euphony:** The answers and explanations are correct and the concepts are opposites, not duplicates. However, the pair should be treated as a coordinated coverage choice; avoid over-weighting a single sound-device contrast in a small bank.
12. **DUP-68 — Use of English, homograph “winds”:** The intended answer A is correct, but options B and C overlap as alternate senses of “wind” meaning to turn or coil. Replace one with a clearly distinct distractor, and make the pronunciation distinction explicit only if pronunciation is part of the intended test.

### Syllabus or context confirmation needed

These items did not show a definite factual error in this first pass, but their exact syllabus scope, level or context should be confirmed by the relevant subject reviewer:

- **DUP-37:** Private member’s bills — the inventory itself notes this is a broad fit and not expressly named in the syllabus.
- **DUP-38:** Maternal IgG transfer through the placenta — biologically sound, but the exact syllabus depth needs confirmation.
- **DUP-47:** Legislative privilege — the general principle is plausible; legal scope can vary by jurisdiction and the item should be framed with Nigerian constitutional context if that is the intended syllabus.
- **DUP-51:** Resonance — the existing note records direct syllabus coverage; confirm the expected treatment and wording.
- **DUP-52:** 2×2 matrix multiplication — arithmetic is correct; confirm exact current JAMB Mathematics coverage.
- **DUP-53:** Cu²⁺ with OH⁻ gives blue Cu(OH)₂ — key is correct; the statement about insolubility in excess aqueous NaOH should be checked against the exact test conditions and syllabus treatment.
- **DUP-54:** Cross elasticity — key A is correct for +0.8; prior notes report direct syllabus coverage.
- **DUP-58:** Quadrat sampling — scientifically appropriate; confirm field-method depth in the current Biology syllabus.
- **DUP-59:** The classical epithet example is valid, but the proposal is held for overlap with DUP-232.
- **DUP-60:** Organ of Corti — key A is correct; confirm expected anatomical detail.
- **DUP-62:** Enjambment — key A is correct; confirm distinction from the caesura item.
- **DUP-63:** Map-scale conversion — calculation gives 2 km, key C; confirm syllabus placement.
- **DUP-65:** Tracheoles — key A is correct; confirm syllabus depth and distinguish them from spiracles.
- **DUP-66:** Transformer efficiency — calculation gives 80%, key C; specify that the voltage/current values are comparable RMS quantities for an AC transformer if that is the intended context.
- **DUP-67:** Coordinate bond in NH₄⁺ — key C is correct for the bond formed when NH₃ donates its lone pair to H⁺; wording correctly refers to bond formation.
- **DUP-69:** Unity of action — key A is correct; confirm syllabus scope.
- **DUP-70:** Vacuole/turgor pressure — key B is correct; confirm the exact cell-biology framing.
- **DUP-82:** Diminishing marginal utility — see overlap hold above.
- **DUP-84:** DNA ligase joining Okazaki fragments — key A is correct; confirm syllabus depth.
- **DUP-85:** Blocking — key A is correct; confirm drama/stagecraft coverage.
- **DUP-87:** Teetotaller — key A is correct, but “deliberately gives up the use of alcoholic drinks” is awkward. Prefer “A person who habitually abstains from alcoholic drinks is called a…”
- **DUP-89:** /m/ and /n/ are nasal consonants, key A; confirm the phonetic notation matches the course level.
- **DUP-126:** The AU succeeded the OAU in 2002, key A; ensure the question does not imply that the OAU ceased all activity before the AU's formal launch.
- **DUP-164:** Metonymy — key A is correct; the crown/monarchy example is suitable.
- **DUP-200:** Clipping — key A is correct; “advertisement” to “ad” and “examination” to “exam” are clear examples.
- **DUP-216:** Temporary hardness — key A is correct; retain “mainly” because water chemistry can vary.
- **DUP-228:** Capital flight — see stem-format correction above.
- **DUP-240:** ICJ contentious-case parties are states, key A; the explanation appropriately distinguishes the ICC.

## General quality observations

- Most calculation keys checked in the visible inventory are internally consistent, including capacitance (DUP-26), impulse/average force magnitude (DUP-31), transformer efficiency (DUP-66), map scale (DUP-63), half-life (DUP-64), linear expansion (DUP-81), and comparative advantage (DUP-75).
- The explanations are generally useful and more informative than answer-only keys. Preserve the reasoning, but shorten explanations where they repeat the stem.
- Avoid declarative stems that disclose the answer before the options. Use direct questions or grammatical completion prompts.
- Keep distractors mutually exclusive, parallel in form and plausible for the target level. The main clear distractor issue identified in this pass is DUP-68.
- Use consistent Nigerian/JAMB conventions for spelling, units, symbols and syllabus terminology across each subject bank.

## Status rules

- **AI-screened:** first-pass content checks completed; any noted corrections/holds remain open.
- **Human-reviewed:** must remain pending until a qualified independent subject reviewer records their name/role, date, decision and any required amendments.
- **Approved/importable/published:** not granted by this report.

## Next actions

1. Correct the proposal-level overlaps (DUP-17/DUP-61 and DUP-59/DUP-232) and the stem/distractor issues listed above in a separate QA revision; do not silently alter the canonical inventory.
2. Complete the same first-pass review for the later R4 replacement-draft reports (batches 1–45) and reconcile their candidates against this 116-item inventory.
3. Obtain subject-level syllabus and academic sign-off when a reviewer becomes available.
4. Keep every candidate out of the live bank until the required review and approval gates are satisfied.
