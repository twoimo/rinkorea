import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QnAStats from '@/components/qna/QnAStats';
import QnAFilters from '@/components/qna/QnAFilters';
import QnAForm from '@/components/qna/QnAForm';
import QnAEditForm from '@/components/qna/QnAEditForm';
import QnAItem from '@/components/qna/QnAItem';
import QnAHero from '@/components/qna/QnAHero';
import QnAEmptyState from '@/components/qna/QnAEmptyState';
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
    const matchesStatus = selectedStatus === t('qna_filter_all', '전체') || inquiry.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalInquiries = inquiries.length;
  const answeredCount = inquiries.filter(inquiry => inquiry.status === t('qna_status_answered', '답변완료')).length;
  const pendingCount = inquiries.filter(inquiry => inquiry.status === t('qna_status_pending', '접수')).length;

  const editingInquiryData = editingInquiry ? inquiries.find(inquiry => inquiry.id === editingInquiry) : null;

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
              <div className="text-center py-12">
                <p className="text-gray-500">{t('loading', '로딩 중...')}</p>
              </div>
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
          onSave={createInquiry}
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
