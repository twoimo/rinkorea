import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, AlertTriangle, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import { LanguageSelector } from '@/components/ui/language-selector';
import { cn } from '@/lib/utils';

// Memoized Logo Component
const Logo = memo<{ shouldBeTransparent: boolean }>(({ shouldBeTransparent }) => (
  <Link to="/" className="flex items-center">
    <img
      src={shouldBeTransparent ? "/images/rin-korea-logo-white.png" : "/images/rin-korea-logo-black.png"}
      alt="린코리아 로고"
      className="h-8 sm:h-10 w-auto transition-all duration-200"
      loading="eager"
      decoding="async"
    />
  </Link>
));
Logo.displayName = 'Logo';

// Memoized Navigation Item
const NavItem = memo<{
  item: { name: string; path: string };
  currentPath: string;
  shouldBeTransparent: boolean;
  onNavigate: (path: string) => void;
}>(({ item, currentPath, shouldBeTransparent, onNavigate }) => {
  const isActive = currentPath === item.path;

  const handleClick = useCallback(() => {
    onNavigate(item.path);
  }, [item.path, onNavigate]);

  return (
    <Link
      to={item.path}
      onClick={handleClick}
      className={cn(
        "text-sm font-medium transition-colors whitespace-nowrap",
        isActive
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
  );
});
NavItem.displayName = 'NavItem';

// Memoized Desktop Navigation
const DesktopNavigation = memo<{
  navItems: Array<{ name: string; path: string }>;
  currentPath: string;
  shouldBeTransparent: boolean;
  onNavigate: (path: string) => void;
}>(({ navItems, currentPath, shouldBeTransparent, onNavigate }) => (
  <nav className="hidden xl:flex space-x-6 2xl:space-x-8">
    {navItems.map((item) => (
      <NavItem
        key={item.path}
        item={item}
        currentPath={currentPath}
        shouldBeTransparent={shouldBeTransparent}
        onNavigate={onNavigate}
      />
    ))}
  </nav>
));
DesktopNavigation.displayName = 'DesktopNavigation';

// Memoized User Menu
const UserMenu = memo<{
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  user: any;
  isAdmin: boolean;
  profile: any;
  shouldBeTransparent: boolean;
  onSignOut: () => void;
  t: (key: string, fallback?: string) => string;
}>(({ isOpen, onToggle, onClose, user, isAdmin, profile, shouldBeTransparent, onSignOut, t }) => {
  const navigate = useNavigate();

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
    onClose();
  }, [navigate, onClose]);

  const handleRevenueClick = useCallback(() => {
    navigate('/revenue-management');
    onClose();
  }, [navigate, onClose]);

  const handleAdminClick = useCallback(() => {
    navigate('/admin/danger');
    onClose();
  }, [navigate, onClose]);

  const handleAuthClick = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleAuthClick}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer relative z-10 touch-manipulation",
          shouldBeTransparent
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        )}
      >
        {t('login')}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold transition-colors",
          isAdmin
            ? "bg-red-100 text-red-800"
            : shouldBeTransparent
              ? "bg-white/20 text-white hover:bg-white/30"
              : "bg-blue-100 text-blue-800"
        )}
      >
        <User className="w-4 h-4 mr-2" />
        <span className="hidden xl:inline">
          {isAdmin ? t('admin') : (profile?.name || t('user'))}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[110]">
          {isAdmin && (
            <>
              <button
                onClick={handleRevenueClick}
                className="w-full flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors font-semibold border-b border-gray-100"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                {t('revenue_management')}
              </button>
              <button
                onClick={handleAdminClick}
                className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors font-semibold border-b border-gray-100"
              >
                <AlertTriangle className="w-4 h-4 mr-3" />
                {t('admin_danger_zone')}
              </button>
            </>
          )}
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 mr-3" />
            {t('profile_settings')}
          </button>
          <button
            onClick={onSignOut}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
});
UserMenu.displayName = 'UserMenu';

// Memoized Mobile Navigation
const MobileNavigation = memo<{
  isOpen: boolean;
  navItems: Array<{ name: string; path: string }>;
  currentPath: string;
  user: any;
  isAdmin: boolean;
  profile: any;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  onClose: () => void;
  t: (key: string, fallback?: string) => string;
}>(({ isOpen, navItems, currentPath, user, isAdmin, profile, onNavigate, onSignOut, onClose, t }) => {
  const navigate = useNavigate();

  const handleNavClick = useCallback((path: string) => {
    onNavigate(path);
  }, [onNavigate]);

  const handleAuthClick = useCallback(() => {
    navigate('/auth');
    onClose();
  }, [navigate, onClose]);

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
    onClose();
  }, [navigate, onClose]);

  const handleRevenueClick = useCallback(() => {
    navigate('/revenue-management');
    onClose();
  }, [navigate, onClose]);

  const handleAdminClick = useCallback(() => {
    navigate('/admin/danger');
    onClose();
  }, [navigate, onClose]);

  const handleSignOutClick = useCallback(() => {
    onSignOut();
    onClose();
  }, [onSignOut, onClose]);

  if (!isOpen) return null;

  return (
    <div className="xl:hidden border-t bg-white fixed inset-x-0 top-[4rem] sm:top-[5rem] bottom-0 z-[90] overflow-hidden mobile-menu safe-area-inset-bottom">
      <nav className="h-full overflow-y-auto pb-4 mobile-dropdown">
        <div className="py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "block w-full text-left py-3 px-4 text-base font-medium transition-colors rounded-lg mx-2 touch-manipulation touch-feedback",
                "hover-desktop-only hover:text-blue-900 hover:bg-blue-50",
                currentPath === item.path
                  ? 'text-blue-900 bg-blue-50 font-semibold'
                  : 'text-gray-700'
              )}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Mobile User Section */}
        <div className="border-t mt-4 pt-4 mx-2 mobile-portrait-padding">
          {user ? (
            <div className="space-y-2">
              <div className="px-4 py-2 text-sm text-gray-600 font-medium">
                {isAdmin ? t('admin_account') : t('welcome', `환영합니다, ${profile?.name || t('user')}님`)}
              </div>
              {isAdmin && (
                <>
                  <button
                    onClick={handleRevenueClick}
                    className="w-full flex items-center px-4 py-3 text-base text-blue-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-blue-900 hover:bg-blue-50"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    {t('revenue_management')}
                  </button>
                  <button
                    onClick={handleAdminClick}
                    className="w-full flex items-center px-4 py-3 text-base text-red-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-red-900 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-5 h-5 mr-3" />
                    {t('admin_danger_zone')}
                  </button>
                </>
              )}
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center px-4 py-3 text-base text-gray-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-blue-900 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 mr-3" />
                {t('profile_settings')}
              </button>
              <button
                onClick={handleSignOutClick}
                className="w-full flex items-center px-4 py-3 text-base text-gray-700 rounded-lg transition-colors touch-manipulation touch-feedback hover-desktop-only hover:text-blue-900 hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t('logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg text-base font-medium transition-colors text-center touch-manipulation touch-feedback cursor-pointer relative z-10"
            >
              {t('login')}
            </button>
          )}
        </div>
      </nav>
    </div>
  );
});
MobileNavigation.displayName = 'MobileNavigation';

// Main Header Component
const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  // Memoized navigation items
  const navItems = useMemo(() => [
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
  ], [t]);

  // Optimized scroll handler with throttling
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Memoized callbacks
  const handleSignOut = useCallback(async () => {
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
  }, [signOut, toast, t, navigate]);

  const handleNavigation = useCallback((path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
    setIsMenuOpen(false);
  }, [navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  const closeMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  const closeUserMenu = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-[100] transition-colors duration-200",
      shouldBeTransparent ? "bg-transparent" : "bg-white shadow-md"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Logo shouldBeTransparent={shouldBeTransparent} />

          <DesktopNavigation
            navItems={navItems}
            currentPath={location.pathname}
            shouldBeTransparent={shouldBeTransparent}
            onNavigate={handleNavigation}
          />

          {/* Desktop User Menu and Language Selector */}
          <div className="hidden lg:flex items-center space-x-3">
            <UserMenu
              isOpen={isUserMenuOpen}
              onToggle={toggleUserMenu}
              onClose={closeUserMenu}
              user={user}
              isAdmin={isAdmin}
              profile={profile}
              shouldBeTransparent={shouldBeTransparent}
              onSignOut={handleSignOut}
              t={t}
            />

            <LanguageSelector isTransparent={shouldBeTransparent} />
          </div>

          {/* Mobile menu button and language selector */}
          <div className="flex items-center space-x-2 xl:hidden">
            <LanguageSelector
              isTransparent={shouldBeTransparent}
              className="touch-feedback"
            />
            <button
              className={cn(
                "p-2 rounded-md transition-colors touch-manipulation touch-feedback",
                shouldBeTransparent
                  ? "hover:bg-white/20 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              )}
              onClick={toggleMenu}
              aria-label="메뉴 열기/닫기"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <MobileNavigation
          isOpen={isMenuOpen}
          navItems={navItems}
          currentPath={location.pathname}
          user={user}
          isAdmin={isAdmin}
          profile={profile}
          onNavigate={handleNavigation}
          onSignOut={handleSignOut}
          onClose={closeMenus}
          t={t}
        />
      </div>

      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-[80]"
          onClick={closeUserMenu}
        />
      )}
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
