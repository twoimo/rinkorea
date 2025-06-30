import React, { useState, useCallback, memo, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { SortableContextProps } from '@dnd-kit/sortable';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product, ProductFormData } from '@/types/product';
import { useLanguage } from '@/contexts/LanguageContext';
import Portal from '@/components/ui/portal';

interface ProductFormProps {
  product?: Product;
  onSave: (product: ProductFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
}

const SortableItem = ({ id, children, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </button>
      <span className="flex-1">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
};

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onClose,
  loading,
  error,
  success
}) => {
  const [formValues, setFormValues] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    icon: product?.icon || '',
    features: product?.features || [],
    detail_images: product?.detail_images || [],
    is_active: product?.is_active ?? true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent, type: 'features' | 'detail_images') => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormValues(prev => {
        const oldIndex = prev[type]?.findIndex(item => item === active.id) ?? -1;
        const newIndex = prev[type]?.findIndex(item => item === over.id) ?? -1;

        return {
          ...prev,
          [type]: arrayMove(prev[type] || [], oldIndex, newIndex)
        };
      });
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formValues,
        features: Array.isArray(formValues.features) ? formValues.features : [],
        detail_images: Array.isArray(formValues.detail_images) ? formValues.detail_images : [],
        is_active: true
      };
      console.log('Submitting payload:', payload);

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formValues, onSave, onClose]);

  const handleAddFeature = useCallback(() => {
    if (newFeature.trim()) {
      setFormValues(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  }, [newFeature]);

  const handleRemoveFeature = useCallback((index: number) => {
    setFormValues(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const handleAddImage = useCallback(() => {
    if (newImage.trim()) {
      setFormValues(prev => ({
        ...prev,
        detail_images: [...(prev.detail_images || []), newImage.trim()]
      }));
      setNewImage('');
    }
  }, [newImage]);

  const handleRemoveImage = useCallback((index: number) => {
    setFormValues(prev => ({
      ...prev,
      detail_images: prev.detail_images?.filter((_, i) => i !== index) || []
    }));
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, loading]);

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[120] p-4"
        onClick={!loading ? onClose : undefined}
      >
        <div
          className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{product ? '제품 수정' : '새 제품 추가'}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">제품명</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    value={formValues.name}
                    onChange={e => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">설명</label>
                  <textarea
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none min-h-[200px]"
                    value={formValues.description}
                    onChange={e => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">이미지 URL 또는 파일명</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    value={formValues.image_url}
                    onChange={e => setFormValues(prev => ({ ...prev, image_url: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">아이콘</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFormValues(prev => ({ ...prev, icon: '' }))}
                      className={`p-2 rounded-lg border ${!formValues.icon
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-blue-500'
                        }`}
                    >
                      선택 안함
                    </button>
                    {['Shield', 'Palette', 'Star', 'Zap', 'Leaf'].map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormValues(prev => ({ ...prev, icon }))}
                        className={`p-2 rounded-lg border ${formValues.icon === icon
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-blue-500'
                          }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">주요 특징</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        placeholder="새로운 특징을 입력하세요"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, 'features')}
                    >
                      <SortableContext
                        items={formValues.features || []}
                        strategy={verticalListSortingStrategy}
                      >
                        <ul className="space-y-2">
                          {formValues.features?.map((feature, index) => (
                            <SortableItem
                              key={feature}
                              id={feature}
                              onRemove={() => handleRemoveFeature(index)}
                            >
                              {feature}
                            </SortableItem>
                          ))}
                        </ul>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">상세 이미지 URL 또는 파일명</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        value={newImage}
                        onChange={e => setNewImage(e.target.value)}
                        placeholder="새로운 이미지 URL 또는 파일명을 입력하세요"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, 'detail_images')}
                    >
                      <SortableContext
                        items={formValues.detail_images || []}
                        strategy={verticalListSortingStrategy}
                      >
                        <ul className="space-y-2">
                          {formValues.detail_images?.map((image, index) => (
                            <SortableItem
                              key={image}
                              id={image}
                              onRemove={() => handleRemoveImage(index)}
                            >
                              {image}
                            </SortableItem>
                          ))}
                        </ul>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg">
                {success}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

ProductForm.displayName = 'ProductForm';

export default ProductForm;
