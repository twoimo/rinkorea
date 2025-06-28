import { Language } from '@/contexts/LanguageContext';

interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    alternates?: { lang: string; href: string }[];
}

interface RouteConfig {
    path: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    lastmod?: string;
}

export const supportedLanguages: Language[] = ['ko', 'en', 'zh', 'id'];

export const routes: RouteConfig[] = [
    { path: '/', changefreq: 'daily', priority: 1.0 },
    { path: '/about', changefreq: 'monthly', priority: 0.8 },
    { path: '/products', changefreq: 'weekly', priority: 0.9 },
    { path: '/equipment', changefreq: 'weekly', priority: 0.9 },
    { path: '/projects', changefreq: 'weekly', priority: 0.8 },
    { path: '/certificates', changefreq: 'monthly', priority: 0.7 },
    { path: '/news', changefreq: 'daily', priority: 0.8 },
    { path: '/resources', changefreq: 'weekly', priority: 0.7 },
    { path: '/qna', changefreq: 'weekly', priority: 0.6 },
    { path: '/contact', changefreq: 'monthly', priority: 0.7 },
    { path: '/shop', changefreq: 'daily', priority: 0.9 }
];

// 언어별 URL 생성
export const generateMultilingualUrls = (baseUrl: string = 'https://rinkorea.com'): SitemapUrl[] => {
    const urls: SitemapUrl[] = [];
    const currentDate = new Date().toISOString().split('T')[0];

    routes.forEach(route => {
        supportedLanguages.forEach(lang => {
            const langCode = {
                ko: 'ko-KR',
                en: 'en-US',
                zh: 'zh-CN',
                id: 'id-ID'
            }[lang];

            // 메인 URL (언어 파라미터 포함)
            const url = `${baseUrl}${route.path}?lang=${lang}`;

            // 대체 언어 URL들
            const alternates = supportedLanguages.map(altLang => ({
                lang: {
                    ko: 'ko-KR',
                    en: 'en-US',
                    zh: 'zh-CN',
                    id: 'id-ID'
                }[altLang],
                href: `${baseUrl}${route.path}?lang=${altLang}`
            }));

            // x-default 추가 (기본 언어)
            alternates.push({
                lang: 'x-default',
                href: `${baseUrl}${route.path}`
            });

            urls.push({
                loc: url,
                lastmod: route.lastmod || currentDate,
                changefreq: route.changefreq || 'weekly',
                priority: route.priority || 0.5,
                alternates
            });
        });
    });

    return urls;
};

// XML 사이트맵 생성
export const generateXMLSitemap = (baseUrl: string = 'https://rinkorea.com'): string => {
    const urls = generateMultilingualUrls(baseUrl);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    urls.forEach(url => {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;

        if (url.lastmod) {
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        }

        if (url.changefreq) {
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        }

        if (url.priority !== undefined) {
            xml += `    <priority>${url.priority}</priority>\n`;
        }

        // hreflang 링크 추가
        if (url.alternates) {
            url.alternates.forEach(alternate => {
                xml += `    <xhtml:link rel="alternate" hreflang="${alternate.lang}" href="${escapeXml(alternate.href)}" />\n`;
            });
        }

        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
};

// JSON 사이트맵 생성 (구글 등에서 지원)
export const generateJSONSitemap = (baseUrl: string = 'https://rinkorea.com') => {
    const urls = generateMultilingualUrls(baseUrl);

    return {
        version: '1.0',
        generated: new Date().toISOString(),
        baseUrl,
        languages: supportedLanguages,
        urls: urls.map(url => ({
            url: url.loc,
            lastModified: url.lastmod,
            changeFrequency: url.changefreq,
            priority: url.priority,
            alternateUrls: url.alternates?.map(alt => ({
                language: alt.lang,
                url: alt.href
            }))
        }))
    };
};

// robots.txt 생성
export const generateRobotsTxt = (baseUrl: string = 'https://rinkorea.com'): string => {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-ko.xml
Sitemap: ${baseUrl}/sitemap-en.xml
Sitemap: ${baseUrl}/sitemap-zh.xml
Sitemap: ${baseUrl}/sitemap-id.xml

# Language-specific sitemaps
Sitemap: ${baseUrl}/sitemap-images.xml
Sitemap: ${baseUrl}/sitemap-news.xml

# Crawl delay
Crawl-delay: 1

# Block unnecessary crawling
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*
Disallow: /*?*gclid*

# Allow important pages
Allow: /products
Allow: /projects
Allow: /about
Allow: /contact
Allow: /shop
Allow: /news
Allow: /resources
`;
};

// 언어별 사이트맵 생성
export const generateLanguageSpecificSitemap = (language: Language, baseUrl: string = 'https://rinkorea.com'): string => {
    const langCode = {
        ko: 'ko-KR',
        en: 'en-US',
        zh: 'zh-CN',
        id: 'id-ID'
    }[language];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    routes.forEach(route => {
        const url = `${baseUrl}${route.path}?lang=${language}`;
        const currentDate = new Date().toISOString().split('T')[0];

        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <lastmod>${route.lastmod || currentDate}</lastmod>\n`;
        xml += `    <changefreq>${route.changefreq || 'weekly'}</changefreq>\n`;
        xml += `    <priority>${route.priority || 0.5}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
};

// XML 이스케이프 함수
const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

// 사이트맵 인덱스 생성
export const generateSitemapIndex = (baseUrl: string = 'https://rinkorea.com'): string => {
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 메인 사이트맵
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n';

    // 언어별 사이트맵
    supportedLanguages.forEach(lang => {
        xml += '  <sitemap>\n';
        xml += `    <loc>${baseUrl}/sitemap-${lang}.xml</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '  </sitemap>\n';
    });

    // 추가 사이트맵들
    const additionalSitemaps = ['images', 'news', 'products', 'projects'];
    additionalSitemaps.forEach(type => {
        xml += '  <sitemap>\n';
        xml += `    <loc>${baseUrl}/sitemap-${type}.xml</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '  </sitemap>\n';
    });

    xml += '</sitemapindex>';
    return xml;
};

// 사이트맵 파일 생성 (Node.js 환경용)
export const generateSitemapFiles = async (baseUrl: string = 'https://rinkorea.com', outputDir: string = './public') => {
    const fs = await import('fs');
    const path = await import('path');

    try {
        // 메인 사이트맵
        const mainSitemap = generateXMLSitemap(baseUrl);
        await fs.promises.writeFile(path.join(outputDir, 'sitemap.xml'), mainSitemap, 'utf8');

        // 언어별 사이트맵
        for (const lang of supportedLanguages) {
            const langSitemap = generateLanguageSpecificSitemap(lang, baseUrl);
            await fs.promises.writeFile(path.join(outputDir, `sitemap-${lang}.xml`), langSitemap, 'utf8');
        }

        // 사이트맵 인덱스
        const sitemapIndex = generateSitemapIndex(baseUrl);
        await fs.promises.writeFile(path.join(outputDir, 'sitemap-index.xml'), sitemapIndex, 'utf8');

        // robots.txt
        const robotsTxt = generateRobotsTxt(baseUrl);
        await fs.promises.writeFile(path.join(outputDir, 'robots.txt'), robotsTxt, 'utf8');

        // JSON 사이트맵
        const jsonSitemap = generateJSONSitemap(baseUrl);
        await fs.promises.writeFile(
            path.join(outputDir, 'sitemap.json'),
            JSON.stringify(jsonSitemap, null, 2),
            'utf8'
        );

        console.log('✅ Multilingual sitemaps generated successfully!');
        console.log(`📁 Files created in: ${outputDir}`);
        console.log('📄 Files:', [
            'sitemap.xml',
            'sitemap-index.xml',
            ...supportedLanguages.map(lang => `sitemap-${lang}.xml`),
            'robots.txt',
            'sitemap.json'
        ]);

    } catch (error) {
        console.error('❌ Error generating sitemaps:', error);
        throw error;
    }
};

export default {
    generateXMLSitemap,
    generateJSONSitemap,
    generateRobotsTxt,
    generateLanguageSpecificSitemap,
    generateSitemapIndex,
    generateSitemapFiles,
    generateMultilingualUrls,
    supportedLanguages,
    routes
}; 