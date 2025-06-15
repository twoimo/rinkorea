import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Palette, Star, Zap, Leaf, Plus, Edit, Trash2, X, EyeOff, Eye } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useUserRole } from '../hooks/useUserRole';
import { SupabaseClient } from '@supabase/supabase-js';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  features: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  detail_images?: string[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUserRole();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<Partial<Product>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [hiddenProductIds, setHiddenProductIds] = useState<string[]>([]);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 숨김 상품 목록 불러오기 함수
  const fetchHiddenProducts = async () => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from('product_introduction_hidden')
      .select('product_id');
    if (!error && data) {
      setHiddenProductIds(data.map((h: { product_id: string }) => h.product_id));
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchHiddenProducts();
  }, []);

  // 폼 열기
  const openForm = (product?: Product) => {
    setEditingProduct(product || null);
    setFormValues(product ? { ...product } : {});
    setShowForm(true);
  };

  // 폼 닫기
  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormValues({});
    setFormError(null);
    setFormSuccess(null);
  };

  // 삭제 확인 모달 열기
  const openDeleteConfirm = (product: Product) => {
    setDeleteTarget(product);
    setShowDeleteConfirm(true);
  };

  // 삭제 확인 모달 닫기
  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  };

  // 상품 저장(추가/수정)
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
      if (editingProduct) {
        // 수정
        result = await (supabase as unknown as SupabaseClient)
          .from('product_introductions')
          .update(payload)
          .eq('id', editingProduct.id);

        if (!result.error) {
          // 수정된 제품으로 상태 업데이트 (순서 유지)
          setProducts(prevProducts =>
            prevProducts.map(p =>
              p.id === editingProduct.id ? { ...p, ...payload } : p
            )
          );
        }
      } else {
        // 추가
        result = await (supabase as unknown as SupabaseClient)
          .from('product_introductions')
          .insert([{ ...payload, created_at: new Date().toISOString(), is_active: true }]);

        if (!result.error && result.data) {
          // 새 제품 추가 (맨 뒤에 추가)
          setProducts(prevProducts => [...prevProducts, result.data[0]]);
        }
      }

      if (result.error) {
        setFormError(result.error.message);
      } else {
        setFormSuccess(editingProduct ? '제품이 수정되었습니다.' : '제품이 추가되었습니다.');
        setTimeout(() => {
          closeForm();
        }, 1500);
      }
    } catch (error) {
      setFormError('오류가 발생했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 상품 삭제
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) {
        console.error('Error deleting product:', error);
      } else {
        setProducts(products.filter(p => p.id !== deleteTarget.id));
        closeDeleteConfirm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 상품 숨기기/보이기 토글
  const handleToggleHide = async (product: Product) => {
    try {
      if (hiddenProductIds.includes(product.id)) {
        // 숨김 해제
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_introduction_hidden')
          .delete()
          .eq('product_id', product.id);
        if (!error) {
          setHiddenProductIds(prev => prev.filter(id => id !== product.id));
        }
      } else {
        // 숨김 처리
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_introduction_hidden')
          .insert([{ product_id: product.id }]);
        if (!error) {
          setHiddenProductIds(prev => [...prev, product.id]);
        }
      }
    } catch (error) {
      console.error('Error toggling product visibility:', error);
    }
  };

  // 상세 보기 다이얼로그 열기
  const openDetailDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailDialog(true);
  };

  // 상세 보기 다이얼로그 닫기
  const closeDetailDialog = () => {
    setSelectedProduct(null);
    setShowDetailDialog(false);
  };

  // 보이는 상품만 필터링
  const getVisibleProducts = () => {
    return products.filter(product => !hiddenProductIds.includes(product.id));
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">제품소개</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 혁신적인 제품군을 만나보세요. <br />
              최고 품질과 기술력으로 안전한 건설환경을 만들어갑니다.
            </p>
            {isAdmin && (
              <button
                className="mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"
                onClick={() => openForm()}
                aria-label="제품 추가"
              >
                <Plus className="w-5 h-5" /> 제품 추가
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {getVisibleProducts().map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={800}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                  <div className="absolute top-4 left-4 bg-white p-2 rounded-full">
                    {product.icon === 'shield' && <Shield className="w-8 h-8 text-blue-600" />}
                    {product.icon === 'palette' && <Palette className="w-8 h-8 text-blue-600" />}
                    {product.icon === 'star' && <Star className="w-8 h-8 text-blue-600" />}
                    {product.icon === 'zap' && <Zap className="w-8 h-8 text-blue-600" />}
                    {product.icon === 'leaf' && <Leaf className="w-8 h-8 text-blue-600" />}
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleHide(product)}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {hiddenProductIds.includes(product.id) ? (
                            <Eye className="w-5 h-5 text-gray-600" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => openForm(product)}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(product)}
                          className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="space-y-2 flex-grow">
                    <h4 className="font-semibold text-gray-900">주요 특징:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => openDetailDialog(product)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">제품의 장점</h2>
            <p className="text-xl text-gray-600">
              린코리아 세라믹 코팅제가 선택받는 이유
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">불연재 인증</h3>
              <p className="text-gray-600">안전한 순수 무기질 세라믹 코팅제</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">간편한 시공</h3>
              <p className="text-gray-600">1액형으로 간편하게 시공 가능</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">우수한 품질</h3>
              <p className="text-gray-600">엄격한 품질 관리를 통한 우수한 품질</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">다양한 선택</h3>
              <p className="text-gray-600">용도와 요구사항에 맞는 다양한 제품군</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={closeForm}><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-4">{editingProduct ? '제품 수정' : '제품 추가'}</h2>
            <form className="space-y-4" onSubmit={handleFormSave}>
              <div>
                <label className="block text-sm font-medium mb-1">제품명</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={formValues.name || ''} onChange={e => setFormValues(v => ({ ...v, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea className="w-full border px-3 py-2 rounded" value={formValues.description || ''} onChange={e => setFormValues(v => ({ ...v, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">이미지 URL</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={formValues.image_url || ''} onChange={e => setFormValues(v => ({ ...v, image_url: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">아이콘</label>
                <select
                  value={formValues.icon || ''}
                  onChange={(e) => setFormValues({ ...formValues, icon: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">아이콘 선택</option>
                  <option value="none">None</option>
                  <option value="shield">Shield</option>
                  <option value="palette">Palette</option>
                  <option value="star">Star</option>
                  <option value="zap">Zap</option>
                  <option value="leaf">Leaf</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">주요 특징 (쉼표로 구분)</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={formValues.features?.join(', ') || ''} onChange={e => setFormValues(v => ({ ...v, features: e.target.value.split(',').map(f => f.trim()) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">상세 이미지 URL (쉼표로 구분)</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={formValues.detail_images?.join(', ') || ''} onChange={e => setFormValues(v => ({ ...v, detail_images: e.target.value.split(',').map(f => f.trim()) }))} />
              </div>
              {formError && <div className="mt-2 text-sm text-red-600">{formError}</div>}
              {formSuccess && <div className="mt-2 text-sm text-green-700">{formSuccess}</div>}
              <div className="flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={closeForm} disabled={formLoading}>취소</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50" disabled={formLoading}>{formLoading ? '저장 중...' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제품 삭제</h2>
            <p className="text-gray-600 mb-6">
              정말로 "{deleteTarget.name}" 제품을 삭제하시겠습니까?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteConfirm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 보기 다이얼로그 */}
      {showDetailDialog && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name} 상세 정보</h2>
              <button
                onClick={closeDetailDialog}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              {selectedProduct.detail_images?.map((image, index) => (
                <div key={index} className="w-full">
                  <img
                    src={getImageUrl(image)}
                    alt={`${selectedProduct.name} 상세 이미지 ${index + 1}`}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '80vh' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Products;
