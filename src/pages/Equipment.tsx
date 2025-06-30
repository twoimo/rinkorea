import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    [key: string]: unknown; // Add index signature for localization functions
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

    // 기계 저장(추가/수정)
    const handleFormSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const payload = {
                ...formValues,
                updated_at: new Date().toISOString(),
            };

            let result;
            if (editingEquipment) {
                // 수정
                result = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introductions')
                    .update(payload)
                    .eq('id', editingEquipment.id);

                if (!result.error) {
                    // 수정된 기계로 상태 업데이트
                    setEquipment(equipment.map(e =>
                        e.id === editingEquipment.id ? { ...e, ...payload } : e
                    ));
                }
            } else {
                // 추가
                result = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introductions')
                    .insert([{ ...payload, created_at: new Date().toISOString(), is_active: true }]);

                if (!result.error && result.data) {
                    // 새 기계 추가
                    setEquipment([...equipment, result.data[0]]);
                }
            }

            if (result.error) {
                setFormError(result.error.message);
            } else {
                setFormSuccess(editingEquipment ? t('equipment_updated_success', '기계가 수정되었습니다.') : t('equipment_added_success', '기계가 추가되었습니다.'));
                setTimeout(() => {
                    closeForm();
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            setFormError(t('error', '오류가 발생했습니다.'));
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

            if (error) {
                console.error('Error deleting equipment:', error);
            } else {
                setEquipment(equipment.filter(e => e.id !== deleteTarget.id));
                closeDeleteConfirm();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // 기계 숨기기/보이기 토글
    const handleToggleHide = async (equipment: Equipment) => {
        try {
            if (hiddenEquipmentIds.includes(equipment.id)) {
                // 숨김 해제
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .delete()
                    .eq('equipment_id', equipment.id);
                if (!error) {
                    setHiddenEquipmentIds(prev => prev.filter(id => id !== equipment.id));
                }
            } else {
                // 숨김 처리
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .insert([{ equipment_id: equipment.id }]);
                if (!error) {
                    setHiddenEquipmentIds(prev => [...prev, equipment.id]);
                }
            }
        } catch (error) {
            console.error('Error toggling equipment visibility:', error);
        }
    };

    // 보이는 기계만 필터링
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

    // 탭별 장비 렌더링 컴포넌트
    const renderEquipmentGrid = (category: string, title: string, bgClass: string = "") => {
        const categoryEquipment = getVisibleEquipment().filter(e => e.category === category);

        if (categoryEquipment.length === 0) {
            return null;
        }

        return (
            <section className={`py-12 md:py-20 ${bgClass}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                        <p className="text-lg md:text-xl text-gray-600">
                            {category === 'premium' && t('equipment_premium_subtitle', '최첨단 기술이 적용된 프리미엄 연삭기 라인업')}
                            {category === 'professional' && t('equipment_professional_subtitle', '전문가를 위한 고성능 연삭기 시리즈')}
                            {category === 'diatool' && t('equipment_diatool_subtitle', '고품질 다이아몬드 공구 및 액세서리')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {categoryEquipment.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className={`relative overflow-hidden ${category === 'diatool' ? 'aspect-square' : 'aspect-[3/4] md:aspect-[2/3]'}`}>
                                    <img
                                        src={getImageUrl(item.image_url)}
                                        alt={getLocalizedValue(item, 'name', language)}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                        loading="lazy"
                                    />
                                    {isAdmin && (
                                        <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                            <button
                                                onClick={() => handleToggleHide(item)}
                                                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                                            >
                                                {hiddenEquipmentIds.includes(item.id) ? (
                                                    <Eye className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => openForm(item)}
                                                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                                            >
                                                <Edit className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirm(item)}
                                                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white p-2 rounded-full">
                                        {item.icon === 'settings' && <Settings className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />}
                                        {item.icon === 'wrench' && <Wrench className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />}
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
                                        <h4 className="font-semibold text-gray-900">{t('equipment_features_label', '주요 특징:')}</h4>
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
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section - 모바일 최적화 */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">{t('equipment_hero_title', '건설건설기계소개')}</h1>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            {t('equipment_hero_subtitle', '최첨단 기술의 콘크리트 연삭기로 최고의 품질과 효율성을 제공합니다.')}
                        </p>
                        {isAdmin && (
                            <button
                                onClick={() => openForm()}
                                className="mt-6 md:mt-8 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center mx-auto touch-manipulation"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {t('equipment_add_btn', '기계 추가')}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Partnership Section - 모바일 최적화 */}
            <section className="py-12 md:py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                        <div className="w-full md:w-1/2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                                <Award className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-0 sm:mr-3 mb-2 sm:mb-0" />
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('equipment_partnership_title', 'Shanghai JS Floor Systems 공식 파트너')}</h2>
                            </div>
                            <div className="text-base md:text-lg text-gray-600 leading-relaxed">
                                <p className="mb-4">
                                    {t('equipment_partnership_desc', 'Shanghai JS Floor Systems의 공식 파트너사로서 한국 공식 판매업체 및 서비스센터를 운영하고 있습니다. 세계적인 공사 현장에서 사용되는 콘크리트 연삭기 시장의 선두주자입니다.')}
                                </p>
                                <div>
                                    {String(t('equipment_partnership_contact', '한국 공식판매 & 공식서비스센터(AS)\n주소: 인천\n문의전화: 032-571-1023')).split('\n').map((line, i) => (
                                        <span key={i}>{line}{i < 2 && <br />}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <img
                                src="/images/js-floor-systems.png"
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
                                {t('equipment_construction_tab', '건설기계')}
                            </button>
                            <button
                                onClick={() => setActiveTab('diatool')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-colors ${activeTab === 'diatool'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {t('equipment_diatool_tab', '다이아툴')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Content */}
            {activeTab === 'construction' && (
                <>
                    {renderEquipmentGrid('premium', t('equipment_premium_title', '최신형 콘크리트 연삭기'))}
                    {renderEquipmentGrid('professional', t('equipment_professional_title', '콘크리트 연삭기'), 'bg-gray-50')}
                </>
            )}

            {activeTab === 'diatool' && (
                <>
                    {renderEquipmentGrid('diatool', t('equipment_diatool_title', '다이아툴'))}
                    {/* 다이아툴 장비가 없을 때 메시지 표시 */}
                    {getVisibleEquipment().filter(e => e.category === 'diatool').length === 0 && (
                        <section className="py-12 md:py-20">
                            <div className="container mx-auto px-4">
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('equipment_diatool_title', '다이아툴')}</h2>
                                    <p className="text-lg md:text-xl text-gray-600 mb-8">
                                        {t('equipment_diatool_subtitle', '고품질 다이아몬드 공구 및 액세서리')}
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-8 md:p-12">
                                        <p className="text-gray-500 text-lg">
                                            {t('equipment_diatool_empty', '다이아툴 제품이 준비 중입니다.')}
                                        </p>
                                        {isAdmin && (
                                            <button
                                                onClick={() => openForm()}
                                                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="w-5 h-5 mr-2 inline" />
                                                {t('equipment_diatool_add', '다이아툴 추가')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* Equipment Form Modal - 모바일 최적화 */}
            {showForm && createPortal(
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[120] p-4"
                    onClick={!formLoading ? closeForm : undefined}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6">
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 touch-manipulation"
                                onClick={closeForm}
                                disabled={formLoading}
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl md:text-2xl font-bold pr-8">
                                {editingEquipment ? t('equipment_edit_modal_title', '기계 수정') : t('equipment_add_modal_title', '기계 추가')}
                            </h2>
                        </div>
                        <div className="p-4 md:p-6">
                            <form onSubmit={handleFormSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_name', '이름')}</label>
                                    <input
                                        type="text"
                                        value={formValues.name || ''}
                                        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                        className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_description', '설명')}</label>
                                    <textarea
                                        value={formValues.description || ''}
                                        onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                        className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                        rows={3}
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_image', '이미지 URL')}</label>
                                    <input
                                        type="text"
                                        value={formValues.image_url || ''}
                                        onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
                                        className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_icon', '아이콘')}</label>
                                    <select
                                        value={formValues.icon || ''}
                                        onChange={(e) => setFormValues({ ...formValues, icon: e.target.value })}
                                        className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                        required
                                        disabled={formLoading}
                                    >
                                        <option value="">{t('select', '선택하세요')}</option>
                                        <option value="none">None</option>
                                        <option value="settings">Settings</option>
                                        <option value="wrench">Wrench</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment_form_category', '카테고리')}</label>
                                    <select
                                        value={formValues.category || ''}
                                        onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                                        className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                        required
                                        disabled={formLoading}
                                    >
                                        <option value="">{t('select', '선택하세요')}</option>
                                        <option value="premium">{t('equipment_category_premium', '최신형 콘크리트 연삭기')}</option>
                                        <option value="professional">{t('equipment_category_professional', '콘크리트 연삭기')}</option>
                                        <option value="diatool">{t('equipment_category_diatool', '다이아툴')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">특징</label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                                value={newFeature}
                                                onChange={e => setNewFeature(e.target.value)}
                                                placeholder="새로운 특징을 입력하세요"
                                                disabled={formLoading}
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
                                                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                                <span className="flex-1">{feature}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveFeature(index)}
                                                                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
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
                                        className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 touch-manipulation disabled:opacity-50"
                                        disabled={formLoading}
                                    >
                                        {t('cancel', '취소')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
                                    >
                                        {formLoading ? t('saving', '저장 중...') : t('save', '저장')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                </Portal>
    )
}

{/* Delete Confirmation Modal - 모바일 최적화 */ }
{
    showDeleteConfirm && deleteTarget && (
        <Portal>
            <div
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[120] p-4"
                onClick={closeDeleteConfirm}
            >
                <div
                    className="bg-white rounded-lg shadow-lg w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 md:p-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4">{t('equipment_delete_modal_title', '기계 삭제')}</h2>
                        <p className="text-gray-600 mb-6">
                            {t('equipment_delete_confirm', '정말로 기계를 삭제하시겠습니까?')} "{deleteTarget.name}"
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={closeDeleteConfirm}
                                className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 touch-manipulation"
                            >
                                {t('cancel', '취소')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 touch-manipulation"
                            >
                                {t('delete', '삭제')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    )
}

<Footer />
        </div >
    );
};

export default Equipment;
