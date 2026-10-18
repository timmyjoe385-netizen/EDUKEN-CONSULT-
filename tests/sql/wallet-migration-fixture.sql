-- Disposable PostgreSQL fixture for the wallet migration integration test.
-- This file runs only in an isolated GitHub Actions PostgreSQL service.
create extension if not exists pgcrypto;
create schema if not exists auth;

do $role$
begin
  create role anon;
exception when duplicate_object then null;
end;
$role$;
do $role$
begin
  create role authenticated;
exception when duplicate_object then null;
end;
$role$;
do $role$
begin
  create role service_role;
exception when duplicate_object then null;
end;
$role$;

create table auth.users (
  id uuid primary key,
  email text
);

-- Minimal auth.uid() stub for the disposable PostgreSQL test environment.
create or replace function auth.uid()
returns uuid
language sql
stable
as $fn$ select null::uuid $fn$;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric,
  is_published boolean not null default true,
  is_available boolean not null default true,
  is_catalog_item boolean not null default false
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  quantity integer not null default 1,
  status text not null default 'New Requests',
  updated_at timestamptz not null default now()
);

-- Minimal table shape for validating the admin settings updater foreign-key index migration.
create table public.admin_system_settings (
  id uuid primary key default gen_random_uuid(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Simulate an account that existed before the wallet migration.
insert into auth.users (id, email)
values ('11111111-1111-4111-8111-111111111111', 'existing-customer@example.test');
