# PR #199 — Authenticated CBT Admin Acceptance Checklist

Date prepared: 2026-11-09

PR: https://github.com/timmyjoe385-netizen/EDUKEN-CONSULT-/pull/199  
Reviewed head: `aea774e0e90955e4425bca7a4edfe072a5a3ccf5`

## Test boundary

The existing Playwright coverage for PR #199 mocks Supabase authentication and the admin API. It verifies UI behaviour but is not proof of a real authenticated admin session. Do not describe it as live acceptance.

Run this checklist only against the isolated preview/test environment connected to the isolated Supabase project. Do not use production for test imports or status changes. Do not put passwords, access tokens, refresh tokens, service-role keys or other secrets in this file, GitHub comments or chat.

## Preconditions

- Confirm the preview build is running the exact PR head or its reviewed merge candidate.
- Confirm its API points to the isolated Supabase project, not production.
- Use an authorized test administrator account through the normal login flow.
- Confirm the account is not a normal student session.
- Use an existing disposable test question or create a clearly labelled test draft only if the isolated environment is confirmed.

## Acceptance cases

1. **Authentication and route isolation**
   - Open `/admin` signed out; confirm the admin login screen appears.
   - Sign in with the authorized test administrator.
   - Confirm the server-side admin session endpoint authorizes the account.
   - Sign out; confirm the public homepage does not redirect a normal student account into the admin dashboard.
   - Confirm a non-admin account cannot access admin data or perform admin writes.

2. **Pagination**
   - Confirm the question list shows the correct total and page count.
   - Move to page 2; verify the request includes `page=2` and the displayed records change.
   - Move back to page 1; verify the correct records return.

3. **Filter and search reset**
   - Move to page 2, select a review-state filter; confirm the page resets to 1 and the server request includes the selected status.
   - Return to all states, move to page 2, search for a known test term; confirm page resets to 1 and the request includes the search term.
   - Clear the search and confirm the full result set returns.

4. **Audit visibility**
   - Inspect a test question with known created/reviewed metadata.
   - Confirm created-by/time, reviewed-by/time, approved-by/time and published-by/time display accurately.
   - Confirm missing audit events display as not recorded, not as an inferred reviewer.

5. **Import safety**
   - Confirm import history loads.
   - In the isolated environment only, upload a disposable CSV with one valid test row and one invalid row.
   - Confirm validation counts and row errors are accurate.
   - Confirm successful imports remain drafts and are not automatically approved or published.
   - Do not test a production import.

6. **Authorization and release safeguards**
   - Confirm draft/review/approve/publish transitions are enforced server-side, not only hidden in the UI.
   - Confirm unauthorized requests are rejected.
   - Confirm test records and any test import history are isolated from production.

## Evidence to record

- Preview URL and deployed commit SHA.
- Isolated Supabase project identifier (project ID only; never keys).
- Test administrator role confirmation.
- Pass/fail for each case, with timestamp.
- Screenshots or sanitized request/response evidence with all tokens and personal data removed.
- Any defect, reproduction steps and affected endpoint.

## Completion rule

Mark authenticated acceptance complete only after the real login and server authorization checks pass in the isolated environment. Mocked Playwright tests alone do not satisfy this gate. No PR merge, production deployment, question import or publication is authorized by this checklist.
