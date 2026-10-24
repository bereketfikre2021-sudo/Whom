import { useNavigate } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-6">
            <img
              src="/Logo.svg"
              alt="የሚፈልጉትን ያግኙ"
              className="w-10 h-10"
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-neutral-900">የሚፈልጉትን ያግኙ</h1>
              <p className="text-sm text-neutral-500">Find What You Need</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h2>
          <p className="text-neutral-600">Sign in to access your account and payment history.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200 hover-lift">
          <GoogleAuthButton onSuccess={handleAuthSuccess} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-neutral-600">
            New here?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-brand-burgundy hover:text-neutral-900 font-medium btn-press"
            >
              Create an Account
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-neutral-500 hover:text-brand-burgundy btn-press"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
