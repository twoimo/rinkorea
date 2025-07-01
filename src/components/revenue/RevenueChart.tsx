import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { ChartData, ChartConfig } from '@/types/revenue';

interface RevenueChartProps {
    data: ChartData[];
    config: ChartConfig;
    categories: string[];
    categoryColors: Record<string, string>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
    data,
    config,
    categories,
    categoryColors
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        if (dateStr.includes('-') && dateStr.length <= 7) {
            // Monthly format (YYYY-MM)
            const [year, month] = dateStr.split('-');
            return `${year}년 ${month}월`;
        }
        return dateStr;
    };

    const CustomTooltip = ({ active, payload, label }: {
        active?: boolean;
        payload?: Array<{
            color: string;
            dataKey: string;
            value: number;
        }>;
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-800 font-semibold mb-2">{formatDate(label || '')}</p>
                    {payload.map((entry, _index) => (
                        <div key={_index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600 text-sm">
                                {entry.dataKey}: {formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 20, right: 30, left: 20, bottom: 5 }
        };

        switch (config.type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <defs>
                            {categories.map((category, _index) => (
                                <linearGradient key={category} id={`gradient-${config.id}-${_index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={categoryColors[category]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={categoryColors[category]} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            tick={{ fontSize: 12, fill: '#374151' }}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="#6B7280"
                            tick={{ fontSize: 12, fill: '#374151' }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {categories.length > 1 && <Legend />}
                        {categories.map((category) => (
                            <Line
                                key={category}
                                type="monotone"
                                dataKey={category}
                                stroke={categoryColors[category]}
                                strokeWidth={3}
                                dot={{ fill: categoryColors[category], strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: categoryColors[category], strokeWidth: 2 }}
                                name={category === 'total' ? '총 매출' : category}
                            />
                        ))}
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            {categories.map((category, _index) => (
                                <linearGradient key={category} id={`areaGradient-${_index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={categoryColors[category]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={categoryColors[category]} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            tick={{ fontSize: 12, fill: '#374151' }}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="#6B7280"
                            tick={{ fontSize: 12, fill: '#374151' }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {categories.map((category, _index) => (
                            <Area
                                key={category}
                                type="monotone"
                                dataKey={category}
                                stackId="1"
                                stroke={categoryColors[category]}
                                fill={`url(#areaGradient-${_index})`}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            tick={{ fontSize: 12, fill: '#374151' }}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="#6B7280"
                            tick={{ fontSize: 12, fill: '#374151' }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {categories.map((category) => (
                            <Bar
                                key={category}
                                dataKey={category}
                                fill={categoryColors[category]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                );

            case 'pie': {
                const pieData = categories.map(category => {
                    const total = data.reduce((sum, item) => sum + (item[category] as number || 0), 0);
                    return {
                        name: category,
                        value: total,
                        color: categoryColors[category]
                    };
                }).filter(item => item.value > 0);

                return (
                    <PieChart {...commonProps}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        >
                            {pieData.map((entry, _index) => (
                                <Cell key={`cell-${_index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                );
            }

            default:
                return <div>지원하지 않는 차트 타입입니다.</div>;
        }
    };

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-gray-800 text-lg font-semibold mb-4">{config.title}</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;