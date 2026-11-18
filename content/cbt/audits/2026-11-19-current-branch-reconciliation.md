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
