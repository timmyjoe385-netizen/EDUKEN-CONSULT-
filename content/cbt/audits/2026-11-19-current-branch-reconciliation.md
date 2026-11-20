# EDUKEN CBT — Current branch reconciliation
Date: 19 November 2026
Branch: `feat/cbt-subject-combination-reconciled`
PR: #194 (open, draft, unmerged)
Current branch head checked: `a1ccc52240087e21592e92f88b6e9f70e8de8edc`

## 1. Replacement queue — corrected current count

The original R4 queue contains 45 exact held locations without target-specific proposals at the 11 November baseline. The 14 November checkpoint documented 19/45. Subsequent target-specific draft reports add 12 distinct targets:

- Batch 2: DUP-99 and DUP-171.
- Batch 3: DUP-132 and DUP-194.
- Batch 5: DUP-147.
- Batch 6: DUP-215.
- Batch 7: DUP-224.
- Batch 8: DUP-179.
- Batch 9: DUP-180.
- Batch 10: DUP-117.
- Batch 11: DUP-233.
- Batch 12: DUP-112.

Batch 4 was a screening/reconciliation report, not a new draft. Therefore the current target-specific proposal count is **31/45**, leaving **14/45 without a proposal**.

The remaining 14 exact queue IDs are:
DUP-95, DUP-212, DUP-242, DUP-220, DUP-119, DUP-106, DUP-192, DUP-105, DUP-159, DUP-167, DUP-158, DUP-156, DUP-103, DUP-230.

## 2. Meaning of the remaining 14

The 15 November complete retained-bank collision screen examined the 26 targets that had no proposals at that time. It found that the retained bank already tested the same fact, definition, principle or learning outcome for those targets, so it deliberately did not create paraphrased replacements. The later 12 draft reports account for 12 of those targets. The 14 listed above remain screened/no-new-draft targets, not a fresh instruction to manufacture 14 questions.

Do not create additional drafts for these 14 unless a qualified subject reviewer identifies a genuinely distinct, syllabus-relevant learning outcome or recommends a different resolution.

## 3. Review and import status

- The 17 November disposition note records the project owner's report that a reviewer checked and accepted the original 19 proposals. Reviewer identity, qualifications, signature and item-level signed decisions are not present; this is owner-reported, not independently documentary-verified academic approval.
- The 12 later proposals (Batches 2, 3, 5, 6, 7, 8, 9, 10, 11 and 12) require their own attributable subject, answer-key, distractor and syllabus review unless an item-level reviewer record is supplied.
- The 18 November isolated-test database report records 19 proposal rows imported as drafts in the isolated Supabase test project. It reports zero reviewer/approval metadata. This is not production import or approval.
- No question publication or production import has been authorized or performed.

## 4. Technical workflow result at the checked branch head

GitHub Actions runs associated with the checked branch head reported:
- Build check: success.
- Wallet migration SQL integration: success.
- Playwright browser checks: success.
- Isolated preview deployment: failed at the Cloudflare deploy step with API authentication error code 10000 for the preview Worker service.
- Production deploy job: skipped.

The failed preview deployment is an environment credential/authentication blocker, not a reported build or browser-test failure. Do not expose or copy any secret. A repository Actions secret/token with the correct Cloudflare account and Worker deployment permissions must be refreshed by an authorized repository maintainer before retrying preview deployment.

## 5. Release boundary

PR #194 remains open, draft and unmerged. No merge, production Worker deployment, production database mutation, question import or publication was performed in this execution. Production remains untouched.

**Disposition:** replacement-draft coverage reconciled at 31/45; 14 remaining targets are documented no-new-draft collision outcomes; original 19 have owner-reported reviewer acceptance but no signed evidence; 12 later drafts still need attributable review; preview deployment is blocked by Cloudflare token authentication; production release remains blocked.

## 6. Authoritative 20 November reviewer and inventory reconciliation

This section supersedes the older reviewer-status wording in Section 3 wherever it conflicts.

### Reviewer approvals

On 20 November 2026 the project owner supplied eight subject-review submissions and explicitly confirmed that each reviewer individually checked and approved every replacement question for their respective subject. The recorded outcome is **8/8 subjects: Approved all**:

| Subject | Reviewer | Reported decision |
|---|---|---|
| Use of English | Alade Tobi | Approved all |
| Mathematics | James Oreofeoluwa | Approved all |
| Biology | Samuel Elijah | Approved all |
| Physics | Precious | Approved all |
| Chemistry | Adeleke Emmanuel | Approved all |
| Economics | James Ademola | Approved all |
| Government | John Damilola | Approved all |
| Literature in English | James | Approved all |

Preserve these as substantive owner-reported approvals. Do not request blanket re-review. The scope is the replacement questions in each subject, not an assertion that all original retained questions have separate reviewer sign-off.

### Reconciled replacement inventory

- Canonical replacement proposals: **116** (duplicate-replacement-drafts-2026-11-01.json).
- Additional R4 target-specific proposals: **31** (the 19-item checkpoint plus the 12 proposals in execution batches 2, 3, 5–12).
- Total replacement proposals covered by the eight subject approvals: **147**.
- Remaining 14 of the 45 uncovered-target queue: documented retained-bank collision outcomes. They are deliberately not new proposals; do not create paraphrases just to fill the count.
- R4 source bank: **1,439 provisionally retained + 161 held = 1,600 source rows**.
- Candidate release inventory, if the 147 replacements are substituted for their held targets: **1,439 retained + 147 replacements = 1,586 questions**. The 14 collision outcomes remain excluded because their learning outcomes are already represented in the retained bank. Do not describe this as a 1,600-question approved bank or manufacture 14 additional items.

The 20 November reviewer register records the complete 147-ID inventory scope and all eight subject decisions. The project owner explicitly confirmed that every replacement was individually reviewed. The exact content checkpoint is commit 3ef11a1efd69ea8624a3aef9bf9b2cd8c5ce02e9; comparison with the later audit-only commit 30426902ac264d46f7f7535d0afb6296e98fba24 shows that the only intervening file addition was the reviewer-version reconciliation note—no question-content file changed after the reported review checkpoint. This pins the reviewed proposal set to that repository snapshot without inventing reviewer signatures or credentials.

### Isolated import versus production

Read-only Supabase checks on 20 November show:
- Production project pphxltbkwygqjtjgkhxu: all four original CBT tables exist, with 0 question rows, 0 import rows, 0 attempt sessions and 0 attempts. The four original CBT schema migrations are already recorded in production.
- Isolated project wpktzogarfqrgkirzdpy: 1,563 question rows, 7 import records, 1,904 attempt sessions and 1,827 attempt-history rows. These are isolated test data, not production inventory. The test database includes legacy fixtures and synthetic preview samples; it is not the final 1,586-row import artifact.
- No production question import or publication has been performed.

### Production migration delta

The original CBT question-bank, import, attempt-session and attempt-history migrations are already present in production. There is **no missing core CBT table migration** for the question-bank release.

The separate Student Arena migration 20261120100000_add_cbt_student_arena.sql exists on PR #208. Its isolated schema has been verified:
- cbt_student_profiles and cbt_attempt_subject_scores exist with RLS enabled.
- Direct SELECT is denied to anon and authenticated; service_role retains SELECT.
- cbt_student_leaderboard(text,text,text,integer,integer) exists; EXECUTE is denied to anon and authenticated, and granted to service_role.
- Production does not yet have these two Arena tables or the leaderboard function.
- Production eduken-api is version 42; isolated eduken-api is version 54. The Arena migration/API are a separate feature delta and must not be silently treated as part of the core question-bank release.

The migration is therefore prepared and isolated-security-verified, but has **not** been applied to production. No production database, Edge Function, Worker, question import or publication was changed by this reconciliation.

**Current disposition:** the 147 replacement proposals have owner-reported subject approval; the 14 no-new-draft collision outcomes remain excluded; the core CBT schema is already present in production; the separate Arena schema migration is ready in PR #208 and verified only in isolation. The remaining execution is to assemble and validate the exact 1,586-row production import artifact, decide whether the separate Arena feature is included in this live release, and then carry out the already-agreed production release sequence with live smoke tests.
