import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QnAStats from '../components/qna/QnAStats';
import QnAFilters from '../components/qna/QnAFilters';
import QnAForm from '../components/qna/QnAForm';
import QnAEditForm from '../components/qna/QnAEditForm';
import QnAItem from '../components/qna/QnAItem';
import QnAHero from '../components/qna/QnAHero';
import QnAEmptyState from '../components/qna/QnAEmptyState';
import { useInquiries } from '@/hooks/useInquiries';
import { useAuth } from '@/contexts/AuthContext';

const QnA = () => {
  const { user } = useAuth();
  const { 
    inquiries, 
    loading, 
    refetch, 
    createInquiry, 
    updateInquiry: originalUpdateInquiry, 
    deleteInquiry 
  } = useInquiries();
  
  const [showForm, setShowForm] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('전체');

  // Wrapper function to match the expected signature
  const updateInquiry = async (id: string, data: any): Promise<void> => {
    await originalUpdateInquiry(id, data);
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '전체' || inquiry.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalInquiries = inquiries.length;
  const answeredCount = inquiries.filter(inquiry => inquiry.status === '답변완료').length;
  const pendingCount = inquiries.filter(inquiry => inquiry.status === '접수').length;

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
            />

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">로딩 중...</p>
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
