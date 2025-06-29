import { useEffect } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
    locale?: Language;
    alternateLanguages?: Language[];
}

// 언어별 기본 SEO 데이터
const defaultSEOData = {
    ko: {
        title: '린코리아 - 세라믹 코팅의 모든 것',
        description: '린코리아는 친환경 불연재(1액형) 신소재 세라믹 코팅제를 전문으로 하는 건설재료 제조업체입니다. 최고의 품질과 기술력으로 건설 현장의 안전을 책임집니다.',
        keywords: ['세라믹 코팅', '불연재', '친환경 코팅', '건설재료', '린코리아', '방수 코팅', '내화 코팅'],
        siteName: '린코리아',
        language: 'ko_KR'
    },
    en: {
        title: 'RIN Korea - Everything About Ceramic Coating',
        description: 'RIN Korea is a construction materials manufacturer specializing in eco-friendly, non-combustible (single-component) ceramic coating materials. We ensure construction site safety with the highest quality and technology.',
        keywords: ['ceramic coating', 'fire resistant', 'eco-friendly coating', 'construction materials', 'RIN Korea', 'waterproof coating', 'fireproof coating'],
        siteName: 'RIN Korea',
        language: 'en_US'
    },
    zh: {
        title: 'RIN Korea - 陶瓷涂层的一切',
        description: 'RIN Korea是专业从事环保阻燃(单组分)新材料陶瓷涂层的建筑材料制造企业。以最高的品质和技术力量负责建筑现场的安全。',
        keywords: ['陶瓷涂层', '阻燃材料', '环保涂层', '建筑材料', 'RIN Korea', '防水涂层', '防火涂层'],
        siteName: 'RIN Korea',
        language: 'zh_CN'
    },
    id: {
        title: 'RIN Korea - Semua Tentang Lapisan Keramik',
        description: 'RIN Korea adalah produsen bahan konstruksi yang mengkhususkan diri dalam bahan pelapis keramik ramah lingkungan dan tahan api (komponen tunggal). Kami memastikan keamanan lokasi konstruksi dengan kualitas dan teknologi terbaik.',
        keywords: ['lapisan keramik', 'tahan api', 'lapisan ramah lingkungan', 'bahan konstruksi', 'RIN Korea', 'lapisan tahan air', 'lapisan tahan api'],
        siteName: 'RIN Korea',
        language: 'id_ID'
    }
};

// 메타 태그 업데이트 함수
const updateMetaTag = (name: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;

    if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
            meta.setAttribute('property', name);
        } else {
            meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
    }

    meta.content = content;
};

// 링크 태그 업데이트 함수
const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
    let link = document.querySelector(selector) as HTMLLinkElement;

    if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (hreflang) {
            link.hreflang = hreflang;
        }
        document.head.appendChild(link);
    }

    link.href = href;
};

// JSON-LD 구조화된 데이터 타입
interface StructuredDataType {
    name?: string;
    description?: string;
    image?: string;
    url?: string;
    [key: string]: unknown;
}

// JSON-LD 구조화된 데이터 업데이트
const updateStructuredData = (data: StructuredDataType, language: Language) => {
    const selector = 'script[type="application/ld+json"]';
    let script = document.querySelector(selector) as HTMLScriptElement;

    if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }

    const defaultData = defaultSEOData[language];
    const baseUrl = window.location.origin;

    const structuredData: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": defaultData.siteName,
        "alternateName": "RIN Korea",
        "url": baseUrl,
        "logo": `${baseUrl}/images/site-icon-512.png`,
        "description": data.description || defaultData.description,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "인천광역시 서구 백범로 707 (주안국가산업단지)",
            "addressLocality": "인천",
            "addressCountry": "KR",
            "postalCode": "22781"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+82-32-571-1023",
            "contactType": "customer service",
            "availableLanguage": ["ko", "en", "zh", "id"]
        },
        "sameAs": [
            "https://www.youtube.com/@rinkorea",
            "https://www.instagram.com/rinkorea_official"
        ],
        "founder": {
            "@type": "Person",
            "name": "김정희"
        },
        "foundingDate": "2020",
        "industry": "Construction Materials",
        "numberOfEmployees": "10-50",
        "serviceArea": {
            "@type": "Country",
            "name": ["South Korea", "China", "Indonesia", "United States"]
        },
        ...data
    };

    script.textContent = JSON.stringify(structuredData);
};

// hreflang 태그 생성
const generateHreflangTags = (alternateLanguages: Language[], currentPath: string) => {
    // 기존 hreflang 태그 제거
    document.querySelectorAll('link[hreflang]').forEach(link => link.remove());

    const baseUrl = window.location.origin;

    alternateLanguages.forEach(lang => {
        const langCode = {
            ko: 'ko-KR',
            en: 'en-US',
            zh: 'zh-CN',
            id: 'id-ID'
        }[lang];

        updateLinkTag('alternate', `${baseUrl}${currentPath}?lang=${lang}`, langCode);
    });

    // x-default 추가 (기본 언어)
    updateLinkTag('alternate', `${baseUrl}${currentPath}`, 'x-default');
};

export const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    locale,
    alternateLanguages = ['ko', 'en', 'zh', 'id']
}) => {
    const { language } = useLanguage();
    const currentLanguage = locale || language;
    const defaultData = defaultSEOData[currentLanguage];
    const baseUrl = window.location.origin;
    const currentUrl = url || window.location.href;
    const currentPath = window.location.pathname;

    // 최종 메타데이터 계산
    const finalTitle = title ? `${title} | ${defaultData.siteName}` : defaultData.title;
    const finalDescription = description || defaultData.description;
    const finalKeywords = keywords.length > 0 ? keywords : defaultData.keywords;
    const finalImage = image ? `${baseUrl}${image}` : `${baseUrl}/images/site-icon-512.png`;

    useEffect(() => {
        // 기본 메타 태그
        document.title = finalTitle;
        updateMetaTag('description', finalDescription);
        updateMetaTag('keywords', finalKeywords.join(', '));
        updateMetaTag('language', defaultData.language);
        updateMetaTag('robots', 'index, follow');
        updateMetaTag('author', defaultData.siteName);
        updateMetaTag('revisit-after', '7 days');

        // Open Graph 태그
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:title', finalTitle, true);
        updateMetaTag('og:description', finalDescription, true);
        updateMetaTag('og:image', finalImage, true);
        updateMetaTag('og:url', currentUrl, true);
        updateMetaTag('og:site_name', defaultData.siteName, true);
        updateMetaTag('og:locale', defaultData.language, true);

        // Twitter Card 태그
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', finalTitle);
        updateMetaTag('twitter:description', finalDescription);
        updateMetaTag('twitter:image', finalImage);

        // 추가 Open Graph 태그 (article 타입인 경우)
        if (type === 'article') {
            if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
            if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
            if (section) updateMetaTag('article:section', section, true);
            tags.forEach(tag => {
                const meta = document.createElement('meta');
                meta.setAttribute('property', 'article:tag');
                meta.content = tag;
                document.head.appendChild(meta);
            });
        }

        // Canonical URL
        updateLinkTag('canonical', currentUrl);

        // hreflang 태그 생성
        generateHreflangTags(alternateLanguages, currentPath);

        // 구조화된 데이터 업데이트
        updateStructuredData({
            name: finalTitle,
            description: finalDescription,
            image: finalImage,
            url: currentUrl
        }, currentLanguage);

        // 언어별 alternate 메타 태그
        alternateLanguages.forEach(lang => {
            const langData = defaultSEOData[lang];
            updateMetaTag(`og:locale:alternate`, langData.language, true);
        });

    }, [
        finalTitle,
        finalDescription,
        finalKeywords,
        finalImage,
        currentUrl,
        currentLanguage,
        currentPath,
        defaultData.language,
        defaultData.siteName,
        type,
        publishedTime,
        modifiedTime,
        section,
        tags,
        alternateLanguages
    ]);

    // 이 컴포넌트는 렌더링할 내용이 없음
    return null;
};

export default SEOHead; 