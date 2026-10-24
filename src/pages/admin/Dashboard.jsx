import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    publishedListings: 0,
    pendingListings: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [listingsCount, publishedCount, pendingCount, pendingPaymentsCount, verifiedPaymentsCount] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
      ]);

      setStats({
        totalListings: listingsCount.count || 0,
        publishedListings: publishedCount.count || 0,
        pendingListings: pendingCount.count || 0,
        pendingPayments: pendingPaymentsCount.count || 0,
        verifiedPayments: verifiedPaymentsCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-600">Overview of your marketplace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-1">Total Listings</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.totalListings}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-1">Published Listings</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.publishedListings}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-1">Pending Listings</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.pendingListings}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-1">Pending Payments</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.pendingPayments}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-1">Verified Payments</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.verifiedPayments}</p>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {stats.pendingPayments > 0 && (
        <div className="bg-brand-burgundy rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {stats.pendingPayments} Pending Payment{stats.pendingPayments !== 1 ? 's' : ''}
                </h3>
                <p className="text-neutral-200 text-sm">
                  Review and verify pending payments to unlock contact access.
                </p>
              </div>
            </div>
            <Link
              to="/admin/payments"
              className="px-6 py-3 bg-white text-brand-burgundy rounded-xl font-semibold hover:bg-neutral-100 transition-all"
            >
              Review Payments
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/listings"
            className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-neutral-200 transition-colors">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Add Listing</h3>
            <p className="text-sm text-neutral-600">Create a new listing for any category.</p>
          </Link>

          <Link
            to="/admin/payments"
            className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-neutral-200 transition-colors">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Review Payments</h3>
            <p className="text-sm text-neutral-600">Verify pending payment receipts.</p>
          </Link>

          <Link
            to="/admin/fees"
            className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-neutral-200 transition-colors">
              <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Category Fees</h3>
            <p className="text-sm text-neutral-600">Manage contact-access fees by category.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
