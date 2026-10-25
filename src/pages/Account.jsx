import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { categoryLabel } from '../lib/categoryLabel';

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: 'bg-amber-50 border-amber-200 text-amber-700',  label: 'Pending Review' },
    verified: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Verified' },
    rejected: { bg: 'bg-red-50 border-red-200 text-red-600',        label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'verified' ? 'bg-emerald-500' :
        status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
      }`} />
      {s.label}
    </span>
  );
};

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl">
    <div className="w-10 h-10 skeleton rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 skeleton rounded w-1/2" />
      <div className="h-3 skeleton rounded w-1/3" />
    </div>
    <div className="w-20 h-6 skeleton rounded-full" />
  </div>
);

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile]   = useState(null);
  const [payments, setPayments] = useState([]);
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  /* profile edit state */
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadProfile(), loadPayments(), loadUnlocked()]);
    setLoading(false);
  };

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('full_name, phone, is_admin, created_at')
      .eq('id', user.id)
      .single();
    if (data) {
      setProfile(data);
      setFullName(data.full_name || user.user_metadata?.full_name || '');
      setPhone(data.phone || '');
    }
  };

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select('id, listing_id, amount, status, payment_method, created_at, listings(title, location, categories(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setPayments(data);
  };

  const loadUnlocked = async () => {
    const { data } = await supabase
      .from('contact_access')
      .select('id, accessed_at, listings(id, title, price, location, categories(name))')
      .eq('user_id', user.id)
      .order('accessed_at', { ascending: false });
    if (data) setUnlocked(data);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('id', user.id);
    setSaving(false);
    setSaveMsg(error ? 'Failed to save. Please try again.' : 'Profile updated.');
    if (!error) loadProfile();
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  const initials = (fullName || user.user_metadata?.full_name || user.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { key: 'profile',  label: 'Profile',          count: null },
    { key: 'payments', label: 'Payments',          count: payments.length || null },
    { key: 'unlocked', label: 'Unlocked Contacts', count: unlocked.length || null },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Account</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-brand-burgundy shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {tab.label}
            {tab.count ? (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-brand-burgundy/10 text-brand-burgundy' : 'bg-neutral-200 text-neutral-500'
              }`}>
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ══════════════ PROFILE TAB ══════════════ */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Avatar + identity card */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {/* Top banner */}
            <div className="h-20 bg-gradient-to-r from-brand-burgundy/80 to-brand-burgundy" />
            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <div className="w-20 h-20 rounded-2xl bg-brand-burgundy border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{initials}</span>
                </div>
                {profile?.is_admin && (
                  <span className="mb-1 px-3 py-1 bg-brand-burgundy text-white text-xs font-bold rounded-full">
                    Admin
                  </span>
                )}
              </div>

              <div className="mb-1">
                <h2 className="text-xl font-bold text-neutral-900">
                  {profile?.full_name || user.user_metadata?.full_name || 'Your Name'}
                </h2>
                <p className="text-sm text-neutral-500">{user.email}</p>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {payments.filter(p => p.status === 'verified').length} verified payments
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  {unlocked.length} contacts unlocked
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-5">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 9xx xxx xxxx"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-neutral-100 bg-neutral-50 rounded-xl text-sm text-neutral-400 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-400 mt-1">Email is managed by your Google account.</p>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                {saveMsg && (
                  <p className={`text-sm font-medium ${saveMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Account info cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Total Payments',
                value: payments.length,
                icon: (
                  <svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
              {
                label: 'Pending',
                value: payments.filter(p => p.status === 'pending').length,
                icon: (
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                label: 'Contacts Unlocked',
                value: unlocked.length,
                icon: (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-100 mx-auto mb-2">
                  {s.icon}
                </div>
                <div className="text-2xl font-bold text-neutral-900">{s.value}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ PAYMENTS TAB ══════════════ */}
      {activeTab === 'payments' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-900">Payment History</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Contact-access payments and their verification status.</p>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-neutral-700 mb-1">No payments yet</p>
              <p className="text-xs text-neutral-400 mb-5">When you submit a contact-unlock payment it will appear here.</p>
              <Link
                to="/category/construction-workers"
                className="px-4 py-2 bg-brand-burgundy text-white text-xs font-semibold rounded-lg hover:bg-brand-burgundy-dark transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {payments.map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    p.status === 'verified' ? 'bg-emerald-100' :
                    p.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {p.status === 'verified' ? (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : p.status === 'rejected' ? (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {p.listings?.title || 'Listing'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-neutral-400">{categoryLabel(p.listings?.categories)}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-xs text-neutral-400">{p.payment_method}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-xs text-neutral-400">{new Date(p.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {p.status === 'rejected' && (
                      <p className="text-xs text-red-500 mt-1">Payment was rejected. You may re-submit from the listing page.</p>
                    )}
                    {p.status === 'pending' && (
                      <p className="text-xs text-amber-600 mt-1">Awaiting admin review — usually within 24 hours.</p>
                    )}
                  </div>
                  {/* Right */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={p.status} />
                    <span className="text-sm font-bold text-neutral-900">{p.amount} ETB</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ UNLOCKED CONTACTS TAB ══════════════ */}
      {activeTab === 'unlocked' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-900">Unlocked Contacts</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Listings whose contact details you have access to.</p>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : unlocked.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-neutral-700 mb-1">No unlocked contacts yet</p>
              <p className="text-xs text-neutral-400 mb-5">Contacts appear here once your payment is verified by admin.</p>
              <Link
                to="/category/construction-workers"
                className="px-4 py-2 bg-brand-burgundy text-white text-xs font-semibold rounded-lg hover:bg-brand-burgundy-dark transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {unlocked.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {item.listings?.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-400">{categoryLabel(item.listings?.categories)}</span>
                      {item.listings?.location && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <span className="text-xs text-neutral-400">{item.listings?.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.listings?.price && (
                      <span className="text-sm font-bold text-brand-burgundy">{item.listings.price}</span>
                    )}
                    <Link
                      to={`/listing/${item.listings?.id}`}
                      className="px-3 py-1.5 bg-brand-burgundy text-white text-xs font-semibold rounded-lg hover:bg-brand-burgundy-dark transition-colors"
                    >
                      View Contact
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Account;
