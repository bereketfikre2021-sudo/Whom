import { useEffect, useState, useRef } from 'react';import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

/* ─── Category header icons (white, for dark bg) ─── */
const ConstructionIconWhite = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
    <path d="M8 40h32M18 16h12v24H18z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M10 40 L24 10 L38 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 26 Q24 22 34 26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="24" cy="8" r="3.5" fill="white" opacity="0.9"/>
    <rect x="21" y="24" width="6" height="8" rx="1" fill="white" opacity="0.3"/>
  </svg>
);

const HouseIconWhite = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
    <path d="M6 24 L24 8 L42 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="10" y="24" width="28" height="16" rx="1.5" fill="white" opacity="0.2" stroke="white" strokeWidth="2"/>
    <rect x="20" y="30" width="8" height="10" rx="1" fill="white" opacity="0.5"/>
    <rect x="13" y="27" width="7" height="6" rx="1" fill="white" opacity="0.5"/>
    <rect x="28" y="27" width="7" height="6" rx="1" fill="white" opacity="0.5"/>
    <rect x="29" y="10" width="4" height="9" rx="1" fill="white" opacity="0.5"/>
  </svg>
);

const TutorIconWhite = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
    <rect x="8" y="10" width="32" height="22" rx="2.5" fill="white" opacity="0.15" stroke="white" strokeWidth="2"/>
    <line x1="14" y1="18" x2="34" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="14" y1="23" x2="34" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="14" y1="28" x2="26" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 32 L28 32 L26.5 38 L21.5 38 Z" fill="white" opacity="0.6"/>
    <line x1="17" y1="38" x2="31" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* ─── Person avatar — uses listing image if available, else initials ─── */
const PersonAvatar = ({ name, image }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        onError={() => setImgError(true)}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-neutral-200"
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
      style={{ backgroundColor: `hsl(${hue},35%,45%)` }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};

/* ─── Skeleton rows ─── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-neutral-100">
    <div className="w-10 h-10 skeleton rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 skeleton rounded w-1/3" />
      <div className="h-3 skeleton rounded w-1/2" />
    </div>
    <div className="w-16 h-4 skeleton rounded" />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-neutral-200">
    <div className="aspect-[16/10] skeleton" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-1/2" />
      <div className="h-8 skeleton rounded-lg mt-3" />
    </div>
  </div>
);

const getCategoryHeaderIcon = (slug) => {
  if (slug === 'construction-workers') return <ConstructionIconWhite />;
  if (slug === 'houses-for-rent') return <HouseIconWhite />;
  if (slug === 'tutors') return <TutorIconWhite />;
  return null;
};

/* ─── Person row (workers / tutors) ─── */
const PersonRow = ({ listing, slug }) => {
  const meta = listing.metadata || {};
  const image = listing.images?.[0];

  let trade = '';
  let experience = '';
  let extra = '';

  if (slug === 'construction-workers') {
    trade = meta.worker_type || '';
    experience = meta.experience || '';
    extra = meta.availability || '';
  } else if (slug === 'tutors') {
    trade = meta.subject || '';
    experience = meta.experience || '';
    extra = meta.grade_level || meta.teaching_arrangement || '';
  }

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="listing-card-reveal reveal-hidden flex items-center gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0 group"
    >
      {/* Avatar */}
      <PersonAvatar name={listing.title} image={image} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-bold text-neutral-900 truncate group-hover:text-brand-burgundy transition-colors">
            {listing.title}
          </p>
          {listing.featured && (
            <span className="text-[10px] font-bold text-brand-burgundy bg-brand-burgundy/8 px-1.5 py-0.5 rounded-full flex-shrink-0 hidden sm:inline">
              Featured
            </span>
          )}
          {listing.is_demo && (
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full flex-shrink-0 hidden sm:inline">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {trade && (
            <span className="text-xs font-semibold text-brand-burgundy">{trade}</span>
          )}
          {trade && experience && <span className="text-neutral-300 text-xs">·</span>}
          {experience && (
            <span className="text-xs text-neutral-500">{experience}</span>
          )}
          {extra && (
            <>
              <span className="text-neutral-300 text-xs">·</span>
              <span className="text-xs text-neutral-400">{extra}</span>
            </>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.location}
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {listing.price && (
          <span className="text-sm font-extrabold text-brand-burgundy">{listing.price}</span>
        )}
        <span className="text-xs text-neutral-400 group-hover:text-brand-burgundy transition-colors font-medium">
          View
        </span>
      </div>

      {/* Chevron */}
      <svg className="w-4 h-4 text-neutral-300 group-hover:text-brand-burgundy group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};

/* ─── House card (grid) ─── */
const HouseCard = ({ listing, catInfo }) => {
  const meta = listing.metadata || {};
  const sub = [
    meta.bedrooms ? `${meta.bedrooms} bed` : null,
    meta.bathrooms ? `${meta.bathrooms} bath` : null,
    meta.property_type,
  ].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="listing-card-reveal reveal-hidden group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-brand-burgundy/30 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
        {listing.images?.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
            </svg>
          </div>
        )}
        {listing.is_demo && (
          <span className="absolute top-2 left-2 text-[10px] font-bold text-orange-500 bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-sm">DEMO</span>
        )}
        {listing.featured && (
          <span className="absolute top-2 right-2 text-[10px] font-bold text-brand-burgundy bg-white px-2 py-0.5 rounded-full border border-brand-burgundy/20 shadow-sm">FEATURED</span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-brand-burgundy transition-colors">
          {listing.title}
        </p>
        {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-extrabold text-brand-burgundy">{listing.price}</span>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const CategoryListings = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [tradeFilter, setTradeFilter] = useState('');
  const listRef = useRef(null);

  const isPeople = slug === 'construction-workers' || slug === 'tutors';

  useEffect(() => {
    fetchListings();
    setTradeFilter('');
  }, [slug, sortBy]);

  /* Scroll-reveal */
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible');
          e.target.classList.remove('reveal-hidden');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.listing-card-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const fetchListings = async () => {
    setLoading(true);
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).single();
    if (!cat) { setLoading(false); return; }

    let q = supabase
      .from('listings')
      .select('id, category_id, title, description, price, location, images, status, fee_type, custom_fee, featured, is_demo, created_at, metadata, categories(*)')
      .eq('status', 'active')
      .eq('category_id', cat.id);

    if (sortBy === 'newest')     q = q.order('created_at', { ascending: false });
    else if (sortBy === 'price_low')  q = q.order('price', { ascending: true });
    else if (sortBy === 'price_high') q = q.order('price', { ascending: false });

    const { data, error } = await q;
    if (!error && data) setListings(data);
    setLoading(false);
  };

  const filtered = listings.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || l.title.toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q);
    const matchLoc    = !locationFilter || (l.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    let matchTrade = true;
    if (tradeFilter) {
      const m = l.metadata || {};
      if (slug === 'construction-workers') {
        matchTrade = (m.worker_type || '').toLowerCase().includes(tradeFilter.toLowerCase()) ||
          (m.skills || []).some(s => s.toLowerCase().includes(tradeFilter.toLowerCase()));
      } else if (slug === 'houses-for-rent') {
        if (tradeFilter === '1 Bedroom')  matchTrade = m.bedrooms === 1;
        else if (tradeFilter === '2 Bedrooms') matchTrade = m.bedrooms === 2;
        else if (tradeFilter === '3+ Bedrooms') matchTrade = (m.bedrooms || 0) >= 3;
        else if (tradeFilter === 'Apartment') matchTrade = (m.property_type || '').toLowerCase() === 'apartment';
      } else if (slug === 'tutors') {
        matchTrade = (m.subject || '').toLowerCase().includes(tradeFilter.toLowerCase());
      }
    }
    return matchSearch && matchLoc && matchTrade;
  });

  const catInfo = {
    'construction-workers': { title: t('findConstructionWorkers'), desc: t('findConstructionWorkersDesc'), placeholder: t('searchBySkill') },
    'houses-for-rent':      { title: t('findHouseForRent'),        desc: t('findHouseForRentDesc'),        placeholder: t('searchByLocation') },
    'tutors':               { title: t('findTutor'),               desc: t('findTutorDesc'),               placeholder: t('searchBySubject') },
  }[slug] || {};

  const chipClass = (val) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
      tradeFilter === val
        ? 'bg-brand-burgundy text-white border-brand-burgundy'
        : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-burgundy hover:text-brand-burgundy'
    }`;

  const quickFilters = {
    'construction-workers': ['General Laborer', 'Painter', 'Carpenter', 'Electrician', 'Plumber'],
    'houses-for-rent':      ['1 Bedroom', '2 Bedrooms', '3+ Bedrooms', 'Apartment'],
    'tutors':               ['Math', 'Science', 'English', 'Amharic'],
  }[slug] || [];

  return (
    <div className="py-6 md:py-8 space-y-5">

      {/* ── Category header ── */}
      <div className="bg-brand-burgundy rounded-2xl px-6 py-8 md:py-10 flex items-center gap-5">
        <div className="w-16 h-16 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
          {getCategoryHeaderIcon(slug)}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{catInfo.title}</h1>
          <p className="text-sm text-white/70 mt-1 max-w-xl">{catInfo.desc}</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
        {/* Search + location + sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={catInfo.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all"
            />
          </div>
          {/* Location */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Location…"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all"
            />
          </div>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 focus:border-brand-burgundy transition-all"
          >
            <option value="newest">{t('newest')}</option>
            <option value="price_low">{t('priceLowHigh')}</option>
            <option value="price_high">{t('priceHighLow')}</option>
          </select>
        </div>

        {/* Quick filter chips */}
        {quickFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((f) => (
              <button key={f} onClick={() => setTradeFilter(prev => prev === f ? '' : f)} className={chipClass(f)}>
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Results header ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-900">{filtered.length}</span> {t('listingsFound')}
        </p>
        {(searchTerm || locationFilter || tradeFilter) && (
          <button
            onClick={() => { setSearchTerm(''); setLocationFilter(''); setTradeFilter(''); }}
            className="text-xs font-semibold text-brand-burgundy hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Listings ── */}
      {loading ? (
        isPeople ? (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-700 mb-1">{t('noResults')}</p>
          <p className="text-xs text-neutral-400">Try adjusting your search or filters.</p>
        </div>
      ) : isPeople ? (
        /* ── Person list (workers / tutors) ── */
        <div ref={listRef} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {filtered.map((listing) => (
            <PersonRow key={listing.id} listing={listing} slug={slug} />
          ))}
        </div>
      ) : (
        /* ── House grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <HouseCard key={listing.id} listing={listing} catInfo={catInfo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListings;
