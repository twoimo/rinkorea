
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageModal from '../components/ImageModal';
import CertificateForm from '../components/certificates/CertificateForm';
import DeleteConfirmModal from '../components/certificates/DeleteConfirmModal';
import CertificateTypeCard from '../components/certificates/CertificateTypeCard';
import CertificateSection from '../components/certificates/CertificateSection';
import { Award, FileText, Shield, Plus } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useUserRole } from '../hooks/useUserRole';
import { SupabaseClient } from '@supabase/supabase-js';

interface Certificate {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  issue_date?: string;
  expiry_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const Certificates = () => {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUserRole();
  const [showForm, setShowForm] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [hiddenCertificateIds, setHiddenCertificateIds] = useState<string[]>([]);

  const certificateTypes = [
    {
      name: "특허 등록증",
      type: "특허",
      icon: <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />,
      description: "1액형 세라믹 제조기술에 대한 특허 등록으로 기술력을 인정받았습니다."
    },
    {
      name: "불연재 인증",
      type: "성적서",
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />,
      description: "안전한 순수 무기질 세라믹 코팅제입니다"
    },
    {
      name: "품질시험성적서",
      type: "시험성적서",
      icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />,
      description: "공인시험기관에서 실시한 각종 품질 시험 결과를 확인할 수 있습니다."
    }
  ];

  const handleImageClick = (src: string, alt: string, title: string) => {
    setSelectedImage({ src, alt, title });
  };

  const openForm = (certificate?: Certificate) => {
    setEditingCertificate(certificate || null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCertificate(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleFormSave = async (formValues: Partial<Certificate>) => {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload = {
        ...formValues,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingCertificate) {
        result = await (supabase as unknown as SupabaseClient)
          .from('certificates')
          .update(payload)
          .eq('id', editingCertificate.id);
      } else {
        result = await (supabase as unknown as SupabaseClient)
          .from('certificates')
          .insert([{ ...payload, created_at: new Date().toISOString(), is_active: true }]);
      }

      if (result.error) {
        setFormError(result.error.message);
      } else {
        setFormSuccess(editingCertificate ? '인증서가 수정되었습니다.' : '인증서가 추가되었습니다.');
        setTimeout(closeForm, 1500);
        await fetchCertificates();
      }
    } catch (error) {
      setFormError('오류가 발생했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { error } = await (supabase as unknown as SupabaseClient)
        .from('certificates')
        .delete()
        .eq('id', deleteTarget.id);

      if (!error) {
        setCertificates(certificates.filter(c => c.id !== deleteTarget.id));
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleHide = async (certificate: Certificate) => {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      if (hiddenCertificateIds.includes(certificate.id)) {
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('certificate_hidden')
          .delete()
          .eq('certificate_id', certificate.id);
        if (error) setFormError(error.message);
        else setFormSuccess('노출되었습니다.');
      } else {
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('certificate_hidden')
          .upsert({ certificate_id: certificate.id });
        if (error) setFormError(error.message);
        else setFormSuccess('숨김 처리되었습니다.');
      }
      await fetchHiddenCertificates();
      setTimeout(() => setFormSuccess(null), 700);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    }
    setFormLoading(false);
  };

  const fetchCertificates = async () => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from('certificates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setCertificates(data);
    }
  };

  const fetchHiddenCertificates = async () => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from('certificate_hidden')
      .select('certificate_id');
    if (!error && data) {
      setHiddenCertificateIds(data.map((h: { certificate_id: string }) => h.certificate_id));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCertificates();
      await fetchHiddenCertificates();
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">시험성적서/인증</h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              린코리아 제품의 우수한 품질과 안전성을 증명하는 <br className="hidden sm:block" />
              각종 인증서와 시험성적서를 확인하세요.
            </p>
            {isAdmin && (
              <button
                onClick={() => openForm()}
                className="mt-6 sm:mt-8 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center mx-auto touch-manipulation"
              >
                <Plus className="w-5 h-5 mr-2" />
                인증서 추가
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Certificate Types */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {certificateTypes.map((cert, index) => (
              <CertificateTypeCard
                key={index}
                name={cert.name}
                type={cert.type}
                icon={cert.icon}
                description={cert.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Patents and Trademarks */}
      <CertificateSection
        title="특허 및 상표 등록증"
        description="린코리아의 기술력과 브랜드를 보증하는 공식 문서들"
        certificates={certificates.filter(cert => cert.category === 'patent')}
        hiddenCertificateIds={hiddenCertificateIds}
        isAdmin={isAdmin}
        onImageClick={handleImageClick}
        onEdit={openForm}
        onDelete={(cert) => { setDeleteTarget(cert); setShowDeleteConfirm(true); }}
        onToggleHide={handleToggleHide}
        isLoading={formLoading}
        backgroundColor="bg-gray-50"
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      />

      {/* Test Reports */}
      <CertificateSection
        title="RIN-COAT 시험성적서"
        description="공인시험기관에서 실시한 품질 시험 결과 전체 문서"
        certificates={certificates.filter(cert => cert.category === 'certification')}
        hiddenCertificateIds={hiddenCertificateIds}
        isAdmin={isAdmin}
        onImageClick={handleImageClick}
        onEdit={openForm}
        onDelete={(cert) => { setDeleteTarget(cert); setShowDeleteConfirm(true); }}
        onToggleHide={handleToggleHide}
        isLoading={formLoading}
        gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        cardSize="small"
      />

      {/* Rin Korea Test Reports */}
      <CertificateSection
        title="린코리아 시험성적서"
        description="린코리아 제품의 품질을 검증하는 시험성적서"
        certificates={certificates.filter(cert => cert.category === 'rin_test')}
        hiddenCertificateIds={hiddenCertificateIds}
        isAdmin={isAdmin}
        onImageClick={handleImageClick}
        onEdit={openForm}
        onDelete={(cert) => { setDeleteTarget(cert); setShowDeleteConfirm(true); }}
        onToggleHide={handleToggleHide}
        isLoading={formLoading}
        backgroundColor="bg-gray-50"
        gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        cardSize="small"
      />

      {/* Modals */}
      <ImageModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src || ''}
        imageAlt={selectedImage?.alt || ''}
        imageTitle={selectedImage?.title || ''}
      />

      <CertificateForm
        isOpen={showForm}
        certificate={editingCertificate}
        onClose={closeForm}
        onSave={handleFormSave}
        isLoading={formLoading}
        error={formError}
        success={formSuccess}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        certificate={deleteTarget}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      <Footer />
    </div>
  );
};

export default Certificates;
