const fs = require('fs');
const path = require('path');
const glob = require('glob');

// TypeScript/React 파일들 찾기
const files = glob.sync('src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

files.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // createPortal이 있는지 확인
        if (content.includes('createPortal(') && content.includes('import { createPortal }')) {

            // createPortal( ... ), 패턴을 찾아서 document.body 추가
            let updatedContent = content.replace(
                /createPortal\(\s*(<[\s\S]*?>\s*),?\s*\);/g,
                (match, jsxContent) => {
                    // 이미 document.body가 있는지 확인
                    if (match.includes('document.body')) {
                        return match;
                    }
                    return `createPortal(\n    ${jsxContent.trim()},\n    document.body\n  );`;
                }
            );

            // createPortal( ... } 패턴도 처리
            updatedContent = updatedContent.replace(
                /createPortal\(\s*(<[\s\S]*?}\s*),?\s*\)/g,
                (match, jsxContent) => {
                    // 이미 document.body가 있는지 확인
                    if (match.includes('document.body')) {
                        return match;
                    }
                    return `createPortal(\n    ${jsxContent.trim()},\n    document.body\n  )`;
                }
            );

            // 내용이 변경되었다면 파일 저장
            if (updatedContent !== content) {
                fs.writeFileSync(filePath, updatedContent);
                console.log(`Fixed: ${filePath}`);
            }
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
});

console.log('Portal fixing completed!'); 