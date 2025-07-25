import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { UploadProgress, UploadResult } from '@/types/vector';
import { SUPPORTED_FILE_TYPES } from '@/types/vector';
import { 
  uploadDocuments, 
  validateFileExtended, 
  formatFileSize, 
  getFileTypeIcon 
} from '@/services/documentService';
import { 
  processMultipleDocuments, 
  type ProcessingProgress 
} from '@/services/documentProcessingService';
import { fileProcessingService } from '@/services/fileProcessingService';

interface DocumentUploadProps {
  collectionId: string;
  onUploadComplete: (results: UploadResult[]) => void;
  onUploadProgress?: (progress: UploadProgress[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  collectionId,
  onUploadComplete,
  onUploadProgress,
  disabled = false,
  maxFiles = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 검증
  const validateFiles = (files: File[]): { valid: File[]; invalid: Array<{ file: File; error: string }> } => {
    const valid: File[] = [];
    const invalid: Array<{ file: File; error: string }> = [];

    files.forEach(file => {
      const validation = validateFileExtended(file);
      if (validation.valid) {
        valid.push(file);
      } else {
        invalid.push({ file, error: validation.error || '알 수 없는 오류' });
      }
    });

    return { valid, invalid };
  };

  // 파일 선택 처리
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || disabled) return;

    const fileArray = Array.from(files);
    const { valid, invalid } = validateFiles(fileArray);

    // 최대 파일 수 확인
    const totalFiles = selectedFiles.length + valid.length;
    if (totalFiles > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    // 중복 파일 제거
    const newFiles = valid.filter(file => 
      !selectedFiles.some(existing => 
        existing.name === file.name && existing.size === file.size
      )
    );

    setSelectedFiles(prev => [...prev, ...newFiles]);

    // 유효하지 않은 파일에 대한 알림
    if (invalid.length > 0) {
      const errorMessages = invalid.map(({ file, error }) => `${file.name}: ${error}`);
      alert(`다음 파일들을 업로드할 수 없습니다:\n${errorMessages.join('\n')}`);
    }
  }, [selectedFiles, disabled, maxFiles]);

  // 드래그 앤 드롭 이벤트 처리
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect, disabled]);

  // 파일 입력 클릭
  const handleFileInputClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 제거
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 모든 파일 제거
  const clearFiles = () => {
    setSelectedFiles([]);
    setUploadProgress([]);
    setUploadResults([]);
  };

  // 업로드 진행률 업데이트
  const handleProgressUpdate = (progress: UploadProgress[]) => {
    setUploadProgress(progress);
    onUploadProgress?.(progress);
  };

  // 파일 업로드 실행
  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadResults([]);

    try {
      const results = await fileProcessingService.uploadAndProcessFiles(
        selectedFiles,
        collectionId,
        handleProgressUpdate
      );

      const uploadResults = results.map(result => result.uploadResult);
      setUploadResults(uploadResults);
      onUploadComplete(uploadResults);

      // 성공한 파일들은 목록에서 제거
      const successfulFiles = uploadResults
        .filter(result => result.success)
        .map(result => result.file);
      
      setSelectedFiles(prev => 
        prev.filter(file => !successfulFiles.includes(file))
      );

    } catch (error) {
      console.error('업로드 오류:', error);
      
      // 구체적인 오류 메시지 표시
      const errorMessage = error instanceof Error ? error.message : '업로드 중 알 수 없는 오류가 발생했습니다.';
      
      if (errorMessage.includes('Bucket not found') || errorMessage.includes('스토리지 버킷')) {
        alert(`스토리지 설정 오류\n\n${errorMessage}\n\n관리자에게 문의하거나 vector-database-setup.sql 스크립트를 실행해주세요.`);
      } else if (errorMessage.includes('File size too large') || errorMessage.includes('파일 크기')) {
        alert(`파일 크기 오류\n\n${errorMessage}\n\n더 작은 파일을 선택하거나 파일을 분할해주세요.`);
      } else {
        alert(`업로드 오류\n\n${errorMessage}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 실패한 파일 재시도
  const retryFailedUploads = () => {
    const failedFiles = uploadResults
      .filter(result => !result.success)
      .map(result => result.file);
    
    setSelectedFiles(prev => [...prev, ...failedFiles]);
    setUploadResults([]);
    setUploadProgress([]);
  };

  const supportedExtensions = Object.values(SUPPORTED_FILE_TYPES)
    .map(type => type.extension)
    .join(', ');

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileInputClick}
      >
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">파일을 드래그하거나 클릭하여 업로드</h3>
              <p className="text-sm text-muted-foreground mt-1">
                지원 형식: {supportedExtensions}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                최대 {maxFiles}개 파일, 파일당 최대 55MB
              </p>
            </div>
            <Button variant="outline" disabled={disabled}>
              <Upload className="h-4 w-4 mr-2" />
              파일 선택
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.values(SUPPORTED_FILE_TYPES).map(type => type.extension).join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* 선택된 파일 목록 */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">선택된 파일 ({selectedFiles.length})</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFiles}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  모두 제거
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      업로드 시작
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="text-2xl">
                  {getFileTypeIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 업로드 진행률 */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">업로드 진행률</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadProgress.map((progress, index) => (
              <div key={`${progress.file_name}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1">
                    {progress.file_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      progress.status === 'completed' ? 'default' :
                      progress.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {progress.status === 'uploading' && '업로드 중'}
                      {progress.status === 'processing' && '처리 중'}
                      {progress.status === 'completed' && '완료'}
                      {progress.status === 'failed' && '실패'}
                    </Badge>
                    {progress.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {progress.status === 'failed' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {(progress.status === 'uploading' || progress.status === 'processing') && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
                <Progress value={progress.progress} className="h-2" />
                {progress.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {progress.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 업로드 결과 */}
      {uploadResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">업로드 결과</CardTitle>
              {uploadResults.some(result => !result.success) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailedUploads}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  실패한 파일 재시도
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="flex-1 text-sm">{result.file.name}</span>
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? '성공' : '실패'}
                  </Badge>
                </div>
              ))}
            </div>
            
            {/* 요약 통계 */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">성공:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {uploadResults.filter(r => r.success).length}개
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">실패:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {uploadResults.filter(r => !r.success).length}개
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};