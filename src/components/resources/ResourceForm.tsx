import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    const modalRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
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
        }
    }, [resource]);

    useEffect(() => {
        // 스크롤 차단 강화
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyTouchAction = document.body.style.touchAction;

        // CSS로 스크롤 차단
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        // 모달 내부 요소인지 확인하는 함수
        const isInsideModal = (target: EventTarget | null): boolean => {
            if (!target || !modalRef.current) return false;
            const element = target as Element;
            return modalRef.current.contains(element);
        };

        // 마우스 휠 스크롤 차단 (모달 외부만)
        const preventWheel = (e: WheelEvent) => {
            if (!isInsideModal(e.target)) {
                e.preventDefault();
            }
        };

        // 터치 스크롤 차단 (모달 외부만)
        const preventTouch = (e: TouchEvent) => {
            if (e.touches.length > 1) return; // 멀티터치는 허용
            if (!isInsideModal(e.target)) {
                e.preventDefault();
            }
        };

        // 키보드 스크롤 차단 (모달 외부만)
        const preventKeyScroll = (e: KeyboardEvent) => {
            const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, pageup, pagedown, end, home, left, up, right, down
            if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) {
                e.preventDefault();
            }
        };

        // 뷰포트 위치 계속 업데이트
        const updateModalPosition = () => {
            if (!modalRef.current) return;

            // 현재 뷰포트 정보 가져오기
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            // 모달을 현재 뷰포트 중앙에 정확히 배치
            const modalElement = modalRef.current;
            modalElement.style.position = 'absolute';
            modalElement.style.top = `${scrollTop}px`;
            modalElement.style.left = `${scrollLeft}px`;
            modalElement.style.width = `${viewportWidth}px`;
            modalElement.style.height = `${viewportHeight}px`;
            modalElement.style.zIndex = '2147483647';
            modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modalElement.style.display = 'flex';
            modalElement.style.alignItems = 'center';
            modalElement.style.justifyContent = 'center';
            modalElement.style.padding = '16px';
            modalElement.style.boxSizing = 'border-box';

            // 다음 프레임에서도 계속 업데이트
            animationFrameRef.current = requestAnimationFrame(updateModalPosition);
        };

        // 첫 위치 설정
        updateModalPosition();

        // ESC 키 이벤트
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !loading) {
                onClose();
            }
        };

        // 이벤트 리스너 등록
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('wheel', preventWheel, { passive: false });
        document.addEventListener('touchmove', preventTouch, { passive: false });
        document.addEventListener('keydown', preventKeyScroll, { passive: false });

        return () => {
            // 이벤트 리스너 제거
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('wheel', preventWheel);
            document.removeEventListener('touchmove', preventTouch);
            document.removeEventListener('keydown', preventKeyScroll);

            // 스타일 복원
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.touchAction = originalBodyTouchAction;

            // 애니메이션 프레임 정리
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [onClose, loading]);

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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

    const modalContent = (
        <div
            ref={modalRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 2147483647,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                boxSizing: 'border-box'
            }}
            onClick={!loading ? onClose : undefined}
        >
            <Card
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6 py-4 md:py-6 sticky top-0 bg-white border-b z-10">
                    <CardTitle className="text-lg md:text-xl">
                        {resource ? '자료 수정' : '새 자료 등록'}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 touch-manipulation">
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>

                <CardContent className="px-4 md:px-6 py-4 md:py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 기본 정보 */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="text-sm md:text-base font-medium">제목 *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="자료 제목을 입력하세요"
                                    className="h-12 md:h-10 text-base md:text-sm mt-2"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-sm md:text-base font-medium">설명</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="자료에 대한 설명을 입력하세요"
                                    rows={3}
                                    className="text-base md:text-sm mt-2 min-h-[80px]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="category" className="text-sm md:text-base font-medium">카테고리 *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleInputChange('category', value)}
                                >
                                    <SelectTrigger className="h-12 md:h-10 text-base md:text-sm mt-2">
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
                                <Label htmlFor="file_url" className="text-sm md:text-base font-medium">파일 URL *</Label>
                                <Input
                                    id="file_url"
                                    type="url"
                                    value={formData.file_url}
                                    onChange={(e) => handleFileUrlChange(e.target.value)}
                                    placeholder="https://example.com/file.pdf"
                                    className="h-12 md:h-10 text-base md:text-sm mt-2"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="file_name" className="text-sm md:text-base font-medium">파일명</Label>
                                <Input
                                    id="file_name"
                                    type="text"
                                    value={formData.file_name}
                                    onChange={(e) => handleInputChange('file_name', e.target.value)}
                                    placeholder="파일명을 입력하세요"
                                    className="h-12 md:h-10 text-base md:text-sm mt-2"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="file_type" className="text-sm md:text-base font-medium">
                                        파일 타입
                                        {isAnalyzing && (
                                            <Loader2 className="w-3 h-3 animate-spin inline ml-1" />
                                        )}
                                    </Label>
                                    <Input
                                        id="file_type"
                                        type="text"
                                        value={formData.file_type}
                                        onChange={(e) => handleInputChange('file_type', e.target.value)}
                                        placeholder="자동으로 감지됩니다"
                                        className="bg-gray-50 h-12 md:h-10 text-base md:text-sm mt-2"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        파일 URL 입력 시 자동으로 감지됩니다
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="file_size" className="text-sm md:text-base font-medium">
                                        파일 크기 (bytes)
                                        {isAnalyzing && (
                                            <Loader2 className="w-3 h-3 animate-spin inline ml-1" />
                                        )}
                                    </Label>
                                    <Input
                                        id="file_size"
                                        type="number"
                                        value={formData.file_size}
                                        onChange={(e) => handleInputChange('file_size', parseInt(e.target.value) || 0)}
                                        placeholder="자동으로 감지됩니다"
                                        className="bg-gray-50 h-12 md:h-10 text-base md:text-sm mt-2"
                                        readOnly={formData.file_size > 0}
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.file_size > 0
                                            ? `${(formData.file_size / 1024 / 1024).toFixed(2)} MB`
                                            : '파일 URL 입력 시 자동으로 감지됩니다'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 제출 버튼 */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="w-full sm:w-auto h-12 md:h-10 text-base md:text-sm touch-manipulation"
                            >
                                취소
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto h-12 md:h-10 text-base md:text-sm touch-manipulation"
                            >
                                {loading ? '처리중...' : (resource ? '수정' : '등록')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ResourceForm; 