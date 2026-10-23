-- Disposable PostgreSQL smoke test for the durable payment notification outbox.
-- Never run this file against production.
begin;

insert into public.payment_notification_deliveries
  (payment_reference, notification_kind, recipient_role, recipient_email, idempotency_key, subject, text_body)
values
  ('outbox-smoke-reference', 'service_payment', 'customer', 'customer@example.test',
   'outbox-smoke-idempotency-key', 'EDUKEN payment confirmed', 'Test body')
on conflict (idempotency_key) do nothing;

do $test$
begin
  if (select count(*) from public.payment_notification_deliveries
      where idempotency_key = 'outbox-smoke-idempotency-key') <> 1 then
    raise exception 'outbox idempotency key did not produce exactly one row';
  end if;
end;
$test$;

update public.payment_notification_deliveries
set status = 'delivered', provider_message_id = 'test-provider-message',
    delivered_at = now(), updated_at = now()
where idempotency_key = 'outbox-smoke-idempotency-key';

-- A repeated enqueue uses DO NOTHING semantics and must not reset delivered state.
insert into public.payment_notification_deliveries
  (payment_reference, notification_kind, recipient_role, recipient_email, idempotency_key, subject, text_body)
values
  ('outbox-smoke-reference', 'service_payment', 'customer', 'customer@example.test',
   'outbox-smoke-idempotency-key', 'EDUKEN payment confirmed', 'Test body')
on conflict (idempotency_key) do nothing;

do $test$
begin
  if (select count(*) from public.payment_notification_deliveries
      where idempotency_key = 'outbox-smoke-idempotency-key' and status = 'delivered') <> 1 then
    raise exception 're-enqueue changed delivered state or duplicated the notification';
  end if;
  if not exists (
    select 1 from pg_class
    where oid = 'public.payment_notification_deliveries'::regclass and relrowsecurity
  ) then
    raise exception 'outbox row-level security is not enabled';
  end if;
end;
$test$;

-- Permanent provider rejections are terminal and are excluded from pending retries.
insert into public.payment_notification_deliveries
  (payment_reference, notification_kind, recipient_role, recipient_email, idempotency_key, subject, text_body, status, last_error)
values
  ('outbox-failed-reference', 'service_payment', 'admin', 'admin@example.test',
   'outbox-failed-idempotency-key', 'EDUKEN payment alert', 'Test body', 'failed', 'HTTP 403');
do $test$
begin
  if exists (select 1 from public.payment_notification_deliveries
             where idempotency_key = 'outbox-failed-idempotency-key' and status = 'pending') then
    raise exception 'permanent provider rejection was left in automatic retry queue';
  end if;
end;
$test$;

-- Model two workers that both read attempt_count=0. The first compare-and-swap
-- claims the attempt; the stale second worker must affect zero rows.
insert into public.payment_notification_deliveries
  (payment_reference, notification_kind, recipient_role, recipient_email, idempotency_key, subject, text_body)
values
  ('outbox-cas-reference', 'service_payment', 'customer', 'cas@example.test',
   'outbox-cas-idempotency-key', 'EDUKEN payment confirmed', 'Test body')
on conflict (idempotency_key) do nothing;

do $test$
declare
  first_claim integer;
  stale_claim integer;
begin
  update public.payment_notification_deliveries
  set attempt_count = 1
  where idempotency_key = 'outbox-cas-idempotency-key'
    and status = 'pending' and attempt_count = 0;
  get diagnostics first_claim = row_count;

  update public.payment_notification_deliveries
  set attempt_count = 1
  where idempotency_key = 'outbox-cas-idempotency-key'
    and status = 'pending' and attempt_count = 0;
  get diagnostics stale_claim = row_count;

  if first_claim <> 1 or stale_claim <> 0 then
    raise exception 'compare-and-swap retry claim did not reject a stale worker';
  end if;
end;
$test$;

rollback;
