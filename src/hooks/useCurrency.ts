import { useState, useEffect } from 'react';
import { Language } from '@/contexts/LanguageContext';

interface ExchangeRates {
    USD: number;
    CNY: number;
    IDR: number;
    KRW: number;
}

interface CurrencyInfo {
    code: string;
    symbol: string;
    format: (amount: number) => string;
}

const CURRENCY_MAP: Record<Language, CurrencyInfo> = {
    ko: {
        code: 'KRW',
        symbol: '원',
        format: (amount: number) => `${amount.toLocaleString('ko-KR')}원`
    },
    en: {
        code: 'USD',
        symbol: '$',
        format: (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    zh: {
        code: 'CNY',
        symbol: '¥',
        format: (amount: number) => `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    id: {
        code: 'IDR',
        symbol: 'Rp',
        format: (amount: number) => `Rp${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
};

export const useCurrency = (language: Language) => {
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                setLoading(true);
                setError(null);

                // Using exchangerate-api.com (free tier with 1500 requests/month)
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');

                if (!response.ok) {
                    throw new Error('Failed to fetch exchange rates');
                }

                const data = await response.json();

                setExchangeRates({
                    KRW: 1,
                    USD: data.rates.USD,
                    CNY: data.rates.CNY,
                    IDR: data.rates.IDR
                });
            } catch (err) {
                console.error('Failed to fetch exchange rates:', err);
                setError('Failed to load exchange rates');

                // Fallback to approximate rates if API fails
                setExchangeRates({
                    KRW: 1,
                    USD: 0.00075, // 약 1,330 KRW = 1 USD
                    CNY: 0.0055,  // 약 180 KRW = 1 CNY
                    IDR: 11.5     // 약 0.087 KRW = 1 IDR
                });
            } finally {
                setLoading(false);
            }
        };

        fetchExchangeRates();
    }, []);

    const convertPrice = (priceInKRW: number): number => {
        if (!exchangeRates) return priceInKRW;

        const targetCurrency = CURRENCY_MAP[language].code;
        const rate = exchangeRates[targetCurrency as keyof ExchangeRates];

        if (targetCurrency === 'KRW') {
            return priceInKRW;
        }

        return priceInKRW * rate;
    };

    const formatPrice = (priceInKRW: number): string => {
        const convertedPrice = convertPrice(priceInKRW);
        return CURRENCY_MAP[language].format(convertedPrice);
    };

    return {
        exchangeRates,
        loading,
        error,
        convertPrice,
        formatPrice,
        currencyInfo: CURRENCY_MAP[language]
    };
}; 