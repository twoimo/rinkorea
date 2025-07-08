import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShopHero from '@/components/shop/ShopHero';
import ShopControls from '@/components/shop/ShopControls';
import ShopProductGrid from '@/components/shop/ShopProductGrid';
import ShopProductForm from '@/components/shop/ShopProductForm';
import ShopDeleteModal from '@/components/shop/ShopDeleteModal';
import { ShopProductGridSkeleton } from '@/components/shop/ShopProductSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
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
  name_ko?: string;
  name_en?: string;
  name_zh?: string;
  name_id?: string;
  description_ko?: string;
  description_en?: string;
  description_zh?: string;
  description_id?: string;
  [key: string]: unknown;
}

const Shop = () => {
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUserRole();
  const { t, language } = useLanguage();
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
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const gridOptions = [
    { value: 2, label: '2 x 2' },
    { value: 3, label: '3 x 3' },
    { value: 4, label: '4 x 4' },
  ];

  const sortOptions = [
    { value: 'popularity', label: t('shop_sort_popularity', '인기도순') },
    { value: 'newest', label: t('shop_sort_newest', '최신등록순') },
    { value: 'priceAsc', label: t('shop_sort_price_low', '낮은 가격순') },
    { value: 'priceDesc', label: t('shop_sort_price_high', '높은 가격순') },
    { value: 'discount', label: t('shop_sort_discount', '할인율순') },
    { value: 'sales', label: t('shop_sort_sales', '누적 판매순') },
    { value: 'reviews', label: t('shop_sort_reviews', '리뷰 많은순') },
    { value: 'rating', label: t('shop_sort_rating', '평점 높은순') },
  ];

  // 숨김 상품 목록 불러오기 함수
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

  // 디버깅: 제품 데이터 변경 감지
  React.useEffect(() => {
    console.log('🛒 Shop products data changed:', {
      totalProducts: products.length,
      productNames: products.map(p => p.name),
      productDetails: products.map(p => ({ id: p.id, name: p.name, updated_at: p.updated_at })),
      timestamp: new Date().toLocaleTimeString()
    });
  }, [products]);

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
    setShowSortDropdown(false);
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
        return sortedProducts.sort((a, b) => {
          const scoreA = (a.sales || 0) * 0.4 + a.reviews * 0.3 + a.rating * 0.3;
          const scoreB = (b.sales || 0) * 0.4 + b.reviews * 0.3 + b.rating * 0.3;
          return scoreB - scoreA;
        });
    }
  };

  const handleProductClick = (url: string) => {
    window.open(url, '_blank');
  };

  const openForm = (product?: Product) => {
    setEditingProduct(product || null);
    setFormValues(product ? { ...product } : {});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormValues({});
  };

  const openDeleteConfirm = (product: Product) => {
    setDeleteTarget(product);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  };

  const handleGridApply = async () => {
    setGridCols(pendingGridCols);
    setGridLoading(true);
    await (supabase as unknown as SupabaseClient)
      .from('site_settings')
      .upsert({ key: 'shop_grid_cols', value: String(pendingGridCols), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setGridLoading(false);
  };

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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.includes('://') || imagePath.startsWith('@') || imagePath.startsWith('/')) return imagePath;
    return `/images/${imagePath}`;
  };

  const handleFormSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting shop product save...', { editingProduct: editingProduct?.id, formValues });
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      // 현재 언어에 맞는 다국어 컬럼도 함께 업데이트
      const payload = {
        ...formValues,
        image_url: getImageUrl(formValues.image_url || ''),
        price: Number(formValues.price) || 0,
        original_price: formValues.original_price ? Number(formValues.original_price) : null,
        discount: formValues.discount ? Number(formValues.discount) : null,
        rating: formValues.rating ? Number(formValues.rating) : null,
        reviews: formValues.reviews ? Number(formValues.reviews) : null,
        stock_quantity: formValues.stock_quantity ? Number(formValues.stock_quantity) : null,
        is_new: !!formValues.is_new,
        is_best: !!formValues.is_best,
        updated_at: new Date().toISOString(),
        name_ko: formValues.name_ko || formValues.name || '',
        name_en: formValues.name_en || '',
        name_zh: formValues.name_zh || '',
        name_id: formValues.name_id || '',
        description_ko: formValues.description_ko || formValues.description || '',
        description_en: formValues.description_en || '',
        description_zh: formValues.description_zh || '',
        description_id: formValues.description_id || '',
        // 현재 언어에 맞는 다국어 컬럼 강제 업데이트
        [`name_${language}`]: formValues.name || '',
        [`description_${language}`]: formValues.description || '',
      };

      console.log('Enhanced shop product form data with multilang:', payload);
      let result;
      if (editingProduct) {
        console.log('Updating shop product:', editingProduct.id);
        result = await (supabase as unknown as SupabaseClient)
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        console.log('Shop product update result:', result);
      } else {
        console.log('Creating new shop product');
        result = await (supabase as unknown as SupabaseClient)
          .from('products')
          .insert([{ ...payload, created_at: new Date().toISOString(), is_active: true }]);
        console.log('Shop product create result:', result);
      }
      if (result.error) {
        console.error('Shop product save error:', result.error);
        setFormError(result.error.message);
      } else {
        console.log('Shop product saved successfully!');
        setFormSuccess(t('saved_success', '저장되었습니다.'));
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
        setFormSuccess(t('shop_deleted_success', '삭제되었습니다.'));
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

  const handleToggleHide = async (product: Product) => {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      if (hiddenProductIds.includes(product.id)) {
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_hidden')
          .delete()
          .eq('product_id', product.id);
        if (error) setFormError(error.message);
        else setFormSuccess('노출되었습니다.');
      } else {
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

  const getVisibleProducts = () => {
    if (isAdmin) return getSortedProducts();
    return getSortedProducts().filter(p => !hiddenProductIds.includes(p.id));
  };

  const handleFormValueChange = (key: keyof Product, value: unknown) => {
    setFormValues(v => ({ ...v, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <ShopHero isAdmin={isAdmin} onAddProduct={() => openForm()} />

        <section className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <ShopControls
              sortBy={sortBy}
              sortOptions={sortOptions}
              gridCols={gridCols}
              pendingGridCols={pendingGridCols}
              gridOptions={gridOptions}
              showSortDropdown={showSortDropdown}
              gridLoading={gridLoading}
              isAdmin={isAdmin}
              onSortChange={handleSort}
              onToggleSortDropdown={() => setShowSortDropdown(!showSortDropdown)}
              onGridColsChange={setPendingGridCols}
              onGridApply={handleGridApply}
            />

            {loading ? (
              <ShopProductGridSkeleton gridCols={gridCols} />
            ) : (
              <ShopProductGrid
                products={getVisibleProducts()}
                gridCols={gridCols}
                hiddenProductIds={hiddenProductIds}
                isAdmin={isAdmin}
                formLoading={formLoading}
                onProductClick={handleProductClick}
                onEditProduct={openForm}
                onDeleteProduct={openDeleteConfirm}
                onToggleHide={handleToggleHide}
              />
            )}
          </div>
        </section>
      </main>

      {showForm && (
        <ShopProductForm
          editingProduct={editingProduct}
          formValues={formValues}
          formLoading={formLoading}
          formError={formError}
          formSuccess={formSuccess}
          onClose={closeForm}
          onSubmit={handleFormSave}
          onFormValueChange={handleFormValueChange}
        />
      )}

      {showDeleteConfirm && deleteTarget && (
        <ShopDeleteModal
          product={deleteTarget}
          formLoading={formLoading}
          formError={formError}
          formSuccess={formSuccess}
          onConfirm={handleDelete}
          onCancel={closeDeleteConfirm}
        />
      )}

      <Footer />
    </div>
  );
};

export default Shop;
