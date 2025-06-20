import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Link as LinkIcon } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, FormField, FormInput, FormTextarea, FormSelect, ActionButton } from '@/components/ui/modal';
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

// 파일 확장자와 MIME 타입 매핑
const FILE_TYPE_MAP: Record<string, string> = {
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'rtf': 'application/rtf',

    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',

    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',

    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',

    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',

    // Others
    'json': 'application/json',
    'xml': 'application/xml',
    'csv': 'text/csv',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'ts': 'application/typescript'
};

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

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
                is_active: true // 기본값으로 설정
            });
        } else {
            setFormData({
                title: '',
                description: '',
                file_name: '',
                file_url: '',
                file_size: 0,
                file_type: '',
                category: '',
                is_active: true
            });
        }
        setErrors({});
    }, [resource]);

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // 입력 시 해당 필드의 에러 제거
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // 파일 확장자에서 MIME 타입 추출
    const getFileTypeFromExtension = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension ? FILE_TYPE_MAP[extension] || 'application/octet-stream' : '';
    };

    // 파일 크기 가져오기 (HTTP HEAD 요청)
    const getFileSize = async (url: string): Promise<number> => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength, 10) : 0;
        } catch (error) {
            console.warn('파일 크기를 가져올 수 없습니다:', error);
            return 0;
        }
    };

    // 파일 정보 자동 분석
    const analyzeFile = async (url: string, fileName: string) => {
        setIsAnalyzing(true);

        try {
            // 파일 타입 자동 설정
            const fileType = getFileTypeFromExtension(fileName);
            handleInputChange('file_type', fileType);

            // 파일 크기 자동 가져오기
            const fileSize = await getFileSize(url);
            handleInputChange('file_size', fileSize);

            if (fileSize === 0) {
                toast({
                    title: "파일 정보 분석",
                    description: "파일 크기를 자동으로 가져올 수 없습니다. 필요시 수동으로 입력해주세요.",
                    variant: "default"
                });
            }
        } catch (error) {
            console.error('파일 분석 오류:', error);
            toast({
                title: "파일 분석 실패",
                description: "파일 정보를 자동으로 분석할 수 없습니다.",
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUrlChange = async (url: string) => {
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
                    // 파일 정보 자동 분석
                    await analyzeFile(url, fileName);
                }
            } catch (error) {
                console.error('URL 파싱 오류:', error);
            }
        } else {
            // URL이 비어있으면 파일 정보도 초기화
            handleInputChange('file_name', '');
            handleInputChange('file_type', '');
            handleInputChange('file_size', 0);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = '제목을 입력해주세요.';
        }

        if (!formData.file_url.trim()) {
            newErrors.file_url = '파일 URL을 입력해주세요.';
        }

        if (!formData.category) {
            newErrors.category = '카테고리를 선택해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
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
        <Modal
            isOpen={true}
            onClose={onClose}
            title={resource ? '자료 수정' : '새 자료 등록'}
            size="2xl"
        >
            <ModalBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="space-y-4">
                        <FormField label="제목" required error={errors.title}>
                            <FormInput
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="자료 제목을 입력하세요"
                                error={!!errors.title}
                            />
                        </FormField>

                        <FormField label="설명">
                            <FormTextarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="자료에 대한 설명을 입력하세요"
                                rows={3}
                            />
                        </FormField>

                        <FormField label="카테고리" required error={errors.category}>
                            <FormSelect
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                error={!!errors.category}
                            >
                                <option value="">카테고리를 선택하세요</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </FormSelect>
                        </FormField>
                    </div>

                    {/* 파일 정보 */}
                    <div className="space-y-4">
                        <FormField label="파일 URL" required error={errors.file_url}>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <FormInput
                                    type="url"
                                    value={formData.file_url}
                                    onChange={(e) => handleFileUrlChange(e.target.value)}
                                    placeholder="https://example.com/file.pdf"
                                    className="pl-10"
                                    error={!!errors.file_url}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                파일의 직접 다운로드 링크를 입력하세요
                            </p>
                        </FormField>

                        <FormField label="파일명">
                            <FormInput
                                value={formData.file_name}
                                onChange={(e) => handleInputChange('file_name', e.target.value)}
                                placeholder="파일명을 입력하세요"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                URL에서 자동으로 추출됩니다
                            </p>
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="파일 타입">
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    {isAnalyzing && (
                                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                                    )}
                                    <FormInput
                                        value={formData.file_type}
                                        onChange={(e) => handleInputChange('file_type', e.target.value)}
                                        placeholder="자동으로 감지됩니다"
                                        className="pl-10 bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    파일 URL 입력 시 자동으로 감지됩니다
                                </p>
                            </FormField>

                            <FormField label="파일 크기 (bytes)">
                                <div className="relative">
                                    {isAnalyzing && (
                                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                                    )}
                                    <FormInput
                                        type="number"
                                        value={formData.file_size}
                                        onChange={(e) => handleInputChange('file_size', parseInt(e.target.value) || 0)}
                                        placeholder="자동으로 감지됩니다"
                                        className="bg-gray-50"
                                        readOnly={formData.file_size > 0}
                                        min="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.file_size > 0
                                        ? `${(formData.file_size / 1024 / 1024).toFixed(2)} MB`
                                        : '파일 URL 입력 시 자동으로 감지됩니다'
                                    }
                                </p>
                            </FormField>
                        </div>
                    </div>

                    {/* 파일 정보 요약 */}
                    {(formData.file_name && formData.file_type) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">파일 정보 요약</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-700">
                                <div>
                                    <span className="font-medium">파일명:</span> {formData.file_name}
                                </div>
                                <div>
                                    <span className="font-medium">타입:</span> {formData.file_type}
                                </div>
                                {formData.file_size > 0 && (
                                    <div>
                                        <span className="font-medium">크기:</span> {(formData.file_size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 활성화 옵션 */}
                    <FormField label="표시 설정">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                className="mr-3 rounded"
                            />
                            <span className="text-sm text-gray-700">자료 활성화 (체크 해제 시 숨김 처리)</span>
                        </label>
                    </FormField>
                </form>
            </ModalBody>

            <ModalFooter>
                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                    <ActionButton
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="w-full sm:w-auto"
                    >
                        취소
                    </ActionButton>
                    <ActionButton
                        onClick={handleSubmit}
                        loading={loading}
                        className="w-full sm:w-auto"
                    >
                        {resource ? '수정' : '등록'}
                    </ActionButton>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default ResourceForm; 