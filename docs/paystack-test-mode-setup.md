# EDUKEN CONSULT — Paystack test-mode setup

This integration must remain in Paystack **Test Mode** until the checkout, verification, webhook, and admin reporting flows have passed end-to-end checks.

## Supabase Edge Function secrets

In Supabase Dashboard → Edge Functions → Secrets (or the project secrets area), set:

- `PAYSTACK_MODE=test`
- `PAYSTACK_SECRET_KEY` = the **Test Secret Key** from Paystack Dashboard → Settings / API Keys & Webhooks while Test Mode is selected.
- Optional: `PAYSTACK_CALLBACK_URL=https://eduken-consult.timmyjoe385.workers.dev/`

Never place a Paystack secret key in frontend code, GitHub files, a public environment variable, WhatsApp, or this chat. The API deliberately rejects a live key while `PAYSTACK_MODE=test`.

## Paystack webhook

In the Paystack Dashboard while Test Mode is selected, add this webhook URL:

`https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/api/payments/webhook`

The webhook handler validates Paystack's `x-paystack-signature` HMAC-SHA512 against the raw request body before processing `charge.success`. Do not mark a request paid based only on the browser redirect.

## Safe test checklist

1. Use Paystack's test keys and test payment details only.
2. Pay for one priced service and confirm the browser returns to EDUKEN with a payment confirmation.
3. Verify the stored amount in kobo, currency (NGN), and reference match the Paystack transaction.
4. Repeat the verification callback and webhook; the service request must remain paid without duplicate fulfilment.
5. Test failed and abandoned checkout; neither may be marked paid.
6. Test a guest checkout and a signed-in checkout.
7. Confirm the payment appears in the admin payment list and the related request shows Paid.
8. Confirm quote-only services do not start a charge.

## Before accepting real money

Complete Paystack Compliance → Profile, Contact, Owner, Account, and (for registered businesses) Documents. Upload the documents requested for your selected Nigerian business type, resolve any “Needs Attention” items, and wait for Paystack to show an approved/pre-approved live activation state. Confirm the payout account and support/disputes email are correct. Only then, after a successful test run, deliberately switch `PAYSTACK_MODE=live` and set the live secret key in Supabase secrets. Never mix test and live keys.
