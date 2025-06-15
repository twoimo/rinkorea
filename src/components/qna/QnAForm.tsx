
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QnAFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onSubmit: (formData: any) => Promise<void>;
  user: any;
  profile: any;
}

const QnAForm: React.FC<QnAFormProps> = ({
  showForm,
  setShowForm,
  onSubmit,
  user,
  profile
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    content: '',
    is_private: false
  });
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: profile?.phone || user?.user_metadata?.phone || ''
    }));
  }, [user, profile]);

  const validatePhone = (value: string) => {
    return /^0\d{1,2}-\d{3,4}-\d{4}$/.test(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 2) {
      // 지역번호
    } else if (value.length <= 3) {
      value = value.replace(/(\d{2,3})/, '$1');
    } else if (value.length <= 7) {
      value = value.replace(/(\d{2,3})(\d{3,4})/, '$1-$2');
    } else {
      value = value.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    }
    setFormData(prev => ({ ...prev, phone: value }));
    if (value && !validatePhone(value)) {
      setPhoneError('연락처 형식이 올바르지 않습니다. 예: 010-1234-5678');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone && !validatePhone(formData.phone)) {
      setPhoneError('연락처 형식이 올바르지 않습니다. 예: 010-1234-5678');
      return;
    }

    await onSubmit(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      title: '',
      content: '',
      is_private: false
    });
    setShowForm(false);
  };

  if (!showForm) return null;

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm border border-gray-100 mb-6 md:mb-8 animate-fade-in">
      <div className="flex items-center mb-4 md:mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900">새 문의 작성</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 md:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 md:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            className={`w-full px-3 md:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base ${phoneError ? 'border-red-500' : 'border-gray-200'}`}
            placeholder="연락처를 입력하세요"
          />
          {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 md:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
            placeholder="문의 제목을 입력하세요"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            문의 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-3 md:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm md:text-base"
            placeholder="문의하실 내용을 자세히 입력해주세요"
            required
          />
        </div>

        <label className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={formData.is_private}
            onChange={e => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
            className="mr-2 w-4 h-4"
          />
          <span className="text-sm md:text-base">비밀글로 등록 (관리자/작성자만 열람)</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-sm md:text-base"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            문의 접수
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default QnAForm;
