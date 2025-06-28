#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 지원 언어
const supportedLanguages = ['ko', 'en', 'zh', 'id'];

// 사이트 기본 정보
const baseUrl = 'https://rinkorea.com';
const outputDir = path.join(__dirname, '../public');

// 라우트 설정
const routes = [
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

// XML 이스케이프 함수
const escapeXml = (unsafe) => {
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

// 메인 다국어 사이트맵 생성
const generateMainSitemap = () => {
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    routes.forEach(route => {
        supportedLanguages.forEach(lang => {
            const url = `${baseUrl}${route.path}?lang=${lang}`;

            xml += '  <url>\n';
            xml += `    <loc>${escapeXml(url)}</loc>\n`;
            xml += `    <lastmod>${currentDate}</lastmod>\n`;
            xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
            xml += `    <priority>${route.priority}</priority>\n`;

            // hreflang 링크 추가
            supportedLanguages.forEach(altLang => {
                const altLangCode = {
                    ko: 'ko-KR',
                    en: 'en-US',
                    zh: 'zh-CN',
                    id: 'id-ID'
                }[altLang];

                const altUrl = `${baseUrl}${route.path}?lang=${altLang}`;
                xml += `    <xhtml:link rel="alternate" hreflang="${altLangCode}" href="${escapeXml(altUrl)}" />\n`;
            });

            // x-default 추가
            xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(baseUrl + route.path)}" />\n`;

            xml += '  </url>\n';
        });
    });

    xml += '</urlset>';
    return xml;
};

// 언어별 사이트맵 생성
const generateLanguageSitemap = (language) => {
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    routes.forEach(route => {
        const url = `${baseUrl}${route.path}?lang=${language}`;

        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
        xml += `    <priority>${route.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
};

// 사이트맵 인덱스 생성
const generateSitemapIndex = () => {
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

    xml += '</sitemapindex>';
    return xml;
};

// robots.txt 생성
const generateRobotsTxt = () => {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml
${supportedLanguages.map(lang => `Sitemap: ${baseUrl}/sitemap-${lang}.xml`).join('\n')}

# Language-specific content
Allow: /?lang=ko
Allow: /?lang=en
Allow: /?lang=zh
Allow: /?lang=id

# Block unnecessary crawling
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*
Disallow: /*?*gclid*

# Crawl delay
Crawl-delay: 1

# Important pages
Allow: /products
Allow: /projects
Allow: /about
Allow: /contact
Allow: /shop
Allow: /news
Allow: /resources
`;
};

// JSON 사이트맵 생성
const generateJSONSitemap = () => {
    const currentDate = new Date().toISOString();
    const urls = [];

    routes.forEach(route => {
        supportedLanguages.forEach(lang => {
            const url = `${baseUrl}${route.path}?lang=${lang}`;
            const alternateUrls = supportedLanguages.map(altLang => ({
                language: {
                    ko: 'ko-KR',
                    en: 'en-US',
                    zh: 'zh-CN',
                    id: 'id-ID'
                }[altLang],
                url: `${baseUrl}${route.path}?lang=${altLang}`
            }));

            urls.push({
                url,
                lastModified: currentDate.split('T')[0],
                changeFrequency: route.changefreq,
                priority: route.priority,
                language: {
                    ko: 'ko-KR',
                    en: 'en-US',
                    zh: 'zh-CN',
                    id: 'id-ID'
                }[lang],
                alternateUrls
            });
        });
    });

    return JSON.stringify({
        version: '1.0',
        generated: currentDate,
        baseUrl,
        supportedLanguages,
        totalUrls: urls.length,
        urls
    }, null, 2);
};

// 메인 실행 함수
const generateSitemaps = async () => {
    try {
        console.log('🚀 Generating multilingual sitemaps...');

        // 출력 디렉토리 확인
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 메인 사이트맵 생성
        const mainSitemap = generateMainSitemap();
        fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), mainSitemap, 'utf8');
        console.log('✅ Generated: sitemap.xml');

        // 언어별 사이트맵 생성
        supportedLanguages.forEach(lang => {
            const langSitemap = generateLanguageSitemap(lang);
            fs.writeFileSync(path.join(outputDir, `sitemap-${lang}.xml`), langSitemap, 'utf8');
            console.log(`✅ Generated: sitemap-${lang}.xml`);
        });

        // 사이트맵 인덱스 생성
        const sitemapIndex = generateSitemapIndex();
        fs.writeFileSync(path.join(outputDir, 'sitemap-index.xml'), sitemapIndex, 'utf8');
        console.log('✅ Generated: sitemap-index.xml');

        // robots.txt 생성
        const robotsTxt = generateRobotsTxt();
        fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt, 'utf8');
        console.log('✅ Generated: robots.txt');

        // JSON 사이트맵 생성
        const jsonSitemap = generateJSONSitemap();
        fs.writeFileSync(path.join(outputDir, 'sitemap.json'), jsonSitemap, 'utf8');
        console.log('✅ Generated: sitemap.json');

        console.log('\n🎉 All sitemaps generated successfully!');
        console.log(`📁 Location: ${outputDir}`);
        console.log('📊 Statistics:');
        console.log(`   • Languages: ${supportedLanguages.length}`);
        console.log(`   • Routes: ${routes.length}`);
        console.log(`   • Total URLs: ${routes.length * supportedLanguages.length}`);
        console.log('\n📋 Generated files:');
        console.log('   • sitemap.xml (main multilingual sitemap)');
        console.log('   • sitemap-index.xml (sitemap index)');
        supportedLanguages.forEach(lang => {
            console.log(`   • sitemap-${lang}.xml (${lang} specific)`);
        });
        console.log('   • robots.txt (search engine directives)');
        console.log('   • sitemap.json (structured data)');

    } catch (error) {
        console.error('❌ Error generating sitemaps:', error);
        process.exit(1);
    }
};

// 직접 실행 시 사이트맵 생성
generateSitemaps();

export {
    generateSitemaps,
    generateMainSitemap,
    generateLanguageSitemap,
    generateSitemapIndex,
    generateRobotsTxt,
    generateJSONSitemap,
    supportedLanguages,
    routes,
    baseUrl
}; 