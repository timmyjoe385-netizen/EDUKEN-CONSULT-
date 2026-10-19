-- Durable, service-role-only outbox for payment receipts and administrator notices.
-- This migration is applied by CI only to a disposable PostgreSQL fixture until explicitly approved.
create table if not exists public.payment_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  payment_reference text not null,
  notification_kind text not null check (notification_kind in ('deposit', 'service_payment', 'refund')),
  recipient_role text not null check (recipient_role in ('customer', 'admin')),
  recipient_email text not null,
  idempotency_key text not null unique,
  subject text not null,
  text_body text not null,
  status text not null default 'pending' check (status in ('pending', 'delivered')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists payment_notification_deliveries_pending_idx
  on public.payment_notification_deliveries (payment_reference, created_at)
  where status = 'pending';

alter table public.payment_notification_deliveries enable row level security;
revoke all on table public.payment_notification_deliveries from anon, authenticated;
grant all on table public.payment_notification_deliveries to service_role;
