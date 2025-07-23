// 텍스트 청킹 서비스 테스트
import { describe, it, expect, beforeEach } from 'vitest';
import {
  chunkText,
  validateChunks,
  recommendChunkingStrategy,
  generateChunkMetadata,
  CHUNKING_CONFIG
} from '../textChunkingService';

describe('TextChunkingService', () => {
  const sampleText = `
    이것은 첫 번째 문장입니다. 이것은 두 번째 문장입니다. 이것은 세 번째 문장입니다.
    
    이것은 새로운 단락의 시작입니다. 여기에는 더 많은 내용이 있습니다. 
    단락은 여러 문장으로 구성됩니다.
    
    마지막 단락입니다. 이 단락도 여러 문장을 포함합니다. 텍스트 청킹 테스트를 위한 샘플입니다.
  `.trim();

  describe('chunkText', () => {
    it('기본 고정 크기 청킹이 작동해야 함', () => {
      const result = chunkText(sampleText, {
        strategy: 'fixed',
        chunkSize: 100,
        overlap: 20
      });

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.metadata.strategy).toBe('fixed');
      expect(result.metadata.totalChunks).toBe(result.chunks.length);
    });

    it('문장 기반 청킹이 작동해야 함', () => {
      const result = chunkText(sampleText, {
        strategy: 'sentence',
        chunkSize: 150,
        overlap: 30
      });

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.metadata.strategy).toBe('sentence');
      
      // 각 청크가 완전한 문장으로 끝나는지 확인
      result.chunks.forEach(chunk => {
        const trimmed = chunk.trim();
        const lastChar = trimmed[trimmed.length - 1];
        expect(['.', '!', '?', '。', '！', '？'].some(marker => 
          trimmed.endsWith(marker)
        )).toBeTruthy();
      });
    });

    it('단락 기반 청킹이 작동해야 함', () => {
      const result = chunkText(sampleText, {
        strategy: 'paragraph',
        chunkSize: 200,
        overlap: 50
      });

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.metadata.strategy).toBe('paragraph');
    });

    it('빈 텍스트에 대해 빈 결과를 반환해야 함', () => {
      const result = chunkText('');
      
      expect(result.chunks).toEqual([]);
      expect(result.metadata.totalChunks).toBe(0);
    });

    it('청크 크기 제한을 준수해야 함', () => {
      const result = chunkText(sampleText, {
        chunkSize: 50,
        overlap: 10
      });

      result.chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(CHUNKING_CONFIG.maxChunkSize);
        expect(chunk.length).toBeGreaterThanOrEqual(CHUNKING_CONFIG.minChunkSize);
      });
    });
  });

  describe('validateChunks', () => {
    it('유효한 청크들을 검증해야 함', () => {
      const validChunks = [
        '이것은 충분히 긴 첫 번째 청크입니다. 여러 문장을 포함하고 있습니다.',
        '이것은 두 번째 청크입니다. 역시 충분한 길이를 가지고 있습니다.',
        '마지막 청크입니다. 적절한 크기를 유지하고 있습니다.'
      ];

      const validation = validateChunks(validChunks);
      
      expect(validation.valid).toBe(true);
      expect(validation.issues).toEqual([]);
    });

    it('너무 작은 청크들을 감지해야 함', () => {
      const invalidChunks = [
        '짧음',
        '이것은 충분히 긴 청크입니다.',
        '또 짧음'
      ];

      const validation = validateChunks(invalidChunks);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues[0]).toContain('최소 크기');
    });

    it('빈 청크 배열을 처리해야 함', () => {
      const validation = validateChunks([]);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues[0]).toContain('청크가 생성되지 않았습니다');
    });

    it('중복 청크를 감지해야 함', () => {
      const duplicateChunks = [
        '이것은 중복될 청크입니다. 충분한 길이를 가지고 있습니다.',
        '이것은 다른 청크입니다. 역시 충분한 길이를 가지고 있습니다.',
        '이것은 중복될 청크입니다. 충분한 길이를 가지고 있습니다.' // 중복
      ];

      const validation = validateChunks(duplicateChunks);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('중복'))).toBe(true);
    });
  });

  describe('recommendChunkingStrategy', () => {
    it('짧은 텍스트에 대해 고정 크기를 추천해야 함', () => {
      const shortText = '이것은 매우 짧은 텍스트입니다.';
      const recommendation = recommendChunkingStrategy(shortText);
      
      expect(recommendation.strategy).toBe('fixed');
      expect(recommendation.options.chunkSize).toBeLessThan(1000);
    });

    it('단락이 많은 텍스트에 대해 단락 기반을 추천해야 함', () => {
      const paragraphText = Array(10).fill(0).map((_, i) => 
        `단락 ${i + 1}입니다.\n\n이것은 ${i + 1}번째 단락의 내용입니다. 여러 문장을 포함합니다.`
      ).join('\n\n');
      
      const recommendation = recommendChunkingStrategy(paragraphText);
      
      expect(recommendation.strategy).toBe('paragraph');
    });

    it('문장이 많은 텍스트에 대해 문장 기반을 추천해야 함', () => {
      const sentenceText = Array(50).fill(0).map((_, i) => 
        `이것은 ${i + 1}번째 문장입니다.`
      ).join(' ');
      
      const recommendation = recommendChunkingStrategy(sentenceText);
      
      expect(recommendation.strategy).toBe('sentence');
    });
  });

  describe('generateChunkMetadata', () => {
    it('올바른 메타데이터를 생성해야 함', () => {
      const chunk = '이것은 테스트 청크입니다. 여러 문장을 포함합니다.';
      const metadata = generateChunkMetadata(chunk, 0, 5, 'doc-123');

      expect(metadata.chunk_index).toBe(0);
      expect(metadata.total_chunks).toBe(5);
      expect(metadata.document_id).toBe('doc-123');
      expect(metadata.length).toBe(chunk.length);
      expect(metadata.word_count).toBeGreaterThan(0);
      expect(metadata.sentence_count).toBeGreaterThan(0);
      expect(metadata.hash).toBeDefined();
      expect(metadata.created_at).toBeDefined();
    });

    it('단어 수를 정확히 계산해야 함', () => {
      const chunk = '하나 둘 셋 넷 다섯';
      const metadata = generateChunkMetadata(chunk, 0, 1, 'doc-123');

      expect(metadata.word_count).toBe(5);
    });

    it('문장 수를 정확히 계산해야 함', () => {
      const chunk = '첫 번째 문장입니다. 두 번째 문장입니다! 세 번째 문장입니까?';
      const metadata = generateChunkMetadata(chunk, 0, 1, 'doc-123');

      expect(metadata.sentence_count).toBe(3);
    });
  });

  describe('성능 테스트', () => {
    it('큰 텍스트를 효율적으로 처리해야 함', () => {
      const largeText = Array(1000).fill(0).map((_, i) => 
        `이것은 ${i + 1}번째 문장입니다. 성능 테스트를 위한 긴 텍스트입니다.`
      ).join(' ');

      const startTime = Date.now();
      const result = chunkText(largeText, {
        strategy: 'fixed',
        chunkSize: 1000,
        overlap: 200
      });
      const endTime = Date.now();

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
      expect(result.metadata.processingTime).toBeLessThan(1000);
    });
  });

  describe('에지 케이스', () => {
    it('매우 긴 단일 문장을 처리해야 함', () => {
      const longSentence = '이것은 ' + 'a '.repeat(2000) + '매우 긴 문장입니다.';
      
      const result = chunkText(longSentence, {
        strategy: 'sentence',
        chunkSize: 500
      });

      expect(result.chunks.length).toBeGreaterThan(0);
      result.chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(CHUNKING_CONFIG.maxChunkSize);
      });
    });

    it('특수 문자가 포함된 텍스트를 처리해야 함', () => {
      const specialText = '이것은 특수문자를 포함합니다: @#$%^&*()! 한글과 English가 섞여있습니다. 숫자 123도 있습니다.';
      
      const result = chunkText(specialText);
      
      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.chunks[0]).toContain('특수문자');
    });

    it('줄바꿈과 공백이 많은 텍스트를 처리해야 함', () => {
      const messyText = `
        
        
        이것은    여러    공백이    있는    텍스트입니다.
        
        
        줄바꿈도    많이    있습니다.
        
        
      `;
      
      const result = chunkText(messyText);
      
      expect(result.chunks.length).toBeGreaterThan(0);
      result.chunks.forEach(chunk => {
        expect(chunk.trim().length).toBeGreaterThan(0);
      });
    });
  });
});