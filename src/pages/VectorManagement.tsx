import React, { useState } from 'react';
import { useVectorAuth } from '@/hooks/useVectorAuth';
import AccessDenied from '@/components/vector-management/shared/AccessDenied';
import { CollectionManagement } from '@/components/vector-management/collections/CollectionManagement';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, FileText, Search, Settings, ArrowLeft } from 'lucide-react';

/**
 * 벡터 데이터베이스 관리 메인 페이지
 * 관리자 권한이 있는 사용자만 접근할 수 있습니다.
 */
const VectorManagement: React.FC = () => {
  const { hasAccess, loading } = useVectorAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'collections' | 'documents' | 'search'>('overview');

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
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {activeSection === 'overview' ? (
            <>
              {/* 페이지 헤더 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  벡터 데이터베이스 관리
                </h1>
                <p className="text-gray-600">
                  문서 컬렉션을 관리하고 AI 에이전트의 RAG 기능을 향상시키세요.
                </p>
              </div>

              {/* 기능 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* 컬렉션 관리 */}
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveSection('collections')}
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
                    <div className="text-sm text-gray-500">
                      • 컬렉션 생성 및 관리<br />
                      • 메타데이터 설정<br />
                      • 통계 및 상태 확인
                    </div>
                  </CardContent>
                </Card>

                {/* 문서 관리 */}
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer opacity-60"
                  onClick={() => setActiveSection('documents')}
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
                    <div className="text-sm text-gray-500">
                      • 파일 업로드 (PDF, TXT, MD, DOCX, HTML)<br />
                      • 자동 텍스트 추출 및 청킹<br />
                      • 벡터 생성 및 저장
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        개발 예정
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 고급 검색 */}
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer opacity-60"
                  onClick={() => setActiveSection('search')}
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
                    <div className="text-sm text-gray-500">
                      • 의미 기반 벡터 검색<br />
                      • 키워드 전문 검색<br />
                      • 하이브리드 검색 및 필터링
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        개발 예정
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 시스템 상태 카드 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-gray-600" />
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

              {/* 시작하기 안내 */}
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
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
                      onClick={() => setActiveSection('collections')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      컬렉션 관리 시작하기
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 서브 페이지 헤더 */}
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setActiveSection('overview')}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  대시보드로 돌아가기
                </Button>
              </div>

              {/* 서브 페이지 콘텐츠 */}
              {activeSection === 'collections' && <CollectionManagement />}
              
              {activeSection === 'documents' && (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">문서 관리</h2>
                  <p className="text-gray-600 mb-4">이 기능은 곧 구현될 예정입니다.</p>
                  <Button variant="outline" onClick={() => setActiveSection('overview')}>
                    대시보드로 돌아가기
                  </Button>
                </div>
              )}
              
              {activeSection === 'search' && (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">고급 검색</h2>
                  <p className="text-gray-600 mb-4">이 기능은 곧 구현될 예정입니다.</p>
                  <Button variant="outline" onClick={() => setActiveSection('overview')}>
                    대시보드로 돌아가기
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VectorManagement;