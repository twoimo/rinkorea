// 문서 서비스 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateFileType,
  validateFileExtended,
  extractTextFromFile,
  splitTextIntoChunks,
  formatFileSize,
  getFileTypeIcon,
  validateMimeType
} from '../documentService';

// Mock 파일 생성 헬퍼
const createMockFile = (
  name: string,
  content: string,
  type: string = 'text/plain',
  size?: number
): File => {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  
  // size가 지정된 경우 강제로 설정
  if (size !== undefined) {
    Object.defineProperty(file, 'size', { value: size });
  }
  
  // text() 메서드 모킹
  file.text = vi.fn().mockResolvedValue(content);
  
  return file;
};

describe('documentService', () => {
  describe('validateFileType', () => {
    it('지원되는 파일 형식을 올바르게 검증해야 함', () => {
      const txtFile = createMockFile('test.txt', 'content', 'text/plain');
      const result = validateFileType(txtFile);
      expect(result.valid).toBe(true);
    });

    it('지원되지 않는 파일 형식을 거부해야 함', () => {
      const unsupportedFile = createMockFile('test.xyz', 'content', 'application/xyz');
      const result = validateFileType(unsupportedFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('지원되지 않는 파일 형식');
    });

    it('파일 크기 제한을 확인해야 함', () => {
      const largeFile = createMockFile('large.txt', 'content', 'text/plain', 100 * 1024 * 1024); // 100MB
      const result = validateFileType(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('파일 크기가 너무 큽니다');
    });
  });

  describe('validateFileExtended', () => {
    it('확장된 검증을 수행해야 함', () => {
      const validFile = createMockFile('test.txt', 'content', 'text/plain');
      const result = validateFileExtended(validFile);
      expect(result.valid).toBe(true);
    });

    it('긴 파일명을 거부해야 함', () => {
      const longName = 'a'.repeat(260) + '.txt';
      const file = createMockFile(longName, 'content', 'text/plain');
      const result = validateFileExtended(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('파일명이 너무 깁니다');
    });

    it('특수문자가 포함된 파일명을 거부해야 함', () => {
      const file = createMockFile('test<>.txt', 'content', 'text/plain');
      const result = validateFileExtended(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('허용되지 않는 특수문자');
    });

    it('빈 파일을 거부해야 함', () => {
      const emptyFile = createMockFile('empty.txt', '', 'text/plain', 0);
      const result = validateFileExtended(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('빈 파일은 업로드할 수 없습니다');
    });

    it('큰 파일에 대해 경고를 제공해야 함', () => {
      const largeFile = createMockFile('large.pdf', 'content', 'application/pdf', 15 * 1024 * 1024); // 15MB PDF (maxSize 50MB)
      const result = validateFileExtended(largeFile);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('큰 파일은 처리 시간이 오래 걸릴 수 있습니다');
    });
  });

  describe('extractTextFromFile', () => {
    beforeEach(() => {
      // DOM 환경 설정
      global.DOMParser = vi.fn().mockImplementation(() => ({
        parseFromString: vi.fn().mockReturnValue({
          body: { textContent: 'extracted text' },
          textContent: 'extracted text',
          querySelectorAll: vi.fn().mockReturnValue([])
        })
      }));
    });

    it('텍스트 파일에서 내용을 추출해야 함', async () => {
      const txtFile = createMockFile('test.txt', 'Hello World', 'text/plain');
      const result = await extractTextFromFile(txtFile);
      expect(result).toBe('Hello World');
    });

    it('마크다운 파일에서 내용을 추출해야 함', async () => {
      const mdFile = createMockFile('test.md', '# Title\nContent', 'text/markdown');
      const result = await extractTextFromFile(mdFile);
      expect(result).toBe('# Title\nContent');
    });

    it('HTML 파일에서 텍스트를 추출해야 함', async () => {
      const htmlFile = createMockFile('test.html', '<html><body>Hello</body></html>', 'text/html');
      const result = await extractTextFromFile(htmlFile);
      expect(result).toBe('extracted text');
    });

    it('지원되지 않는 파일 형식에 대해 오류를 던져야 함', async () => {
      const unsupportedFile = createMockFile('test.xyz', 'content', 'application/xyz');
      await expect(extractTextFromFile(unsupportedFile)).rejects.toThrow('지원되지 않는 파일 형식');
    });
  });

  describe('splitTextIntoChunks', () => {
    it('텍스트를 청크로 분할해야 함', () => {
      const text = 'This is a test. This is another sentence. And one more.';
      const chunks = splitTextIntoChunks(text, 30, 10);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toContain('This is a test.');
    });

    it('빈 텍스트에 대해 빈 배열을 반환해야 함', () => {
      const chunks = splitTextIntoChunks('', 100, 20);
      expect(chunks).toEqual([]);
    });

    it('문장 경계에서 분할을 시도해야 함', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      const chunks = splitTextIntoChunks(text, 20, 5);
      
      // 첫 번째 청크가 문장 경계에서 끝나는지 확인
      expect(chunks[0]).toMatch(/\.$/);
    });

    it('오버랩을 올바르게 처리해야 함', () => {
      const text = 'A'.repeat(100) + 'B'.repeat(100);
      const chunks = splitTextIntoChunks(text, 50, 10);
      
      expect(chunks.length).toBeGreaterThan(1);
      // 오버랩 확인: 두 번째 청크가 첫 번째 청크의 끝 부분을 포함해야 함
      if (chunks.length > 1) {
        const overlap = chunks[0].slice(-10);
        expect(chunks[1]).toContain(overlap.slice(0, 5)); // 부분적 오버랩 확인
      }
    });
  });

  describe('formatFileSize', () => {
    it('바이트를 올바르게 포맷해야 함', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('소수점을 올바르게 처리해야 함', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5KB
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });
  });

  describe('getFileTypeIcon', () => {
    it('파일 타입에 따른 올바른 아이콘을 반환해야 함', () => {
      expect(getFileTypeIcon('application/pdf')).toBe('📄');
      expect(getFileTypeIcon('text/plain')).toBe('📝');
      expect(getFileTypeIcon('text/html')).toBe('🌐');
      expect(getFileTypeIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('📘');
      expect(getFileTypeIcon('text/markdown')).toBe('📋');
      expect(getFileTypeIcon('unknown/type')).toBe('📄');
    });
  });

  describe('validateMimeType', () => {
    it('올바른 MIME 타입을 검증해야 함', () => {
      const txtFile = createMockFile('test.txt', 'content', 'text/plain');
      expect(validateMimeType(txtFile)).toBe(true);
    });

    it('MIME 타입이 없는 경우 확장자로 판단해야 함', () => {
      const file = createMockFile('test.txt', 'content', '');
      expect(validateMimeType(file)).toBe(true);
    });

    it('일반적인 MIME 타입인 경우 허용해야 함', () => {
      const file = createMockFile('test.txt', 'content', 'application/octet-stream');
      expect(validateMimeType(file)).toBe(true);
    });

    it('잘못된 MIME 타입을 거부해야 함', () => {
      const file = createMockFile('test.txt', 'content', 'image/jpeg');
      expect(validateMimeType(file)).toBe(false);
    });
  });
});