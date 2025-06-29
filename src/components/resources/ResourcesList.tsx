import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ResourceCard from './ResourceCard';
import type { Resource, ResourceCategory } from '@/hooks/useResources';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResourcesListProps {
    resources: Resource[];
    categories: ResourceCategory[];
    loading: boolean;
    onDownload: (id: string, fileName: string, fileUrl: string) => void;
    onEdit?: (resource: Resource) => void;
    onDelete?: (id: string) => void;
    onToggleStatus?: (id: string, isActive: boolean) => void;
}

const ResourcesList: React.FC<ResourcesListProps> = ({
    resources,
    categories,
    loading,
    onDownload,
    onEdit,
    onDelete,
    onToggleStatus
}) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.file_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 검색 및 필터 - 모바일 최적화 */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                <div className="space-y-4">
                    {/* 검색 입력 */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder={t('search_resources', '자료명, 설명, 파일명으로 검색...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 text-base md:text-sm h-12 md:h-10"
                        />
                    </div>

                    {/* 필터 및 뷰 모드 */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full h-12 md:h-10 text-base md:text-sm">
                                    <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <SelectValue placeholder={t('resources_form_category', '카테고리')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_categories', '전체 카테고리')}</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex border rounded-md w-full sm:w-auto">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none flex-1 sm:flex-none h-12 md:h-10 text-base md:text-sm touch-manipulation"
                            >
                                <Grid className="w-4 h-4 mr-2 sm:mr-0" />
                                <span className="sm:hidden">{t('grid_view', '격자')}</span>
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none flex-1 sm:flex-none h-12 md:h-10 text-base md:text-sm touch-manipulation"
                            >
                                <List className="w-4 h-4 mr-2 sm:mr-0" />
                                <span className="sm:hidden">{t('list_view', '목록')}</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 결과 카운트 */}
                <div className="mt-4 text-sm text-gray-600">
                    {t('total_resources_count', '총 {{count}}개의 자료가 있습니다').replace('{{count}}', filteredResources.length.toString())}
                    {searchTerm && (
                        <span> ({t('search_results_for', "'{{term}}' 검색 결과").replace('{{term}}', searchTerm)})</span>
                    )}
                </div>
            </div>

            {/* 자료 목록 */}
            {filteredResources.length === 0 ? (
                <div className="text-center py-12 md:py-20">
                    <div className="text-gray-400 mb-4">
                        <Filter className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" />
                        <h3 className="text-lg md:text-xl font-semibold mb-2">{t('no_resources_found', '자료가 없습니다')}</h3>
                        <p className="text-sm md:text-base">{t('try_different_filter', '검색 조건을 변경하거나 다른 카테고리를 확인해보세요.')}</p>
                    </div>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                        : "space-y-4"
                }>
                    {filteredResources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            viewMode={viewMode}
                            onDownload={onDownload}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleStatus={onToggleStatus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourcesList; 