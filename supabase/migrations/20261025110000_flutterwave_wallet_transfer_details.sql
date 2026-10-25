-- Dynamic Flutterwave wallet bank-transfer details for individual pending deposits.
-- Forward-only: do not apply to production until the release has been approved.
alter table public.payments
  add column if not exists flutterwave_account_number text,
  add column if not exists flutterwave_bank_name text,
  add column if not exists flutterwave_account_expires_at timestamptz,
  add column if not exists flutterwave_transfer_amount numeric(12,2);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname = 'payments_flutterwave_transfer_amount_positive'
  ) then
    alter table public.payments
      add constraint payments_flutterwave_transfer_amount_positive
      check (flutterwave_transfer_amount is null or flutterwave_transfer_amount > 0);
  end if;
end
$$;
