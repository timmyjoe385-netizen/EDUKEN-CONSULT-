import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from './lib/api';

type Payment = {
  id: string;
  amount: number | string;
  currency?: string;
  status?: string;
  payment_reference?: string | null;
  created_at?: string | null;
  paid_at?: string | null;
  service_requests?: {
    reference_number?: string | null;
    customer_name?: string | null;
  } | null;
};

const formatAmount = (amount: number | string, currency = 'NGN') => {
  const value = typeof amount === 'string' && !amount.trim() ? NaN : Number(amount);
  if (!Number.isFinite(value)) return 'Amount unavailable';
  const formatted = value.toLocaleString('en-NG', { maximumFractionDigits: 2 });
  return currency.toUpperCase() === 'NGN' ? '₦' + formatted : currency.toUpperCase() + ' ' + formatted;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-NG');
};

export default function PaymentsAdmin() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get('/api/admin/payments');
      setItems(Array.isArray(result.data?.items) ? result.data.items : []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Payment records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  return (
    <section aria-labelledby="admin-payments-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h2 id="admin-payments-title" style={{ margin: 0 }}>Payment records</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--muted, #526158)' }}>Latest verified payment activity. Treat a record as confirmed only when its status is Paid.</p>
        </div>
        <button type="button" className="secondary" onClick={() => void loadPayments()} disabled={loading} aria-label="Refresh payment records">
          <RefreshCw size={15} aria-hidden="true" /> {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading ? <div className="admin-empty" role="status">Loading payment records…</div> : null}
      {!loading && error ? (
        <div className="analytics-error" role="alert">
          <b>Payments could not be loaded</b>
          <p>{error}</p>
          <button type="button" className="secondary" onClick={() => void loadPayments()}>Try again</button>
        </div>
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <div className="admin-empty">No payment records are available yet. Test-mode transactions will appear here after checkout starts.</div>
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <div className="admin-list">
          {items.map(item => {
            const status = String(item.status || 'Pending').trim() || 'Pending';
            const createdAt = formatDate(item.created_at);
            const paidAt = formatDate(item.paid_at);
            return (
              <article className="admin-item" key={item.id}>
                <div>
                  <span className="tag" aria-label={'Payment status: ' + status}>{status}</span>
                  <h3>{item.service_requests?.reference_number || 'Payment'} — {formatAmount(item.amount, item.currency || 'NGN')}</h3>
                  <p>Payment reference: {item.payment_reference || 'Not assigned'}.</p>
                  <small>
                    {item.service_requests?.customer_name || 'Student'}
                    {createdAt ? ' • Created ' + createdAt : ''}
                    {paidAt ? ' • Paid ' + paidAt : ''}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
