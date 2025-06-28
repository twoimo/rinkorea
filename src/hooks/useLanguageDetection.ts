import { useEffect, useState, useCallback } from 'react';
import { Language } from '@/contexts/LanguageContext';

interface LanguageDetectionOptions {
    enableGeoLocation?: boolean;
    enableURLParams?: boolean;
    enableLocalStorage?: boolean;
    fallbackLanguage?: Language;
    supportedLanguages?: Language[];
}

interface GeolocationLanguageMap {
    [countryCode: string]: Language;
}

// 국가별 기본 언어 매핑
const geolocationLanguageMap: GeolocationLanguageMap = {
    // 한국
    'KR': 'ko',
    // 영어권 국가
    'US': 'en',
    'GB': 'en',
    'CA': 'en',
    'AU': 'en',
    'NZ': 'en',
    'IE': 'en',
    'ZA': 'en',
    'SG': 'en',
    'MY': 'en',
    'PH': 'en',
    'IN': 'en',
    // 중국어권
    'CN': 'zh',
    'TW': 'zh',
    'HK': 'zh',
    'MO': 'zh',
    // 인도네시아
    'ID': 'id',
    // 기타 아시아 국가들 (영어 선호)
    'JP': 'en',
    'TH': 'en',
    'VN': 'en',
    'BD': 'en',
    'PK': 'en',
    'LK': 'en',
    'NP': 'en',
    'MM': 'en',
    'KH': 'en',
    'LA': 'en',
    'BN': 'en',
    'MV': 'en',
    'BT': 'en',
    'MN': 'en',
    'KZ': 'en',
    'UZ': 'en',
    'KG': 'en',
    'TJ': 'en',
    'TM': 'en',
    'AF': 'en',
    // 아메리카 대륙
    'MX': 'en',
    'BR': 'en',
    'AR': 'en',
    'CL': 'en',
    'CO': 'en',
    'PE': 'en',
    'VE': 'en',
    'EC': 'en',
    'BO': 'en',
    'PY': 'en',
    'UY': 'en',
    'GY': 'en',
    'SR': 'en',
    'GF': 'en',
    // 유럽 (영어)
    'DE': 'en',
    'FR': 'en',
    'IT': 'en',
    'ES': 'en',
    'PT': 'en',
    'NL': 'en',
    'BE': 'en',
    'LU': 'en',
    'CH': 'en',
    'AT': 'en',
    'NO': 'en',
    'SE': 'en',
    'DK': 'en',
    'FI': 'en',
    'IS': 'en',
    'PL': 'en',
    'CZ': 'en',
    'SK': 'en',
    'HU': 'en',
    'RO': 'en',
    'BG': 'en',
    'HR': 'en',
    'SI': 'en',
    'EE': 'en',
    'LV': 'en',
    'LT': 'en',
    'MT': 'en',
    'CY': 'en',
    'GR': 'en',
    'AL': 'en',
    'MK': 'en',
    'ME': 'en',
    'RS': 'en',
    'BA': 'en',
    'XK': 'en',
    'MD': 'en',
    'UA': 'en',
    'BY': 'en',
    'RU': 'en',
    // 아프리카 (영어)
    'NG': 'en',
    'KE': 'en',
    'UG': 'en',
    'TZ': 'en',
    'RW': 'en',
    'ET': 'en',
    'GH': 'en',
    'ZM': 'en',
    'ZW': 'en',
    'BW': 'en',
    'NA': 'en',
    'SZ': 'en',
    'LS': 'en',
    'MW': 'en',
    'MZ': 'en',
    'AO': 'en',
    'CV': 'en',
    'GW': 'en',
    'GN': 'en',
    'SL': 'en',
    'LR': 'en',
    'CI': 'en',
    'BF': 'en',
    'ML': 'en',
    'NE': 'en',
    'TD': 'en',
    'CF': 'en',
    'CM': 'en',
    'GQ': 'en',
    'GA': 'en',
    'ST': 'en',
    'DJ': 'en',
    'SO': 'en',
    'ER': 'en',
    'SD': 'en',
    'SS': 'en',
    'EG': 'en',
    'LY': 'en',
    'TN': 'en',
    'DZ': 'en',
    'MA': 'en',
    'MR': 'en',
    'SN': 'en',
    'GM': 'en',
    'MG': 'en',
    'KM': 'en',
    'MU': 'en',
    'SC': 'en',
    // 오세아니아
    'FJ': 'en',
    'PG': 'en',
    'SB': 'en',
    'VU': 'en',
    'NC': 'en',
    'PF': 'en',
    'WS': 'en',
    'TO': 'en',
    'TV': 'en',
    'NR': 'en',
    'KI': 'en',
    'MH': 'en',
    'FM': 'en',
    'PW': 'en',
    // 중동 (영어)
    'SA': 'en',
    'AE': 'en',
    'QA': 'en',
    'BH': 'en',
    'KW': 'en',
    'OM': 'en',
    'YE': 'en',
    'JO': 'en',
    'LB': 'en',
    'SY': 'en',
    'IQ': 'en',
    'IR': 'en',
    'IL': 'en',
    'PS': 'en',
    'TR': 'en',
    'AM': 'en',
    'AZ': 'en',
    'GE': 'en'
};

// 브라우저 언어를 지원되는 언어로 매핑
const mapBrowserLanguage = (browserLang: string, supportedLanguages: Language[]): Language | null => {
    const lang = browserLang.toLowerCase();

    // 정확한 매치 확인
    if (lang.startsWith('ko') && supportedLanguages.includes('ko')) return 'ko';
    if (lang.startsWith('en') && supportedLanguages.includes('en')) return 'en';
    if (lang.startsWith('zh') && supportedLanguages.includes('zh')) return 'zh';
    if (lang.startsWith('id') && supportedLanguages.includes('id')) return 'id';

    return null;
};

// IP 기반 지역 감지 (무료 서비스 사용)
const detectGeolocation = async (): Promise<string | null> => {
    try {
        // 여러 무료 지역 감지 서비스를 순차적으로 시도
        const services = [
            'https://ipapi.co/country/',
            'https://api.country.is/',
            'https://ipinfo.io/country'
        ];

        for (const service of services) {
            try {
                const response = await fetch(service, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/plain'
                    }
                });

                if (response.ok) {
                    const countryCode = await response.text();
                    return countryCode.trim().toUpperCase();
                }
            } catch (serviceError) {
                console.warn(`Geolocation service ${service} failed:`, serviceError);
                continue;
            }
        }

        return null;
    } catch (error) {
        console.warn('Geolocation detection failed:', error);
        return null;
    }
};

// URL 파라미터에서 언어 감지
const detectLanguageFromURL = (supportedLanguages: Language[]): Language | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Language;

    if (langParam && supportedLanguages.includes(langParam)) {
        return langParam;
    }

    return null;
};

// 로컬 스토리지에서 언어 감지
const detectLanguageFromStorage = (supportedLanguages: Language[]): Language | null => {
    try {
        const storedLang = localStorage.getItem('rin-korea-language') as Language;
        if (storedLang && supportedLanguages.includes(storedLang)) {
            return storedLang;
        }
    } catch (error) {
        console.warn('Failed to read from localStorage:', error);
    }

    return null;
};

// 브라우저 언어 감지
const detectBrowserLanguage = (supportedLanguages: Language[]): Language | null => {
    // navigator.languages (우선순위 순)
    if (navigator.languages) {
        for (const lang of navigator.languages) {
            const mappedLang = mapBrowserLanguage(lang, supportedLanguages);
            if (mappedLang) return mappedLang;
        }
    }

    // navigator.language (기본 언어)
    if (navigator.language) {
        const mappedLang = mapBrowserLanguage(navigator.language, supportedLanguages);
        if (mappedLang) return mappedLang;
    }

    return null;
};

export const useLanguageDetection = (options: LanguageDetectionOptions = {}) => {
    const {
        enableGeoLocation = true,
        enableURLParams = true,
        enableLocalStorage = true,
        fallbackLanguage = 'ko',
        supportedLanguages = ['ko', 'en', 'zh', 'id']
    } = options;

    const [detectedLanguage, setDetectedLanguage] = useState<Language | null>(null);
    const [isDetecting, setIsDetecting] = useState(true);
    const [detectionMethod, setDetectionMethod] = useState<string>('');

    const detectLanguage = useCallback(async (): Promise<Language> => {
        setIsDetecting(true);

        try {
            // 1. URL 파라미터 확인 (최우선)
            if (enableURLParams) {
                const urlLang = detectLanguageFromURL(supportedLanguages);
                if (urlLang) {
                    setDetectionMethod('URL Parameter');
                    return urlLang;
                }
            }

            // 2. 로컬 스토리지 확인
            if (enableLocalStorage) {
                const storedLang = detectLanguageFromStorage(supportedLanguages);
                if (storedLang) {
                    setDetectionMethod('Local Storage');
                    return storedLang;
                }
            }

            // 3. 브라우저 언어 확인
            const browserLang = detectBrowserLanguage(supportedLanguages);
            if (browserLang) {
                setDetectionMethod('Browser Language');
                return browserLang;
            }

            // 4. 지역 기반 감지 (비동기)
            if (enableGeoLocation) {
                try {
                    const countryCode = await detectGeolocation();
                    if (countryCode && geolocationLanguageMap[countryCode]) {
                        const geoLang = geolocationLanguageMap[countryCode];
                        if (supportedLanguages.includes(geoLang)) {
                            setDetectionMethod('Geolocation');
                            return geoLang;
                        }
                    }
                } catch (geoError) {
                    console.warn('Geolocation detection failed:', geoError);
                }
            }

            // 5. 폴백 언어
            setDetectionMethod('Fallback');
            return fallbackLanguage;

        } catch (error) {
            console.error('Language detection failed:', error);
            setDetectionMethod('Error Fallback');
            return fallbackLanguage;
        } finally {
            setIsDetecting(false);
        }
    }, [enableGeoLocation, enableURLParams, enableLocalStorage, fallbackLanguage, supportedLanguages]);

    // 언어 저장
    const saveLanguagePreference = useCallback((language: Language) => {
        try {
            localStorage.setItem('rin-korea-language', language);
        } catch (error) {
            console.warn('Failed to save language preference:', error);
        }
    }, []);

    // URL에 언어 파라미터 추가
    const updateURLLanguage = useCallback((language: Language) => {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', language);
        window.history.replaceState({}, '', url.toString());
    }, []);

    // 언어 감지 실행
    useEffect(() => {
        detectLanguage().then(language => {
            setDetectedLanguage(language);
        });
    }, [detectLanguage]);

    return {
        detectedLanguage,
        isDetecting,
        detectionMethod,
        detectLanguage,
        saveLanguagePreference,
        updateURLLanguage,
        supportedLanguages
    };
};

export default useLanguageDetection; 