import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Calendar,
  Database,
  FileType,
  Target
} from 'lucide-react';
import type { SearchFilters as SearchFiltersType, Collection, SearchType } from '@/types/vector';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  collections: Collection[];
  searchType: SearchType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onReset: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  collections,
  searchType,
  onFiltersChange,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  // 필터 변경 시 로컬 상태 업데이트
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // 필터 적용
  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  // 개별 필터 업데이트
  const updateFilter = <K extends keyof SearchFiltersType>(
    key: K,
    value: SearchFiltersType[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // 컬렉션 선택/해제
  const toggleCollection = (collectionId: string) => {
    const currentIds = localFilters.collection_ids || [];
    const newIds = currentIds.includes(collectionId)
      ? currentIds.filter(id => id !== collectionId)
      : [...currentIds, collectionId];
    
    updateFilter('collection_ids', newIds.length > 0 ? newIds : undefined);
  };

  // 문서 타입 선택/해제
  const toggleDocumentType = (type: string) => {
    const currentTypes = localFilters.document_types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    updateFilter('document_types', newTypes.length > 0 ? newTypes : undefined);
  };

  // 필터 초기화
  const resetFilters = () => {
    setLocalFilters({});
    onReset();
  };

  // 활성 필터 개수 계산
  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.collection_ids?.length) count++;
    if (localFilters.document_types?.length) count++;
    if (localFilters.date_from) count++;
    if (localFilters.date_to) count++;
    if (localFilters.min_similarity && localFilters.min_similarity > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const documentTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'text', label: '텍스트' },
    { value: 'html', label: 'HTML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'word', label: 'Word' }
  ];

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <CardTitle className="text-base">검색 필터</CardTitle>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetFilters();
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* 컬렉션 필터 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">컬렉션</Label>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`collection-${collection.id}`}
                      checked={localFilters.collection_ids?.includes(collection.id) || false}
                      onCheckedChange={() => toggleCollection(collection.id)}
                    />
                    <Label
                      htmlFor={`collection-${collection.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {collection.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({collection.document_count}개 문서)
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 문서 타입 필터 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileType className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">문서 타입</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {documentTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={localFilters.document_types?.includes(type.value) || false}
                      onCheckedChange={() => toggleDocumentType(type.value)}
                    />
                    <Label
                      htmlFor={`type-${type.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 날짜 범위 필터 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">생성 날짜</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                    시작일
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={localFilters.date_from || ''}
                    onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                    종료일
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={localFilters.date_to || ''}
                    onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* 유사도 임계값 (의미 검색 시에만) */}
            {searchType === 'semantic' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">최소 유사도</Label>
                  <span className="text-xs text-muted-foreground">
                    ({((localFilters.min_similarity || 0.7) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Slider
                  value={[localFilters.min_similarity || 0.7]}
                  onValueChange={([value]) => updateFilter('min_similarity', value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* 필터 적용 버튼 */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={applyFilters} className="flex-1">
                필터 적용
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-1" />
                초기화
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};