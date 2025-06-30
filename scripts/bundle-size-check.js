#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle size thresholds (in KB)
const THRESHOLDS = {
    main: 300,      // Main bundle should be under 300KB
    vendor: 500,    // Vendor chunks should be under 500KB
    chunk: 200,     // Individual chunks should be under 200KB
    total: 1000     // Total bundle size should be under 1MB
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

function getColorForSize(size, threshold) {
    const ratio = size / (threshold * 1024);
    if (ratio > 1) return colors.red;
    if (ratio > 0.8) return colors.yellow;
    return colors.green;
}

function analyzeBundleSize() {
    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        console.log(`${colors.red}❌ Build directory not found. Run 'npm run build' first.${colors.reset}`);
        process.exit(1);
    }

    const assetsPath = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
        console.log(`${colors.red}❌ Assets directory not found.${colors.reset}`);
        process.exit(1);
    }

    const files = fs.readdirSync(assetsPath);
    const jsPath = path.join(assetsPath, 'js');

    let jsFiles = [];
    if (fs.existsSync(jsPath)) {
        jsFiles = fs.readdirSync(jsPath).filter(file => file.endsWith('.js'));
    }

    const cssFiles = files.filter(file => file.endsWith('.css'));

    let totalSize = 0;
    let mainSize = 0;
    let vendorSize = 0;
    const chunks = [];
    let issues = [];

    console.log(`\n${colors.bright}📊 Bundle Size Analysis${colors.reset}`);
    console.log('='.repeat(50));

    // Analyze JavaScript files
    console.log(`\n${colors.cyan}JavaScript Files:${colors.reset}`);
    jsFiles.forEach(file => {
        const filePath = path.join(jsPath, file);
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;
        totalSize += stats.size;

        const color = getColorForSize(stats.size, THRESHOLDS.chunk);
        console.log(`  ${color}${file}${colors.reset}: ${formatSize(stats.size)}`);

        // Categorize files
        if (file.includes('index-') || file.includes('main-')) {
            mainSize += stats.size;
            if (sizeKB > THRESHOLDS.main) {
                issues.push(`Main bundle (${file}) exceeds ${THRESHOLDS.main}KB: ${formatSize(stats.size)}`);
            }
        } else if (file.includes('vendor-') || file.includes('react-vendor')) {
            vendorSize += stats.size;
            if (sizeKB > THRESHOLDS.vendor) {
                issues.push(`Vendor bundle (${file}) exceeds ${THRESHOLDS.vendor}KB: ${formatSize(stats.size)}`);
            }
        } else {
            chunks.push({ file, size: stats.size });
            if (sizeKB > THRESHOLDS.chunk) {
                issues.push(`Chunk (${file}) exceeds ${THRESHOLDS.chunk}KB: ${formatSize(stats.size)}`);
            }
        }
    });

    // Analyze CSS files
    console.log(`\n${colors.cyan}CSS Files:${colors.reset}`);
    cssFiles.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;

        const color = getColorForSize(stats.size, 100); // 100KB threshold for CSS
        console.log(`  ${color}${file}${colors.reset}: ${formatSize(stats.size)}`);
    });

    // Summary
    console.log(`\n${colors.bright}📈 Bundle Summary:${colors.reset}`);
    console.log('-'.repeat(30));

    const totalColor = getColorForSize(totalSize, THRESHOLDS.total);
    console.log(`Total Size: ${totalColor}${formatSize(totalSize)}${colors.reset}`);

    if (mainSize > 0) {
        const mainColor = getColorForSize(mainSize, THRESHOLDS.main);
        console.log(`Main Bundle: ${mainColor}${formatSize(mainSize)}${colors.reset}`);
    }

    if (vendorSize > 0) {
        const vendorColor = getColorForSize(vendorSize, THRESHOLDS.vendor);
        console.log(`Vendor Bundles: ${vendorColor}${formatSize(vendorSize)}${colors.reset}`);
    }

    console.log(`Number of Chunks: ${chunks.length}`);
    console.log(`Number of JS Files: ${jsFiles.length}`);
    console.log(`Number of CSS Files: ${cssFiles.length}`);

    // Show largest chunks
    if (chunks.length > 0) {
        const sortedChunks = chunks.sort((a, b) => b.size - a.size).slice(0, 5);
        console.log(`\n${colors.cyan}🔍 Largest Chunks:${colors.reset}`);
        sortedChunks.forEach((chunk, index) => {
            const color = getColorForSize(chunk.size, THRESHOLDS.chunk);
            console.log(`  ${index + 1}. ${color}${chunk.file}${colors.reset}: ${formatSize(chunk.size)}`);
        });
    }

    // Performance recommendations
    console.log(`\n${colors.bright}💡 Performance Recommendations:${colors.reset}`);
    if (totalSize > THRESHOLDS.total * 1024) {
        console.log(`${colors.yellow}⚠️  Total bundle size exceeds ${THRESHOLDS.total}KB. Consider:${colors.reset}`);
        console.log('   - Further code splitting');
        console.log('   - Tree shaking optimization');
        console.log('   - Removing unused dependencies');
    }

    if (issues.length === 0) {
        console.log(`${colors.green}✅ All bundles are within size thresholds!${colors.reset}`);
    } else {
        console.log(`${colors.red}❌ Issues found:${colors.reset}`);
        issues.forEach(issue => {
            console.log(`   ${colors.red}•${colors.reset} ${issue}`);
        });
    }

    // Specific optimization suggestions
    console.log(`\n${colors.bright}🚀 Optimization Suggestions:${colors.reset}`);

    if (vendorSize > THRESHOLDS.vendor * 1024) {
        console.log(`${colors.yellow}📦 Large vendor bundle detected:${colors.reset}`);
        console.log('   - Consider splitting Radix UI components further');
        console.log('   - Move heavy libraries to separate chunks');
        console.log('   - Use dynamic imports for non-critical libraries');
    }

    if (jsFiles.length > 10) {
        console.log(`${colors.yellow}📂 Many JS files detected:${colors.reset}`);
        console.log('   - Consider consolidating smaller chunks');
        console.log('   - Review manual chunk configuration');
    }

    if (mainSize > THRESHOLDS.main * 1024) {
        console.log(`${colors.yellow}🎯 Large main bundle detected:${colors.reset}`);
        console.log('   - Move more code to lazy-loaded chunks');
        console.log('   - Consider route-based code splitting');
        console.log('   - Remove unused imports from main bundle');
    }

    console.log(`\n${colors.cyan}📋 Next Steps:${colors.reset}`);
    console.log('1. Run "npm run build:analyze" for detailed analysis');
    console.log('2. Use "npm run optimize-images" for image optimization');
    console.log('3. Consider implementing service worker for caching');
    console.log('4. Monitor bundle sizes with each build');

    // Exit with error code if issues found
    if (issues.length > 0 || totalSize > THRESHOLDS.total * 1024) {
        console.log(`\n${colors.red}❌ Bundle size check failed!${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`\n${colors.green}✅ Bundle size check passed!${colors.reset}`);
        process.exit(0);
    }
}

analyzeBundleSize(); 