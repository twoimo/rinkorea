import React, { useMemo, useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProjects } from '@/hooks/useProjects';
import { useEquipment } from '@/hooks/useEquipment';
import { useResources } from '@/hooks/useResources';
import ProductCard from '@/components/products/ProductCard';
import ProjectCard from '@/components/projects/ProjectCard';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import ResourceCard from '@/components/resources/ResourceCard';
import CertificateCard from '@/components/certificates/CertificateCard';
import ShopProductGrid from '@/components/shop/ShopProductGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface CardData {
    type: 'products' | 'projects' | 'equipment' | 'shop' | 'certificates' | 'resources';
    ids: string[];
}

interface CardDisplayProps {
    data: CardData;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const { products } = useProducts();
    const { projects } = useProjects();
    const { equipment } = useEquipment();
    const { resources } = useResources();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [shopProducts, setShopProducts] = useState<any[]>([]);

    // 인증서 및 온라인 스토어 데이터 가져오기
    useEffect(() => {
        const fetchData = async () => {
            if (data.type === 'certificates') {
                const { data: certsData } = await supabase
                    .from('certificates')
                    .select('*')
                    .in('id', data.ids)
                    .eq('is_active', true);
                if (certsData) {
                    setCertificates(certsData);
                }
            } else if (data.type === 'shop') {
                const { data: shopData } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', data.ids)
                    .eq('is_active', true);
                if (shopData) {
                    setShopProducts(shopData);
                }
            }
        };
        fetchData();
    }, [data.type, data.ids]);

    const filteredItems = useMemo(() => {
        switch (data.type) {
            case 'products':
                return products.filter(product => data.ids.includes(product.id));
            case 'projects':
                return projects.filter(project => data.ids.includes(project.id));
            case 'equipment':
                return equipment.filter(eq => data.ids.includes(eq.id));
            case 'resources':
                return resources.filter(resource => data.ids.includes(resource.id));
            case 'certificates':
                return certificates.filter(cert => data.ids.includes(cert.id));
            case 'shop':
                return shopProducts.filter(product => data.ids.includes(product.id));
            default:
                return [];
        }
    }, [data.type, data.ids, products, projects, equipment, resources, certificates, shopProducts]);

    const handleProductEdit = (_product: any) => {
        // AI 검색 모달에서는 편집 기능 비활성화
    };

    const handleProductDelete = (_product: any) => {
        // AI 검색 모달에서는 삭제 기능 비활성화
    };

    const handleProductToggleHide = (_product: any) => {
        // AI 검색 모달에서는 숨기기 기능 비활성화
    };

    const handleProductViewDetail = (_product: any) => {
        // AI 검색 모달에서는 상세보기 모달 대신 새 탭에서 제품 페이지 열기
        window.open('/products', '_blank');
    };

    const handleProjectEdit = (_project: any) => {
        // AI 검색 모달에서는 편집 기능 비활성화
    };

    const handleProjectDelete = (_id: string) => {
        // AI 검색 모달에서는 삭제 기능 비활성화
    };

    const handleProjectToggleHide = (_id: string) => {
        // AI 검색 모달에서는 숨기기 기능 비활성화
    };

    const handleEquipmentEdit = (_equipment: any) => {
        // AI 검색 모달에서는 편집 기능 비활성화
    };

    const handleEquipmentDelete = (_equipment: any) => {
        // AI 검색 모달에서는 삭제 기능 비활성화
    };

    const handleEquipmentToggleVisibility = (_equipment: any) => {
        // AI 검색 모달에서는 숨기기 기능 비활성화
    };

    // 추가 핸들러들
    const handleResourceEdit = (_resource: any) => { };
    const handleResourceDelete = (_id: string) => { };
    const handleResourceToggleStatus = (_id: string, _isActive: boolean) => { };
    const handleResourceDownload = async (_id: string, _fileName: string, _fileUrl: string) => { };
    const handleCertificateEdit = (_certificate: any) => { };
    const handleCertificateDelete = (_certificate: any) => { };
    const handleCertificateToggleHide = (_certificate: any) => { };
    const handleCertificateImageClick = (_certificate: any) => { };
    const handleShopProductClick = (_url: string) => { };

    if (filteredItems.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <p className="text-gray-600 text-sm">{t('no_items_found', '관련 항목을 찾을 수 없습니다.')}</p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                    {data.type === 'products' && t('related_products', '관련 제품')}
                    {data.type === 'projects' && t('related_projects', '관련 프로젝트')}
                    {data.type === 'equipment' && t('related_equipment', '관련 장비')}
                    {data.type === 'resources' && t('related_resources', '관련 자료')}
                    {data.type === 'certificates' && t('related_certificates', '관련 인증서')}
                    {data.type === 'shop' && t('related_shop_products', '관련 온라인 스토어 제품')}
                    ({filteredItems.length})
                </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {data.type === 'products' && filteredItems.map((product: any, index) => (
                    <div key={product.id} className="h-full flex">
                        <ProductCard
                            product={product}
                            _index={index}
                            isHidden={false}
                            isAdmin={false} // AI 검색에서는 관리 기능 숨김
                            onEdit={handleProductEdit}
                            onDelete={handleProductDelete}
                            onToggleHide={handleProductToggleHide}
                            onViewDetail={handleProductViewDetail}
                        />
                    </div>
                ))}

                {data.type === 'projects' && filteredItems.map((project: any) => (
                    <div key={project.id} className="h-full flex">
                        <ProjectCard
                            project={project}
                            isAdmin={false} // AI 검색에서는 관리 기능 숨김
                            isHidden={false}
                            _isMobile={false}
                            formLoading={false}
                            onEdit={handleProjectEdit}
                            onDelete={handleProjectDelete}
                            onToggleHide={handleProjectToggleHide}
                        />
                    </div>
                ))}

                {data.type === 'equipment' && filteredItems.map((eq: any) => (
                    <div key={eq.id} className="h-full flex">
                        <EquipmentCard
                            equipment={eq}
                            isAdmin={false} // AI 검색에서는 관리 기능 숨김
                            isHidden={false}
                            onEdit={handleEquipmentEdit}
                            onDelete={handleEquipmentDelete}
                            onToggleVisibility={handleEquipmentToggleVisibility}
                        />
                    </div>
                ))}

                {data.type === 'resources' && filteredItems.map((resource: any) => (
                    <div key={resource.id} className="h-full flex">
                        <ResourceCard
                            resource={resource}
                            onDownload={handleResourceDownload}
                            onEdit={handleResourceEdit}
                            onDelete={handleResourceDelete}
                            onToggleStatus={handleResourceToggleStatus}
                        />
                    </div>
                ))}

                {data.type === 'certificates' && filteredItems.map((cert: any) => (
                    <div key={cert.id} className="h-full flex">
                        <CertificateCard
                            certificate={cert}
                            isHidden={false}
                            isAdmin={false}
                            onImageClick={handleCertificateImageClick}
                            onEdit={handleCertificateEdit}
                            onDelete={handleCertificateDelete}
                            onToggleHide={handleCertificateToggleHide}
                            language={language}
                        />
                    </div>
                ))}

                {data.type === 'shop' && (
                    <div className="col-span-full">
                        <ShopProductGrid
                            products={filteredItems}
                            gridCols={3}
                            hiddenProductIds={[]}
                            isAdmin={false}
                            formLoading={false}
                            onProductClick={handleShopProductClick}
                            onEditProduct={handleProductEdit}
                            onDeleteProduct={handleProductDelete}
                            onToggleHide={handleProductToggleHide}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardDisplay; 