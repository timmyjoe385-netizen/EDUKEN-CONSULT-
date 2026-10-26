-- Store the provider-supplied beneficiary name for Flutterwave wallet transfer instructions.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS flutterwave_account_name text;

ALTER TABLE public.payments
  ADD CONSTRAINT flutterwave_account_name_length_check
  CHECK (flutterwave_account_name IS NULL OR char_length(flutterwave_account_name) <= 160);
