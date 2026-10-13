# Account-free email alerts and deadline reminders

This feature is being developed on a separate branch and is not enabled in production.

## Existing architecture findings

- The current `topic_subscriptions` and `notifications` tables require a signed-in `user_id`, so they cannot serve visitors who subscribe without accounts.
- The current browser notification helper only requests browser permission. It does not register a push subscription or deliver messages.
- The existing deadline reminder route requires authentication and saved opportunities; it is not an account-free email reminder service.
- Opportunity records already include deadlines, publication status, verification/source metadata and a notify-on-publish flag.

## Intended experience

1. Visitors enter an email and choose one or more categories without creating a password or account.
2. A verification email confirms they control the address before any alerts are sent.
3. Confirmation activates the subscription; a secure unsubscribe link is included in every email.
4. Publishing a verified opportunity can queue one new-opportunity email for active subscribers of its category.
5. Deadline reminders are queued for 7, 3 and 1 day before the verified deadline, using the opportunity's actual deadline date.
6. A scheduled worker processes due items, retries temporary failures, records provider delivery IDs, and uses unique constraints/idempotency to avoid duplicates.
7. Optional browser notifications are an enhancement, never the only delivery path.

## Security and reliability requirements

- Never expose subscriber emails, verification tokens, unsubscribe tokens or provider credentials to the browser.
- Store only hashes of verification/unsubscribe tokens; use short-lived verification tokens.
- Rate-limit subscription and verification requests and return non-enumerating responses.
- Validate/normalize email and restrict topic values to the approved category list.
- Use RLS with no public read/write policies; perform operations through server-side Edge Function code with service-role access.
- Only send new-opportunity alerts for published, eligible content with an official source/verification status, and honor the admin's notification toggle.
- Cancel pending reminders when an opportunity is unpublished, withdrawn or its deadline passes/changes; reschedule when a deadline changes.
- Log attempts and failures without logging personal tokens or unnecessary personal data.

## Remaining implementation steps

- Implement subscribe, verify, preference-update and unsubscribe endpoints in the existing `eduken-api` Edge Function.
- Choose/configure an email delivery provider using server-side secrets; no provider secret should be committed to this repository.
- Implement the scheduled delivery processor and configure its schedule only after review.
- Add the public subscription UI and optional browser notification permission UI.
- Add tests for validation, duplicate subscriptions, token expiry, unsubscribe, publication triggers, changed deadlines, duplicate prevention, retries and authorization.
- Run CI and test delivery using a dedicated test address before enabling any live mail.

## Deployment boundary

The migration is a draft in this branch. Do not apply it to production, deploy the Edge Function, configure a live schedule, or send emails until the implementation and provider configuration have been reviewed and explicitly approved.
