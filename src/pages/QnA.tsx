
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminOnly from '../components/AdminOnly';
import { MessageCircle, Plus, Search, User, Calendar, CheckCircle, Clock, ChevronDown, Reply, Trash2, Send, Edit, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInquiries } from '@/hooks/useInquiries';
import { useUserRole } from '@/hooks/useUserRole';
import { Link } from 'react-router-dom';

const QnA = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    content: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { inquiries, loading, createInquiry, updateInquiry, deleteInquiry } = useInquiries();
  const { isAdmin } = useUserRole();

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
        content: ''
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              고객상담 및 문의
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              린코리아 제품에 대한 궁금한 점이나 문의사항이 있으시면 
              언제든지 연락주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="문의하실 내용을 자세히 입력해주세요"
                    required
                  />
                </div>
                
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
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        item.status === 'answered'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status === 'answered' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            답변완료
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            답변대기
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-gray-500 gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <AdminOnly>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="답변하기"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="삭제하기"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </AdminOnly>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{item.content}</p>
                  
                  {/* 관리자 답변 */}
                  {item.admin_reply && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-1 rounded mr-2">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-blue-900">관리자 답변</p>
                        </div>
                        <AdminOnly>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReply(item.id, item.admin_reply)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="답변 수정"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteReply(item.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="답변 삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </AdminOnly>
                      </div>
                      <p className="text-blue-800 leading-relaxed">{item.admin_reply}</p>
                    </div>
                  )}

                  {/* 관리자 답변 입력/수정 폼 */}
                  <AdminOnly>
                    {(replyingTo === item.id || editingReply === item.id) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-3">
                          {editingReply === item.id ? (
                            <Edit className="w-4 h-4 text-gray-600 mr-2" />
                          ) : (
                            <Reply className="w-4 h-4 text-gray-600 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {editingReply === item.id ? '답변 수정' : '관리자 답변 작성'}
                          </span>
                        </div>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답변을 입력하세요..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleReply(item.id)}
                            disabled={!replyText.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {editingReply === item.id ? '수정 완료' : '답변 등록'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}
                  </AdminOnly>
                </div>
              ))}
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

export default QnA;
