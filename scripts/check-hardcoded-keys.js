#!/usr/bin/env node

/**
 * API 키 하드코딩 검증 스크립트
 * 소스 코드에서 하드코딩된 API 키나 민감한 정보를 검색합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 검색할 패턴들 (정규표현식)
const DANGEROUS_PATTERNS = [
  {
    pattern: /sk-[a-zA-Z0-9]{20,}/g,
    description: 'OpenAI/Anthropic API 키 (sk-로 시작)',
    severity: 'HIGH'
  },
  {
    pattern: /pa-[a-zA-Z0-9]{20,}/g,
    description: 'Voyage AI API 키 (pa-로 시작)',
    severity: 'HIGH'
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: 'AWS Access Key ID',
    severity: 'HIGH'
  },
  {
    pattern: /[0-9a-zA-Z/+]{40}/g,
    description: 'AWS Secret Access Key (의심)',
    severity: 'MEDIUM'
  },
  {
    pattern: /AIza[0-9A-Za-z\\-_]{35}/g,
    description: 'Google API 키',
    severity: 'HIGH'
  },
  {
    pattern: /ya29\\.[0-9A-Za-z\\-_]+/g,
    description: 'Google OAuth 토큰',
    severity: 'HIGH'
  },
  {
    pattern: /ghp_[0-9a-zA-Z]{36}/g,
    description: 'GitHub Personal Access Token',
    severity: 'HIGH'
  },
  {
    pattern: /ghs_[0-9a-zA-Z]{36}/g,
    description: 'GitHub App Token',
    severity: 'HIGH'
  },
  {
    pattern: /password\s*[:=]\s*["'][^"']{8,}["']/gi,
    description: '하드코딩된 패스워드',
    severity: 'HIGH'
  },
  {
    pattern: /secret\s*[:=]\s*["'][^"']{8,}["']/gi,
    description: '하드코딩된 시크릿',
    severity: 'HIGH'
  },
  {
    pattern: /token\s*[:=]\s*["'][^"']{20,}["']/gi,
    description: '하드코딩된 토큰',
    severity: 'HIGH'
  }
];

// 제외할 파일/디렉토리 패턴
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.env',
  '.env.example',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '*.log',
  '*.min.js',
  '*.min.css',
  'check-hardcoded-keys.js' // 이 스크립트 자체 제외
];

// 검색할 파일 확장자
const INCLUDE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.java', '.go', '.rb', '.php',
  '.json', '.yaml', '.yml', '.xml', '.html', '.css', '.scss', '.sass',
  '.md', '.txt', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd'
];

/**
 * 파일이 제외 패턴에 해당하는지 확인
 */
function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

/**
 * 파일 확장자가 검색 대상인지 확인
 */
function shouldIncludeFile(filePath) {
  const ext = path.extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

/**
 * 디렉토리를 재귀적으로 탐색하여 파일 목록 반환
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (shouldExcludeFile(fullPath)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (shouldIncludeFile(fullPath)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * 파일에서 위험한 패턴 검색
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    DANGEROUS_PATTERNS.forEach(({ pattern, description, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // 실제 키인지 확인 (테스트 데이터나 예시 제외)
          if (isLikelyRealKey(match, content)) {
            const lines = content.split('\n');
            const lineNumber = findLineNumber(content, match);
            
            findings.push({
              file: filePath,
              line: lineNumber,
              match: match.substring(0, 20) + '...', // 보안을 위해 일부만 표시
              description,
              severity,
              context: getContextLines(lines, lineNumber - 1, 2)
            });
          }
        });
      }
    });

    return findings;
  } catch (error) {
    console.warn(`파일 읽기 실패: ${filePath} - ${error.message}`);
    return [];
  }
}

/**
 * 실제 API 키인지 판단 (테스트나 예시 데이터 제외)
 */
function isLikelyRealKey(match, content) {
  const lowerContent = content.toLowerCase();
  const lowerMatch = match.toLowerCase();
  
  // 테스트나 예시로 보이는 패턴들 제외
  const testPatterns = [
    'test', 'example', 'sample', 'demo', 'mock', 'fake', 'dummy',
    'placeholder', 'your_', 'insert_', 'replace_', 'xxx', 'yyy',
    'abcd', '1234', '0000'
  ];
  
  return !testPatterns.some(pattern => 
    lowerMatch.includes(pattern) || 
    lowerContent.includes(`${pattern}_api_key`) ||
    lowerContent.includes(`${pattern}-api-key`)
  );
}

/**
 * 문자열에서 특정 매치의 라인 번호 찾기
 */
function findLineNumber(content, match) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(match)) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * 컨텍스트 라인들 가져오기
 */
function getContextLines(lines, centerLine, contextSize) {
  const start = Math.max(0, centerLine - contextSize);
  const end = Math.min(lines.length, centerLine + contextSize + 1);
  
  return lines.slice(start, end).map((line, index) => ({
    number: start + index + 1,
    content: line,
    isMatch: start + index === centerLine
  }));
}

/**
 * 결과를 색상과 함께 출력
 */
function printResults(findings) {
  if (findings.length === 0) {
    console.log('✅ 하드코딩된 API 키나 민감한 정보가 발견되지 않았습니다.');
    return;
  }

  console.log(`🚨 ${findings.length}개의 잠재적 보안 문제가 발견되었습니다:\n`);

  const groupedByFile = findings.reduce((acc, finding) => {
    if (!acc[finding.file]) {
      acc[finding.file] = [];
    }
    acc[finding.file].push(finding);
    return acc;
  }, {});

  Object.entries(groupedByFile).forEach(([file, fileFindings]) => {
    console.log(`📄 파일: ${file}`);
    
    fileFindings.forEach(finding => {
      const severityIcon = finding.severity === 'HIGH' ? '🔴' : '🟡';
      console.log(`  ${severityIcon} ${finding.severity}: ${finding.description}`);
      console.log(`     라인 ${finding.line}: ${finding.match}`);
      
      if (finding.context) {
        console.log('     컨텍스트:');
        finding.context.forEach(ctx => {
          const marker = ctx.isMatch ? '  ➤  ' : '     ';
          console.log(`${marker}${ctx.number}: ${ctx.content}`);
        });
      }
      console.log('');
    });
  });

  // 심각도별 요약
  const highSeverity = findings.filter(f => f.severity === 'HIGH').length;
  const mediumSeverity = findings.filter(f => f.severity === 'MEDIUM').length;
  
  console.log('📊 요약:');
  if (highSeverity > 0) {
    console.log(`  🔴 높음: ${highSeverity}개`);
  }
  if (mediumSeverity > 0) {
    console.log(`  🟡 보통: ${mediumSeverity}개`);
  }
  
  console.log('\n💡 권장사항:');
  console.log('  - 하드코딩된 키들을 환경 변수로 이동하세요');
  console.log('  - .env 파일이 .gitignore에 포함되어 있는지 확인하세요');
  console.log('  - 이미 커밋된 키들은 즉시 무효화하고 새로 발급받으세요');
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🔍 API 키 하드코딩 검증을 시작합니다...\n');
  
  const startTime = Date.now();
  const projectRoot = process.cwd();
  
  try {
    const allFiles = getAllFiles(projectRoot);
    console.log(`📁 ${allFiles.length}개 파일을 검사합니다...\n`);
    
    let allFindings = [];
    
    allFiles.forEach(file => {
      const findings = scanFile(file);
      allFindings = allFindings.concat(findings);
    });
    
    const endTime = Date.now();
    console.log(`⏱️  검사 완료 (${endTime - startTime}ms)\n`);
    
    printResults(allFindings);
    
    // CI/CD에서 사용할 수 있도록 종료 코드 설정
    if (allFindings.some(f => f.severity === 'HIGH')) {
      process.exit(1); // 높은 심각도 문제가 있으면 실패
    }
    
  } catch (error) {
    console.error('❌ 검사 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  scanFile,
  getAllFiles,
  DANGEROUS_PATTERNS,
  EXCLUDE_PATTERNS
};