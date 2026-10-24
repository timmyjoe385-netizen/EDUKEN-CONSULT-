# Flutterwave test integration — staged plan

This branch adds a separately guarded Flutterwave test path. Paystack remains the existing provider and must continue to work unchanged.

## Safety rules

- Use only Flutterwave **test** credentials and the isolated Supabase project `wpktzogarfqrgkirzdpy`.
- Never put provider secrets or the webhook secret hash in source control, frontend code, screenshots, or chat.
- Keep Flutterwave webhook configuration on the Test webhooks tab. Do not change Live webhooks.
- Do not deploy to production, merge this branch, run real charges, or apply schema changes to production.
- Only a verified Flutterwave transaction matching the stored reference, NGN amount and currency can mark a payment paid.
- Preserve the existing payment record, service request, wallet-settlement RPC, and notification outbox. Do not create a second wallet settlement path.

## Implementation sequence

1. Add and test provider-specific validation helpers.
2. Add a nullable provider marker to the payment schema in a migration, with existing rows defaulting to Paystack.
3. Add separate Flutterwave test initialization, verification and webhook routes; keep existing Paystack routes intact.
4. Add frontend provider selection only after backend routes and callback handling are ready.
5. Configure secrets only in the isolated Supabase project's Edge Function secrets, then deploy and test using provider test tools.
6. Confirm duplicate webhook delivery, mismatched amounts/references, pending transactions, and failure recovery before any production discussion.

## Secret names reserved for the isolated test project

- `FLUTTERWAVE_MODE=test`
- `FLUTTERWAVE_SECRET_KEY` (test secret key only)
- `FLUTTERWAVE_WEBHOOK_HASH` (test webhook secret hash only)

These values belong in Supabase Edge Function secrets, not in this repository.
