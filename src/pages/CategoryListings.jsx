import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CategoryListings = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategory();
    fetchListings();
  }, [slug, sortBy]);

  const fetchCategory = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      setCategory(data);
    }
  };

  const fetchListings = async () => {
    // First get the category ID
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

    return matchesSearch && matchesPriceMin && matchesPriceMax && matchesLocation;
  });

  const categoryImages = {
    'construction-workers': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=400&fit=crop',
    'houses-for-rent': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop',
    'tutors': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop',
  };

  const getCategoryInfo = () => {
    if (slug === 'construction-workers') {
      return {
        title: 'Find Construction Workers',
        description: 'Explore workers for construction, repairs, and home improvement. Compare skills, experience, availability, and location.',
        placeholder: 'Search by skill or location…',
        specialties: ['General Laborer', 'Painter', 'Carpenter', 'Electrician', 'Plumber'],
        emptyState: 'No workers found. Try changing your search or filters.',
        cardButton: 'View Profile'
      };
    } else if (slug === 'houses-for-rent') {
      return {
        title: 'Find a House for Rent',
        description: 'Explore rental properties, compare monthly prices, and review property details before contacting the owner.',
        placeholder: 'Search by location or property type…',
        emptyState: 'No rental properties found. Try another location or adjust your filters.',
        cardButton: 'View Property'
      };
    } else if (slug === 'tutors') {
      return {
        title: 'Find a Tutor',
        description: 'Explore tutors by subject, experience, and location to find support that matches your learning needs.',
        placeholder: 'Search by subject or location…',
        emptyState: 'No tutors found. Try another subject or location.',
        cardButton: 'View Tutor'
      };
    }
    return null;
  };

  const getCategorySpecificFilters = () => {
    if (slug === 'construction-workers') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            General Laborer
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Painter
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Carpenter
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Electrician
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Plumber
          </button>
        </div>
      );
    } else if (slug === 'houses-for-rent') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            1 Bedroom
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            2 Bedrooms
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            3+ Bedrooms
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Apartment
          </button>
        </div>
      );
    } else if (slug === 'tutors') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Math
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Science
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            English
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:border-brand-burgundy hover:bg-neutral-100 transition-all">
            Amharic
          </button>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-burgundy"></div>
      </div>
    );
  }

  const catInfo = getCategoryInfo();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Category Header */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
        <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/7]">
          <img
            src={categoryImages[slug] || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=400&fit=crop'}
            alt={category?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/90 via-brand-burgundy/40 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">
              {catInfo?.title}
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-neutral-200 line-clamp-2 md:line-clamp-none">{catInfo?.description}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-neutral-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              Search
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
              Price From
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
              Price To
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
              Location
            </label>
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {getCategorySpecificFilters()}
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <p className="text-neutral-600 text-sm md:text-base">
          {filteredListings.length} listings found
        </p>
        <button
          onClick={() => {
            setSearchTerm('');
            setPriceMin('');
            setPriceMax('');
            setLocationFilter('');
          }}
          className="text-sm text-brand-burgundy hover:text-neutral-900 font-medium self-start sm:self-auto"
        >
          Clear Filters
        </button>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-12 text-center border border-neutral-200 mx-4 sm:mx-0">
          <svg className="w-16 h-16 md:w-24 md:h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-2">
            No results found.
          </h3>
          <p className="text-neutral-600 mb-6 text-sm md:text-base">Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 sm:px-0">
          {filteredListings.map((listing) => (
            <Link
              key={listing.id}
              to={`/listing/${listing.id}`}
              className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-neutral-200 group"
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
                    <svg className="w-12 h-12 md:w-16 md:h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {listing.featured && (
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-brand-burgundy text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold shadow-md">
                    Featured
                  </div>
                )}
                {listing.is_demo && (
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-orange-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold shadow-md">
                    Demo
                  </div>
                )}
              </div>
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-brand-burgundy bg-neutral-100 px-2 py-1 rounded-full">
                    {listing.categories?.name}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-1 text-base md:text-lg">
                  {listing.title}
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 mb-3 md:mb-4 line-clamp-2 h-8 md:h-10">
                  {listing.description}
                </p>
                <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-neutral-200">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Price</p>
                    <p className="text-base md:text-lg font-bold text-brand-burgundy">
                      {listing.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 mb-1">Location</p>
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
