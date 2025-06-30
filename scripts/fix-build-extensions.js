#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function fixBuildExtensions() {
    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        console.log(`${colors.yellow}⚠️  Dist directory not found.${colors.reset}`);
        return;
    }

    console.log(`${colors.cyan}🔧 Fixing build file extensions...${colors.reset}`);

    function processDirectory(dirPath) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                processDirectory(fullPath);
            } else if (entry.name.endsWith('.tsx')) {
                // Rename .tsx files to .js
                const newName = entry.name.replace(/\.tsx$/, '.js');
                const newPath = path.join(dirPath, newName);

                fs.renameSync(fullPath, newPath);
                console.log(`${colors.green}✓${colors.reset} Renamed: ${entry.name} → ${newName}`);

                // Update any references in HTML files
                updateHtmlReferences(entry.name, newName);
            }
        }
    }

    function updateHtmlReferences(oldName, newName) {
        const htmlPath = path.join(distPath, 'index.html');

        if (fs.existsSync(htmlPath)) {
            let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
            const oldPath = oldName;
            const newPath = newName;

            if (htmlContent.includes(oldPath)) {
                htmlContent = htmlContent.replace(new RegExp(oldPath, 'g'), newPath);
                fs.writeFileSync(htmlPath, htmlContent);
                console.log(`${colors.blue}📝${colors.reset} Updated HTML references: ${oldPath} → ${newPath}`);
            }
        }
    }

    processDirectory(distPath);
    console.log(`${colors.green}✅ Build extension fix completed!${colors.reset}`);
}

fixBuildExtensions(); 