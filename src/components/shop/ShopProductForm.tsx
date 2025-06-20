import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Package } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, FormField, FormInput, FormTextarea, FormSelect, ActionButton } from '@/components/ui/modal';
import { getImageUrl, handleImageError } from '@/lib/utils';

interface ShopProduct {
  id?: string;
  name: string;
  description?: string;
  price: number;
  compare_price?: number;
  image_url: string;
  category: string;
  stock_quantity?: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  is_featured: boolean;
  is_active: boolean;
}

interface ShopProductFormProps {
  isOpen: boolean;
  product?: ShopProduct | null;
  onClose: () => void;
  onSubmit: (product: Omit<ShopProduct, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

const ShopProductForm: React.FC<ShopProductFormProps> = ({
  isOpen,
  product,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Omit<ShopProduct, 'id'>>({
    name: '',
    description: '',
    price: 0,
    compare_price: undefined,
    image_url: '',
    category: '',
    stock_quantity: undefined,
    weight: undefined,
    dimensions: '',
    brand: '',
    is_featured: false,
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        compare_price: product.compare_price,
        image_url: product.image_url || '',
        category: product.category || '',
        stock_quantity: product.stock_quantity,
        weight: product.weight,
        dimensions: product.dimensions || '',
        brand: product.brand || '',
        is_featured: product.is_featured || false,
        is_active: product.is_active !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        compare_price: undefined,
        image_url: '',
        category: '',
        stock_quantity: undefined,
        weight: undefined,
        dimensions: '',
        brand: '',
        is_featured: false,
        is_active: true
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '상품명을 입력해주세요.';
    }

    if (!formData.image_url.trim()) {
      newErrors.image_url = '이미지 URL을 입력해주세요.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (formData.price <= 0) {
      newErrors.price = '가격은 0보다 큰 값을 입력해주세요.';
    }

    if (formData.compare_price !== undefined && formData.compare_price <= formData.price) {
      newErrors.compare_price = '할인 전 가격은 현재 가격보다 높아야 합니다.';
    }

    if (formData.stock_quantity !== undefined && formData.stock_quantity < 0) {
      newErrors.stock_quantity = '재고 수량은 0 이상이어야 합니다.';
    }

    if (formData.weight !== undefined && formData.weight <= 0) {
      newErrors.weight = '무게는 0보다 큰 값을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 빈 문자열을 undefined로 변환
      const submitData = {
        ...formData,
        description: formData.description?.trim() || undefined,
        dimensions: formData.dimensions?.trim() || undefined,
        brand: formData.brand?.trim() || undefined,
        compare_price: formData.compare_price || undefined,
        stock_quantity: formData.stock_quantity || undefined,
        weight: formData.weight || undefined,
      };

      await onSubmit(submitData);
    }
  };

  const calculateDiscount = () => {
    if (formData.compare_price && formData.compare_price > formData.price) {
      const discount = ((formData.compare_price - formData.price) / formData.compare_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? '상품 수정' : '새 상품 등록'}
      size="3xl"
    >
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="상품명" required error={errors.name} className="md:col-span-2">
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="상품명을 입력하세요"
                  className="pl-10"
                  error={!!errors.name}
                />
              </div>
            </FormField>

            <FormField label="카테고리" required error={errors.category}>
              <FormSelect
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                error={!!errors.category}
              >
                <option value="">카테고리 선택</option>
                <option value="방수제">방수제</option>
                <option value="경화제">경화제</option>
                <option value="코팅제">코팅제</option>
                <option value="실란트">실란트</option>
                <option value="접착제">접착제</option>
                <option value="도구">도구</option>
                <option value="기타">기타</option>
              </FormSelect>
            </FormField>

            <FormField label="브랜드">
              <FormInput
                value={formData.brand || ''}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="브랜드명을 입력하세요 (선택사항)"
              />
            </FormField>
          </div>

          <FormField label="상품 설명">
            <FormTextarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="상품에 대한 설명을 입력하세요"
              rows={4}
            />
          </FormField>

          {/* 이미지 */}
          <FormField label="상품 이미지 URL" required error={errors.image_url}>
            <div className="space-y-3">
              <FormInput
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="이미지 URL을 입력하세요"
                error={!!errors.image_url}
              />

              {formData.image_url && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <img
                    src={getImageUrl(formData.image_url)}
                    alt="상품 이미지 미리보기"
                    className="w-24 h-24 object-cover rounded border shadow-sm"
                    onError={handleImageError}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">이미지 미리보기</p>
                    <p className="text-xs text-gray-500 mt-1">상품 이미지가 올바르게 표시되는지 확인하세요</p>
                  </div>
                </div>
              )}
            </div>
          </FormField>

          {/* 가격 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="판매가격 (원)" required error={errors.price}>
              <FormInput
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="판매가격을 입력하세요"
                min="0"
                step="100"
                error={!!errors.price}
              />
            </FormField>

            <FormField label="할인 전 가격 (원)" error={errors.compare_price}>
              <FormInput
                type="number"
                value={formData.compare_price || ''}
                onChange={(e) => handleInputChange('compare_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="할인 전 가격 (선택사항)"
                min="0"
                step="100"
                error={!!errors.compare_price}
              />
              {calculateDiscount() > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  할인율: {calculateDiscount()}% (₩{(formData.compare_price! - formData.price).toLocaleString()} 할인)
                </p>
              )}
            </FormField>
          </div>

          {/* 상품 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="재고 수량" error={errors.stock_quantity}>
              <FormInput
                type="number"
                value={formData.stock_quantity || ''}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="재고 수량"
                min="0"
                error={!!errors.stock_quantity}
              />
            </FormField>

            <FormField label="무게 (kg)" error={errors.weight}>
              <FormInput
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="무게"
                min="0"
                step="0.1"
                error={!!errors.weight}
              />
            </FormField>

            <FormField label="크기">
              <FormInput
                value={formData.dimensions || ''}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="예: 30×20×15cm"
              />
            </FormField>
          </div>

          {/* 상품 정보 요약 */}
          {(formData.name && formData.price) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">상품 정보 요약</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{formData.name}</span>
                  <div className="text-right">
                    {formData.compare_price && (
                      <span className="line-through text-gray-500 mr-2">
                        ₩{formData.compare_price.toLocaleString()}
                      </span>
                    )}
                    <span className="font-bold text-lg">
                      ₩{formData.price.toLocaleString()}
                    </span>
                    {calculateDiscount() > 0 && (
                      <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {calculateDiscount()}% 할인
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-blue-200">
                  {formData.category && (
                    <div><span className="font-medium">카테고리:</span> {formData.category}</div>
                  )}
                  {formData.brand && (
                    <div><span className="font-medium">브랜드:</span> {formData.brand}</div>
                  )}
                  {formData.stock_quantity !== undefined && (
                    <div><span className="font-medium">재고:</span> {formData.stock_quantity}개</div>
                  )}
                  {formData.weight && (
                    <div><span className="font-medium">무게:</span> {formData.weight}kg</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 표시 옵션 */}
          <FormField label="상품 설정">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="mr-3 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">추천 상품으로 표시</span>
                  <p className="text-xs text-gray-500">메인 페이지와 상품 목록 상단에 표시됩니다</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="mr-3 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">상품 활성화</span>
                  <p className="text-xs text-gray-500">체크 해제 시 상품이 숨김 처리됩니다</p>
                </div>
              </label>
            </div>
          </FormField>
        </form>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
          <ActionButton
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            취소
          </ActionButton>
          <ActionButton
            onClick={handleSubmit}
            loading={isLoading}
            className="w-full sm:w-auto"
          >
            {product ? '수정' : '등록'}
          </ActionButton>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ShopProductForm;
