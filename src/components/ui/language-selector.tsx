import React, { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageOption {
    code: Language;
    label: string;
    flag: string;
}

const languages: LanguageOption[] = [
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
];

interface LanguageSelectorProps {
    className?: string;
    isTransparent?: boolean;
}

export function LanguageSelector({ className, isTransparent = false }: LanguageSelectorProps) {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

    const handleLanguageChange = (langCode: Language) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleBackdropClick = () => {
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 touch-manipulation",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    isTransparent
                        ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm focus:ring-white/50"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 focus:ring-blue-500"
                )}
                aria-label="언어 선택"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Globe className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[90] bg-transparent"
                        onClick={handleBackdropClick}
                        onTouchEnd={handleBackdropClick}
                    />

                    {/* Dropdown */}
                    <div className={cn(
                        "absolute z-[100] mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2",
                        "transform transition-all duration-200 ease-out",
                        "right-0 origin-top-right",
                        "sm:right-0 max-w-[calc(100vw-2rem)]"
                    )}>
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            언어 선택 / Language
                        </div>

                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={cn(
                                    "w-full flex items-center px-4 py-3 text-sm transition-colors touch-manipulation",
                                    "hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:bg-gray-50",
                                    language === lang.code
                                        ? "text-blue-600 bg-blue-50 font-medium"
                                        : "text-gray-700"
                                )}
                                role="menuitem"
                            >
                                <span className="text-lg mr-3">{lang.flag}</span>
                                <span className="flex-1 text-left">{lang.label}</span>
                                {language === lang.code && (
                                    <Check className="w-4 h-4 text-blue-600 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
} 