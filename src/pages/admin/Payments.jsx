import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          id,
          listing_id,
          user_id,
          amount,
          receipt_url,
          payment_method,
          status,
          created_at,
          updated_at,
          listings (title, is_demo, categories (name)),
          user_profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Something went wrong. Please try again.');
      } else {
        setPayments(data);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!confirm('Are you sure you want to approve this payment?')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('verify_payment', {
        p_payment_id: paymentId,
        p_approved: true,
      });

      if (error) {
        setError('Failed to approve payment. Please try again.');
      } else {
        setPayments(
          payments.map((p) =>
            p.id === paymentId ? { ...p, status: 'verified' } : p
          )
        );
      }
    } catch (err) {
      setError('Failed to approve payment. Please try again.');
    }
  };

  const handleReject = async (paymentId) => {
    if (!confirm('Are you sure you want to reject this payment?')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('verify_payment', {
        p_payment_id: paymentId,
        p_approved: false,
      });

      if (error) {
        setError('Failed to reject payment. Please try again.');
      } else {
        setPayments(
          payments.map((p) =>
            p.id === paymentId ? { ...p, status: 'rejected' } : p
          )
        );
      }
    } catch (err) {
      setError('Failed to reject payment. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending Verification',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Payment Verification</h1>
        <p className="text-neutral-600">Review and verify contact-access payments</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-200">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-24 h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No payments yet</h3>
            <p className="text-neutral-600">Payments will appear here when users submit them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {payment.listings?.title}
                          {payment.listings?.is_demo && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Demo
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {payment.listings?.categories?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {payment.user_profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-neutral-500 font-mono text-xs">
                          {payment.user_id?.slice(0, 8)}…
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-brand-burgundy">
                        {payment.amount} ETB
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600 capitalize">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">
                        {new Date(payment.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {payment.receipt_url && (
                          <a
                            href={payment.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-neutral-500 hover:text-brand-burgundy transition-colors"
                            title="View Receipt"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                        )}
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(payment.id)}
                              disabled={payment.listings?.is_demo}
                              className="p-2 text-neutral-500 hover:text-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title={payment.listings?.is_demo ? 'Demo listings cannot be monetized' : 'Approve Payment'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(payment.id)}
                              disabled={payment.listings?.is_demo}
                              className="p-2 text-neutral-500 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title={payment.listings?.is_demo ? 'Demo listings cannot be monetized' : 'Reject Payment'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
