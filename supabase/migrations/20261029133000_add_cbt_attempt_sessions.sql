-- Private server-side CBT sessions. The correct answer key is stored here, never in the public question response.
create table if not exists public.cbt_attempt_sessions (
  id uuid primary key default gen_random_uuid(),
  attempt_token_hash text not null unique check (length(attempt_token_hash) = 64),
  user_id uuid references auth.users(id) on delete set null,
  mode text not null check (mode in ('practice','mock')),
  subject text not null check (length(trim(subject)) between 1 and 120),
  question_snapshot jsonb not null check (jsonb_typeof(question_snapshot) = 'array' and jsonb_array_length(question_snapshot) > 0),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  score integer check (score is null or score >= 0),
  total integer not null check (total > 0),
  status text not null default 'active' check (status in ('active','submitted','expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  check (score is null or score <= total),
  check ((status = 'submitted') = (submitted_at is not null))
);

create index if not exists cbt_attempt_sessions_user_started_idx
  on public.cbt_attempt_sessions (user_id, started_at desc)
  where user_id is not null;
create index if not exists cbt_attempt_sessions_active_expiry_idx
  on public.cbt_attempt_sessions (expires_at)
  where status = 'active';

-- Summary history contains only server-graded results. This table already exists in some
-- isolated previews, so add the idempotency link compatibly rather than replacing it.
create table if not exists public.cbt_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  mode text not null check (mode in ('practice','mock')),
  subject text not null check (length(trim(subject)) between 1 and 120),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  attempt_session_id uuid
);

alter table public.cbt_attempts
  add column if not exists attempt_session_id uuid;

create unique index if not exists cbt_attempts_attempt_session_id_uidx
  on public.cbt_attempts (attempt_session_id)
  where attempt_session_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'cbt_attempts_attempt_session_id_fkey'
      and conrelid = 'public.cbt_attempts'::regclass
  ) then
    alter table public.cbt_attempts
      add constraint cbt_attempts_attempt_session_id_fkey
      foreign key (attempt_session_id)
      references public.cbt_attempt_sessions(id)
      on delete set null;
  end if;
end
$$;

alter table public.cbt_attempt_sessions enable row level security;
alter table public.cbt_attempts enable row level security;
revoke all on public.cbt_attempt_sessions from anon, authenticated;
revoke all on public.cbt_attempts from anon, authenticated;
grant select, insert, update, delete on public.cbt_attempt_sessions to service_role;
grant select, insert, update, delete on public.cbt_attempts to service_role;
