import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const PaymentModal = ({ listingId, feeAmount, isDemo, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  if (isDemo) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3L13.732 20c.77 1.333 2.694 1.333 3.464 0L19.07 13c.77-1.333 1.192-3 1.732-3L13.732 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">{t('demoListing')}</h3>
          <p className="text-neutral-600 mb-6">{t('demoNoPayment')}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-burgundy text-white rounded-xl font-medium hover:bg-neutral-900 transition-all btn-press"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t('fileTypeNotSupported'));
        setReceiptFile(null);
        setPreviewUrl(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(t('fileSizeExceeded'));
        setReceiptFile(null);
        setPreviewUrl(null);
        return;
      }
      setReceiptFile(file);
      setError('');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!receiptFile) {
      setError(t('selectReceiptImage'));
      setLoading(false);
      return;
    }

    try {
      const fileName = `${user.id}/${Date.now()}_${receiptFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (uploadError) {
        setError(t('paymentSubmitError'));
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      const { error: paymentError } = await supabase.rpc('create_payment', {
        p_listing_id: listingId,
        p_receipt_url: publicUrl,
        p_payment_method: paymentMethod,
      });

      if (paymentError) {
        setError(t('paymentSubmitError'));
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError(t('paymentSubmitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t('unlockContactDetailsTitle')}</h2>
              <p className="text-neutral-600 text-sm">
                {t('submitPaymentDesc')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors btn-press"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200 mb-6 text-center">
            <p className="text-sm text-neutral-600 mb-2">{t('contactAccessFee')}</p>
            <p className="text-5xl font-bold text-brand-burgundy mb-1">
              {feeAmount}
            </p>
            <p className="text-neutral-500">{t('etb')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                {t('paymentMethod')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('telebirr')}
                  className={`p-4 rounded-xl border-2 transition-all btn-press ${
                    paymentMethod === 'telebirr'
                      ? 'border-brand-burgundy bg-neutral-100'
                      : 'border-neutral-200 hover:border-brand-burgundy/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-brand-burgundy rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-neutral-900">Telebirr</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cbe')}
                  className={`p-4 rounded-xl border-2 transition-all btn-press ${
                    paymentMethod === 'cbe'
                      ? 'border-brand-burgundy bg-neutral-100'
                      : 'border-neutral-200 hover:border-brand-burgundy/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-brand-burgundy rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-neutral-900">CBE</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-brand-burgundy bg-neutral-100'
                      : 'border-neutral-200 hover:border-brand-burgundy/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-brand-burgundy rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-neutral-900">Bank</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                {t('paymentReceipt')}
              </label>
              <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center hover:border-brand-burgundy/50 transition-all">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-brand-burgundy hover:text-neutral-900 font-medium"
                    >
                      {t('removeUpload')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {t('uploadReceiptDesc')}
                      </p>
                      <label className="inline-block px-4 py-2 bg-brand-burgundy text-white rounded-lg text-sm font-medium hover:bg-neutral-900 cursor-pointer transition-all">
                        {t('selectReceipt')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-neutral-100 rounded-xl p-4 border border-neutral-200">
              <p className="text-sm text-brand-burgundy">
                <strong>{t('note')}:</strong> {t('noteDesc')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-brand-burgundy text-white rounded-xl font-semibold hover:bg-neutral-900 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('signingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('submitPayment')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
