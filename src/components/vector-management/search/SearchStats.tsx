import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  Clock, 
  Search, 
  TrendingUp,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import type { SearchStats as SearchStatsType, SearchLog, SearchType } from '@/types/vector';
import { getSearchStats, getRecentSearches } from '@/services/searchService';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SearchStatsProps {
  onQuerySelect?: (query: string) => void;
}

export const SearchStats: React.FC<SearchStatsProps> = ({
  onQuerySelect
}) => {
  const [stats, setStats] = useState<SearchStatsType | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // 통계 데이터 로드
  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsData, recentData] = await Promise.all([
        getSearchStats(),
        getRecentSearches(10)
      ]);
      setStats(statsData);
      setRecentSearches(recentData);
    } catch (error) {
      console.error('검색 통계 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  if (loading && !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            통계를 불러오는 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">통계 데이터를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 검색 타입별 색상
  const getSearchTypeColor = (type: SearchType) => {
    switch (type) {
      case 'semantic': return 'bg-blue-500';
      case 'keyword': return 'bg-green-500';
      case 'hybrid': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // 검색 타입별 라벨
  const getSearchTypeLabel = (type: SearchType) => {
    switch (type) {
      case 'semantic': return '의미 검색';
      case 'keyword': return '키워드 검색';
      case 'hybrid': return '하이브리드 검색';
      default: return type;
    }
  };

  // 검색 타입 분포 계산
  const totalSearches = Object.values(stats.search_type_distribution).reduce((sum, count) => sum + count, 0);
  const searchTypePercentages = Object.entries(stats.search_type_distribution).map(([type, count]) => ({
    type: type as SearchType,
    count,
    percentage: totalSearches > 0 ? (count / totalSearches) * 100 : 0
  }));

  return (
    <div className="space-y-4">
      {/* 전체 통계 개요 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              검색 통계
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7일</SelectItem>
                  <SelectItem value="30d">30일</SelectItem>
                  <SelectItem value="90d">90일</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={loadStats}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total_searches}</div>
              <div className="text-sm text-muted-foreground">총 검색 수</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.avg_execution_time}ms</div>
              <div className="text-sm text-muted-foreground">평균 응답시간</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.popular_queries.length}</div>
              <div className="text-sm text-muted-foreground">인기 검색어</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{recentSearches.length}</div>
              <div className="text-sm text-muted-foreground">최근 검색</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검색 타입 분포 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">검색 타입 분포</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchTypePercentages.map(({ type, count, percentage }) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getSearchTypeColor(type)}`} />
                  <span>{getSearchTypeLabel(type)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{count}회</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 인기 검색어 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            인기 검색어
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.popular_queries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              인기 검색어가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {stats.popular_queries.map((item, index) => (
                <div
                  key={item.query}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onQuerySelect?.(item.query)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">#{index + 1}</span>
                    </div>
                    <span className="text-sm">{item.query}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}회
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 검색 기록 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              최근 검색 기록
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecentSearches(!showRecentSearches)}
            >
              {showRecentSearches ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showRecentSearches && (
          <CardContent>
            {recentSearches.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                최근 검색 기록이 없습니다.
              </p>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {recentSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onQuerySelect?.(search.query)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${getSearchTypeColor(search.search_type)}`} />
                        <span className="text-sm truncate">{search.query}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {search.results_count}개
                        </Badge>
                        <span>
                          {formatDistanceToNow(new Date(search.created_at), { 
                            addSuffix: true, 
                            locale: ko 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};