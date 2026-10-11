-- EDUKEN CONSULT account-free email alerts
-- Apply only after reviewing the migration and endpoint implementation.
-- This file is intentionally not applied to production by the feature branch.

create table if not exists public.email_alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  topics text[] not null default '{}',
  verified_at timestamptz,
  verification_token_hash text,
  verification_expires_at timestamptz,
  unsubscribe_token_hash text not null unique,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint email_alert_subscriptions_email_lowercase
    check (email = lower(trim(email))),
  constraint email_alert_subscriptions_topics_allowed
    check (topics <@ array[
      'admissions',
      'scholarships-grants',
      'jobs-internships',
      'remote-opportunities',
      'educational-updates',
      'career-mentorship'
    ]::text[])
);

create unique index if not exists email_alert_subscriptions_email_unique
  on public.email_alert_subscriptions (email);

create table if not exists public.email_alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.email_alert_subscriptions(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  event_type text not null check (event_type in ('new_opportunity', 'deadline_7d', 'deadline_3d', 'deadline_1d', 'verification')),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_message_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (subscription_id, opportunity_id, event_type)
);

create index if not exists email_alert_deliveries_due_idx
  on public.email_alert_deliveries (scheduled_for)
  where status = 'pending';

-- Do not expose subscriber emails or token hashes through public APIs.
alter table public.email_alert_subscriptions enable row level security;
alter table public.email_alert_deliveries enable row level security;

-- No anon/authenticated policies are intentionally created here.
-- The service-role Edge Function must own all reads/writes and validate tokens.
