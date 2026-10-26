-- Private student service deliverables.
-- Included in the isolated feature branch only; NOT applied to production.
-- Files are written/read by the server using service_role and short-lived signed URLs.
create table if not exists public.service_deliverables (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text null check (description is null or char_length(description) <= 3000),
  storage_path text not null unique,
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes between 1 and 15728640),
  published_at timestamptz null,
  published_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_deliverables_student_published_idx
  on public.service_deliverables (user_id, published_at desc, created_at desc);

create index if not exists service_deliverables_request_idx
  on public.service_deliverables (service_request_id, created_at desc);

alter table public.service_deliverables enable row level security;

drop policy if exists "Students can view their published service deliverables"
  on public.service_deliverables;
create policy "Students can view their published service deliverables"
  on public.service_deliverables
  for select to authenticated
  using (user_id = (select auth.uid()) and published_at is not null);

revoke all on public.service_deliverables from anon;
revoke all on public.service_deliverables from authenticated;
grant select on public.service_deliverables to authenticated;
grant select, insert, update, delete on public.service_deliverables to service_role;

-- Private bucket: do not create public object access policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'eduken-service-deliverables',
  'eduken-service-deliverables',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.service_deliverables is
  'Private files/instructions delivered by EDUKEN to the specific student who owns the linked service request. Not applied to production by this migration file alone.';
comment on column public.service_deliverables.storage_path is
  'Object key in the private eduken-service-deliverables bucket; never expose permanent public URLs.';
