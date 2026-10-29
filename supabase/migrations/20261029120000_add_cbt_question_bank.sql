-- EDUKEN CBT question bank and auditable bulk imports.
-- This migration is intended for the isolated test project first. Do not apply to production without explicit approval.
create table if not exists public.cbt_questions (
  id uuid primary key default gen_random_uuid(),
  exam_type text not null default 'JAMB' check (length(trim(exam_type)) between 1 and 80),
  subject text not null check (length(trim(subject)) between 1 and 120),
  topic text not null check (length(trim(topic)) between 1 and 200),
  subtopic text,
  question_text text not null check (length(trim(question_text)) between 5 and 10000),
  options jsonb not null check (jsonb_typeof(options) = 'object' and options ?& array['A','B','C','D']),
  correct_option text not null check (correct_option in ('A','B','C','D')),
  explanation text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  source_type text not null default 'original' check (source_type in ('original','past_question','licensed','other')),
  source_name text not null default '',
  source_year integer check (source_year is null or source_year between 1960 and 2100),
  provenance_notes text not null default '',
  licensing_notes text not null default '',
  status text not null default 'draft' check (status in ('draft','reviewed','approved','published','unpublished')),
  question_fingerprint text not null unique,
  import_batch_id uuid,
  created_by uuid,
  updated_by uuid,
  reviewed_by uuid,
  approved_by uuid,
  published_by uuid,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(trim(options->>'A'),'') <> ''),
  check (coalesce(trim(options->>'B'),'') <> ''),
  check (coalesce(trim(options->>'C'),'') <> ''),
  check (coalesce(trim(options->>'D'),'') <> ''),
  check (length(trim(question_fingerprint)) between 16 and 128)
);

create index if not exists cbt_questions_public_filter_idx
  on public.cbt_questions (exam_type, subject, topic) where status = 'published';
create index if not exists cbt_questions_review_queue_idx
  on public.cbt_questions (status, created_at desc);

create table if not exists public.cbt_question_imports (
  id uuid primary key default gen_random_uuid(),
  filename text not null default '',
  source_label text not null default '',
  total_rows integer not null default 0 check (total_rows >= 0),
  inserted_rows integer not null default 0 check (inserted_rows >= 0),
  duplicate_rows integer not null default 0 check (duplicate_rows >= 0),
  invalid_rows integer not null default 0 check (invalid_rows >= 0),
  status text not null default 'completed' check (status in ('validated','completed','failed')),
  error_report jsonb not null default '[]'::jsonb check (jsonb_typeof(error_report) = 'array'),
  imported_by uuid,
  created_at timestamptz not null default now()
);

alter table public.cbt_questions enable row level security;
alter table public.cbt_question_imports enable row level security;

-- All reads/writes go through the existing server-side API. Browser clients cannot
-- bypass admin checks by calling Supabase directly.
revoke all on public.cbt_questions from anon, authenticated;
revoke all on public.cbt_question_imports from anon, authenticated;
grant select, insert, update, delete on public.cbt_questions to service_role;
grant select, insert, update, delete on public.cbt_question_imports to service_role;

-- Referential link is added after both tables exist.
alter table public.cbt_questions
  drop constraint if exists cbt_questions_import_batch_id_fkey;
alter table public.cbt_questions
  add constraint cbt_questions_import_batch_id_fkey
  foreign key (import_batch_id) references public.cbt_question_imports(id) on delete set null;
