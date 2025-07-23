import React, { useState, useEffect, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, AlertTriangle, BarChart3, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import { LanguageSelector } from '@/components/ui/language-selector';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { cn } from '@/lib/utils';

// Lazy load the AI Search Modal
const AISearchModal = React.lazy(() => import('@/components/ai-search/AISearchModal'));

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const { profile } = useProfile();

  const isHomePage = location.pathname === '/';
  const shouldBeTransparent = isHomePage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isHomePage]);

  const navItems = [
    { name: t('home'), path: '/' },
    { name: t('about'), path: '/about' },
    { name: t('products'), path: '/products' },
    { name: t('equipment'), path: '/equipment' },
    { name: t('shop'), path: '/shop' },
    { name: t('projects'), path: '/projects' },
    { name: t('certificates'), path: '/certificates' },
    { name: t('qna'), path: '/qna' },
    { name: t('news'), path: '/news' },
    { name: t('resources'), path: '/resources' },
    { name: t('contact'), path: '/contact' },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: t('error', '로그아웃 실패'),
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } else {
      toast({
        title: t('success', '로그아웃 완료'),
        description: "안전하게 로그아웃되었습니다."
      });
      navigate('/');
    }
    setIsUserMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleAISearchOpen = () => {
    setIsAISearchOpen(true);
  };

  const handleAISearchClose = () => {
    setIsAISearchOpen(false);
  };

  return (
    <header className={cn(
      "sticky top-0 z-[100] transition-colors duration-200",
      shouldBeTransparent ? "bg-transparent" : "bg-white shadow-md"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center">
            <img
              src={shouldBeTransparent ? "/images/optimized/rin-korea-logo-white.webp" : "/images/optimized/rin-korea-logo-black.webp"}
              alt="린코리아 로고"
              className="h-8 sm:h-10 w-auto transition-all duration-200"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-4 2xl:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "text-sm font-medium transition-colors text-center",
                  location.pathname === item.path
                    ? shouldBeTransparent
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-blue-900 border-b-2 border-blue-900"
                    : shouldBeTransparent
                      ? "text-white hover:text-blue-200"
                      : "text-gray-700 hover:text-blue-900"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu and Controls */}
          <div className="hidden xl:flex items-center space-x-3">
            {/* AI Search Button */}
            <button
              onClick={handleAISearchOpen}
              className={cn(
                "p-2 rounded-lg transition-colors",
                shouldBeTransparent
                  ? "text-white hover:bg-white/20"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              aria-label="AI 검색"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <LanguageSelector
              variant="flag-only"
              isTransparent={shouldBeTransparent}
            />

            {/* User Account */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center",
                    isAdmin
                      ? "bg-red-100 hover:bg-red-200"
                      : shouldBeTransparent
                        ? "bg-white/20 hover:bg-white/30"
                        : "bg-gray-100 hover:bg-gray-200"
                  )}
                  aria-label="사용자 메뉴"
                >
                  <User className={cn(
                    "w-5 h-5",
                    isAdmin ? "text-red-600" : (shouldBeTransparent ? "text-white" : "text-gray-700")
                  )} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[110]">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      {isAdmin ? t('admin') : (profile?.name || t('user'))}
                    </div>
                    {isAdmin && (
                      <>
                        <Link
                          to="/revenue-management"
                          className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors font-semibold border-b border-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BarChart3 className="w-4 h-4 mr-3" />
                          {t('revenue_management')}
                        </Link>
                        <Link
                          to="/admin/vector-management"
                          className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-semibold border-b border-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Search className="w-4 h-4 mr-3" />
                          벡터 DB 관리
                        </Link>
                        <Link
                          to="/admin/danger"
                          className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors font-semibold border-b border-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <AlertTriangle className="w-4 h-4 mr-3" />
                          {t('admin_danger_zone')}
                        </Link>
                      </>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      {t('profile_settings')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('로그인 버튼 클릭됨');
                  navigate('/auth');
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer relative z-10 touch-manipulation",
                  shouldBeTransparent
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                style={{ pointerEvents: 'auto' }}
              >
                {t('login')}
              </button>
            )}
          </div>

          {/* Mobile menu button and controls */}
          <div className="flex items-center space-x-2 xl:hidden">
            {/* Mobile AI Search Button */}
            <button
              onClick={handleAISearchOpen}
              className={cn(
                "p-2 rounded-md transition-colors touch-manipulation",
                shouldBeTransparent
                  ? "text-white hover:bg-white/20"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              aria-label="AI 검색"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Language Selector */}
            <LanguageSelector
              variant="flag-only"
              isTransparent={shouldBeTransparent}
            />

            {/* Mobile Menu Toggle */}
            <button
              className={cn(
                "p-2 rounded-md transition-colors touch-manipulation touch-feedback",
                shouldBeTransparent
                  ? "hover:bg-white/20 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              )}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="메뉴 열기/닫기"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="xl:hidden border-t bg-white fixed inset-x-0 top-[4rem] sm:top-[5rem] z-[90] max-h-[85vh] overflow-y-auto mobile-menu shadow-lg rounded-b-lg">
            <nav className="h-full pb-4 mobile-dropdown">
              <div className="py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "block py-3 px-4 text-base font-medium transition-colors rounded-lg mx-2 touch-manipulation touch-feedback",
                      "hover-desktop-only hover:text-blue-900 hover:bg-blue-50",
                      location.pathname === item.path
                        ? 'text-blue-900 bg-blue-50 font-semibold'
                        : 'text-gray-700'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile User Section */}
              <div className="border-t mt-4 pt-4 mx-2 pb-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2 text-sm text-gray-600 font-medium">
                      {isAdmin ? t('admin_account') : t('welcome', `환영합니다, ${profile?.name || t('user')}님`)}
                    </div>
                    {isAdmin && (
                      <>
                        <Link
                          to="/revenue-management"
                          className="flex items-center px-4 py-3 text-base text-blue-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-blue-900 hover:bg-blue-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <BarChart3 className="w-5 h-5 mr-3" />
                          {t('revenue_management')}
                        </Link>
                        <Link
                          to="/admin/vector-management"
                          className="flex items-center px-4 py-3 text-base text-purple-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-purple-900 hover:bg-purple-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Search className="w-5 h-5 mr-3" />
                          벡터 DB 관리
                        </Link>
                        <Link
                          to="/admin/danger"
                          className="flex items-center px-4 py-3 text-base text-red-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-red-900 hover:bg-red-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <AlertTriangle className="w-5 h-5 mr-3" />
                          {t('admin_danger_zone')}
                        </Link>
                      </>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-base text-gray-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-blue-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      {t('profile_settings')}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-base text-gray-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-blue-900 hover:bg-gray-50"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      {t('logout')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('모바일 로그인 버튼 클릭됨');
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg text-base font-medium transition-colors text-center touch-manipulation touch-feedback cursor-pointer relative z-10"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {t('login')}
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-[80]"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* AI Search Modal */}
      {isAISearchOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex items-center justify-center">
            <LoadingSpinner className="w-8 h-8 text-white" />
          </div>
        }>
          <AISearchModal onClose={handleAISearchClose} />
        </Suspense>
      )}
    </header>
  );
};

export default Header;
