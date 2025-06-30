import { useEffect } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
    locale?: string;
    alternateUrls?: {
        [key in Language]: string;
    };
}

const languageToLocale = {
    ko: 'ko_KR',
    en: 'en_US',
    zh: 'zh_CN'
} as const;

const languageToHtmlLang = {
    ko: 'ko',
    en: 'en',
    zh: 'zh-CN'
} as const;

export function SEOHead({
    title,
    description,
    keywords,
    image = '/images/optimized/site-icon-512.webp',
    url,
    type = 'website',
    siteName = '린코리아',
    alternateUrls
}: SEOHeadProps) {
    const { language, t } = useLanguage();

    // Default SEO content by language
    const defaultSEO = {
        ko: {
            title: '린코리아 - 세라믹 코팅의 모든 것',
            description: '린코리아는 친환경 불연재(1액형) 신소재 세라믹 코팅제를 전문으로 하는 건설재료 제조업체입니다. 최고의 품질과 기술력으로 건설 현장의 안전을 책임집니다.',
            keywords: '세라믹 코팅, 불연재, 친환경 코팅, 건설재료, 린코리아, 방수 코팅, 내화 코팅',
            siteName: '린코리아'
        },
        en: {
            title: 'RIN Korea - Everything About Ceramic Coating',
            description: 'RIN Korea is a construction material manufacturer specializing in eco-friendly fire-resistant (one-component) new material ceramic coatings. We ensure construction site safety with the highest quality and technology.',
            keywords: 'ceramic coating, fire resistant, eco-friendly coating, construction materials, RIN Korea, waterproof coating, fireproof coating',
            siteName: 'RIN Korea'
        },
        zh: {
            title: '林韩国 - 陶瓷涂层的一切',
            description: '林韩国是专业从事环保阻燃（单组分）新材料陶瓷涂层的建筑材料制造商。我们以最高的质量和技术确保建筑工地的安全。',
            keywords: '陶瓷涂层, 阻燃材料, 环保涂层, 建筑材料, 林韩国, 防水涂层, 防火涂层',
            siteName: '林韩国'
        }
    };

    const currentSEO = defaultSEO[language];
    const finalTitle = title || currentSEO.title;
    const finalDescription = description || currentSEO.description;
    const finalKeywords = keywords || currentSEO.keywords;
    const finalSiteName = siteName || currentSEO.siteName;
    const currentUrl = url || window.location.href;
    const locale = languageToLocale[language];
    const htmlLang = languageToHtmlLang[language];

    useEffect(() => {
        // Update document title
        document.title = finalTitle;

        // Update HTML lang attribute
        document.documentElement.lang = htmlLang;

        // Helper function to update or create meta tag
        const updateMetaTag = (name: string, content: string, property?: boolean) => {
            const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector) as HTMLMetaElement;

            if (!meta) {
                meta = document.createElement('meta');
                if (property) {
                    meta.setAttribute('property', name);
                } else {
                    meta.setAttribute('name', name);
                }
                document.head.appendChild(meta);
            }

            meta.setAttribute('content', content);
        };

        // Helper function to update or create link tag
        const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
            const selector = hreflang
                ? `link[rel="${rel}"][hreflang="${hreflang}"]`
                : `link[rel="${rel}"]`;
            let link = document.querySelector(selector) as HTMLLinkElement;

            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', rel);
                if (hreflang) {
                    link.setAttribute('hreflang', hreflang);
                }
                document.head.appendChild(link);
            }

            link.setAttribute('href', href);
        };

        // Update basic meta tags
        updateMetaTag('description', finalDescription);
        updateMetaTag('keywords', finalKeywords);
        updateMetaTag('language', htmlLang);

        // Update Open Graph tags
        updateMetaTag('og:title', finalTitle, true);
        updateMetaTag('og:description', finalDescription, true);
        updateMetaTag('og:image', new URL(image, window.location.origin).href, true);
        updateMetaTag('og:url', currentUrl, true);
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:site_name', finalSiteName, true);
        updateMetaTag('og:locale', locale, true);

        // Update Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', finalTitle);
        updateMetaTag('twitter:description', finalDescription);
        updateMetaTag('twitter:image', new URL(image, window.location.origin).href);

        // Update canonical URL
        updateLinkTag('canonical', currentUrl);

        // Update alternate language URLs if provided
        if (alternateUrls) {
            Object.entries(alternateUrls).forEach(([lang, altUrl]) => {
                const hreflang = languageToHtmlLang[lang as Language];
                updateLinkTag('alternate', altUrl, hreflang);
            });
        }

        // Add default alternate links for current page
        const baseUrl = window.location.origin + window.location.pathname;
        updateLinkTag('alternate', `${baseUrl}?lang=ko`, 'ko');
        updateLinkTag('alternate', `${baseUrl}?lang=en`, 'en');
        updateLinkTag('alternate', `${baseUrl}?lang=zh`, 'zh-CN');
        updateLinkTag('alternate', baseUrl, 'x-default');

        // Update structured data
        const updateStructuredData = () => {
            const existingScript = document.querySelector('script[type="application/ld+json"]');
            if (existingScript) {
                const structuredData = {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": finalSiteName,
                    "url": window.location.origin,
                    "logo": new URL('/images/optimized/site-icon-512.webp', window.location.origin).href,
                    "description": finalDescription,
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "백범로 707",
                        "addressLocality": "인천광역시 서구",
                        "addressCountry": "KR"
                    },
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+82-32-571-1023",
                        "contactType": "customer service"
                    },
                    "sameAs": [
                        "https://www.youtube.com/@rinkorea",
                        "https://www.instagram.com/rinkorea_official"
                    ]
                };

                existingScript.textContent = JSON.stringify(structuredData, null, 2);
            }
        };

        updateStructuredData();

    }, [finalTitle, finalDescription, finalKeywords, finalSiteName, currentUrl, locale, htmlLang, image, type, alternateUrls]);

    return null;
} 