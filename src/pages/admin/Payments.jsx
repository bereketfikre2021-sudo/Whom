import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from './Layout';

const StatusBadge = ({ status }) => {
  const m = {
    pending:  'bg-amber-100 text-amber-700 border-amber-200',
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-600 border-red-200',
  };
  const l = { pending: 'Pending', verified: 'Verified', rejected: 'Rejected' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${m[status] || m.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'verified' ? 'bg-emerald-500' : status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
      {l[status] || status}
    </span>
  );
};

/* Receipt preview modal */
const ReceiptModal = ({ url, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
    <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-semibold">
        Close ×
      </button>
      <img src={url} alt="Payment receipt" className="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain" />
    </div>
  </div>
);

/* Reject reason modal */
const RejectModal = ({ onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-neutral-900 mb-1">Reject Payment</h3>
        <p className="text-sm text-neutral-500 mb-4">Optionally provide a reason. The user will see it in their account.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for rejection (optional)…"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy resize-none h-24 transition-all mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={loading}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Payments = () => {
  const [payments,    setPayments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [filter,      setFilter]      = useState('all');
  const [search,      setSearch]      = useState('');
  const [receipt,     setReceipt]     = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // paymentId
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, listing_id, user_id, amount, receipt_image,
        payment_method, status, admin_notes, created_at, verified_at,
        listings(id, title, is_demo, categories(name))
      `)
      .order('created_at', { ascending: false });

    if (error) { setError(error.message); setLoading(false); return; }

    // fetch user names separately
    const userIds = [...new Set((data || []).map(p => p.user_id).filter(Boolean))];
    let nameMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', userIds);
      (profiles || []).forEach(p => { nameMap[p.id] = p.full_name; });
    }

    setPayments((data || []).map(p => ({
      ...p,
      user_name: nameMap[p.user_id] || null,
    })));
    setLoading(false);
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this payment? This will unlock the contact details for the user.')) return;
    setActionLoading(id + '_approve');
    const { error } = await supabase.rpc('verify_payment', { p_payment_id: id, p_approved: true });
    setActionLoading('');
    if (error) { setError(error.message); return; }
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'verified' } : p));
  };

  const handleReject = async (id, reason) => {
    setActionLoading(id + '_reject');
    const { error } = await supabase.rpc('verify_payment', { p_payment_id: id, p_approved: false });
    setActionLoading('');
    setRejectModal(null);
    if (error) { setError(error.message); return; }
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected', admin_notes: reason } : p));
  };

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (p.listings?.title || '').toLowerCase().includes(q) ||
      (p.user_name || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = payments.reduce((a, p) => ({ ...a, [p.status]: (a[p.status] || 0) + 1 }), {});

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Payments</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Review and verify contact-access payment submissions</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4">×</button>
          </div>
        )}

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all',      label: 'All',      count: payments.length },
            { key: 'pending',  label: 'Pending',  count: counts.pending  || 0 },
            { key: 'verified', label: 'Verified', count: counts.verified || 0 },
            { key: 'rejected', label: 'Rejected', count: counts.rejected || 0 },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f.key
                  ? 'bg-brand-burgundy text-white border-brand-burgundy'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-burgundy hover:text-brand-burgundy'
              }`}>
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f.key ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                {f.count}
              </span>
            </button>
          ))}

          {/* Search */}
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton rounded" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-neutral-700 mb-1">No payments found</p>
              <p className="text-xs text-neutral-400">Payments will appear here when users submit them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['Listing', 'User', 'Amount', 'Method', 'Submitted', 'Status', 'Receipt', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map(p => (
                    <tr key={p.id} className={`hover:bg-neutral-50 transition-colors ${p.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-neutral-900 max-w-[160px] truncate">{p.listings?.title || '—'}</p>
                        <p className="text-[11px] text-neutral-400">{p.listings?.categories?.name}</p>
                        {p.listings?.is_demo && (
                          <span className="text-[10px] font-bold text-orange-500">DEMO</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">{p.user_name || 'Unknown'}</p>
                        <p className="text-[11px] text-neutral-400 font-mono">{p.user_id?.slice(0, 10)}…</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-brand-burgundy whitespace-nowrap">{p.amount} ETB</td>
                      <td className="px-4 py-3 capitalize text-neutral-600">{p.payment_method}</td>
                      <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">
                        {new Date(p.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}<br />
                        <span className="text-neutral-400">{new Date(p.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        {p.receipt_image ? (
                          <button onClick={() => setReceipt(p.receipt_image)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-burgundy bg-brand-burgundy/8 rounded-lg hover:bg-brand-burgundy hover:text-white transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'pending' && !p.listings?.is_demo ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={actionLoading === p.id + '_approve'}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === p.id + '_approve' ? (
                                <div className="w-3 h-3 border-b-2 border-white rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModal(p.id)}
                              disabled={actionLoading === p.id + '_reject'}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        ) : p.listings?.is_demo && p.status === 'pending' ? (
                          <span className="text-[11px] text-orange-500 font-semibold">Demo — blocked</span>
                        ) : (
                          <span className="text-xs text-neutral-400 capitalize">{p.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {receipt && <ReceiptModal url={receipt} onClose={() => setReceipt(null)} />}
      {rejectModal && (
        <RejectModal
          loading={actionLoading === rejectModal + '_reject'}
          onClose={() => setRejectModal(null)}
          onConfirm={(reason) => handleReject(rejectModal, reason)}
        />
      )}
    </AdminLayout>
  );
};

export default Payments;
