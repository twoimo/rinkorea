import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageOption {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
}

const languages: LanguageOption[] = [
    {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        flag: '🇰🇷'
    },
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸'
    },
    {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳'
    }
];

interface LanguageSelectorProps {
    variant?: 'default' | 'minimal' | 'flag-only';
    size?: 'sm' | 'default' | 'lg';
    showFlag?: boolean;
    showNativeName?: boolean;
}

export function LanguageSelector({
    variant = 'default',
    size = 'default',
    showFlag = true,
    showNativeName = true
}: LanguageSelectorProps) {
    const { language, setLanguage } = useLanguage();

    const currentLanguage = languages.find(lang => lang.code === language);

    const handleLanguageChange = (langCode: Language) => {
        setLanguage(langCode);

        // Optional: Reload page to ensure all content is updated
        // This can be removed if the app handles language changes smoothly
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const getButtonSize = () => {
        switch (size) {
            case 'sm': return 'h-8 px-2 text-xs';
            case 'lg': return 'h-12 px-4 text-base';
            default: return 'h-10 px-3 text-sm';
        }
    };

    if (variant === 'flag-only') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`${getButtonSize()} rounded-full hover:bg-gray-100 transition-colors`}
                        aria-label="언어 선택"
                    >
                        <span className="text-lg">{currentLanguage?.flag}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[150px]">
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center gap-2 cursor-pointer ${language === lang.code ? 'bg-blue-50 text-blue-600' : ''
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span className="font-medium">{lang.nativeName}</span>
                            {language === lang.code && (
                                <span className="ml-auto text-blue-600">✓</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    if (variant === 'minimal') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={`${getButtonSize()} gap-1 hover:bg-gray-100 transition-colors`}
                        aria-label="언어 선택"
                    >
                        {showFlag && <span>{currentLanguage?.flag}</span>}
                        <span className="font-medium">
                            {showNativeName ? currentLanguage?.nativeName : currentLanguage?.code.toUpperCase()}
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[150px]">
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center gap-2 cursor-pointer ${language === lang.code ? 'bg-blue-50 text-blue-600' : ''
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span className="font-medium">{lang.nativeName}</span>
                            {language === lang.code && (
                                <span className="ml-auto text-blue-600">✓</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Default variant
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`${getButtonSize()} gap-2 hover:bg-gray-50 border-gray-200 transition-colors`}
                    aria-label="언어 선택"
                >
                    <Globe className="w-4 h-4" />
                    {showFlag && <span>{currentLanguage?.flag}</span>}
                    <span className="font-medium">
                        {showNativeName ? currentLanguage?.nativeName : currentLanguage?.code.toUpperCase()}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
                <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">언어 선택</div>
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center gap-3 cursor-pointer rounded-md p-2 ${language === lang.code
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{lang.nativeName}</span>
                                <span className="text-xs text-gray-500">{lang.name}</span>
                            </div>
                            {language === lang.code && (
                                <span className="ml-auto text-blue-600 font-bold">✓</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Hook for getting current language information
export function useCurrentLanguage() {
    const { language } = useLanguage();
    return languages.find(lang => lang.code === language);
}

// Utility component for inline language display
export function CurrentLanguageDisplay({
    showFlag = true,
    showNativeName = true,
    className = ""
}: {
    showFlag?: boolean;
    showNativeName?: boolean;
    className?: string;
}) {
    const currentLang = useCurrentLanguage();

    if (!currentLang) return null;

    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
            {showFlag && <span>{currentLang.flag}</span>}
            {showNativeName && <span>{currentLang.nativeName}</span>}
        </span>
    );
} 