import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, LogLevel, log, unsafeLog } from '../logger';

describe('보안 로거', () => {
  let consoleSpy: {
    error: any;
    warn: any;
    info: any;
    debug: any;
  };

  beforeEach(() => {
    // 콘솔 출력 모킹
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {})
    };
    
    // 로그 레벨을 DEBUG로 설정
    logger.setLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('로그 레벨 관리', () => {
    it('로그 레벨을 설정하고 가져올 수 있어야 함', () => {
      logger.setLevel(LogLevel.WARN);
      expect(logger.getLevel()).toBe(LogLevel.WARN);
    });

    it('설정된 레벨보다 높은 레벨의 로그는 출력하지 않아야 함', () => {
      logger.setLevel(LogLevel.WARN);
      
      logger.debug('디버그 메시지');
      logger.info('정보 메시지');
      logger.warn('경고 메시지');
      logger.error('오류 메시지');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('민감한 정보 마스킹', () => {
    it('API 키를 마스킹해야 함', () => {
      const sensitiveData = {
        apiKey: 'sk-abcdefghijklmnopqrstuvwxyz123456',
        voyageKey: 'pa-abcdefghijklmnopqrstuvwxyz123456',
        normalData: 'safe content'
      };
      
      logger.info('테스트 메시지', sensitiveData);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('[REDACTED]');
      expect(loggedMessage).not.toContain('sk-abcdefghijklmnopqrstuvwxyz123456');
      expect(loggedMessage).not.toContain('pa-abcdefghijklmnopqrstuvwxyz123456');
      expect(loggedMessage).toContain('safe content');
    });

    it('문자열에서 API 키 패턴을 마스킹해야 함', () => {
      const message = 'API 키는 sk-abcdefghijklmnopqrstuvwxyz123456 입니다';
      
      logger.info(message);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).not.toContain('sk-abcdefghijklmnopqrstuvwxyz123456');
      expect(loggedMessage).toContain('sk-a***3456'); // 마스킹된 형태
    });

    it('JWT 토큰을 마스킹해야 함', () => {
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      logger.info('JWT 토큰', { token: jwtToken });
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).not.toContain(jwtToken);
      expect(loggedMessage).toContain('eyJh***w5c'); // 마스킹된 형태
    });

    it('민감한 키워드가 포함된 필드를 마스킹해야 함', () => {
      const sensitiveData = {
        password: 'supersecret123',
        secret: 'my-secret-value',
        apiKey: 'api-key-value',
        token: 'token-value',
        normalField: 'safe value'
      };
      
      logger.info('민감한 데이터', sensitiveData);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('[REDACTED]');
      expect(loggedMessage).not.toContain('supersecret123');
      expect(loggedMessage).not.toContain('my-secret-value');
      expect(loggedMessage).not.toContain('api-key-value');
      expect(loggedMessage).not.toContain('token-value');
      expect(loggedMessage).toContain('safe value');
    });

    it('중첩된 객체에서도 민감한 정보를 마스킹해야 함', () => {
      const nestedData = {
        user: {
          name: 'John Doe',
          credentials: {
            password: 'secret123',
            apiKey: 'sk-abcdefghijklmnopqrstuvwxyz123456'
          }
        },
        config: {
          timeout: 5000
        }
      };
      
      logger.info('중첩된 데이터', nestedData);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('John Doe');
      expect(loggedMessage).toContain('5000');
      expect(loggedMessage).toContain('[REDACTED]');
      expect(loggedMessage).not.toContain('secret123');
      expect(loggedMessage).not.toContain('sk-abcdefghijklmnopqrstuvwxyz123456');
    });

    it('배열에서도 민감한 정보를 마스킹해야 함', () => {
      const arrayData = [
        { name: 'item1', key: 'safe-value' },
        { name: 'item2', apiKey: 'sk-dangerous-key-123456789012345678901234567890' },
        'sk-another-dangerous-key-123456789012345678901234567890'
      ];
      
      logger.info('배열 데이터', arrayData);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('item1');
      expect(loggedMessage).toContain('item2');
      expect(loggedMessage).toContain('safe-value');
      expect(loggedMessage).toContain('[REDACTED]');
      expect(loggedMessage).not.toContain('sk-dangerous-key-123456789012345678901234567890');
      expect(loggedMessage).not.toContain('sk-another-dangerous-key-123456789012345678901234567890');
    });
  });

  describe('특수 로깅 메서드', () => {
    it('API 호출을 안전하게 로깅해야 함', () => {
      const requestData = {
        url: 'https://api.example.com/users',
        headers: {
          'Authorization': 'Bearer sk-abcdefghijklmnopqrstuvwxyz123456',
          'Content-Type': 'application/json'
        },
        body: { name: 'John' }
      };
      
      const responseData = {
        status: 200,
        data: { id: 1, name: 'John' },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature'
      };
      
      logger.logApiCall('POST', 'https://api.example.com/users', requestData, responseData);
      
      const loggedMessage = consoleSpy.debug.mock.calls[0][0];
      expect(loggedMessage).toContain('API 호출: POST');
      expect(loggedMessage).toContain('John');
      expect(loggedMessage).toContain('200');
      expect(loggedMessage).toContain('[REDACTED]');
      expect(loggedMessage).not.toContain('sk-abcdefghijklmnopqrstuvwxyz123456');
      expect(loggedMessage).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature');
    });

    it('환경 변수를 안전하게 로깅해야 함', () => {
      const env = {
        NODE_ENV: 'development',
        API_KEY: 'sk-abcdefghijklmnopqrstuvwxyz123456',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        PORT: '3000'
      };
      
      logger.logEnvironment(env);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('development');
      expect(loggedMessage).toContain('3000');
      expect(loggedMessage).toContain('[REDACTED]');
      expect(loggedMessage).not.toContain('sk-abcdefghijklmnopqrstuvwxyz123456');
      expect(loggedMessage).not.toContain('password');
    });

    it('사용자 액션을 안전하게 로깅해야 함', () => {
      const metadata = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature'
      };
      
      logger.logUserAction('login', 'user123456789', metadata);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('사용자 액션: login');
      expect(loggedMessage).toContain('user_user1234***'); // 사용자 ID 마스킹
      expect(loggedMessage).toContain('192.168.1.1');
      expect(loggedMessage).toContain('Mozilla/5.0...');
      expect(loggedMessage).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature');
    });

    it('성능 메트릭을 로깅해야 함', () => {
      const metadata = {
        endpoint: '/api/users',
        method: 'GET',
        apiKey: 'sk-abcdefghijklmnopqrstuvwxyz123456'
      };
      
      logger.logPerformance('API 호출', 150, metadata);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('성능 메트릭: API 호출');
      expect(loggedMessage).toContain('150ms');
      expect(loggedMessage).toContain('/api/users');
      expect(loggedMessage).toContain('GET');
      expect(loggedMessage).toContain('[REDACTED]');
      expect(loggedMessage).not.toContain('sk-abcdefghijklmnopqrstuvwxyz123456');
    });
  });

  describe('기본 로깅 함수', () => {
    it('log 객체의 함수들이 작동해야 함', () => {
      log.error('에러 메시지');
      log.warn('경고 메시지');
      log.info('정보 메시지');
      log.debug('디버그 메시지');
      
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('에러 메시지'));
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('경고 메시지'));
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('정보 메시지'));
      expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining('디버그 메시지'));
    });
  });

  describe('안전하지 않은 로깅', () => {
    it('개발 환경에서만 안전하지 않은 로깅이 작동해야 함', () => {
      // 개발 환경 모킹
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: true },
        writable: true,
        configurable: true
      });
      
      const sensitiveData = { apiKey: 'sk-real-key-123' };
      unsafeLog.debug('위험한 디버그', sensitiveData);
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[UNSAFE DEBUG] 위험한 디버그',
        sensitiveData
      );
    });
  });

  describe('에지 케이스', () => {
    it('null과 undefined 값을 처리해야 함', () => {
      logger.info('null 테스트', null);
      logger.info('undefined 테스트', undefined);
      
      expect(consoleSpy.info).toHaveBeenCalledTimes(2);
    });

    it('순환 참조를 처리해야 함', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;
      
      logger.info('순환 참조 테스트', obj);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('test');
      expect(loggedMessage).toContain('[깊이 제한 초과]');
    });

    it('매우 긴 문자열을 처리해야 함', () => {
      const longString = 'a'.repeat(10000);
      
      logger.info('긴 문자열 테스트', { data: longString });
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('다양한 데이터 타입을 처리해야 함', () => {
      const mixedData = {
        string: 'text',
        number: 42,
        boolean: true,
        date: new Date(),
        regex: /test/g,
        func: () => 'test'
      };
      
      logger.info('혼합 데이터 테스트', mixedData);
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('메시지 포맷팅', () => {
    it('타임스탬프와 로그 레벨이 포함되어야 함', () => {
      logger.info('테스트 메시지');
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/); // ISO 타임스탬프
      expect(loggedMessage).toContain('[INFO]');
      expect(loggedMessage).toContain('테스트 메시지');
    });

    it('데이터가 있을 때 JSON 형태로 포맷팅되어야 함', () => {
      const data = { key: 'value' };
      logger.info('데이터 테스트', data);
      
      const loggedMessage = consoleSpy.info.mock.calls[0][0];
      expect(loggedMessage).toContain('데이터 테스트');
      expect(loggedMessage).toContain('"key"');
      expect(loggedMessage).toContain('"value"');
    });
  });
});