import React from 'react';
import { Download, FileText, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import type { Resource } from '@/hooks/useResources';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ResourceCardProps {
    resource: Resource;
    onDownload: (id: string, fileName: string, fileUrl: string) => void;
    onEdit?: (resource: Resource) => void;
    onDelete?: (id: string) => void;
    onToggleStatus?: (id: string, isActive: boolean) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
    resource,
    onDownload,
    onEdit,
    onDelete,
    onToggleStatus
}) => {
    const { isAdmin } = useUserRole();

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            '카탈로그': 'bg-blue-100 text-blue-800',
            '시험성적서': 'bg-green-100 text-green-800',
            '매뉴얼': 'bg-amber-100 text-amber-800',
            '기술자료': 'bg-purple-100 text-purple-800',
            '인증서': 'bg-red-100 text-red-800',
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
        if (!fileType) return <FileText className="w-5 h-5" />;

        if (fileType.includes('pdf')) return <span className="text-red-500">📄</span>;
        if (fileType.includes('word')) return <span className="text-blue-500">📝</span>;
        if (fileType.includes('excel')) return <span className="text-green-500">📊</span>;
        if (fileType.includes('image')) return <span className="text-purple-500">🖼️</span>;
        return <FileText className="w-5 h-5" />;
    };

    return (
        <Card className={`group hover:shadow-lg transition-all duration-200 h-80 flex flex-col ${!resource.is_active && isAdmin ? 'opacity-60 border-gray-300 bg-gray-50' : ''}`}>
            <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(resource.file_type)}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-tight">
                                    {resource.title}
                                </h3>
                                {!resource.is_active && isAdmin && (
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-xs flex-shrink-0">
                                        숨김
                                    </Badge>
                                )}
                            </div>
                            <Badge className={getCategoryColor(resource.category)}>
                                {resource.category}
                            </Badge>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleStatus?.(resource.id, !resource.is_active)}
                                className="h-8 w-8 p-0"
                                title={resource.is_active ? "자료 숨기기" : "자료 보이기"}
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
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete?.(resource.id)}
                                className="h-8 w-8 p-0"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    {resource.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-16 overflow-hidden">
                            {resource.description}
                        </p>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="truncate flex-1 mr-2">{resource.file_name}</span>
                            {resource.file_size && (
                                <span className="flex-shrink-0">{formatFileSize(resource.file_size)}</span>
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
                                {resource.download_count}회
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-6 py-4 bg-gray-50 border-t">
                <Button
                    onClick={() => onDownload(resource.id, resource.file_name, resource.file_url)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!resource.is_active && !isAdmin}
                >
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ResourceCard; 