import React, { useState, useEffect, useRef } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
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
    showFlag: _showFlag = true,
    showNativeName: _showNativeName = true,
    isTransparent = false
}: LanguageSelectorProps) {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const _currentLanguage = languages.find(lang => lang.code === language);

    const handleLanguageChange = (langCode: Language) => {
        setLanguage(langCode);
        setIsOpen(false);

        // Optional: Reload page to ensure all content is updated
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    // 외부 클릭 감지
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const _getButtonSize = () => {
        switch (size) {
            case 'sm': return 'h-8 px-2 text-xs';
            case 'lg': return 'h-12 px-4 text-base';
            default: return 'h-10 px-3 text-sm';
        }
    };

    const DropdownContent = ({ children }: { children: React.ReactNode }) => (
        <div
            className={`absolute top-full right-0 mt-2 z-[9999] bg-white rounded-md shadow-lg border border-gray-200 min-w-[180px] transform transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                }`}
            style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                zIndex: 9999
            }}
        >
            {children}
        </div>
    );

    if (variant === 'flag-only') {
        return (
            <div ref={containerRef} className="relative inline-block">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleToggle}
                    className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 ${isTransparent
                        ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm focus:ring-white/50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400'
                        }`}
                    aria-label="언어 선택"
                >
                    <Globe className="w-6 h-6" />
                </Button>

                <DropdownContent>
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                <span>{lang.flag}</span>
                                <span className="font-medium">{lang.nativeName}</span>
                                {language === lang.code && (
                                    <span className="ml-auto text-blue-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </DropdownContent>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div ref={containerRef} className="relative inline-block">
                <Button
                    variant="secondary"
                    onClick={handleToggle}
                    className="flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm focus:ring-white/50"
                    aria-label="언어 선택"
                >
                    <Globe className="w-6 h-6" />
                </Button>

                <DropdownContent>
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                <span>{lang.flag}</span>
                                <span className="font-medium">{lang.nativeName}</span>
                                {language === lang.code && (
                                    <span className="ml-auto text-blue-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </DropdownContent>
            </div>
        );
    }

    // Default variant
    return (
        <div ref={containerRef} className="relative inline-block">
            <Button
                variant="secondary"
                onClick={handleToggle}
                className="flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm focus:ring-white/50"
                aria-label="언어 선택"
            >
                <Globe className="w-6 h-6" />
            </Button>

            <DropdownContent>
                <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">언어 선택</div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 rounded-md p-2 text-left transition-colors ${language === lang.code
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : 'hover:bg-gray-50 text-gray-700'
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
                        </button>
                    ))}
                </div>
            </DropdownContent>
        </div>
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