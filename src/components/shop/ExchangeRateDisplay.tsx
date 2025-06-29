import React from 'react';
import { TrendingUp, DollarSign, CircleDollarSign } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { useLanguage } from '@/contexts/LanguageContext';

const ExchangeRateDisplay = () => {
    const { language } = useLanguage();
    const { exchangeRates, loading, lastUpdated } = useCurrency(language);

    // 한국어가 아닌 경우에만 표시
    if (language === 'ko' || loading || !exchangeRates) {
        return null;
    }

    const formatRateForDisplay = (rate: number, targetCurrency: string) => {
        if (targetCurrency === 'USD') {
            return `1 USD = ${(1 / rate).toLocaleString('ko-KR', { maximumFractionDigits: 0 })} KRW`;
        }
        if (targetCurrency === 'CNY') {
            return `1 CNY = ${(1 / rate).toLocaleString('ko-KR', { maximumFractionDigits: 0 })} KRW`;
        }
        return '';
    };

    const getCurrentRate = () => {
        switch (language) {
            case 'en':
                return {
                    icon: <DollarSign className="w-3 h-3" />,
                    rate: formatRateForDisplay(exchangeRates.USD, 'USD'),
                    color: 'text-green-600'
                };
            case 'zh':
                return {
                    icon: <CircleDollarSign className="w-3 h-3" />,
                    rate: formatRateForDisplay(exchangeRates.CNY, 'CNY'),
                    color: 'text-red-600'
                };
            default:
                return null;
        }
    };

    const rateInfo = getCurrentRate();
    if (!rateInfo) return null;

    return (
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 border">
            {rateInfo.icon}
            <span className={`font-mono ${rateInfo.color}`}>
                {rateInfo.rate}
            </span>
            {lastUpdated && (
                <span className="text-gray-400 ml-1">
                    {lastUpdated.toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            )}
        </div>
    );
};

export default ExchangeRateDisplay; 