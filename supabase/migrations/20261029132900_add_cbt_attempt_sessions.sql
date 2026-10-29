-- Private server-side CBT sessions. Correct answers stay server-side until submission.
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
create index if not exists cbt_attempt_sessions_user_started_idx on public.cbt_attempt_sessions (user_id, started_at desc) where user_id is not null;
create index if not exists cbt_attempt_sessions_active_expiry_idx on public.cbt_attempt_sessions (expires_at) where status = 'active';
alter table public.cbt_attempt_sessions enable row level security;
revoke all on public.cbt_attempt_sessions from anon, authenticated;
grant select, insert, update, delete on public.cbt_attempt_sessions to service_role;
