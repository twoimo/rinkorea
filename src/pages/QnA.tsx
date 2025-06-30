import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QnAStats from '@/components/qna/QnAStats';
import QnAFilters from '@/components/qna/QnAFilters';
import QnAForm from '@/components/qna/QnAForm';
import QnAEditForm from '@/components/qna/QnAEditForm';
import QnAItem from '@/components/qna/QnAItem';
import QnAHero from '@/components/qna/QnAHero';
import QnAEmptyState from '@/components/qna/QnAEmptyState';
import QnASkeleton from '@/components/qna/QnASkeleton';
import { useInquiries } from '@/hooks/useInquiries';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const QnA = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    inquiries,
    loading,
    refetch,
    createInquiry,
    updateInquiry,
    deleteInquiry
  } = useInquiries();

  const [showForm, setShowForm] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(t('qna_filter_all', '전체'));

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.content.toLowerCase().includes(searchTerm.toLowerCase());

    const allStatuses = [t('qna_filter_all', '전체'), '전체', 'All', '全部'];
    const answeredStatuses = [t('qna_status_answered', '답변완료'), '답변완료', 'Answered', '已回复'];
    const pendingStatuses = [t('qna_status_pending', '답변대기'), '답변대기', 'Pending', '待回复'];

    let matchesStatus = false;
    if (allStatuses.includes(selectedStatus)) {
      matchesStatus = true;
    } else if (answeredStatuses.includes(selectedStatus)) {
      matchesStatus = answeredStatuses.includes(inquiry.status);
    } else if (pendingStatuses.includes(selectedStatus)) {
      matchesStatus = pendingStatuses.includes(inquiry.status);
    } else {
      matchesStatus = inquiry.status === selectedStatus;
    }

    return matchesSearch && matchesStatus;
  });

  const totalInquiries = inquiries.length;
  const answeredStatuses = [t('qna_status_answered', '답변완료'), '답변완료', 'Answered', '已回复'];
  const pendingStatuses = [t('qna_status_pending', '답변대기'), '답변대기', 'Pending', '待回复'];

  const answeredCount = inquiries.filter(inquiry => answeredStatuses.includes(inquiry.status)).length;
  const pendingCount = inquiries.filter(inquiry => pendingStatuses.includes(inquiry.status)).length;

  const editingInquiryData = editingInquiry ? inquiries.find(inquiry => inquiry.id === editingInquiry) : null;

  const handleCreateInquiry = async (formData: {
    title: string;
    content: string;
    category: string;
    is_private: boolean;
  }): Promise<void> => {
    const result = await createInquiry({
      name: user?.user_metadata?.name || user?.email || '익명',
      email: user?.email || 'anonymous@example.com',
      title: formData.title,
      content: formData.content,
      category: formData.category,
      is_private: formData.is_private
    });

    if (result.error) {
      throw new Error('문의 등록에 실패했습니다.');
    }
  };

  console.log('🔍 QnA Debug Info:', {
    loading,
    inquiriesCount: inquiries.length,
    filteredCount: filteredInquiries.length,
    selectedStatus,
    searchTerm,
    firstInquiry: inquiries[0]
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <QnAHero user={user} setShowForm={setShowForm} />

        <section className="py-8 md:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <QnAStats
              totalInquiries={totalInquiries}
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

            {loading ? (
              <QnASkeleton />
            ) : filteredInquiries.length === 0 ? (
              <QnAEmptyState
                searchTerm={searchTerm}
                selectedStatus={selectedStatus}
                user={user}
                setShowForm={setShowForm}
              />
            ) : (
              <div className="space-y-4 md:space-y-6">
                {filteredInquiries.map((inquiry) => (
                  <QnAItem
                    key={inquiry.id}
                    inquiry={inquiry}
                    user={user}
                    onEdit={setEditingInquiry}
                    onDelete={deleteInquiry}
                    onRefetch={refetch}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {showForm && (
        <QnAForm
          onClose={() => setShowForm(false)}
          onSave={handleCreateInquiry}
          onRefetch={refetch}
        />
      )}

      {editingInquiry && editingInquiryData && (
        <QnAEditForm
          inquiry={editingInquiryData}
          onClose={() => setEditingInquiry(null)}
          onSave={updateInquiry}
          onRefetch={refetch}
        />
      )}

      <Footer />
    </div>
  );
};

export default QnA;
