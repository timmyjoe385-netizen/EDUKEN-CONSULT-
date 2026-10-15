import { useEffect, useState } from 'react';
import { api } from './lib/api';

type Payment = {
  id: string;
  amount: number | string;
  currency?: string;
  status?: string;
  payment_reference?: string;
  created_at?: string;
  paid_at?: string | null;
  service_requests?: { reference_number?: string; customer_name?: string } | null;
};

export default function PaymentsAdmin() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void api.get('/api/admin/payments').then(result => {
      if (active) setItems(result.data.items || []);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'Could not load payments.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="admin-empty">Loading payments…</div>;
  if (error) return <div className="admin-empty">Payments could not be loaded: {error}</div>;
  if (!items.length) return <div className="admin-empty">No payments recorded yet. Test-mode transactions will appear here after checkout starts.</div>;

  return (
    <div className="admin-list">
      {items.map(item => (
        <article className="admin-item" key={item.id}>
          <div>
            <span className="tag">{item.status || 'Pending'}</span>
            <h3>{item.service_requests?.reference_number || 'Payment'} — ₦{Number(item.amount || 0).toLocaleString('en-NG')} {item.currency || 'NGN'}</h3>
            <p>Payment reference: {item.payment_reference || 'Not assigned'}.</p>
            <small>{item.service_requests?.customer_name || 'Student'} • {item.created_at ? new Date(item.created_at).toLocaleString() : ''}{item.paid_at ? ' • Paid ' + new Date(item.paid_at).toLocaleString() : ''}</small>
          </div>
        </article>
      ))}
    </div>
  );
}
