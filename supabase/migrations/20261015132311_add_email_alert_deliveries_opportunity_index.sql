-- Index the delivery foreign key used when looking up or deleting deliveries
-- for one opportunity. The existing unique index begins with subscription_id
-- and cannot efficiently serve opportunity_id-only lookups.
create index if not exists email_alert_deliveries_opportunity_id_idx
  on public.email_alert_deliveries (opportunity_id);
