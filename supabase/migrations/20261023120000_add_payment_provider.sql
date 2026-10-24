-- Distinguish providers without changing existing Paystack payment rows.
-- Existing rows default to Paystack; apply only to the isolated Flutterwave test project first.
alter table public.payments
  add column if not exists payment_provider text not null default 'paystack';

alter table public.payments
  drop constraint if exists payments_payment_provider_check;

alter table public.payments
  add constraint payments_payment_provider_check
  check (payment_provider in ('paystack', 'flutterwave'));

create index if not exists payments_provider_status_created_idx
  on public.payments (payment_provider, status, created_at desc);
