import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { seedDemoListings } from '../lib/seedDemoListings';

const Home = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-hidden, .reveal-hidden-scale, .reveal-hidden-left, .reveal-hidden-right');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [loading]);

  const fetchData = async () => {
    try {
      const [categoriesData, listingsData] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('listings')
          .select(`
            id,
            title,
            description,
            price,
            location,
            images,
            is_demo,
            featured,
            categories (*)
          `)
          .eq('status', 'active')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      if (!categoriesData.error) setCategories(categoriesData.data);
      if (!listingsData.error) setFeaturedListings(listingsData.data);
      
      // If no listings exist, seed demo data
      if (!listingsData.error && (!listingsData.data || listingsData.data.length === 0)) {
        console.log('No listings found, seeding demo data...');
        setSeeding(true);
        const seedResult = await seedDemoListings();
        setSeeding(false);
        
        if (seedResult.success) {
          setSeedMessage('Demo listings created successfully');
          // Fetch listings again after seeding
          const { data: newListings } = await supabase
            .from('listings')
            .select(`
              id,
              title,
              description,
              price,
              location,
              images,
              is_demo,
              featured,
              categories (*)
            `)
            .eq('status', 'active')
            .eq('featured', true)
            .order('created_at', { ascending: false })
            .limit(6);
          if (newListings) setFeaturedListings(newListings);
        } else {
          setSeedMessage(`Failed to seed: ${seedResult.error}`);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/category/construction-workers?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const categoryImages = {
    'construction-workers': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    'houses-for-rent': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    'tutors': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-burgundy"></div>
      </div>
    );
  }

  const handleSeedDemo = async () => {
    setSeeding(true);
    setSeedMessage('');
    const result = await seedDemoListings();
    setSeeding(false);
    
    if (result.success) {
      setSeedMessage('Demo listings created successfully!');
      // Refresh the data
      fetchData();
    } else {
      setSeedMessage(`Failed: ${result.error}`);
    }
  };

  return (
    <div className="space-y-16">
      {/* Seed Demo Button (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="px-4 py-2 bg-brand-burgundy text-white rounded-lg text-sm font-medium hover:bg-neutral-900 transition-all shadow-lg disabled:opacity-50"
          >
            {seeding ? 'Seeding...' : 'Seed Demo Listings'}
          </button>
          {seedMessage && (
            <div className="mt-2 text-xs text-neutral-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
              {seedMessage}
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-4 md:space-y-6">
              <p className="text-xs md:text-sm font-semibold text-brand-burgundy tracking-wider uppercase opacity-0 animate-fade-in" style={{ animationDelay: '0ms' }}>
                {t('heroEyebrow')}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                Find the right people, place, and tutor.
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-neutral-600 leading-relaxed max-w-xl opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Looking for a skilled worker, a place to rent, or a tutor? Explore local listings, compare your options, and connect directly after payment verification.
              </p>

              {/* Search Field */}
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="relative group">
                  <svg className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-brand-burgundy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-white border-2 border-neutral-200 rounded-xl sm:rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-brand-burgundy/10 focus:border-brand-burgundy transition-all shadow-lg text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Link
                  to="/category/construction-workers"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-brand-burgundy text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-neutral-900 transition-all shadow-lg hover:shadow-xl text-center btn-press text-sm sm:text-base"
                >
                  {t('exploreListings')}
                </Link>
                <Link
                  to="/category/houses-for-rent"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-brand-burgundy border-2 border-brand-burgundy rounded-xl sm:rounded-2xl font-semibold hover:bg-neutral-100 transition-all text-center btn-press text-sm sm:text-base"
                >
                  {t('browseCategories')}
                </Link>
              </div>
            </div>

            {/* Right Side - Visual Composition */}
            <div className="relative h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] opacity-0 animate-scale-in hidden lg:block" style={{ animationDelay: '500ms' }}>
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-burgundy/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-burgundy/5 rounded-full blur-3xl"></div>

              {/* Main Featured Card - Construction Workers */}
              <div className="absolute top-8 right-0 w-56 md:w-64 bg-white rounded-3xl shadow-2xl overflow-hidden hover-lift z-20">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop"
                    alt="Construction Workers"
                    className="w-full h-full object-cover hover-zoom-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-white/95 backdrop-blur-sm text-brand-burgundy px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                      Construction Workers
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-neutral-900 text-base mb-1">Construction Workers</h3>
                  <p className="text-sm text-neutral-600">Verified experts ready to help</p>
                </div>
              </div>

              {/* Secondary Card - Houses for Rent */}
              <div className="absolute top-32 left-0 w-48 md:w-56 bg-white rounded-3xl shadow-2xl overflow-hidden hover-lift z-10">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
                    alt="Houses for Rent"
                    className="w-full h-full object-cover hover-zoom-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-white/95 backdrop-blur-sm text-brand-burgundy px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                      Houses for Rent
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 text-sm mb-1">Rental Properties</h3>
                  <p className="text-xs text-neutral-600">Find your perfect home</p>
                </div>
              </div>

              {/* Tertiary Card - Tutors */}
              <div className="absolute bottom-8 left-16 md:left-24 w-48 md:w-56 bg-white rounded-3xl shadow-2xl overflow-hidden hover-lift z-10">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop"
                    alt="Tutors"
                    className="w-full h-full object-cover hover-zoom-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-white/95 backdrop-blur-sm text-brand-burgundy px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                      Tutors
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 text-sm mb-1">Expert Tutors</h3>
                  <p className="text-xs text-neutral-600">Learn from the best</p>
                </div>
              </div>

              {/* Floating Stats/Info Badge */}
              <div className="absolute top-4 left-20 md:left-32 bg-brand-burgundy text-white px-4 py-2 rounded-xl shadow-lg z-30 animate-fade-in" style={{ animationDelay: '700ms' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-semibold">Verified Listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('whatLookingFor')}
          </h2>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto px-4">
            {t('categoryDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 sm:px-0">
          {/* Construction Workers */}
          <Link
            to="/category/construction-workers"
            className="group relative bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-neutral-200 hover-lift reveal-hidden"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={categoryImages['construction-workers']}
                alt="Construction Workers"
                className="w-full h-full object-cover hover-zoom-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/90 via-brand-burgundy/20 to-transparent"></div>
              <div className="absolute top-3 md:top-4 left-3 md:left-4">
                <span className="bg-white/95 backdrop-blur-sm text-brand-burgundy px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-md">
                  Construction Workers
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2 md:mb-3">
                {t('constructionWorkers')}
              </h3>
              <p className="text-neutral-600 text-sm md:text-base line-clamp-2 mb-4 md:mb-5">
                {t('constructionWorkersDesc')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-brand-burgundy font-semibold text-sm md:text-base">
                  {t('findWorkers')}
                </span>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-burgundy/10 rounded-full flex items-center justify-center group-hover:bg-brand-burgundy transition-colors">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-brand-burgundy group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Houses for Rent */}
          <Link
            to="/category/houses-for-rent"
            className="group relative bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-neutral-200 hover-lift reveal-hidden stagger-1"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={categoryImages['houses-for-rent']}
                alt="Houses for Rent"
                className="w-full h-full object-cover hover-zoom-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/90 via-brand-burgundy/20 to-transparent"></div>
              <div className="absolute top-3 md:top-4 left-3 md:left-4">
                <span className="bg-white/95 backdrop-blur-sm text-brand-burgundy px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-md">
                  Houses for Rent
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2 md:mb-3">
                {t('housesForRent')}
              </h3>
              <p className="text-neutral-600 text-sm md:text-base line-clamp-2 mb-4 md:mb-5">
                {t('housesForRentDesc')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-brand-burgundy font-semibold text-sm md:text-base">
                  {t('exploreRentals')}
                </span>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-burgundy/10 rounded-full flex items-center justify-center group-hover:bg-brand-burgundy transition-colors">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-brand-burgundy group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Tutors */}
          <Link
            to="/category/tutors"
            className="group relative bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-neutral-200 hover-lift reveal-hidden stagger-2"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={categoryImages['tutors']}
                alt="Tutors"
                className="w-full h-full object-cover hover-zoom-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/90 via-brand-burgundy/20 to-transparent"></div>
              <div className="absolute top-3 md:top-4 left-3 md:left-4">
                <span className="bg-white/95 backdrop-blur-sm text-brand-burgundy px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-md">
                  Tutors
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2 md:mb-3">
                {t('tutors')}
              </h3>
              <p className="text-neutral-600 text-sm md:text-base line-clamp-2 mb-4 md:mb-5">
                {t('tutorsDesc')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-brand-burgundy font-semibold text-sm md:text-base">
                  {t('findTutors')}
                </span>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-burgundy/10 rounded-full flex items-center justify-center group-hover:bg-brand-burgundy transition-colors">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-brand-burgundy group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 ? (
        <section className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                {t('exploreAvailableListings')}
              </h2>
              <p className="text-neutral-600 text-sm md:text-base">{t('browseListingsDesc')}</p>
            </div>
            <Link
              to="/category/construction-workers"
              className="flex items-center text-brand-burgundy hover:text-neutral-900 font-medium group self-start sm:self-auto"
            >
              View All
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredListings.map((listing, index) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-neutral-200 group hover-lift reveal-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-neutral-100">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover hover-zoom-image"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                      <svg className="w-12 h-12 md:w-16 md:h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {listing.featured && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-brand-burgundy text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      Featured
                    </div>
                  )}
                  {listing.is_demo && (
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-orange-600 text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      {t('demoListing')}
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <span className="text-xs font-semibold text-brand-burgundy bg-brand-burgundy/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                      {listing.categories?.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2 line-clamp-1 text-base md:text-xl">
                    {listing.title}
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-600 mb-3 md:mb-4 line-clamp-2 min-h-[32px] md:min-h-[40px]">
                    {listing.description}
                  </p>
                  <div className="flex items-center justify-between mb-3 md:mb-5">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs md:text-sm">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate max-w-[100px] md:max-w-[120px]">{listing.location}</span>
                    </div>
                    {listing.price && (
                      <span className="text-base md:text-xl font-bold text-brand-burgundy">
                        {listing.price}
                      </span>
                    )}
                  </div>
                  <button className="w-full px-4 md:px-6 py-2.5 md:py-3.5 bg-brand-burgundy text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold hover:bg-neutral-900 transition-all btn-press">
                    {t('viewDetails')}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-12 text-center border border-neutral-200 mx-4 sm:mx-0">
          <svg className="w-16 h-16 md:w-24 md:h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-2">
            {t('noListingsYet')}
          </h3>
          <p className="text-neutral-600 text-sm md:text-base">
            {t('noListingsYet')}
          </p>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 lg:p-12 border border-neutral-200 mx-4 sm:mx-0">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('howItWorks')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="text-center group hover-lift reveal-hidden">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-burgundy rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-3xl md:text-4xl font-bold text-white">1</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-2 md:mb-3">{t('step1Title')}</h3>
            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
              {t('step1Desc')}
            </p>
          </div>
          <div className="text-center group hover-lift reveal-hidden stagger-1">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-burgundy rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-3xl md:text-4xl font-bold text-white">2</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-2 md:mb-3">{t('step2Title')}</h3>
            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
              {t('step2Desc')}
            </p>
          </div>
          <div className="text-center group hover-lift reveal-hidden stagger-2">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-burgundy rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-3xl md:text-4xl font-bold text-white">3</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-neutral-900 mb-2 md:mb-3">{t('step3Title')}</h3>
            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Trust and Transparency */}
      <section className="bg-neutral-100 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 border border-neutral-200 mx-4 sm:mx-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4 md:mb-6">
            {t('trustTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover-lift reveal-hidden">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-burgundy/10 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base">{t('listingReview')}</h3>
              <p className="text-xs md:text-sm text-neutral-600">{t('listingReviewDesc')}</p>
            </div>
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover-lift reveal-hidden stagger-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-burgundy/10 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base">{t('transparentFees')}</h3>
              <p className="text-xs md:text-sm text-neutral-600">{t('transparentFeesDesc')}</p>
            </div>
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover-lift reveal-hidden stagger-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-burgundy/10 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2 text-sm md:text-base">{t('controlledAccess')}</h3>
              <p className="text-xs md:text-sm text-neutral-600">{t('controlledAccessDesc')}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-6 text-xs md:text-sm text-neutral-600">
            {t('trackPayment')}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center px-4 sm:px-0">
        <div className="bg-brand-burgundy rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-16 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              {t('readyToFind')}
            </h2>
            <p className="text-base md:text-xl text-neutral-200 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              {t('readyToFindDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link
                to="/category/construction-workers"
                className="px-6 md:px-8 py-3 md:py-4 bg-white text-brand-burgundy rounded-xl md:rounded-2xl font-semibold hover:bg-neutral-100 transition-all shadow-lg hover:shadow-xl btn-press text-sm md:text-base"
              >
                {t('exploreListings')}
              </Link>
              <Link
                to="/register"
                className="px-6 md:px-8 py-3 md:py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl md:rounded-2xl font-semibold hover:bg-white/20 transition-all btn-press text-sm md:text-base"
              >
                {t('createAccount')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
