import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

/* ─── Category SVG icons (white, for solid coloured bg) ─── */
const ConstructionSVG = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" aria-hidden="true">
    <rect x="8" y="46" width="48" height="7" rx="3.5" fill="white" opacity="0.3"/>
    <rect x="24" y="20" width="16" height="26" rx="2" fill="white" opacity="0.2"/>
    <path d="M12 46 L32 14 L52 46" stroke="white" strokeWidth="3" fill="none" strokeLinejoin="round"/>
    <rect x="21" y="31" width="9" height="12" rx="1.5" fill="white" opacity="0.5"/>
    <rect x="34" y="31" width="9" height="12" rx="1.5" fill="white" opacity="0.5"/>
    <path d="M18 16 Q32 8 46 16" fill="white" opacity="0.3"/>
    <rect x="17" y="14" width="30" height="5" rx="2.5" fill="white" opacity="0.7"/>
  </svg>
);
const HouseSVG = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" aria-hidden="true">
    <path d="M8 34 L32 12 L56 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="34" width="36" height="22" rx="2" fill="white" opacity="0.2" stroke="white" strokeWidth="1.5"/>
    <rect x="27" y="42" width="10" height="14" rx="1" fill="white" opacity="0.6"/>
    <rect x="18" y="38" width="8" height="7" rx="1" fill="white" opacity="0.5"/>
    <rect x="38" y="38" width="8" height="7" rx="1" fill="white" opacity="0.5"/>
    <rect x="38" y="11" width="5" height="13" rx="1" fill="white" opacity="0.6"/>
  </svg>
);
const TutorSVG = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" aria-hidden="true">
    <rect x="10" y="14" width="44" height="30" rx="3" fill="white" opacity="0.15" stroke="white" strokeWidth="2"/>
    <line x1="20" y1="24" x2="44" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
    <line x1="20" y1="30" x2="44" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    <line x1="20" y1="36" x2="34" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M26 44 L38 44 L36 52 L28 52 Z" fill="white" opacity="0.6"/>
    <line x1="22" y1="52" x2="42" y2="52" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* ─── Skeleton card (houses / generic) ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm">
    <div className="aspect-[16/10] skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-3 skeleton rounded-full w-1/3" />
      <div className="h-5 skeleton rounded-lg w-3/4" />
      <div className="h-3 skeleton rounded-full w-full" />
      <div className="h-8 skeleton rounded-xl mt-3" />
    </div>
  </div>
);

/* ─── Person avatar fallback ─── */
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

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  /* Scroll-reveal */
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal-hidden').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const fetchData = async () => {
    try {
      // Fetch up to 3 listings per category so all three categories always appear
      const slugs = ['construction-workers', 'houses-for-rent', 'tutors'];
      const results = await Promise.all(
        slugs.map((slug) =>
          supabase
            .from('listings')
            .select('id, title, description, price, location, images, is_demo, featured, metadata, categories!inner(*)')
            .eq('status', 'active')
            .eq('categories.slug', slug)
            .order('created_at', { ascending: false })
            .limit(3)
        )
      );
      const all = results.flatMap((r) => (r.error ? [] : r.data));
      setFeaturedListings(all);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/category/construction-workers?q=${encodeURIComponent(searchTerm)}`);
  };

  const categories = [
    { slug: 'construction-workers', label: t('constructionWorkers'), desc: t('constructionWorkersDesc'), cta: t('findWorkers'),    icon: <ConstructionSVG />, bg: 'bg-brand-burgundy' },
    { slug: 'tutors',               label: t('tutors'),              desc: t('tutorsDesc'),              cta: t('findTutors'),     icon: <TutorSVG />,        bg: 'bg-brand-burgundy-dark' },
    { slug: 'houses-for-rent',      label: t('housesForRent'),       desc: t('housesForRentDesc'),       cta: t('exploreRentals'), icon: <HouseSVG />,        bg: 'bg-neutral-800'    },
  ];

  const howItWorks = [
    { n: '1', title: t('step1Title'), desc: t('step1Desc'), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { n: '2', title: t('step2Title'), desc: t('step2Desc'), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { n: '3', title: t('step3Title'), desc: t('step3Desc'), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
  ];

  /* ─── Group listings by category ─── */
  const grouped = featuredListings.reduce((acc, listing) => {
    const slug = listing.categories?.slug || 'other';
    if (!acc[slug]) acc[slug] = [];
    acc[slug].push(listing);
    return acc;
  }, {});

  const categoryOrder = ['construction-workers', 'tutors', 'houses-for-rent'];  const categoryMeta = {
    'construction-workers': { label: t('constructionWorkers'), cta: t('findWorkers'), slug: 'construction-workers' },
    'tutors':               { label: t('tutors'),              cta: t('findTutors'),   slug: 'tutors'               },
    'houses-for-rent':      { label: t('housesForRent'),       cta: t('exploreRentals'), slug: 'houses-for-rent'   },
  };

  return (
    <div>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden bg-brand-offwhite pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-burgundy/[0.04] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-burgundy/[0.04] translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-7">
            <div className="flex items-center gap-2.5 opacity-0 animate-fade-in" style={{ animationDelay: '0ms' }}>
              <span className="block w-6 h-px bg-brand-burgundy" />
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-brand-burgundy">{t('heroEyebrow')}</p>
            </div>

            <h1 className="opacity-0 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              <span className="block text-[2.6rem] sm:text-5xl lg:text-[3.6rem] font-extrabold text-neutral-900 leading-[1.08] tracking-tight">
                Find the Right
              </span>
              <span className="block text-[2.6rem] sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.08] tracking-tight mt-1">
                <span className="relative inline-block text-brand-burgundy">
                  People,
                  <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none" fill="none" aria-hidden="true">
                    <path d="M0 5 Q50 0 100 4 Q150 8 200 3" stroke="#561836" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
                  </svg>
                </span>
                {' '}<span className="text-neutral-900">Homes,</span>
              </span>
              <span className="block text-[2.6rem] sm:text-5xl lg:text-[3.6rem] font-extrabold text-neutral-900 leading-[1.08] tracking-tight mt-1">
                and Tutors.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-500 leading-[1.75] max-w-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              ምን እናቅርብ connects you with skilled construction workers, rental homes, and expert tutors across Addis Ababa — all in one place.
            </p>

            <form onSubmit={handleSearch} className="opacity-0 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
              <div className="relative flex shadow-lg rounded-xl overflow-hidden border border-neutral-200 focus-within:border-brand-burgundy focus-within:ring-4 focus-within:ring-brand-burgundy/10 transition-all">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 pl-12 pr-4 py-4 bg-white text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none"
                />
                <button type="submit" className="px-6 py-4 bg-brand-burgundy text-white text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors whitespace-nowrap">
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
              <span className="text-xs text-neutral-500 self-center">Quick browse:</span>
              {categories.map((c) => (
                <Link key={c.slug} to={`/category/${c.slug}`}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-neutral-200 text-neutral-600 hover:border-brand-burgundy hover:text-brand-burgundy hover:bg-brand-burgundy/5 transition-all">
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center opacity-0 animate-scale-in" style={{ animationDelay: '400ms' }}>
            <div className="relative w-full max-w-lg">
              <img src="/src/assets/hero-illustration.svg" alt="" className="w-full h-auto drop-shadow-md" loading="eager" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-8 lg:hidden opacity-0 animate-fade-in-up" style={{ animationDelay: '440ms' }}>
          {categories.map((c) => (
            <span key={c.slug} className="text-xs font-medium px-3 py-1.5 rounded-full bg-brand-burgundy/8 text-brand-burgundy border border-brand-burgundy/20">{c.label}</span>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FEATURED LISTINGS ═══════════════════ */}
      <section className="py-16 md:py-20 border-t border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2 reveal-hidden">{t('exploreAvailableListings')}</h2>
            <p className="text-neutral-500 text-base reveal-hidden stagger-1">{t('browseListingsDesc')}</p>
          </div>
        </div>

        {loading ? (
          /* Skeleton — two person rows + one house card */
          <div className="space-y-8">
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <div className="w-12 h-12 skeleton rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton rounded w-2/5" />
                    <div className="h-3 skeleton rounded w-3/5" />
                    <div className="h-3 skeleton rounded w-1/4" />
                  </div>
                  <div className="w-16 h-4 skeleton rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  <div className="aspect-[16/10] skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl">
            <p className="text-neutral-400 text-sm">{t('noListingsYet')}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {categoryOrder.map((catSlug) => {
              const items = grouped[catSlug];
              if (!items || items.length === 0) return null;
              const meta = categoryMeta[catSlug];
              const isPeople = catSlug === 'construction-workers' || catSlug === 'tutors';

              return (
                <div key={catSlug} className="reveal-hidden">
                  {/* Category sub-header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-neutral-900">{meta.label}</h3>
                    <Link
                      to={`/category/${meta.slug}`}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-burgundy hover:underline"
                    >
                      {meta.cta}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {isPeople ? (
                    /* ── Person list panel ── */
                    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
                      {items.map((listing) => {
                        const m = listing.metadata || {};
                        const image = listing.images?.[0];
                        const trade = catSlug === 'construction-workers' ? m.worker_type : m.subject;
                        const exp   = m.experience || '';
                        const extra = catSlug === 'construction-workers' ? (m.availability || '') : (m.grade_level || m.teaching_arrangement || '');

                        return (
                          <Link
                            key={listing.id}
                            to={`/listing/${listing.id}`}
                            className="flex items-center gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors group"
                          >
                            <PersonAvatar name={listing.title} image={image} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-neutral-900 truncate group-hover:text-brand-burgundy transition-colors">
                                  {listing.title}
                                </p>
                                {listing.featured && (
                                  <span className="hidden sm:inline text-[10px] font-bold text-brand-burgundy bg-brand-burgundy/8 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {trade && <span className="text-xs font-semibold text-brand-burgundy">{trade}</span>}
                                {trade && exp && <span className="text-neutral-300 text-xs">·</span>}
                                {exp   && <span className="text-xs text-neutral-500">{exp}</span>}
                                {extra && <><span className="text-neutral-300 text-xs">·</span><span className="text-xs text-neutral-400">{extra}</span></>}
                              </div>
                              <p className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {listing.location}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              {listing.price && <span className="text-sm font-extrabold text-brand-burgundy">{listing.price}</span>}
                              <svg className="w-4 h-4 text-neutral-300 group-hover:text-brand-burgundy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    /* ── House image grid — full card style ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((listing) => {
                        const image = listing.images?.[0];
                        const m = listing.metadata || {};
                        const sub = [
                          m.bedrooms ? `${m.bedrooms} bed` : null,
                          m.bathrooms ? `${m.bathrooms} bath` : null,
                          m.property_type,
                        ].filter(Boolean).join(' · ');

                        return (
                          <Link
                            key={listing.id}
                            to={`/listing/${listing.id}`}
                            className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-brand-burgundy/30 hover:shadow-lg transition-all"
                          >
                            {/* Image */}
                            <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                              {image ? (
                                <img src={image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
                                  </svg>
                                </div>
                              )}
                              {listing.featured && (
                                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-brand-burgundy bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full border border-brand-burgundy/20 shadow-sm">Featured</span>
                              )}
                            </div>
                            {/* Body */}
                            <div className="p-4">
                              <span className="text-[11px] font-semibold text-brand-burgundy bg-brand-burgundy/8 px-2 py-0.5 rounded-full">{listing.categories?.name}</span>
                              <p className="mt-2 text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-brand-burgundy transition-colors">{listing.title}</p>
                              {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
                              <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2 min-h-[32px]">{listing.description}</p>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                                <span className="flex items-center gap-1 text-xs text-neutral-400">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {listing.location}
                                </span>
                                {listing.price && <span className="text-base font-extrabold text-brand-burgundy">{listing.price}</span>}
                              </div>
                              <div className="mt-3 w-full text-center py-2 bg-brand-burgundy/5 group-hover:bg-brand-burgundy text-brand-burgundy group-hover:text-white rounded-xl text-xs font-semibold transition-all border border-brand-burgundy/20 group-hover:border-brand-burgundy">
                                View Property
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-16 md:py-20 border-t border-neutral-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 reveal-hidden">{t('howItWorks')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {howItWorks.map((step, i) => (
            <div key={step.n} className={`reveal-hidden stagger-${i + 1} relative`}>
              {i < 2 && <div className="hidden md:block absolute top-8 left-[calc(100%-1rem)] w-8 h-px bg-neutral-200 z-10" />}
              <div className="flex flex-col items-start p-6 bg-white border border-neutral-200 rounded-2xl h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-burgundy flex items-center justify-center text-white flex-shrink-0">{step.icon}</div>
                  <span className="text-sm font-bold text-neutral-400">Step {step.n}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
