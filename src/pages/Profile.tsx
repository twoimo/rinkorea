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

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필 설정</h1>
              <p className="text-gray-600">회원 정보를 수정하거나 계정을 관리하세요</p>

              {isAdmin && (
                <div className="mt-4 inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4 mr-1" />
                  관리자 계정
                </div>
              )}
            </div>

            <div className="space-y-6">
              <form onSubmit={handleSaveAll} className="space-y-6">
                {/* 안내문구 */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4 text-yellow-800 text-sm">
                  <strong>비밀번호 찾기 기능이 없습니다.</strong><br />
                  비밀번호를 변경하실 때는 반드시 기억해 주세요. 분실 시 복구가 불가능합니다.
                </div>
                {/* 이메일 (읽기 전용) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    이메일
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
                </div>
                {/* 사용자 역할 (읽기 전용) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    계정 유형
                  </label>
                  <input
                    type="text"
                    value={role === 'admin' ? '관리자' : '일반 사용자'}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                  />
                </div>
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                {/* 회사명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    회사명
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="회사명을 입력하세요"
                  />
                </div>
                {/* 전화번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="전화번호를 입력하세요"
                  />
                  {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                </div>
                {/* 비밀번호 변경 */}
                <div className="border-t pt-8 mt-8">
                  <h2 className="text-lg font-bold mb-4 flex items-center"><span className="mr-2">비밀번호 변경</span></h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="현재 비밀번호 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="새 비밀번호 입력 (8자 이상)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="새 비밀번호 재입력"
                      />
                    </div>
                    {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                    {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50"
                  disabled={savingAll || !isAnyChanged}
                >
                  {savingAll ? '저장 중...' : '변경사항 저장'}
                </button>
              </form>

              {/* 구분선 */}
              <hr className="my-8" />

              {/* 계정 탈퇴 섹션 */}
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-red-900">위험 구역</h3>
                </div>
                <p className="text-red-700 mb-4">
                  계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                  {isAdmin && (
                    <span className="block mt-2 font-medium">
                      ⚠️ 관리자 계정은 탈퇴 후 Supabase 대시보드에서 완전히 삭제해야 합니다.
                    </span>
                  )}
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    계정 탈퇴
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-800 font-medium">정말로 계정을 탈퇴하시겠습니까?</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeleteAccount}
                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        네, 탈퇴합니다
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
