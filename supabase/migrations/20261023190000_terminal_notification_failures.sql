-- Record permanent provider rejections explicitly so scheduled retries do not
-- repeatedly hit a non-retryable recipient/domain restriction.
alter table public.payment_notification_deliveries
  drop constraint if exists payment_notification_deliveries_status_check;

alter table public.payment_notification_deliveries
  add constraint payment_notification_deliveries_status_check
  check (status in ('pending', 'delivered', 'failed'));
