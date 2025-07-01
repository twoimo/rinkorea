import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product, ProductFormData } from '@/types/product';


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
  const modalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [formValues, setFormValues] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    icon: product?.icon || '',
    features: product?.features || [],
    detail_images: product?.detail_images || [],
    is_active: product?.is_active ?? true
  });
  const [_isSubmitting, setIsSubmitting] = useState(false);

  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // 스크롤 차단 강화
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    // CSS로 스크롤 차단
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // 모달 내부 요소인지 확인하는 함수
    const isInsideModal = (target: EventTarget | null): boolean => {
      if (!target || !modalRef.current) return false;
      const element = target as Element;
      return modalRef.current.contains(element);
    };

    // 마우스 휠 스크롤 차단 (모달 외부만)
    const preventWheel = (e: WheelEvent) => {
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 터치 스크롤 차단 (모달 외부만)
    const preventTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) return; // 멀티터치는 허용
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 키보드 스크롤 차단 (모달 외부만)
    const preventKeyScroll = (e: KeyboardEvent) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, pageup, pagedown, end, home, left, up, right, down
      if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 뷰포트 위치 계속 업데이트
    const updateModalPosition = () => {
      if (!modalRef.current) return;

      // 현재 뷰포트 정보 가져오기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // 모달을 현재 뷰포트 중앙에 정확히 배치
      const modalElement = modalRef.current;
      modalElement.style.position = 'absolute';
      modalElement.style.top = `${scrollTop}px`;
      modalElement.style.left = `${scrollLeft}px`;
      modalElement.style.width = `${viewportWidth}px`;
      modalElement.style.height = `${viewportHeight}px`;
      modalElement.style.zIndex = '2147483647';
      modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      modalElement.style.display = 'flex';
      modalElement.style.alignItems = 'center';
      modalElement.style.justifyContent = 'center';
      modalElement.style.padding = '16px';
      modalElement.style.boxSizing = 'border-box';

      // 다음 프레임에서도 계속 업데이트
      animationFrameRef.current = requestAnimationFrame(updateModalPosition);
    };

    // 첫 위치 설정
    updateModalPosition();

    // ESC 키 이벤트
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('touchmove', preventTouch, { passive: false });
    document.addEventListener('keydown', preventKeyScroll, { passive: false });

    return () => {
      // 이벤트 리스너 제거
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventTouch);
      document.removeEventListener('keydown', preventKeyScroll);

      // 스타일 복원
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouchAction;

      // 애니메이션 프레임 정리
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onClose, loading]);

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

  const modalContent = (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
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
  );

  return createPortal(modalContent, document.body);
};

ProductForm.displayName = 'ProductForm';

export default ProductForm;
