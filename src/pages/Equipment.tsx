import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Settings, Wrench, Award, Star, Plus, Edit, Trash2, X, EyeOff, Eye } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useUserRole } from '../hooks/useUserRole';
import { SupabaseClient } from '@supabase/supabase-js';

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
}

const Equipment = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useUserRole();
    const [showForm, setShowForm] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [formValues, setFormValues] = useState<Partial<Equipment>>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [hiddenEquipmentIds, setHiddenEquipmentIds] = useState<string[]>([]);

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
                setFormSuccess(editingEquipment ? '기계가 수정되었습니다.' : '기계가 추가되었습니다.');
                setTimeout(() => {
                    closeForm();
                }, 1500);
            }
        } catch (error) {
            setFormError('오류가 발생했습니다.');
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
        return equipment;
    };

    const getImageUrl = (imagePath: string) => {
        if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
        return `/images/${imagePath}`;
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">건설기계소개</h1>
                        <p className="text-xl max-w-2xl mx-auto">
                            최첨단 콘크리트 연삭기와 연마기로 <br />
                            최고의 품질과 효율성을 제공합니다.
                        </p>
                        {isAdmin && (
                            <button
                                onClick={() => openForm()}
                                className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center mx-auto"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                기계 추가
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Partnership Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="md:w-1/2">
                            <div className="flex items-center mb-4">
                                <Award className="w-8 h-8 text-blue-600 mr-3" />
                                <h2 className="text-3xl font-bold text-gray-900">Shanghai JS Floor Systems 공식 파트너</h2>
                            </div>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Shanghai JS Floor Systems의 공식 파트너사로서 한국 공식 판매업체 및 서비스센터를 운영하고 있습니다.
                                세계적인 공사 현장에서 사용되는 콘크리트 연삭기 및 연마기 시장의 선두주자입니다.
                                <br /><br />
                                한국 공식판매 & 공식서비스센터(AS)<br />
                                주소: 인천광역시 서구 백범로 707, 린코리아<br />
                                문의전화: 032-571-1023
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src="/images/js-floor-systems.png"
                                alt="Shanghai JS Floor Systems Partnership"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Grinders Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">최신형 콘크리트 연삭기</h2>
                        <p className="text-xl text-gray-600">
                            최첨단 기술이 적용된 프리미엄 연삭기 라인업
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {getVisibleEquipment()
                            .filter(e => e.category === 'premium')
                            .map((item, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform hover:scale-105"
                                        />
                                        {isAdmin && (
                                            <div className="absolute top-4 right-4 flex space-x-2">
                                                <button
                                                    onClick={() => handleToggleHide(item)}
                                                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    {hiddenEquipmentIds.includes(item.id) ? (
                                                        <Eye className="w-5 h-5 text-gray-600" />
                                                    ) : (
                                                        <EyeOff className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => openForm(item)}
                                                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <Edit className="w-5 h-5 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirm(item)}
                                                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white p-2 rounded-full">
                                            {item.icon === 'settings' && <Settings className="w-8 h-8 text-blue-600" />}
                                            {item.icon === 'wrench' && <Wrench className="w-8 h-8 text-blue-600" />}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.name}</h3>
                                        <p className="text-gray-600 mb-4">{item.description}</p>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-gray-900">주요 특징:</h4>
                                            <ul className="space-y-1">
                                                {item.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-center text-gray-600">
                                                        <Star className="w-4 h-4 text-blue-600 mr-2" />
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

            {/* Professional Grinders Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">콘크리트 연삭기</h2>
                        <p className="text-xl text-gray-600">
                            전문가를 위한 고성능 연삭기 시리즈
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {getVisibleEquipment()
                            .filter(e => e.category === 'professional')
                            .map((item, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform hover:scale-105"
                                        />
                                        {isAdmin && (
                                            <div className="absolute top-4 right-4 flex space-x-2">
                                                <button
                                                    onClick={() => handleToggleHide(item)}
                                                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    {hiddenEquipmentIds.includes(item.id) ? (
                                                        <Eye className="w-5 h-5 text-gray-600" />
                                                    ) : (
                                                        <EyeOff className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => openForm(item)}
                                                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <Edit className="w-5 h-5 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirm(item)}
                                                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white p-2 rounded-full">
                                            {item.icon === 'settings' && <Settings className="w-8 h-8 text-blue-600" />}
                                            {item.icon === 'wrench' && <Wrench className="w-8 h-8 text-blue-600" />}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.name}</h3>
                                        <p className="text-gray-600 mb-4">{item.description}</p>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-gray-900">주요 특징:</h4>
                                            <ul className="space-y-1">
                                                {item.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-center text-gray-600">
                                                        <Star className="w-4 h-4 text-blue-600 mr-2" />
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

            {/* Equipment Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={closeForm}>
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">{editingEquipment ? '기계 수정' : '기계 추가'}</h2>
                        <form onSubmit={handleFormSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={formValues.name || ''}
                                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                                <textarea
                                    value={formValues.description || ''}
                                    onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                                <input
                                    type="text"
                                    value={formValues.image_url || ''}
                                    onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">아이콘</label>
                                <select
                                    value={formValues.icon || ''}
                                    onChange={(e) => setFormValues({ ...formValues, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">선택하세요</option>
                                    <option value="none">None</option>
                                    <option value="settings">Settings</option>
                                    <option value="wrench">Wrench</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                <select
                                    value={formValues.category || ''}
                                    onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">선택하세요</option>
                                    <option value="premium">1번째</option>
                                    <option value="professional">2번째</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">특징 (쉼표로 구분)</label>
                                <input
                                    type="text"
                                    value={formValues.features?.join(', ') || ''}
                                    onChange={(e) => setFormValues({ ...formValues, features: e.target.value.split(',').map(f => f.trim()) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            {formError && (
                                <div className="text-red-600 text-sm">{formError}</div>
                            )}
                            {formSuccess && (
                                <div className="text-green-600 text-sm">{formSuccess}</div>
                            )}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {formLoading ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && deleteTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">기계 삭제</h2>
                        <p className="text-gray-600 mb-6">
                            정말로 "{deleteTarget.name}" 기계를 삭제하시겠습니까?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={closeDeleteConfirm}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Equipment; 
