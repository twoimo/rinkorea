import React, { useState, useEffect } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Globe, Check, Loader2 } from 'lucide-react';

interface LanguageOption {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
}

const languageOptions: LanguageOption[] = [
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' }
];

// 언어 자동 감지 로직
const detectBrowserLanguage = (): Language | null => {
    const browserLang = navigator.language || navigator.languages?.[0];
    if (!browserLang) return null;

    const lang = browserLang.toLowerCase();
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('id')) return 'id';

    return null;
};

const detectGeolocation = async (): Promise<Language | null> => {
    try {
        const response = await fetch('https://ipapi.co/country/', {
            method: 'GET',
            headers: { 'Accept': 'text/plain' }
        });

        if (response.ok) {
            const countryCode = (await response.text()).trim().toUpperCase();

            // 국가별 기본 언어 매핑
            const countryLanguageMap: Record<string, Language> = {
                'KR': 'ko',
                'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en',
                'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh',
                'ID': 'id'
            };

            return countryLanguageMap[countryCode] || 'en';
        }
    } catch (error) {
        console.warn('Geolocation detection failed:', error);
    }

    return null;
};

interface LanguageSelectorProps {
    variant?: 'default' | 'minimal' | 'header';
    showDetectionInfo?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    variant = 'default',
    showDetectionInfo = false
}) => {
    const { language, setLanguage } = useLanguage();
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectionMethod, setDetectionMethod] = useState<string>('');
    const [autoDetectedLanguage, setAutoDetectedLanguage] = useState<Language | null>(null);

    // 자동 언어 감지
    const performAutoDetection = async () => {
        setIsDetecting(true);

        try {
            // 1. URL 파라미터 확인
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang') as Language;
            if (langParam && languageOptions.some(opt => opt.code === langParam)) {
                setDetectionMethod('URL Parameter');
                setAutoDetectedLanguage(langParam);
                return langParam;
            }

            // 2. 로컬 스토리지 확인
            const storedLang = localStorage.getItem('rin-korea-language') as Language;
            if (storedLang && languageOptions.some(opt => opt.code === storedLang)) {
                setDetectionMethod('User Preference');
                setAutoDetectedLanguage(storedLang);
                return storedLang;
            }

            // 3. 브라우저 언어 감지
            const browserLang = detectBrowserLanguage();
            if (browserLang) {
                setDetectionMethod('Browser Language');
                setAutoDetectedLanguage(browserLang);
                return browserLang;
            }

            // 4. 지역 기반 감지
            const geoLang = await detectGeolocation();
            if (geoLang) {
                setDetectionMethod('Geographic Location');
                setAutoDetectedLanguage(geoLang);
                return geoLang;
            }

            // 5. 기본값
            setDetectionMethod('Default');
            setAutoDetectedLanguage('ko');
            return 'ko';

        } catch (error) {
            console.error('Language detection failed:', error);
            setDetectionMethod('Error - Default');
            setAutoDetectedLanguage('ko');
            return 'ko';
        } finally {
            setIsDetecting(false);
        }
    };

    // 초기 자동 감지 실행
    useEffect(() => {
        performAutoDetection().then(detectedLang => {
            // 현재 언어와 다르고 사용자 설정이 없는 경우 자동 적용
            const hasUserPreference = localStorage.getItem('rin-korea-language');
            if (!hasUserPreference && detectedLang !== language) {
                setLanguage(detectedLang);
            }
        });
    }, [language, setLanguage]);

    // 언어 변경 핸들러
    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage);
        localStorage.setItem('rin-korea-language', newLanguage);

        // URL 파라미터 업데이트
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLanguage);
        window.history.replaceState({}, '', url.toString());

        // HTML lang 속성 업데이트
        const langMap = {
            ko: 'ko-KR',
            en: 'en-US',
            zh: 'zh-CN',
            id: 'id-ID'
        };
        document.documentElement.lang = langMap[newLanguage];
    };

    const currentOption = languageOptions.find(opt => opt.code === language);

    if (variant === 'minimal') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <span>{currentOption?.flag}</span>
                        <span className="text-xs">{currentOption?.code.toUpperCase()}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                    {languageOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.code}
                            onClick={() => handleLanguageChange(option.code)}
                            className="flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-2">
                                <span>{option.flag}</span>
                                <span>{option.nativeName}</span>
                            </div>
                            {language === option.code && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    if (variant === 'header') {
        return (
            <div className="flex items-center gap-2">
                {isDetecting && <Loader2 className="h-4 w-4 animate-spin" />}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Globe className="h-4 w-4" />
                            <span>{currentOption?.flag}</span>
                            <span className="hidden sm:inline">{currentOption?.nativeName}</span>
                            <span className="sm:hidden">{currentOption?.code.toUpperCase()}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[250px]">
                        {showDetectionInfo && detectionMethod && (
                            <>
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <span>Auto-detected:</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {detectionMethod}
                                        </Badge>
                                    </div>
                                    {autoDetectedLanguage && (
                                        <div className="mt-1 text-xs">
                                            Suggested: {languageOptions.find(opt => opt.code === autoDetectedLanguage)?.nativeName}
                                        </div>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        {languageOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.code}
                                onClick={() => handleLanguageChange(option.code)}
                                className="flex items-center justify-between gap-2"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{option.flag}</span>
                                    <div>
                                        <div className="font-medium">{option.nativeName}</div>
                                        <div className="text-xs text-muted-foreground">{option.name}</div>
                                    </div>
                                </div>
                                {language === option.code && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    // Default variant
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span className="font-medium">Language / 언어</span>
                {isDetecting && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            {showDetectionInfo && detectionMethod && (
                <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span>Detection method:</span>
                        <Badge variant="outline" className="text-xs">
                            {detectionMethod}
                        </Badge>
                    </div>
                    {autoDetectedLanguage && (
                        <div className="mt-1">
                            Auto-detected: {languageOptions.find(opt => opt.code === autoDetectedLanguage)?.nativeName}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                {languageOptions.map((option) => (
                    <Button
                        key={option.code}
                        variant={language === option.code ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleLanguageChange(option.code)}
                        className="flex items-center gap-2 justify-start"
                    >
                        <span>{option.flag}</span>
                        <span>{option.nativeName}</span>
                        {language === option.code && <Check className="h-4 w-4 ml-auto" />}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSelector; 