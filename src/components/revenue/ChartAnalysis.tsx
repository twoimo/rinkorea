import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, AreaChart, Plus, X, Eye, EyeOff, Maximize2, Package } from 'lucide-react';
import { ChartData, RevenueCategory } from '@/types/revenue';
import RevenueChart from './RevenueChart';
import { useLanguage } from '@/contexts/LanguageContext';


interface ChartAnalysisProps {
    data: ChartData[];
    categories: RevenueCategory[];
    categoryColors: Record<string, string>;
}

type ChartType = 'line' | 'area' | 'bar' | 'pie';
type TimeRange = 'daily' | 'weekly' | 'monthly';

interface ChartConfig {
    id: string;
    type: ChartType;
    title: string;
    timeRange: TimeRange;
    selectedCategories: string[];
    visible: boolean;
    productFilter?: string; // 제품별 필터 추가
}

// 확장된 ChartData 타입 (total 속성 포함)
interface ExtendedChartData extends ChartData {
    total?: number;
}

// 제품별 데이터 타입
interface ProductAnalysis {
    product_name: string;
    category: string;
    totalRevenue: number;
    totalQuantity: number;
    avgUnitPrice: number;
    transactionCount: number;
    growth: number;
    monthlyData: {
        month: string;
        revenue: number;
        quantity: number;
        avgPrice: number;
    }[];
    customerSegments: {
        segment: string;
        revenue: number;
        percentage: number;
    }[];
    seasonalTrends: {
        season: string;
        revenue: number;
        growth: number;
    }[];
}

const ChartAnalysis: React.FC<ChartAnalysisProps> = ({
    data,
    categories,
    categoryColors
}) => {
    const { t } = useLanguage();

    // localStorage에서 차트 가시성 상태 로드
    const loadChartVisibility = (): Record<string, boolean> => {
        try {
            const saved = localStorage.getItem('chartVisibility');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    };

    // localStorage에 차트 가시성 상태 저장
    const saveChartVisibility = (visibility: Record<string, boolean>) => {
        try {
            localStorage.setItem('chartVisibility', JSON.stringify(visibility));
        } catch {
            // localStorage 사용 불가능한 경우 무시
        }
    };

    const savedVisibility = loadChartVisibility();

    const [charts, setCharts] = useState<ChartConfig[]>([
        {
            id: 'overview',
            type: 'line',
            title: '전체 매출 추이',
            timeRange: 'monthly',
            selectedCategories: ['total'],
            visible: savedVisibility['overview'] !== false // 기본값은 true
        },
        {
            id: 'category-pie',
            type: 'pie',
            title: '카테고리별 매출 비중',
            timeRange: 'monthly',
            selectedCategories: categories.map(c => c.name),
            visible: savedVisibility['category-pie'] !== false
        },
        {
            id: 'category-trend',
            type: 'area',
            title: '카테고리별 매출 트렌드',
            timeRange: 'monthly',
            selectedCategories: categories.map(c => c.name),
            visible: savedVisibility['category-trend'] !== false
        },
        {
            id: 'growth-analysis',
            type: 'bar',
            title: '월별 성장률 분석',
            timeRange: 'monthly',
            selectedCategories: ['total'],
            visible: savedVisibility['growth-analysis'] !== false
        },
        {
            id: 'top-products',
            type: 'bar',
            title: '주요 제품 매출 분석',
            timeRange: 'monthly',
            selectedCategories: categories.slice(0, 5).map(c => c.name),
            visible: savedVisibility['top-products'] !== false
        },
        {
            id: 'product-performance',
            type: 'bar',
            title: '제품별 성과 비교',
            timeRange: 'monthly',
            selectedCategories: categories.map(c => c.name),
            visible: savedVisibility['product-performance'] !== false
        },
        {
            id: 'seasonal-pattern',
            type: 'line',
            title: '계절별 매출 패턴',
            timeRange: 'monthly',
            selectedCategories: ['total'],
            visible: savedVisibility['seasonal-pattern'] !== false
        },
        {
            id: 'product-trend-analysis',
            type: 'area',
            title: '제품별 트렌드 분석',
            timeRange: 'monthly',
            selectedCategories: ['제품 매출'],
            visible: savedVisibility['product-trend-analysis'] !== false
        }
    ]);

    const [isAddingChart, setIsAddingChart] = useState(false);
    const [newChart, setNewChart] = useState<Partial<ChartConfig>>({
        type: 'line',
        title: '',
        timeRange: 'monthly',
        selectedCategories: []
    });

    // 제품 분석 탭 상태
    const [activeAnalysisTab, setActiveAnalysisTab] = useState<'charts' | 'products'>('charts');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [productAnalysisData, setProductAnalysisData] = useState<ProductAnalysis[]>([]);

    // 차트 가시성 변경 시 localStorage에 저장
    useEffect(() => {
        const visibility = charts.reduce((acc, chart) => {
            acc[chart.id] = chart.visible;
            return acc;
        }, {} as Record<string, boolean>);
        saveChartVisibility(visibility);
    }, [charts]);

    // 제품 분석 데이터 생성
    useEffect(() => {
        if (data && data.length > 0) {
            generateProductAnalysis();
        }
    }, [data]);

    const generateProductAnalysis = () => {
        // 원본 매출 데이터에서 제품별 분석 생성 (실제 구현에서는 useRevenue 훅에서 제품별 데이터를 가져와야 함)
        // 여기서는 예시 데이터 생성
        const mockProductData: ProductAnalysis[] = [
            {
                product_name: 'RIN-COAT',
                category: '제품 매출',
                totalRevenue: 15000000,
                totalQuantity: 500,
                avgUnitPrice: 30000,
                transactionCount: 45,
                growth: 12.5,
                monthlyData: [
                    { month: '2022-01', revenue: 1000000, quantity: 100, avgPrice: 10000 },
                    { month: '2022-02', revenue: 2000000, quantity: 200, avgPrice: 10000 }
                ],
                customerSegments: [
                    { segment: '기업', revenue: 10000000, percentage: 66.7 },
                    { segment: '개인', revenue: 5000000, percentage: 33.3 }
                ],
                seasonalTrends: [
                    { season: '봄', revenue: 5000000, growth: 10 },
                    { season: '여름', revenue: 5000000, growth: 20 },
                    { season: '가을', revenue: 3000000, growth: -10 },
                    { season: '겨울', revenue: 2000000, growth: -20 }
                ]
            },
            {
                product_name: 'RIN-SEAL PLUS',
                category: '제품 매출',
                totalRevenue: 12000000,
                totalQuantity: 400,
                avgUnitPrice: 30000,
                transactionCount: 38,
                growth: 8.3,
                monthlyData: [
                    { month: '2022-01', revenue: 800000, quantity: 80, avgPrice: 10000 },
                    { month: '2022-02', revenue: 1600000, quantity: 160, avgPrice: 10000 }
                ],
                customerSegments: [
                    { segment: '기업', revenue: 8000000, percentage: 66.7 },
                    { segment: '개인', revenue: 4000000, percentage: 33.3 }
                ],
                seasonalTrends: [
                    { season: '봄', revenue: 3000000, growth: 10 },
                    { season: '여름', revenue: 4000000, growth: 20 },
                    { season: '가을', revenue: 2000000, growth: -10 },
                    { season: '겨울', revenue: 3000000, growth: -20 }
                ]
            },
            {
                product_name: '950GT',
                category: '건설기계 매출',
                totalRevenue: 25000000,
                totalQuantity: 10,
                avgUnitPrice: 2500000,
                transactionCount: 15,
                growth: 15.7,
                monthlyData: [
                    { month: '2022-01', revenue: 10000000, quantity: 4, avgPrice: 2500000 },
                    { month: '2022-02', revenue: 15000000, quantity: 6, avgPrice: 2500000 }
                ],
                customerSegments: [
                    { segment: '기업', revenue: 20000000, percentage: 80 },
                    { segment: '개인', revenue: 5000000, percentage: 20 }
                ],
                seasonalTrends: [
                    { season: '봄', revenue: 5000000, growth: 10 },
                    { season: '여름', revenue: 10000000, growth: 20 },
                    { season: '가을', revenue: 5000000, growth: -10 },
                    { season: '겨울', revenue: 5000000, growth: -20 }
                ]
            },
            {
                product_name: 'RIN-HARD PLUS',
                category: '제품 매출',
                totalRevenue: 8500000,
                totalQuantity: 300,
                avgUnitPrice: 28333,
                transactionCount: 32,
                growth: -2.1,
                monthlyData: [
                    { month: '2022-01', revenue: 4000000, quantity: 200, avgPrice: 20000 },
                    { month: '2022-02', revenue: 4500000, quantity: 250, avgPrice: 18000 }
                ],
                customerSegments: [
                    { segment: '기업', revenue: 5000000, percentage: 58.8 },
                    { segment: '개인', revenue: 3500000, percentage: 41.2 }
                ],
                seasonalTrends: [
                    { season: '봄', revenue: 2000000, growth: 10 },
                    { season: '여름', revenue: 3000000, growth: 20 },
                    { season: '가을', revenue: 2000000, growth: -10 },
                    { season: '겨울', revenue: 1500000, growth: -20 }
                ]
            },
            {
                product_name: '850GT',
                category: '건설기계 매출',
                totalRevenue: 18000000,
                totalQuantity: 8,
                avgUnitPrice: 2250000,
                transactionCount: 12,
                growth: 20.4,
                monthlyData: [
                    { month: '2022-01', revenue: 9000000, quantity: 4, avgPrice: 2250000 },
                    { month: '2022-02', revenue: 9000000, quantity: 4, avgPrice: 2250000 }
                ],
                customerSegments: [
                    { segment: '기업', revenue: 15000000, percentage: 83.3 },
                    { segment: '개인', revenue: 3000000, percentage: 16.7 }
                ],
                seasonalTrends: [
                    { season: '봄', revenue: 4500000, growth: 10 },
                    { season: '여름', revenue: 4500000, growth: 20 },
                    { season: '가을', revenue: 4500000, growth: -10 },
                    { season: '겨울', revenue: 4500000, growth: -20 }
                ]
            }
        ];
        // Sort by revenue in descending order and take top 5
        const sortedProducts = [...mockProductData].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
        setProductAnalysisData(sortedProducts);
    };

    const chartTypeOptions = [
        { value: 'line', label: '선 그래프', icon: TrendingUp },
        { value: 'area', label: '영역 그래프', icon: AreaChart },
        { value: 'bar', label: '막대 그래프', icon: BarChart3 },
        { value: 'pie', label: '원형 그래프', icon: PieChart }
    ];

    const timeRangeOptions = [
        { value: 'daily', label: '일별' },
        { value: 'weekly', label: '주별' },
        { value: 'monthly', label: '월별' }
    ];

    const addChart = () => {
        if (!newChart.title) return;

        const chart: ChartConfig = {
            id: Date.now().toString(),
            type: newChart.type as ChartType,
            title: newChart.title,
            timeRange: newChart.timeRange as TimeRange,
            selectedCategories: newChart.selectedCategories || [],
            visible: true,
            productFilter: newChart.productFilter
        };

        setCharts(prev => [...prev, chart]);
        setNewChart({
            type: 'line',
            title: '',
            timeRange: 'monthly',
            selectedCategories: []
        });
        setIsAddingChart(false);
    };

    const updateChart = (id: string, updates: Partial<ChartConfig>) => {
        setCharts(prev => prev.map(chart =>
            chart.id === id ? { ...chart, ...updates } : chart
        ));
    };

    const removeChart = (id: string) => {
        setCharts(prev => prev.filter(chart => chart.id !== id));
    };

    const toggleChartVisibility = (id: string) => {
        updateChart(id, { visible: !charts.find(c => c.id === id)?.visible });
    };

    const getProcessedData = (chart: ChartConfig): ExtendedChartData[] => {
        // useRevenue 훅의 getChartData 함수를 사용하여 시간 범위별 데이터 처리
        if (!data || data.length === 0) return [];

        // 현재 데이터가 이미 처리된 ChartData 형식이므로 시간 범위에 맞게 재그룹화
        const processedData = data.map(item => ({
            ...item,
            date: item.date
        }));

        // 시간 범위에 따른 데이터 재그룹화
        switch (chart.timeRange) {
            case 'daily': {
                // 일별 데이터는 그대로 사용하되 total 계산
                return processedData.map(item => {
                    const total = categories.reduce((sum, cat) => {
                        const value = item[cat.name];
                        return sum + (typeof value === 'number' ? value : 0);
                    }, 0);
                    return { ...item, total };
                });
            }
            case 'weekly': {
                // 주별로 그룹화
                const weeklyData = processedData.reduce((acc, item) => {
                    const date = new Date(item.date);
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    const weekKey = weekStart.toISOString().split('T')[0];

                    if (!acc[weekKey]) {
                        acc[weekKey] = { date: weekKey, total: 0 } as ExtendedChartData;
                        categories.forEach(cat => {
                            (acc[weekKey] as Record<string, number | string>)[cat.name] = 0;
                        });
                    }

                    // 각 카테고리별 값 합산
                    categories.forEach(cat => {
                        if (typeof item[cat.name] === 'number') {
                            const currentData = acc[weekKey] as Record<string, number | string>;
                            const currentValue = typeof currentData[cat.name] === 'number' ? currentData[cat.name] : 0;
                            currentData[cat.name] = (currentValue as number) + (item[cat.name] as number);
                        }
                    });

                    // total 계산
                    const total = categories.reduce((sum, cat) => {
                        const value = item[cat.name];
                        return sum + (typeof value === 'number' ? value : 0);
                    }, 0);
                    acc[weekKey].total = (acc[weekKey].total || 0) + total;

                    return acc;
                }, {} as Record<string, ExtendedChartData>);

                return Object.values(weeklyData).sort((a, b) => a.date.localeCompare(b.date));
            }
            case 'monthly': {
                // 월별로 그룹화
                const monthlyData = processedData.reduce((acc, item) => {
                    const date = new Date(item.date);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    if (!acc[monthKey]) {
                        acc[monthKey] = { date: monthKey, total: 0 } as ExtendedChartData;
                        categories.forEach(cat => {
                            (acc[monthKey] as Record<string, number | string>)[cat.name] = 0;
                        });
                    }

                    // 각 카테고리별 값 합산
                    categories.forEach(cat => {
                        if (typeof item[cat.name] === 'number') {
                            const currentData = acc[monthKey] as Record<string, number | string>;
                            const currentValue = typeof currentData[cat.name] === 'number' ? currentData[cat.name] : 0;
                            currentData[cat.name] = (currentValue as number) + (item[cat.name] as number);
                        }
                    });

                    // total 계산
                    const total = categories.reduce((sum, cat) => {
                        const value = item[cat.name];
                        return sum + (typeof value === 'number' ? value : 0);
                    }, 0);
                    acc[monthKey].total = (acc[monthKey].total || 0) + total;

                    return acc;
                }, {} as Record<string, ExtendedChartData>);

                return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
            }
            default:
                return processedData.map(item => {
                    const total = categories.reduce((sum, cat) => {
                        const value = item[cat.name];
                        return sum + (typeof value === 'number' ? value : 0);
                    }, 0);
                    return { ...item, total };
                });
        }
    };

    // 범례가 많을 때 접을 수 있는 기능
    const [expandedLegends, setExpandedLegends] = useState<Record<string, boolean>>({});

    const toggleLegendExpansion = (chartId: string) => {
        setExpandedLegends(prev => ({
            ...prev,
            [chartId]: !prev[chartId]
        }));
    };

    const renderCategoryCheckboxes = (chart: ChartConfig, isInModal = false) => {
        const maxVisibleItems = isInModal ? 10 : 6;
        const allCategories = [
            { id: 'total', name: 'total', color: '#3b82f6' },
            ...categories.map(cat => ({ id: cat.id, name: cat.name, color: cat.color }))
        ];

        const isExpanded = expandedLegends[chart.id];
        const visibleCategories = isExpanded ? allCategories : allCategories.slice(0, maxVisibleItems);
        const hasMore = allCategories.length > maxVisibleItems;

        return (
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    {visibleCategories.map(category => (
                        <label key={category.id} className="flex items-center gap-1 text-sm">
                            <input
                                type="checkbox"
                                checked={chart.selectedCategories.includes(category.name)}
                                onChange={(e) => {
                                    const newCategories = e.target.checked
                                        ? [...chart.selectedCategories, category.name]
                                        : chart.selectedCategories.filter(c => c !== category.name);
                                    updateChart(chart.id, { selectedCategories: newCategories });
                                }}
                                className="rounded"
                            />
                            <span
                                className="inline-block w-3 h-3 rounded mr-1"
                                style={{ backgroundColor: category.color }}
                            ></span>
                            {category.name === 'total' ? '전체' : category.name}
                        </label>
                    ))}
                </div>
                {hasMore && !isInModal && (
                    <button
                        onClick={() => toggleLegendExpansion(chart.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                    >
                        {isExpanded ? `접기 (${allCategories.length - maxVisibleItems}개 숨김)` : `더보기 (${allCategories.length - maxVisibleItems}개 더)`}
                    </button>
                )}
            </div>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('ko-KR').format(value);
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">차트 분석</h2>
                        <p className="text-gray-600">다양한 차트로 매출 데이터를 분석해보세요</p>
                    </div>
                    <button
                        onClick={() => setIsAddingChart(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        차트 추가
                    </button>
                </div>

                {/* 분석 탭 선택 */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveAnalysisTab('charts')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeAnalysisTab === 'charts'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <BarChart3 className="w-4 h-4 inline mr-2" />
                        차트 분석
                    </button>
                    <button
                        onClick={() => setActiveAnalysisTab('products')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeAnalysisTab === 'products'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Package className="w-4 h-4 inline mr-2" />
                        제품별 분석
                    </button>
                </div>

                {/* 차트 관리 패널 */}
                {activeAnalysisTab === 'charts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {charts.map(chart => (
                            <div key={chart.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-gray-900">{chart.title}</h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => toggleChartVisibility(chart.id)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                            title={chart.visible ? t('hide', '숨기기') : t('show', '보이기')}
                                        >
                                            {chart.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => removeChart(chart.id)}
                                            className="p-1 text-red-500 hover:text-red-700"
                                            title="삭제"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div>유형: {chartTypeOptions.find(opt => opt.value === chart.type)?.label}</div>
                                    <div>기간: {timeRangeOptions.find(opt => opt.value === chart.timeRange)?.label}</div>
                                    <div>카테고리: {chart.selectedCategories.length}개</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 제품별 분석 패널 */}
                {activeAnalysisTab === 'products' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {productAnalysisData.map((product, index) => (
                                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900 truncate">{product.product_name}</h3>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">매출:</span>
                                            <span className="font-medium">{formatCurrency(product.totalRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">판매량:</span>
                                            <span className="font-medium">{formatNumber(product.totalQuantity)}개</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">평균단가:</span>
                                            <span className="font-medium">{formatCurrency(product.avgUnitPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">성장률:</span>
                                            <span className={`font-medium ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {product.growth >= 0 ? '+' : ''}{product.growth.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProduct(product.product_name)}
                                        className="w-full mt-3 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        상세 분석
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 차트 그리드 */}
            {activeAnalysisTab === 'charts' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {charts.filter(chart => chart.visible).map(chart => (
                        <div key={chart.id} className="bg-white rounded-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{chart.title}</h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={chart.timeRange}
                                        onChange={(e) => updateChart(chart.id, { timeRange: e.target.value as TimeRange })}
                                        className="text-sm border rounded px-2 py-1"
                                    >
                                        {timeRangeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                        title="전체화면"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-96">
                                <RevenueChart
                                    data={getProcessedData(chart)}
                                    config={{
                                        id: chart.id,
                                        type: chart.type,
                                        title: '',
                                        dataKey: chart.selectedCategories.includes('total') ? 'total' : chart.selectedCategories[0] || 'total',
                                        categories: chart.selectedCategories,
                                        aggregation: 'sum',
                                        position: { row: 1, col: 1, rowSpan: 1, colSpan: 1 }
                                    }}
                                    categories={chart.selectedCategories}
                                    categoryColors={categoryColors}
                                />
                            </div>

                            {/* 차트별 카테고리 선택 */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-600 mb-2">표시 카테고리:</div>
                                {renderCategoryCheckboxes(chart)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 제품별 상세 분석 */}
            {activeAnalysisTab === 'products' && selectedProduct && (
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">{selectedProduct} 상세 분석</h3>
                        <button
                            onClick={() => setSelectedProduct('')}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 제품별 월별 매출 트렌드 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-4">월별 매출 트렌드</h4>
                            <div className="h-96">
                                <RevenueChart
                                    data={getProcessedData({
                                        id: 'product-trend',
                                        type: 'line',
                                        title: '',
                                        timeRange: 'monthly',
                                        selectedCategories: ['total'],
                                        visible: true,
                                        productFilter: selectedProduct
                                    })}
                                    config={{
                                        id: 'product-trend',
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

                        {/* 제품별 성과 지표 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-4">성과 지표</h4>
                            <div className="space-y-3">
                                {productAnalysisData
                                    .filter(p => p.product_name === selectedProduct)
                                    .map((product, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex justify-between items-center p-3 bg-white rounded border">
                                                    <span className="text-gray-600">총 매출</span>
                                                    <span className="font-semibold text-lg">{formatCurrency(product.totalRevenue)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white rounded border">
                                                    <span className="text-gray-600">총 판매량</span>
                                                    <span className="font-semibold">{formatNumber(product.totalQuantity)}개</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white rounded border">
                                                    <span className="text-gray-600">평균 단가</span>
                                                    <span className="font-semibold">{formatCurrency(product.avgUnitPrice)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white rounded border">
                                                    <span className="text-gray-600">거래 건수</span>
                                                    <span className="font-semibold">{product.transactionCount}건</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white rounded border">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">성장률</span>
                                                    <span className={`font-semibold text-lg ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {product.growth >= 0 ? '+' : ''}{product.growth.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="mt-2 pt-2 border-t">
                                                    <div className="text-sm text-gray-500">전월 대비 성과</div>
                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                        <div className="text-center">
                                                            <div className="text-xs text-gray-500">매출 변화</div>
                                                            <div className={`text-sm font-medium ${product.monthlyData[0].revenue >= product.monthlyData[1].revenue ? 'text-green-600' : 'text-red-600'}`}>
                                                                {((product.monthlyData[0].revenue - product.monthlyData[1].revenue) / product.monthlyData[1].revenue * 100).toFixed(1)}%
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs text-gray-500">수량 변화</div>
                                                            <div className={`text-sm font-medium ${product.monthlyData[0].quantity >= product.monthlyData[1].quantity ? 'text-green-600' : 'text-red-600'}`}>
                                                                {((product.monthlyData[0].quantity - product.monthlyData[1].quantity) / product.monthlyData[1].quantity * 100).toFixed(1)}%
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs text-gray-500">단가 변화</div>
                                                            <div className={`text-sm font-medium ${product.monthlyData[0].avgPrice >= product.monthlyData[1].avgPrice ? 'text-green-600' : 'text-red-600'}`}>
                                                                {((product.monthlyData[0].avgPrice - product.monthlyData[1].avgPrice) / product.monthlyData[1].avgPrice * 100).toFixed(1)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* 고객 세그먼트 분석 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-4">고객 세그먼트 분석</h4>
                            <div className="space-y-3">
                                {productAnalysisData
                                    .filter(p => p.product_name === selectedProduct)
                                    .map(product => product.customerSegments)
                                    .flat()
                                    .map((segment, index) => (
                                        <div key={index} className="flex items-center p-3 bg-white rounded border">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{segment.segment}</div>
                                                <div className="text-xs text-gray-500">{formatCurrency(segment.revenue)}</div>
                                            </div>
                                            <div className="w-24 text-right">
                                                <div className="text-sm font-medium">{segment.percentage.toFixed(1)}%</div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full"
                                                        style={{ width: `${segment.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* 계절성 트렌드 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-4">계절성 트렌드</h4>
                            <div className="space-y-3">
                                {productAnalysisData
                                    .filter(p => p.product_name === selectedProduct)
                                    .map(product => product.seasonalTrends)
                                    .flat()
                                    .map((season, index) => (
                                        <div key={index} className="flex items-center p-3 bg-white rounded border">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{season.season}</div>
                                                <div className="text-xs text-gray-500">{formatCurrency(season.revenue)}</div>
                                            </div>
                                            <div className={`text-sm font-medium ${season.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {season.growth >= 0 ? '+' : ''}{season.growth.toFixed(1)}%
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 차트 추가 모달 */}
            {isAddingChart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[120]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">새 차트 추가</h3>
                            <button
                                onClick={() => setIsAddingChart(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    차트 제목
                                </label>
                                <input
                                    type="text"
                                    value={newChart.title || ''}
                                    onChange={(e) => setNewChart(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="차트 제목을 입력하세요"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    차트 유형
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {chartTypeOptions.map(option => {
                                        const IconComponent = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => setNewChart(prev => ({ ...prev, type: option.value as ChartType }))}
                                                className={`p-3 border rounded-lg text-sm flex items-center gap-2 transition-colors ${newChart.type === option.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    시간 범위
                                </label>
                                <select
                                    value={newChart.timeRange || 'monthly'}
                                    onChange={(e) => setNewChart(prev => ({ ...prev, timeRange: e.target.value as TimeRange }))}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    {timeRangeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    표시할 카테고리
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newChart.selectedCategories?.includes('total') || false}
                                            onChange={(e) => {
                                                const current = newChart.selectedCategories || [];
                                                const updated = e.target.checked
                                                    ? [...current.filter(c => c !== 'total'), 'total']
                                                    : current.filter(c => c !== 'total');
                                                setNewChart(prev => ({ ...prev, selectedCategories: updated }));
                                            }}
                                            className="rounded"
                                        />
                                        <span className="inline-block w-3 h-3 rounded bg-blue-500"></span>
                                        <span className="text-sm">전체</span>
                                    </label>
                                    {categories.map(category => (
                                        <label key={category.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newChart.selectedCategories?.includes(category.name) || false}
                                                onChange={(e) => {
                                                    const current = newChart.selectedCategories || [];
                                                    const updated = e.target.checked
                                                        ? [...current, category.name]
                                                        : current.filter(c => c !== category.name);
                                                    setNewChart(prev => ({ ...prev, selectedCategories: updated }));
                                                }}
                                                className="rounded"
                                            />
                                            <span
                                                className="inline-block w-3 h-3 rounded"
                                                style={{ backgroundColor: category.color }}
                                            ></span>
                                            <span className="text-sm">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsAddingChart(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={addChart}
                                disabled={!newChart.title}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartAnalysis;