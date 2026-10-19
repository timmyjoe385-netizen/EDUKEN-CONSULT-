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

rollback;
