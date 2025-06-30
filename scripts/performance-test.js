#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance thresholds based on Lighthouse recommendations
const PERFORMANCE_THRESHOLDS = {
    // Core Web Vitals
    FCP: 1800,        // First Contentful Paint (ms)
    LCP: 2500,        // Largest Contentful Paint (ms)
    CLS: 0.1,         // Cumulative Layout Shift
    FID: 100,         // First Input Delay (ms)
    TTI: 3800,        // Time to Interactive (ms)

    // Bundle metrics
    initialJS: 200,   // Initial JavaScript size (KB)
    totalJS: 500,     // Total JavaScript size (KB)
    totalCSS: 100,    // Total CSS size (KB)

    // Resource counts
    requests: 50,     // Total HTTP requests
    images: 20,       // Number of images

    // Caching
    cachableResources: 0.8  // 80% of resources should be cachable
};

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getPerformanceScore(metric, threshold, reverse = false) {
    const ratio = reverse ? threshold / metric : metric / threshold;
    if (ratio <= 0.5) return { score: 100, color: colors.green, status: '🟢' };
    if (ratio <= 0.8) return { score: 80, color: colors.yellow, status: '🟡' };
    if (ratio <= 1.0) return { score: 60, color: colors.yellow, status: '🟡' };
    return { score: 0, color: colors.red, status: '🔴' };
}

function analyzeBundle() {
    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        console.log(`${colors.red}❌ Build not found. Run 'npm run build' first.${colors.reset}`);
        return null;
    }

    const assetsPath = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
        console.log(`${colors.red}❌ Assets directory not found.${colors.reset}`);
        return null;
    }

    const jsPath = path.join(assetsPath, 'js');
    const files = fs.readdirSync(assetsPath);

    let totalJSSize = 0;
    let totalCSSSize = 0;
    let initialJSSize = 0;

    let jsFiles = [];
    if (fs.existsSync(jsPath)) {
        jsFiles = fs.readdirSync(jsPath).filter(f => f.endsWith('.js'));
    }

    const cssFiles = files.filter(f => f.endsWith('.css'));

    // Calculate JavaScript sizes
    jsFiles.forEach(file => {
        const filePath = path.join(jsPath, file);
        const size = fs.statSync(filePath).size;
        totalJSSize += size;

        // Consider main/index files as initial JS
        if (file.includes('index-') || file.includes('main-')) {
            initialJSSize += size;
        }
    });

    // Calculate CSS sizes
    cssFiles.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const size = fs.statSync(filePath).size;
        totalCSSSize += size;
    });

    return {
        totalJSSize: totalJSSize / 1024, // Convert to KB
        totalCSSSize: totalCSSSize / 1024,
        initialJSSize: initialJSSize / 1024,
        jsFileCount: jsFiles.length,
        cssFileCount: cssFiles.length,
        totalFiles: files.length
    };
}

function analyzeImages() {
    const publicPath = path.join(process.cwd(), 'public');
    const imagesPath = path.join(publicPath, 'images');

    if (!fs.existsSync(imagesPath)) {
        return { total: 0, optimized: 0, unoptimized: 0 };
    }

    const images = fs.readdirSync(imagesPath, { recursive: true })
        .filter(file => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file));

    const optimizedImages = images.filter(file => file.includes('optimized/') || file.endsWith('.webp'));

    return {
        total: images.length,
        optimized: optimizedImages.length,
        unoptimized: images.length - optimizedImages.length
    };
}

function checkServiceWorker() {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    return fs.existsSync(swPath);
}

function checkCaching() {
    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        return { cachable: 0, total: 0, ratio: 0 };
    }

    const assetsPath = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
        return { cachable: 0, total: 0, ratio: 0 };
    }

    let allFiles = [];

    // Check files in assets root
    const rootFiles = fs.readdirSync(assetsPath);
    allFiles = [...rootFiles.filter(file => !fs.statSync(path.join(assetsPath, file)).isDirectory())];

    // Check files in js subdirectory
    const jsPath = path.join(assetsPath, 'js');
    if (fs.existsSync(jsPath)) {
        const jsFiles = fs.readdirSync(jsPath);
        allFiles = [...allFiles, ...jsFiles];
    }

    // Files with hashes are cachable (looking for 8+ character hash patterns)
    const cachableFiles = allFiles.filter(file => /\-[a-zA-Z0-9_]{8,}\./i.test(file));

    return {
        cachable: cachableFiles.length,
        total: allFiles.length,
        ratio: allFiles.length > 0 ? cachableFiles.length / allFiles.length : 0
    };
}

function generateRecommendations(analysis, images, caching) {
    const recommendations = [];

    // Bundle size recommendations
    if (analysis && analysis.initialJSSize > PERFORMANCE_THRESHOLDS.initialJS) {
        recommendations.push({
            type: 'critical',
            message: `Initial JS bundle (${analysis.initialJSSize.toFixed(1)}KB) exceeds ${PERFORMANCE_THRESHOLDS.initialJS}KB`,
            solution: 'Implement more aggressive code splitting and lazy loading'
        });
    }

    if (analysis && analysis.totalJSSize > PERFORMANCE_THRESHOLDS.totalJS) {
        recommendations.push({
            type: 'warning',
            message: `Total JS size (${analysis.totalJSSize.toFixed(1)}KB) exceeds ${PERFORMANCE_THRESHOLDS.totalJS}KB`,
            solution: 'Remove unused dependencies and optimize vendor chunks'
        });
    }

    if (analysis && analysis.totalCSSSize > PERFORMANCE_THRESHOLDS.totalCSS) {
        recommendations.push({
            type: 'warning',
            message: `Total CSS size (${analysis.totalCSSSize.toFixed(1)}KB) exceeds ${PERFORMANCE_THRESHOLDS.totalCSS}KB`,
            solution: 'Remove unused CSS and optimize Tailwind purging'
        });
    }

    // Image optimization recommendations
    if (images.unoptimized > 0) {
        recommendations.push({
            type: 'warning',
            message: `${images.unoptimized} unoptimized images found`,
            solution: 'Run "npm run optimize-images" to convert images to WebP format'
        });
    }

    // Caching recommendations
    if (caching.ratio < PERFORMANCE_THRESHOLDS.cachableResources) {
        recommendations.push({
            type: 'critical',
            message: `Only ${(caching.ratio * 100).toFixed(1)}% of assets are cachable`,
            solution: 'Ensure all assets have content hashes for long-term caching'
        });
    }

    // Service worker recommendation
    if (!checkServiceWorker()) {
        recommendations.push({
            type: 'info',
            message: 'No service worker detected',
            solution: 'Consider implementing a service worker for offline caching'
        });
    }

    return recommendations;
}

function runPerformanceTest() {
    console.log(`\n${colors.bright}🚀 Performance Analysis Report${colors.reset}`);
    console.log('='.repeat(60));

    // Analyze bundle
    const bundleAnalysis = analyzeBundle();
    const imageAnalysis = analyzeImages();
    const cachingAnalysis = checkCaching();

    let overallScore = 100;
    const scores = [];

    console.log(`\n${colors.cyan}📦 Bundle Analysis:${colors.reset}`);
    console.log('-'.repeat(30));

    if (bundleAnalysis) {
        // Initial JS Score
        const initialJSScore = getPerformanceScore(bundleAnalysis.initialJSSize, PERFORMANCE_THRESHOLDS.initialJS);
        scores.push(initialJSScore.score);
        console.log(`Initial JS Size: ${initialJSScore.color}${bundleAnalysis.initialJSSize.toFixed(1)}KB${colors.reset} ${initialJSScore.status}`);

        // Total JS Score
        const totalJSScore = getPerformanceScore(bundleAnalysis.totalJSSize, PERFORMANCE_THRESHOLDS.totalJS);
        scores.push(totalJSScore.score);
        console.log(`Total JS Size: ${totalJSScore.color}${bundleAnalysis.totalJSSize.toFixed(1)}KB${colors.reset} ${totalJSScore.status}`);

        // CSS Score
        const cssScore = getPerformanceScore(bundleAnalysis.totalCSSSize, PERFORMANCE_THRESHOLDS.totalCSS);
        scores.push(cssScore.score);
        console.log(`Total CSS Size: ${cssScore.color}${bundleAnalysis.totalCSSSize.toFixed(1)}KB${colors.reset} ${cssScore.status}`);

        console.log(`JavaScript Files: ${bundleAnalysis.jsFileCount}`);
        console.log(`CSS Files: ${bundleAnalysis.cssFileCount}`);
    } else {
        console.log(`${colors.red}❌ Unable to analyze bundle - build required${colors.reset}`);
        scores.push(0);
    }

    console.log(`\n${colors.cyan}🖼️  Image Optimization:${colors.reset}`);
    console.log('-'.repeat(30));

    const imageOptScore = imageAnalysis.total > 0 ? (imageAnalysis.optimized / imageAnalysis.total) * 100 : 100;
    const imageScore = imageOptScore >= 80 ?
        { color: colors.green, status: '🟢' } :
        imageOptScore >= 60 ? { color: colors.yellow, status: '🟡' } :
            { color: colors.red, status: '🔴' };

    scores.push(imageOptScore);
    console.log(`Total Images: ${imageAnalysis.total}`);
    console.log(`Optimized: ${imageScore.color}${imageAnalysis.optimized}${colors.reset} ${imageScore.status}`);
    console.log(`Unoptimized: ${imageAnalysis.unoptimized}`);
    console.log(`Optimization Rate: ${imageScore.color}${imageOptScore.toFixed(1)}%${colors.reset}`);

    console.log(`\n${colors.cyan}💾 Caching Strategy:${colors.reset}`);
    console.log('-'.repeat(30));

    const cachingScore = cachingAnalysis.ratio * 100;
    const cacheScore = cachingScore >= 80 ?
        { color: colors.green, status: '🟢' } :
        cachingScore >= 60 ? { color: colors.yellow, status: '🟡' } :
            { color: colors.red, status: '🔴' };

    scores.push(cachingScore);
    console.log(`Cachable Assets: ${cacheScore.color}${cachingAnalysis.cachable}/${cachingAnalysis.total}${colors.reset} ${cacheScore.status}`);
    console.log(`Caching Rate: ${cacheScore.color}${cachingScore.toFixed(1)}%${colors.reset}`);

    const hasServiceWorker = checkServiceWorker();
    const swStatus = hasServiceWorker ?
        { color: colors.green, status: '🟢', text: 'Enabled' } :
        { color: colors.yellow, status: '🟡', text: 'Not Found' };
    console.log(`Service Worker: ${swStatus.color}${swStatus.text}${colors.reset} ${swStatus.status}`);

    // Calculate overall score
    overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    console.log(`\n${colors.bright}📊 Overall Performance Score:${colors.reset}`);
    console.log('-'.repeat(30));

    const overallColor = overallScore >= 80 ? colors.green : overallScore >= 60 ? colors.yellow : colors.red;
    const overallStatus = overallScore >= 80 ? '🟢' : overallScore >= 60 ? '🟡' : '🔴';

    console.log(`Score: ${overallColor}${overallScore.toFixed(1)}/100${colors.reset} ${overallStatus}`);

    // Generate recommendations
    const recommendations = generateRecommendations(bundleAnalysis, imageAnalysis, cachingAnalysis);

    if (recommendations.length > 0) {
        console.log(`\n${colors.bright}💡 Recommendations:${colors.reset}`);
        console.log('-'.repeat(30));

        recommendations.forEach((rec, index) => {
            const icon = rec.type === 'critical' ? '🔴' : rec.type === 'warning' ? '🟡' : '🔵';
            console.log(`\n${icon} ${colors.bright}${rec.message}${colors.reset}`);
            console.log(`   💡 ${rec.solution}`);
        });
    }

    console.log(`\n${colors.bright}🎯 Performance Targets:${colors.reset}`);
    console.log('-'.repeat(30));
    console.log(`• First Contentful Paint: < ${PERFORMANCE_THRESHOLDS.FCP}ms`);
    console.log(`• Largest Contentful Paint: < ${PERFORMANCE_THRESHOLDS.LCP}ms`);
    console.log(`• Time to Interactive: < ${PERFORMANCE_THRESHOLDS.TTI}ms`);
    console.log(`• Cumulative Layout Shift: < ${PERFORMANCE_THRESHOLDS.CLS}`);
    console.log(`• Initial JavaScript: < ${PERFORMANCE_THRESHOLDS.initialJS}KB`);

    console.log(`\n${colors.cyan}📋 Next Steps:${colors.reset}`);
    console.log('1. Run "npm run build" to generate production build');
    console.log('2. Run "npm run size-check" for detailed bundle analysis');
    console.log('3. Use "npm run optimize-images" for image optimization');
    console.log('4. Test with Lighthouse for real-world metrics');
    console.log('5. Deploy and monitor with Web Vitals');

    // Exit code based on score
    if (overallScore < 60) {
        console.log(`\n${colors.red}❌ Performance test failed! Score below 60.${colors.reset}`);
        process.exit(1);
    } else if (overallScore < 80) {
        console.log(`\n${colors.yellow}⚠️  Performance needs improvement. Score below 80.${colors.reset}`);
        process.exit(0);
    } else {
        console.log(`\n${colors.green}✅ Excellent performance! Score above 80.${colors.reset}`);
        process.exit(0);
    }
}

runPerformanceTest(); 