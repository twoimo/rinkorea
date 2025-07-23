# API 키 관리 설계 문서

## 개요

이 설계는 프로젝트에서 사용하는 모든 API 키를 안전하고 효율적으로 관리하기 위한 시스템을 정의합니다. 특히 Voyage AI API 키의 통합과 기존 환경 변수 시스템의 개선에 중점을 둡니다.

## 아키텍처

### 환경 변수 계층 구조

```
프로젝트 루트/
├── .env.example          # 템플릿 파일 (버전 관리 포함)
├── .env                  # 실제 API 키 (버전 관리 제외)
├── .env.local           # 로컬 개발용 오버라이드
└── src/lib/env.ts       # 환경 변수 검증 및 타입 정의
```

### 보안 모델

1. **환경 변수 분리**: 민감한 정보는 환경 변수로만 관리
2. **타입 안전성**: Zod를 사용한 런타임 검증
3. **접근 제어**: 환경 변수는 env.ts를 통해서만 접근
4. **오류 처리**: 누락된 키에 대한 명확한 오류 메시지

## 컴포넌트 및 인터페이스

### 1. 환경 변수 스키마 (src/lib/env.ts)

```typescript
const envSchema = z.object({
  // 기존 변수들...
  VITE_VOYAGE_API_KEY: z.string().min(1),
  // 추가 검증 로직
});
```

### 2. API 키 검증 시스템

```typescript
interface ApiKeyValidation {
  key: string;
  isValid: boolean;
  service: string;
  lastChecked: Date;
}
```

### 3. 환경 설정 헬퍼

```typescript
interface EnvSetupHelper {
  checkRequiredKeys(): ValidationResult;
  generateEnvExample(): string;
  validateApiKeys(): Promise<ApiKeyValidation[]>;
}
```

## 데이터 모델

### 환경 변수 구조

```typescript
interface EnvironmentVariables {
  // 기존 API 키들
  VITE_MISTRAL_API_KEY: string;
  VITE_CLAUDE_API_KEY: string;
  
  // 새로 추가되는 키
  VITE_VOYAGE_API_KEY: string;
  
  // 데이터베이스
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  
  // 선택적 설정들
  VITE_API_URL?: string;
  VITE_APP_ENV?: 'development' | 'production' | 'test';
}
```

### API 키 메타데이터

```typescript
interface ApiKeyMetadata {
  name: string;
  service: string;
  required: boolean;
  description: string;
  validationUrl?: string;
  documentationUrl: string;
}
```

## 오류 처리

### 1. 누락된 API 키 처리

```typescript
class MissingApiKeyError extends Error {
  constructor(keyName: string, service: string) {
    super(`${service} API 키가 설정되지 않았습니다: ${keyName}`);
    this.name = 'MissingApiKeyError';
  }
}
```

### 2. 유효하지 않은 API 키 처리

```typescript
class InvalidApiKeyError extends Error {
  constructor(service: string, statusCode?: number) {
    super(`${service} API 키가 유효하지 않습니다 (${statusCode})`);
    this.name = 'InvalidApiKeyError';
  }
}
```

### 3. 환경 설정 오류 처리

- 개발 시작 시 필수 키 검증
- 명확한 오류 메시지와 해결 방법 제시
- .env.example 파일 자동 생성 제안

## 테스트 전략

### 1. 단위 테스트

- 환경 변수 검증 로직 테스트
- API 키 유효성 검사 테스트
- 오류 처리 시나리오 테스트

### 2. 통합 테스트

- 실제 API 키를 사용한 서비스 연결 테스트
- 환경별 설정 테스트
- 오류 복구 시나리오 테스트

### 3. 보안 테스트

- API 키 노출 방지 테스트
- 환경 변수 접근 제어 테스트
- 민감한 정보 로깅 방지 테스트

## 구현 세부사항

### 1. Voyage AI API 키 통합

- 환경 변수: `VITE_VOYAGE_API_KEY`
- 검증: 키 형식 및 유효성 확인
- 서비스 연결: claudeEmbeddingService.ts 업데이트

### 2. .env 파일 관리

```bash
# .env.example
VITE_VOYAGE_API_KEY=your_voyage_api_key_here
VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 개발자 경험 개선

- 환경 설정 검증 스크립트
- API 키 상태 확인 도구
- 자동화된 설정 가이드

## 보안 고려사항

1. **API 키 보호**
   - .env 파일을 .gitignore에 추가
   - 프로덕션 환경에서는 환경 변수로 주입
   - 로그에 API 키 노출 방지

2. **접근 제어**
   - env.ts를 통한 중앙집중식 접근
   - 타입 안전성을 통한 실수 방지
   - 런타임 검증으로 보안 강화

3. **모니터링**
   - API 키 사용량 추적
   - 비정상적인 접근 패턴 감지
   - 키 만료 및 갱신 알림

## 마이그레이션 계획

1. **1단계**: 환경 변수 스키마 업데이트
2. **2단계**: Voyage API 키 추가 및 검증
3. **3단계**: 기존 서비스 업데이트
4. **4단계**: 테스트 및 문서화
5. **5단계**: 배포 및 모니터링