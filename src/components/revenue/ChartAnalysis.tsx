import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, AreaChart, Settings, Plus, X, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { ChartData, RevenueCategory } from '@/types/revenue';
import RevenueChart from './RevenueChart';

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
}

const ChartAnalysis: React.FC<ChartAnalysisProps> = ({
    data,
    categories,
    categoryColors
}) => {
    const [charts, setCharts] = useState<ChartConfig[]>([
        {
            id: 'overview',
            type: 'line',
            title: '전체 매출 추이',
            timeRange: 'monthly',
            selectedCategories: ['total'],
            visible: true
        },
        {
            id: 'category-pie',
            type: 'pie',
            title: '카테고리별 매출 비중',
            timeRange: 'monthly',
            selectedCategories: categories.map(c => c.name),
            visible: true
        },
        {
            id: 'category-trend',
            type: 'area',
            title: '카테고리별 매출 트렌드',
            timeRange: 'monthly',
            selectedCategories: categories.map(c => c.name),
            visible: true
        },
        {
            id: 'growth-analysis',
            type: 'bar',
            title: '월별 성장률 분석',
            timeRange: 'monthly',
            selectedCategories: ['total'],
            visible: true
        },
        {
            id: 'top-products',
            type: 'bar',
            title: '주요 제품 매출 분석',
            timeRange: 'monthly',
            selectedCategories: categories.slice(0, 5).map(c => c.name),
            visible: true
        },
        {
            id: 'seasonal-pattern',
            type: 'line',
            title: '계절별 매출 패턴',
            timeRange: 'monthly',
            selectedCategories: ['total'],
            visible: true
        }
    ]);

    const [isAddingChart, setIsAddingChart] = useState(false);
    const [newChart, setNewChart] = useState<Partial<ChartConfig>>({
        type: 'line',
        title: '',
        timeRange: 'monthly',
        selectedCategories: []
    });

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
            visible: true
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

    const getProcessedData = (chart: ChartConfig) => {
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
                // 일별 데이터는 그대로 사용
                return processedData;
            }
            case 'weekly': {
                // 주별로 그룹화
                const weeklyData = processedData.reduce((acc, item) => {
                    const date = new Date(item.date);
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    const weekKey = weekStart.toISOString().split('T')[0];

                    if (!acc[weekKey]) {
                        acc[weekKey] = { date: weekKey, total: 0 };
                        categories.forEach(cat => {
                            acc[weekKey][cat.name] = 0;
                        });
                    }

                    // 각 카테고리별 값 합산
                    categories.forEach(cat => {
                        if (typeof item[cat.name] === 'number') {
                            acc[weekKey][cat.name] = (acc[weekKey][cat.name] as number) + (item[cat.name] as number);
                        }
                    });

                    if (typeof item.total === 'number') {
                        acc[weekKey].total = (acc[weekKey].total as number) + (item.total as number);
                    }

                    return acc;
                }, {} as Record<string, ChartData>);

                return Object.values(weeklyData).sort((a, b) => a.date.localeCompare(b.date));
            }
            case 'monthly': {
                // 월별로 그룹화
                const monthlyData = processedData.reduce((acc, item) => {
                    const date = new Date(item.date);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    if (!acc[monthKey]) {
                        acc[monthKey] = { date: monthKey, total: 0 };
                        categories.forEach(cat => {
                            acc[monthKey][cat.name] = 0;
                        });
                    }

                    // 각 카테고리별 값 합산
                    categories.forEach(cat => {
                        if (typeof item[cat.name] === 'number') {
                            acc[monthKey][cat.name] = (acc[monthKey][cat.name] as number) + (item[cat.name] as number);
                        }
                    });

                    if (typeof item.total === 'number') {
                        acc[monthKey].total = (acc[monthKey].total as number) + (item.total as number);
                    }

                    return acc;
                }, {} as Record<string, ChartData>);

                return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
            }
            default:
                return processedData;
        }
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

                {/* 차트 관리 패널 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {charts.map(chart => (
                        <div key={chart.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-900">{chart.title}</h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleChartVisibility(chart.id)}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                        title={chart.visible ? '숨기기' : '보이기'}
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
            </div>

            {/* 차트 그리드 */}
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

                        <div className="h-80">
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
                            <div className="flex flex-wrap gap-2">
                                <label className="flex items-center gap-1 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={chart.selectedCategories.includes('total')}
                                        onChange={(e) => {
                                            const newCategories = e.target.checked
                                                ? [...chart.selectedCategories.filter(c => c !== 'total'), 'total']
                                                : chart.selectedCategories.filter(c => c !== 'total');
                                            updateChart(chart.id, { selectedCategories: newCategories });
                                        }}
                                        className="rounded"
                                    />
                                    <span className="inline-block w-3 h-3 rounded bg-blue-500 mr-1"></span>
                                    전체
                                </label>
                                {categories.map(category => (
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
                                        {category.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 차트 추가 모달 */}
            {isAddingChart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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