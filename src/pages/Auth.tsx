import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          // 더 구체적인 에러 메시지 처리
          let errorMessage = error.message;
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = t('auth_invalid_credentials');
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = t('auth_email_not_confirmed');
          }

          toast({
            title: t('auth_login_failed'),
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: t('auth_login_success'),
            description: t('auth_welcome')
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          let errorMessage = error.message;
          if (error.message.includes('User already registered')) {
            errorMessage = t('auth_user_exists');
          }

          toast({
            title: t('auth_signup_failed'),
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: t('auth_signup_success'),
            description: t('auth_confirm_email')
          });
          // 회원가입 후 로그인 페이지로 자동 전환
          setIsLogin(true);
          setPassword(''); // 비밀번호 필드 초기화
        }
      }
    } catch {
      toast({
        title: t('auth_error_occurred'),
        description: t('auth_try_again'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <section className="flex items-center justify-center py-20">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? t('auth_login_title') : t('auth_signup_title')}
              </h1>
              <p className="text-gray-600">
                {isLogin ? t('auth_login_subtitle') : t('auth_signup_subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">{t('auth_name_label')}</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoComplete="name"
                    aria-label={t('auth_name_label')}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">{t('auth_email_label')}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="email"
                  aria-label={t('auth_email_label')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">{t('auth_password_label')}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    aria-label={t('auth_password_label')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPassword ? t('auth_password_hide') : t('auth_password_show')}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('auth_password_min_length')}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-colors"
                aria-label={isLogin ? t('auth_login_button') : t('auth_signup_button')}
                onClick={() => {
                  // Debug log removed for clean code
                }}
              >
                {loading ? (
                  t('auth_processing')
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-4 h-4 mr-2" aria-hidden="true" /> : <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />}
                    {isLogin ? t('auth_login_button') : t('auth_signup_button')}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  // Debug log removed for clean code
                  setIsLogin(!isLogin);
                  setPassword(''); // 모드 변경 시 비밀번호 초기화
                }}
                className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer transition-colors"
                aria-label={isLogin ? t('auth_switch_to_signup') : t('auth_switch_to_login')}
              >
                {isLogin ? t('auth_switch_to_signup') : t('auth_switch_to_login')}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
