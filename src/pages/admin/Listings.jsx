import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminLayout from './Layout';

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const m = {
    active:   'bg-emerald-100 text-emerald-700',
    inactive: 'bg-neutral-100 text-neutral-600',
    verified: 'bg-emerald-100 text-emerald-700',
  };
  const l = { active: 'Published', inactive: 'Unpublished', verified: 'Published' };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${m[status] || m.inactive}`}>{l[status] || status}</span>;
};

/* ── Image upload field ── */
const ImageUpload = ({ value, onChange, label = 'Portrait Photo (3:4)' }) => {
  const [preview, setPreview] = useState(value || null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Image files only.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Max 5 MB.'); return; }
    setErr('');
    setUploading(true);
    const path = `listings/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file, { upsert: true });
    if (upErr) { setErr('Upload failed.'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path);
    setPreview(publicUrl);
    onChange(publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">{label}</label>
      {preview ? (
        <div className="relative inline-block">
          <div className="w-32 aspect-[3/4] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button type="button" onClick={() => { setPreview(null); onChange(''); }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
            ×
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current.click()}
          disabled={uploading}
          className="w-32 aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl text-neutral-400 hover:border-brand-burgundy hover:text-brand-burgundy transition-all text-xs gap-2 disabled:opacity-50">
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-burgundy" />
          ) : (
            <>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Photo
            </>
          )}
        </button>
      )}
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

/* ── Field ── */
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inp = 'w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all';

/* ── Listing Form Modal ── */
const ListingModal = ({ listing, categories, onClose, onSaved }) => {
  const isEdit = !!listing;
  const catSlug = isEdit ? listing.categories?.slug : null;

  const [cat, setCat] = useState(listing?.category_id || '');
  const [selectedCatSlug, setSelectedCatSlug] = useState(catSlug || '');
  const [form, setForm] = useState({
    title:       listing?.title || '',
    description: listing?.description || '',
    price:       listing?.price || '',
    location:    listing?.location || '',
    contact_info: listing?.contact_info || '',
    status:      listing?.status || 'inactive',
    is_demo:     listing?.is_demo || false,
    featured:    listing?.featured || false,
    metadata:    listing?.metadata || {},
    images:      listing?.images || [],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const [photo, setPhoto]   = useState(listing?.images?.[0] || '');

  const catObj = categories.find(c => c.id === cat);

  const handleCatChange = (id) => {
    setCat(id);
    const c = categories.find(x => x.id === id);
    setSelectedCatSlug(c?.slug || '');
  };

  const setMeta = (key, val) => setForm(f => ({ ...f, metadata: { ...f.metadata, [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cat) { setErr('Select a category.'); return; }
    if (!form.title.trim()) { setErr('Title is required.'); return; }
    if (!form.contact_info.trim()) { setErr('Phone number is required.'); return; }
    setSaving(true); setErr('');

    const payload = {
      category_id:  cat,
      title:        form.title.trim(),
      description:  form.description.trim(),
      price:        form.price.trim(),
      location:     form.location.trim(),
      contact_info: form.contact_info.trim(),
      status:       form.status,
      is_demo:      form.is_demo,
      featured:     form.featured,
      metadata:     form.metadata,
      images:       photo ? [photo] : [],
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('listings').update(payload).eq('id', listing.id));
    } else {
      ({ error } = await supabase.from('listings').insert(payload));
    }

    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">{isEdit ? 'Edit Listing' : 'New Listing'}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {err && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{err}</div>}

          {/* Category */}
          <Field label="Category" required>
            <select value={cat} onChange={e => handleCatChange(e.target.value)} className={inp} disabled={isEdit}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.slug})</option>)}
            </select>
          </Field>

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name / Title" required>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inp} placeholder="e.g. Abebe Kebede" />
            </Field>
            <Field label="Phone Number" required>
              <input type="tel" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} className={inp} placeholder="+251 9xx xxx xxxx" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label={selectedCatSlug === 'houses-for-rent' ? 'Monthly Rent (ETB)' : selectedCatSlug === 'tutors' ? 'Hourly Rate (ETB)' : 'Daily Rate (ETB)'}>
              <input type="text" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inp}
                placeholder={selectedCatSlug === 'houses-for-rent' ? 'e.g. ETB 8,000/month' : selectedCatSlug === 'tutors' ? 'e.g. ETB 200/hr' : 'e.g. ETB 500/day'} />
            </Field>
            <Field label="Location / Area">
              <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inp} placeholder="e.g. Bole, Addis Ababa" />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp + ' h-24 resize-none'} placeholder="Additional details…" />
          </Field>

          {/* Category-specific metadata */}
          {selectedCatSlug === 'construction-workers' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <Field label="Trade / Worker Type">
                <select value={form.metadata.worker_type || ''} onChange={e => setMeta('worker_type', e.target.value)} className={inp}>
                  <option value="">Select trade…</option>
                  {['General Laborer','Painter','Carpenter','Electrician','Plumber','Mason','Welder','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Experience">
                <input type="text" value={form.metadata.experience || ''} onChange={e => setMeta('experience', e.target.value)} className={inp} placeholder="e.g. 4 years" />
              </Field>
              <Field label="Age">
                <input type="number" value={form.metadata.age || ''} onChange={e => setMeta('age', e.target.value)} className={inp} placeholder="e.g. 28" />
              </Field>
              <Field label="Availability">
                <input type="text" value={form.metadata.availability || ''} onChange={e => setMeta('availability', e.target.value)} className={inp} placeholder="e.g. Weekdays" />
              </Field>
            </div>
          )}

          {selectedCatSlug === 'tutors' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <Field label="Subject(s)">
                <input type="text" value={form.metadata.subject || ''} onChange={e => setMeta('subject', e.target.value)} className={inp} placeholder="e.g. Mathematics" />
              </Field>
              <Field label="Experience">
                <input type="text" value={form.metadata.experience || ''} onChange={e => setMeta('experience', e.target.value)} className={inp} placeholder="e.g. 3 years" />
              </Field>
              <Field label="Age">
                <input type="number" value={form.metadata.age || ''} onChange={e => setMeta('age', e.target.value)} className={inp} placeholder="e.g. 25" />
              </Field>
              <Field label="Grade Level">
                <input type="text" value={form.metadata.grade_level || ''} onChange={e => setMeta('grade_level', e.target.value)} className={inp} placeholder="e.g. Grade 9-12" />
              </Field>
              <Field label="Qualifications">
                <input type="text" value={form.metadata.qualifications || ''} onChange={e => setMeta('qualifications', e.target.value)} className={inp} placeholder="e.g. BSc Mathematics" />
              </Field>
              <Field label="Teaching Style">
                <input type="text" value={form.metadata.teaching_arrangement || ''} onChange={e => setMeta('teaching_arrangement', e.target.value)} className={inp} placeholder="e.g. In-person / Online" />
              </Field>
            </div>
          )}

          {selectedCatSlug === 'houses-for-rent' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <Field label="Property Type">
                <select value={form.metadata.property_type || ''} onChange={e => setMeta('property_type', e.target.value)} className={inp}>
                  <option value="">Select…</option>
                  {['Apartment','House','Studio','Villa','Room'].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Bedrooms">
                <input type="number" value={form.metadata.bedrooms || ''} onChange={e => setMeta('bedrooms', parseInt(e.target.value))} className={inp} placeholder="e.g. 2" min="0" />
              </Field>
              <Field label="Bathrooms">
                <input type="number" value={form.metadata.bathrooms || ''} onChange={e => setMeta('bathrooms', parseInt(e.target.value))} className={inp} placeholder="e.g. 1" min="0" />
              </Field>
              <Field label="Area / Size">
                <input type="text" value={form.metadata.area || ''} onChange={e => setMeta('area', e.target.value)} className={inp} placeholder="e.g. 65 m²" />
              </Field>
              <Field label="Google Maps URL" >
                <input type="url" value={form.metadata.map_url || ''} onChange={e => setMeta('map_url', e.target.value)} className={inp} placeholder="https://maps.google.com/…" />
              </Field>
              <Field label="Furnished">
                <select value={form.metadata.furnished === true ? 'true' : form.metadata.furnished === false ? 'false' : ''} onChange={e => setMeta('furnished', e.target.value === 'true')} className={inp}>
                  <option value="">Not specified</option>
                  <option value="true">Furnished</option>
                  <option value="false">Unfurnished</option>
                </select>
              </Field>
            </div>
          )}

          {/* Photo upload */}
          {(selectedCatSlug === 'construction-workers' || selectedCatSlug === 'tutors') && (
            <div className="pt-2 border-t border-neutral-100">
              <ImageUpload value={photo} onChange={setPhoto} />
            </div>
          )}

          {/* House — multiple photos */}
          {selectedCatSlug === 'houses-for-rent' && (
            <div className="pt-2 border-t border-neutral-100">
              <ImageUpload value={photo} onChange={setPhoto} label="Main Property Photo" />
            </div>
          )}

          {/* Status + options */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-neutral-100">
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inp}>
                <option value="inactive">Unpublished</option>
                <option value="active">Published</option>
              </select>
            </Field>
            <Field label="Featured">
              <select value={form.featured ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, featured: e.target.value === 'true' }))} className={inp}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
            <Field label="Demo Listing">
              <select value={form.is_demo ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_demo: e.target.value === 'true' }))} className={inp}>
                <option value="false">No</option>
                <option value="true">Yes (demo)</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════ */
const Listings = () => {
  const [listings,   setListings]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [catFilter,  setCatFilter]  = useState('all');
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null); // null | 'new' | listingObj

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [listingsRes, catsRes] = await Promise.all([
      supabase.from('listings').select('id, category_id, title, price, location, status, featured, is_demo, created_at, contact_info, description, images, metadata, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (!listingsRes.error) setListings(listingsRes.data);
    if (!catsRes.error) setCategories(catsRes.data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleToggleStatus = async (id, current) => {
    const next = current === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('listings').update({ status: next }).eq('id', id);
    if (error) { setError(error.message); return; }
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: next } : l));
  };

  const handleToggleFeatured = async (id, current) => {
    const { error } = await supabase.from('listings').update({ featured: !current }).eq('id', id);
    if (error) { setError(error.message); return; }
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured: !current } : l));
  };

  const filtered = listings.filter(l => {
    const matchCat = catFilter === 'all' || l.category_id === catFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || l.title.toLowerCase().includes(q) || (l.location || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Listings</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{listings.length} total</p>
          </div>
          <button onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Listing
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48 max-w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all" />
          </div>
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            <button onClick={() => setCatFilter('all')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${catFilter === 'all' ? 'bg-white text-brand-burgundy shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}>All</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${catFilter === c.id ? 'bg-white text-brand-burgundy shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}>
                {c.slug === 'construction-workers' ? 'Workers' : c.slug === 'houses-for-rent' ? 'Houses' : 'Tutors'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 skeleton rounded" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-neutral-700 mb-1">No listings found</p>
              <p className="text-xs text-neutral-400">Try changing your filters or add a new listing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['Listing','Category','Price','Location','Status','Featured','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map(l => (
                    <tr key={l.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {l.images?.[0] ? (
                            <img src={l.images[0]} alt="" className="w-9 h-12 object-cover rounded-lg flex-shrink-0 border border-neutral-200" />
                          ) : (
                            <div className="w-9 h-12 bg-neutral-100 rounded-lg flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold text-neutral-900 max-w-[160px] truncate">{l.title}</p>
                            {l.is_demo && <span className="text-[10px] text-orange-500 font-semibold">DEMO</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{l.categories?.name}</td>
                      <td className="px-4 py-3 font-semibold text-brand-burgundy whitespace-nowrap">{l.price || '—'}</td>
                      <td className="px-4 py-3 text-neutral-500 max-w-[120px] truncate">{l.location || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleFeatured(l.id, l.featured)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${l.featured ? 'bg-brand-burgundy/10 text-brand-burgundy' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}>
                          {l.featured ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/listing/${l.id}`} target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-brand-burgundy transition-colors rounded-lg hover:bg-neutral-100" title="Preview">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Link>
                          <button onClick={() => setModal(l)}
                            className="p-1.5 text-neutral-400 hover:text-brand-burgundy transition-colors rounded-lg hover:bg-neutral-100" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleToggleStatus(l.id, l.status)}
                            className={`p-1.5 transition-colors rounded-lg hover:bg-neutral-100 ${l.status === 'active' ? 'text-emerald-500 hover:text-neutral-500' : 'text-neutral-400 hover:text-emerald-500'}`}
                            title={l.status === 'active' ? 'Unpublish' : 'Publish'}>
                            {l.status === 'active' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                          <button onClick={() => handleDelete(l.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-neutral-100" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
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

      {modal && (
        <ListingModal
          listing={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
    </AdminLayout>
  );
};

export default Listings;
