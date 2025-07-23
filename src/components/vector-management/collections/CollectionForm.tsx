import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, X } from 'lucide-react';
import type { Collection, CreateCollectionData, UpdateCollectionData } from '@/types/vector';
import { checkCollectionNameExists } from '@/services/collectionService';

// 폼 스키마 정의
const collectionFormSchema = z.object({
  name: z.string()
    .min(1, '컬렉션 이름을 입력해주세요')
    .max(100, '컬렉션 이름은 100자 이하여야 합니다')
    .regex(/^[a-zA-Z0-9가-힣\s\-_]+$/, '특수문자는 하이픈(-)과 언더스코어(_)만 사용 가능합니다'),
  description: z.string()
    .max(500, '설명은 500자 이하여야 합니다')
    .optional(),
  is_active: z.boolean().default(true),
  metadata: z.record(z.string(), z.any()).default({})
});

type CollectionFormData = z.infer<typeof collectionFormSchema>;

interface CollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollectionData | UpdateCollectionData) => Promise<void>;
  collection?: Collection | null;
  loading?: boolean;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  collection,
  loading = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [metadataKey, setMetadataKey] = useState('');
  const [metadataValue, setMetadataValue] = useState('');

  const isEditing = !!collection;

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
      metadata: {}
    }
  });

  // 컬렉션 데이터로 폼 초기화
  useEffect(() => {
    if (collection) {
      form.reset({
        name: collection.name,
        description: collection.description || '',
        is_active: collection.is_active,
        metadata: collection.metadata || {}
      });
    } else {
      form.reset({
        name: '',
        description: '',
        is_active: true,
        metadata: {}
      });
    }
    setNameError(null);
  }, [collection, form]);

  // 컬렉션 이름 중복 확인
  const validateCollectionName = async (name: string): Promise<boolean> => {
    if (!name.trim()) return true;
    
    try {
      const exists = await checkCollectionNameExists(name.trim(), collection?.id);
      if (exists) {
        setNameError('이미 존재하는 컬렉션 이름입니다');
        return false;
      }
      setNameError(null);
      return true;
    } catch (error) {
      console.error('컬렉션 이름 확인 오류:', error);
      return true; // 오류 시에는 통과시킴
    }
  };

  // 메타데이터 추가
  const addMetadata = () => {
    if (metadataKey.trim() && metadataValue.trim()) {
      const currentMetadata = form.getValues('metadata');
      form.setValue('metadata', {
        ...currentMetadata,
        [metadataKey.trim()]: metadataValue.trim()
      });
      setMetadataKey('');
      setMetadataValue('');
    }
  };

  // 메타데이터 제거
  const removeMetadata = (key: string) => {
    const currentMetadata = form.getValues('metadata');
    const newMetadata = { ...currentMetadata };
    delete newMetadata[key];
    form.setValue('metadata', newMetadata);
  };

  // 폼 제출
  const handleSubmit = async (data: CollectionFormData) => {
    setIsSubmitting(true);
    
    try {
      // 이름 중복 확인
      const isNameValid = await validateCollectionName(data.name);
      if (!isNameValid) {
        setIsSubmitting(false);
        return;
      }

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('컬렉션 저장 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setNameError(null);
      setMetadataKey('');
      setMetadataValue('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '컬렉션 수정' : '새 컬렉션 생성'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? '컬렉션 정보를 수정합니다' 
              : '새로운 컬렉션을 생성합니다. 컬렉션은 관련 문서들을 그룹화하는 데 사용됩니다'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 컬렉션 이름 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>컬렉션 이름 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 제품 매뉴얼, 기술 문서, 회사 정책"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        validateCollectionName(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    컬렉션을 식별할 수 있는 고유한 이름을 입력하세요
                  </FormDescription>
                  <FormMessage />
                  {nameError && (
                    <p className="text-sm font-medium text-destructive">{nameError}</p>
                  )}
                </FormItem>
              )}
            />

            {/* 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="이 컬렉션에 포함될 문서의 종류나 목적을 설명해주세요"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    컬렉션의 용도나 포함될 문서 유형을 설명하세요 (선택사항)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 활성 상태 */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">활성 상태</FormLabel>
                    <FormDescription>
                      비활성화된 컬렉션은 검색에서 제외됩니다
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 메타데이터 */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base">메타데이터</FormLabel>
                <FormDescription>
                  컬렉션에 대한 추가 정보를 키-값 쌍으로 저장할 수 있습니다
                </FormDescription>
              </div>

              {/* 기존 메타데이터 표시 */}
              <div className="space-y-2">
                {Object.entries(form.watch('metadata') || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <span className="font-medium">{key}:</span>
                      <span>{String(value)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeMetadata(key)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
              </div>

              {/* 새 메타데이터 추가 */}
              <div className="flex gap-2">
                <Input
                  placeholder="키"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="값"
                  value={metadataValue}
                  onChange={(e) => setMetadataValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetadata}
                  disabled={!metadataKey.trim() || !metadataValue.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !!nameError}
              >
                {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
                {isEditing ? '수정' : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};