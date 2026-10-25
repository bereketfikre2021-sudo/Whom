import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { categoryLabel } from '../../lib/categoryLabel';
import AdminLayout from './Layout';

const StatCard = ({ label, value, icon, loading }) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
        {loading ? (
          <div className="h-8 w-16 skeleton rounded" />
        ) : (
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
        )}
      </div>
      <div className="w-10 h-10 bg-brand-burgundy/8 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        totalListings,
        activeListings,
        totalUsers,
        pendingPayments,
        verifiedPayments,
        rejectedPayments,
        categoryListings,
        recent,
        recentPay,
      ] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('listings').select('id, categories(slug)', { count: 'exact' }),
        supabase.from('listings').select('id, title, status, created_at, categories(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('payments').select('id, amount, status, created_at, payment_method, listing_id, user_id, listings(title)').order('created_at', { ascending: false }).limit(5),
      ]);

      // group by category
      const catCounts = {};
      (categoryListings.data || []).forEach((l) => {
        const slug = l.categories?.slug || 'other';
        catCounts[slug] = (catCounts[slug] || 0) + 1;
      });

      setStats({
        totalListings: totalListings.count || 0,
        activeListings: activeListings.count || 0,
        totalUsers: totalUsers.count || 0,
        pendingPayments: pendingPayments.count || 0,
        verifiedPayments: verifiedPayments.count || 0,
        rejectedPayments: rejectedPayments.count || 0,
        byCat: catCounts,
      });
      setRecentListings(recent.data || []);
      setRecentPayments(recentPay.data || []);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s) => {
    const m = { active: 'bg-emerald-100 text-emerald-700', inactive: 'bg-neutral-100 text-neutral-600', pending: 'bg-amber-100 text-amber-700', verified: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-600' };
    const l = { active: 'Published', inactive: 'Unpublished', pending: 'Pending', verified: 'Verified', rejected: 'Rejected' };
    return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${m[s] || m.inactive}`}>{l[s] || s}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Live overview of your marketplace</p>
        </div>

        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        {/* Main stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Listings" value={stats?.totalListings} loading={loading}
            icon={<svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
          <StatCard label="Published" value={stats?.activeListings} loading={loading}
            icon={<svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
          <StatCard label="Users" value={stats?.totalUsers} loading={loading}
            icon={<svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
          <StatCard label="Pending Pay." value={stats?.pendingPayments} loading={loading}
            icon={<svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Verified Pay." value={stats?.verifiedPayments} loading={loading}
            icon={<svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Rejected Pay." value={stats?.rejectedPayments} loading={loading}
            icon={<svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        {/* By category */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Listings by Category</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { slug: 'construction-workers', label: 'Construction Workers' },
              { slug: 'tutors', label: 'Tutors' },
              { slug: 'houses-for-rent', label: 'Houses for Rent' },
            ].map((c) => (
              <div key={c.slug} className="text-center p-4 bg-neutral-50 rounded-xl">
                {loading ? <div className="h-7 w-10 skeleton rounded mx-auto mb-1" /> : (
                  <p className="text-2xl font-bold text-brand-burgundy">{stats?.byCat[c.slug] || 0}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending payments alert */}
        {!loading && stats?.pendingPayments > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-amber-800">
                {stats.pendingPayments} pending payment{stats.pendingPayments !== 1 ? 's' : ''} need review
              </p>
            </div>
            <Link to="/admin/payments" className="px-4 py-2 bg-brand-burgundy text-white rounded-lg text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors">
              Review Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent listings */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Recent Listings</h3>
              <Link to="/admin/listings" className="text-xs font-semibold text-brand-burgundy hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 skeleton rounded" />)}</div>
            ) : recentListings.length === 0 ? (
              <p className="text-center text-neutral-400 text-sm py-8">No listings yet</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentListings.map((l) => (
                  <div key={l.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{l.title}</p>
                      <p className="text-xs text-neutral-400">{categoryLabel(l.categories)} · {new Date(l.created_at).toLocaleDateString()}</p>
                    </div>
                    {statusBadge(l.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent payments */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Recent Payments</h3>
              <Link to="/admin/payments" className="text-xs font-semibold text-brand-burgundy hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 skeleton rounded" />)}</div>
            ) : recentPayments.length === 0 ? (
              <p className="text-center text-neutral-400 text-sm py-8">No payments yet</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{p.listings?.title}</p>
                      <p className="text-xs text-neutral-400">{p.amount} ETB</p>
                    </div>
                    {statusBadge(p.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/admin/listings', label: 'Manage Listings', desc: 'Add, edit, publish listings' },
            { to: '/admin/users',    label: 'View Users',      desc: 'Browse registered accounts' },
            { to: '/admin/fees',     label: 'Manage Fees',     desc: 'Set contact-access fees' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-brand-burgundy/30 hover:shadow-sm transition-all group">
              <p className="text-sm font-bold text-neutral-900 group-hover:text-brand-burgundy transition-colors">{a.label}</p>
              <p className="text-xs text-neutral-500 mt-1">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
