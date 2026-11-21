# EDUKEN CBT Student Arena — implementation specification

**Workstream:** `feat/cbt-student-arena-leaderboard-20261120`  
**Status:** implementation in progress on an isolated feature branch; runtime code and an additive test-project migration exist, but the feature is not approved for release.

## Goal

Add a student competition and progress area to the existing EDUKEN CBT experience. It must reuse the existing server-graded attempt records and keep this work separate from the question-bank/release work.

## Agreed product scope

1. Free, unique student username created before a student joins the leaderboard.
2. Nationwide leaderboard across eligible EDUKEN CBT students.
3. Eight subject leaderboards: Use of English, Mathematics, Biology, Chemistry, Physics, Economics, Government, and Literature in English.
4. Student dashboard with own rank, scores, accuracy, practice history, and improvement over time.
5. Weekly champions: top performer, most improved, and most consistent. The top performer is the best qualifying full mock; most improved compares a student's first and latest qualifying mock of the week (minimum two); most consistent recognises the lowest score variation across at least two qualifying mocks, with average score as the tie-break.
6. Head-to-head challenges as a later phase after the core leaderboard is secure and stable.
7. Show every eligible participant. Use pagination/scrolling for performance, but never impose a fixed top-100 ceiling.

## Identity and privacy

- A username must be unique case-insensitively and attached to a server-verified EDUKEN student identity; it must not be a device-only/local-storage identity.
- Reuse the platform's existing Supabase authentication. Do not create a second password store or a separate login system.
- Public leaderboard responses may contain only username, rank, eligible score/percentage, and permitted competition statistics. Never expose real name, email, phone number, auth user ID, or other private account fields.
- Username creation is free. Username validation, availability checks, and claiming must be enforced server-side with a database uniqueness constraint.
- Every CBT activity, including subject practice and mixed mocks, requires a verified anonymous student session and a claimed free unique username before the session can start. No guest practice is permitted.

## Score integrity and fairness

- Only completed, server-graded attempts backed by the private CBT attempt session and published question snapshots may qualify.
- Never accept a score, percentage, username, or rank submitted by the browser as authoritative.
- Exclude local fallback/sample practice, incomplete/expired attempts, draft questions, and guest attempts without a claimed student identity.
- Do not mix unlike test lengths or modes without a defined qualification rule. Proposed initial rule:
  - National leaderboard: qualifying full 180-question / 120-minute mixed mock attempts only.
  - Subject leaderboard: qualifying timed subject attempts with at least 20 questions.
  - Rank each student by their best qualifying percentage in the selected period; resolve ties using higher raw score, then shorter completion time, then earlier submission.
- This qualification policy is a proposal and must be validated against the final question-bank availability and difficulty balance before it is enabled.
- Weekly rankings use the current calendar week; all-time rankings remain available. Weekly champions must be calculated from the same eligible-attempt rules.
- Subject scores from mixed mocks must be calculated from the server-held question snapshot and answer map, not inferred from the aggregate mock score.

## Proposed data model

- `cbt_student_profiles`: one row per authenticated user; unique normalized username; created/updated timestamps; optional public participation setting.
- `cbt_attempt_subject_scores`: one row per submitted attempt and subject, derived server-side from the immutable question snapshot and normalized answers. Needed because current aggregate `cbt_attempts` stores mixed mocks as one `Mixed mock` score.
- Existing `cbt_attempts` and `cbt_attempt_sessions` remain the source of truth for completed attempt summaries and server-side grading.
- Add indexes for username lookup, subject/time/score ranking, and user/period queries.
- RLS must deny direct public table access. Public leaderboard data should be returned through authenticated/controlled API queries that select only approved public fields. Never expose service-role credentials.

## Proposed API surface

- `GET /api/cbt/student-profile`: return current user's public username/profile status.
- `POST /api/cbt/student-profile`: validate and claim a free unique username for the authenticated user.
- `GET /api/cbt/leaderboard?scope=national&period=week|all-time&page=...`: return a page of public ranked rows and total eligible participant count.
- `GET /api/cbt/leaderboard?scope=subject&subject=...&period=...`: return subject-specific rows.
- `GET /api/cbt/arena/summary`: return the signed-in student's own progress, current national rank, best qualifying mock, question totals, accuracy, and improvement (latest five attempts versus the previous five).
- `GET /api/cbt/arena/champions`: return public-safe weekly top performer, most improved, and most consistent names/scores only.
- Subject-level score breakdown is persisted only after server-side grading succeeds.

## UI outline

- Add a Student Arena entry point from the CBT landing page.
- Before a student participates in any CBT activity, create an anonymous student session in the background and show a free username-claim step; do not ask for email, password, or Google sign-in.
- Dashboard cards: national rank, best qualifying score, accuracy, questions attempted, and improvement.
- Leaderboard tabs: National / By subject; period switch: This week / All time; subject selector for the eight subjects.
- Show all eligible participants through paginated results, with the current student's row clearly highlighted and an easy way to find their own position.
- Weekly champion panels: top scorer, most improved, and most consistent.
- Keep the design mobile-first and aligned with EDUKEN's forest-green, off-white, and restrained mint visual system.

## Confirmed product decision

- Every student must receive an anonymous EDUKEN student session and claim a free unique username before accessing any CBT activity. The username is the student's persistent identity across practice, mocks, dashboard, results and leaderboard.
- Use Supabase anonymous sign-in behind the scenes so each student has a secure server-side identity without entering personal details. The username is the visible student identity. Do not add email, Google sign-in, password fields, a second password store, or a separate login system. Anonymous sessions remain tied to the browser/device; account recovery on another device is not available unless a recovery method is later approved.

## Delivery phases

1. Confirmed: an anonymous student session and claimed free unique username are mandatory before any CBT activity; the student-facing flow is username-only.
2. Added on this branch: private student identity and subject-score schema, username claim API, public-safe leaderboard API, and server-derived subject score persistence.
3. In progress: automated tests for username uniqueness, auth ownership, privacy, score derivation, ranking/tie-breaks, week boundaries, pagination, and exclusion of guest/local/draft attempts.
4. Added: mobile-first Student Arena leaderboard UI. Pending: personal progress dashboard, most-improved recognition, weekly champions, and later head-to-head challenges.
5. Applied the additive migration only to the isolated test Supabase project. Run API/browser/security checks there before considering this phase ready.
6. Keep the PR in draft for review. No merge, production migration, Worker deployment, question-bank change, or publication without separate explicit approval.

## Explicit non-goals for this workstream

- No changes to production Supabase, Cloudflare Worker, production auth/payment configuration, question content, import history, or publication state.
- No merge or production deployment.
- No head-to-head implementation until the profile, scoring, leaderboard, and privacy foundations pass their tests.
- No ranking based on local browser history or client-submitted scores.
