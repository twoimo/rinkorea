import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Equipment, EquipmentFormData, EquipmentCategory, EquipmentIcon } from '@/types/equipment';

interface EquipmentFormModalProps {
    equipment?: Equipment | null;
    onSave: (data: EquipmentFormData) => Promise<void>;
    onClose: () => void;
    loading?: boolean;
    error?: string | null;
    success?: string | null;
}

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    onRemove: () => void;
}

const SortableItem = ({ id, children, onRemove }: SortableItemProps): JSX.Element => {
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
                type="button"
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

const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
    equipment,
    onSave,
    onClose,
    loading = false,
    error = null,
    success = null
}) => {
    useLanguage();
    const modalRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();

    const [formValues, setFormValues] = useState<EquipmentFormData>({
        name: equipment?.name || '',
        description: equipment?.description || '',
        image_url: equipment?.image_url || '',
        icon: equipment?.icon as EquipmentIcon || 'none',
        category: equipment?.category as EquipmentCategory || 'premium',
        features: equipment?.features || []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newFeature, setNewFeature] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 모달 위치 및 스크롤 관리 효과
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

    // 폼 제출 핸들러
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formValues,
                features: Array.isArray(formValues.features) ? formValues.features : []
            };

            await onSave(payload);
        } catch (err) {
            console.error('Error saving equipment:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [formValues, onSave]);

    // 드래그 앤 드롭 핸들러
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id && formValues.features) {
            const oldIndex = formValues.features.findIndex(item => item === active.id);
            const newIndex = formValues.features.findIndex(item => item === over.id);
            setFormValues(prev => ({
                ...prev,
                features: arrayMove(prev.features || [], oldIndex, newIndex)
            }));
        }
    }, [formValues.features]);

    // 특징 추가
    const handleAddFeature = useCallback(() => {
        if (newFeature.trim()) {
            setFormValues(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }));
            setNewFeature('');
        }
    }, [newFeature]);

    // 특징 제거
    const handleRemoveFeature = useCallback((index: number) => {
        setFormValues(prev => ({
            ...prev,
            features: prev.features?.filter((_, i) => i !== index) || []
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
                className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {equipment ? '장비 수정' : '새 장비 추가'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <form className="p-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                장비명
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                value={formValues.name || ''}
                                onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                설명
                            </label>
                            <textarea
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none min-h-[120px]"
                                value={formValues.description || ''}
                                onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Image URL Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                이미지 URL
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                value={formValues.image_url || ''}
                                onChange={(e) => setFormValues(prev => ({ ...prev, image_url: e.target.value }))}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Icon Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                아이콘
                            </label>
                            <select
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                value={formValues.icon || ''}
                                onChange={(e) => setFormValues(prev => ({ ...prev, icon: e.target.value as EquipmentIcon }))}
                                required
                                disabled={loading}
                            >
                                <option value="none">선택 안함</option>
                                <option value="settings">설정</option>
                                <option value="wrench">도구</option>
                            </select>
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                카테고리
                            </label>
                            <select
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                value={formValues.category || ''}
                                onChange={(e) => setFormValues(prev => ({ ...prev, category: e.target.value as EquipmentCategory }))}
                                required
                                disabled={loading}
                            >
                                <option value="premium">프리미엄</option>
                                <option value="professional">프로페셔널</option>
                                <option value="diatool">다이아툴</option>
                            </select>
                        </div>

                        {/* Features Management */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                주요 특징
                            </label>
                            <div className="space-y-2">
                                {/* Add Feature Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        placeholder="새로운 특징을 입력하세요"
                                        disabled={loading}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddFeature();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddFeature}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        disabled={loading}
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Features List with DND */}
                                {formValues.features && formValues.features.length > 0 && (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={formValues.features}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <ul className="space-y-2">
                                                {formValues.features.map((feature, index) => (
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
                                )}

                                {(!formValues.features || formValues.features.length === 0) && (
                                    <p className="text-gray-400 text-sm italic">
                                        추가된 특징이 없습니다
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error and Success Messages */}
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

                    {/* Form Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading || isSubmitting ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default EquipmentFormModal; 