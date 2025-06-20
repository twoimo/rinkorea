import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ResourceCard from './ResourceCard';
import type { Resource, ResourceCategory } from '@/hooks/useResources';

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
            {/* 검색 및 필터 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="자료명, 설명, 파일명으로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="카테고리" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 카테고리</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none"
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 결과 카운트 */}
                <div className="mt-4 text-sm text-gray-600">
                    총 {filteredResources.length}개의 자료가 있습니다
                    {searchTerm && (
                        <span> ('{searchTerm}' 검색 결과)</span>
                    )}
                </div>
            </div>

            {/* 자료 목록 */}
            {filteredResources.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-gray-400 mb-4">
                        <Filter className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">자료가 없습니다</h3>
                        <p>검색 조건을 변경하거나 다른 카테고리를 확인해보세요.</p>
                    </div>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                }>
                    {filteredResources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
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