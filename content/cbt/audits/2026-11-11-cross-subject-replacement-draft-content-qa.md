# Cross-subject replacement draft QA — 11 November 2026

**Branch:** `feat/cbt-subject-combination-reconciled`  
**Source inventory:** `content/cbt/audits/duplicate-replacement-drafts-2026-11-01.json` (116 proposals)  
**Scope:** Assistant-level review of answer-key plausibility, calculation/definition accuracy, question construction and obvious within-packet concept collisions. This is not qualified academic approval and does not replace official syllabus review.

## Executive result

The 116 proposals were inspected by subject. No definite incorrect answer key was identified in this pass. However, several question-construction and concept-variety issues require revision or qualified review before any import.

### High-priority revisions

| Subject | Target | Finding | Required action |
|---|---|---|---|
| Economics | DUP-228 | The stem is a declarative definition of capital flight, and option A repeats the same definition as the answer. It is not a properly formed question. | Rewrite as a direct question, e.g. “What is meant by capital flight?” and use four parallel, distinct definitions. |
| Economics | DUP-109 | The stem already defines a recession, while option A restates that definition. Answer is given away by the stem. | Rewrite as a direct question, e.g. “Which term describes a significant decline in overall economic activity?” |
| Government | DUP-102 | Declarative stem states that the Commonwealth is a voluntary association; option A repeats the statement. | Convert to a question about its status or purpose and use parallel alternatives. |
| Government | DUP-221 | Declarative stem defines a caretaker government; option A repeats the definition. | Convert to a direct question and make all four options parallel descriptions. |
| Government | DUP-104 | Declarative stem defines an electoral college; option A restates it. | Convert to a direct question and make the alternatives parallel. |
| Government | DUP-123 | Declarative stem defines political ideology; option A repeats the definition. | Convert to a direct question and make the alternatives parallel. |
| Literature in English | DUP-59 and DUP-232 | Both replacement proposals test the same concept, epithet. DUP-59 uses “swift-footed Achilles” as an example; DUP-232 asks for the general definition. They are not identical stems, but the same concept is being used twice in a small replacement set. | Keep the stronger of the two or replace one with a different verified Literature concept. Re-screen the revised candidate against the full bank. |

## Additional qualified-review flags

- **Government DUP-47:** The explanation of legislative freedom of speech is broadly plausible, but the wording “without being sued or prosecuted” needs review against the applicable Nigerian constitutional and legislative-privilege framework. Avoid implying blanket immunity outside legislative proceedings.
- **Literature DUP-05:** Iambic pentameter is correctly defined, but the bank already contains a blank-verse question. A Literature reviewer should confirm the distinction and whether both add sufficient assessment value.
- **Literature DUP-55 and DUP-56:** Cacophony and euphony are correctly distinguished as contrasting sound effects. They are complementary rather than duplicates, but the reviewer should decide whether both are useful in the replacement set.
- **Literature DUP-48:** Denotation is correctly defined as literal/direct meaning. The earlier lexical flag against a diction question is not proof of duplication, but the concepts are related and require contextual reviewer confirmation.
- **Literature DUP-62:** Enjambment and the existing caesura item assess contrasting lineation techniques. The distinction is valid, but the close conceptual relationship merits reviewer confirmation.
- **Chemistry DUP-64:** The half-life calculation is correct (three half-lives leave one-eighth), but confirm that this radioactive-decay item is within the intended current JAMB Chemistry syllabus rather than being more appropriate to Physics.
- **Mathematics DUP-52 and DUP-63:** The matrix multiplication result and map-scale conversion are mathematically correct. Their exact syllabus fit remains a qualified Mathematics review gate; do not treat mathematical correctness as proof of syllabus inclusion.

## Other checked content

The remaining checked proposals were provisionally sound at assistant level for their supplied answer keys and explanations:

- **Use of English:** DUP-29, DUP-30, DUP-33, DUP-34, DUP-57, DUP-68, DUP-72, DUP-78, DUP-79, DUP-87, DUP-89, DUP-129, DUP-200 and DUP-245. See the dedicated 11 November Use of English QA report for item-level notes and wording recommendations.
- **Mathematics:** DUP-01, DUP-27, DUP-43, DUP-217 and DUP-98, subject to syllabus and independent review; DUP-52 and DUP-63 are separately flagged above.
- **Biology:** DUP-04, DUP-06, DUP-14, DUP-17, DUP-22, DUP-24, DUP-38, DUP-41, DUP-50, DUP-58, DUP-60, DUP-61, DUP-65, DUP-70, DUP-73, DUP-74, DUP-84 and DUP-210. The answer explanations are provisionally sound; the exact syllabus depth and conceptual distinction remain for qualified Biology review.
- **Chemistry:** DUP-02, DUP-08, DUP-09, DUP-13, DUP-16, DUP-39, DUP-40, DUP-46, DUP-53, DUP-67, DUP-86, DUP-90, DUP-216, DUP-174, DUP-219 and DUP-121. The supplied keys/explanations are provisionally sound; confirm syllabus fit, particularly for DUP-64.
- **Physics:** DUP-03, DUP-07, DUP-11, DUP-18, DUP-26, DUP-31, DUP-44, DUP-51, DUP-66, DUP-71, DUP-81 and DUP-114. Calculations and principles checked are provisionally correct.
- **Economics:** DUP-10, DUP-12, DUP-15, DUP-19, DUP-20, DUP-23, DUP-25, DUP-42, DUP-45, DUP-49, DUP-54, DUP-75, DUP-76, DUP-80, DUP-88, DUP-82, DUP-19-ADD-2026-11-09 and DUP-101 are provisionally sound at assistant level. DUP-228 and DUP-109 require the question-construction revisions above.
- **Government:** DUP-28, DUP-36, DUP-37, DUP-77, DUP-47-ADD-2026-11-09, DUP-126, DUP-240, DUP-107 and DUP-193 are provisionally sound at assistant level, subject to syllabus and jurisdictional review. DUP-47 needs the privilege wording check; DUP-102, DUP-221, DUP-104 and DUP-123 require question-construction revisions.

## Release and provenance restrictions

- This report is an assistant content-QA screen, not an independent qualified subject review.
- No reviewer identity, qualification or approval is created by this report.
- No original source CSV or R4 staging question row was changed by this review.
- No replacement was imported, published or written to the production database by this QA pass. The original 90 proposals carry the project owner's earlier user-reported reviewer approval; documentary evidence remains absent.
- The seven high-priority question-construction/concept-variety issues above must be corrected in draft form and re-screened before an independent reviewer is asked to sign them off.
- All 116 proposals remain draft-only in the current inventory. The original 90 carry the project owner's previously reported reviewer approval, not documentary-verified in the repository. The 26 additional proposals must receive their own attributable subject-review disposition. This assistant QA does not independently approve or revoke any of the 90 historical decisions.


## Literature coverage clarification

The other seven Literature in English proposals also checked were DUP-21 (flashback), DUP-32 (comedy of manners), DUP-35 (epigraph), DUP-69 (unity of action), DUP-83 (pseudonym), DUP-85 (blocking) and DUP-164 (metonymy). Their supplied definitions and keys are provisionally sound at assistant level, subject to qualified syllabus review.
