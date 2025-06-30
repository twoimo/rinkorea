import React, { useState, useCallback, memo, Suspense } from 'react';
import { Plus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserRole } from '@/hooks/useUserRole';
import { useProductsOptimized } from '@/hooks/useProductsOptimized';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Product } from '@/types/product';
import { SEOHead } from '@/components/seo/SEOHead';

// Lazy load components for better performance
const ProductCard = React.lazy(() => import('@/components/products/ProductCard'));
const ProductForm = React.lazy(() => import('@/components/products/ProductForm'));
const ProductDetailModal = React.lazy(() => import('@/components/products/ProductDetailModal'));
const DeleteConfirmModal = React.lazy(() => import('@/components/products/DeleteConfirmModal'));
const ProductBenefits = React.lazy(() => import('@/components/products/ProductBenefits'));

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center p-4">
    <LoadingSpinner className="w-6 h-6" />
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

const Products = memo(() => {
  const { isAdmin } = useUserRole();
  const {
    visibleProducts,
    hiddenProductIds,
    loading,
    error,
    toggleProductVisibility,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProductsOptimized();
  const { t, language } = useLanguage();

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const seoData = {
    ko: {
      title: '제품소개 | 린코리아 - 세라믹 코팅 전문제품',
      description: '린코리아의 혁신적인 세라믹 코팅재와 친환경 건설재료를 만나보세요. 불연재 인증, 1액형 세라믹 코팅제, 방수재 등 다양한 제품을 확인하세요.',
      keywords: '세라믹 코팅, 불연재, 린코트, 린하드플러스, 건설재료, 방수재, 1액형 코팅'
    },
    en: {
      title: 'Products | RIN Korea - Ceramic Coating Solutions',
      description: 'Discover RIN Korea\'s innovative ceramic coatings and eco-friendly construction materials. Check out our fire-resistant certified, one-component ceramic coatings, waterproofing materials and more.',
      keywords: 'ceramic coating, fire resistant, RIN-COAT, RIN-HARD PLUS, construction materials, waterproofing, one-component coating'
    },
    zh: {
      title: '产品介绍 | 林韩国 - 陶瓷涂层解决方案',
      description: '探索林韩国的创新陶瓷涂层和环保建筑材料。查看我们的阻燃认证、单组分陶瓷涂层、防水材料等产品。',
      keywords: '陶瓷涂层, 阻燃材料, 林涂层, 林硬化剂, 建筑材料, 防水材料, 单组分涂层'
    }
  };

  // Event handlers
  const handleOpenForm = useCallback((product?: Product) => {
    setEditingProduct(product || null);
    setShowForm(true);
    setFormError(null);
    setFormSuccess(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
    setFormError(null);
    setFormSuccess(null);
  }, []);

  const handleOpenDeleteConfirm = useCallback((product: Product) => {
    setDeleteTarget(product);
    setShowDeleteConfirm(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  }, []);

  const handleOpenDetailDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowDetailDialog(true);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setSelectedProduct(null);
    setShowDetailDialog(false);
  }, []);

  const handleFormSave = useCallback(async (formData: Partial<Product>) => {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (result?.error) {
        setFormError(result.error.message || 'An error occurred');
      } else {
        setFormSuccess(editingProduct ? t('products_save_success', '제품이 수정되었습니다.') : t('products_add_success', '제품이 추가되었습니다.'));
        setTimeout(handleCloseForm, 1500);
      }
    } catch (err) {
      setFormError(t('products_error_occurred', '오류가 발생했습니다.'));
    } finally {
      setFormLoading(false);
    }
  }, [editingProduct, updateProduct, createProduct, handleCloseForm, t]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      const result = await deleteProduct(deleteTarget.id);
      if (!result?.error) {
        handleCloseDeleteConfirm();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  }, [deleteTarget, deleteProduct, handleCloseDeleteConfirm]);

  const handleToggleVisibility = useCallback(async (product: Product) => {
    await toggleProductVisibility(product.id);
  }, [toggleProductVisibility]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SEOHead
          title={seoData[language].title}
          description={seoData[language].description}
          keywords={seoData[language].keywords}
          url={`${window.location.origin}/products`}
          image="/images/optimized/RIN-COAT-scaled.webp"
        />
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner className="w-8 h-8" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <SEOHead
          title={seoData[language].title}
          description={seoData[language].description}
          keywords={seoData[language].keywords}
          url={`${window.location.origin}/products`}
          image="/images/optimized/RIN-COAT-scaled.webp"
        />
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-600">{t('error')}: {error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={seoData[language].title}
        description={seoData[language].description}
        keywords={seoData[language].keywords}
        url={`${window.location.origin}/products`}
        image="/images/optimized/RIN-COAT-scaled.webp"
      />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">{t('products_hero_title')}</h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              {t('products_hero_subtitle')}
            </p>
            {isAdmin && (
              <button
                className="mt-6 lg:mt-8 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
                onClick={() => handleOpenForm()}
                aria-label={t('products_add_btn')}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {t('products_add_btn')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Suspense fallback={<LoadingFallback />}>
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isHidden={hiddenProductIds.includes(product.id)}
                  isAdmin={isAdmin}
                  onEdit={handleOpenForm}
                  onDelete={handleOpenDeleteConfirm}
                  onToggleHide={handleToggleVisibility}
                  onViewDetail={handleOpenDetailDialog}
                />
              ))}
            </Suspense>
          </div>
        </div>
      </section>

      {/* Product Benefits Section */}
      <Suspense fallback={<LoadingFallback />}>
        <ProductBenefits />
      </Suspense>

      {/* Modals */}
      {showForm && (
        <Suspense fallback={<LoadingFallback />}>
          <ProductForm
            product={editingProduct}
            onSave={handleFormSave}
            onClose={handleCloseForm}
            loading={formLoading}
            error={formError}
            success={formSuccess}
          />
        </Suspense>
      )}

      {showDeleteConfirm && deleteTarget && (
        <Suspense fallback={<LoadingFallback />}>
          <DeleteConfirmModal
            product={deleteTarget}
            onConfirm={handleDelete}
            onCancel={handleCloseDeleteConfirm}
          />
        </Suspense>
      )}

      {showDetailDialog && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseDetailDialog}
        />
      )}

      <Footer />
    </div>
  );
});

Products.displayName = 'Products';

export default Products;
