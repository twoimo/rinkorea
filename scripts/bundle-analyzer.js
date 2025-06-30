const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 번들 분석 함수
function analyzeBundle() {
    console.log('🔍 번들 크기 분석 시작...\n');

    // 빌드 실행
    try {
        execSync('npm run build', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ 빌드 실패:', error.message);
        process.exit(1);
    }

    // dist 디렉토리 분석
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');

    if (!fs.existsSync(assetsPath)) {
        console.error('❌ dist/assets 디렉토리를 찾을 수 없습니다.');
        process.exit(1);
    }

    // 파일별 크기 분석
    const files = fs.readdirSync(assetsPath, { recursive: true });
    const fileStats = [];

    files.forEach(file => {
        const filePath = path.join(assetsPath, file);
        if (fs.statSync(filePath).isFile()) {
            const size = fs.statSync(filePath).size;
            const ext = path.extname(file);

            fileStats.push({
                name: file,
                size: size,
                sizeKB: Math.round(size / 1024 * 100) / 100,
                type: ext,
                path: filePath
            });
        }
    });

    // 크기별 정렬
    fileStats.sort((a, b) => b.size - a.size);

    // 결과 출력
    console.log('📊 번들 분석 결과\n');
    console.log('='.repeat(80));
    console.log('파일명'.padEnd(50) + '크기'.padEnd(15) + '타입');
    console.log('='.repeat(80));

    let totalSize = 0;
    const typeStats = {};

    fileStats.forEach(file => {
        console.log(
            file.name.padEnd(50) +
            `${file.sizeKB}KB`.padEnd(15) +
            file.type
        );

        totalSize += file.size;
        typeStats[file.type] = (typeStats[file.type] || 0) + file.size;
    });

    console.log('='.repeat(80));
    console.log(`총 크기: ${Math.round(totalSize / 1024 * 100) / 100}KB\n`);

    // 타입별 통계
    console.log('📈 파일 타입별 통계\n');
    Object.entries(typeStats)
        .sort(([, a], [, b]) => b - a)
        .forEach(([type, size]) => {
            const sizeKB = Math.round(size / 1024 * 100) / 100;
            const percentage = Math.round(size / totalSize * 100);
            console.log(`${type || '기타'}: ${sizeKB}KB (${percentage}%)`);
        });

    // 대용량 파일 경고
    console.log('\n⚠️  최적화 권장사항\n');
    const largeFiles = fileStats.filter(file => file.sizeKB > 100);

    if (largeFiles.length > 0) {
        console.log('🔴 대용량 파일 (100KB 초과):');
        largeFiles.forEach(file => {
            console.log(`   - ${file.name} (${file.sizeKB}KB)`);
        });
        console.log();
    }

    // JavaScript 청크 분석
    const jsFiles = fileStats.filter(file => file.type === '.js');
    if (jsFiles.length > 0) {
        console.log('📦 JavaScript 청크:');
        jsFiles.forEach(file => {
            let recommendation = '';
            if (file.sizeKB > 200) recommendation = ' ⚠️  매우 큰 청크';
            else if (file.sizeKB > 100) recommendation = ' ⚠️  큰 청크';

            console.log(`   - ${file.name} (${file.sizeKB}KB)${recommendation}`);
        });
        console.log();
    }

    // CSS 파일 분석
    const cssFiles = fileStats.filter(file => file.type === '.css');
    if (cssFiles.length > 0) {
        console.log('🎨 CSS 파일:');
        cssFiles.forEach(file => {
            let recommendation = '';
            if (file.sizeKB > 50) recommendation = ' ⚠️  큰 CSS 파일';

            console.log(`   - ${file.name} (${file.sizeKB}KB)${recommendation}`);
        });
        console.log();
    }

    // 권장사항
    console.log('💡 성능 최적화 권장사항:\n');

    if (largeFiles.length > 0) {
        console.log('   1. 코드 스플리팅으로 큰 청크를 더 작은 단위로 분할');
    }

    if (jsFiles.some(f => f.sizeKB > 100)) {
        console.log('   2. Tree shaking으로 사용하지 않는 코드 제거');
    }

    if (cssFiles.some(f => f.sizeKB > 30)) {
        console.log('   3. Critical CSS 인라인화 및 나머지 CSS 지연 로딩');
    }

    console.log('   4. 이미지 최적화 (WebP 변환, 압축)');
    console.log('   5. Gzip/Brotli 압축 적용');
    console.log('   6. Service Worker 캐싱 전략 활용\n');

    return fileStats;
}

// 번들 크기 추적 (이전 빌드와 비교)
function trackBundleSize(fileStats) {
    const statsFile = path.join(process.cwd(), 'bundle-stats.json');
    let previousStats = {};

    if (fs.existsSync(statsFile)) {
        try {
            previousStats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
        } catch (error) {
            console.log('⚠️  이전 번들 통계를 읽을 수 없습니다.');
        }
    }

    const currentStats = {
        timestamp: new Date().toISOString(),
        totalSize: fileStats.reduce((sum, file) => sum + file.size, 0),
        files: fileStats.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
        }))
    };

    // 크기 변화 비교
    if (previousStats.totalSize) {
        const sizeDiff = currentStats.totalSize - previousStats.totalSize;
        const sizeDiffKB = Math.round(sizeDiff / 1024 * 100) / 100;
        const percentage = Math.round(sizeDiff / previousStats.totalSize * 100);

        console.log('📊 번들 크기 변화\n');
        if (sizeDiff > 0) {
            console.log(`🔴 크기 증가: +${sizeDiffKB}KB (+${percentage}%)`);
        } else if (sizeDiff < 0) {
            console.log(`🟢 크기 감소: ${sizeDiffKB}KB (${percentage}%)`);
        } else {
            console.log('⚪ 크기 변화 없음');
        }
        console.log();
    }

    // 통계 저장
    fs.writeFileSync(statsFile, JSON.stringify(currentStats, null, 2));
}

// 실행
if (require.main === module) {
    const stats = analyzeBundle();
    trackBundleSize(stats);
}

module.exports = { analyzeBundle, trackBundleSize }; 