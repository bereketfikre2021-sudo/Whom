import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect, useRef } from 'react';

const currentYear = new Date().getFullYear();

/* ── tiny icon helpers ── */
const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ChevronIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const Layout = ({ children }) => {
  const { user, isAdmin, signOut } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  /* close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const navLinks = [
    { to: '/category/construction-workers', label: t('constructionWorkers'), match: 'construction' },
    { to: '/category/tutors',               label: t('tutors'),               match: 'tutors'       },
    { to: '/category/houses-for-rent',      label: t('housesForRent'),        match: 'houses'       },
  ];

  const isActive = (match) =>
    match === '/' ? location.pathname === '/' : location.pathname.includes(match);

  const navCls = (match) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
      isActive(match)
        ? 'text-brand-burgundy bg-brand-burgundy/8'
        : 'text-neutral-600 hover:text-brand-burgundy hover:bg-neutral-100'
    }`;

  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col">

      {/* ══════════════ HEADER ══════════════ */}
      <header
        ref={menuRef}
        className={`bg-white sticky top-0 z-50 border-b border-neutral-200 transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : 'shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-4">

            {/* Logo — wordmark only, no duplicate text */}
            <Link to="/" className="flex-shrink-0 group" aria-label="ምን እናቅርብ — home">
              <img
                src="/Logo.svg"
                alt="ምን እናቅርብ"
                className="h-6 md:h-7 w-auto transition-opacity group-hover:opacity-75"
              />
            </Link>

            {/* Desktop nav — centre */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className={navCls(l.match)}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Desktop right: lang + auth */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {/* Lang pill */}
              <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 gap-0.5">
                {['en', 'am'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      language === lang
                        ? 'bg-white text-brand-burgundy shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : 'አማ'}
                  </button>
                ))}
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Link to="/admin" className={navCls('admin')}>
                      {t('admin')}
                    </Link>
                  )}
                  <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
                    <div className="text-right leading-tight">
                      <p className="text-xs font-semibold text-neutral-900 max-w-[100px] truncate">
                        {user.user_metadata?.full_name || 'Account'}
                      </p>
                      <button
                        onClick={signOut}
                        className="text-[11px] text-neutral-400 hover:text-brand-burgundy transition-colors"
                      >
                        {t('logOut')}
                      </button>
                    </div>
                    <Link
                      to="/account"
                      title={t('myAccount')}
                      className="w-8 h-8 rounded-full bg-brand-burgundy text-white text-sm font-bold flex items-center justify-center hover:opacity-85 transition-opacity"
                    >
                      {(user.user_metadata?.full_name || 'U')[0].toUpperCase()}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-brand-burgundy hover:bg-neutral-100 rounded-lg transition-all"
                  >
                    {t('logIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold bg-brand-burgundy text-white rounded-lg hover:bg-brand-burgundy-dark transition-colors shadow-sm"
                  >
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile right: lang pill + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex items-center bg-neutral-100 rounded-md p-0.5 gap-0.5">
                {['en', 'am'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      language === lang
                        ? 'bg-white text-brand-burgundy shadow-sm'
                        : 'text-neutral-500'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : 'አማ'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-250 ease-in-out ${
            menuOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-neutral-100 bg-white px-4 pb-5 pt-3 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(l.match)
                    ? 'bg-brand-burgundy/8 text-brand-burgundy'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {l.label}
                <ChevronIcon />
              </Link>
            ))}

            <div className="pt-2 border-t border-neutral-100 mt-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      {t('admin')} <ChevronIcon />
                    </Link>
                  )}
                  <div className="flex items-center justify-between px-3 py-3 mt-1 bg-neutral-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-burgundy text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {(user.user_metadata?.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 leading-tight">
                          {user.user_metadata?.full_name || 'Account'}
                        </p>
                        <Link to="/account" className="text-xs text-neutral-400 hover:text-brand-burgundy">
                          {t('myAccount')}
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={signOut}
                      className="text-xs font-medium text-neutral-500 hover:text-brand-burgundy transition-colors px-2 py-1 rounded-md hover:bg-neutral-100"
                    >
                      {t('logOut')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    className="w-full text-center py-3 rounded-xl text-sm font-semibold text-brand-burgundy border border-brand-burgundy/30 hover:bg-brand-burgundy/5 transition-all"
                  >
                    {t('logIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-brand-burgundy text-white hover:bg-brand-burgundy-dark transition-colors shadow-sm"
                  >
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════ MAIN ══════════════ */}
      <main className="flex-1 min-h-[60vh]">
        {location.pathname === '/' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            {children}
          </div>
        )}
      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-brand-burgundy mt-auto">
        {/* Desktop footer */}
        <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-8 pb-8 border-b border-white/15">
            {/* Brand */}
            <div>
              <div className="mb-3">
                <img src="/Logo.svg" alt="ምን እናቅርብ" className="h-6 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
              <p className="text-xs text-white/50 leading-relaxed max-w-[220px]">
                Find construction workers, rental homes, and tutors across Ethiopia.
              </p>
            </div>
            {/* Browse */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Browse</p>
              <ul className="space-y-2">
                {navLinks.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-white/70 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Account */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Account</p>
              <ul className="space-y-2">
                <li><Link to="/login"    className="text-sm text-white/70 hover:text-white transition-colors">{t('logIn')}</Link></li>
                <li><Link to="/register" className="text-sm text-white/70 hover:text-white transition-colors">{t('signUp')}</Link></li>
                <li><Link to="/account"  className="text-sm text-white/70 hover:text-white transition-colors">{t('myAccount')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 flex items-center justify-between">
            <p className="text-xs text-white/40">© {currentYear} ምን እናቅርብ</p>
            <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
              {['en', 'am'].map((lang) => (
                <button key={lang} onClick={() => changeLanguage(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${language === lang ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}>
                  {lang === 'en' ? 'EN' : 'አማርኛ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="md:hidden px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <img src="/Logo.svg" alt="ምን እናቅርብ" className="h-5 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
              {['en', 'am'].map((lang) => (
                <button key={lang} onClick={() => changeLanguage(lang)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${language === lang ? 'bg-white/20 text-white' : 'text-white/50'}`}>
                  {lang === 'en' ? 'EN' : 'አማ'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-xs text-white/60 hover:text-white transition-colors">{l.label}</Link>
            ))}
            <Link to="/account" className="text-xs text-white/60 hover:text-white transition-colors">{t('myAccount')}</Link>
          </div>
          <p className="text-[11px] text-white/30">© {currentYear} ምን እናቅርብ</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
