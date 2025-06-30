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
    isTransparent?: boolean;
}

export function LanguageSelector({
    variant = 'default',
    size = 'default',
    showFlag = true,
    showNativeName = true,
    isTransparent = false
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
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 ${isTransparent
                            ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm focus:ring-white/50'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400'
                            }`}
                        aria-label="언어 선택"
                    >
                        <Globe className="w-6 h-6" />
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
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        className="flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm focus:ring-white/50"
                        aria-label="언어 선택"
                    >
                        <Globe className="w-6 h-6" />
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
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    className="flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm focus:ring-white/50"
                    aria-label="언어 선택"
                >
                    <Globe className="w-6 h-6" />
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