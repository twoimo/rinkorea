import React, { useMemo, useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProjects } from '@/hooks/useProjects';
import { useEquipment } from '@/hooks/useEquipment';
import { useResources } from '@/hooks/useResources';
import ShopProductGrid from '@/components/shop/ShopProductGrid';
import { FastImage } from '@/components/ui/fast-image';
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

    // 이미지 URL 처리 함수
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '/images/placeholder.svg';
        if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;

        // 이미 images/로 시작하는 경우는 그대로 사용 (인증서 이미지들)
        if (imagePath.startsWith('images/')) {
            const encodedPath = imagePath.split('/').map(part => encodeURIComponent(part)).join('/');
            return `/${encodedPath}`;
        }

        // 한글 파일명이나 공백이 있는 경우 URL 인코딩
        const encodedPath = imagePath.split('/').map(part => encodeURIComponent(part)).join('/');
        return `/images/${encodedPath}`;
    };

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

            <div className="space-y-4">
                {data.type === 'products' && filteredItems.map((product: any, _index) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="flex flex-row h-64">
                            {/* 이미지 섹션 */}
                            <div className="w-48 h-64 flex-shrink-0 relative overflow-hidden bg-gray-50">
                                <FastImage
                                    src={getImageUrl(product.image_url)}
                                    alt={product.name}
                                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                />
                                {product.icon && product.icon !== 'none' && product.icon !== 'None' && (
                                    <div className="absolute top-3 left-3 bg-white p-2 rounded-full">
                                        <div className="w-6 h-6 text-blue-600" />
                                    </div>
                                )}
                            </div>

                            {/* 내용 섹션 */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {product.description}
                                    </p>

                                    {/* 특징 리스트 */}
                                    {product.features && product.features.length > 0 && (
                                        <div className="mb-3">
                                            <ul className="flex flex-wrap gap-2">
                                                {product.features.slice(0, 3).map((feature: string, featureIndex: number) => (
                                                    <li key={featureIndex} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full flex items-center">
                                                        <span className="w-1 h-1 bg-blue-600 rounded-full mr-1 flex-shrink-0"></span>
                                                        <span className="truncate">{feature}</span>
                                                    </li>
                                                ))}
                                                {product.features.length > 3 && (
                                                    <li className="text-xs text-blue-600 px-2 py-1 flex items-center">
                                                        +{product.features.length - 3}개 더
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* 버튼 */}
                                <button
                                    onClick={() => handleProductViewDetail(product)}
                                    className="self-start bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                >
                                    자세히 보기
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {data.type === 'projects' && filteredItems.map((project: any, _index) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="flex flex-row h-64">
                            {/* 이미지 섹션 */}
                            <div className="w-48 h-64 flex-shrink-0 relative overflow-hidden bg-gray-50">
                                <FastImage
                                    src={getImageUrl(project.image_url || project.image)}
                                    alt={project.title || project.name}
                                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* 내용 섹션 */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                        {project.title || project.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">위치:</span> {project.location}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {project.description}
                                    </p>

                                    {/* 특징 리스트 */}
                                    {project.features && project.features.length > 0 && (
                                        <div className="mb-3">
                                            <ul className="flex flex-wrap gap-2">
                                                {project.features.slice(0, 3).map((feature: string, featureIndex: number) => (
                                                    <li key={featureIndex} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full flex items-center">
                                                        <span className="w-1 h-1 bg-green-600 rounded-full mr-1 flex-shrink-0"></span>
                                                        <span className="truncate">{feature}</span>
                                                    </li>
                                                ))}
                                                {project.features.length > 3 && (
                                                    <li className="text-xs text-green-600 px-2 py-1 flex items-center">
                                                        +{project.features.length - 3}개 더
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* 버튼 */}
                                <button
                                    onClick={() => window.open('/projects', '_blank')}
                                    className="self-start bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                                >
                                    자세히 보기
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {data.type === 'equipment' && filteredItems.map((eq: any, _index) => (
                    <div key={eq.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="flex flex-row h-64">
                            {/* 이미지 섹션 */}
                            <div className="w-48 h-64 flex-shrink-0 relative overflow-hidden bg-gray-50">
                                <FastImage
                                    src={getImageUrl(eq.image_url)}
                                    alt={eq.name}
                                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* 내용 섹션 */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                        {eq.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {eq.description}
                                    </p>

                                    {/* 특징 리스트 */}
                                    {eq.features && eq.features.length > 0 && (
                                        <div className="mb-3">
                                            <ul className="flex flex-wrap gap-2">
                                                {eq.features.slice(0, 3).map((feature: string, featureIndex: number) => (
                                                    <li key={featureIndex} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full flex items-center">
                                                        <span className="w-1 h-1 bg-purple-600 rounded-full mr-1 flex-shrink-0"></span>
                                                        <span className="truncate">{feature}</span>
                                                    </li>
                                                ))}
                                                {eq.features.length > 3 && (
                                                    <li className="text-xs text-purple-600 px-2 py-1 flex items-center">
                                                        +{eq.features.length - 3}개 더
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* 버튼 */}
                                <button
                                    onClick={() => window.open('/equipment', '_blank')}
                                    className="self-start bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                                >
                                    자세히 보기
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {data.type === 'resources' && filteredItems.map((resource: any, _index) => (
                    <div key={resource.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="flex flex-row h-64">
                            {/* 아이콘 섹션 */}
                            <div className="w-48 h-64 flex-shrink-0 relative overflow-hidden bg-gray-50 flex items-center justify-center">
                                <div className="text-6xl text-gray-400">
                                    {resource.file_type === 'pdf' && '📄'}
                                    {resource.file_type === 'image' && '🖼️'}
                                    {resource.file_type === 'video' && '🎥'}
                                    {resource.file_type === 'document' && '📋'}
                                    {!['pdf', 'image', 'video', 'document'].includes(resource.file_type) && '📁'}
                                </div>
                            </div>

                            {/* 내용 섹션 */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                        {resource.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">카테고리:</span> {resource.category}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {resource.description}
                                    </p>

                                    {/* 파일 정보 */}
                                    <div className="mb-3">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                                                {resource.file_type?.toUpperCase() || 'FILE'}
                                            </span>
                                            {resource.file_size && (
                                                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                                                    {resource.file_size}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 버튼 */}
                                <button
                                    onClick={() => window.open('/resources', '_blank')}
                                    className="self-start bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                                >
                                    자료실에서 보기
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {data.type === 'certificates' && filteredItems.map((cert: any, _index) => (
                    <div key={cert.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="flex flex-row h-64">
                            {/* 이미지 섹션 */}
                            <div className="w-48 h-64 flex-shrink-0 relative overflow-hidden bg-gray-50">
                                <FastImage
                                    src={getImageUrl(cert.image_url)}
                                    alt={cert.name}
                                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* 내용 섹션 */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                        {cert.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {cert.description}
                                    </p>

                                    {/* 인증서 정보 */}
                                    <div className="mb-3">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full">
                                                {cert.category || '인증서'}
                                            </span>
                                            {cert.issue_date && (
                                                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                                                    발급일: {new Date(cert.issue_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 버튼 */}
                                <button
                                    onClick={() => window.open('/certificates', '_blank')}
                                    className="self-start bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
                                >
                                    자세히 보기
                                </button>
                            </div>
                        </div>
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