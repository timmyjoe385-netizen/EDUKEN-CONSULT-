-- Preserve compatibility with deposits credited before provider-specific ledger keys
-- were introduced. Older Flutterwave test settlements may have used the legacy Paystack
-- prefix; recognizing that ledger row must never credit the same payment a second time.
create or replace function public.settle_customer_wallet_deposit(
  p_payment_id uuid,
  p_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_payment public.payments%rowtype;
  v_wallet public.customer_wallets%rowtype;
  v_existing public.wallet_transactions%rowtype;
  v_provider_prefix text;
  v_provider_label text;
begin
  select * into v_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found
     or v_payment.payment_type <> 'wallet_deposit'
     or v_payment.user_id is null
     or v_payment.payment_reference is distinct from p_reference
     or v_payment.currency <> 'NGN'
     or v_payment.amount <= 0
     or v_payment.payment_provider not in ('paystack', 'flutterwave') then
    raise exception 'WALLET_DEPOSIT_INVALID';
  end if;

  v_provider_prefix := v_payment.payment_provider || ':';
  v_provider_label := case v_payment.payment_provider
    when 'flutterwave' then 'Flutterwave'
    else 'Paystack'
  end;

  select * into v_existing
  from public.wallet_transactions
  where user_id = v_payment.user_id
    and idempotency_key in (v_provider_prefix || p_reference, 'paystack:' || p_reference);

  if v_payment.status = 'Paid' then
    if not found and v_existing.id is null then
      raise exception 'WALLET_DEPOSIT_LEDGER_MISSING';
    end if;
    select * into v_wallet from public.customer_wallets where user_id = v_payment.user_id;
    if not found then raise exception 'WALLET_DEPOSIT_WALLET_MISSING'; end if;
    return jsonb_build_object('paid', true, 'balance', v_wallet.balance, 'reused', true);
  end if;

  if v_payment.status not in ('Pending', 'Failed') then
    raise exception 'WALLET_DEPOSIT_NOT_SETTLEABLE';
  end if;

  insert into public.customer_wallets (user_id)
  values (v_payment.user_id)
  on conflict (user_id) do nothing;

  select * into v_wallet
  from public.customer_wallets
  where user_id = v_payment.user_id
  for update;

  update public.customer_wallets
  set balance = balance + v_payment.amount, updated_at = now()
  where id = v_wallet.id
  returning * into v_wallet;

  update public.payments
  set status = 'Paid', paid_at = now()
  where id = v_payment.id;

  insert into public.wallet_transactions (
    wallet_id, user_id, transaction_type, amount, balance_after,
    idempotency_key, payment_id, description
  ) values (
    v_wallet.id, v_payment.user_id, 'deposit', v_payment.amount, v_wallet.balance,
    v_provider_prefix || p_reference, v_payment.id, 'Wallet deposit via ' || v_provider_label
  );

  return jsonb_build_object('paid', true, 'balance', v_wallet.balance, 'reused', false);
end;
$fn$;
