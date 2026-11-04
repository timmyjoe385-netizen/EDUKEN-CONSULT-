# Isolated CBT admin end-to-end test runbook

**Scope:** PR #194 preview and Supabase test project `wpktzogarfqrgkirzdpy` only.  
**Production safety:** Do not use the production site, production Supabase project, production Worker, or any real student records. Do not upload the 90 replacement candidates during this smoke test.

## Why this is still required

The existing Playwright admin test mocks the OAuth callback and admin API. It proves frontend state transitions, not real Google authentication, the allowlist, Edge Function authorisation, database writes, duplicate handling or student-feed isolation.

## Before starting

1. Confirm the preview site is the isolated preview build and that its frontend points to `https://wpktzogarfqrgkirzdpy.supabase.co`.
2. Confirm the signed-in Google account is the configured EDUKEN admin account. Do not share passwords, access tokens or refresh tokens in chat.
3. Record the test-project baseline using the read-only query below.
4. Use only the disposable one-row CSV in this runbook.

## Disposable CSV

Save this as `eduken-admin-e2e-smoke.csv`:

```csv
exam_type,subject,topic,subtopic,question_text,option_A,option_B,option_C,option_D,correct_option,explanation,difficulty,source_type,source_name,source_year,provenance_notes,licensing_notes
JAMB,Use of English,Grammar,Test,"[TEST ONLY] Which option is a noun?",quickly,happiness,blue,run,B,"Happiness is a noun.",easy,original,,,, 
```

This is synthetic test content, not a JAMB past question. Do not include personal data.

## Authenticated admin checks

1. Open the isolated preview's `/admin` route and sign in with the allowlisted admin account.
2. Confirm the admin dashboard loads and the CBT Question Bank section is available.
3. Import the disposable CSV. Confirm the import report records one inserted row, zero invalid rows and zero duplicates.
4. Confirm the new record is **draft**, not reviewed, approved or published.
5. Refresh the page. Confirm the draft and import-history record persist.
6. Attempt to import the same CSV again. Confirm the duplicate is rejected/reported and no second question is created.
7. Move the test question through reviewed and approved only as the UI permits. Verify each state persists after refresh.
8. Publish the synthetic test question only in the isolated test project, then verify it appears in the preview student feed. Confirm an unpublished/draft question does not appear.
9. Unpublish or delete the synthetic test question using the supported admin action. Confirm it disappears from the student feed.
10. Sign out. Confirm the admin area is inaccessible to the signed-out visitor. Also verify a non-allowlisted account cannot access admin APIs.

## Read-only database verification

Run against project `wpktzogarfqrgkirzdpy` only:

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

Record before/after counts and the test row/import IDs. The second identical import must not increase the question count. Do not alter unrelated rows.

## Evidence required to close the gate

- Preview URL and deployment commit actually tested.
- Admin account identity confirmed without exposing credentials.
- Import result and persistent import-history row.
- Before/after question counts and duplicate retry result.
- State transitions after refresh.
- Student-feed checks for draft, published and unpublished states.
- Signed-out and non-allowlisted access rejection.
- Cleanup result for the synthetic test question.

If any check fails, stop. Do not merge, deploy, import the 90 replacement candidates or change production. Keep screenshots/logs free of tokens and personal student information.
