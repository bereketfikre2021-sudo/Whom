import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [category, setCategory] = useState(null);
  const [categoryFee, setCategoryFee] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchListing();
    if (user) {
      checkAccess();
    }
  }, [id, user]);

  const fetchListing = async () => {
    const { data, error } = await supabase
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
        metadata,
        created_at,
        updated_at,
        categories (*)
      `)
      .eq('id', id)
      .single();

    if (!error && data) {
      setListing(data);
      setCategory(data.categories);
      if (data.fee_type === 'category') {
        fetchCategoryFee(data.category_id);
      }
    }
    setLoading(false);
  };

  const fetchCategoryFee = async (categoryId) => {
    const { data, error } = await supabase
      .from('category_fees')
      .select('*')
      .eq('category_id', categoryId)
      .single();

    if (!error && data) {
      setCategoryFee(data);
    }
  };

  const checkAccess = async () => {
    const { data: hasAccessData, error: accessError } = await supabase
      .rpc('has_contact_access', {
        listing_id: id,
        user_id: user.id,
      });

    if (!accessError && hasAccessData) {
      setHasAccess(true);
      const { data: contactData, error: contactError } = await supabase
        .rpc('get_contact_info', {
          listing_id: id,
          user_id: user.id,
        });

      if (!contactError && contactData && contactData.length > 0) {
        setContactInfo(contactData[0].contact_info);
      }
    } else {
      setHasAccess(false);
      setContactInfo(null);
    }
  };

  const getFeeAmount = () => {
    if (listing.fee_type === 'custom') {
      return listing.custom_fee;
    }
    return categoryFee?.fee_amount || 0;
  };

  const handleUnlockContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowPaymentModal(true);
  };

  const renderCategorySpecificDetails = () => {
    if (!listing.metadata) return null;
    const metadata = listing.metadata;

    if (category?.slug === 'construction-workers') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Specialty</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.worker_type}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Experience</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.experience}</p>
          </div>
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {metadata.skills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-white text-brand-burgundy rounded-full text-sm border border-neutral-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Availability</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.availability}</p>
          </div>
        </div>
      );
    } else if (category?.slug === 'houses-for-rent') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Property Type</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.bedrooms} Bedrooms</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Size</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.area}</p>
          </div>
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Bathrooms</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.bathrooms}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Property Type</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.property_type}</p>
          </div>
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Features</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {metadata.furnished && (
                <span className="px-3 py-1 bg-white text-brand-burgundy rounded-full text-sm border border-neutral-200">
                  Furnished
                </span>
              )}
              {metadata.facilities?.map((facility, idx) => (
                <span key={idx} className="px-3 py-1 bg-white text-brand-burgundy rounded-full text-sm border border-neutral-200">
                  {facility}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (category?.slug === 'tutors') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Subject</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.subject}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Grade Level</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.grade_level}</p>
          </div>
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Experience</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.experience}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Qualifications</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.qualifications}</p>
          </div>
          <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Teaching Preference</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.teaching_arrangement}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <p className="text-sm text-brand-burgundy mb-1">Schedule</p>
            <p className="text-lg font-semibold text-neutral-900">{metadata.schedule}</p>
          </div>
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

  if (!listing) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-neutral-200">
        <svg className="w-24 h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Listing not found</h3>
        <p className="text-neutral-600 mb-6">This listing may have been unpublished or removed.</p>
        <Link
          to={`/category/${category?.slug}`}
          className="inline-block px-6 py-3 bg-brand-burgundy text-white rounded-xl font-medium hover:bg-neutral-900 transition-all"
        >
          Go Back to Category
        </Link>
      </div>
    );
  }

  if (listing.status !== 'active') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-neutral-200">
        <svg className="w-24 h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Listing Unavailable</h3>
        <p className="text-neutral-600 mb-6">This listing is currently unavailable for new payments.</p>
        <Link
          to={`/category/${category?.slug}`}
          className="inline-block px-6 py-3 bg-brand-burgundy text-white rounded-xl font-medium hover:bg-neutral-900 transition-all"
        >
          Browse Other Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link to="/" className="text-neutral-500 hover:text-brand-burgundy">
          Home
        </Link>
        <span className="text-neutral-400">/</span>
        <Link
          to={`/category/${category?.slug}`}
          className="text-neutral-500 hover:text-brand-burgundy"
        >
          {category?.name}
        </Link>
        <span className="text-neutral-400">/</span>
        <span className="text-neutral-900 font-medium">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-200">
            {listing.images && listing.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                <div className="aspect-square md:aspect-auto md:row-span-2">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {listing.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square">
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-[21/9] bg-neutral-100 flex items-center justify-center">
                <svg className="w-24 h-24 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-brand-burgundy bg-neutral-100 px-3 py-1 rounded-full">
                {category?.name}
              </span>
              {listing.featured && (
                <span className="text-sm font-medium text-brand-burgundy bg-neutral-100 px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
              {listing.is_demo && (
                <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  Demo
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              {listing.title}
            </h1>

            {renderCategorySpecificDetails()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
                <p className="text-sm text-neutral-600 mb-2">Price</p>
                <p className="text-3xl font-bold text-brand-burgundy">
                  {listing.price}
                </p>
              </div>
              <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
                <p className="text-sm text-neutral-600 mb-2">Location</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {listing.location}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Description</h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-4">Listing Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Status</p>
                  <p className="font-medium text-neutral-900 capitalize">{listing.status}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Posted Date</p>
                  <p className="font-medium text-neutral-900">
                    {new Date(listing.created_at).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200 sticky top-24">
            {listing.is_demo ? (
              <div className="space-y-4">
                <div className="bg-orange-100 rounded-xl p-6 border border-orange-200 text-center">
                  <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-orange-900 mb-2">Demo Listing</h3>
                  <p className="text-orange-800 text-sm">
                    This is a demonstration listing to show how the marketplace works. Contact details are not available for demo listings.
                  </p>
                </div>

                <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    <strong>Note:</strong> Demo listings do not accept payments. Contact access is disabled for demonstration purposes.
                  </p>
                </div>
              </div>
            ) : hasAccess && contactInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Payment Verified</h3>
                    <p className="text-sm text-neutral-500">You can now view the contact details.</p>
                  </div>
                </div>
                <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-2">Contact Details</p>
                  <p className="text-xl font-bold text-brand-burgundy">{contactInfo}</p>
                </div>
                <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
                  <p className="text-sm text-brand-burgundy">
                    <strong>Note:</strong> You will not be charged again for the same listing.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Want to get in touch?</h3>
                  <p className="text-neutral-600 text-sm">
                    Complete the contact-access payment process to unlock the private contact details for this listing.
                  </p>
                </div>

                <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200 text-center">
                  <p className="text-sm text-neutral-600 mb-2">Contact-Access Fee</p>
                  <p className="text-4xl font-bold text-brand-burgundy mb-1">
                    {getFeeAmount()}
                  </p>
                  <p className="text-sm text-neutral-500">ETB</p>
                </div>

                <button
                  onClick={handleUnlockContact}
                  className="w-full px-6 py-4 bg-brand-burgundy text-white rounded-xl font-semibold hover:bg-neutral-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Unlock Contact Details
                </button>

                <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
                  <p className="text-sm text-brand-burgundy">
                    <strong>Important:</strong> Private contact details are available only after your payment has been verified by the administrator.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Safety Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Stay Safe
            </h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand-burgundy mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verify the listing before making any payment.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand-burgundy mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Only proceed to contact after you have verified the listing.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand-burgundy mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Try to communicate via phone first when possible.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          listingId={listing.id}
          feeAmount={getFeeAmount()}
          isDemo={listing.is_demo}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            checkAccess();
          }}
        />
      )}
    </div>
  );
};

export default ListingDetail;
