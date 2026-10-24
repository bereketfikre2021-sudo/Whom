import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [unlockedListings, setUnlockedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'payments') {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            id,
            listing_id,
            amount,
            status,
            created_at,
            listings (title, categories (name))
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error) setPayments(data);
      } else if (activeTab === 'unlocked') {
        const { data, error } = await supabase
          .from('contact_access')
          .select(`
            id,
            accessed_at,
            listings (
              id,
              title,
              price,
              location,
              categories (name)
            )
          `)
          .eq('user_id', user.id)
          .order('accessed_at', { ascending: false });

        if (!error) setUnlockedListings(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Account</h1>
        <p className="text-neutral-600">Manage your account and payment history</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200">
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'payments'
                ? 'text-brand-burgundy border-b-2 border-brand-burgundy bg-neutral-100'
                : 'text-neutral-600 hover:text-brand-burgundy'
            }`}
          >
            My Payments
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'unlocked'
                ? 'text-brand-burgundy border-b-2 border-brand-burgundy bg-neutral-100'
                : 'text-neutral-600 hover:text-brand-burgundy'
            }`}
          >
            Unlocked Listings
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-burgundy"></div>
            </div>
          ) : activeTab === 'payments' ? (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Payment History</h2>
              <p className="text-neutral-600 mb-6">
                Review your contact-access payments and their verification status.
              </p>

              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No payments yet</h3>
                  <p className="text-neutral-600">Payments will appear here after you submit them.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-neutral-100 rounded-xl p-6 border border-neutral-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-900 mb-1">
                            {payment.listings?.title}
                          </p>
                          <p className="text-sm text-neutral-600 mb-2">
                            {payment.listings?.categories?.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-neutral-500">
                            <span>Amount: {payment.amount} ETB</span>
                            <span>
                              Submitted: {new Date(payment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">My Unlocked Listings</h2>
              <p className="text-neutral-600 mb-6">
                View listings whose contact details you have successfully unlocked.
              </p>

              {unlockedListings.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No unlocked listings yet</h3>
                  <p className="text-neutral-600">
                    Unlocked listings will appear here after your payments are verified.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {unlockedListings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-md p-6 border border-neutral-200"
                    >
                      <div className="mb-4">
                        <span className="text-xs font-medium text-brand-burgundy bg-neutral-100 px-2 py-1 rounded-full">
                          {item.listings?.categories?.name}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        {item.listings?.title}
                      </h3>
                      <div className="flex justify-between items-center text-sm text-neutral-600 mb-4">
                        <span>{item.listings?.price}</span>
                        <span>{item.listings?.location}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mb-4">
                        Unlocked: {new Date(item.accessed_at).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/listing/${item.listings?.id}`}
                        className="block w-full px-4 py-2 bg-neutral-100 text-brand-burgundy rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all text-center"
                      >
                        View Contact Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSignOut}
          className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Account;
