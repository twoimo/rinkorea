import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateApiKeys, validateAllApiKeys, validateStartupKeys } from '../env';

// 환경 변수 모킹을 위한 헬퍼
const mockEnv = (envVars: Record<string, string>) => {
  Object.defineProperty(import.meta, 'env', {
    value: envVars,
    writable: true,
    configurable: true
  });
};

describe('환경 변수 검증 시스템', () => {
  const originalEnv = import.meta.env;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // 콘솔 출력 모킹
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // 환경 변수 복원
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
      configurable: true
    });
    vi.restoreAllMocks();
  });

  describe('validateApiKeys.voyage', () => {
    it('유효한 Voyage API 키를 검증해야 함', () => {
      const validKey = 'pa-abcdefghijklmnopqrstuvwxyz123456';
      const result = validateApiKeys.voyage(validKey);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('빈 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.voyage('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Voyage AI API 키가 설정되지 않았습니다');
    });

    it('기본값 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.voyage('your_voyage_api_key_here');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('기본값으로 설정되어 있습니다');
    });

    it('잘못된 형식의 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.voyage('invalid-key');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('형식이 올바르지 않습니다');
    });

    it('너무 짧은 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.voyage('pa-short');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('형식이 올바르지 않습니다');
    });
  });

  describe('validateApiKeys.claude', () => {
    it('유효한 Claude API 키를 검증해야 함', () => {
      const validKey = 'sk-ant-abcdefghijklmnopqrstuvwxyz123456789';
      const result = validateApiKeys.claude(validKey);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('빈 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.claude('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Claude API 키가 설정되지 않았습니다');
    });

    it('기본값 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.claude('your_claude_api_key_here');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('기본값으로 설정되어 있습니다');
    });

    it('잘못된 형식의 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.claude('invalid-key');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('형식이 올바르지 않습니다');
    });
  });

  describe('validateApiKeys.mistral', () => {
    it('유효한 Mistral API 키를 검증해야 함', () => {
      const validKey = 'abcdefghijklmnopqrstuvwxyz123456789';
      const result = validateApiKeys.mistral(validKey);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('빈 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.mistral('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Mistral API 키가 설정되지 않았습니다');
    });

    it('기본값 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.mistral('your_mistral_api_key_here');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('기본값으로 설정되어 있습니다');
    });

    it('너무 짧은 API 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.mistral('short');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('너무 짧습니다');
    });
  });

  describe('validateApiKeys.supabaseUrl', () => {
    it('유효한 Supabase URL을 검증해야 함', () => {
      const validUrl = 'https://myproject.supabase.co';
      const result = validateApiKeys.supabaseUrl(validUrl);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('빈 URL에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.supabaseUrl('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Supabase URL이 설정되지 않았습니다');
    });

    it('기본값 URL에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.supabaseUrl('your_supabase_project_url_here');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('기본값으로 설정되어 있습니다');
    });

    it('잘못된 형식의 URL에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.supabaseUrl('http://invalid-url.com');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('형식이 올바르지 않습니다');
    });
  });

  describe('validateApiKeys.supabaseAnonKey', () => {
    it('유효한 Supabase Anon Key를 검증해야 함', () => {
      const validKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjA2ODQwMCwiZXhwIjoxOTYxNjQ0NDAwfQ.test-signature-here-with-enough-length-to-pass-validation';
      const result = validateApiKeys.supabaseAnonKey(validKey);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('빈 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.supabaseAnonKey('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Supabase Anon Key가 설정되지 않았습니다');
    });

    it('기본값 키에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.supabaseAnonKey('your_supabase_anon_key_here');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('기본값으로 설정되어 있습니다');
    });

    it('잘못된 JWT 형식에 대해 오류를 반환해야 함', () => {
      const result = validateApiKeys.supabaseAnonKey('invalid.jwt');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('형식이 올바르지 않습니다');
    });
  });

  describe('validateAllApiKeys', () => {
    it('모든 API 키가 유효할 때 성공을 반환해야 함', () => {
      mockEnv({
        VITE_VOYAGE_API_KEY: 'pa-valid-voyage-key-12345678901234567890',
        VITE_CLAUDE_API_KEY: 'sk-ant-valid-claude-key-123456789012345678901234567890',
        VITE_MISTRAL_API_KEY: 'valid-mistral-key-12345678901234567890',
        VITE_SUPABASE_URL: 'https://myproject.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjA2ODQwMCwiZXhwIjoxOTYxNjQ0NDAwfQ.test-signature-here-with-enough-length-to-pass-validation'
      });

      const result = validateAllApiKeys();
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('일부 API 키가 유효하지 않을 때 오류를 반환해야 함', () => {
      mockEnv({
        VITE_VOYAGE_API_KEY: 'invalid-key',
        VITE_CLAUDE_API_KEY: 'sk-ant-valid-claude-key-123456789012345678901234567890',
        VITE_MISTRAL_API_KEY: 'valid-mistral-key-12345678901234567890',
        VITE_SUPABASE_URL: 'https://myproject.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjA2ODQwMCwiZXhwIjoxOTYxNjQ0NDAwfQ.test-signature-here-with-enough-length-to-pass-validation'
      });

      const result = validateAllApiKeys();
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Voyage AI API 키');
    });
  });

  describe('validateStartupKeys', () => {
    it('개발 환경에서 유효하지 않은 키가 있어도 예외를 던지지 않아야 함', () => {
      mockEnv({
        VITE_APP_ENV: 'development',
        VITE_VOYAGE_API_KEY: 'invalid-key',
        VITE_CLAUDE_API_KEY: 'invalid-key',
        VITE_MISTRAL_API_KEY: 'invalid-key',
        VITE_SUPABASE_URL: 'invalid-url',
        VITE_SUPABASE_ANON_KEY: 'invalid-key'
      });

      expect(() => validateStartupKeys()).not.toThrow();
      expect(console.error).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });

    it('프로덕션 환경에서 유효하지 않은 키가 있으면 예외를 던져야 함', () => {
      mockEnv({
        VITE_APP_ENV: 'production',
        VITE_VOYAGE_API_KEY: 'invalid-key',
        VITE_CLAUDE_API_KEY: 'invalid-key',
        VITE_MISTRAL_API_KEY: 'invalid-key',
        VITE_SUPABASE_URL: 'invalid-url',
        VITE_SUPABASE_ANON_KEY: 'invalid-key'
      });

      expect(() => validateStartupKeys()).toThrow('프로덕션 환경에서는 모든 API 키가 올바르게 설정되어야 합니다');
    });

    it('모든 키가 유효할 때 성공 메시지를 출력해야 함', () => {
      mockEnv({
        VITE_APP_ENV: 'development',
        VITE_VOYAGE_API_KEY: 'pa-valid-voyage-key-12345678901234567890',
        VITE_CLAUDE_API_KEY: 'sk-ant-valid-claude-key-123456789012345678901234567890',
        VITE_MISTRAL_API_KEY: 'valid-mistral-key-12345678901234567890',
        VITE_SUPABASE_URL: 'https://myproject.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjA2ODQwMCwiZXhwIjoxOTYxNjQ0NDAwfQ.test-signature-here-with-enough-length-to-pass-validation'
      });

      validateStartupKeys();
      
      expect(console.log).toHaveBeenCalledWith('✅ 모든 API 키가 올바르게 설정되었습니다.');
    });
  });

  describe('에지 케이스', () => {
    it('undefined 값에 대해 적절히 처리해야 함', () => {
      const result = validateApiKeys.voyage(undefined);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('설정되지 않았습니다');
    });

    it('null 값에 대해 적절히 처리해야 함', () => {
      const result = validateApiKeys.claude(null as any);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('설정되지 않았습니다');
    });

    it('공백만 있는 문자열에 대해 적절히 처리해야 함', () => {
      const result = validateApiKeys.mistral('   ');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('설정되지 않았습니다');
    });
  });
});