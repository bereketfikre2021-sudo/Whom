import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-neutral-200">
    <div className="aspect-[4/3] skeleton" />
    <div className="p-4 md:p-5 space-y-3">
      <div className="h-3 skeleton rounded-full w-1/3" />
      <div className="h-5 skeleton rounded-lg w-3/4" />
      <div className="h-3 skeleton rounded-full w-full" />
      <div className="h-3 skeleton rounded-full w-2/3" />
      <div className="h-10 skeleton rounded-xl mt-4" />
    </div>
  </div>
);

// Inline SVG icons for category placeholders
const ConstructionIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" aria-hidden="true">
    <rect x="10" y="50" width="60" height="8" rx="4" fill="#561836" opacity="0.3"/>
    <rect x="30" y="20" width="20" height="30" rx="2" fill="#561836" opacity="0.5"/>
    <path d="M20 50 L40 20 L60 50" stroke="#561836" strokeWidth="3" fill="none" opacity="0.7"/>
    <circle cx="40" cy="14" r="6" fill="#561836" opacity="0.6"/>
  </svg>
);

const HouseIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" aria-hidden="true">
    <path d="M10 40 L40 15 L70 40" stroke="#561836" strokeWidth="3" fill="none" opacity="0.7"/>
    <rect x="20" y="40" width="40" height="25" rx="2" fill="#561836" opacity="0.3"/>
    <rect x="34" y="50" width="12" height="15" rx="1" fill="#561836" opacity="0.5"/>
    <rect x="25" y="45" width="10" height="8" rx="1" fill="#561836" opacity="0.5"/>
    <rect x="45" y="45" width="10" height="8" rx="1" fill="#561836" opacity="0.5"/>
  </svg>
);

const TutorIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" aria-hidden="true">
    <rect x="15" y="20" width="50" height="35" rx="3" fill="#561836" opacity="0.2"/>
    <rect x="15" y="20" width="50" height="35" rx="3" stroke="#561836" strokeWidth="2" opacity="0.6"/>
    <line x1="25" y1="32" x2="55" y2="32" stroke="#561836" strokeWidth="2" opacity="0.5"/>
    <line x1="25" y1="39" x2="55" y2="39" stroke="#561836" strokeWidth="2" opacity="0.5"/>
    <line x1="25" y1="46" x2="45" y2="46" stroke="#561836" strokeWidth="2" opacity="0.5"/>
    <path d="M35 58 L45 58 L43 65 L37 65 Z" fill="#561836" opacity="0.4"/>
    <line x1="30" y1="65" x2="50" y2="65" stroke="#561836" strokeWidth="2" opacity="0.5"/>
  </svg>
);

const getCategoryIcon = (slug) => {
  if (slug === 'construction-workers') return <ConstructionIcon />;
  if (slug === 'houses-for-rent') return <HouseIcon />;
  if (slug === 'tutors') return <TutorIcon />;
  return null;
};

const CategoryListings = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [tradeFilter, setTradeFilter] = useState('');
  const gridRef = useRef(null);

  useEffect(() => {
    fetchListings();
    // Reset trade filter when slug changes
    setTradeFilter('');
  }, [slug, sortBy]);

  // Scroll animation observer
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            entry.target.classList.remove('reveal-hidden');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const cards = document.querySelectorAll('.listing-card-reveal');
    cards.forEach((el) => observer.observe(el));
    return () => cards.forEach((el) => observer.unobserve(el));
  }, [loading]);

  const fetchListings = async () => {
    setLoading(true);
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!categoryData) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from('listings')
      .select(`
        id,
        category_id,
        title,
        description,
        price,
        location,
        images,
        status,
        fee_type,
        custom_fee,
        featured,
        is_demo,
        created_at,
        updated_at,
        metadata,
        categories (*)
      `)
      .eq('status', 'active')
      .eq('category_id', categoryData.id);

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'price_low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price_high') {
      query = query.order('price', { ascending: false });
    }

    const { data, error } = await query;

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriceMin = !priceMin || listing.price.includes(priceMin);
    const matchesPriceMax = !priceMax || listing.price.includes(priceMax);
    const matchesLocation =
      !locationFilter ||
      listing.location.toLowerCase().includes(locationFilter.toLowerCase());

    let matchesTrade = true;
    if (tradeFilter) {
      const meta = listing.metadata || {};
      if (slug === 'construction-workers') {
        matchesTrade =
          (meta.worker_type || '').toLowerCase().includes(tradeFilter.toLowerCase()) ||
          (meta.skills || []).some((s) => s.toLowerCase().includes(tradeFilter.toLowerCase()));
      } else if (slug === 'houses-for-rent') {
        if (tradeFilter === '1 Bedroom') matchesTrade = meta.bedrooms === 1;
        else if (tradeFilter === '2 Bedrooms') matchesTrade = meta.bedrooms === 2;
        else if (tradeFilter === '3+ Bedrooms') matchesTrade = (meta.bedrooms || 0) >= 3;
        else if (tradeFilter === 'Apartment')
          matchesTrade = (meta.property_type || '').toLowerCase() === 'apartment';
      } else if (slug === 'tutors') {
        matchesTrade = (meta.subject || '').toLowerCase().includes(tradeFilter.toLowerCase());
      }
    }

    return matchesSearch && matchesPriceMin && matchesPriceMax && matchesLocation && matchesTrade;
  });

  const getCategoryInfo = () => {
    if (slug === 'construction-workers') {
      return {
        title: t('findConstructionWorkers'),
        description: t('findConstructionWorkersDesc'),
        placeholder: t('searchBySkill'),
        emptyState: t('noResults'),
        cardButton: 'View Profile',
      };
    } else if (slug === 'houses-for-rent') {
      return {
        title: t('findHouseForRent'),
        description: t('findHouseForRentDesc'),
        placeholder: t('searchByLocation'),
        emptyState: t('noResults'),
        cardButton: 'View Property',
      };
    } else if (slug === 'tutors') {
      return {
        title: t('findTutor'),
        description: t('findTutorDesc'),
        placeholder: t('searchBySubject'),
        emptyState: t('noResults'),
        cardButton: 'View Tutor',
      };
    }
    return null;
  };

  const handleTradeFilter = (value) => {
    setTradeFilter((prev) => (prev === value ? '' : value));
  };

  const tradeButtonClass = (value) =>
    `px-4 py-2 border rounded-lg text-sm transition-all ${
      tradeFilter === value
        ? 'border-brand-burgundy bg-brand-burgundy text-white'
        : 'border-neutral-200 hover:border-brand-burgundy hover:bg-neutral-100 text-neutral-700'
    }`;

  const getCategorySpecificFilters = () => {
    if (slug === 'construction-workers') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {['General Laborer', 'Painter', 'Carpenter', 'Electrician', 'Plumber'].map((f) => (
            <button key={f} onClick={() => handleTradeFilter(f)} className={tradeButtonClass(f)}>
              {f}
            </button>
          ))}
        </div>
      );
    } else if (slug === 'houses-for-rent') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {['1 Bedroom', '2 Bedrooms', '3+ Bedrooms', 'Apartment'].map((f) => (
            <button key={f} onClick={() => handleTradeFilter(f)} className={tradeButtonClass(f)}>
              {f}
            </button>
          ))}
        </div>
      );
    } else if (slug === 'tutors') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {['Math', 'Science', 'English', 'Amharic'].map((f) => (
            <button key={f} onClick={() => handleTradeFilter(f)} className={tradeButtonClass(f)}>
              {f}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  const getCardSubtitle = (listing) => {
    const meta = listing.metadata || {};
    const cat = listing.categories?.slug || slug;
    if (cat === 'construction-workers') {
      const parts = [meta.worker_type, meta.experience].filter(Boolean);
      return parts.join(' · ');
    }
    if (cat === 'houses-for-rent') {
      const parts = [meta.bedrooms ? `${meta.bedrooms} bed` : null, meta.area].filter(Boolean);
      return parts.join(' · ');
    }
    if (cat === 'tutors') {
      const parts = [meta.subject, meta.experience].filter(Boolean);
      return parts.join(' · ');
    }
    return '';
  };

  const catInfo = getCategoryInfo();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Category Header — brand solid header, no Unsplash */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl bg-brand-burgundy">
        <div className="px-6 py-10 md:py-14 lg:py-16 flex items-center gap-6">
          <div className="hidden sm:flex w-20 h-20 bg-white/10 rounded-2xl items-center justify-center flex-shrink-0">
            {getCategoryIcon(slug)}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              {catInfo?.title}
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-neutral-200">{catInfo?.description}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-neutral-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              {t('search')}
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={catInfo?.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              {t('priceFrom')}
            </label>
            <input
              type="text"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              {t('priceTo')}
            </label>
            <input
              type="text"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              {t('location')}
            </label>
            <input
              type="text"
              placeholder={t('location') + '...'}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              {t('sortBy')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-sm"
            >
              <option value="newest">{t('newest')}</option>
              <option value="price_low">{t('priceLowHigh')}</option>
              <option value="price_high">{t('priceHighLow')}</option>
            </select>
          </div>
        </div>

        {getCategorySpecificFilters()}
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <p className="text-neutral-600 text-sm md:text-base">
          {filteredListings.length} {t('listingsFound')}
        </p>
        <button
          onClick={() => {
            setSearchTerm('');
            setPriceMin('');
            setPriceMax('');
            setLocationFilter('');
            setTradeFilter('');
          }}
          className="text-sm text-brand-burgundy hover:text-neutral-900 font-medium self-start sm:self-auto"
        >
          {t('clearFilters')}
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 sm:px-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-12 text-center border border-neutral-200 mx-4 sm:mx-0">
          <svg className="w-16 h-16 md:w-24 md:h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-2">
            {t('noResults')}
          </h3>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 sm:px-0">
          {filteredListings.map((listing, index) => (
            <Link
              key={listing.id}
              to={`/listing/${listing.id}`}
              className={`listing-card-reveal bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-neutral-200 group hover-lift reveal-hidden stagger-${Math.min(index % 6 + 1, 6)}`}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                    {getCategoryIcon(slug)}
                  </div>
                )}
                {listing.featured && (
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-brand-burgundy text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold shadow-md">
                    Featured
                  </div>
                )}
                {listing.is_demo && (
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-orange-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold shadow-md">
                    {t('demoListing')}
                  </div>
                )}
              </div>
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-brand-burgundy bg-neutral-100 px-2 py-1 rounded-full">
                    {listing.categories?.name}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1 text-base md:text-lg">
                  {listing.title}
                </h3>
                {getCardSubtitle(listing) && (
                  <p className="text-xs md:text-sm text-brand-burgundy font-medium mb-2">
                    {getCardSubtitle(listing)}
                  </p>
                )}
                <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-neutral-200">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Price</p>
                    <p className="text-base md:text-lg font-bold text-brand-burgundy">
                      {listing.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 mb-1">{t('location')}</p>
                    <p className="text-xs md:text-sm font-medium text-neutral-900 truncate max-w-[100px] md:max-w-none">
                      {listing.location}
                    </p>
                  </div>
                </div>
                <button className="mt-3 md:mt-4 w-full px-3 md:px-4 py-2 md:py-2.5 bg-neutral-100 text-brand-burgundy rounded-lg text-xs md:text-sm font-medium hover:bg-neutral-200 transition-all">
                  {catInfo?.cardButton}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListings;
