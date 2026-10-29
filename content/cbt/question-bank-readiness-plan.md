# EDUKEN CBT question-bank readiness plan

## Current verified position
- The isolated test database currently has 9 published questions: one each in Biology, Chemistry, Economics, Government, Literature in English, Mathematics and Physics, plus two in Use of English. It also has one draft English question.
- PR #187 adds 16 original questions in `content/cbt/original-starter-bank-v1.csv`.
- `content/cbt/original-review-pack-v2.csv` adds 32 more original draft questions (4 per currently supported subject). The CSV was checked for 17 columns per row, balanced subject counts, non-empty question/explanation fields, and A/B/C/D answer-key format. These checks validate structure, not subject-matter correctness.
- These CSV files are review/import assets only. They do not seed or publish questions in any database.

## Question-bank acceptance workflow
1. Import a batch into the isolated test project only.
2. Confirm the import report has no invalid rows or duplicate collisions.
3. Review every question for syllabus fit, one unambiguous correct answer, plausible distractors, calculation correctness, grammar, and explanation quality.
4. Record reviewer and review date in the admin workflow; keep rejected items as drafts for correction.
5. Approve only questions that pass review. Publish only approved questions after a final spot-check.
6. Re-run practice and mock smoke tests after each batch. Never silently shorten an attempt when the bank is too small.

## Full-mock readiness target
A full JAMB-style 180-question mock should use a configured subject combination, not an arbitrary mixed set:
- Use of English: 60 questions.
- Each of the student's three selected additional subjects: 40 questions each.
- Total: 180 questions and the configured 120-minute timer.

Before advertising full mocks, target at least 300 approved/published items for Use of English and 200 approved/published items for each other supported subject. This gives a pool for variety beyond a single exam form. At the current eight-subject scope, that is a planning target of 1,700 approved/published items, not a claim that the current bank contains them.

## Important implementation blocker to resolve before full mocks
The current mock-start backend selects up to 180 published questions ordered by subject/topic, then slices to the requested count. The UI shuffle changes presentation order after the server has already selected the set; it does not make selection balanced or random. Also, mock mode currently identifies itself as a generic “Mixed mock” rather than asking the student to choose three additional subjects. Fix the mock blueprint and server-side selection before treating the full mock as JAMB-format.

## Provenance and copyright
- New questions in these packs are labelled `original` and are intended to be newly written EDUKEN practice items, not official JAMB questions or copied past papers.
- Do not add a past-question item unless its source, year, provenance and licensing/permission status have been documented and checked.
- Do not describe any item as officially verified by JAMB. Review status means internal EDUKEN review only.

## Current readiness decision
The question bank is not yet ready for student-facing full mock exams. Continue in batches, keep additions in draft/review status, and use only the isolated test project while validating the import and review workflow. Production question-bank data must not be changed as part of this content-preparation work.
