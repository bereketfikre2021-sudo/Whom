import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const listingsData = await supabase
          .from('listings')
          .select(`
            id,
            category_id,
            title,
            price,
            location,
            status,
            featured,
            created_at,
            categories (*)
          `)
          .order('created_at', { ascending: false });

      if (!listingsData.error) setListings(listingsData.data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) {
        setError('Failed to delete listing. Please try again.');
      } else {
        setListings(listings.filter((l) => l.id !== id));
      }
    } catch (err) {
      setError('Failed to delete listing. Please try again.');
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ featured: !currentFeatured })
        .eq('id', id);

      if (error) {
        setError('Failed to update listing. Please try again.');
      } else {
        setListings(
          listings.map((l) =>
            l.id === id ? { ...l, featured: !currentFeatured } : l
          )
        );
      }
    } catch (err) {
      setError('Failed to update listing. Please try again.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        setError('Failed to update listing. Please try again.');
      } else {
        setListings(
          listings.map((l) =>
            l.id === id ? { ...l, status: newStatus } : l
          )
        );
      }
    } catch (err) {
      setError('Failed to update listing. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      active: 'Published',
      inactive: 'Unpublished',
      pending: 'Draft',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Listings Management</h1>
          <p className="text-neutral-600">Manage all marketplace listings</p>
        </div>
        <button
          onClick={() => alert('Listing creation form coming soon.')}
          className="px-6 py-3 bg-brand-burgundy text-white rounded-xl font-semibold hover:bg-neutral-900 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Listing
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-200">
        {listings.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-24 h-24 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No listings yet</h3>
            <p className="text-neutral-600 mb-6">Get started by adding your first listing.</p>
            <button
              onClick={() => alert('Listing creation form coming soon.')}
              className="inline-block px-6 py-3 bg-brand-burgundy text-white rounded-xl font-medium hover:bg-neutral-900 transition-all"
            >
              Add Listing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">{listing.title}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">
                        {listing.categories?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-brand-burgundy">
                        {listing.price}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">{listing.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(listing.id, listing.featured)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          listing.featured
                            ? 'bg-brand-burgundy text-white'
                            : 'bg-gray-100 text-neutral-600 hover:bg-gray-200'
                        }`}
                      >
                        {listing.featured ? 'Featured' : 'Not Featured'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="p-2 text-neutral-500 hover:text-brand-burgundy transition-colors"
                          title="Preview Listing"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          to={`/listing/${listing.id}`}
                          className="p-2 text-neutral-500 hover:text-brand-burgundy transition-colors"
                          title="Edit Listing (view only — edit form coming soon)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(listing.id, listing.status)}
                          className="p-2 text-neutral-500 hover:text-brand-burgundy transition-colors"
                          title={listing.status === 'active' ? 'Unpublish Listing' : 'Publish Listing'}
                        >
                          {listing.status === 'active' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 text-neutral-500 hover:text-red-600 transition-colors"
                          title="Delete Listing"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
  );
};

export default Listings;
