import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Mail, Building, Phone, Save, Trash2, AlertTriangle, Shield } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState(profile?.name || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

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
      setPhoneError('전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678');
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
  const isAnyChanged = isProfileChanged || isPasswordChanged;
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
        setPhoneError('전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678');
        setSavingAll(false);
        return;
      }
      const { error } = await updateProfile({ name, company, phone });
      if (error) {
        toast({ title: '프로필 업데이트 실패', description: '다시 시도해주세요.', variant: 'destructive' });
        profileOk = false;
      } else {
        toast({ title: '프로필 업데이트 완료', description: '프로필이 성공적으로 저장되었습니다.' });
      }
    }
    // 비밀번호 변경
    if (isPasswordChanged) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('모든 항목을 입력해주세요.');
        setSavingAll(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('새 비밀번호가 일치하지 않습니다.');
        setSavingAll(false);
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError('비밀번호는 8자 이상이어야 합니다.');
        setSavingAll(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      if (signInError) {
        setPasswordError('현재 비밀번호가 올바르지 않습니다.');
        setSavingAll(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        passwordOk = false;
      } else {
        setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.');
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
      // 먼저 관련 데이터를 삭제 (프로필은 CASCADE로 자동 삭제됨)
      if (user) {
        // 사용자 역할 데이터 삭제
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
      }

      // 계정 로그아웃
      const { error } = await signOut();
      if (error) {
        toast({
          title: "계정 탈퇴 실패",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "계정 탈퇴 완료",
          description: "계정이 성공적으로 탈퇴되었습니다. Supabase 대시보드에서 사용자를 완전히 삭제해주세요."
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-lg">로딩 중...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <User className="w-10 h-10 text-blue-600" aria-hidden="true" />
                </div>
                <h2 className="text-3xl font-bold mb-2">프로필 설정</h2>
                <p className="text-gray-500">회원정보를 확인하고 수정할 수 있습니다.</p>
              </div>
              <form onSubmit={handleSaveAll} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">이름</label>
                  <input
                    id="name"
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    aria-label="이름"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">이메일</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full border px-3 py-2 rounded bg-gray-50"
                    value={user.email}
                    readOnly
                    disabled
                    aria-label="이메일"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="company">회사명</label>
                  <input
                    id="company"
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    autoComplete="organization"
                    aria-label="회사명"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="phone">연락처</label>
                  <input
                    id="phone"
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={phone}
                    onChange={handlePhoneChange}
                    autoComplete="tel"
                    aria-label="연락처"
                  />
                  {phoneError && <div className="text-xs text-red-600 mt-1">{phoneError}</div>}
                </div>
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" /> 비밀번호 변경
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      className="w-full border px-3 py-2 rounded"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="현재 비밀번호"
                      autoComplete="current-password"
                      aria-label="현재 비밀번호"
                    />
                    <input
                      type="password"
                      className="w-full border px-3 py-2 rounded"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호"
                      autoComplete="new-password"
                      aria-label="새 비밀번호"
                    />
                    <input
                      type="password"
                      className="w-full border px-3 py-2 rounded"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 확인"
                      autoComplete="new-password"
                      aria-label="새 비밀번호 확인"
                    />
                  </div>
                  {passwordError && <div className="text-xs text-red-600 mt-1">{passwordError}</div>}
                  {passwordSuccess && <div className="text-xs text-green-700 mt-1">{passwordSuccess}</div>}
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    비밀번호를 잊어버리면 복구할 수 없으니 안전한 곳에 보관해주세요.
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    disabled={savingAll || (!isProfileChanged && !isPasswordChanged)}
                    aria-label="저장"
                  >
                    <Save className="w-5 h-5 mr-2 inline" aria-hidden="true" /> 저장
                  </button>
                  <button
                    type="button"
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="계정 탈퇴"
                  >
                    <Trash2 className="w-5 h-5 mr-2 inline" aria-hidden="true" /> 계정 탈퇴
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
