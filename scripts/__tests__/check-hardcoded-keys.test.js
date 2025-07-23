const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const { scanFile, getAllFiles, DANGEROUS_PATTERNS, EXCLUDE_PATTERNS } = require('../check-hardcoded-keys');

// 임시 파일 생성을 위한 헬퍼
const createTempFile = (content, filename = 'test.js') => {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
};

// 임시 디렉토리 정리
const cleanupTempFiles = () => {
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

describe('API 키 하드코딩 검증 스크립트', () => {
  beforeEach(() => {
    cleanupTempFiles();
  });

  afterEach(() => {
    cleanupTempFiles();
  });

  describe('DANGEROUS_PATTERNS', () => {
    it('위험한 패턴들이 올바르게 정의되어야 함', () => {
      expect(DANGEROUS_PATTERNS).toBeDefined();
      expect(Array.isArray(DANGEROUS_PATTERNS)).toBe(true);
      expect(DANGEROUS_PATTERNS.length).toBeGreaterThan(0);
      
      DANGEROUS_PATTERNS.forEach(pattern => {
        expect(pattern).toHaveProperty('pattern');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('severity');
        expect(pattern.pattern).toBeInstanceOf(RegExp);
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(pattern.severity);
      });
    });

    it('OpenAI/Anthropic API 키 패턴을 감지해야 함', () => {
      const pattern = DANGEROUS_PATTERNS.find(p => p.description.includes('OpenAI/Anthropic'));
      expect(pattern).toBeDefined();
      
      const testKey = 'sk-abcdefghijklmnopqrstuvwxyz123456';
      expect(pattern.pattern.test(testKey)).toBe(true);
      
      const invalidKey = 'invalid-key';
      expect(pattern.pattern.test(invalidKey)).toBe(false);
    });

    it('Voyage AI API 키 패턴을 감지해야 함', () => {
      const pattern = DANGEROUS_PATTERNS.find(p => p.description.includes('Voyage AI'));
      expect(pattern).toBeDefined();
      
      const testKey = 'pa-abcdefghijklmnopqrstuvwxyz123456';
      expect(pattern.pattern.test(testKey)).toBe(true);
      
      const invalidKey = 'invalid-key';
      expect(pattern.pattern.test(invalidKey)).toBe(false);
    });

    it('AWS Access Key 패턴을 감지해야 함', () => {
      const pattern = DANGEROUS_PATTERNS.find(p => p.description.includes('AWS Access Key'));
      expect(pattern).toBeDefined();
      
      const testKey = 'AKIAIOSFODNN7EXAMPLE';
      expect(pattern.pattern.test(testKey)).toBe(true);
      
      const invalidKey = 'invalid-key';
      expect(pattern.pattern.test(invalidKey)).toBe(false);
    });
  });

  describe('EXCLUDE_PATTERNS', () => {
    it('제외 패턴들이 올바르게 정의되어야 함', () => {
      expect(EXCLUDE_PATTERNS).toBeDefined();
      expect(Array.isArray(EXCLUDE_PATTERNS)).toBe(true);
      expect(EXCLUDE_PATTERNS).toContain('node_modules');
      expect(EXCLUDE_PATTERNS).toContain('.git');
      expect(EXCLUDE_PATTERNS).toContain('.env');
    });
  });

  describe('scanFile', () => {
    it('위험한 API 키가 포함된 파일을 감지해야 함', () => {
      const dangerousContent = `
        const apiKey = 'sk-abcdefghijklmnopqrstuvwxyz123456';
        const voyageKey = 'pa-abcdefghijklmnopqrstuvwxyz123456';
      `;
      
      const filePath = createTempFile(dangerousContent);
      const findings = scanFile(filePath);
      
      expect(findings.length).toBeGreaterThan(0);
      expect(findings.some(f => f.description.includes('OpenAI/Anthropic'))).toBe(true);
      expect(findings.some(f => f.description.includes('Voyage AI'))).toBe(true);
    });

    it('테스트 키는 무시해야 함', () => {
      const testContent = `
        const testApiKey = 'sk-test-key-for-testing-purposes-only';
        const exampleKey = 'pa-example-key-for-demo-purposes';
      `;
      
      const filePath = createTempFile(testContent);
      const findings = scanFile(filePath);
      
      expect(findings.length).toBe(0);
    });

    it('안전한 코드는 문제를 보고하지 않아야 함', () => {
      const safeContent = `
        const apiKey = process.env.API_KEY;
        const config = {
          apiUrl: 'https://api.example.com',
          timeout: 5000
        };
      `;
      
      const filePath = createTempFile(safeContent);
      const findings = scanFile(filePath);
      
      expect(findings.length).toBe(0);
    });

    it('존재하지 않는 파일에 대해 빈 배열을 반환해야 함', () => {
      const findings = scanFile('/nonexistent/file.js');
      expect(findings).toEqual([]);
    });

    it('하드코딩된 패스워드를 감지해야 함', () => {
      const dangerousContent = `
        const config = {
          password: "supersecretpassword123",
          secret: "my-secret-token-here"
        };
      `;
      
      const filePath = createTempFile(dangerousContent);
      const findings = scanFile(filePath);
      
      expect(findings.length).toBeGreaterThan(0);
      expect(findings.some(f => f.description.includes('패스워드'))).toBe(true);
      expect(findings.some(f => f.description.includes('시크릿'))).toBe(true);
    });

    it('JWT 토큰을 감지해야 함', () => {
      const dangerousContent = `
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      `;
      
      const filePath = createTempFile(dangerousContent);
      const findings = scanFile(filePath);
      
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('getAllFiles', () => {
    it('디렉토리에서 파일 목록을 반환해야 함', () => {
      // 임시 파일들 생성
      createTempFile('content1', 'file1.js');
      createTempFile('content2', 'file2.ts');
      createTempFile('content3', 'file3.txt');
      
      const tempDir = path.join(__dirname, 'temp');
      const files = getAllFiles(tempDir);
      
      expect(files.length).toBe(3);
      expect(files.some(f => f.endsWith('file1.js'))).toBe(true);
      expect(files.some(f => f.endsWith('file2.ts'))).toBe(true);
      expect(files.some(f => f.endsWith('file3.txt'))).toBe(true);
    });

    it('제외 패턴에 해당하는 파일은 무시해야 함', () => {
      // node_modules 디렉토리 생성
      const nodeModulesDir = path.join(__dirname, 'temp', 'node_modules');
      fs.mkdirSync(nodeModulesDir, { recursive: true });
      fs.writeFileSync(path.join(nodeModulesDir, 'package.js'), 'content');
      
      // 일반 파일 생성
      createTempFile('content', 'normal.js');
      
      const tempDir = path.join(__dirname, 'temp');
      const files = getAllFiles(tempDir);
      
      expect(files.length).toBe(1);
      expect(files[0]).toMatch(/normal\.js$/);
    });

    it('지원하지 않는 확장자는 무시해야 함', () => {
      createTempFile('content1', 'file1.js');
      createTempFile('content2', 'file2.exe');
      createTempFile('content3', 'file3.bin');
      
      const tempDir = path.join(__dirname, 'temp');
      const files = getAllFiles(tempDir);
      
      expect(files.length).toBe(1);
      expect(files[0]).toMatch(/file1\.js$/);
    });
  });

  describe('통합 테스트', () => {
    it('실제 프로젝트 구조에서 작동해야 함', () => {
      // 프로젝트 구조 시뮬레이션
      const srcDir = path.join(__dirname, 'temp', 'src');
      fs.mkdirSync(srcDir, { recursive: true });
      
      // 안전한 파일
      fs.writeFileSync(path.join(srcDir, 'safe.js'), `
        const apiKey = process.env.API_KEY;
        export default apiKey;
      `);
      
      // 위험한 파일
      fs.writeFileSync(path.join(srcDir, 'dangerous.js'), `
        const apiKey = 'sk-realapikeyhere123456789012345678901234567890';
        export default apiKey;
      `);
      
      const tempDir = path.join(__dirname, 'temp');
      const files = getAllFiles(tempDir);
      
      expect(files.length).toBe(2);
      
      let totalFindings = 0;
      files.forEach(file => {
        const findings = scanFile(file);
        totalFindings += findings.length;
      });
      
      expect(totalFindings).toBe(1); // 위험한 파일에서만 발견
    });
  });

  describe('성능 테스트', () => {
    it('큰 파일도 합리적인 시간 내에 처리해야 함', () => {
      // 큰 파일 생성 (10,000줄)
      const largeContent = Array(10000).fill('const normalCode = "safe content";').join('\n');
      const filePath = createTempFile(largeContent);
      
      const startTime = Date.now();
      const findings = scanFile(filePath);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
      expect(findings.length).toBe(0);
    });
  });
});