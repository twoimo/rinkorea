import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Target, Users } from 'lucide-react';
import { RevenueStats } from '@/types/revenue';

interface RevenueDashboardProps {
    stats: RevenueStats | null;
    loading: boolean;
    error?: string | null; // 에러 상태 추가
}

const RevenueDashboard: React.FC<RevenueDashboardProps> = ({
    stats,
    loading,
    error
}) => {
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

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-6 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // 에러 상태 처리
    if (error) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <div className="text-center py-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-xl">⚠️</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        데이터 로딩 문제
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {error}
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                        <p>• 브라우저 콘솔을 확인해보세요 (F12)</p>
                        <p>• 데이터베이스 연결 상태를 확인해보세요</p>
                        <p>• 관리자 권한이 있는지 확인해보세요</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        매출 데이터가 없습니다
                    </h3>
                    <p className="text-gray-600">
                        데이터 입력 탭에서 매출 정보를 추가해보세요
                    </p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: '총 매출',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        },
        {
            title: '총 판매량',
            value: formatNumber(stats.totalQuantity),
            unit: '개',
            icon: Package,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            title: '평균 단가',
            value: formatCurrency(stats.avgUnitPrice),
            icon: Target,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
        },
        {
            title: '주요 카테고리',
            value: stats.topCategory || '데이터 없음',
            icon: Users,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700'
        },
        {
            title: '인기 제품',
            value: stats.topProduct || '데이터 없음',
            icon: Target,
            color: 'bg-pink-500',
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-700'
        },
        {
            title: '성장률 (30일)',
            value: `${stats.growth > 0 ? '+' : ''}${stats.growth.toFixed(1)}%`,
            icon: stats.growth >= 0 ? TrendingUp : TrendingDown,
            color: stats.growth >= 0 ? 'bg-green-500' : 'bg-red-500',
            bgColor: stats.growth >= 0 ? 'bg-green-50' : 'bg-red-50',
            textColor: stats.growth >= 0 ? 'text-green-700' : 'text-red-700'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => {
                const IconComponent = card.icon;

                return (
                    <div key={index} className={`${card.bgColor} p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow`}>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className={`text-2xl font-bold ${card.textColor}`}>
                                        {card.value}
                                    </p>
                                    {card.unit && (
                                        <span className="text-sm text-gray-500">{card.unit}</span>
                                    )}
                                </div>
                            </div>
                            <div className={`${card.color} p-3 rounded-lg`}>
                                <IconComponent className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        {/* 성장률 카드에 추가 정보 표시 */}
                        {card.title === '성장률 (30일)' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    지난 30일 대비 {stats.growth >= 0 ? '증가' : '감소'}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default RevenueDashboard;