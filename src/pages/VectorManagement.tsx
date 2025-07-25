import React, { useState, useCallback, useMemo, Suspense, lazy, useEffect } from 'react';
import { useVectorAuth } from '@/hooks/useVectorAuth';
import AccessDenied from '@/components/vector-management/shared/AccessDenied';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, FileText, Search, ArrowLeft, Activity, BarChart3, Smartphone, Wifi, WifiOff } from 'lucide-react';
import type { Collection } from '@/types/vector';
import { useResponsive, useNetworkStatus, useOfflineSupport } from '@/hooks/useMobileOptimization';
import { enhanceMobileUX } from '@/services/common/mobileOptimization';

// Lazy load 컴포넌트들 - 초기 로딩 성능 개선
const CollectionManagement = lazy(() => import('@/components/vector-management/collections/CollectionManagement').then(module => ({ default: module.CollectionManagement })));
const DocumentManagement = lazy(() => import('@/components/vector-management/documents/DocumentManagement').then(module => ({ default: module.DocumentManagement })));
const SearchInterface = lazy(() => import('@/components/vector-management/search/SearchInterface').then(module => ({ default: module.SearchInterface })));

// 로딩 스피너 컴포넌트
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">로딩 중...</span>
  </div>
));

// 탭 네비게이션 컴포넌트
const TabNavigation = React.memo(({
  activeSection,
  onSectionChange
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) => {
  const tabs = useMemo(() => [
    { id: 'overview', label: '대시보드', icon: BarChart3, description: '전체 시스템 현황' },
    { id: 'collections', label: '컬렉션 관리', icon: Database, description: '문서 그룹 관리' },
    { id: 'documents', label: '문서 관리', icon: FileText, description: '파일 업로드 및 처리' },
    { id: 'search', label: '고급 검색', icon: Search, description: '벡터 검색 테스트' }
  ], []);

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base group ${
              activeSection === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            title={description}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});

/**
 * 벡터 데이터베이스 관리 메인 페이지
 * 관리자 권한이 있는 사용자만 접근할 수 있습니다.
 */
const VectorManagement: React.FC = () => {
  const { hasAccess, loading } = useVectorAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'collections' | 'documents' | 'search'>('overview');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  // 모바일 및 네트워크 상태 감지
  const deviceInfo = useResponsive();
  const networkInfo = useNetworkStatus();
  const { isOffline, queueSize } = useOfflineSupport();

  // 모바일 UX 개선 적용
  useEffect(() => {
    const cleanup = enhanceMobileUX();
    return cleanup;
  }, []);

  // 섹션 변경 핸들러 - useCallback으로 최적화
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section as 'overview' | 'collections' | 'documents' | 'search');
    setSelectedCollection(null); // 섹션 변경 시 선택된 컬렉션 초기화
  }, []);

  // 컬렉션 선택 핸들러
  const handleSelectCollection = useCallback((collection: Collection) => {
    setSelectedCollection(collection);
    setActiveSection('documents');
  }, []);

  // 로딩 중일 때 표시할 컴포넌트
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">권한을 확인하는 중...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 접근 권한이 없는 경우
  if (!hasAccess) {
    return <AccessDenied showLoginButton={true} />;
  }

  // 관리자 권한이 있는 경우 메인 관리 페이지 표시
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Database className="w-8 h-8 sm:w-12 sm:h-12 mr-2 sm:mr-3" />
              <h1 className="text-2xl sm:text-4xl font-bold">벡터 데이터베이스 관리</h1>
            </div>
            <p className="text-sm sm:text-xl max-w-3xl mx-auto px-4">
              문서 컬렉션을 관리하고 AI 에이전트의 RAG 기능을 향상시키세요
            </p>
          </div>
        </div>
      </section>

      {/* 모바일 및 네트워크 상태 표시 */}
      {(deviceInfo.isMobile || isOffline || networkInfo.effectiveType === '2g') && (
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {deviceInfo.isMobile && (
              <Alert className="flex-1 min-w-0">
                <Smartphone className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  모바일 최적화 모드 활성화
                </AlertDescription>
              </Alert>
            )}
            
            {isOffline && (
              <Alert variant="destructive" className="flex-1 min-w-0">
                <WifiOff className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  오프라인 모드 ({queueSize}개 작업 대기 중)
                </AlertDescription>
              </Alert>
            )}
            
            {networkInfo.effectiveType === '2g' && !isOffline && (
              <Alert variant="default" className="flex-1 min-w-0">
                <Wifi className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  저속 네트워크 감지 - 데이터 절약 모드
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-4 sm:py-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* 탭 네비게이션 */}
          <TabNavigation activeSection={activeSection} onSectionChange={handleSectionChange} />

          {/* 탭 컨텐츠 - Suspense로 lazy loading */}
          <Suspense fallback={<LoadingSpinner />}>
            {activeSection === 'overview' ? (
              <div className="space-y-6 sm:space-y-8">
                {/* 시스템 상태 카드 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">시스템 상태</CardTitle>
                        <CardDescription>
                          벡터 데이터베이스의 현재 상태와 통계를 확인합니다.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-600">컬렉션</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-600">문서</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-600">청크</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">0MB</div>
                        <div className="text-sm text-gray-600">저장 용량</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 기능 카드 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 컬렉션 관리 */}
                  <Card 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-l-4 border-l-blue-500"
                    onClick={() => handleSectionChange('collections')}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">컬렉션 관리</CardTitle>
                      <CardDescription>
                        문서를 논리적으로 그룹화하고 컬렉션을 생성, 수정, 삭제합니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          컬렉션 생성 및 관리
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          메타데이터 설정
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          통계 및 상태 확인
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 문서 관리 */}
                  <Card 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-l-4 border-l-green-500"
                    onClick={() => handleSectionChange('documents')}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">문서 관리</CardTitle>
                      <CardDescription>
                        다양한 형식의 문서를 업로드하고 벡터화하여 검색 가능하게 만듭니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          파일 업로드 (PDF, TXT, MD, DOCX, HTML)
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          자동 텍스트 추출 및 청킹
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          벡터 생성 및 저장
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 고급 검색 */}
                  <Card 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-l-4 border-l-purple-500"
                    onClick={() => handleSectionChange('search')}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">고급 검색</CardTitle>
                      <CardDescription>
                        의미 기반 검색, 키워드 검색, 하이브리드 검색을 통해 문서를 찾습니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          의미 기반 벡터 검색
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          키워드 전문 검색
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          하이브리드 검색 및 필터링
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 시작하기 안내 */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900 mb-2">시작하기</h3>
                      <p className="text-sm text-blue-800 mb-4">
                        벡터 데이터베이스를 사용하려면 먼저 컬렉션을 생성해야 합니다. 
                        컬렉션은 관련 문서들을 그룹화하는 컨테이너 역할을 합니다.
                      </p>
                      <Button 
                        onClick={() => handleSectionChange('collections')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        컬렉션 관리 시작하기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 서브 페이지 헤더 */}
                <div className="mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionChange('overview')}
                    className="mb-4 hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    대시보드로 돌아가기
                  </Button>
                </div>

                {/* 서브 페이지 콘텐츠 */}
                {activeSection === 'collections' && (
                  <CollectionManagement 
                    onSelectCollection={handleSelectCollection}
                  />
                )}
                
                {activeSection === 'documents' && (
                  <DocumentManagement
                    selectedCollection={selectedCollection}
                    onBack={() => {
                      setSelectedCollection(null);
                      handleSectionChange('collections');
                    }}
                  />
                )}
                
                {activeSection === 'search' && (
                  <SearchInterface
                    onViewDocument={(documentId) => {
                      // 문서 보기 기능 구현 (향후 확장)
                      console.log('문서 보기:', documentId);
                    }}
                  />
                )}
              </>
            )}
          </Suspense>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VectorManagement;