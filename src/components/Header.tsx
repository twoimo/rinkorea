
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="https://rinkorea.com/wp-content/uploads/2021/11/린코리아-홈페이지-로고-블랙.png" 
              alt="린코리아 로고" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-blue-900 ${
                  location.pathname === item.path 
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
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
                >
                  <User className="w-5 h-5" />
                  <span>메뉴</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600">환영합니다!</p>
                    </div>
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
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block py-3 px-2 text-sm font-medium transition-colors hover:text-blue-900 hover:bg-gray-50 rounded ${
                  location.pathname === item.path ? 'text-blue-900 bg-blue-50' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-2 py-2 text-sm text-gray-600 font-medium">
                    환영합니다!
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-2 py-3 text-sm text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    프로필 설정
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-2 py-3 text-sm text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center mx-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  로그인
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
