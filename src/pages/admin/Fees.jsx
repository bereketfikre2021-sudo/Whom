import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feesData, categoriesData] = await Promise.all([
        supabase.from('category_fees').select('*'),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (!feesData.error) setFees(feesData.data);
      if (!categoriesData.error) setCategories(categoriesData.data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeeChange = (categoryId, value) => {
    setFees(
      fees.map((f) =>
        f.category_id === categoryId ? { ...f, fee_amount: value } : f
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const updates = fees.map((fee) =>
        supabase
          .from('category_fees')
          .update({ fee_amount: fee.fee_amount })
          .eq('category_id', fee.category_id)
      );

      await Promise.all(updates);
      setSaving(false);
      alert('Fees updated successfully.');
    } catch (err) {
      setError('Failed to save fees. Please try again.');
      setSaving(false);
    }
  };

  const getCategoryLabel = (category) => {
    if (category.slug === 'construction-workers') {
      return 'Construction Worker Contact Fee';
    } else if (category.slug === 'houses-for-rent') {
      return 'Rental Property Contact Fee';
    } else if (category.slug === 'tutors') {
      return 'Tutor Contact Fee';
    }
    return `${category.name} Contact Fee`;
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
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Category Fees</h1>
        <p className="text-neutral-600">Manage contact-access fees by category</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-200">
        <div className="space-y-6">
          {categories.map((category) => {
            const fee = fees.find((f) => f.category_id === category.id);
            return (
              <div
                key={category.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-neutral-100 rounded-xl border border-neutral-200"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-brand-burgundy mb-1">
                    {getCategoryLabel(category)}
                  </label>
                  <p className="text-sm text-neutral-600">
                    Fee for accessing contact details in {category.name}
                  </p>
                </div>
                <div className="w-full md:w-48">
                  <div className="relative">
                    <input
                      type="number"
                      value={fee?.fee_amount || ''}
                      onChange={(e) => handleFeeChange(category.id, e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent transition-all text-right"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                      ETB
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-brand-burgundy text-white rounded-xl font-semibold hover:bg-neutral-900 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
        <p className="text-sm text-brand-burgundy">
          <strong>Note:</strong> Fee changes will apply to new payments only. Existing payments are not affected.
        </p>
      </div>
    </div>
  );
};

export default Fees;
