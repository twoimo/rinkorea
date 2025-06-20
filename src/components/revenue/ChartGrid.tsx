import React, { useState } from 'react';
import { Grid, BarChart3, Settings, Plus, Trash2, Edit3 } from 'lucide-react';
import { ChartConfig, GridLayout } from '@/types/revenue';
import RevenueChart from './RevenueChart';
import { ChartData } from '@/types/revenue';

interface ChartGridProps {
    data: ChartData[];
    categories: string[];
    categoryColors: Record<string, string>;
    layout: GridLayout;
    onLayoutChange: (layout: GridLayout) => void;
}

const ChartGrid: React.FC<ChartGridProps> = ({
    data,
    categories,
    categoryColors,
    layout,
    onLayoutChange
}) => {
    const [isConfigMode, setIsConfigMode] = useState(false);
    const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);

    const gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
    const gridTemplateRows = `repeat(${layout.rows}, minmax(400px, 1fr))`;

    const handleAddChart = () => {
        const newChart: ChartConfig = {
            id: `chart-${Date.now()}`,
            type: 'line',
            title: '새 차트',
            dataKey: 'total',
            categories: categories,
            aggregation: 'sum',
            position: {
                row: 1,
                col: 1,
                rowSpan: 1,
                colSpan: 1
            }
        };

        const updatedLayout = {
            ...layout,
            charts: [...layout.charts, newChart]
        };

        onLayoutChange(updatedLayout);
    };

    const handleDeleteChart = (chartId: string) => {
        const updatedLayout = {
            ...layout,
            charts: layout.charts.filter(chart => chart.id !== chartId)
        };
        onLayoutChange(updatedLayout);
    };

    const handleEditChart = (chart: ChartConfig) => {
        setEditingChart(chart);
    };

    const handleSaveChart = (updatedChart: ChartConfig) => {
        const updatedLayout = {
            ...layout,
            charts: layout.charts.map(chart =>
                chart.id === updatedChart.id ? updatedChart : chart
            )
        };
        onLayoutChange(updatedLayout);
        setEditingChart(null);
    };

    const handleGridSizeChange = (rows: number, cols: number) => {
        const updatedLayout = {
            ...layout,
            rows,
            cols,
            charts: layout.charts.map(chart => ({
                ...chart,
                position: {
                    ...chart.position,
                    row: Math.min(chart.position.row, rows),
                    col: Math.min(chart.position.col, cols),
                    rowSpan: Math.min(chart.position.rowSpan, rows - chart.position.row + 1),
                    colSpan: Math.min(chart.position.colSpan, cols - chart.position.col + 1)
                }
            }))
        };
        onLayoutChange(updatedLayout);
    };

    const getGridItemStyle = (chart: ChartConfig) => {
        return {
            gridRow: `${chart.position.row} / span ${chart.position.rowSpan}`,
            gridColumn: `${chart.position.col} / span ${chart.position.colSpan}`
        };
    };

    return (
        <div className="space-y-4">
            {/* 그리드 설정 툴바 */}
            <div className="bg-white rounded-lg border p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsConfigMode(!isConfigMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isConfigMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        {isConfigMode ? '설정 완료' : '레이아웃 설정'}
                    </button>

                    {isConfigMode && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">그리드 크기:</span>
                                <select
                                    value={layout.rows}
                                    onChange={(e) => handleGridSizeChange(Number(e.target.value), layout.cols)}
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    <option value={1}>1행</option>
                                    <option value={2}>2행</option>
                                    <option value={3}>3행</option>
                                    <option value={4}>4행</option>
                                </select>
                                <span className="text-gray-500">×</span>
                                <select
                                    value={layout.cols}
                                    onChange={(e) => handleGridSizeChange(layout.rows, Number(e.target.value))}
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    <option value={1}>1열</option>
                                    <option value={2}>2열</option>
                                    <option value={3}>3열</option>
                                    <option value={4}>4열</option>
                                </select>
                            </div>

                            <button
                                onClick={handleAddChart}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                차트 추가
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        총 {layout.charts.length}개 차트
                    </span>
                </div>
            </div>

            {/* 그리드 레이아웃 */}
            <div
                className="grid gap-4 min-h-[400px]"
                style={{
                    gridTemplateColumns,
                    gridTemplateRows: `repeat(${layout.rows}, 400px)` // 고정 높이로 변경
                }}
            >
                {layout.charts.map((chart) => (
                    <div
                        key={chart.id}
                        className={`relative overflow-hidden ${isConfigMode ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}`}
                        style={getGridItemStyle(chart)}
                    >
                        {isConfigMode && (
                            <div className="absolute top-2 right-2 z-10 flex gap-1">
                                <button
                                    onClick={() => handleEditChart(chart)}
                                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    title="차트 편집"
                                >
                                    <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => handleDeleteChart(chart.id)}
                                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    title="차트 삭제"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <RevenueChart
                            data={data}
                            config={chart}
                            categories={chart.categories || categories}
                            categoryColors={categoryColors}
                        />
                    </div>
                ))}

                {/* 빈 그리드 영역 표시 (설정 모드일 때) */}
                {isConfigMode && layout.charts.length === 0 && (
                    <div className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>차트를 추가해보세요</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 차트 편집 모달 */}
            {editingChart && (
                <ChartEditModal
                    chart={editingChart}
                    categories={categories}
                    onSave={handleSaveChart}
                    onCancel={() => setEditingChart(null)}
                />
            )}
        </div>
    );
};

// 차트 편집 모달 컴포넌트
interface ChartEditModalProps {
    chart: ChartConfig;
    categories: string[];
    onSave: (chart: ChartConfig) => void;
    onCancel: () => void;
}

const ChartEditModal: React.FC<ChartEditModalProps> = ({
    chart,
    categories,
    onSave,
    onCancel
}) => {
    const [editedChart, setEditedChart] = useState<ChartConfig>({ ...chart });

    const handleSave = () => {
        onSave(editedChart);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110]">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">차트 설정</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            차트 제목
                        </label>
                        <input
                            type="text"
                            value={editedChart.title}
                            onChange={(e) => setEditedChart({ ...editedChart, title: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            차트 타입
                        </label>
                        <select
                            value={editedChart.type}
                            onChange={(e) => setEditedChart({
                                ...editedChart,
                                type: e.target.value as ChartConfig['type']
                            })}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="line">선 그래프</option>
                            <option value="area">영역 그래프</option>
                            <option value="bar">막대 그래프</option>
                            <option value="pie">원형 그래프</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            표시할 카테고리
                        </label>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <label key={category} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={editedChart.categories?.includes(category) || false}
                                        onChange={(e) => {
                                            const currentCategories = editedChart.categories || [];
                                            if (e.target.checked) {
                                                setEditedChart({
                                                    ...editedChart,
                                                    categories: [...currentCategories, category]
                                                });
                                            } else {
                                                setEditedChart({
                                                    ...editedChart,
                                                    categories: currentCategories.filter(c => c !== category)
                                                });
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                행 위치
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={editedChart.position.row}
                                onChange={(e) => setEditedChart({
                                    ...editedChart,
                                    position: { ...editedChart.position, row: Number(e.target.value) }
                                })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                열 위치
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={editedChart.position.col}
                                onChange={(e) => setEditedChart({
                                    ...editedChart,
                                    position: { ...editedChart.position, col: Number(e.target.value) }
                                })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                행 크기
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={editedChart.position.rowSpan}
                                onChange={(e) => setEditedChart({
                                    ...editedChart,
                                    position: { ...editedChart.position, rowSpan: Number(e.target.value) }
                                })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                열 크기
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={editedChart.position.colSpan}
                                onChange={(e) => setEditedChart({
                                    ...editedChart,
                                    position: { ...editedChart.position, colSpan: Number(e.target.value) }
                                })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChartGrid;