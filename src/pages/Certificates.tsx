import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageModal from '../components/ImageModal';
import { Award, FileText, Shield, CheckCircle, Plus, Edit, Trash2, X, EyeOff, Eye } from 'lucide-react';
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
  icon?: React.ReactNode;
  type?: string;
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
  const [formValues, setFormValues] = useState<Partial<Certificate>>({});
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
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      description: "1액형 세라믹 제조기술에 대한 특허 등록으로 기술력을 인정받았습니다."
    },
    {
      name: "불연재 인증",
      type: "성적서",
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      description: "안전한 순수 무기질 세라믹 코팅제입니다"
    },
    {
      name: "품질시험성적서",
      type: "시험성적서",
      icon: <FileText className="w-8 h-8 text-green-600" />,
      description: "공인시험기관에서 실시한 각종 품질 시험 결과를 확인할 수 있습니다."
    }
  ];

  const patentImages = [
    {
      title: "특허등록증",
      src: "/images/scan-0025.jpg",
      alt: "린코리아 특허등록증"
    },
    {
      title: "상표등록증",
      src: "/images/rin-coat.jpg",
      alt: "RIN-COAT 상표등록증"
    },
    {
      title: "유통표준코드 회원증",
      src: "/images/scan-0024.jpg",
      alt: "유통표준코드 회원증"
    }
  ];

  const testReportImages = [
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-01.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 1페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-02.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 2페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-03.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 3페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-04.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 4페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-05.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 5페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-06.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 6페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-07.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 7페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-08.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 8페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-09.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 9페이지"
    },
    {
      title: "불연재 인증",
      src: "/images/rin-coat-test-report-page-10.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 10페이지"
    }
  ];

  const handleImageClick = (src: string, alt: string, title: string) => {
    setSelectedImage({ src, alt, title });
  };

  // 폼 열기
  const openForm = (certificate?: Certificate) => {
    setEditingCertificate(certificate || null);
    setFormValues(certificate ? { ...certificate } : {});
    setShowForm(true);
  };

  // 폼 닫기
  const closeForm = () => {
    setShowForm(false);
    setEditingCertificate(null);
    setFormValues({});
    setFormError(null);
    setFormSuccess(null);
  };

  // 인증서 저장(추가/수정)
  const handleFormSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Refresh certificates
        const { data } = await (supabase as unknown as SupabaseClient)
          .from('certificates')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });
        if (data) {
          setCertificates(data);
        }
      }
    } catch (error) {
      setFormError('오류가 발생했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 인증서 삭제
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

  // 인증서 숨기기/보이기 토글
  const handleToggleHide = async (certificate: Certificate) => {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      if (hiddenCertificateIds.includes(certificate.id)) {
        // 숨김 해제
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('certificate_hidden')
          .delete()
          .eq('certificate_id', certificate.id);
        if (error) setFormError(error.message);
        else setFormSuccess('노출되었습니다.');
      } else {
        // 숨기기
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

  // 숨김 인증서 목록 불러오기
  const fetchHiddenCertificates = async () => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from('certificate_hidden')
      .select('certificate_id');
    if (!error && data) {
      setHiddenCertificateIds(data.map((h: { certificate_id: string }) => h.certificate_id));
    }
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('certificates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setCertificates(data);
      }
      setLoading(false);
    };
    fetchCertificates();
  }, []);

  useEffect(() => {
    const fetchHiddenCertificates = async () => {
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('certificate_hidden')
        .select('certificate_id');
      if (!error && data) {
        setHiddenCertificateIds(data.map((h: { certificate_id: string }) => h.certificate_id));
      }
    };
    fetchHiddenCertificates();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">시험성적서/인증</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아 제품의 우수한 품질과 안전성을 증명하는 <br />
              각종 인증서와 시험성적서를 확인하세요.
            </p>
            {isAdmin && (
              <button
                onClick={() => openForm()}
                className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                인증서 추가
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {certificateTypes.map((cert, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-50 p-3 rounded-full mr-4">
                    {cert.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{cert.name}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{cert.type}</span>
                  </div>
                </div>
                <p className="text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patents and Trademarks */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">특허 및 상표 등록증</h2>
            <p className="text-xl text-gray-600">
              린코리아의 기술력과 브랜드를 보증하는 공식 문서들
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {certificates
              .filter(cert => cert.category === 'patent' && (!hiddenCertificateIds.includes(cert.id) || isAdmin))
              .map((cert, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleImageClick(cert.image_url, cert.name, cert.name)}
                    >
                      <img
                        src={cert.image_url}
                        alt={cert.name}
                        className="w-full aspect-[1/1.4142] object-contain rounded-lg mb-4 border hover:border-blue-300 transition-colors"
                      />
                    </div>
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handleToggleHide(cert)}
                          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={hiddenCertificateIds.includes(cert.id) ? "노출 해제" : "숨기기"}
                          disabled={formLoading}
                          aria-label={hiddenCertificateIds.includes(cert.id) ? "노출 해제" : "숨기기"}
                        >
                          {hiddenCertificateIds.includes(cert.id) ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openForm(cert)}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(cert);
                            setShowDeleteConfirm(true);
                          }}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{cert.name}</h3>
                  <p className="text-sm text-gray-500 text-center">클릭하여 확대보기</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Test Reports */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">RIN-COAT 시험성적서</h2>
            <p className="text-xl text-gray-600">
              공인시험기관에서 실시한 품질 시험 결과 전체 문서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {certificates
              .filter(cert => cert.category === 'certification' && (!hiddenCertificateIds.includes(cert.id) || isAdmin))
              .map((cert, index) => (
                <div key={index} className={`bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${hiddenCertificateIds.includes(cert.id) ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleImageClick(cert.image_url, cert.name, cert.name)}
                    >
                      <img
                        src={cert.image_url}
                        alt={cert.name}
                        className="w-full aspect-[1/1.4142] object-contain rounded-lg mb-4 border hover:border-blue-300 transition-colors"
                      />
                    </div>
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handleToggleHide(cert)}
                          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={hiddenCertificateIds.includes(cert.id) ? "노출 해제" : "숨기기"}
                          disabled={formLoading}
                          aria-label={hiddenCertificateIds.includes(cert.id) ? "노출 해제" : "숨기기"}
                        >
                          {hiddenCertificateIds.includes(cert.id) ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openForm(cert)}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(cert);
                            setShowDeleteConfirm(true);
                          }}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 text-center mb-1">{cert.name}</h3>
                  <p className="text-xs text-gray-500 text-center">클릭하여 확대보기</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* 린코리아 시험성적서 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">린코리아 시험성적서</h2>
            <p className="text-xl text-gray-600">
              린코리아 제품의 품질을 검증하는 시험성적서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {certificates
              .filter(cert => cert.category === 'rin_test' && (!hiddenCertificateIds.includes(cert.id) || isAdmin))
              .map((cert, index) => (
                <div key={index} className={`bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${hiddenCertificateIds.includes(cert.id) ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleImageClick(cert.image_url, cert.name, cert.name)}
                    >
                      <img
                        src={cert.image_url}
                        alt={cert.name}
                        className="w-full aspect-[1/1.4142] object-contain rounded-lg mb-4 border hover:border-blue-300 transition-colors"
                      />
                    </div>
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handleToggleHide(cert)}
                          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={hiddenCertificateIds.includes(cert.id) ? "노출 해제" : "숨기기"}
                          disabled={formLoading}
                          aria-label={hiddenCertificateIds.includes(cert.id) ? "노출 해제" : "숨기기"}
                        >
                          {hiddenCertificateIds.includes(cert.id) ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openForm(cert)}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(cert);
                            setShowDeleteConfirm(true);
                          }}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 text-center mb-1">{cert.name}</h3>
                  <p className="text-xs text-gray-500 text-center">클릭하여 확대보기</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src || ''}
        imageAlt={selectedImage?.alt || ''}
        imageTitle={selectedImage?.title || ''}
      />

      {/* Certificate Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={closeForm}>
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">{editingCertificate ? '인증서 수정' : '인증서 추가'}</h2>
            <form onSubmit={handleFormSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={formValues.name || ''}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formValues.description || ''}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                <input
                  type="text"
                  value={formValues.image_url || ''}
                  onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={formValues.category || ''}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="patent">특허 및 상표</option>
                  <option value="certification">RIN-COAT 시험성적서</option>
                  <option value="rin_test">린코리아 시험성적서</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">발급일</label>
                <input
                  type="date"
                  value={formValues.issue_date || ''}
                  onChange={(e) => setFormValues({ ...formValues, issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">만료일</label>
                <input
                  type="date"
                  value={formValues.expiry_date || ''}
                  onChange={(e) => setFormValues({ ...formValues, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {formError && (
                <div className="text-red-600 text-sm">{formError}</div>
              )}
              {formSuccess && (
                <div className="text-green-600 text-sm">{formSuccess}</div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {formLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">인증서 삭제</h2>
            <p className="text-gray-600 mb-6">
              정말로 "{deleteTarget.name}" 인증서를 삭제하시겠습니까?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Certificates;
