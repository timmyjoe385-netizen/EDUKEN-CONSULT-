-- Ensure isolated checkout previews have the public-content tables queried by
-- publicContent(). Existing production content tables are left unchanged.
-- The isolated payment-test project contains no real editorial/customer content.

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  category text,
  description text,
  organization text,
  location text,
  deadline date,
  application_url text,
  official_source text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified boolean not null default false,
  featured boolean not null default false,
  urgent boolean not null default false,
  notify_on_publish boolean not null default false,
  content text,
  eligibility text,
  benefits text,
  how_to_apply text
);

create table if not exists public.admissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  school text,
  programme text,
  category text,
  description text,
  deadline date,
  application_url text,
  official_source text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified boolean not null default false,
  slug text,
  featured boolean not null default false,
  urgent boolean not null default false,
  notify_on_publish boolean not null default false
);

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  category text,
  content text,
  source text,
  source_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified boolean not null default false,
  featured boolean not null default false,
  urgent boolean not null default false
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;
alter table public.admissions enable row level security;
alter table public.updates enable row level security;
alter table public.faqs enable row level security;
