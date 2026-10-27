import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/* Payment method options — defaults overridden by app_settings */
const DEFAULT_METHODS = [
  { id: 'telebirr', label: 'Telebirr',      hint: 'Send to this Telebirr number' },
  { id: 'cbe',      label: 'CBE Birr',      hint: 'Transfer to this CBE account'  },
  { id: 'bank',     label: 'Bank',          hint: 'Bank transfer to this account'  },
];

const PaymentModal = ({ listingId, listingTitle, feeAmount, isDemo, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step,          setStep]         = useState(1);
  const [method,        setMethod]       = useState('telebirr');
  const [receiptFile,   setReceiptFile]  = useState(null);
  const [previewUrl,    setPreviewUrl]   = useState(null);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState('');
  const [copied,        setCopied]       = useState(false);
  const [methods,       setMethods]      = useState(DEFAULT_METHODS);

  // Load payment numbers from DB
  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'payment_methods_v2').single()
      .then(({ data }) => {
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setMethods(data.value.map(m => ({
            id:     m.id,
            label:  m.name,
            number: m.account,
            hint:   m.hint || `Send to this ${m.name} number`,
            logo:   m.logo || null,
          })));
        }
      });
  }, []);

  /* Demo guard */
  if (isDemo) return (
    <Overlay onClose={onClose}>
      <div className="text-center p-6">
        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">Demo Listing</h3>
        <p className="text-sm text-neutral-500 mb-6">This is a sample listing. Payments are disabled for demos.</p>
        <button onClick={onClose} className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold">Close</button>
      </div>
    </Overlay>
  );

  const selectedMethod = methods.find(m => m.id === method) || methods[0];

  const copyNumber = async () => {
    await navigator.clipboard.writeText(selectedMethod.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files are supported.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('Image must be under 5 MB.');        return; }
    setError('');
    setReceiptFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) { setError('Please select a receipt image.'); return; }
    setLoading(true);
    setError('');
    try {
      // Upload to listing-images bucket under receipts/ subfolder
      // (uses the existing public bucket which is confirmed working)
      const ext = receiptFile.name.split('.').pop() || 'jpg';
      const fileName = `receipts/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('listing-images')
        .upload(fileName, receiptFile, { upsert: false, contentType: receiptFile.type });

      if (uploadErr) {
        console.error('Receipt upload error:', uploadErr);
        setError(`Upload failed: ${uploadErr.message}`);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      const { error: payErr } = await supabase.rpc('create_payment', {
        p_listing_id:     listingId,
        p_receipt_url:    publicUrl,
        p_payment_method: method,
      });

      if (payErr) {
        console.error('Payment RPC error:', payErr);
        setError(`Submission failed: ${payErr.message}`);
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Unlock Contact Details</h2>
          {listingTitle && <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">{listingTitle}</p>}
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Fee banner */}
      <div className="flex items-center justify-between bg-brand-burgundy/5 border border-brand-burgundy/15 rounded-xl px-4 py-3 mb-6">
        <span className="text-sm text-neutral-700">Contact-access fee</span>
        <span className="text-xl font-extrabold text-brand-burgundy">
          {feeAmount ?? '—'} <span className="text-sm font-normal text-neutral-500">ETB</span>
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
              step >= s ? 'bg-brand-burgundy text-white' : 'bg-neutral-200 text-neutral-400'
            }`}>{s}</div>
            <span className={`text-xs font-medium ${step >= s ? 'text-neutral-800' : 'text-neutral-400'}`}>
              {s === 1 ? 'Payment' : 'Receipt'}
            </span>
            {s < 2 && <div className="w-8 h-px bg-neutral-200 mx-1" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* ── Step 1: Choose method + instructions ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1.5 ${
                    method === m.id
                      ? 'border-brand-burgundy bg-brand-burgundy/5 text-brand-burgundy'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {m.logo ? (
                    <img src={m.logo} alt={m.label} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs leading-tight text-center">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment instructions */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Instructions</p>
            <div className="flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-[11px] text-neutral-400">{selectedMethod.hint}</p>
                <p className="text-base font-bold text-neutral-900 font-mono tracking-wide">{selectedMethod.number}</p>
              </div>
              <button
                type="button"
                onClick={copyNumber}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {copied ? (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy</>
                )}
              </button>
            </div>
            <ol className="space-y-1.5">
              {[
                `Open your ${selectedMethod.label} app`,
                `Send exactly ${feeAmount ?? '—'} ETB to the number above`,
                'Take a clear screenshot of the confirmation',
                'Come back here and upload it in the next step',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                  <span className="text-brand-burgundy font-bold flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-all">Cancel</button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl bg-brand-burgundy text-white text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors"
            >
              I've Sent the Payment →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Upload receipt ── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Upload Receipt Screenshot</p>

            {previewUrl ? (
              <div className="space-y-3">
                <img src={previewUrl} alt="Receipt" className="w-full max-h-52 object-contain rounded-xl border border-neutral-200 bg-neutral-50" />
                <button
                  type="button"
                  onClick={() => { setReceiptFile(null); setPreviewUrl(null); }}
                  className="text-xs text-brand-burgundy font-medium hover:underline"
                >
                  Remove and choose different image
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-8 cursor-pointer hover:border-brand-burgundy/50 hover:bg-brand-burgundy/[0.02] transition-all">
                <svg className="w-10 h-10 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-semibold text-neutral-700 mb-1">Tap to select receipt image</p>
                <p className="text-xs text-neutral-400">JPG, PNG or screenshot · max 5 MB</p>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your receipt will be reviewed by an admin. Contact details unlock only after verification — usually within 24 hours.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-all"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={loading || !receiptFile}
              className="flex-1 py-3 rounded-xl bg-brand-burgundy text-white text-sm font-semibold hover:bg-brand-burgundy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Submitting…</>
              ) : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}
    </Overlay>
  );
};

/* Overlay wrapper */
const Overlay = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto p-6 animate-fade-in-up">
      {children}
    </div>
  </div>
);

export default PaymentModal;
