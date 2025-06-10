import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminOnly from '../components/AdminOnly';
import { MessageCircle, Plus, Search, User, Calendar, CheckCircle, Clock, ChevronDown, Reply, Trash2, Send, Edit, X, Lock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInquiries } from '@/hooks/useInquiries';
import { useUserRole } from '@/hooks/useUserRole';
import { Link } from 'react-router-dom';

const QnA = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { inquiries, loading, createInquiry, updateInquiry, deleteInquiry, getReplies } = useInquiries();
  const { isAdmin } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    title: '',
    content: '',
    is_private: false
  });
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    content: '',
    is_private: false
  });

  const categories = ['전체', '제품문의', '시공문의', '기술지원', '기타'];
  const statusFilter = ['전체', '답변대기', '답변완료'];

  const filteredItems = inquiries.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '전체' ||
      (selectedStatus === '답변완료' && item.status === 'answered') ||
      (selectedStatus === '답변대기' && item.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || ''
    }));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await createInquiry(formData);

    if (error) {
      toast({
        title: "문의 접수 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 답변드리겠습니다.",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        title: '',
        content: '',
        is_private: false
      });
      setShowForm(false);
    }
  };

  const handleReply = async (inquiryId: string) => {
    if (!replyText.trim()) return;

    const { error } = await updateInquiry(inquiryId, {
      admin_reply: replyText,
      status: 'answered'
    });

    if (error) {
      toast({
        title: "답변 등록 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "답변이 등록되었습니다",
        description: "고객에게 답변이 전달되었습니다."
      });
      setReplyingTo(null);
      setEditingReply(null);
      setReplyText('');
    }
  };

  const handleEditReply = (inquiryId: string, currentReply: string) => {
    setEditingReply(inquiryId);
    setReplyText(currentReply);
    setReplyingTo(null);
  };

  const handleDeleteReply = async (inquiryId: string) => {
    if (!confirm('답변을 삭제하시겠습니까?')) return;

    const { error } = await updateInquiry(inquiryId, {
      admin_reply: null,
      status: 'pending'
    });

    if (error) {
      toast({
        title: "답변 삭제 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "답변이 삭제되었습니다",
        description: "답변이 성공적으로 삭제되었습니다."
      });
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('정말로 이 문의를 삭제하시겠습니까?')) return;

    const { error } = await deleteInquiry(inquiryId);

    if (error) {
      toast({
        title: "삭제 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "문의가 삭제되었습니다",
        description: "문의 내역이 성공적으로 삭제되었습니다."
      });
    }
  };

  const cancelEdit = () => {
    setEditingReply(null);
    setReplyingTo(null);
    setReplyText('');
  };

  // 이름 모자이크 처리 함수 추가
  const maskName = (name: string) => {
    if (!name || isAdmin) return name;
    return name.charAt(0) + '*'.repeat(name.length - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">고객상담 및 문의</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아 제품에 대한 문의사항이 있으시면 언제든지 연락주세요.<br />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {!user ? (
                <Link
                  to="/auth"
                  className="inline-flex items-center bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <User className="w-5 h-5 mr-2" />
                  로그인하여 문의하기
                </Link>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  새 문의 작성
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">전체 문의</p>
                  <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">답변 완료</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inquiries.filter(item => item.status === 'answered').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">답변 대기</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inquiries.filter(item => item.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="문의 제목이나 내용을 검색하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {statusFilter.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {/* New Question Button */}
              {user && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  문의하기
                </button>
              )}
            </div>
          </div>

          {/* Question Form */}
          {showForm && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">새 문의 작성</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="연락처를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="문의하실 내용을 자세히 입력해주세요"
                    required
                  />
                </div>

                <label className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={e => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                    className="mr-2"
                  />
                  비밀글로 등록 (관리자/작성자만 열람)
                </label>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    문의 접수
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Q&A List */}
          {loading ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">문의사항을 불러오는 중...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isOwner = user && user.id === item.user_id;
                const canView = !item.is_private || isAdmin || isOwner;
                const canShowContent = canView && !!user;
                return (
                  <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      {/* 상태 뱃지 */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${item.status === 'answered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {item.status === 'answered' ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> 답변완료
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> 답변대기
                          </>
                        )}
                      </span>

                      {/* 사용자 정보 */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm text-gray-500 gap-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {maskName(item.name)}
                          </div>
                          {isAdmin && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.email}</span>
                              </div>
                              {item.phone && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.phone}</span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.created_at).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        {(isAdmin || isOwner) && (
                          <>
                            <button onClick={() => {
                              setEditingInquiryId(item.id);
                              setEditFormData({
                                name: item.name,
                                email: item.email,
                                phone: item.phone || '',
                                title: item.title,
                                content: item.content,
                                is_private: item.is_private || false
                              });
                            }} className="text-blue-600 hover:text-blue-700 p-1" title="수정">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 p-1" title="삭제">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingInquiryId === item.id ? (
                      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8 animate-fade-in">
                        <div className="flex items-center mb-6">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Edit className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">문의 수정</h3>
                        </div>

                        <form className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                이름 <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                              placeholder="문의하실 내용을 자세히 입력해주세요"
                              required
                            />
                          </div>

                          <label className="flex items-center mt-4">
                            <input
                              type="checkbox"
                              checked={editFormData.is_private}
                              onChange={e => setEditFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                              className="mr-2"
                            />
                            비밀글로 등록 (관리자/작성자만 열람)
                          </label>

                          <div className="flex gap-4 pt-4">
                            <button
                              onClick={async () => {
                                await updateInquiry(item.id, {
                                  name: editFormData.name,
                                  email: editFormData.email,
                                  phone: editFormData.phone,
                                  title: editFormData.title,
                                  content: editFormData.content,
                                  is_private: editFormData.is_private
                                });
                                setEditingInquiryId(null);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              수정 완료
                            </button>
                            <button
                              onClick={() => setEditingInquiryId(null)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          {item.is_private && <Lock className="w-4 h-4 text-gray-400 mr-1" />} {item.title}
                        </h3>
                        {canShowContent ? (
                          <>
                            <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                            <RepliesSection inquiryId={item.id} canView={canShowContent} isAdmin={isAdmin} />
                          </>
                        ) : (
                          <div className="text-gray-400 italic flex items-center">
                            <Lock className="w-4 h-4 mr-1" /> 비밀글입니다
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedStatus !== '전체' ? '검색 결과가 없습니다' : '아직 문의사항이 없습니다'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedStatus !== '전체'
                  ? '다른 검색어나 필터를 시도해보세요'
                  : '첫 번째 문의를 남겨주세요'
                }
              </p>
              {!searchTerm && selectedStatus === '전체' && user && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  문의하기
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

function RepliesSection({ inquiryId, canView, isAdmin }) {
  const { getReplies, createReply, updateReply, deleteReply } = useInquiries();
  const [replies, setReplies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [replyText, setReplyText] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  React.useEffect(() => {
    if (canView) {
      setLoading(true);
      getReplies(inquiryId).then(setReplies).finally(() => setLoading(false));
    }
  }, [inquiryId, canView]);
  if (!canView) return null;
  return (
    <div className="mt-6">
      {loading ? <div className="text-gray-400">답변 불러오는 중...</div> : (
        <>
          {replies.length === 0 && <div className="text-gray-400">아직 답변이 없습니다.</div>}
          {replies.map(reply => (
            <div key={reply.id} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 mb-2 flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <User className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-blue-900">관리자 답변</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(reply.created_at).toLocaleString('ko-KR')}</span>
                </div>
                <div className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                  {editingId === reply.id ? (
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full p-2 rounded border" rows={3} />
                  ) : reply.content}
                </div>
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-1 ml-2">
                  {editingId === reply.id ? (
                    <>
                      <button onClick={async () => { await updateReply(reply.id, replyText); setEditingId(null); setReplyText(''); setReplies(await getReplies(inquiryId)); }} className="text-blue-600 text-xs">저장</button>
                      <button onClick={() => { setEditingId(null); setReplyText(''); }} className="text-gray-400 text-xs">취소</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(reply.id); setReplyText(reply.content); }} className="text-blue-600 text-xs">수정</button>
                      <button onClick={async () => { await deleteReply(reply.id); setReplies(await getReplies(inquiryId)); }} className="text-red-600 text-xs">삭제</button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          {isAdmin && (
            <div className="mt-2 flex gap-2">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full p-2 rounded border" rows={3} placeholder="답변을 입력하세요..." />
              <button onClick={async () => { if (!replyText.trim()) return; await createReply(inquiryId, replyText); setReplyText(''); setReplies(await getReplies(inquiryId)); }} className="bg-blue-600 text-white px-4 py-2 rounded">등록</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QnA;
