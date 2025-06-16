import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Download, BarChart3, Coins } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserRole } from '@/hooks/useUserRole';
import { useRevenue } from '@/hooks/useRevenue';
import RevenueDashboard from '@/components/revenue/RevenueDashboard';
import { GridLayout, ChartConfig } from '@/types/revenue';
import AdminOnly from '@/components/AdminOnly';
import RevenueChart from '@/components/revenue/RevenueChart';

// Lazy load 컴포넌트들 - 초기 로딩 성능 개선
const ChartAnalysis = lazy(() => import('@/components/revenue/ChartAnalysis'));
const DataInput = lazy(() => import('@/components/revenue/DataInput'));
const DataTable = lazy(() => import('@/components/revenue/DataTable'));

// 로딩 스피너 컴포넌트
const LoadingSpinner = React.memo(() => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">로딩 중...</span>
    </div>
));

// 빠른 기간 선택 버튼 컴포넌트 - 메모이제이션으로 최적화
const QuickDateButtons = React.memo(({
    onDateRangeChange
}: {
    onDateRangeChange: (period: string) => void
}) => {
    const buttons = useMemo(() => [
        { period: '1d', label: '1일' },
        { period: '7d', label: '7일' },
        { period: '1m', label: '1개월' },
        { period: '3m', label: '3개월' },
        { period: '6m', label: '6개월' },
        { period: '1y', label: '1년' },
        { period: '3y', label: '3년' },
        { period: '5y', label: '5년' },
        { period: '10y', label: '10년' }
    ], []);

    return (
        <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 text-sm sm:text-base">빠른 선택:</span>
            <div className="flex flex-wrap gap-1">
                {buttons.map(({ period, label }) => (
                    <button
                        key={period}
                        onClick={() => onDateRangeChange(period)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded hover:bg-gray-50 transition-colors"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
});

// 탭 네비게이션 컴포넌트 - 메모이제이션으로 최적화
const TabNavigation = React.memo(({
    activeTab,
    onTabChange
}: {
    activeTab: string;
    onTabChange: (tab: string) => void
}) => {
    const tabs = useMemo(() => [
        { id: 'dashboard', label: '대시보드', icon: BarChart3 },
        { id: 'charts', label: '차트 분석', icon: BarChart3 },
        { id: 'input', label: '데이터 입력', icon: Calendar },
        { id: 'manage', label: '데이터 편집', icon: Calendar }
    ], []);

    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => onTabChange(id)}
                        className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${activeTab === id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
});

const RevenueManagement = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: roleLoading } = useUserRole();
    const {
        revenueData,
        categories,
        loading,
        stats,
        error, // 에러 상태 추가
        fetchRevenueData,
        getChartData,
        addBulkRevenueData,
        updateRevenueData,
        deleteRevenueData,
        deleteSelectedRevenueData
    } = useRevenue();

    const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'input' | 'manage'>('dashboard');
    const [dateRange, setDateRange] = useState(() => ({
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    }));
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // 빠른 기간 선택 함수 - useCallback으로 최적화
    const setQuickDateRange = useCallback((period: string) => {
        const end = new Date().toISOString().split('T')[0];
        let start: string;

        const today = new Date();
        switch (period) {
            case '1d':
                start = end;
                break;
            case '7d':
                start = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
                break;
            case '1m':
                start = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
                break;
            case '3m':
                start = new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0];
                break;
            case '6m':
                start = new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
                break;
            case '1y':
                start = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
                break;
            case '3y':
                start = new Date(today.setFullYear(today.getFullYear() - 3)).toISOString().split('T')[0];
                break;
            case '5y':
                start = new Date(today.setFullYear(today.getFullYear() - 5)).toISOString().split('T')[0];
                break;
            case '10y':
                start = new Date(today.setFullYear(today.getFullYear() - 10)).toISOString().split('T')[0];
                break;
            default:
                return;
        }

        setDateRange({ start, end });
    }, []);

    // 관리자 권한 체크
    useEffect(() => {
        if (!roleLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, roleLoading, navigate]);

    // 카테고리 색상 매핑 - useMemo로 최적화
    const categoryColors = useMemo(() =>
        categories.reduce((acc, category) => {
            acc[category.name] = category.color;
            return acc;
        }, {} as Record<string, string>)
        , [categories]);

    // 날짜 범위 변경 시 데이터 다시 로드 - 디바운싱 적용
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (dateRange.start && dateRange.end) {
                fetchRevenueData(dateRange);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [dateRange, fetchRevenueData]);

    // 차트 데이터 준비 - useMemo로 최적화
    const chartData = useMemo(() =>
        getChartData(
            revenueData,
            'monthly',
            selectedCategories.length > 0 ? selectedCategories : categories.map(c => c.name)
        )
        , [revenueData, selectedCategories, categories, getChartData]);

    // CSV 데이터 내보내기 - useCallback으로 최적화
    const exportToCSV = useCallback(() => {
        const headers = ['날짜', '카테고리', '제품명', '매출', '수량', '단가', '지역', '고객유형', '비고'];
        const csvContent = [
            headers.join(','),
            ...revenueData.map(row => [
                row.date,
                row.category,
                row.product_name || '',
                row.revenue,
                row.quantity || '',
                row.unit_price || '',
                row.region || '',
                row.customer_type || '',
                row.notes || ''
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `매출데이터_${dateRange.start}_${dateRange.end}.csv`;
        link.click();
    }, [revenueData, dateRange]);

    // 탭 변경 핸들러 - useCallback으로 최적화
    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab as 'dashboard' | 'charts' | 'input' | 'manage');
    }, []);

    if (roleLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <AdminOnly>
            <div className="min-h-screen bg-gray-50">
                <Header />

                {/* Hero Section - 모바일 최적화 */}
                <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-8 sm:py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <Coins className="w-8 h-8 sm:w-12 sm:h-12 mr-2 sm:mr-3" />
                                <h1 className="text-2xl sm:text-4xl font-bold">매출 관리</h1>
                            </div>
                            <p className="text-sm sm:text-xl max-w-2xl mx-auto px-4">
                                데이터 기반의 매출 분석과 시각화로 비즈니스 인사이트를 얻어보세요
                            </p>
                        </div>
                    </div>
                </section>

                <main className="container mx-auto px-4 py-4 sm:py-8 pb-20">
                    {/* 탭 네비게이션 */}
                    <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

                    {/* 에러 상태 표시 */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-red-600 text-sm">⚠️</span>
                                </div>
                                <div>
                                    <h4 className="text-red-800 font-medium">데이터 로딩 오류</h4>
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 필터 및 제어 패널 - 모바일 최적화 */}
                    <div className="bg-white rounded-lg border p-3 sm:p-6 mb-4 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* 빠른 기간 선택 버튼들 */}
                                <QuickDateButtons onDateRangeChange={setQuickDateRange} />

                                {/* 날짜 선택 */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">기간:</span>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="border rounded px-2 py-1 text-sm"
                                    />
                                    <span className="text-gray-500">~</span>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="border rounded px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={exportToCSV}
                                disabled={revenueData.length === 0}
                                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                <Download className="w-4 h-4" />
                                데이터 내보내기
                            </button>
                        </div>
                    </div>

                    {/* 탭 컨텐츠 - Suspense로 lazy loading */}
                    <Suspense fallback={<LoadingSpinner />}>
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 sm:space-y-8">
                                <RevenueDashboard stats={stats} loading={loading} error={error} />

                                {/* 기본 차트 */}
                                {chartData.length > 0 && (
                                    <div className="bg-white rounded-lg border p-4 sm:p-6">
                                        <h3 className="text-lg font-semibold mb-4">월별 매출 추이</h3>
                                        <div className="h-64 sm:h-96">
                                            <RevenueChart
                                                data={chartData}
                                                config={{
                                                    id: 'overview-chart',
                                                    type: 'line',
                                                    title: '',
                                                    dataKey: 'total',
                                                    categories: ['total'],
                                                    aggregation: 'sum',
                                                    position: { row: 1, col: 1, rowSpan: 1, colSpan: 1 }
                                                }}
                                                categories={['total']}
                                                categoryColors={{ total: '#3B82F6' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'charts' && (
                            <ChartAnalysis
                                data={chartData}
                                categories={categories}
                                categoryColors={categoryColors}
                            />
                        )}

                        {activeTab === 'input' && (
                            <DataInput
                                categories={categories}
                                onDataSubmit={addBulkRevenueData}
                                loading={loading}
                            />
                        )}

                        {activeTab === 'manage' && (
                            <DataTable
                                data={revenueData}
                                categories={categories}
                                loading={loading}
                                onEdit={updateRevenueData}
                                onDelete={deleteRevenueData}
                                onBulkDelete={deleteSelectedRevenueData}
                                onRefresh={() => fetchRevenueData(dateRange)}
                            />
                        )}
                    </Suspense>

                    {/* 데이터가 없을 때 안내 */}
                    {revenueData.length === 0 && !loading && !error && (
                        <div className="bg-white rounded-lg border p-8 sm:p-12 text-center">
                            <Coins className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">매출 데이터가 없습니다</h3>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">
                                데이터 입력 탭에서 매출 정보를 추가하여 분석을 시작해보세요.
                            </p>
                            <button
                                onClick={() => setActiveTab('input')}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                            >
                                데이터 입력하기
                            </button>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </AdminOnly>
    );
};

export default React.memo(RevenueManagement);