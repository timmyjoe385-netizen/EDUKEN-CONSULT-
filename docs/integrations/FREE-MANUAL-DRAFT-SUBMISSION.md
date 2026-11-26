# Free manual EDUKEN draft submission

This workflow is a no-cost alternative when a private ChatGPT Action is unavailable. It uses GitHub Actions and the existing production draft-intake endpoint.

## One-time setup

1. Open the repository's Settings → Secrets and variables → Actions.
2. Confirm the repository secret `EDUKEN_DRAFT_INTAKE_SECRET` exists. Its value must match the secret configured for the Supabase Edge Function. Never put the value in a workflow input, source file, issue, or chat.
3. After this workflow is merged into the default branch, open Actions → Submit EDUKEN Admin Draft (Free Manual Method) → Run workflow.

## Each submission

1. Draft the announcement in ChatGPT.
2. Copy the JSON payload supplied with the draft.
3. Paste it into the `draft_json` input and run the workflow.
4. Open the run and inspect the response. HTTP 201 with `ok: true`, a section, an ID, `status: DRAFT`, and `is_published: false` confirms the item was saved.
5. Open the matching section in EDUKEN Admin, review the draft, and publish it yourself when ready.

## Payload examples

Updates:

```json
{
  "section": "updates",
  "title": "Example announcement title",
  "category": "JAMB",
  "content": "Full announcement text goes here.",
  "source": "Official source",
  "source_url": "https://example.com"
}
```

Opportunity:

```json
{
  "section": "opportunities",
  "title": "Example scholarship opportunity",
  "category": "Scholarships",
  "description": "Short summary of the opportunity.",
  "organization": "Issuing organization",
  "deadline": "2027-02-28",
  "application_url": "https://example.com/apply",
  "official_source": "Official announcement"
}
```

For FAQs use `section: "faqs"` with `question` and `answer`. For services use `section: "services"` with `name`. For admissions use `section: "admissions"` with `title` and relevant school/programme details.

## Safety

- Supported sections are `opportunities`, `admissions`, `updates`, `faqs`, and `services`.
- The endpoint enforces unpublished draft status. This workflow has no publish operation.
- Never paste the bearer secret into the JSON input.
- A successful workflow run creates a draft; it does not publish content or deploy the website.
- If a run fails, inspect the response and correct the payload before trying again.
