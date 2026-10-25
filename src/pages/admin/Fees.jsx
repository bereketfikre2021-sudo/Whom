import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from './Layout';

const inp = 'w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all';

/* ── Logo upload button ── */
const LogoUpload = ({ value, onChange }) => {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const handle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Image only.'); return; }
    if (file.size > 2 * 1024 * 1024) { setErr('Max 2 MB.'); return; }
    setErr(''); setUploading(true);
    const path = `payment-logos/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('listing-images').upload(path, file, { upsert: true });
    if (error) { setErr('Upload failed.'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path);
    onChange(publicUrl);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Preview */}
      <div className="w-10 h-10 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {value ? (
          <img src={value} alt="logo" className="w-full h-full object-contain p-1" />
        ) : (
          <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div>
        <button type="button" onClick={() => ref.current.click()} disabled={uploading}
          className="text-xs font-semibold text-brand-burgundy hover:underline disabled:opacity-50">
          {uploading ? 'Uploading…' : value ? 'Change logo' : 'Upload logo'}
        </button>
        {err && <p className="text-[11px] text-red-500 mt-0.5">{err}</p>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
};

/* ── Add / Edit modal ── */
const MethodModal = ({ method, onClose, onSaved }) => {
  const isEdit = !!method;
  const [name,    setName]    = useState(method?.name    || '');
  const [account, setAccount] = useState(method?.account || '');
  const [hint,    setHint]    = useState(method?.hint    || '');
  const [logo,    setLogo]    = useState(method?.logo    || '');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim())    { setErr('Name is required.');           return; }
    if (!account.trim()) { setErr('Account number is required.'); return; }
    setSaving(true); setErr('');

    // load current methods array from DB
    const { data: current } = await supabase
      .from('app_settings').select('value').eq('key', 'payment_methods_v2').single();

    const list = current?.value || [];
    let updated;
    const entry = { id: method?.id || Date.now().toString(), name: name.trim(), account: account.trim(), hint: hint.trim(), logo };

    if (isEdit) {
      updated = list.map(m => m.id === method.id ? entry : m);
    } else {
      updated = [...list, entry];
    }

    const { error } = await supabase.from('app_settings')
      .upsert({ key: 'payment_methods_v2', value: updated, updated_at: new Date().toISOString() });

    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSaved(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-900">{isEdit ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}

          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5">Method Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inp} placeholder="e.g. Telebirr, CBE Birr, Awash Bank" />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5">Account Number <span className="text-red-500">*</span></label>
            <input type="text" value={account} onChange={e => setAccount(e.target.value)} className={inp} placeholder="e.g. 0912 345 678 or 1000123456789" />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5">Instruction hint</label>
            <input type="text" value={hint} onChange={e => setHint(e.target.value)} className={inp} placeholder="e.g. Send to this Telebirr number" />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5">Bank / Method Logo</label>
            <LogoUpload value={logo} onChange={setLogo} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const Fees = () => {
  const [fees,       setFees]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [methods,    setMethods]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [modal,      setModal]      = useState(null); // null | 'new' | methodObj

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [feesRes, catsRes, methodsRes] = await Promise.all([
      supabase.from('category_fees').select('*'),
      supabase.from('categories').select('*').order('name'),
      supabase.from('app_settings').select('value').eq('key', 'payment_methods_v2').single(),
    ]);
    if (!feesRes.error)  setFees(feesRes.data || []);
    if (!catsRes.error)  setCategories(catsRes.data || []);
    if (!methodsRes.error && methodsRes.data?.value) setMethods(methodsRes.data.value);
    setLoading(false);
  };

  const handleFeeChange = (categoryId, value) =>
    setFees(fees.map(f => f.category_id === categoryId ? { ...f, fee_amount: value } : f));

  const handleSaveFees = async () => {
    setSaving(true); setError('');
    try {
      await Promise.all(fees.map(fee =>
        supabase.from('category_fees').update({ fee_amount: Number(fee.fee_amount) }).eq('category_id', fee.category_id)
      ));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save fees.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment method?')) return;
    const updated = methods.filter(m => m.id !== id);
    const { error } = await supabase.from('app_settings')
      .upsert({ key: 'payment_methods_v2', value: updated, updated_at: new Date().toISOString() });
    if (error) { setError(error.message); return; }
    setMethods(updated);
  };

  const getCategoryLabel = (cat) => ({
    'construction-workers': 'Construction Workers',
    'houses-for-rent':      'Houses for Rent',
    'tutors':               'Tutors',
  }[cat.slug] || cat.name);

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-burgundy" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Fees & Payment</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Set contact-access fees and manage payment methods</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="ml-4 font-bold text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {/* ── Contact-access fees ── */}
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Contact-Access Fees</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Amount users pay to unlock contact details. Applies to new submissions only.</p>
          </div>
          <div className="p-6 space-y-3">
            {categories.map(cat => {
              const fee = fees.find(f => f.category_id === cat.id);
              return (
                <div key={cat.id} className="flex items-center justify-between gap-4 bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{getCategoryLabel(cat)}</p>
                    <p className="text-xs text-neutral-400">/{cat.slug}</p>
                  </div>
                  <div className="relative w-40 flex-shrink-0">
                    <input
                      type="number"
                      value={fee?.fee_amount || ''}
                      onChange={e => handleFeeChange(cat.id, e.target.value)}
                      className={inp + ' pr-12 text-right'}
                      placeholder="0" min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-semibold pointer-events-none">ETB</span>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-2">
              <p className={`text-sm font-medium transition-opacity ${saved ? 'text-emerald-600 opacity-100' : 'opacity-0'}`}>Fees saved.</p>
              <button onClick={handleSaveFees} disabled={saving}
                className="px-5 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? <><div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />Saving…</> : 'Save Fees'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Payment Methods CRUD ── */}
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Payment Methods</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Account numbers shown to users when they pay. Add your bank/mobile-money accounts.</p>
            </div>
            <button onClick={() => setModal('new')}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-burgundy text-white rounded-lg text-xs font-bold hover:bg-brand-burgundy-dark transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Method
            </button>
          </div>

          {methods.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-neutral-600 mb-1">No payment methods yet</p>
              <p className="text-xs text-neutral-400 mb-4">Add at least one so users can make payments.</p>
              <button onClick={() => setModal('new')}
                className="px-4 py-2 bg-brand-burgundy text-white rounded-lg text-xs font-bold hover:bg-brand-burgundy-dark transition-colors">
                Add First Method
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {methods.map(m => (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {m.logo ? (
                      <img src={m.logo} alt={m.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900">{m.name}</p>
                    <p className="text-sm text-brand-burgundy font-mono font-semibold mt-0.5">{m.account}</p>
                    {m.hint && <p className="text-xs text-neutral-400 mt-0.5">{m.hint}</p>}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setModal(m)}
                      className="p-2 text-neutral-400 hover:text-brand-burgundy hover:bg-neutral-100 rounded-lg transition-all" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(m.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {modal && (
        <MethodModal
          method={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={(updated) => { setMethods(updated); setModal(null); }}
        />
      )}
    </AdminLayout>
  );
};

export default Fees;
