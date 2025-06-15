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
      try {
        const { data, error } = await (supabase as unknown as SupabaseClient)
          .from('product_introductions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        if (data) {
          // detail_images가 없는 경우 빈 배열로 초기화
          const productsWithDetailImages = data.map(product => ({
            ...product,
            detail_images: product.detail_images || []
          }));
          setProducts(productsWithDetailImages);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
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
      // 전체 payload 생성 (detail_images 포함)
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
          .eq('id', editingProduct.id)
          .select('*');

        if (!result.error && result.data) {
          // 수정된 제품으로 상태 업데이트 (순서 유지)
          setProducts(prevProducts =>
            prevProducts.map(p =>
              p.id === editingProduct.id ? { ...result.data[0], detail_images: result.data[0].detail_images || [] } : p
            )
          );
        }
      } else {
        // 추가
        const insertPayload = {
          ...payload,
          created_at: new Date().toISOString(),
          is_active: true
        };
        
        result = await (supabase as unknown as SupabaseClient)
          .from('product_introductions')
          .insert([insertPayload])
          .select('*');

        if (!result.error && result.data) {
          // 새 제품 추가 (맨 뒤에 추가)
          setProducts(prevProducts => [...prevProducts, { ...result.data[0], detail_images: result.data[0].detail_images || [] }]);
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
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">제품소개</h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              린코리아의 혁신적인 제품군을 만나보세요. <br className="hidden sm:inline" />
              최고 품질과 기술력으로 안전한 건설환경을 만들어갑니다.
            </p>
            {isAdmin && (
              <button
                className="mt-6 lg:mt-8 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
                onClick={() => openForm()}
                aria-label="제품 추가"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> 제품 추가
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white p-1.5 sm:p-2 rounded-full">
                    {product.icon === 'shield' && <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
                    {product.icon === 'palette' && <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
                    {product.icon === 'star' && <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
                    {product.icon === 'zap' && <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
                    {product.icon === 'leaf' && <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
                  </div>
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleHide(product)}
                          className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                        >
                          {hiddenProductIds.includes(product.id) ? (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => openForm(product)}
                          className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(product)}
                          className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{product.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">{product.description}</p>
                  <div className="space-y-2 flex-grow">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">주요 특징:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm sm:text-base text-gray-600">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full mr-2 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => openDetailDialog(product)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base touch-manipulation"
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
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">제품의 장점</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              린코리아 세라믹 코팅제가 선택받는 이유
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="bg-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">불연재 인증</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">안전한 순수 무기질 세라믹 코팅제</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">간편한 시공</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">1액형으로 간편하게 시공 가능</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">우수한 품질</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">엄격한 품질 관리를 통한 우수한 품질</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">다양한 선택</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">용도와 요구사항에 맞는 다양한 제품군</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold">{editingProduct ? '제품 수정' : '제품 추가'}</h2>
              <button className="text-gray-400 hover:text-gray-700 touch-manipulation" onClick={closeForm}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleFormSave}>
              <div>
                <label className="block text-sm font-medium mb-2">제품명</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" 
                  value={formValues.name || ''} 
                  onChange={e => setFormValues(v => ({ ...v, name: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea 
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[80px]" 
                  value={formValues.description || ''} 
                  onChange={e => setFormValues(v => ({ ...v, description: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이미지 URL</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" 
                  value={formValues.image_url || ''} 
                  onChange={e => setFormValues(v => ({ ...v, image_url: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">아이콘</label>
                <select
                  value={formValues.icon || ''}
                  onChange={(e) => setFormValues({ ...formValues, icon: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                <label className="block text-sm font-medium mb-2">주요 특징 (쉼표로 구분)</label>
                <textarea
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[80px]"
                  value={formValues.features?.join(', ') || ''} 
                  onChange={e => setFormValues(v => ({ ...v, features: e.target.value.split(',').map(f => f.trim()) }))}
                  placeholder="특징을 쉼표로 구분하여 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">상세 이미지 URL (쉼표로 구분)</label>
                <textarea
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[80px]"
                  value={formValues.detail_images?.join(', ') || ''} 
                  onChange={e => setFormValues(v => ({ ...v, detail_images: e.target.value.split(',').map(f => f.trim()).filter(f => f) }))}
                  placeholder="상세 이미지 URL을 쉼표로 구분하여 입력하세요"
                />
              </div>
              {formError && <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
              {formSuccess && <div className="mt-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">{formSuccess}</div>}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors touch-manipulation" 
                  onClick={closeForm} 
                  disabled={formLoading}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors touch-manipulation" 
                  disabled={formLoading}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">제품 삭제</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                정말로 "<span className="font-semibold">{deleteTarget.name}</span>" 제품을 삭제하시겠습니까?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors touch-manipulation"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상세 보기 다이얼로그 */}
      {showDetailDialog && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                {selectedProduct.name} 상세 정보
              </h2>
              <button
                onClick={closeDetailDialog}
                className="text-gray-400 hover:text-gray-700 touch-manipulation p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {selectedProduct.detail_images && selectedProduct.detail_images.length > 0 ? (
                  selectedProduct.detail_images.map((image, index) => (
                    <div key={index} className="w-full">
                      <img
                        src={getImageUrl(image)}
                        alt={`${selectedProduct.name} 상세 이미지 ${index + 1}`}
                        className="w-full h-auto object-contain rounded-lg shadow-sm"
                        style={{ maxHeight: '70vh' }}
                        loading="lazy"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-medium mb-2">상세 이미지가 없습니다</div>
                    <p className="text-sm">이 제품에 대한 추가 이미지가 준비되지 않았습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Products;
