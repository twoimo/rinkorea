import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Download, BarChart3, Coins } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserRole } from '@/hooks/useUserRole';
import { useRevenue } from '@/hooks/useRevenue';
import RevenueDashboard from '@/components/revenue/RevenueDashboard';
import ChartGrid from '@/components/revenue/ChartGrid';
import DataInput from '@/components/revenue/DataInput';
import DataTable from '@/components/revenue/DataTable';
import { GridLayout, ChartConfig } from '@/types/revenue';
import AdminOnly from '@/components/AdminOnly';
import RevenueChart from '@/components/revenue/RevenueChart';
import ChartAnalysis from '@/components/revenue/ChartAnalysis';

const RevenueManagement = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: roleLoading } = useUserRole();
    const {
        revenueData,
        categories,
        loading,
        stats,
        fetchRevenueData,
        getChartData,
        addBulkRevenueData,
        updateRevenueData,
        deleteRevenueData,
        deleteSelectedRevenueData
    } = useRevenue();

    const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'input' | 'manage'>('dashboard');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1년 전
        end: new Date().toISOString().split('T')[0] // 오늘
    });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [chartLayout, setChartLayout] = useState<GridLayout>({
        rows: 2,
        cols: 2,
        charts: [
            {
                id: 'main-chart',
                type: 'line',
                title: '월별 매출 추이',
                dataKey: 'total',
                categories: [],
                aggregation: 'sum',
                position: { row: 1, col: 1, rowSpan: 1, colSpan: 2 }
            },
            {
                id: 'category-chart',
                type: 'pie',
                title: '카테고리별 매출 비중',
                dataKey: 'category',
                categories: [],
                aggregation: 'sum',
                position: { row: 2, col: 1, rowSpan: 1, colSpan: 1 }
            },
            {
                id: 'trend-chart',
                type: 'area',
                title: '카테고리별 매출 변화',
                dataKey: 'monthly',
                categories: [],
                aggregation: 'sum',
                position: { row: 2, col: 2, rowSpan: 1, colSpan: 1 }
            }
        ]
    });

    // 빠른 기간 선택 함수
    const setQuickDateRange = (period: '1d' | '7d' | '1m' | '3m' | '6m' | '1y' | '3y' | '5y' | '10y') => {
        const end = new Date().toISOString().split('T')[0];
        let start: string;

        const today = new Date();
        switch (period) {
            case '1d': {
                start = end; // 오늘
                break;
            }
            case '7d': {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                start = sevenDaysAgo.toISOString().split('T')[0];
                break;
            }
            case '1m': {
                const oneMonthAgo = new Date(today);
                oneMonthAgo.setMonth(today.getMonth() - 1);
                start = oneMonthAgo.toISOString().split('T')[0];
                break;
            }
            case '3m': {
                const threeMonthsAgo = new Date(today);
                threeMonthsAgo.setMonth(today.getMonth() - 3);
                start = threeMonthsAgo.toISOString().split('T')[0];
                break;
            }
            case '6m': {
                const sixMonthsAgo = new Date(today);
                sixMonthsAgo.setMonth(today.getMonth() - 6);
                start = sixMonthsAgo.toISOString().split('T')[0];
                break;
            }
            case '1y': {
                const oneYearAgo = new Date(today);
                oneYearAgo.setFullYear(today.getFullYear() - 1);
                start = oneYearAgo.toISOString().split('T')[0];
                break;
            }
            case '3y': {
                const threeYearsAgo = new Date(today);
                threeYearsAgo.setFullYear(today.getFullYear() - 3);
                start = threeYearsAgo.toISOString().split('T')[0];
                break;
            }
            case '5y': {
                const fiveYearsAgo = new Date(today);
                fiveYearsAgo.setFullYear(today.getFullYear() - 5);
                start = fiveYearsAgo.toISOString().split('T')[0];
                break;
            }
            case '10y': {
                const tenYearsAgo = new Date(today);
                tenYearsAgo.setFullYear(today.getFullYear() - 10);
                start = tenYearsAgo.toISOString().split('T')[0];
                break;
            }
            default:
                return;
        }

        setDateRange({ start, end });
    };

    // 관리자 권한 체크
    useEffect(() => {
        if (!roleLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, roleLoading, navigate]);

    // 카테고리 색상 매핑
    const categoryColors = categories.reduce((acc, category) => {
        acc[category.name] = category.color;
        return acc;
    }, {} as Record<string, string>);

    // 날짜 범위 변경 시 데이터 다시 로드
    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            fetchRevenueData(dateRange);
        }
    }, [dateRange, fetchRevenueData]);

    // 차트 레이아웃 업데이트
    const handleLayoutChange = (newLayout: GridLayout) => {
        setChartLayout(newLayout);
        // 레이아웃을 로컬 스토리지에 저장
        localStorage.setItem('revenueChartLayout', JSON.stringify(newLayout));
    };

    // 로컬 스토리지에서 레이아웃 복원
    useEffect(() => {
        const savedLayout = localStorage.getItem('revenueChartLayout');
        if (savedLayout) {
            try {
                setChartLayout(JSON.parse(savedLayout));
            } catch (error) {
                console.error('차트 레이아웃 복원 실패:', error);
            }
        }
    }, []);

    // 차트 데이터 준비
    const chartData = getChartData(
        revenueData,
        'monthly',
        selectedCategories.length > 0 ? selectedCategories : categories.map(c => c.name)
    );

    // CSV 데이터 내보내기
    const exportToCSV = () => {
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
    };

    if (roleLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-lg">로딩 중...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <AdminOnly>
            <div className="min-h-screen bg-gray-50">
                <Header />

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <Coins className="w-12 h-12 mr-3" />
                                <h1 className="text-4xl font-bold">매출 관리</h1>
                            </div>
                            <p className="text-xl max-w-2xl mx-auto">
                                데이터 기반의 매출 분석과 시각화로 비즈니스 인사이트를 얻어보세요
                            </p>
                        </div>
                    </div>
                </section>

                <main className="container mx-auto px-4 py-8 pb-20">{/* 푸터와의 간격을 위해 pb-20 추가 */}
                    {/* 탭 네비게이션 */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-4 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'dashboard'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <BarChart3 className="w-5 h-5 inline mr-2" />
                                대시보드
                            </button>
                            <button
                                onClick={() => setActiveTab('charts')}
                                className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'charts'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <BarChart3 className="w-5 h-5 inline mr-2" />
                                차트 분석
                            </button>
                            <button
                                onClick={() => setActiveTab('input')}
                                className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'input'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Calendar className="w-5 h-5 inline mr-2" />
                                데이터 입력
                            </button>
                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'manage'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Calendar className="w-5 h-5 inline mr-2" />
                                데이터 편집
                            </button>
                        </div>
                    </div>

                    {/* 필터 및 제어 패널 */}
                    <div className="bg-white rounded-lg border p-6 mb-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* 빠른 기간 선택 버튼들 */}
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">빠른 선택:</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setQuickDateRange('1d')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            1일
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('7d')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            7일
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('1m')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            1개월
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('3m')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            3개월
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('6m')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            6개월
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('1y')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            1년
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('3y')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            3년
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('5y')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            5년
                                        </button>
                                        <button
                                            onClick={() => setQuickDateRange('10y')}
                                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            10년
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-700">기간:</span>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="border rounded px-3 py-2"
                                    />
                                    <span className="text-gray-500">~</span>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="border rounded px-3 py-2"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={exportToCSV}
                                disabled={revenueData.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
                                데이터 내보내기
                            </button>
                        </div>
                    </div>

                    {/* 탭 컨텐츠 */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            <RevenueDashboard stats={stats} loading={loading} />

                            {/* 기본 차트 */}
                            {chartData.length > 0 && (
                                <div className="bg-white rounded-lg border p-6">
                                    <h3 className="text-lg font-semibold mb-4">월별 매출 추이</h3>
                                    <div className="h-96">
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

                    {/* 데이터가 없을 때 안내 */}
                    {revenueData.length === 0 && !loading && (
                        <div className="bg-white rounded-lg border p-12 text-center">
                            <Coins className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">매출 데이터가 없습니다</h3>
                            <p className="text-gray-600 mb-6">
                                데이터 입력 탭에서 매출 정보를 추가하여 분석을 시작해보세요.
                            </p>
                            <button
                                onClick={() => setActiveTab('input')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default RevenueManagement;