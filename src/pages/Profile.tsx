import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import { User, Save, Trash2, AlertTriangle, Shield } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { role: _role, isAdmin: _isAdmin, loading: roleLoading } = useUserRole();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [_isEditing] = useState(false);
  const _modalRef = useRef<HTMLDivElement>(null);
  const _animationFrameRef = useRef<number>();

  const [name, setName] = useState(profile?.name || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [_saving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [_changingPassword] = useState(false);

  // 전화번호 유효성 검사 함수
  const validatePhone = (value: string) => {
    // 010-1234-5678, 02-123-4567 등 다양한 국내 전화번호 패턴 허용
    return /^0\d{1,2}-\d{3,4}-\d{4}$/.test(value);
  };
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    // 01012345678 -> 010-1234-5678, 021234567 -> 02-123-4567
    if (value.length <= 2) {
      // 지역번호
    } else if (value.length <= 3) {
      value = value.replace(/(\d{2,3})/, '$1');
    } else if (value.length <= 7) {
      value = value.replace(/(\d{2,3})(\d{3,4})/, '$1-$2');
    } else {
      value = value.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    }
    setPhone(value);
    if (value && !validatePhone(value)) {
      setPhoneError(t('profile_phone_error'));
    } else {
      setPhoneError('');
    }
  };

  // profile이 변경될 때마다 state 동기화
  React.useEffect(() => {
    setName(profile?.name || '');
    setCompany(profile?.company || '');
    setPhone(profile?.phone || '');
  }, [profile]);

  // 변경 감지
  const isProfileChanged =
    name !== (profile?.name || '') ||
    company !== (profile?.company || '') ||
    phone !== (profile?.phone || '');
  const isPasswordChanged = newPassword.length > 0 || confirmPassword.length > 0 || currentPassword.length > 0;
  const _isAnyChanged = isProfileChanged || isPasswordChanged;
  const [savingAll, setSavingAll] = useState(false);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    let profileOk = true;
    let passwordOk = true;
    setSavingAll(true);
    // 프로필 저장
    if (isProfileChanged) {
      if (phone && !validatePhone(phone)) {
        setPhoneError(t('profile_phone_error'));
        setSavingAll(false);
        return;
      }
      const { error } = await updateProfile({ name, company, phone });
      if (error) {
        toast({ title: t('profile_update_failed'), description: '다시 시도해주세요.', variant: 'destructive' });
        profileOk = false;
      } else {
        toast({ title: 'Profile Update Complete', description: t('profile_update_success') });
      }
    }
    // 비밀번호 변경
    if (isPasswordChanged) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError(t('profile_password_all_required'));
        setSavingAll(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError(t('profile_password_mismatch'));
        setSavingAll(false);
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError(t('profile_password_min_length'));
        setSavingAll(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      if (signInError) {
        setPasswordError(t('profile_password_current_invalid'));
        setSavingAll(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(t('profile_password_change_failed'));
        passwordOk = false;
      } else {
        setPasswordSuccess(t('profile_password_change_success'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    }
    setSavingAll(false);
    if (profileOk && passwordOk) {
      // 모든 변경 성공 시 폼 리셋
      setPhoneError('');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user) return;

      // 1. 데이터베이스 함수를 사용하여 계정 삭제
      const { error: deleteError } = await supabase
        .rpc('delete_user_account');

      if (deleteError) {
        // Error is already handled by toast notification
        throw deleteError;
      }

      // 2. 로컬에서 로그아웃
      const { error: signOutError } = await signOut();
      if (signOutError) {
        // Error is already handled by toast notification
        throw signOutError;
      }

      toast({
        title: t('profile_delete_success'),
        description: t('profile_delete_success')
      });

      navigate('/');
    } catch (error) {
      // Error is already handled by toast notification
      toast({
        title: t('profile_delete_failed'),
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  // ESC 키 이벤트 리스너 추가
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showDeleteConfirm]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading || roleLoading) {
    return (
      <>
        <Header />
        <ProfileSkeleton />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <section className="container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
                  <User className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600" aria-hidden="true" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t('profile_settings', '프로필 설정')}</h2>
                <p className="text-sm sm:text-base text-gray-500">{t('profile_subtitle', '회원정보를 확인하고 수정할 수 있습니다.')}</p>
              </div>

              <form onSubmit={handleSaveAll} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">{t('profile_name', '이름')}</label>
                  <input
                    id="name"
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    aria-label={t('profile_name', '이름')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">{t('profile_email', '이메일')}</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg bg-gray-50 text-base"
                    value={user.email}
                    readOnly
                    disabled
                    aria-label={t('profile_email', '이메일')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="company">{t('profile_company', '회사명')}</label>
                  <input
                    id="company"
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    autoComplete="organization"
                    aria-label={t('profile_company', '회사명')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="phone">{t('profile_phone', '연락처')}</label>
                  <input
                    id="phone"
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    value={phone}
                    onChange={handlePhoneChange}
                    autoComplete="tel"
                    aria-label={t('profile_phone', '연락처')}
                  />
                  {phoneError && <div className="text-xs text-red-600 mt-1">{phoneError}</div>}
                </div>

                <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" /> 비밀번호 변경
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="현재 비밀번호"
                      autoComplete="current-password"
                      aria-label="현재 비밀번호"
                    />
                    <input
                      type="password"
                      className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호"
                      autoComplete="new-password"
                      aria-label="새 비밀번호"
                    />
                    <input
                      type="password"
                      className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 확인"
                      autoComplete="new-password"
                      aria-label="새 비밀번호 확인"
                    />
                  </div>
                  {passwordError && <div className="text-xs text-red-600 mt-2">{passwordError}</div>}
                  {passwordSuccess && <div className="text-xs text-green-700 mt-2">{passwordSuccess}</div>}
                  <div className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>비밀번호를 잊어버리면 복구할 수 없으니 안전한 곳에 보관해주세요.</span>
                  </div>
                </div>

                <div className="flex justify-end mt-6 sm:mt-8">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 touch-manipulation"
                    disabled={savingAll || (!isProfileChanged && !isPasswordChanged)}
                    aria-label="저장"
                  >
                    <Save className="w-5 h-5 mr-2 inline" aria-hidden="true" /> {savingAll ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>

              {/* 계정 탈퇴 섹션 */}
              <div className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-bold text-red-600">계정 탈퇴</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                  계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                <button
                  type="button"
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-lg font-semibold transition-colors touch-manipulation"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="계정 탈퇴"
                >
                  <Trash2 className="w-5 h-5 mr-2 inline" aria-hidden="true" /> 계정 탈퇴
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 계정 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[120]"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg sm:text-xl font-bold">계정 탈퇴 확인</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
              정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                className="flex-1 sm:flex-initial px-4 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg touch-manipulation"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold touch-manipulation"
                onClick={handleDeleteAccount}
              >
                계정 탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;
