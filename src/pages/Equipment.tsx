import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EquipmentSkeleton from '@/components/equipment/EquipmentSkeleton';
import { Settings, Wrench, Award, Star, Plus, Edit, Trash2, X, EyeOff, Eye, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage, getLocalizedValue, getLocalizedArray } from '@/contexts/LanguageContext';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Equipment {
    id: string;
    name: string;
    description: string;
    image_url: string;
    icon: string;
    features: string[];
    category: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
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
        </li>
    );
};

const Equipment = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useUserRole();
    const { t, language } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [formValues, setFormValues] = useState<Partial<Equipment>>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [hiddenEquipmentIds, setHiddenEquipmentIds] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState('');
    const [activeTab, setActiveTab] = useState<'construction' | 'diatool'>('construction');

    // Refs for modals
    const formModalRef = useRef<HTMLDivElement>(null);
    const deleteModalRef = useRef<HTMLDivElement>(null);
    const formAnimationFrameRef = useRef<number>();
    const deleteAnimationFrameRef = useRef<number>();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 숨김 기계 목록 불러오기 함수
    const fetchHiddenEquipment = async () => {
        const { data, error } = await (supabase as unknown as SupabaseClient)
            .from('equipment_introduction_hidden')
            .select('equipment_id');
        if (!error && data) {
            setHiddenEquipmentIds(data.map((h: { equipment_id: string }) => h.equipment_id));
        }
    };

    useEffect(() => {
        const fetchEquipment = async () => {
            setLoading(true);
            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: true });
            if (!error && data) {
                setEquipment(data);
            }
            setLoading(false);
        };
        fetchEquipment();
    }, []);

    useEffect(() => {
        fetchHiddenEquipment();
    }, []);

    // 폼 열기
    const openForm = (equipment?: Equipment) => {
        setEditingEquipment(equipment || null);
        setFormValues(equipment ? { ...equipment } : {});
        setShowForm(true);
    };

    // 폼 닫기
    const closeForm = () => {
        setShowForm(false);
        setEditingEquipment(null);
        setFormValues({});
        setFormError(null);
        setFormSuccess(null);
    };

    // 삭제 확인 모달 열기
    const openDeleteConfirm = (equipment: Equipment) => {
        setDeleteTarget(equipment);
        setShowDeleteConfirm(true);
    };

    // 삭제 확인 모달 닫기
    const closeDeleteConfirm = () => {
        setDeleteTarget(null);
        setShowDeleteConfirm(false);
    };

    // Form Modal Effects - 다른 모달들과 동일한 방식
    useEffect(() => {
        if (!showForm) return;

        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyTouchAction = document.body.style.touchAction;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        const isInsideModal = (target: EventTarget | null): boolean => {
            if (!target || !formModalRef.current) return false;
            const element = target as Element;
            return formModalRef.current.contains(element);
        };

        const preventWheel = (e: WheelEvent) => {
            if (!isInsideModal(e.target)) e.preventDefault();
        };

        const preventTouch = (e: TouchEvent) => {
            if (e.touches.length > 1) return;
            if (!isInsideModal(e.target)) e.preventDefault();
        };

        const preventKeyScroll = (e: KeyboardEvent) => {
            const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
            if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) e.preventDefault();
        };

        const updateModalPosition = () => {
            if (!formModalRef.current) return;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            const modalElement = formModalRef.current;
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

            formAnimationFrameRef.current = requestAnimationFrame(updateModalPosition);
        };

        updateModalPosition();

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !formLoading) closeForm();
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('wheel', preventWheel, { passive: false });
        document.addEventListener('touchmove', preventTouch, { passive: false });
        document.addEventListener('keydown', preventKeyScroll, { passive: false });

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('wheel', preventWheel);
            document.removeEventListener('touchmove', preventTouch);
            document.removeEventListener('keydown', preventKeyScroll);

            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.touchAction = originalBodyTouchAction;

            if (formAnimationFrameRef.current) {
                cancelAnimationFrame(formAnimationFrameRef.current);
            }
        };
    }, [showForm, formLoading]);

    // Delete Modal Effects - 다른 모달들과 동일한 방식
    useEffect(() => {
        if (!showDeleteConfirm) return;

        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyTouchAction = document.body.style.touchAction;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        const isInsideModal = (target: EventTarget | null): boolean => {
            if (!target || !deleteModalRef.current) return false;
            const element = target as Element;
            return deleteModalRef.current.contains(element);
        };

        const preventWheel = (e: WheelEvent) => {
            if (!isInsideModal(e.target)) e.preventDefault();
        };

        const preventTouch = (e: TouchEvent) => {
            if (e.touches.length > 1) return;
            if (!isInsideModal(e.target)) e.preventDefault();
        };

        const preventKeyScroll = (e: KeyboardEvent) => {
            const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
            if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) e.preventDefault();
        };

        const updateModalPosition = () => {
            if (!deleteModalRef.current) return;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            const modalElement = deleteModalRef.current;
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

            deleteAnimationFrameRef.current = requestAnimationFrame(updateModalPosition);
        };

        updateModalPosition();

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeDeleteConfirm();
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('wheel', preventWheel, { passive: false });
        document.addEventListener('touchmove', preventTouch, { passive: false });
        document.addEventListener('keydown', preventKeyScroll, { passive: false });

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('wheel', preventWheel);
            document.removeEventListener('touchmove', preventTouch);
            document.removeEventListener('keydown', preventKeyScroll);

            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.touchAction = originalBodyTouchAction;

            if (deleteAnimationFrameRef.current) {
                cancelAnimationFrame(deleteAnimationFrameRef.current);
            }
        };
    }, [showDeleteConfirm]);

    // 기계 저장(추가/수정)
    const handleFormSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const payload = { ...formValues, updated_at: new Date().toISOString() };
            let result;

            if (editingEquipment) {
                result = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introductions')
                    .update(payload)
                    .eq('id', editingEquipment.id);

                if (!result.error) {
                    setEquipment(equipment.map(e => e.id === editingEquipment.id ? { ...e, ...payload } : e));
                }
            } else {
                result = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introductions')
                    .insert([{ ...payload, created_at: new Date().toISOString(), is_active: true }]);

                if (!result.error && result.data) {
                    setEquipment([...equipment, result.data[0]]);
                }
            }

            if (result.error) {
                setFormError(result.error.message);
            } else {
                setFormSuccess(editingEquipment ? t('equipment_updated_success') : t('equipment_added_success'));
                setTimeout(() => {
                    closeForm();
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            setFormError(t('error'));
        } finally {
            setFormLoading(false);
        }
    };

    // 기계 삭제
    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const { error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .delete()
                .eq('id', deleteTarget.id);

            if (!error) {
                setEquipment(equipment.filter(e => e.id !== deleteTarget.id));
                closeDeleteConfirm();
            }
        } catch (error) {
            // Error is already handled by toast notification
        }
    };

    // 기계 숨기기/보이기 토글
    const handleToggleHide = async (equipment: Equipment) => {
        try {
            if (hiddenEquipmentIds.includes(equipment.id)) {
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .delete()
                    .eq('equipment_id', equipment.id);
                if (!error) {
                    setHiddenEquipmentIds(prev => prev.filter(id => id !== equipment.id));
                }
            } else {
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .insert([{ equipment_id: equipment.id }]);
                if (!error) {
                    setHiddenEquipmentIds(prev => [...prev, equipment.id]);
                }
            }
        } catch (error) {
            // Error is already handled by toast notification
        }
    };

    // 유틸리티 함수들
    const getVisibleEquipment = () => {
        if (isAdmin) return equipment;
        return equipment.filter(e => !hiddenEquipmentIds.includes(e.id));
    };

    const getImageUrl = (imagePath: string) => {
        if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
        return `/images/${imagePath}`;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setFormValues(prev => {
                const oldIndex = prev.features?.findIndex(item => item === active.id) ?? -1;
                const newIndex = prev.features?.findIndex(item => item === over.id) ?? -1;
                return {
                    ...prev,
                    features: arrayMove(prev.features || [], oldIndex, newIndex)
                };
            });
        }
    };

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            setFormValues(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormValues(prev => ({
            ...prev,
            features: prev.features?.filter((_, i) => i !== index) || []
        }));
    };

    if (loading) {
        return (
            <>
                <Header />
                <EquipmentSkeleton />
                <Footer />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">{t('equipment_hero_title')}</h1>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            {t('equipment_hero_subtitle')}
                        </p>
                        {isAdmin && (
                            <button
                                onClick={() => openForm()}
                                className="mt-6 md:mt-8 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center mx-auto"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {t('equipment_add_btn')}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Partnership Section */}
            <section className="py-12 md:py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                        <div className="w-full md:w-1/2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                                <Award className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-0 sm:mr-3 mb-2 sm:mb-0" />
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('equipment_partnership_title')}</h2>
                            </div>
                            <div className="text-base md:text-lg text-gray-600 leading-relaxed">
                                <p className="mb-4">
                                    {t('equipment_partnership_desc')}
                                </p>
                                <div style={{ whiteSpace: 'pre-line' }}>
                                    {t('equipment_partnership_contact')}
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <img
                                src="/images/optimized/js-floor-systems.webp"
                                alt="Shanghai JS Floor Systems Partnership"
                                className="w-full h-auto rounded-lg shadow-xl"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center">
                        <div className="flex space-x-8 md:space-x-12">
                            <button
                                onClick={() => setActiveTab('construction')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-colors ${activeTab === 'construction'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {t('equipment_construction_tab')}
                            </button>
                            <button
                                onClick={() => setActiveTab('diatool')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-colors ${activeTab === 'diatool'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {t('equipment_diatool_tab')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Equipment Content */}
            {activeTab === 'construction' && (
                <>
                    {/* Premium Equipment */}
                    {getVisibleEquipment().filter(e => e.category === 'premium').length > 0 && (
                        <section className="py-12 md:py-20">
                            <div className="container mx-auto px-4">
                                <div className="text-center mb-8 md:mb-12">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('equipment_premium_title')}</h2>
                                    <p className="text-lg md:text-xl text-gray-600">{t('equipment_premium_subtitle')}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {getVisibleEquipment().filter(e => e.category === 'premium').map((item, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                            <div className="relative overflow-hidden aspect-[3/4] md:aspect-[2/3]">
                                                <img
                                                    src={getImageUrl(item.image_url)}
                                                    alt={getLocalizedValue(item, 'name', language)}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                                    loading="lazy"
                                                />
                                                {isAdmin && (
                                                    <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col space-y-2">
                                                        <button
                                                            onClick={() => handleToggleHide(item)}
                                                            className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                        >
                                                            {hiddenEquipmentIds.includes(item.id) ?
                                                                <Eye className="w-4 h-4 text-gray-600" /> :
                                                                <EyeOff className="w-4 h-4 text-gray-600" />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => openForm(item)}
                                                            className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteConfirm(item)}
                                                            className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white p-2 rounded-full">
                                                    {item.icon === 'settings' && <Settings className="w-6 h-6 text-blue-600" />}
                                                    {item.icon === 'wrench' && <Wrench className="w-6 h-6 text-blue-600" />}
                                                </div>
                                            </div>
                                            <div className="p-4 md:p-6">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                                                    {getLocalizedValue(item, 'name', language)}
                                                </h3>
                                                <p className="text-gray-600 mb-4 text-sm md:text-base">
                                                    {getLocalizedValue(item, 'description', language)}
                                                </p>
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">{t('equipment_features_label')}</h4>
                                                    <ul className="space-y-2">
                                                        {getLocalizedArray(item, 'features', language).map((feature, featureIndex) => (
                                                            <li key={featureIndex} className="flex items-center text-gray-600 text-sm md:text-base">
                                                                <Star className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-2 flex-shrink-0" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Professional Equipment */}
                    {getVisibleEquipment().filter(e => e.category === 'professional').length > 0 && (
                        <section className="py-12 md:py-20 bg-gray-50">
                            <div className="container mx-auto px-4">
                                <div className="text-center mb-8 md:mb-12">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('equipment_professional_title')}</h2>
                                    <p className="text-lg md:text-xl text-gray-600">{t('equipment_professional_subtitle')}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {getVisibleEquipment().filter(e => e.category === 'professional').map((item, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                            <div className="relative overflow-hidden aspect-[3/4] md:aspect-[2/3]">
                                                <img
                                                    src={getImageUrl(item.image_url)}
                                                    alt={getLocalizedValue(item, 'name', language)}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                                    loading="lazy"
                                                />
                                                {isAdmin && (
                                                    <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col space-y-2">
                                                        <button
                                                            onClick={() => handleToggleHide(item)}
                                                            className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                        >
                                                            {hiddenEquipmentIds.includes(item.id) ?
                                                                <Eye className="w-4 h-4 text-gray-600" /> :
                                                                <EyeOff className="w-4 h-4 text-gray-600" />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => openForm(item)}
                                                            className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteConfirm(item)}
                                                            className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white p-2 rounded-full">
                                                    {item.icon === 'settings' && <Settings className="w-6 h-6 text-blue-600" />}
                                                    {item.icon === 'wrench' && <Wrench className="w-6 h-6 text-blue-600" />}
                                                </div>
                                            </div>
                                            <div className="p-4 md:p-6">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                                                    {getLocalizedValue(item, 'name', language)}
                                                </h3>
                                                <p className="text-gray-600 mb-4 text-sm md:text-base">
                                                    {getLocalizedValue(item, 'description', language)}
                                                </p>
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">{t('equipment_features_label')}</h4>
                                                    <ul className="space-y-2">
                                                        {getLocalizedArray(item, 'features', language).map((feature, featureIndex) => (
                                                            <li key={featureIndex} className="flex items-center text-gray-600 text-sm md:text-base">
                                                                <Star className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-2 flex-shrink-0" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* Diatool Tab */}
            {activeTab === 'diatool' && (
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('equipment_diatool_title')}</h2>
                            <p className="text-lg md:text-xl text-gray-600 mb-8">{t('equipment_diatool_subtitle')}</p>
                        </div>

                        {getVisibleEquipment().filter(e => e.category === 'diatool').length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
                                <p className="text-gray-500 text-lg">{t('equipment_diatool_empty')}</p>
                                {isAdmin && (
                                    <button
                                        onClick={() => openForm()}
                                        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 mr-2 inline" />
                                        {t('equipment_diatool_add')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {getVisibleEquipment().filter(e => e.category === 'diatool').map((item, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="relative overflow-hidden aspect-square">
                                            <img
                                                src={getImageUrl(item.image_url)}
                                                alt={getLocalizedValue(item, 'name', language)}
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                                loading="lazy"
                                            />
                                            {isAdmin && (
                                                <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col space-y-2">
                                                    <button
                                                        onClick={() => handleToggleHide(item)}
                                                        className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                    >
                                                        {hiddenEquipmentIds.includes(item.id) ?
                                                            <Eye className="w-4 h-4 text-gray-600" /> :
                                                            <EyeOff className="w-4 h-4 text-gray-600" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => openForm(item)}
                                                        className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                    >
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteConfirm(item)}
                                                        className="bg-white p-2 rounded-full hover:bg-gray-100"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 md:p-6">
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                                                {getLocalizedValue(item, 'name', language)}
                                            </h3>
                                            <p className="text-gray-600 mb-4 text-sm md:text-base">
                                                {getLocalizedValue(item, 'description', language)}
                                            </p>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-gray-900">{t('equipment_features_label')}</h4>
                                                <ul className="space-y-2">
                                                    {getLocalizedArray(item, 'features', language).map((feature, featureIndex) => (
                                                        <li key={featureIndex} className="flex items-center text-gray-600 text-sm md:text-base">
                                                            <Star className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-2 flex-shrink-0" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            <Footer />

            {/* Equipment Form Modal */}
            {showForm && createPortal(
                <div
                    ref={formModalRef}
                    aria-label="Equipment Form Modal"
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        zIndex: 2147483647,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        boxSizing: 'border-box',
                        transform: 'translateZ(0)'
                    }}
                    onClick={!formLoading ? closeForm : undefined}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6">
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                                onClick={closeForm}
                                disabled={formLoading}
                                aria-label="Close Modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl md:text-2xl font-bold pr-8">
                                {editingEquipment ? t('equipment_edit_modal_title') : t('equipment_add_modal_title')}
                            </h2>
                        </div>
                        <div className="p-4 md:p-6">
                            <form onSubmit={handleFormSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_name')}</label>
                                    <input
                                        type="text"
                                        value={formValues.name || ''}
                                        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_description')}</label>
                                    <textarea
                                        value={formValues.description || ''}
                                        onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_image')}</label>
                                    <input
                                        type="text"
                                        value={formValues.image_url || ''}
                                        onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_icon')}</label>
                                    <select
                                        value={formValues.icon || ''}
                                        onChange={(e) => setFormValues({ ...formValues, icon: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={formLoading}
                                    >
                                        <option value="">{t('equipment_form_select_placeholder')}</option>
                                        <option value="none">{t('equipment_form_icon_none')}</option>
                                        <option value="settings">{t('equipment_form_icon_settings')}</option>
                                        <option value="wrench">{t('equipment_form_icon_wrench')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_category')}</label>
                                    <select
                                        value={formValues.category || ''}
                                        onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={formLoading}
                                    >
                                        <option value="">{t('equipment_form_select_placeholder')}</option>
                                        <option value="premium">{t('equipment_form_category_premium')}</option>
                                        <option value="professional">{t('equipment_form_category_professional')}</option>
                                        <option value="diatool">{t('equipment_form_category_diatool')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_features')}</label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={newFeature}
                                                onChange={e => setNewFeature(e.target.value)}
                                                placeholder={t('equipment_form_features_placeholder')}
                                                disabled={formLoading}
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
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                disabled={formLoading}
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        {formValues.features && formValues.features.length > 0 && (
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={formValues.features || []}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <ul className="space-y-2">
                                                        {formValues.features?.map((feature, index) => (
                                                            <SortableItem key={feature} id={feature}>
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span className="flex-1 text-sm">{feature}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFeature(index)}
                                                                        className="text-red-600 hover:text-red-700 disabled:opacity-50 ml-2"
                                                                        disabled={formLoading}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </SortableItem>
                                                        ))}
                                                    </ul>
                                                </SortableContext>
                                            </DndContext>
                                        )}
                                        {(!formValues.features || formValues.features.length === 0) && (
                                            <p className="text-gray-400 text-sm italic">{t('equipment_form_features_empty')}</p>
                                        )}
                                    </div>
                                </div>
                                {formError && (
                                    <div className="text-red-600 text-sm">{formError}</div>
                                )}
                                {formSuccess && (
                                    <div className="text-green-600 text-sm">{formSuccess}</div>
                                )}
                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                        disabled={formLoading}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {formLoading ? t('equipment_saving') : t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && deleteTarget && createPortal(
                <div
                    ref={deleteModalRef}
                    aria-label="Delete Confirmation Modal"
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        zIndex: 2147483647,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        boxSizing: 'border-box',
                        transform: 'translateZ(0)'
                    }}
                    onClick={closeDeleteConfirm}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <div className="p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold mb-4">{t('equipment_delete_modal_title')}</h2>
                            <p className="text-gray-600 mb-6">
                                {t('equipment_delete_confirm_text')} "{deleteTarget.name}"
                            </p>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                                <button
                                    onClick={closeDeleteConfirm}
                                    className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Equipment;