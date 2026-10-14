-- EDUKEN CONSULT account-free email alerts
-- Feature-branch migration only. Do not apply to production until the API and delivery worker are approved.

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
  constraint email_alert_subscriptions_email_length
    check (char_length(email) between 3 and 254),
  constraint email_alert_subscriptions_topics_nonempty
    check (cardinality(topics) > 0),
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
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  event_type text not null check (event_type in ('new_opportunity', 'deadline_7d', 'deadline_3d', 'deadline_1d')),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  processing_started_at timestamptz,
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

alter table public.email_alert_subscriptions enable row level security;
alter table public.email_alert_deliveries enable row level security;

-- Explicitly remove direct table privileges as defense in depth; service_role is used
-- only inside the server-side Edge Function and bypasses RLS by design.
revoke all on table public.email_alert_subscriptions from public, anon, authenticated;
revoke all on table public.email_alert_deliveries from public, anon, authenticated;

-- Intentionally no anon/authenticated policies. Only the server-side Edge Function accesses these tables.


-- Atomic server-side rate limiting for public email-alert endpoints. Keys are
-- one-way hashes of an action and client IP; raw IP addresses are never stored.
create table if not exists public.email_alert_rate_limits (
  key_hash text primary key check (key_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists email_alert_rate_limits_window_idx
  on public.email_alert_rate_limits (window_started_at);

alter table public.email_alert_rate_limits enable row level security;

create or replace function public.consume_email_alert_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_count integer;
begin
  if p_key_hash is null
     or p_limit is null
     or p_window_seconds is null
     or length(p_key_hash) <> 64
     or translate(p_key_hash, '0123456789abcdef', '') <> ''
     or p_limit < 1 or p_limit > 100
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate-limit arguments';
  end if;

  insert into public.email_alert_rate_limits as existing
    (key_hash, window_started_at, request_count, updated_at)
  values (p_key_hash, now(), 1, now())
  on conflict (key_hash) do update
    set window_started_at = case
          when existing.window_started_at <= now() - make_interval(secs => p_window_seconds)
            then now()
          else existing.window_started_at
        end,
        request_count = case
          when existing.window_started_at <= now() - make_interval(secs => p_window_seconds)
            then 1
          else existing.request_count + 1
        end,
        updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_email_alert_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_email_alert_rate_limit(text, integer, integer) to service_role;
revoke all on table public.email_alert_rate_limits from public, anon, authenticated;

     or p_limit < 1 or p_limit > 100
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate-limit arguments';
  end if;

  insert into public.email_alert_rate_limits as existing
    (key_hash, window_started_at, request_count, updated_at)
  values (p_key_hash, now(), 1, now())
  on conflict (key_hash) do update
    set window_started_at = case
          when existing.window_started_at <= now() - make_interval(secs => p_window_seconds)
            then now()
          else existing.window_started_at
        end,
        request_count = case
          when existing.window_started_at <= now() - make_interval(secs => p_window_seconds)
            then 1
          else existing.request_count + 1
        end,
        updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_email_alert_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_email_alert_rate_limit(text, integer, integer) to service_role;
revoke all on table public.email_alert_rate_limits from public, anon, authenticated;
