
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInquiries } from '@/hooks/useInquiries';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import QnAHero from '../components/qna/QnAHero';
import QnAStats from '../components/qna/QnAStats';
import QnAFilters from '../components/qna/QnAFilters';
import QnAForm from '../components/qna/QnAForm';
import QnAItem from '../components/qna/QnAItem';
import QnAEmptyState from '../components/qna/QnAEmptyState';

const QnA = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { inquiries, loading, createInquiry, updateInquiry, deleteInquiry, getReplies } = useInquiries();
  const { isAdmin } = useUserRole();
  const { profile } = useProfile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    content: '',
    is_private: false
  });
  const [inquiryReplies, setInquiryReplies] = useState<Record<string, boolean>>({});

  const filteredItems = inquiries.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '전체' ||
      (selectedStatus === '답변완료' && item.status === 'answered') ||
      (selectedStatus === '답변대기' && item.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const checkReplies = async () => {
      const repliesMap: Record<string, boolean> = {};
      for (const inquiry of inquiries) {
        const replies = await getReplies(inquiry.id);
        repliesMap[inquiry.id] = replies.length > 0;
      }
      setInquiryReplies(repliesMap);
    };
    checkReplies();
  }, [inquiries]);

  const handleSubmit = async (formData: any) => {
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

  const maskName = (name: string) => {
    if (!name || isAdmin) return name;
    return name.charAt(0) + '*'.repeat(name.length - 1);
  };

  const answeredCount = Object.values(inquiryReplies).filter(hasReplies => hasReplies).length;
  const pendingCount = Object.values(inquiryReplies).filter(hasReplies => !hasReplies).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main>
        <QnAHero user={user} setShowForm={setShowForm} />

        <section className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <QnAStats 
              totalInquiries={inquiries.length}
              answeredCount={answeredCount}
              pendingCount={pendingCount}
            />

            <QnAFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              showForm={showForm}
              setShowForm={setShowForm}
              user={user}
            />

            <QnAForm
              showForm={showForm}
              setShowForm={setShowForm}
              onSubmit={handleSubmit}
              user={user}
              profile={profile}
            />

            {loading ? (
              <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-100 text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm md:text-base">문의사항을 불러오는 중...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {filteredItems.map((item) => {
                  const isOwner = user && user.id === item.user_id;
                  const canView = !item.is_private || isAdmin || isOwner;
                  const canShowContent = canView && !!user;
                  
                  return (
                    <QnAItem
                      key={item.id}
                      item={item}
                      isOwner={isOwner}
                      isAdmin={isAdmin}
                      canView={canView}
                      canShowContent={canShowContent}
                      inquiryReplies={inquiryReplies}
                      editingInquiryId={editingInquiryId}
                      editFormData={editFormData}
                      setEditFormData={setEditFormData}
                      setEditingInquiryId={setEditingInquiryId}
                      onUpdate={updateInquiry}
                      onDelete={handleDelete}
                      maskName={maskName}
                    />
                  );
                })}
              </div>
            ) : (
              <QnAEmptyState
                searchTerm={searchTerm}
                selectedStatus={selectedStatus}
                user={user}
                setShowForm={setShowForm}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default QnA;
