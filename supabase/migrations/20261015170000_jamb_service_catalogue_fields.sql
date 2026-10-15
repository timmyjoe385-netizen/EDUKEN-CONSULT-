-- Add editable service requirements and an independent availability flag.
-- is_published continues to control publication; is_available controls whether customers can request a service.
alter table public.services
  add column if not exists requirements text not null default '',
  add column if not exists is_available boolean not null default true,
  add column if not exists is_catalog_item boolean not null default false;

-- Public catalogue cards need these fields, while service writes remain admin-only.
grant select (requirements, is_available, is_catalog_item)
  on table public.services to anon, authenticated;
