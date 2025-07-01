import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'images/optimized');

// 반응형 이미지 크기 설정
const IMAGE_SIZES = {
    thumbnail: { width: 400, quality: 85 },
    small: { width: 600, quality: 82 },
    medium: { width: 800, quality: 80 },
    large: { width: 1200, quality: 78 },
    xlarge: { width: 1600, quality: 75 },
    original: { width: 1920, quality: 75 }
};

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function optimizeImage(inputPath, outputPath, options = {}) {
    const {
        width,
        height,
        quality = 80,
        format = 'webp',
        progressive = true
    } = options;

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // 이미지가 지정된 크기보다 작으면 업스케일하지 않음
        const targetWidth = width && metadata.width ? Math.min(width, metadata.width) : width;
        const targetHeight = height && metadata.height ? Math.min(height, metadata.height) : height;

        // Resize if dimensions are provided
        if (targetWidth || targetHeight) {
            image.resize(targetWidth, targetHeight, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3 // 더 나은 리사이징 품질
            });
        }

        // Convert to WebP with advanced options
        if (format === 'webp') {
            await image
                .webp({
                    quality,
                    effort: 6, // 최고 압축 효율성
                    lossless: false,
                    nearLossless: false,
                    smartSubsample: true,
                    reductionEffort: 6
                })
                .toFile(outputPath);
        } else if (format === 'jpeg') {
            await image
                .jpeg({
                    quality,
                    progressive,
                    mozjpeg: true,
                    optimizeScans: true,
                    trellisQuantisation: true,
                    overshootDeringing: true
                })
                .toFile(outputPath);
        } else {
            await image
                .png({
                    quality,
                    compressionLevel: 9,
                    adaptiveFiltering: true
                })
                .toFile(outputPath);
        }

        const outputStats = await fs.stat(outputPath);
        return {
            originalSize: metadata.size || 0,
            optimizedSize: outputStats.size,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            targetWidth,
            targetHeight
        };
    } catch (error) {
        console.error(`Error optimizing ${inputPath}:`, error);
        throw error;
    }
}

async function processImages() {
    try {
        await ensureDirectoryExists(OPTIMIZED_DIR);

        const files = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
        const imageFiles = files
            .filter(file =>
                file.isFile() &&
                /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file.name) &&
                !file.name.includes('optimized')
            )
            .map(file => file.name);

        console.log(`Found ${imageFiles.length} images to optimize`);

        if (imageFiles.length === 0) {
            console.log('No images found to optimize.');
            return;
        }

        let totalOriginalSize = 0;
        let totalOptimizedSize = 0;
        let processedCount = 0;

        for (const file of imageFiles) {
            const inputPath = path.join(IMAGES_DIR, file);
            const baseName = path.parse(file).name;

            console.log(`\nProcessing ${file}...`);

            try {
                // 원본 이미지 크기 확인
                const originalStats = await fs.stat(inputPath);
                const metadata = await sharp(inputPath).metadata();

                console.log(`  Original: ${(originalStats.size / 1024).toFixed(1)}KB (${metadata.width}x${metadata.height})`);

                // 기본 WebP 버전 생성 (가장 중요)
                const mainOutputPath = path.join(OPTIMIZED_DIR, `${baseName}.webp`);
                const mainResult = await optimizeImage(inputPath, mainOutputPath, {
                    width: IMAGE_SIZES.original.width,
                    quality: IMAGE_SIZES.original.quality,
                    format: 'webp'
                });

                totalOriginalSize += mainResult.originalSize;
                totalOptimizedSize += mainResult.optimizedSize;

                const savings = ((mainResult.originalSize - mainResult.optimizedSize) / mainResult.originalSize * 100).toFixed(1);
                console.log(`  ✓ Main WebP: ${(mainResult.optimizedSize / 1024).toFixed(1)}KB (${savings}% savings)`);

                // 반응형 크기 생성 (큰 이미지에만 적용)
                if (metadata.width && metadata.width > 800) {
                    const sizesToGenerate = Object.entries(IMAGE_SIZES).filter(([key, size]) =>
                        key !== 'original' && size.width < metadata.width
                    );

                    for (const [sizeName, sizeConfig] of sizesToGenerate) {
                        const responsiveOutputPath = path.join(OPTIMIZED_DIR, `${baseName}-${sizeName}.webp`);

                        try {
                            await optimizeImage(inputPath, responsiveOutputPath, {
                                width: sizeConfig.width,
                                quality: sizeConfig.quality,
                                format: 'webp'
                            });

                            const responsiveStats = await fs.stat(responsiveOutputPath);
                            console.log(`    → ${sizeName}: ${(responsiveStats.size / 1024).toFixed(1)}KB (${sizeConfig.width}px)`);

                        } catch (error) {
                            console.warn(`    ⚠ Failed to create ${sizeName} version:`, error.message);
                        }
                    }
                }

                // JPEG fallback 생성 (WebP 미지원 브라우저용)
                const jpegOutputPath = path.join(OPTIMIZED_DIR, `${baseName}.jpg`);
                try {
                    await optimizeImage(inputPath, jpegOutputPath, {
                        width: IMAGE_SIZES.original.width,
                        quality: IMAGE_SIZES.original.quality + 5, // JPEG는 약간 높은 품질
                        format: 'jpeg'
                    });

                    const jpegStats = await fs.stat(jpegOutputPath);
                    console.log(`  ✓ JPEG fallback: ${(jpegStats.size / 1024).toFixed(1)}KB`);
                } catch (error) {
                    console.warn(`  ⚠ Failed to create JPEG fallback:`, error.message);
                }

                processedCount++;

            } catch (error) {
                console.error(`  ✗ Failed to process ${file}:`, error.message);
            }
        }

        // 최종 통계
        console.log('\n' + '='.repeat(50));
        console.log('Optimization Summary:');
        console.log(`Files processed: ${processedCount}/${imageFiles.length}`);
        console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB`);
        console.log(`Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(1)}MB`);

        if (totalOriginalSize > 0) {
            const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
            console.log(`Total savings: ${totalSavings}%`);
        }

        console.log('\nOptimization complete! 🎉');

        // 최적화 리포트 생성
        await generateOptimizationReport(processedCount, totalOriginalSize, totalOptimizedSize);

    } catch (error) {
        console.error('Error during image optimization:', error);
        process.exit(1);
    }
}

async function generateOptimizationReport(processedCount, originalSize, optimizedSize) {
    const report = {
        timestamp: new Date().toISOString(),
        processedFiles: processedCount,
        originalSizeMB: (originalSize / 1024 / 1024).toFixed(2),
        optimizedSizeMB: (optimizedSize / 1024 / 1024).toFixed(2),
        savingsPercent: originalSize > 0 ? ((originalSize - optimizedSize) / originalSize * 100).toFixed(1) : 0,
        generatedSizes: Object.keys(IMAGE_SIZES)
    };

    const reportPath = path.join(OPTIMIZED_DIR, 'optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${reportPath}`);
}

// CLI 인자 처리
const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const specificFile = args.find(arg => !arg.startsWith('--'));

if (isWatch) {
    console.log('Watching for image changes...');

    const chokidar = await import('chokidar');
    const watcher = chokidar.watch(IMAGES_DIR, {
        ignored: /optimized/,
        persistent: true,
        ignoreInitial: false
    });

    watcher.on('add', async (filePath) => {
        if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(filePath)) {
            console.log(`New image detected: ${path.basename(filePath)}`);
            // 개별 파일 처리 로직 추가 가능
        }
    });

    watcher.on('change', async (filePath) => {
        if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(filePath)) {
            console.log(`Image changed: ${path.basename(filePath)}`);
            // 개별 파일 처리 로직 추가 가능
        }
    });
} else {
    processImages();
} 