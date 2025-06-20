import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, FormField, FormInput, FormTextarea, FormSelect, ActionButton } from '@/components/ui/modal';
import { getImageUrl, handleImageError } from '@/lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Product {
  id?: string;
  name: string;
  description: string;
  main_image: string;
  gallery_images: string[];
  price?: number;
  category: string;
  features: string[];
  applications: string[];
  coverage: string;
  specifications: Record<string, string>;
  is_featured: boolean;
  is_active: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  onClose: () => void;
  loading?: boolean;
}

interface SortableFeatureProps {
  id: string;
  feature: string;
  onRemove: () => void;
}

const SortableFeature: React.FC<SortableFeatureProps> = ({ id, feature, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg border ${isDragging ? 'opacity-50 z-10' : ''
        }`}
    >
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 cursor-grab touch-manipulation"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 text-sm text-gray-700">{feature}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 transition-colors p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onClose, loading = false }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    main_image: '',
    gallery_images: [],
    category: '',
    features: [],
    applications: [],
    coverage: '',
    specifications: {},
    is_featured: false,
    is_active: true,
  });

  const [newFeature, setNewFeature] = useState('');
  const [newApplication, setNewApplication] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newGalleryImage, setNewGalleryImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        main_image: product.main_image,
        gallery_images: product.gallery_images || [],
        price: product.price,
        category: product.category,
        features: product.features || [],
        applications: product.applications || [],
        coverage: product.coverage || '',
        specifications: product.specifications || {},
        is_featured: product.is_featured || false,
        is_active: product.is_active !== false,
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | number | boolean | string[] | Record<string, string> | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = '제품명을 입력해주세요.';
    if (!formData.description.trim()) newErrors.description = '제품 설명을 입력해주세요.';
    if (!formData.main_image.trim()) newErrors.main_image = '메인 이미지 URL을 입력해주세요.';
    if (!formData.category.trim()) newErrors.category = '카테고리를 선택해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      handleInputChange('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    handleInputChange('features', formData.features.filter((_, i) => i !== index));
  };

  const addApplication = () => {
    if (newApplication.trim() && !formData.applications.includes(newApplication.trim())) {
      handleInputChange('applications', [...formData.applications, newApplication.trim()]);
      setNewApplication('');
    }
  };

  const removeApplication = (index: number) => {
    handleInputChange('applications', formData.applications.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      handleInputChange('specifications', {
        ...formData.specifications,
        [newSpecKey.trim()]: newSpecValue.trim()
      });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    handleInputChange('specifications', newSpecs);
  };

  const addGalleryImage = () => {
    if (newGalleryImage.trim() && !formData.gallery_images.includes(newGalleryImage.trim())) {
      handleInputChange('gallery_images', [...formData.gallery_images, newGalleryImage.trim()]);
      setNewGalleryImage('');
    }
  };

  const removeGalleryImage = (index: number) => {
    handleInputChange('gallery_images', formData.gallery_images.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.features.findIndex(item => item === active.id);
      const newIndex = formData.features.findIndex(item => item === over.id);

      handleInputChange('features', arrayMove(formData.features, oldIndex, newIndex));
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product ? '제품 수정' : '새 제품 추가'}
      size="4xl"
      maxHeight="max-h-[95vh]"
    >
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="제품명" required error={errors.name}>
              <FormInput
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="제품명을 입력하세요"
                error={!!errors.name}
              />
            </FormField>

            <FormField label="카테고리" required error={errors.category}>
              <FormSelect
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                error={!!errors.category}
              >
                <option value="">카테고리 선택</option>
                <option value="waterproofing">방수제</option>
                <option value="hardener">경화제</option>
                <option value="coating">코팅제</option>
                <option value="sealant">실란트</option>
                <option value="adhesive">접착제</option>
                <option value="primer">프라이머</option>
                <option value="others">기타</option>
              </FormSelect>
            </FormField>
          </div>

          <FormField label="제품 설명" required error={errors.description}>
            <FormTextarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="제품에 대한 상세한 설명을 입력하세요"
              rows={4}
              error={!!errors.description}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="가격 (원)" error={errors.price}>
              <FormInput
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="가격을 입력하세요"
                min="0"
                step="100"
              />
            </FormField>

            <FormField label="시공면적 (㎡)" error={errors.coverage}>
              <FormInput
                value={formData.coverage}
                onChange={(e) => handleInputChange('coverage', e.target.value)}
                placeholder="예: 18L당 약 60㎡"
              />
            </FormField>
          </div>

          {/* 이미지 관리 */}
          <div className="space-y-4">
            <FormField label="메인 이미지 URL" required error={errors.main_image}>
              <div className="space-y-3">
                <FormInput
                  value={formData.main_image}
                  onChange={(e) => handleInputChange('main_image', e.target.value)}
                  placeholder="메인 이미지 URL을 입력하세요"
                  error={!!errors.main_image}
                />
                {formData.main_image && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <img
                      src={getImageUrl(formData.main_image)}
                      alt="메인 이미지 미리보기"
                      className="w-16 h-16 object-cover rounded border"
                      onError={handleImageError}
                    />
                    <span className="text-sm text-gray-600">메인 이미지 미리보기</span>
                  </div>
                )}
              </div>
            </FormField>

            <FormField label="갤러리 이미지">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <FormInput
                    value={newGalleryImage}
                    onChange={(e) => setNewGalleryImage(e.target.value)}
                    placeholder="갤러리 이미지 URL 입력"
                    className="flex-1"
                  />
                  <ActionButton type="button" onClick={addGalleryImage} size="sm">
                    <Plus className="w-4 h-4" />
                  </ActionButton>
                </div>
                {formData.gallery_images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.gallery_images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImageUrl(url)}
                          alt={`갤러리 이미지 ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                          onError={handleImageError}
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </div>

          {/* 특징 관리 */}
          <FormField label="제품 특징">
            <div className="space-y-3">
              <div className="flex gap-2">
                <FormInput
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="새로운 특징 입력"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <ActionButton type="button" onClick={addFeature} size="sm">
                  <Plus className="w-4 h-4" />
                </ActionButton>
              </div>

              {formData.features.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={formData.features} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <SortableFeature
                          key={feature}
                          id={feature}
                          feature={feature}
                          onRemove={() => removeFeature(index)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </FormField>

          {/* 적용분야 */}
          <FormField label="적용분야">
            <div className="space-y-3">
              <div className="flex gap-2">
                <FormInput
                  value={newApplication}
                  onChange={(e) => setNewApplication(e.target.value)}
                  placeholder="적용분야 입력"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
                />
                <ActionButton type="button" onClick={addApplication} size="sm">
                  <Plus className="w-4 h-4" />
                </ActionButton>
              </div>

              {formData.applications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.applications.map((app, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-blue-800">{app}</span>
                      <button
                        type="button"
                        onClick={() => removeApplication(index)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          {/* 제품 사양 */}
          <FormField label="제품 사양">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="사양명 (예: 용량)"
                />
                <div className="flex gap-2">
                  <FormInput
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="값 (예: 18L)"
                    className="flex-1"
                  />
                  <ActionButton type="button" onClick={addSpecification} size="sm">
                    <Plus className="w-4 h-4" />
                  </ActionButton>
                </div>
              </div>

              {Object.entries(formData.specifications).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700">{key}:</span>
                        <span className="text-sm text-gray-600 ml-2">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          {/* 옵션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="표시 옵션">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="mr-3 rounded"
                  />
                  <span className="text-sm text-gray-700">추천 제품으로 표시</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="mr-3 rounded"
                  />
                  <span className="text-sm text-gray-700">제품 활성화</span>
                </label>
              </div>
            </FormField>
          </div>
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
            loading={loading}
            className="w-full sm:w-auto"
          >
            {product ? '수정' : '추가'}
          </ActionButton>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ProductForm;
