-- JAMB catalogue metadata. Availability is separate from publication so an
-- admin can keep a service listed while temporarily preventing new requests.
alter table public.services
  add column if not exists requirements text not null default '',
  add column if not exists is_available boolean not null default true,
  add column if not exists is_catalog_item boolean not null default false;

-- Public catalogue cards display these fields; admin writes continue through
-- the authenticated API and existing authorization checks.
grant select (requirements, is_available, is_catalog_item)
  on table public.services to anon, authenticated;
