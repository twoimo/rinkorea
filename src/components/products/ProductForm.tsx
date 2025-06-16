import React, { useState, useCallback, memo } from 'react';
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

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  features: string[];
  detail_images?: string[];
}

interface ProductFormProps {
  product?: Product | null;
  onSave: (formData: Partial<Product>) => Promise<void>;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  success: string | null;
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

const ProductForm = memo(({ product, onSave, onClose, loading, error, success }: ProductFormProps) => {
  const [formValues, setFormValues] = useState<Partial<Product>>({
    name: product?.name || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    icon: product?.icon || '',
    features: product?.features || [],
    detail_images: product?.detail_images || []
  });

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
    await onSave(formValues);
  }, [formValues, onSave]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold">
            {product ? '제품 수정' : '제품 추가'}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-700 touch-manipulation"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-name">제품명</label>
            <input
              id="product-name"
              type="text"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              value={formValues.name || ''}
              onChange={e => setFormValues(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-description">설명</label>
            <textarea
              id="product-description"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[80px]"
              value={formValues.description || ''}
              onChange={e => setFormValues(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-image">이미지 URL 또는 파일명</label>
            <input
              id="product-image"
              type="text"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              value={formValues.image_url || ''}
              onChange={e => setFormValues(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="예: https://example.com/image.jpg 또는 image.jpg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-icon">아이콘</label>
            <select
              id="product-icon"
              value={formValues.icon || ''}
              onChange={e => setFormValues(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            >
              <option value="">아이콘 선택</option>
              <option value="shield">Shield</option>
              <option value="palette">Palette</option>
              <option value="star">Star</option>
              <option value="zap">Zap</option>
              <option value="leaf">Leaf</option>
            </select>
          </div>
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
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg" role="alert">
              {success}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors touch-manipulation"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors touch-manipulation"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;
