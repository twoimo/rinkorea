import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Recharts 컴포넌트들을 lazy loading
const LineChart = lazy(() =>
    import('recharts').then(module => ({
        default: module.LineChart
    }))
);

const BarChart = lazy(() =>
    import('recharts').then(module => ({
        default: module.BarChart
    }))
);

const PieChart = lazy(() =>
    import('recharts').then(module => ({
        default: module.PieChart
    }))
);

const AreaChart = lazy(() =>
    import('recharts').then(module => ({
        default: module.AreaChart
    }))
);

const ResponsiveContainer = lazy(() =>
    import('recharts').then(module => ({
        default: module.ResponsiveContainer
    }))
);

// 차트 공통 컴포넌트들
export const useRechartsComponents = () => {
    return import('recharts').then(module => ({
        Line: module.Line,
        Bar: module.Bar,
        Pie: module.Pie,
        Area: module.Area,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        Cell: module.Cell
    }));
};

// Chart 래퍼 컴포넌트들
interface LazyChartProps {
    children: React.ReactNode;
    data?: unknown[];
    width?: number;
    height?: number;
    [key: string]: unknown;
}

const ChartFallback = ({ height = 300 }: { height?: number }) => (
    <div
        className="flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50"
        style={{ height }}
    >
        <div className="text-center">
            <LoadingSpinner className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm text-gray-600">차트 로딩 중...</p>
        </div>
    </div>
);

export const LazyLineChart = ({ height = 300, ...props }: LazyChartProps) => {
    return (
        <Suspense fallback={<ChartFallback height={height} />}>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart {...props} />
            </ResponsiveContainer>
        </Suspense>
    );
};

export const LazyBarChart = ({ height = 300, ...props }: LazyChartProps) => {
    return (
        <Suspense fallback={<ChartFallback height={height} />}>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart {...props} />
            </ResponsiveContainer>
        </Suspense>
    );
};

export const LazyPieChart = ({ height = 300, ...props }: LazyChartProps) => {
    return (
        <Suspense fallback={<ChartFallback height={height} />}>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart {...props} />
            </ResponsiveContainer>
        </Suspense>
    );
};

export const LazyAreaChart = ({ height = 300, ...props }: LazyChartProps) => {
    return (
        <Suspense fallback={<ChartFallback height={height} />}>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart {...props} />
            </ResponsiveContainer>
        </Suspense>
    );
};

// 간단한 차트 컴포넌트 (recharts 없이 CSS로만)
export const SimpleBarsChart = ({
    data,
    dataKey,
    height = 200,
    color = '#3B82F6'
}: {
    data: Record<string, number>[];
    dataKey: string;
    height?: number;
    color?: string;
}) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => item[dataKey] || 0));

    return (
        <div className="w-full" style={{ height }}>
            <div className="flex items-end justify-between h-full gap-1">
                {data.map((item, index) => {
                    const barHeight = ((item[dataKey] || 0) / maxValue) * (height - 20);
                    return (
                        <div key={index} className="flex flex-col items-center flex-1">
                            <div
                                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                                style={{
                                    height: Math.max(barHeight, 2),
                                    backgroundColor: color,
                                    minHeight: '2px'
                                }}
                                title={`${item.name || index}: ${item[dataKey]}`}
                            />
                            <span className="text-xs text-gray-600 mt-1 truncate">
                                {String(item.name || index)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LazyLineChart; 