import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'images/optimized');

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
        format = 'webp'
    } = options;

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if dimensions are provided
    if (width || height) {
        image.resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
        });
    }

    // Convert to WebP
    if (format === 'webp') {
        await image
            .webp({ quality })
            .toFile(outputPath);
    } else {
        await image
            .jpeg({ quality })
            .toFile(outputPath);
    }

    return {
        originalSize: metadata.size,
        optimizedSize: (await fs.stat(outputPath)).size,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height
    };
}

async function processImages() {
    try {
        await ensureDirectoryExists(OPTIMIZED_DIR);

        const files = await fs.readdir(IMAGES_DIR);
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png)$/i.test(file) &&
            !file.includes('optimized')
        );

        console.log(`Found ${imageFiles.length} images to optimize`);

        for (const file of imageFiles) {
            const inputPath = path.join(IMAGES_DIR, file);
            const outputPath = path.join(
                OPTIMIZED_DIR,
                `${path.parse(file).name}.webp`
            );

            console.log(`Processing ${file}...`);

            const result = await optimizeImage(inputPath, outputPath, {
                width: 1920, // Max width
                quality: 80
            });

            const savings = ((result.originalSize - result.optimizedSize) / result.originalSize * 100).toFixed(1);
            console.log(`✓ Optimized ${file}:`);
            console.log(`  Original: ${(result.originalSize / 1024).toFixed(1)}KB`);
            console.log(`  Optimized: ${(result.optimizedSize / 1024).toFixed(1)}KB`);
            console.log(`  Savings: ${savings}%`);
            console.log(`  Format: ${result.format} → WebP`);
            console.log(`  Dimensions: ${result.width}x${result.height}`);
        }

        console.log('\nOptimization complete!');
    } catch (error) {
        console.error('Error optimizing images:', error);
        process.exit(1);
    }
}

processImages(); 