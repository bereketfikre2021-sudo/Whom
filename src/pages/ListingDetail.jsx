import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal';

/* ── tiny helpers ── */
const DetailPill = ({ label, value }) => (
  value ? (
    <div className="flex flex-col gap-0.5 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  ) : null
);

const TagList = ({ label, items }) => (
  items?.length ? (
    <div className="flex flex-col gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs font-medium text-neutral-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  ) : null
);

/* ── Category-specific detail grids ── */
const CategoryDetails = ({ category, metadata }) => {
  if (!metadata) return null;
  if (category?.slug === 'construction-workers') return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <DetailPill label="Specialty"    value={metadata.worker_type} />
      <DetailPill label="Experience"   value={metadata.experience} />
      <DetailPill label="Availability" value={metadata.availability} />
      <TagList    label="Skills"       items={metadata.skills} />
    </div>
  );
  if (category?.slug === 'houses-for-rent') return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <DetailPill label="Bedrooms"      value={metadata.bedrooms ? `${metadata.bedrooms} bed` : null} />
      <DetailPill label="Bathrooms"     value={metadata.bathrooms ? `${metadata.bathrooms} bath` : null} />
      <DetailPill label="Size"          value={metadata.area} />
      <DetailPill label="Property Type" value={metadata.property_type} />
      <DetailPill label="Furnished"     value={metadata.furnished ? 'Yes' : metadata.furnished === false ? 'No' : null} />
      <TagList    label="Features"      items={metadata.facilities} />
    </div>
  );
  if (category?.slug === 'tutors') return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <DetailPill label="Subject"         value={metadata.subject} />
      <DetailPill label="Grade Level"     value={metadata.grade_level} />
      <DetailPill label="Experience"      value={metadata.experience} />
      <DetailPill label="Qualifications"  value={metadata.qualifications} />
      <DetailPill label="Teaching Style"  value={metadata.teaching_arrangement} />
      <DetailPill label="Schedule"        value={metadata.schedule} />
    </div>
  );
  return null;
};

/* ── Contact unlock states in sidebar ── */
const ContactCard = ({ listing, hasAccess, contactInfo, paymentStatus, onUnlock, user, feeAmount }) => {
  const feeDisplay = feeAmount ?? listing.custom_fee ?? '—';

  /* DEMO listing */
  if (listing.is_demo) return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
      <p className="text-xs text-neutral-500 leading-relaxed">
        This is a sample listing. Contact details are not available on demo listings.
      </p>
    </div>
  );

  /* Already has access */
  if (hasAccess && contactInfo) return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">Payment Verified</p>
          <p className="text-xs text-emerald-600">Contact details are now unlocked.</p>
        </div>
      </div>
      <div className="bg-white border-2 border-brand-burgundy/20 rounded-xl p-5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Contact Details</p>
        <p className="text-lg font-bold text-brand-burgundy break-all">{contactInfo}</p>
      </div>
      <p className="text-xs text-neutral-400 text-center">You won't be charged again for this listing.</p>
    </div>
  );

  /* Pending payment — waiting for admin */
  if (paymentStatus === 'pending') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-800">Payment Under Review</p>
          <p className="text-xs text-amber-600">Your receipt has been submitted. Contact details will unlock once an admin verifies it — usually within 24 hours.</p>
        </div>
      </div>
      <Link to="/account" className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-brand-burgundy border border-brand-burgundy/30 hover:bg-brand-burgundy/5 transition-all">
        Track payment status →
      </Link>
    </div>
  );

  /* Rejected — allow re-submission */
  if (paymentStatus === 'rejected') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-red-700">Payment Rejected</p>
          <p className="text-xs text-red-500">Your previous payment was rejected. You can submit a new receipt.</p>
        </div>
      </div>
      <button
        onClick={onUnlock}
        className="w-full py-3.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors shadow-sm"
      >
        Re-submit Payment
      </button>
    </div>
  );

  /* Default — not yet requested */
  return (
    <div className="space-y-4">
      {/* Steps */}
      <div className="space-y-2">
        {[
          { n: '1', text: 'Review this listing' },
          { n: '2', text: 'Pay the contact-access fee' },
          { n: '3', text: 'Submit payment receipt' },
          { n: '4', text: 'Admin verifies — contact unlocks' },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-burgundy/10 text-brand-burgundy text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {s.n}
            </div>
            <span className="text-xs text-neutral-600">{s.text}</span>
          </div>
        ))}
      </div>

      {/* Fee display */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-neutral-600">Contact-access fee</span>
        <span className="text-lg font-bold text-brand-burgundy">{feeDisplay} <span className="text-sm font-normal text-neutral-500">ETB</span></span>
      </div>

      {/* CTA */}
      {user ? (
        <button
          onClick={onUnlock}
          className="w-full py-3.5 bg-brand-burgundy text-white rounded-xl text-sm font-bold hover:bg-brand-burgundy-dark transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Request Contact Details
        </button>
      ) : (
        <div className="space-y-2">
          <Link
            to="/login"
            className="block w-full py-3.5 bg-brand-burgundy text-white rounded-xl text-sm font-bold text-center hover:bg-brand-burgundy-dark transition-colors"
          >
            Sign in to unlock contact
          </Link>
          <p className="text-xs text-neutral-400 text-center">You need an account to submit a payment.</p>
        </div>
      )}

      <p className="text-xs text-neutral-400 text-center leading-relaxed">
        Contact details are only revealed after your payment is verified by an admin.
      </p>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing,       setListing]       = useState(null);
  const [category,      setCategory]      = useState(null);
  const [categoryFee,   setCategoryFee]   = useState(null);
  const [hasAccess,     setHasAccess]     = useState(false);
  const [contactInfo,   setContactInfo]   = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (user && listing) checkAccessAndPayment();
  }, [user, listing]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select(`id, category_id, title, description, price, location, images,
               status, fee_type, custom_fee, featured, is_demo, metadata, created_at,
               categories(*)`)
      .eq('id', id)
      .single();
    if (!error && data) {
      setListing(data);
      setCategory(data.categories);
      // fetch category fee if needed
      if (data.fee_type === 'category' || !data.custom_fee) {
        const { data: feeData } = await supabase
          .from('category_fees')
          .select('fee_amount')
          .eq('category_id', data.category_id)
          .single();
        if (feeData) setCategoryFee(feeData.fee_amount);
      }
    }
    setLoading(false);
  };

  const checkAccessAndPayment = async () => {
    /* 1 — check if contact is already unlocked */
    const { data: accessData } = await supabase
      .rpc('has_contact_access', { listing_id: id, user_id: user.id });

    if (accessData) {
      setHasAccess(true);
      const { data: contactData } = await supabase
        .rpc('get_contact_info', { listing_id: id, user_id: user.id });
      if (contactData?.length > 0) setContactInfo(contactData[0].contact_info);
      return;
    }

    /* 2 — check if there's a pending / rejected payment */
    const { data: paymentData } = await supabase
      .from('payments')
      .select('status')
      .eq('listing_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paymentData) setPaymentStatus(paymentData.status);
  };

  const getFeeAmount = () => {
    if (!listing) return null;
    if (listing.fee_type === 'custom' && listing.custom_fee) return listing.custom_fee;
    return categoryFee;
  };

  const handleUnlock = () => {
    if (!user) { navigate('/login'); return; }
    setShowModal(true);
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-burgundy" />
    </div>
  );

  /* ── Not found ── */
  if (!listing) return (
    <div className="text-center py-20">
      <p className="text-lg font-semibold text-neutral-700 mb-2">Listing not found</p>
      <p className="text-sm text-neutral-400 mb-6">It may have been removed or is unavailable.</p>
      <Link to="/" className="px-5 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold">Back to home</Link>
    </div>
  );

  /* ── Inactive ── */
  if (listing.status !== 'active') return (
    <div className="text-center py-20">
      <p className="text-lg font-semibold text-neutral-700 mb-2">This listing is no longer available</p>
      <Link to={`/category/${category?.slug}`} className="px-5 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold">
        Browse similar listings
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link to="/" className="hover:text-brand-burgundy transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/category/${category?.slug}`} className="hover:text-brand-burgundy transition-colors">{category?.name}</Link>
        <span>/</span>
        <span className="text-neutral-700 font-medium truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Image gallery — 3:4 portrait for people, 16:9 for houses */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {listing.images?.length > 0 ? (
              (() => {
                const isPerson = category?.slug === 'construction-workers' || category?.slug === 'tutors';
                if (isPerson) {
                  const hasMultiple = listing.images.length > 1;
                  return (
                    <div className={`flex gap-1 p-1 ${!hasMultiple ? 'justify-start' : ''}`}>
                      {/* Main portrait — fixed 3:4, capped width when solo */}
                      <div className={hasMultiple ? 'w-1/2 flex-shrink-0' : 'w-48 sm:w-56 md:w-64 flex-shrink-0'}>
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full aspect-[3/4] object-cover rounded-xl"
                        />
                      </div>
                      {/* Secondary images stacked — only shown when they exist */}
                      {hasMultiple && (
                        <div className="flex-1 flex flex-col gap-1">
                          {listing.images.slice(1, 3).map((img, i) => (
                            <img key={i} src={img} alt="" className="w-full flex-1 object-cover rounded-xl" style={{ minHeight: 0 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className={`grid gap-1 p-1 ${listing.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className={`w-full object-cover rounded-xl ${listing.images.length > 1 ? 'aspect-square row-span-2' : 'aspect-[16/9]'}`}
                    />
                    {listing.images.slice(1, 3).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded-xl" />
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="aspect-[16/7] bg-neutral-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title + badges */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-brand-burgundy bg-brand-burgundy/8 px-3 py-1 rounded-full">
                {category?.name}
              </span>
              {listing.featured && (
                <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">Featured</span>
              )}
              {listing.is_demo && (
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">Demo</span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">{listing.title}</h1>
              <div className="flex items-center gap-4 mt-3">
                {listing.price && (
                  <span className="text-2xl font-extrabold text-brand-burgundy">{listing.price}</span>
                )}
                {listing.location && (
                  <span className="flex items-center gap-1 text-sm text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.location}
                  </span>
                )}
              </div>
            </div>

            {/* Category-specific details */}
            <CategoryDetails category={category} metadata={listing.metadata} />

            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-2">About this listing</h2>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            <p className="text-xs text-neutral-400">
              Posted {new Date(listing.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ── Right: contact sidebar ── */}
        <div className="space-y-4 lg:space-y-5">
          {/* Contact card — NOT sticky, flows naturally */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">
              {hasAccess ? 'Contact Details' : 'Get in Touch'}
            </h3>
            <ContactCard
              listing={listing}
              hasAccess={hasAccess}
              contactInfo={contactInfo}
              paymentStatus={paymentStatus}
              onUnlock={handleUnlock}
              user={user}
              feeAmount={getFeeAmount()}
            />
          </div>

          {/* Safety tips */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Tips</h3>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              {[
                'Review the listing carefully before making any payment.',
                'Only submit a payment if you intend to contact this person.',
                'Communicate by phone first before visiting in person.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-brand-burgundy mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showModal && (
        <PaymentModal
          listingId={listing.id}
          listingTitle={listing.title}
          feeAmount={getFeeAmount()}
          isDemo={listing.is_demo}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setPaymentStatus('pending');
            checkAccessAndPayment();
          }}
        />
      )}

    </div>
  );
};

export default ListingDetail;
