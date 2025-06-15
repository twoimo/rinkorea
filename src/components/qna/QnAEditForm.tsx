
import React, { useState } from 'react';
import { Edit } from 'lucide-react';

interface Inquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  title: string;
  content: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  is_private: boolean;
}

interface QnAEditFormProps {
  inquiry: Inquiry;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
  onRefetch: () => Promise<void>;
}

const QnAEditForm: React.FC<QnAEditFormProps> = ({
  inquiry,
  onClose,
  onSave,
  onRefetch
}) => {
  const [editFormData, setEditFormData] = useState({
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone || '',
    title: inquiry.title,
    content: inquiry.content,
    is_private: inquiry.is_private
  });

  const handleSave = async () => {
    await onSave(inquiry.id, {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      title: editFormData.title,
      content: editFormData.content,
      is_private: editFormData.is_private
    });
    await onRefetch();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-4 md:mb-6">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Edit className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">문의 수정</h3>
        </div>

        <form className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
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
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
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
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              className="w-full px-3 md:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
              placeholder="연락처를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
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
              value={editFormData.content}
              onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
              rows={6}
              className="w-full px-3 md:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm md:text-base"
              placeholder="문의하실 내용을 자세히 입력해주세요"
              required
            />
          </div>

          <label className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={editFormData.is_private}
              onChange={e => setEditFormData(prev => ({ ...prev, is_private: e.target.checked }))}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm md:text-base">비밀글로 등록 (관리자/작성자만 열람)</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-sm md:text-base"
            >
              <Edit className="w-4 h-4 mr-2" />
              수정 완료
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QnAEditForm;
