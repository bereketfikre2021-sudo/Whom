import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, isAdmin, signOut } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('Layout render - user:', user?.email, 'isAdmin:', isAdmin);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
              <img
                src="/Logo.svg"
                alt="የሚፈልጉትን ያግኙ"
                className="h-8 md:h-10 w-auto group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold text-neutral-900 group-hover:text-brand-burgundy transition-colors">
                  የሚፈልጉትን ያግኙ
                </h1>
                <p className="text-xs text-neutral-500">Find What You Need</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-neutral-100 text-brand-burgundy'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-burgundy'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                to="/category/construction-workers"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.includes('construction')
                    ? 'bg-neutral-100 text-brand-burgundy'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-burgundy'
                }`}
              >
                {t('constructionWorkers')}
              </Link>
              <Link
                to="/category/houses-for-rent"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.includes('houses')
                    ? 'bg-neutral-100 text-brand-burgundy'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-burgundy'
                }`}
              >
                {t('housesForRent')}
              </Link>
              <Link
                to="/category/tutors"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.includes('tutors')
                    ? 'bg-neutral-100 text-brand-burgundy'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-burgundy'
                }`}
              >
                {t('tutors')}
              </Link>
            </nav>

            {/* Desktop Language Toggle & Auth */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Language Toggle */}
              <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    language === 'en'
                      ? 'bg-white text-brand-burgundy shadow-sm'
                      : 'text-neutral-600 hover:text-brand-burgundy'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('am')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    language === 'am'
                      ? 'bg-white text-brand-burgundy shadow-sm'
                      : 'text-neutral-600 hover:text-brand-burgundy'
                  }`}
                >
                  አማርኛ
                </button>
              </div>

              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        location.pathname.startsWith('/admin')
                          ? 'bg-neutral-100 text-brand-burgundy'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-burgundy'
                      }`}
                    >
                      {t('admin')}
                    </Link>
                  )}
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-neutral-500 hover:text-brand-burgundy transition-colors"
                    >
                      {t('logOut')}
                    </button>
                  </div>
                  <div className="w-10 h-10 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-semibold">
                    {(user.user_metadata?.full_name || 'U')[0].toUpperCase()}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-all"
                  >
                    {t('logIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-brand-burgundy text-white hover:bg-neutral-900 shadow-md hover:shadow-lg transition-all"
                  >
                    {t('signUp')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive('/')
                      ? 'bg-neutral-100 text-brand-burgundy'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {t('home')}
                </Link>
                <Link
                  to="/category/construction-workers"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.includes('construction')
                      ? 'bg-neutral-100 text-brand-burgundy'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {t('constructionWorkers')}
                </Link>
                <Link
                  to="/category/houses-for-rent"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.includes('houses')
                      ? 'bg-neutral-100 text-brand-burgundy'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {t('housesForRent')}
                </Link>
                <Link
                  to="/category/tutors"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.includes('tutors')
                      ? 'bg-neutral-100 text-brand-burgundy'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {t('tutors')}
                </Link>
              </nav>

              {/* Mobile Language Toggle */}
              <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    language === 'en'
                      ? 'bg-white text-brand-burgundy shadow-sm'
                      : 'text-neutral-600 hover:text-brand-burgundy'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('am')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    language === 'am'
                      ? 'bg-white text-brand-burgundy shadow-sm'
                      : 'text-neutral-600 hover:text-brand-burgundy'
                  }`}
                >
                  አማርኛ
                </button>
              </div>

              {/* Mobile Auth */}
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        location.pathname.startsWith('/admin')
                          ? 'bg-neutral-100 text-brand-burgundy'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {t('admin')}
                    </Link>
                  )}
                  <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-semibold">
                        {(user.user_metadata?.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <Link
                          to="/account"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs text-neutral-500 hover:text-brand-burgundy"
                        >
                          {t('myAccount')}
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-neutral-500 hover:text-brand-burgundy transition-colors"
                    >
                      {t('logOut')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-lg text-sm font-medium text-center text-neutral-600 hover:bg-neutral-100 transition-all"
                  >
                    {t('logIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-lg text-sm font-medium text-center bg-brand-burgundy text-white hover:bg-neutral-900 shadow-md transition-all"
                  >
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-burgundy mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 md:space-x-3 mb-4">
                <img
                  src="/Logo.svg"
                  alt="የሚፈልጉትን ያግኙ"
                  className="h-6 md:h-8 w-auto drop-shadow-lg"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <div>
                  <h3 className="text-sm md:text-base font-bold text-white">የሚፈልጉትን ያግኙ</h3>
                  <p className="text-xs text-neutral-200">Find What You Need</p>
                </div>
              </div>
              <p className="text-neutral-200/80 text-xs md:text-sm mb-4 max-w-md leading-relaxed">
                A simpler way to find construction workers,<br />rental houses, and tutors in Ethiopia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm md:text-base">{t('explore')}</h4>
              <ul className="space-y-2 text-xs md:text-sm text-neutral-200/80">
                <li><Link to="/category/construction-workers" className="hover:text-white">{t('constructionWorkers')}</Link></li>
                <li><Link to="/category/houses-for-rent" className="hover:text-white">{t('housesForRent')}</Link></li>
                <li><Link to="/category/tutors" className="hover:text-white">{t('tutors')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm md:text-base">{t('yourAccount')}</h4>
              <ul className="space-y-2 text-xs md:text-sm text-neutral-200/80">
                <li><Link to="/login" className="hover:text-white">{t('logIn')}</Link></li>
                <li><Link to="/register" className="hover:text-white">{t('signUp')}</Link></li>
                <li><Link to="/account" className="hover:text-white">{t('myPayments')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-200/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-neutral-200/60">
            <p>© {new Date().getFullYear()} ምን እናቅርብ {t('allRightsReserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
