import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EquipmentSkeleton from '@/components/equipment/EquipmentSkeleton';
import { EquipmentHero } from '@/components/equipment/EquipmentHero';
import { EquipmentPartnership } from '@/components/equipment/EquipmentPartnership';
import { EquipmentTabs } from '@/components/equipment/EquipmentTabs';
import { EquipmentSection } from '@/components/equipment/EquipmentSection';
import EquipmentFormModal from '@/components/equipment/EquipmentFormModal';
import EquipmentDeleteModal from '@/components/equipment/EquipmentDeleteModal';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEquipmentManagement } from '@/hooks/useEquipmentManagement';
import type { Equipment, ActiveTab, EquipmentFormData } from '@/types/equipment';

const EquipmentPage = (): JSX.Element => {
    const { isAdmin } = useUserRole();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ActiveTab>('construction');

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);


    const {
        loading,
        hiddenEquipmentIds,
        getVisibleEquipment,
        toggleEquipmentVisibility,
        createEquipment,
        updateEquipment,
        deleteEquipment,
    } = useEquipmentManagement();

    // Get visible equipment based on user role
    const visibleEquipment = getVisibleEquipment(isAdmin);

    // Handler functions
    const handleAddEquipment = (): void => {
        setEditingEquipment(null);
        setFormError(null);
        setFormSuccess(null);
        setShowFormModal(true);
    };

    const handleEditEquipment = (equipment: Equipment): void => {
        setEditingEquipment(equipment);
        setFormError(null);
        setFormSuccess(null);
        setShowFormModal(true);
    };

    const handleDeleteEquipment = (equipment: Equipment): void => {
        setDeleteTarget(equipment);
        setShowDeleteModal(true);
    };

    const handleCloseFormModal = (): void => {
        setShowFormModal(false);
        setEditingEquipment(null);
        setFormError(null);
        setFormSuccess(null);
    };

    const handleCloseDeleteModal = (): void => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const handleFormSave = async (data: EquipmentFormData): Promise<void> => {
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            let success = false;
            if (editingEquipment) {
                success = await updateEquipment(editingEquipment.id, data);
                if (success) {
                    setFormSuccess(t('equipment_updated_success'));
                    handleCloseFormModal();
                }
            } else {
                success = await createEquipment(data);
                if (success) {
                    setFormSuccess(t('equipment_added_success'));
                    handleCloseFormModal();
                }
            }

            if (!success) {
                setFormError(t('equipment_save_error'));
            }
        } catch {
            setFormError(t('error'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (!deleteTarget) return;

        try {
            const success = await deleteEquipment(deleteTarget.id);
            if (success) {
                handleCloseDeleteModal();
            }
        } catch {
            // Error handling is done in the hook
        }
    };

    const handleToggleVisibility = async (equipment: Equipment): Promise<void> => {
        await toggleEquipmentVisibility(equipment);
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
            <EquipmentHero
                isAdmin={isAdmin}
                onAddClick={handleAddEquipment}
            />

            {/* Partnership Section */}
            <EquipmentPartnership />

            {/* Tab Navigation */}
            <EquipmentTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Equipment Content */}
            {activeTab === 'construction' && (
                <>
                    {/* Premium Equipment Section */}
                    <EquipmentSection
                        title={t('equipment_premium_title')}
                        subtitle={t('equipment_premium_subtitle')}
                        category="premium"
                        equipment={visibleEquipment}
                        isAdmin={isAdmin}
                        hiddenEquipmentIds={hiddenEquipmentIds}
                        onEdit={handleEditEquipment}
                        onDelete={handleDeleteEquipment}
                        onToggleVisibility={handleToggleVisibility}
                    />

                    {/* Professional Equipment Section */}
                    <EquipmentSection
                        title={t('equipment_professional_title')}
                        subtitle={t('equipment_professional_subtitle')}
                        category="professional"
                        equipment={visibleEquipment}
                        isAdmin={isAdmin}
                        hiddenEquipmentIds={hiddenEquipmentIds}
                        bgClass="bg-gray-50"
                        onEdit={handleEditEquipment}
                        onDelete={handleDeleteEquipment}
                        onToggleVisibility={handleToggleVisibility}
                    />
                </>
            )}

            {/* Diatool Tab */}
            {activeTab === 'diatool' && (
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {t('equipment_diatool_title')}
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 mb-8">
                                {t('equipment_diatool_subtitle')}
                            </p>
                        </div>

                        {visibleEquipment.filter(e => e.category === 'diatool').length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
                                <p className="text-gray-500 text-lg">{t('equipment_diatool_empty')}</p>
                                {isAdmin && (
                                    <button
                                        onClick={handleAddEquipment}
                                        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 mr-2 inline" />
                                        {t('equipment_diatool_add')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <EquipmentSection
                                title=""
                                subtitle=""
                                category="diatool"
                                equipment={visibleEquipment}
                                isAdmin={isAdmin}
                                hiddenEquipmentIds={hiddenEquipmentIds}
                                onEdit={handleEditEquipment}
                                onDelete={handleDeleteEquipment}
                                onToggleVisibility={handleToggleVisibility}
                            />
                        )}
                    </div>
                </section>
            )}

            <Footer />

            {/* Modals */}
            {showFormModal && (
                <EquipmentFormModal
                    equipment={editingEquipment}
                    onSave={handleFormSave}
                    onClose={handleCloseFormModal}
                    loading={formLoading}
                    error={formError}
                    success={formSuccess}
                />
            )}

            {showDeleteModal && deleteTarget && (
                <EquipmentDeleteModal
                    equipment={deleteTarget}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCloseDeleteModal}
                />
            )}
        </div>
    );
};

export default EquipmentPage;
