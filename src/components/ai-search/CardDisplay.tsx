import React, { useMemo, useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProjects } from '@/hooks/useProjects';
import { useEquipment } from '@/hooks/useEquipment';
import { useResources } from '@/hooks/useResources';
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

// 페이지네이션: 한 번에 보여줄 카드 개수
const PAGE_SIZE = 10;

const CardDisplay: React.FC<CardDisplayProps> = ({ data }) => {
    const { t, language: _language } = useLanguage();
    const { products } = useProducts();
    const { projects } = useProjects();
    const { equipment } = useEquipment();
    const { resources } = useResources();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [shopProducts, setShopProducts] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    // 여러 마커 그룹 지원
    const [visibleGroupIndex, setVisibleGroupIndex] = useState(0);

    // 이미지 URL 처리 함수
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '/images/placeholder.svg';
        if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;

        // 이미 /images/로 시작하는 경우는 그대로 사용 (온라인 스토어 제품들)
        if (imagePath.startsWith('/images/')) {
            const encodedPath = imagePath.split('/').map(part => encodeURIComponent(part)).join('/');
            return encodedPath;
        }

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

    useEffect(() => {
        setVisibleCount(PAGE_SIZE); // type/ids 바뀌면 초기화
        setVisibleGroupIndex(0); // 그룹도 초기화
    }, [data.type, data.ids]);

    // ids가 배열의 배열(그룹)인지 판별
    const isGrouped = Array.isArray(data.ids) && Array.isArray(data.ids[0]);
    const groupCount = isGrouped ? data.ids.length : 1;
    const currentIds = isGrouped ? data.ids[visibleGroupIndex] : data.ids;

    // 디버깅: AI 마커 uuid와 프론트 products uuid 비교
    useEffect(() => {
        if (data.type === 'products') {
            console.log('AI 마커 uuid:', data.ids);
            console.log('프론트 products:', products.map(p => p.id));
            const missing = data.ids.filter(id => !products.some(p => p.id === id));
            if (missing.length > 0) {
                console.warn('DB에 없는 uuid:', missing);
            }
        }
        if (data.type === 'projects') {
            console.log('AI 마커 uuid:', data.ids);
            console.log('프론트 projects:', projects.map(p => p.id));
            const missing = data.ids.filter(id => !projects.some(p => p.id === id));
            if (missing.length > 0) {
                console.warn('DB에 없는 프로젝트 uuid:', missing);
            }
        }
    }, [data.type, data.ids, products, projects]);

    const filteredItems = useMemo(() => {
        switch (data.type) {
            case 'products':
                return products.filter(product => currentIds.includes(product.id));
            case 'projects':
                return projects.filter(project => currentIds.includes(project.id));
            case 'equipment':
                return equipment.filter(eq => currentIds.includes(eq.id));
            case 'resources':
                return resources.filter(resource => currentIds.includes(resource.id));
            case 'certificates':
                return certificates.filter(cert => currentIds.includes(cert.id));
            case 'shop':
                return shopProducts.filter(product => currentIds.includes(product.id));
            default:
                return [];
        }
    }, [data.type, currentIds, products, projects, equipment, resources, certificates, shopProducts]);

    // 실제 보여줄 카드 (페이지네이션 적용)
    // 그룹이 1개일 때만 10개씩 페이지네이션, 그룹이 여러 개면 그룹 단위로만 보여줌
    const pagedItems = useMemo(() => {
        if (isGrouped) return filteredItems;
        return filteredItems.slice(0, visibleCount);
    }, [filteredItems, visibleCount, isGrouped]);

    const _handleProductEdit = (_product: any) => {
        // AI 검색 모달에서는 편집 기능 비활성화
    };

    const _handleProductDelete = (_product: any) => {
        // AI 검색 모달에서는 삭제 기능 비활성화
    };

    const _handleProductToggleHide = (_product: any) => {
        // AI 검색 모달에서는 숨기기 기능 비활성화
    };

    const handleProductViewDetail = (_product: any) => {
        // AI 검색 모달에서는 상세보기 모달 대신 새 탭에서 제품 페이지 열기
        window.open('/products', '_blank');
    };

    const _handleProjectEdit = (_project: any) => {
        // AI 검색 모달에서는 편집 기능 비활성화
    };

    const _handleProjectDelete = (_id: string) => {
        // AI 검색 모달에서는 삭제 기능 비활성화
    };

    const _handleProjectToggleHide = (_id: string) => {
        // AI 검색 모달에서는 숨기기 기능 비활성화
    };

    const _handleEquipmentEdit = (_equipment: any) => {
        // AI 검색 모달에서는 편집 기능 비활성화
    };

    const _handleEquipmentDelete = (_equipment: any) => {
        // AI 검색 모달에서는 삭제 기능 비활성화
    };

    const _handleEquipmentToggleVisibility = (_equipment: any) => {
        // AI 검색 모달에서는 숨기기 기능 비활성화
    };

    // 추가 핸들러들
    const _handleResourceEdit = (_resource: any) => { };
    const _handleResourceDelete = (_id: string) => { };
    const _handleResourceToggleStatus = (_id: string, _isActive: boolean) => { };
    const _handleResourceDownload = async (_id: string, _fileName: string, _fileUrl: string) => { };
    const _handleCertificateEdit = (_certificate: any) => { };
    const _handleCertificateDelete = (_certificate: any) => { };
    const _handleCertificateToggleHide = (_certificate: any) => { };
    const _handleCertificateImageClick = (_certificate: any) => { };
    const _handleShopProductClick = (_url: string) => { };

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
                    {isGrouped ? `(${visibleGroupIndex + 1} / ${groupCount})` : `(${filteredItems.length})`}
                </h4>
            </div>

            <div className="space-y-4">
                {data.type === 'products' && filteredItems.map((product: any, _index) => {
                    // 안전 처리: features, image_url
                    const safeFeatures = Array.isArray(product.features) ? product.features : [];
                    const safeImageUrl = product.image_url || '/images/placeholder.svg';
                    return (
                        <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="flex flex-row h-64">
                                {/* 이미지 섹션 */}
                                <div className="w-48 h-64 flex-shrink-0 relative overflow-hidden bg-gray-50">
                                    <FastImage
                                        src={getImageUrl(safeImageUrl)}
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
                                        {safeFeatures.length > 0 && (
                                            <div className="mb-3">
                                                <ul className="flex flex-wrap gap-2">
                                                    {safeFeatures.slice(0, 3).map((feature: string, featureIndex: number) => (
                                                        <li key={featureIndex} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full flex items-center">
                                                            <span className="w-1 h-1 bg-blue-600 rounded-full mr-1 flex-shrink-0"></span>
                                                            <span className="truncate">{feature}</span>
                                                        </li>
                                                    ))}
                                                    {safeFeatures.length > 3 && (
                                                        <li className="text-xs text-blue-600 px-2 py-1 flex items-center">
                                                            +{safeFeatures.length - 3}개 더
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
                    )
                })}

                {data.type === 'projects' && pagedItems.map((project: any, _index) => (
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

                {data.type === 'shop' && filteredItems.map((shopProduct: any, _index) => (
                    <div key={shopProduct.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="flex flex-row h-64">
                            {/* 이미지 섹션 */}
                            <div className="w-48 h-64 flex-shrink-0 relative overflow-hidden bg-gray-50">
                                <FastImage
                                    src={getImageUrl(shopProduct.image_url)}
                                    alt={shopProduct.name}
                                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                />
                                {shopProduct.is_new && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        NEW
                                    </div>
                                )}
                                {shopProduct.is_best && (
                                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                        BEST
                                    </div>
                                )}
                            </div>

                            {/* 내용 섹션 */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                        {shopProduct.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {shopProduct.description}
                                    </p>

                                    {/* 가격 정보 */}
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2">
                                            {shopProduct.original_price && shopProduct.original_price !== shopProduct.price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₩{shopProduct.original_price?.toLocaleString()}
                                                </span>
                                            )}
                                            <span className="text-lg font-bold text-blue-600">
                                                ₩{shopProduct.price?.toLocaleString() || '문의'}
                                            </span>
                                            {shopProduct.discount && (
                                                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                                    {shopProduct.discount}% 할인
                                                </span>
                                            )}
                                        </div>

                                        {/* 평점 및 리뷰 */}
                                        {(shopProduct.rating || shopProduct.reviews) && (
                                            <div className="flex items-center gap-2 mt-2">
                                                {shopProduct.rating && (
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-400">★</span>
                                                        <span className="text-sm text-gray-600 ml-1">
                                                            {shopProduct.rating}
                                                        </span>
                                                    </div>
                                                )}
                                                {shopProduct.reviews && (
                                                    <span className="text-sm text-gray-500">
                                                        ({shopProduct.reviews}개 리뷰)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 버튼 */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open('/shop', '_blank')}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                    >
                                        상품 보기
                                    </button>
                                    {shopProduct.naver_url && (
                                        <button
                                            onClick={() => window.open(shopProduct.naver_url, '_blank')}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                                        >
                                            구매하기
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* 더 보기 버튼: 그룹이 여러 개면 그룹 단위, 1개면 기존 10개씩 */}
            {isGrouped ? (
                visibleGroupIndex < groupCount - 1 && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setVisibleGroupIndex(i => i + 1)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            더 보기 ({visibleGroupIndex + 1} / {groupCount})
                        </button>
                    </div>
                )
            ) : (
                filteredItems.length > visibleCount && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            더 보기 ({visibleCount} / {filteredItems.length})
                        </button>
                    </div>
                )
            )}
        </div>
    );
};

export default CardDisplay; 