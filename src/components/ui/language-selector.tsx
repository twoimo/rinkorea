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

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105",
                    isTransparent
                        ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                )}
                aria-label="언어 선택"
            >
                <Globe className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[90]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]">
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            언어 선택 / Language
                        </div>

                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={cn(
                                    "w-full flex items-center px-4 py-2 text-sm transition-colors hover:bg-gray-50",
                                    language === lang.code
                                        ? "text-blue-600 bg-blue-50 font-medium"
                                        : "text-gray-700"
                                )}
                            >
                                <span className="text-lg mr-3">{lang.flag}</span>
                                <span className="flex-1 text-left">{lang.label}</span>
                                {language === lang.code && (
                                    <Check className="w-4 h-4 text-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
} 