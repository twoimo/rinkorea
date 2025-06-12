import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Star, Info, ChevronDown, Plus, Edit, Trash2, X, EyeOff, Eye } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useUserRole } from '../hooks/useUserRole';
import { SupabaseClient } from '@supabase/supabase-js';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  original_price?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  naver_url?: string;
  is_new?: boolean;
  is_best?: boolean;
  stock_quantity?: number;
  sales?: number;
  created_at?: string;
  is_active?: boolean;
}

const Shop = () => {
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUserRole();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<Partial<Product>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [gridCols, setGridCols] = useState<number>(3);
  const [pendingGridCols, setPendingGridCols] = useState<number>(3);
  const [gridLoading, setGridLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [hiddenProductIds, setHiddenProductIds] = useState<string[]>([]);
  const gridOptions = [
    { value: 2, label: '2 x 2' },
    { value: 3, label: '3 x 3' },
    { value: 4, label: '4 x 4' },
  ];

  const sortOptions = [
    { value: 'popularity', label: '인기도순' },
    { value: 'newest', label: '최신등록순' },
    { value: 'priceAsc', label: '낮은 가격순' },
    { value: 'priceDesc', label: '높은 가격순' },
    { value: 'discount', label: '할인율순' },
    { value: 'sales', label: '누적 판매순' },
    { value: 'reviews', label: '리뷰 많은순' },
    { value: 'rating', label: '평점 높은순' },
  ];

  // 숨김 상품 목록 불러오기 함수 (컴포넌트 상단에 선언)
  const fetchHiddenProducts = async () => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from('product_hidden')
      .select('product_id');
    if (!error && data) {
      setHiddenProductIds(data.map((h: { product_id: string }) => h.product_id));
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
    const fetchGrid = async () => {
      setGridLoading(true);
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('site_settings')
        .select('value')
        .eq('key', 'shop_grid_cols')
        .single();
      if (!error && data?.value) {
        setGridCols(Number(data.value));
        setPendingGridCols(Number(data.value));
      }
      setGridLoading(false);
    };
    fetchGrid();
  }, []);

  useEffect(() => {
    fetchHiddenProducts();
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await fetchHiddenProducts();
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  const getSortedProducts = () => {
    const sortedProducts = [...products];

    switch (sortBy) {
      case 'newest':
        return sortedProducts.sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      case 'priceAsc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'discount':
        return sortedProducts.sort((a, b) =>
          (b.discount || 0) - (a.discount || 0)
        );
      case 'sales':
        return sortedProducts.sort((a, b) =>
          (b.sales || 0) - (a.sales || 0)
        );
      case 'reviews':
        return sortedProducts.sort((a, b) => b.reviews - a.reviews);
      case 'rating':
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      case 'popularity':
      default:
        // 인기도는 판매량, 리뷰 수, 평점을 종합적으로 고려
        return sortedProducts.sort((a, b) => {
          const scoreA = (a.sales || 0) * 0.4 + a.reviews * 0.3 + a.rating * 0.3;
          const scoreB = (b.sales || 0) * 0.4 + b.reviews * 0.3 + b.rating * 0.3;
          return scoreB - scoreA;
        });
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleProductClick = (url: string) => {
    window.open(url, '_blank');
  };

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

  // 그리드 변경 핸들러(관리자만, 적용 버튼 클릭 시)
  const handleGridApply = async () => {
    setGridCols(pendingGridCols);
    setGridLoading(true);
    await (supabase as unknown as SupabaseClient)
      .from('site_settings')
      .upsert({ key: 'shop_grid_cols', value: String(pendingGridCols), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setGridLoading(false);
  };

  // 상품 목록 새로고침 함수
  const refreshProducts = async () => {
    setLoading(true);
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
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
        price: Number(formValues.price) || 0,
        original_price: formValues.original_price ? Number(formValues.original_price) : null,
        discount: formValues.discount ? Number(formValues.discount) : null,
        rating: formValues.rating ? Number(formValues.rating) : null,
        reviews: formValues.reviews ? Number(formValues.reviews) : null,
        stock_quantity: formValues.stock_quantity ? Number(formValues.stock_quantity) : null,
        is_new: !!formValues.is_new,
        is_best: !!formValues.is_best,
        updated_at: new Date().toISOString(),
      };
      let result;
      if (editingProduct) {
        // 수정
        result = await (supabase as unknown as SupabaseClient)
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
      } else {
        // 추가
        result = await (supabase as unknown as SupabaseClient)
          .from('products')
          .insert([{ ...payload, created_at: new Date().toISOString(), is_active: true }]);
      }
      if (result.error) {
        setFormError(result.error.message);
      } else {
        setFormSuccess('저장되었습니다.');
        await refreshProducts();
        setTimeout(() => {
          setShowForm(false);
          setEditingProduct(null);
          setFormValues({});
          setFormSuccess(null);
        }, 700);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    }
    setFormLoading(false);
  };

  // 상품 삭제
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const result = await (supabase as unknown as SupabaseClient)
        .from('products')
        .delete()
        .eq('id', deleteTarget.id);
      if (result.error) {
        setFormError(result.error.message);
      } else {
        setFormSuccess('삭제되었습니다.');
        await refreshProducts();
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
          setFormSuccess(null);
        }, 700);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    }
    setFormLoading(false);
  };

  // 할인율 자동 계산
  useEffect(() => {
    if (formValues.original_price && formValues.price && formValues.original_price > 0) {
      const discount = Math.round((1 - (Number(formValues.price) / Number(formValues.original_price))) * 100);
      if (!isNaN(discount) && discount > 0) {
        setFormValues(v => ({ ...v, discount }));
      } else {
        setFormValues(v => ({ ...v, discount: 0 }));
      }
    } else {
      setFormValues(v => ({ ...v, discount: 0 }));
    }

  }, [formValues.price, formValues.original_price]);

  // 숨김/해제 핸들러
  const handleToggleHide = async (product: Product) => {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      if (hiddenProductIds.includes(product.id)) {
        // 숨김 해제
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_hidden')
          .delete()
          .eq('product_id', product.id);
        if (error) setFormError(error.message);
        else setFormSuccess('노출되었습니다.');
      } else {
        // 숨기기
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_hidden')
          .upsert({ product_id: product.id });
        if (error) setFormError(error.message);
        else setFormSuccess('숨김 처리되었습니다.');
      }
      await fetchHiddenProducts();
      setTimeout(() => setFormSuccess(null), 700);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    }
    setFormLoading(false);
  };

  // 상품 목록 필터링
  const getVisibleProducts = () => {
    if (isAdmin) return getSortedProducts();
    return getSortedProducts().filter(p => !hiddenProductIds.includes(p.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">온라인 스토어</h1>
              <p className="text-xl max-w-2xl mx-auto">
                안전하고 친환경적인 건설재료를 온라인에서 편리하게 구매하세요.
              </p>
              {isAdmin && (
                <button
                  className="mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"
                  onClick={() => openForm()}
                  aria-label="상품 추가"
                >
                  <Plus className="w-5 h-5" /> 상품 추가
                </button>
              )}
            </div>
          </div>
        </section>
        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortBy === opt.value ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                    onClick={() => handleSort(opt.value)}
                    aria-label={opt.label}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm font-medium text-gray-700">그리드:</label>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={pendingGridCols}
                    onChange={e => setPendingGridCols(Number(e.target.value))}
                    disabled={gridLoading}
                    aria-label="그리드 설정"
                  >
                    {gridOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold disabled:opacity-50"
                    onClick={handleGridApply}
                    disabled={gridLoading || pendingGridCols === gridCols}
                    aria-label="그리드 적용"
                  >
                    {gridLoading ? '적용 중...' : '적용'}
                  </button>
                  {gridLoading && <span className="ml-2 text-xs text-blue-600">저장 중...</span>}
                </div>
              )}
            </div>
            <div className={`grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-${gridCols} lg:grid-cols-${gridCols}`}>
              {(isAdmin ? getVisibleProducts() : getVisibleProducts()).map((product) => {
                const isSoldOut = !product.stock_quantity || product.stock_quantity <= 0;
                const isHidden = hiddenProductIds.includes(product.id);
                return (
                  <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col group relative">
                    {/* 뱃지 영역 */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      {product.discount && (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">-{product.discount}%</span>
                      )}
                      {product.is_best && (
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow">BEST</span>
                      )}
                      {product.is_new && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">NEW</span>
                      )}
                    </div>
                    <div className="relative aspect-square w-full overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900">{product.rating}</span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <span className="text-sm text-gray-600">{product.reviews} 리뷰</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          {product.original_price && (
                            <del className="text-sm text-gray-400">
                              {formatPrice(product.original_price)}원
                            </del>
                          )}
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(product.price)}원
                          </span>
                        </div>
                        <button
                          onClick={() => handleProductClick(product.naver_url || '')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 ${isSoldOut ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                          disabled={isSoldOut}
                          aria-label={isSoldOut ? '품절' : '제품 구매하기'}
                        >
                          {isSoldOut ? (
                            <>품절</>
                          ) : (
                            <>
                              제품 구매하기
                              <ShoppingCart className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {/* 관리자만 수정/삭제/숨기기 버튼 노출 */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button
                          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleToggleHide(product)}
                          title={isHidden ? '노출 해제' : '숨기기'}
                          disabled={formLoading}
                          aria-label={isHidden ? '노출 해제' : '숨기기'}
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow"
                          onClick={() => openForm(product)}
                          title="수정"
                          disabled={formLoading}
                          aria-label="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-2 shadow"
                          onClick={() => openDeleteConfirm(product)}
                          title="삭제"
                          disabled={formLoading}
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 상품 추가/수정 모달 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={closeForm}><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-4">{editingProduct ? '상품 수정' : '상품 추가'}</h2>
            <form className="space-y-4" onSubmit={handleFormSave}>
              <div>
                <label className="block text-sm font-medium mb-1">상품명</label>
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
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">판매가(원)</label>
                  <input type="number" className="w-full border px-3 py-2 rounded" value={formValues.price || ''} onChange={e => setFormValues(v => ({ ...v, price: Number(e.target.value) }))} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">정가(원)</label>
                  <input type="number" className="w-full border px-3 py-2 rounded" value={formValues.original_price || ''} onChange={e => setFormValues(v => ({ ...v, original_price: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">할인율(%)</label>
                  <input type="number" className="w-full border px-3 py-2 rounded bg-gray-100" value={formValues.discount || ''} readOnly tabIndex={-1} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">재고</label>
                  <input type="number" className="w-full border px-3 py-2 rounded" value={formValues.stock_quantity || ''} onChange={e => setFormValues(v => ({ ...v, stock_quantity: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">평점</label>
                  <input type="number" step="0.01" className="w-full border px-3 py-2 rounded" value={formValues.rating || ''} onChange={e => setFormValues(v => ({ ...v, rating: Number(e.target.value) }))} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">리뷰 수</label>
                  <input type="number" className="w-full border px-3 py-2 rounded" value={formValues.reviews || ''} onChange={e => setFormValues(v => ({ ...v, reviews: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">네이버 스토어 URL</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={formValues.naver_url || ''} onChange={e => setFormValues(v => ({ ...v, naver_url: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-1">
                  <input type="checkbox" checked={!!formValues.is_new} onChange={e => setFormValues(v => ({ ...v, is_new: e.target.checked }))} /> 신상품
                </label>
                <label className="inline-flex items-center gap-1">
                  <input type="checkbox" checked={!!formValues.is_best} onChange={e => setFormValues(v => ({ ...v, is_best: e.target.checked }))} /> 베스트
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={closeForm} disabled={formLoading}>취소</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50" disabled={formLoading}>{formLoading ? '저장 중...' : '저장'}</button>
              </div>
              {formError && <div className="mt-2 text-sm text-red-600">{formError}</div>}
              {formSuccess && <div className="mt-2 text-sm text-green-700">{formSuccess}</div>}
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
            <div className="text-lg font-bold text-red-700 mb-4">상품 삭제</div>
            <div className="mb-6 text-gray-800">정말로 <b>{deleteTarget.name}</b> 상품을 삭제하시겠습니까?</div>
            <div className="flex gap-4 justify-center">
              <button onClick={closeDeleteConfirm} className="bg-gray-300 text-gray-700 px-4 py-2 rounded" disabled={formLoading}>취소</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50" onClick={handleDelete} disabled={formLoading}>{formLoading ? '삭제 중...' : '삭제'}</button>
            </div>
            {formError && <div className="mt-4 text-sm text-red-600">{formError}</div>}
            {formSuccess && <div className="mt-4 text-sm text-green-700">{formSuccess}</div>}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Shop;
