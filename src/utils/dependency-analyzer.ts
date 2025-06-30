// 의존성 분석 및 최적화 유틸리티

// 큰 라이브러리들의 대안 제안
export const DEPENDENCY_OPTIMIZATION_TIPS = {
    'lodash': {
        issue: 'Full lodash bundle is large',
        solution: 'Use lodash-es or individual functions',
        impact: 'Can save 50-70KB'
    },
    'moment': {
        issue: 'Moment.js is very large and no longer maintained',
        solution: 'Use date-fns (already included) or dayjs',
        impact: 'Can save 200KB+'
    },
    'antd': {
        issue: 'Ant Design is very large',
        solution: 'Use Radix UI (already included) with custom styling',
        impact: 'Can save 500KB+'
    },
    'material-ui': {
        issue: 'Material-UI is large',
        solution: 'Use Radix UI (already included) with Tailwind',
        impact: 'Can save 300KB+'
    },
    'recharts': {
        issue: 'Recharts is 400KB+ (currently used)',
        solution: 'Consider chart.js or lightweight alternatives for simple charts',
        impact: 'Potential 200-300KB savings'
    }
};

// Tree shaking 최적화 체크
export const TREE_SHAKING_OPTIMIZATIONS = {
    imports: {
        bad: "import * as React from 'react'",
        good: "import { useState, useEffect } from 'react'",
        reason: 'Named imports enable better tree shaking'
    },
    lodash: {
        bad: "import _ from 'lodash'",
        good: "import { debounce } from 'lodash-es'",
        reason: 'Import only needed functions'
    },
    icons: {
        bad: "import * from 'lucide-react'",
        good: "import { Search, User } from 'lucide-react'",
        reason: 'Import only needed icons'
    }
};

// 현재 프로젝트에서 사용 중인 대용량 라이브러리들
export const CURRENT_LARGE_DEPENDENCIES = [
    {
        name: 'recharts',
        size: '~400KB',
        usage: 'Charts in various components',
        optimization: 'Consider lazy loading chart components',
        priority: 'medium'
    },
    {
        name: '@radix-ui/*',
        size: '~300KB total',
        usage: 'UI components throughout app',
        optimization: 'Already well optimized with code splitting',
        priority: 'low'
    },
    {
        name: 'react-query',
        size: '~50KB',
        usage: 'Data fetching',
        optimization: 'Well optimized',
        priority: 'low'
    },
    {
        name: 'framer-motion',
        size: '~100KB',
        usage: 'Animations',
        optimization: 'Consider conditional loading for animation-heavy pages',
        priority: 'medium'
    },
    {
        name: '@dnd-kit/*',
        size: '~80KB',
        usage: 'Drag and drop functionality',
        optimization: 'Lazy load only when needed',
        priority: 'high'
    }
];

// 번들 분석 결과 기반 최적화 제안
export const analyzeBundleAndSuggestOptimizations = () => {
    console.log('📊 Bundle Optimization Analysis\n');

    console.log('🔍 Large Dependencies Analysis:');
    CURRENT_LARGE_DEPENDENCIES.forEach(dep => {
        console.log(`\n${dep.name}:`);
        console.log(`  Size: ${dep.size}`);
        console.log(`  Usage: ${dep.usage}`);
        console.log(`  Optimization: ${dep.optimization}`);
        console.log(`  Priority: ${dep.priority}`);
    });

    console.log('\n💡 Tree Shaking Tips:');
    Object.entries(TREE_SHAKING_OPTIMIZATIONS).forEach(([key, tip]) => {
        console.log(`\n${key}:`);
        console.log(`  ❌ Bad: ${tip.bad}`);
        console.log(`  ✅ Good: ${tip.good}`);
        console.log(`  📝 Reason: ${tip.reason}`);
    });

    console.log('\n🚀 Recommended Actions:');
    console.log('1. Lazy load DND components (High Priority)');
    console.log('2. Consider chart component lazy loading (Medium Priority)');
    console.log('3. Implement conditional animation loading (Medium Priority)');
    console.log('4. Review import statements for tree shaking');
    console.log('5. Consider dynamic imports for heavy features');
};

// 코드 스플리팅 개선 제안
export const CODE_SPLITTING_IMPROVEMENTS = {
    'charts': {
        pattern: 'Chart components',
        suggestion: 'const ChartComponent = lazy(() => import("./ChartComponent"))',
        benefit: 'Reduces initial bundle size by ~100KB'
    },
    'dnd': {
        pattern: 'Drag and drop features',
        suggestion: 'const DndProvider = lazy(() => import("@dnd-kit/core"))',
        benefit: 'Reduces initial bundle size by ~80KB'
    },
    'admin': {
        pattern: 'Admin-only components',
        suggestion: 'Lazy load admin routes',
        benefit: 'Improves initial load for regular users'
    },
    'heavy-forms': {
        pattern: 'Complex form components',
        suggestion: 'Dynamic import form builders',
        benefit: 'Faster page loads for non-form pages'
    }
};

// 실행 시간 분석
export const analyzeRuntimePerformance = () => {
    if (typeof window === 'undefined') return;

    console.log('⚡ Runtime Performance Analysis:');

    // 메모리 사용량 (Chrome에서만 지원)
    if ('memory' in performance) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
        if (memory) {
            console.log(`Memory Usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
        }
    }

    // 타이밍 분석
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
        console.log('Timing Breakdown:');
        console.log(`  DNS Lookup: ${navigation.domainLookupEnd - navigation.domainLookupStart}ms`);
        console.log(`  TCP Connect: ${navigation.connectEnd - navigation.connectStart}ms`);
        console.log(`  Request: ${navigation.responseStart - navigation.requestStart}ms`);
        console.log(`  Response: ${navigation.responseEnd - navigation.responseStart}ms`);
        console.log(`  DOM Processing: ${navigation.domContentLoadedEventEnd - navigation.responseEnd}ms`);
    }
};

// 최적화 체크리스트
export const OPTIMIZATION_CHECKLIST = [
    '✅ Service Worker implemented',
    '✅ Code splitting configured',
    '✅ Images optimized (WebP)',
    '✅ Critical CSS inlined',
    '✅ Fonts optimized',
    '⏳ DND components lazy loading',
    '⏳ Chart components optimization',
    '⏳ Bundle size monitoring',
    '⏳ Runtime performance monitoring'
];

// 전체 최적화 분석 실행
export const runCompleteAnalysis = () => {
    console.log('🚀 Complete Performance Analysis\n');

    analyzeBundleAndSuggestOptimizations();
    analyzeRuntimePerformance();

    console.log('\n📋 Optimization Checklist:');
    OPTIMIZATION_CHECKLIST.forEach(item => console.log(`  ${item}`));

    console.log('\n🎯 Next Steps:');
    console.log('1. Implement DND lazy loading');
    console.log('2. Add chart component optimization');
    console.log('3. Set up continuous bundle monitoring');
    console.log('4. Implement performance budgets');
}; 