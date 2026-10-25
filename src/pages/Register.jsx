import { useNavigate, Link } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useLanguage } from '../contexts/LanguageContext';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-fade-in-up">

        {/* Logo + brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex mb-6 group" aria-label="ምን እናቅርብ — home">
            <img src="/Logo.svg" alt="ምን እናቅርብ" className="h-7 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1.5">Create your account</h1>
          <p className="text-sm text-neutral-500">Sign up to browse listings and manage your payments.</p>
        </div>

        {/* What you get */}
        <div className="mb-5 space-y-2">
          {[
            'Browse workers, homes, and tutors',
            'Unlock contact details after payment',
            'Track all your payment history',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-brand-burgundy/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-brand-burgundy" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-neutral-600">{item}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <GoogleAuthButton />
          <p className="mt-5 text-center text-xs text-neutral-400 leading-relaxed">
            By continuing you agree to our terms of service and privacy policy.
          </p>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-burgundy font-semibold hover:underline">
            Log in
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-neutral-400 hover:text-brand-burgundy transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
