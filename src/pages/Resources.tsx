import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResourcesHero from '../components/resources/ResourcesHero';
import ResourcesList from '../components/resources/ResourcesList';
import ResourceForm from '../components/resources/ResourceForm';
import ResourcesSkeleton from '../components/resources/ResourcesSkeleton';
import { useResources } from '@/hooks/useResources';
import { useResourcesAdmin } from '@/hooks/useResourcesAdmin';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

const Resources = () => {
    const { resources, categories, loading, refetch, downloadResource } = useResources();
    const {
        createResource,
        updateResource,
        deleteResource,
        toggleResourceStatus,
        loading: adminLoading
    } = useResourcesAdmin();

    const { isAdmin } = useUserRole();
    const { t, language } = useLanguage();

    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState<string | null>(null);

    const editingResourceItem = editingResource
        ? resources.find(item => item.id === editingResource)
        : null;

    const handleCreateResource = async (resourceData: Parameters<typeof createResource>[0]) => {
        console.log('Resources page: creating resource with language:', language);
        const result = await createResource(resourceData, language);
        if (!result.error) {
            setShowForm(false);
            refetch();
        }
    };

    const handleUpdateResource = async (resourceData: Parameters<typeof updateResource>[1]) => {
        if (!editingResource) return;

        console.log('Resources page: updating resource with language:', language);
        const result = await updateResource(editingResource, resourceData, language);
        if (!result.error) {
            setEditingResource(null);
            refetch();
        }
    };

    const handleDeleteResource = async (resourceId: string) => {
        if (!confirm(t('resources_delete_confirm', '정말로 이 자료를 삭제하시겠습니까?\n삭제된 자료는 복구할 수 없습니다.'))) {
            return;
        }

        const result = await deleteResource(resourceId);
        if (!result.error) {
            refetch();
        }
    };

    const handleToggleStatus = async (resourceId: string, isActive: boolean) => {
        const result = await toggleResourceStatus(resourceId, isActive);
        if (!result.error) {
            refetch();
        }
    };

    const handleDownload = async (resourceId: string, fileName: string, fileUrl: string) => {
        await downloadResource(resourceId, fileName, fileUrl);
    };

    // 디버깅: 자료 데이터 변경 감지
    useEffect(() => {
        console.log('📚 Resources data changed:', {
            totalResources: resources.length,
            resourceTitles: resources.map(r => r.title),
            resourceDetails: resources.map(r => ({ id: r.id, title: r.title, updated_at: r.updated_at })),
            timestamp: new Date().toLocaleTimeString()
        });
    }, [resources]);

    if (loading) {
        return (
            <>
                <Header />
                <ResourcesSkeleton />
                <Footer />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1">
                <ResourcesHero setShowForm={setShowForm} />

                <section className="py-6 md:py-12 lg:py-20">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <ResourcesList
                            resources={resources}
                            categories={categories}
                            loading={loading}
                            onDownload={handleDownload}
                            onEdit={isAdmin ? (resource) => setEditingResource(resource.id) : undefined}
                            onDelete={isAdmin ? handleDeleteResource : undefined}
                            onToggleStatus={isAdmin ? handleToggleStatus : undefined}
                        />
                    </div>
                </section>
            </main>

            {/* 자료 등록/수정 폼 */}
            {(showForm || editingResource) && (
                <ResourceForm
                    resource={editingResourceItem}
                    categories={categories}
                    onSubmit={editingResource ? handleUpdateResource : handleCreateResource}
                    onClose={() => {
                        setShowForm(false);
                        setEditingResource(null);
                    }}
                    loading={adminLoading}
                />
            )}

            <Footer />
        </div>
    );
};

export default Resources; 