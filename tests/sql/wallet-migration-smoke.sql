-- Integration smoke test for wallet creation, deposit idempotency, atomic spending, refunds, and FK indexes.
do $test$
declare
  v_user uuid := '11111111-1111-4111-8111-111111111111';
  v_new_user uuid := '22222222-2222-4222-8222-222222222222';
  v_service uuid := '33333333-3333-4333-8333-333333333333';
  v_request uuid := '44444444-4444-4444-8444-444444444444';
  v_expensive_request uuid := '55555555-5555-4555-8555-555555555555';
  v_deposit_id uuid;
  v_wallet_payment_id uuid;
  v_balance numeric(12,2);
  v_count integer;
  v_result jsonb;
  v_flutterwave_deposit_id uuid;
begin
  if to_regclass('public.service_requests_service_id_idx') is null
     or to_regclass('public.service_requests_user_id_idx') is null
     or to_regclass('public.wallet_transactions_service_request_id_idx') is null
     or to_regclass('public.wallet_transactions_wallet_id_idx') is null then
    raise exception 'WALLET_FOREIGN_KEY_INDEXES_MISSING';
  end if;

  if not exists (select 1 from public.customer_wallets where user_id = v_user and balance = 0) then
    raise exception 'EXISTING_USER_WALLET_BACKFILL_FAILED';
  end if;

  if not has_table_privilege('service_role', 'public.customer_wallets', 'SELECT')
     or not has_table_privilege('service_role', 'public.wallet_transactions', 'SELECT') then
    raise exception 'WALLET_SERVER_READ_PRIVILEGES_MISSING';
  end if;
  if has_table_privilege('service_role', 'public.customer_wallets', 'INSERT')
     or has_table_privilege('service_role', 'public.customer_wallets', 'UPDATE')
     or has_table_privilege('service_role', 'public.customer_wallets', 'DELETE')
     or has_table_privilege('service_role', 'public.wallet_transactions', 'INSERT')
     or has_table_privilege('service_role', 'public.wallet_transactions', 'UPDATE')
     or has_table_privilege('service_role', 'public.wallet_transactions', 'DELETE')
     or has_table_privilege('anon', 'public.customer_wallets', 'SELECT')
     or has_table_privilege('anon', 'public.wallet_transactions', 'SELECT')
     or has_table_privilege('authenticated', 'public.customer_wallets', 'SELECT')
     or has_table_privilege('authenticated', 'public.wallet_transactions', 'SELECT') then
    raise exception 'WALLET_TABLE_PRIVILEGES_TOO_BROAD';
  end if;

  insert into auth.users (id, email) values (v_new_user, 'new-customer@example.test');
  if not exists (select 1 from public.customer_wallets where user_id = v_new_user and balance = 0) then
    raise exception 'NEW_USER_WALLET_TRIGGER_FAILED';
  end if;

  -- Flutterwave wallet deposits must use provider-specific ledger keys and labels,
  -- and a repeated settlement must not credit the wallet twice.
  insert into public.payments (user_id, amount, currency, status, payment_reference, payment_type, payment_provider)
  values (v_new_user, 250, 'NGN', 'Pending', 'EDK-PAY-FFFFFFFFFFFFFFFFFF', 'wallet_deposit', 'flutterwave')
  returning id into v_flutterwave_deposit_id;

  v_result := public.settle_customer_wallet_deposit(v_flutterwave_deposit_id, 'EDK-PAY-FFFFFFFFFFFFFFFFFF');
  v_result := public.settle_customer_wallet_deposit(v_flutterwave_deposit_id, 'EDK-PAY-FFFFFFFFFFFFFFFFFF');

  select balance into v_balance from public.customer_wallets where user_id = v_new_user;
  select count(*) into v_count from public.wallet_transactions
    where user_id = v_new_user and payment_id = v_flutterwave_deposit_id
      and idempotency_key = 'flutterwave:EDK-PAY-FFFFFFFFFFFFFFFFFF'
      and description = 'Wallet deposit via Flutterwave';
  if v_balance <> 250 or v_count <> 1 then
    raise exception 'FLUTTERWAVE_WALLET_DEPOSIT_IDEMPOTENCY_OR_LABEL_FAILED: balance %, ledger rows %', v_balance, v_count;
  end if;

  insert into public.services (id, name, price, is_published, is_available, is_catalog_item)
  values (v_service, 'Test JAMB service', 400, true, true, true);

  insert into public.service_requests (id, user_id, service_id, quantity, status)
  values
    (v_request, v_user, v_service, 1, 'New Requests'),
    (v_expensive_request, v_user, v_service, 2, 'New Requests');

  insert into public.payments (user_id, amount, currency, status, payment_reference, payment_type)
  values (v_user, 1000, 'NGN', 'Pending', 'EDK-PAY-AAAAAAAAAAAAAAAAAA', 'wallet_deposit')
  returning id into v_deposit_id;

  v_result := public.settle_customer_wallet_deposit(v_deposit_id, 'EDK-PAY-AAAAAAAAAAAAAAAAAA');
  v_result := public.settle_customer_wallet_deposit(v_deposit_id, 'EDK-PAY-AAAAAAAAAAAAAAAAAA');
  select balance into v_balance from public.customer_wallets where user_id = v_user;
  select count(*) into v_count from public.wallet_transactions where user_id = v_user and transaction_type = 'deposit';
  if v_balance <> 1000 or v_count <> 1 then
    raise exception 'WALLET_DEPOSIT_IDEMPOTENCY_FAILED: balance %, deposit ledger count %', v_balance, v_count;
  end if;

  v_result := public.pay_service_from_customer_wallet(
    v_user, v_request, 'wallet-service:44444444-4444-4444-8444-444444444444', 'EDK-WAL-BBBBBBBBBBBBBBBBBB'
  );
  v_result := public.pay_service_from_customer_wallet(
    v_user, v_request, 'wallet-service:44444444-4444-4444-8444-444444444444', 'EDK-WAL-CCCCCCCCCCCCCCCCCC'
  );
  select balance into v_balance from public.customer_wallets where user_id = v_user;
  select count(*) into v_count from public.payments where user_id = v_user and payment_type = 'wallet_service';
  if v_balance <> 600 or v_count <> 1 then
    raise exception 'WALLET_SERVICE_PAYMENT_IDEMPOTENCY_FAILED: balance %, payment count %', v_balance, v_count;
  end if;
  if (select status from public.service_requests where id = v_request) <> 'Paid' then
    raise exception 'WALLET_SERVICE_REQUEST_NOT_MARKED_PAID';
  end if;
  select id into v_wallet_payment_id from public.payments where payment_reference = 'EDK-WAL-BBBBBBBBBBBBBBBBBB';

  begin
    perform public.pay_service_from_customer_wallet(
      v_user, v_expensive_request, 'wallet-service:55555555-5555-4555-8555-555555555555', 'EDK-WAL-DDDDDDDDDDDDDDDDDD'
    );
    raise exception 'EXPECTED_INSUFFICIENT_FUNDS_NOT_RAISED';
  exception when raise_exception then
    if sqlerrm = 'EXPECTED_INSUFFICIENT_FUNDS_NOT_RAISED' then raise; end if;
    if position('WALLET_INSUFFICIENT_FUNDS' in sqlerrm) = 0 then raise; end if;
  end;

  select balance into v_balance from public.customer_wallets where user_id = v_user;
  if v_balance <> 600 then raise exception 'INSUFFICIENT_FUNDS_CHANGED_BALANCE'; end if;

  v_result := public.refund_customer_wallet_service_payment(v_wallet_payment_id, 'Test refund reason');
  v_result := public.refund_customer_wallet_service_payment(v_wallet_payment_id, 'Test refund reason');
  select balance into v_balance from public.customer_wallets where user_id = v_user;
  select count(*) into v_count from public.wallet_transactions where user_id = v_user and transaction_type = 'refund';
  if v_balance <> 1000 or v_count <> 1 then
    raise exception 'WALLET_REFUND_IDEMPOTENCY_FAILED: balance %, refund ledger count %', v_balance, v_count;
  end if;
  if (select status from public.payments where id = v_wallet_payment_id) <> 'Refunded' then
    raise exception 'WALLET_REFUND_STATUS_NOT_RECORDED';
  end if;
  if (select status from public.service_requests where id = v_request) <> 'Cancelled' then
    raise exception 'WALLET_REFUND_SERVICE_REQUEST_NOT_CANCELLED';
  end if;
end;
$test$;
