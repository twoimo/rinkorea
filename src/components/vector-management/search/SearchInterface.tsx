import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce, useDebouncedValue } from '@/lib/optimization';
import { performanceMonitor } from '@/lib/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Search, 
  Sparkles, 
  Hash, 
  Zap,
  History,
  BarChart3,
  Filter,
  Loader2
} from 'lucide-react';
import type { 
  SearchResult, 
  SearchType, 
  SearchFilters as SearchFiltersType,
  Collection 
} from '@/types/vector';
import { SearchResults } from './SearchResults';
import { SearchFilters } from './SearchFilters';
import { SearchStats } from './SearchStats';
import { 
  semanticSearch, 
  keywordSearch, 
  hybridSearch,
  searchWithFilters,
  getSearchSuggestions,
  exportSearchResults
} from '@/services/searchService';
import { getActiveCollections } from '@/services/collectionService';
import { useToast } from '@/hooks/use-toast';

interface SearchInterfaceProps {
  onViewDocument?: (documentId: string) => void;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onViewDocument
}) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('hybrid');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [collections, setCollections] = useState<Collection[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'stats'>('search');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { toast } = useToast();

  // 컬렉션 목록 로드
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const collectionsData = await getActiveCollections();
        setCollections(collectionsData);
      } catch (error) {
        console.error('컬렉션 로드 오류:', error);
      }
    };
    loadCollections();
  }, []);

  // 디바운스된 쿼리 값
  const [debouncedQuery, isDebouncing] = useDebouncedValue(query, 300);

  // 검색 제안 로드
  useEffect(() => {
    const loadSuggestions = async () => {
      if (debouncedQuery.length >= 2) {
        performanceMonitor.startTimer('loadSearchSuggestions');
        try {
          const suggestionsData = await getSearchSuggestions(debouncedQuery);
          setSuggestions(suggestionsData);
          performanceMonitor.endTimer('loadSearchSuggestions', { query: debouncedQuery, resultsCount: suggestionsData.length });
        } catch (error) {
          console.error('검색 제안 로드 오류:', error);
          performanceMonitor.endTimer('loadSearchSuggestions', { error: true });
        }
      } else {
        setSuggestions([]);
      }
    };

    loadSuggestions();
  }, [debouncedQuery]);

  // 메모이제이션된 검색 실행 함수
  const handleSearch = useCallback(async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) {
      toast({
        title: '검색어를 입력해주세요',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    performanceMonitor.startTimer('searchExecution');

    try {
      let searchResults: SearchResult[];

      // 필터가 있는 경우 필터 검색 사용
      if (Object.keys(filters).length > 0) {
        searchResults = await searchWithFilters(finalQuery, searchType, filters);
      } else {
        // 기본 검색
        switch (searchType) {
          case 'semantic':
            searchResults = await semanticSearch({
              query: finalQuery,
              match_threshold: 0.7,
              match_count: 20
            });
            break;
          case 'keyword':
            searchResults = await keywordSearch({
              query: finalQuery,
              match_count: 20,
              highlight: true
            });
            break;
          case 'hybrid':
            searchResults = await hybridSearch({
              query: finalQuery,
              match_count: 20,
              semantic_weight: 0.7,
              keyword_weight: 0.3
            });
            break;
          default:
            throw new Error(`지원되지 않는 검색 타입: ${searchType}`);
        }
      }

      setResults(searchResults);
      
      // 검색 기록에 추가
      setSearchHistory(prev => {
        const newHistory = [finalQuery, ...prev.filter(h => h !== finalQuery)];
        return newHistory.slice(0, 10); // 최대 10개까지 저장
      });

      performanceMonitor.endTimer('searchExecution', {
        query: finalQuery,
        searchType,
        resultsCount: searchResults.length,
        hasFilters: Object.keys(filters).length > 0
      });

      toast({
        title: '검색 완료',
        description: `${searchResults.length}개의 결과를 찾았습니다.`
      });

    } catch (error) {
      console.error('검색 오류:', error);
      performanceMonitor.endTimer('searchExecution', { error: true });
      toast({
        title: '검색 실패',
        description: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, searchType, filters, toast]);

  // 엔터 키 처리 (최적화된 버전)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  // 검색 결과 내보내기 (최적화된 버전)
  const handleExport = useCallback(() => {
    if (results.length === 0) {
      toast({
        title: '내보낼 결과가 없습니다',
        variant: 'destructive'
      });
      return;
    }

    performanceMonitor.startTimer('exportSearchResults');
    try {
      exportSearchResults(results, query);
      performanceMonitor.endTimer('exportSearchResults', { resultsCount: results.length });
      toast({
        title: '내보내기 완료',
        description: 'CSV 파일이 다운로드되었습니다.'
      });
    } catch (error) {
      performanceMonitor.endTimer('exportSearchResults', { error: true });
      toast({
        title: '내보내기 실패',
        description: '파일 내보내기 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  }, [results, query, toast]);

  // 필터 초기화 (최적화된 버전)
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // 메모이제이션된 값들
  const hasFilters = useMemo(() => Object.keys(filters).length > 0, [filters]);
  const hasResults = useMemo(() => results.length > 0, [results]);
  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  // 검색 타입별 아이콘
  const getSearchTypeIcon = (type: SearchType) => {
    switch (type) {
      case 'semantic': return <Sparkles className="h-4 w-4" />;
      case 'keyword': return <Hash className="h-4 w-4" />;
      case 'hybrid': return <Zap className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  // 검색 타입별 설명
  const getSearchTypeDescription = (type: SearchType) => {
    switch (type) {
      case 'semantic': return '의미와 맥락을 이해하여 관련 문서를 찾습니다';
      case 'keyword': return '정확한 키워드 매칭으로 문서를 검색합니다';
      case 'hybrid': return '의미 검색과 키워드 검색을 결합합니다';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            고급 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 타입 선택 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['semantic', 'keyword', 'hybrid'] as SearchType[]).map((type) => (
              <Card
                key={type}
                className={`cursor-pointer transition-all ${
                  searchType === type 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSearchType(type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getSearchTypeIcon(type)}
                    <span className="font-medium text-sm">
                      {type === 'semantic' && '의미 검색'}
                      {type === 'keyword' && '키워드 검색'}
                      {type === 'hybrid' && '하이브리드 검색'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getSearchTypeDescription(type)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 검색 입력 */}
          <div className="space-y-3">
            <div className="relative">
              <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Textarea
                      placeholder="검색할 내용을 입력하세요..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSuggestions(suggestions.length > 0)}
                      className="min-h-[80px] pr-12 resize-none"
                    />
                    <Button
                      onClick={() => handleSearch()}
                      disabled={loading || !canSearch}
                      className="absolute right-2 top-2"
                      size="sm"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandList>
                      {suggestions.length > 0 && (
                        <CommandGroup heading="검색 제안">
                          {suggestions.map((suggestion) => (
                            <CommandItem
                              key={suggestion}
                              onSelect={() => {
                                setQuery(suggestion);
                                setShowSuggestions(false);
                                handleSearch(suggestion);
                              }}
                            >
                              <Search className="h-4 w-4 mr-2" />
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {searchHistory.length > 0 && (
                        <CommandGroup heading="최근 검색">
                          {searchHistory.slice(0, 5).map((historyItem) => (
                            <CommandItem
                              key={historyItem}
                              onSelect={() => {
                                setQuery(historyItem);
                                setShowSuggestions(false);
                                handleSearch(historyItem);
                              }}
                            >
                              <History className="h-4 w-4 mr-2" />
                              {historyItem}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 검색 옵션 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getSearchTypeIcon(searchType)}
                  {searchType === 'semantic' && '의미 검색'}
                  {searchType === 'keyword' && '키워드 검색'}
                  {searchType === 'hybrid' && '하이브리드 검색'}
                </Badge>
                {hasFilters && (
                  <Badge variant="secondary">
                    <Filter className="h-3 w-3 mr-1" />
                    {Object.keys(filters).length}개 필터 적용
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab(activeTab === 'search' ? 'stats' : 'search')}
                >
                  {activeTab === 'search' ? (
                    <>
                      <BarChart3 className="h-4 w-4 mr-1" />
                      통계
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1" />
                      검색
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">검색 결과</TabsTrigger>
          <TabsTrigger value="stats">검색 통계</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 검색 필터 (사이드바) */}
            <div className="lg:col-span-1">
              <SearchFilters
                filters={filters}
                collections={collections}
                searchType={searchType}
                onFiltersChange={setFilters}
                onReset={resetFilters}
              />
            </div>

            {/* 검색 결과 */}
            <div className="lg:col-span-3">
              <SearchResults
                results={results}
                loading={loading}
                searchType={searchType}
                query={query}
                onExport={handleExport}
                onViewDocument={onViewDocument}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <SearchStats
            onQuerySelect={(selectedQuery) => {
              setQuery(selectedQuery);
              setActiveTab('search');
              handleSearch(selectedQuery);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};