import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { categoryLabel } from '../../lib/categoryLabel';
import AdminLayout from './Layout';

const PER_PAGE = 15;

/* ── Stat chip ── */
const Chip = ({ label, value, color = 'neutral' }) => {
  const colors = {
    neutral:  'bg-neutral-100 text-neutral-600',
    green:    'bg-emerald-100 text-emerald-700',
    amber:    'bg-amber-100 text-amber-700',
    red:      'bg-red-100 text-red-600',
    burgundy: 'bg-brand-burgundy/10 text-brand-burgundy',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors[color]}`}>
      {value !== undefined && <span className="font-bold">{value}</span>}
      {label}
    </span>
  );
};

/* ── User detail drawer ── */
const UserDrawer = ({ user, onClose, onToggleAdmin }) => {
  const [payments, setPayments]     = useState([]);
  const [contacts, setContacts]     = useState([]);
  const [loadingD, setLoadingD]     = useState(true);
  const [toggling, setToggling]     = useState(false);

  useEffect(() => {
    const load = async () => {
      const [payRes, conRes] = await Promise.all([
        supabase.from('payments')
          .select('id, amount, status, payment_method, created_at, listings(title, categories(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('contact_access')
          .select('id, accessed_at, listings(title, categories(name))')
          .eq('user_id', user.id)
          .order('accessed_at', { ascending: false })
          .limit(10),
      ]);
      setPayments(payRes.data || []);
      setContacts(conRes.data || []);
      setLoadingD(false);
    };
    load();
  }, [user.id]);

  const handleToggleAdmin = async () => {
    if (!window.confirm(user.is_admin
      ? `Remove admin from ${user.full_name || 'this user'}?`
      : `Grant admin to ${user.full_name || 'this user'}? They will have full access.`)) return;
    setToggling(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: !user.is_admin })
      .eq('id', user.id);
    setToggling(false);
    if (!error) onToggleAdmin(user.id, !user.is_admin);
  };

  const payStatusColor = { pending: 'amber', verified: 'green', rejected: 'red' };
  const initials = (user.full_name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = user.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
              style={{ backgroundColor: `hsl(${hue},35%,45%)` }}
            >
              {initials}
            </div>
            <div>
              <p className="font-bold text-neutral-900">{user.full_name || 'Unnamed User'}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Joined {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Identity */}
          <section>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Account Info</h3>
            <div className="bg-neutral-50 rounded-xl divide-y divide-neutral-100">
              {[
                { label: 'User ID',   value: <span className="font-mono text-xs break-all">{user.id}</span> },
                { label: 'Full Name', value: user.full_name || <span className="text-neutral-400">Not set</span> },
                { label: 'Phone',     value: user.phone    || <span className="text-neutral-400">Not set</span> },
                { label: 'Role',      value: user.is_admin
                    ? <Chip label="Admin" color="burgundy" />
                    : <Chip label="User" color="neutral" /> },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between px-4 py-3 gap-4">
                  <span className="text-xs text-neutral-500 flex-shrink-0 w-24">{row.label}</span>
                  <span className="text-xs text-neutral-900 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Summary stats */}
          <section>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Activity Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Payments',  value: user.pays.total,    color: 'neutral' },
                { label: 'Verified',  value: user.pays.verified, color: 'green'   },
                { label: 'Unlocked',  value: user.contactCount,  color: 'burgundy' },
              ].map(s => (
                <div key={s.label} className="bg-neutral-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment history */}
          <section>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Payment History</h3>
            {loadingD ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}</div>
            ) : payments.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">No payments yet</p>
            ) : (
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 truncate">{p.listings?.title || 'Listing'}</p>
                      <p className="text-[11px] text-neutral-400">{categoryLabel(p.listings?.categories)} · {p.payment_method} · {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-brand-burgundy">{p.amount} ETB</span>
                      <Chip label={p.status} color={payStatusColor[p.status] || 'neutral'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Unlocked contacts */}
          <section>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Unlocked Contacts</h3>
            {loadingD ? (
              <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}</div>
            ) : contacts.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">No unlocked contacts</p>
            ) : (
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">{c.listings?.title}</p>
                      <p className="text-[11px] text-neutral-400">{categoryLabel(c.listings?.categories)}</p>
                    </div>
                    <span className="text-[11px] text-neutral-400">{new Date(c.accessed_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Admin toggle */}
          <section className="border-t border-neutral-100 pt-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Admin Access</h3>
            <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {user.is_admin ? 'Admin privileges active' : 'No admin privileges'}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {user.is_admin ? 'Can access the admin panel and manage listings.' : 'Standard user account.'}
                </p>
              </div>
              <button
                onClick={handleToggleAdmin}
                disabled={toggling}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                  user.is_admin
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-brand-burgundy text-white hover:bg-brand-burgundy-dark'
                }`}
              >
                {toggling ? '…' : user.is_admin ? 'Remove Admin' : 'Make Admin'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const Users = () => {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all | admin | user
  const [page,     setPage]     = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const [profileRes, payRes, contactRes] = await Promise.all([
      supabase.from('user_profiles')
        .select('id, full_name, phone, is_admin, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('payments').select('user_id, status, amount'),
      supabase.from('contact_access').select('user_id'),
    ]);

    if (profileRes.error) { setError(profileRes.error.message); setLoading(false); return; }

    // Build maps
    const payMap = {};
    (payRes.data || []).forEach(p => {
      if (!payMap[p.user_id]) payMap[p.user_id] = { total: 0, verified: 0, totalAmount: 0 };
      payMap[p.user_id].total++;
      if (p.status === 'verified') { payMap[p.user_id].verified++; payMap[p.user_id].totalAmount += Number(p.amount || 0); }
    });

    const contactMap = {};
    (contactRes.data || []).forEach(c => {
      contactMap[c.user_id] = (contactMap[c.user_id] || 0) + 1;
    });

    setUsers((profileRes.data || []).map(u => ({
      ...u,
      pays: payMap[u.id] || { total: 0, verified: 0, totalAmount: 0 },
      contactCount: contactMap[u.id] || 0,
    })));
    setLoading(false);
  };

  const handleToggleAdmin = (userId, newVal) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: newVal } : u));
    if (selected?.id === userId) setSelected(prev => ({ ...prev, is_admin: newVal }));
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.full_name || '').toLowerCase().includes(q) || (u.phone || '').includes(q);
    const matchRole = roleFilter === 'all' || (roleFilter === 'admin' ? u.is_admin : !u.is_admin);
    return matchSearch && matchRole;
  });

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const adminCount = users.filter(u => u.is_admin).length;
  const activeCount = users.filter(u => u.pays.total > 0).length;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{users.length} registered accounts</p>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

        {/* Summary stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',     value: users.length,  icon: <svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
              { label: 'Admins',          value: adminCount,    icon: <svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
              { label: 'With Payments',   value: activeCount,   icon: <svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
              { label: 'Contacts Unlocked', value: users.reduce((a, u) => a + u.contactCount, 0), icon: <svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg> },
            ].map(s => (
              <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-burgundy/8 rounded-lg flex items-center justify-center flex-shrink-0">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                  <p className="text-[11px] text-neutral-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {[
              { key: 'all',   label: 'All' },
              { key: 'admin', label: 'Admins' },
              { key: 'user',  label: 'Users' },
            ].map(f => (
              <button key={f.key} onClick={() => { setRoleFilter(f.key); setPage(0); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${roleFilter === f.key ? 'bg-white text-brand-burgundy shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 skeleton rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton rounded w-1/3" />
                    <div className="h-3 skeleton rounded w-1/4" />
                  </div>
                  <div className="w-20 h-4 skeleton rounded" />
                  <div className="w-20 h-4 skeleton rounded" />
                </div>
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-neutral-700 mb-1">No users found</p>
              <p className="text-xs text-neutral-400">Users appear here after signing in with Google.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['User','Phone','Role','Payments','Unlocked','Joined',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paged.map(u => {
                    const initials = (u.full_name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    const hue = u.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
                    return (
                      <tr key={u.id}
                        onClick={() => setSelected(u)}
                        className="hover:bg-neutral-50 transition-colors cursor-pointer group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: `hsl(${hue},35%,45%)` }}
                            >{initials}</div>
                            <div>
                              <p className="font-semibold text-neutral-900 group-hover:text-brand-burgundy transition-colors">
                                {u.full_name || <span className="text-neutral-400 font-normal">Unnamed</span>}
                              </p>
                              <p className="text-[10px] text-neutral-400 font-mono">{u.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">{u.phone || '—'}</td>
                        <td className="px-4 py-3">
                          {u.is_admin
                            ? <Chip label="Admin" color="burgundy" />
                            : <Chip label="User"  color="neutral" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-neutral-900">{u.pays.total}</span>
                            {u.pays.verified > 0 && (
                              <Chip label={`${u.pays.verified} verified`} color="green" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {u.contactCount > 0
                            ? <Chip label={`${u.contactCount} listing${u.contactCount !== 1 ? 's' : ''}`} color="burgundy" />
                            : <span className="text-neutral-400 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3 text-neutral-400 text-xs whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <svg className="w-4 h-4 text-neutral-300 group-hover:text-brand-burgundy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 text-xs font-semibold border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-burgundy hover:text-brand-burgundy transition-all">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs font-semibold border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-burgundy hover:text-brand-burgundy transition-all">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <UserDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onToggleAdmin={handleToggleAdmin}
        />
      )}
    </AdminLayout>
  );
};

export default Users;
