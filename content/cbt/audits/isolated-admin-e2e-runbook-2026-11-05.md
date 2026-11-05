# Isolated CBT admin end-to-end test — execution record

**Result:** PASSED  
**Test date:** 5 November 2026  
**Scope:** PR #194 isolated preview and Supabase test project `wpktzogarfqrgkirzdpy` only.  
**Production safety:** No production Worker, production Supabase project, payment settings or real student records were used or changed.

## Completed checks

1. Signed in through Google using the allowlisted EDUKEN administrator account.
2. Confirmed the admin dashboard and CBT Question Bank controls loaded.
3. Imported the one-row synthetic CSV: **1 inserted, 0 duplicates, 0 invalid**.
4. Confirmed the inserted record persisted as draft.
5. Re-imported the same CSV: **0 inserted, 1 duplicate, 0 invalid**. The database still contained only one matching synthetic question.
6. Moved the synthetic record through reviewed, approved and published states; each transition persisted.
7. Confirmed the published synthetic question appeared in the preview student CBT feed.
8. Unpublished the question and confirmed it disappeared from the student feed.
9. Deleted the synthetic question through the admin UI.
10. Confirmed zero [TEST ONLY] question rows remained and question counts returned to the pre-test baseline.
11. Signed out and confirmed the admin route returned to the Google sign-in screen.
12. Tried a separate non-allowlisted Google account; access was rejected. Supabase logs showed the unauthorised request returning HTTP 403.

## Database evidence

Isolated project: `wpktzogarfqrgkirzdpy`

| Subject | Draft before/after | Published before/after |
|---|---:|---:|
| Use of English | 9 | 1 |
| Mathematics | 8 | 1 |
| Biology | 8 | 1 |
| Chemistry | 8 | 1 |
| Physics | 8 | 1 |
| Economics | 8 | 1 |
| Government | 8 | 1 |
| Literature in English | 8 | 1 |
| **Total** | **65** | **8** |

- Total question rows before and after: **73**.
- Synthetic test rows after cleanup: **0**.
- Import history: retained for audit; the synthetic import history row is expected to remain after its question was deleted.
- No 90-row replacement candidates or original 1,600-question source batches were imported.

## Synthetic CSV used

This was test content only, not an authentic JAMB past question:

```csv
exam_type,subject,topic,subtopic,question_text,option_A,option_B,option_C,option_D,correct_option,explanation,difficulty,source_type,source_name,source_year,provenance_notes,licensing_notes
JAMB,Use of English,Grammar,Test,"[TEST ONLY] Which option is a noun?",quickly,happiness,blue,run,B,"Happiness is a noun.",easy,original,,,,
```

## Scope and limitations

- This verifies the authenticated admin import/review/publish workflow and access controls against the isolated test environment.
- It does not verify the academic correctness of the 1,600-question bank or the 90 replacement candidates.
- It does not establish that the bank can support a 180-question mock; the isolated database has only one published question per subject.
- The test was completed before the current preview-backend-isolation code correction. The corrected preview build must pass CI and be smoke-tested separately.
- No merge, production deployment, production import or publication was performed.

## Historical runbook

The original disposable-test procedure and SQL checks are preserved below for repeat use. This execution record supersedes older statements in this file that say authenticated admin E2E is outstanding.

---

# Repeatable isolated admin test procedure

**Scope:** PR #194 preview and Supabase test project `wpktzogarfqrgkirzdpy` only. Do not use production or real student data.

1. Confirm preview deployment and test-project bindings.
2. Use only the synthetic CSV above.
3. Record the test-project baseline.
4. Import once, confirm draft status and import history.
5. Re-import and confirm duplicate handling.
6. Verify review/approval/publish transitions and student-feed visibility.
7. Unpublish/delete the synthetic row and verify it disappears.
8. Sign out and verify a non-allowlisted account is rejected.

Read-only SQL for the isolated test project:

```sql
select status, count(*)::int
from public.cbt_questions
group by status
order by status;

select id, filename, total_rows, inserted_rows, duplicate_rows, invalid_rows, status, created_at
from public.cbt_question_imports
order by created_at desc
limit 10;

select id, subject, question_text, status, created_at
from public.cbt_questions
where question_text like '[TEST ONLY]%'
order by created_at desc;
```

Do not upload the 90 replacement candidates during this procedure. Keep credentials, tokens and personal information out of screenshots and logs.
