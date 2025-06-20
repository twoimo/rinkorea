import React, { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Resource, ResourceCategory } from '@/hooks/useResources';
import type { CreateResourceData, UpdateResourceData } from '@/hooks/useResourcesAdmin';

interface ResourceFormProps {
    resource?: Resource | null;
    categories: ResourceCategory[];
    onSubmit: (data: CreateResourceData | UpdateResourceData) => Promise<void>;
    onClose: () => void;
    loading?: boolean;
}

const ResourceForm: React.FC<ResourceFormProps> = ({
    resource,
    categories,
    onSubmit,
    onClose,
    loading = false
}) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_name: '',
        file_url: '',
        file_size: 0,
        file_type: '',
        category: '',
        is_active: true
    });

    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        if (resource) {
            setFormData({
                title: resource.title,
                description: resource.description || '',
                file_name: resource.file_name,
                file_url: resource.file_url,
                file_size: resource.file_size || 0,
                file_type: resource.file_type || '',
                category: resource.category,
                is_active: resource.is_active
            });
        }
    }, [resource]);

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUrlChange = (url: string) => {
        setFormData(prev => ({
            ...prev,
            file_url: url
        }));

        // URL에서 파일명 추출
        if (url) {
            try {
                const urlObj = new URL(url);
                const pathname = urlObj.pathname;
                const fileName = pathname.split('/').pop() || '';
                if (fileName) {
                    handleInputChange('file_name', fileName);
                }
            } catch (error) {
                console.error('URL 파싱 오류:', error);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        // 실제 파일 업로드는 구현하지 않고, 안내 메시지만 표시
        toast({
            title: "파일 업로드 안내",
            description: "파일을 먼저 서버에 업로드한 후 URL을 입력해주세요.",
            variant: "default"
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.file_url.trim() || !formData.category) {
            toast({
                title: "입력 오류",
                description: "제목, 파일 URL, 카테고리는 필수 입력 항목입니다.",
                variant: "destructive"
            });
            return;
        }

        try {
            const submitData = {
                ...formData,
                file_size: formData.file_size || undefined,
                file_type: formData.file_type || undefined,
                description: formData.description || undefined
            };

            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('폼 제출 오류:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        {resource ? '자료 수정' : '새 자료 등록'}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 기본 정보 */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">제목 *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="자료 제목을 입력하세요"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">설명</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="자료에 대한 설명을 입력하세요"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">카테고리 *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleInputChange('category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="카테고리를 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 파일 정보 */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="file_url">파일 URL *</Label>
                                <Input
                                    id="file_url"
                                    type="url"
                                    value={formData.file_url}
                                    onChange={(e) => handleFileUrlChange(e.target.value)}
                                    placeholder="https://example.com/file.pdf"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="file_name">파일명</Label>
                                <Input
                                    id="file_name"
                                    type="text"
                                    value={formData.file_name}
                                    onChange={(e) => handleInputChange('file_name', e.target.value)}
                                    placeholder="파일명을 입력하세요"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="file_type">파일 타입</Label>
                                    <Input
                                        id="file_type"
                                        type="text"
                                        value={formData.file_type}
                                        onChange={(e) => handleInputChange('file_type', e.target.value)}
                                        placeholder="예: application/pdf"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="file_size">파일 크기 (bytes)</Label>
                                    <Input
                                        id="file_size"
                                        type="number"
                                        value={formData.file_size}
                                        onChange={(e) => handleInputChange('file_size', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 파일 업로드 영역 (시각적 안내용) */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <div className="text-gray-600">
                                <p className="mb-2">파일을 여기에 드래그하거나</p>
                                <p className="text-sm text-gray-500">
                                    파일을 먼저 서버에 업로드한 후 위의 URL 필드에 입력해주세요
                                </p>
                            </div>
                        </div>

                        {/* 활성화 상태 */}
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                            />
                            <Label htmlFor="is_active">자료 활성화</Label>
                        </div>

                        {/* 제출 버튼 */}
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                취소
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? '처리중...' : (resource ? '수정' : '등록')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResourceForm; 