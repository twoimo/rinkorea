import React, { useState } from 'react';
import { Download, FileText, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Resource } from '@/hooks/useResources';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ResourceCardProps {
    resource: Resource;
    viewMode?: 'grid' | 'list';
    onDownload: (id: string, fileName: string, fileUrl: string) => void;
    onEdit?: (resource: Resource) => void;
    onDelete?: (id: string) => void;
    onToggleStatus?: (id: string, isActive: boolean) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
    resource,
    viewMode = 'grid',
    onDownload,
    onEdit,
    onDelete,
    onToggleStatus
}) => {
    const { isAdmin } = useUserRole();
    const { t } = useLanguage();
    const [isDownloading, setIsDownloading] = useState(false);

    // Translate category names
    const translateCategory = (category: string) => {
        const categoryMap: Record<string, string> = {
            '기술자료': t('technical_data', '기술자료'),
            '카탈로그': t('catalog', '카탈로그'),
            '매뉴얼': t('manual', '매뉴얼'),
            '사양서': t('specification', '사양서'),
            '인증서': t('certificate', '인증서'),
            '시험성적서': t('test_report', '시험성적서'),
        };
        return categoryMap[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            '카탈로그': 'bg-blue-100 text-blue-800',
            '시험성적서': 'bg-green-100 text-green-800',
            '매뉴얼': 'bg-amber-100 text-amber-800',
            '기술자료': 'bg-purple-100 text-purple-800',
            '인증서': 'bg-red-100 text-red-800',
            '사양서': 'bg-indigo-100 text-indigo-800',
            '기타': 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors['기타'];
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return '';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const getFileIcon = (fileType: string | null) => {
        if (!fileType) return <FileText className="w-5 h-5 md:w-6 md:h-6" />;

        if (fileType.includes('pdf')) return <span className="text-red-500 text-lg md:text-xl">📄</span>;
        if (fileType.includes('word')) return <span className="text-blue-500 text-lg md:text-xl">📝</span>;
        if (fileType.includes('excel')) return <span className="text-green-500 text-lg md:text-xl">📊</span>;
        if (fileType.includes('image')) return <span className="text-purple-500 text-lg md:text-xl">🖼️</span>;
        return <FileText className="w-5 h-5 md:w-6 md:h-6" />;
    };

    const handleDownload = async () => {
        if (isDownloading) {
            console.log('Download already in progress, ignoring click');
            return;
        }

        console.log('Download button clicked for resource:', resource.id);
        setIsDownloading(true);

        try {
            await onDownload(resource.id, resource.file_name, resource.file_url);
        } finally {
            // 2초 후에 다운로드 상태 해제 (사용자가 너무 빨리 재클릭하는 것 방지)
            setTimeout(() => {
                setIsDownloading(false);
            }, 2000);
        }
    };

    const handleDelete = () => {
        if (onDelete && confirm(t('resources_delete_confirm', '정말로 이 자료를 삭제하시겠습니까?'))) {
            onDelete(resource.id);
        }
    };

    // 리스트 뷰 렌더링
    if (viewMode === 'list') {
        return (
            <Card className={`group hover:shadow-lg transition-all duration-200 ${!resource.is_active && isAdmin ? 'opacity-60 border-gray-300 bg-gray-50' : ''}`}>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="flex items-start space-x-3 flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex-shrink-0">
                                {getFileIcon(resource.file_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-base md:text-lg break-words hyphens-auto">
                                        {resource.title}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge className={getCategoryColor(resource.category)}>
                                            {translateCategory(resource.category)}
                                        </Badge>
                                        {!resource.is_active && isAdmin && (
                                            <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-xs">
                                                {t('hidden', '숨김')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {resource.description && (
                                    <p className="text-gray-600 text-sm md:text-base mb-2 break-words hyphens-auto">
                                        {resource.description}
                                    </p>
                                )}
                                <div className="flex flex-col gap-1 text-sm text-gray-500">
                                    <span className="break-all text-xs md:text-sm">{resource.file_name}</span>
                                    <div className="flex items-center gap-3 text-xs">
                                        {resource.file_size && (
                                            <span>{formatFileSize(resource.file_size)}</span>
                                        )}
                                        <span className="flex items-center">
                                            <Download className="w-3 h-3 mr-1" />
                                            {resource.download_count}{t('download_count_suffix', '회')}
                                        </span>
                                        <span>
                                            {formatDistanceToNow(new Date(resource.created_at), {
                                                addSuffix: true,
                                                locale: ko
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                            {isAdmin && (
                                <div className="flex items-center space-x-1 mr-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onToggleStatus?.(resource.id, !resource.is_active)}
                                        className="h-10 w-10 p-0 touch-manipulation"
                                        title={resource.is_active ? t('hide', '자료 숨기기') : t('show', '자료 보이기')}
                                    >
                                        {resource.is_active ? (
                                            <EyeOff className="w-4 h-4 text-gray-600" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-gray-600" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit?.(resource)}
                                        className="h-10 w-10 p-0 touch-manipulation"
                                        title={t('edit', '수정')}
                                    >
                                        <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="h-10 w-10 p-0 touch-manipulation"
                                        title={t('delete', '삭제')}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            )}
                            <Button
                                onClick={handleDownload}
                                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-10 flex-1 sm:w-auto sm:flex-none touch-manipulation"
                                disabled={(!resource.is_active && !isAdmin) || isDownloading}
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        <span className="hidden sm:inline">{t('downloading', '다운로드 중...')}</span>
                                        <span className="sm:hidden">{t('processing', '처리중...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        {t('resources_download', '다운로드')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // 그리드 뷰 렌더링 (기존 디자인 개선)
    return (
        <Card className={`group hover:shadow-lg transition-all duration-200 flex flex-col ${!resource.is_active && isAdmin ? 'opacity-60 border-gray-300 bg-gray-50' : ''}`}>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(resource.file_type)}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm md:text-base leading-tight">
                                    {resource.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Badge className={getCategoryColor(resource.category)}>
                                        {translateCategory(resource.category)}
                                    </Badge>
                                    {!resource.is_active && isAdmin && (
                                        <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-xs">
                                            {t('hidden', '숨김')}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleStatus?.(resource.id, !resource.is_active)}
                                className="h-8 w-8 md:h-10 md:w-10 p-0 touch-manipulation"
                                title={resource.is_active ? t('hide', '자료 숨기기') : t('show', '자료 보이기')}
                            >
                                {resource.is_active ? (
                                    <EyeOff className="w-4 h-4 text-gray-600" />
                                ) : (
                                    <Eye className="w-4 h-4 text-gray-600" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit?.(resource)}
                                className="h-8 w-8 md:h-10 md:w-10 p-0 touch-manipulation"
                                title={t('edit', '수정')}
                            >
                                <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className="h-8 w-8 md:h-10 md:w-10 p-0 touch-manipulation"
                                title={t('delete', '삭제')}
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    {resource.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[3rem] overflow-hidden">
                            {resource.description}
                        </p>
                    )}

                    <div className="space-y-3 mt-auto">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="truncate flex-1 mr-2">{resource.file_name}</span>
                            {resource.file_size && (
                                <span className="flex-shrink-0 text-xs">{formatFileSize(resource.file_size)}</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="truncate">
                                {formatDistanceToNow(new Date(resource.created_at), {
                                    addSuffix: true,
                                    locale: ko
                                })}
                            </span>
                            <span className="flex items-center flex-shrink-0 ml-2">
                                <Download className="w-3 h-3 mr-1" />
                                {resource.download_count}{t('download_count_suffix', '회')}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-4 md:px-6 py-4 bg-gray-50 border-t">
                <Button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-12 md:h-10 text-base md:text-sm touch-manipulation"
                    disabled={(!resource.is_active && !isAdmin) || isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('downloading', '다운로드 중...')}
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            {t('resources_download', '다운로드')}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ResourceCard; 