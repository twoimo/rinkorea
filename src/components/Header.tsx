
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import { OptimizedImage } from '@/components/ui/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const { profile } = useProfile();

  const navItems = [
    { name: '홈', path: '/' },
    { name: '회사소개', path: '/about' },
    { name: '제품소개', path: '/products' },
    { name: '온라인 스토어', path: '/shop' },
    { name: '시공사례', path: '/projects' },
    { name: '시험성적서/인증', path: '/certificates' },
    { name: '고객상담', path: '/qna' },
    { name: '공지사항', path: '/news' },
    { name: '연락처', path: '/contact' },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다."
      });
      navigate('/');
    }
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center">
            <OptimizedImage
              src="/images/rin-korea-logo-black.png"
              alt="린코리아 로고"
              className="h-8 sm:h-10 w-auto"
              loadingClassName="bg-white"
              errorClassName="bg-white"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-6 2xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-blue-900 whitespace-nowrap ${location.pathname === item.path
                  ? 'text-blue-900 border-b-2 border-blue-900'
                  : 'text-gray-700'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold transition-colors ${isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden xl:inline">
                    {isAdmin ? '관리자' : (profile?.name || '사용자')}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {isAdmin && (
                      <Link
                        to="/admin/danger"
                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors font-semibold border-b border-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-3" />
                        관리자 위험구역
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      프로필 설정
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                로그인
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="xl:hidden p-2 rounded-md hover:bg-gray-100 transition-colors touch-manipulation"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기/닫기"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="xl:hidden border-t bg-white">
            <nav className="py-4 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block py-4 px-4 text-base font-medium transition-colors hover:text-blue-900 hover:bg-blue-50 rounded-lg mx-2 touch-manipulation ${location.pathname === item.path ? 'text-blue-900 bg-blue-50 font-semibold' : 'text-gray-700'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile User Section */}
              <div className="pt-4 border-t mt-4 mx-2">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2 text-sm text-gray-600 font-medium">
                      {isAdmin ? '관리자 계정' : '환영합니다!'}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin/danger"
                        className="flex items-center px-4 py-3 text-base text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <AlertTriangle className="w-5 h-5 mr-3" />
                        관리자 위험구역
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-base text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      프로필 설정
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-base text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg text-base font-medium transition-colors text-center mx-2 touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
