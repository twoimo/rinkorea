# 🏗️ 린코리아(RIN Korea) 공식 웹사이트

> **친환경 불연재(1액형) 신소재 세라믹 코팅제 전문 기업**  
> 특허 제10-2312833호 | 상표 제40-1678504호

## 📋 프로젝트 개요

린코리아는 건설재료사업부와 건설기계사업부를 운영하는 종합 건설 솔루션 전문 기업입니다. 본 프로젝트는 린코리아의 **공식 웹사이트**로, 제품 소개부터 온라인 판매, 시공사례 관리, 고객 지원까지 통합적인 비즈니스 플랫폼을 제공합니다..

### 🎯 주요 사업 영역
- **건설재료사업부**: 친환경 불연재 세라믹 코팅제 (린코트) 제조 및 판매
- **건설기계사업부**: 건설 장비 및 기계 사업 (2024년 신설)

### 🏢 회사 정보
- **본사 위치**: 인천광역시 서구 백범로 707 (주안국가산업단지)
- **확장 계획**: 천안 테크노파크 산업단지 입주예정 (2026년)
- **사업자등록번호**: 747-42-00526

## 🚀 기술 스택

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **Language**: TypeScript 5.5.3
- **Routing**: React Router DOM 6.26.2
- **State Management**: TanStack React Query 5.56.2

### UI/UX
- **UI Library**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS 3.4.11
- **Icons**: Lucide React 0.462.0
- **Animations**: Framer Motion 12.18.1
- **Components**: Responsive design with mobile-first approach

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage (이미지 및 파일)

### 개발 도구
- **Package Manager**: Bun (권장) or npm
- **Linting**: ESLint 9.9.0
- **Code Quality**: TypeScript ESLint
- **Development**: Hot reload, Fast refresh

### 추가 기능
- **다국어 지원**: i18next (한국어, 영어, 중국어, 인도네시아어)
- **이미지 최적화**: Sharp, WebP 변환
- **차트**: Recharts 2.15.3
- **폼 관리**: React Hook Form + Zod validation
- **드래그 앤 드롭**: @dnd-kit

## 🎨 주요 기능

### 🔥 핵심 기능
- **🏠 메인 페이지**: 유튜브 배경 영상, 제품 소개, CTA 버튼
- **🛍️ 온라인 스토어**: 제품 판매, 장바구니, 주문 관리
- **📦 제품 관리**: 제품 등록, 수정, 삭제 (관리자)
- **🏗️ 시공사례**: 프로젝트 포트폴리오, 이미지 갤러리
- **📰 뉴스**: 공지사항, 보도자료, 업데이트
- **❓ Q&A**: 고객 문의, 답변 관리
- **📄 자료실**: 제품 카탈로그, 시험성적서, 인증서

### 🔐 관리자 기능
- **사용자 권한 관리**: 일반 사용자 / 관리자 구분
- **컨텐츠 관리**: 모든 섹션의 CRUD 작업
- **매출 분석**: 데이터 시각화, 차트, 통계
- **실시간 수정**: 메인 페이지 유튜브 링크 실시간 변경
- **이미지 관리**: 최적화된 이미지 업로드 및 관리

### 🌍 사용자 경험
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **다국어 지원**: 4개 언어 지원 (한/영/중/인도네시아어)
- **빠른 로딩**: 이미지 최적화, 코드 스플리팅
- **SEO 최적화**: 메타 태그, 구조화된 데이터
- **접근성**: ARIA 라벨, 키보드 네비게이션

### 🌐 **NEW: 글로벌 SEO & 다국어 자동 감지**
- **🔍 스마트 언어 감지**: 브라우저 언어, 지역, URL 파라미터 자동 감지
- **🗺️ 다국어 사이트맵**: hreflang 태그가 포함된 XML 사이트맵 자동 생성
- **📱 반응형 언어 선택기**: 감지 정보와 함께 제공되는 깔끔한 UI
- **🔧 동적 SEO 관리**: 페이지별, 언어별 메타 태그 및 구조화된 데이터
- **🌍 글로벌 최적화**: 165개국 지역별 언어 매핑

## 🛠️ 설치 및 실행

### 1. Bun 설치 (권장)

#### Windows
```bash
# PowerShell에서 실행
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### macOS/Linux
```bash
# curl 사용
curl -fsSL https://bun.sh/install | bash

# 또는 npm 사용
npm install -g bun
```

#### Bun 설치 확인
```bash
bun --version
```

### 2. 프로젝트 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/rinkorea.git
cd rinkorea

# 의존성 설치 (Bun 사용)
bun install

# 또는 npm 사용
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API 설정
VITE_API_URL=http://localhost:8080
VITE_API_KEY=your_api_key

# 인증 설정
VITE_AUTH_DOMAIN=your_auth_domain
VITE_AUTH_CLIENT_ID=your_auth_client_id

# 앱 설정
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=RIN Korea

# 선택사항
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

### 4. 개발 서버 실행

```bash
# Bun 사용 (권장)
bun run dev

# 또는 npm 사용
npm run dev
```

개발 서버가 `http://localhost:8080`에서 실행됩니다.

### 5. 빌드 및 배포

```bash
# 프로덕션 빌드
bun run build

# 빌드 미리보기
bun run preview

# 이미지 최적화 (선택사항)
bun run optimize-images

# 🌐 SEO 최적화 스크립트 (NEW)
bun run generate-sitemaps    # 다국어 사이트맵 생성
bun run build:seo           # 사이트맵 생성 + 빌드
```

## 📁 프로젝트 구조

```
rinkorea/
├── public/                     # 정적 파일
│   ├── images/                # 이미지 리소스
│   │   ├── optimized/         # 최적화된 WebP 이미지
│   │   └── ...               # 원본 이미지들
│   └── locales/              # 다국어 번역 파일
│       ├── ko/               # 한국어
│       ├── en/               # 영어
│       ├── zh/               # 중국어
│       └── id/               # 인도네시아어
├── src/
│   ├── components/           # React 컴포넌트
│   │   ├── ui/              # Shadcn UI 컴포넌트
│   │   ├── sections/        # 페이지 섹션 컴포넌트
│   │   ├── products/        # 제품 관련 컴포넌트
│   │   ├── projects/        # 시공사례 컴포넌트
│   │   ├── news/            # 뉴스 컴포넌트
│   │   ├── qna/             # Q&A 컴포넌트
│   │   ├── shop/            # 스토어 컴포넌트
│   │   ├── admin/           # 관리자 컴포넌트
│   │   └── ...              # 기타 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   ├── hooks/               # 커스텀 훅
│   ├── lib/                 # 유틸리티 함수
│   ├── types/               # TypeScript 타입 정의
│   ├── integrations/        # 외부 서비스 통합
│   │   └── supabase/        # Supabase 설정
│   └── contexts/            # React Context
├── supabase/                # Supabase 설정 및 마이그레이션
│   └── migrations/          # 데이터베이스 마이그레이션
└── scripts/                 # 빌드 스크립트
    ├── optimize-images.js   # 이미지 최적화 스크립트
    └── generate-sitemaps.js # 🌐 다국어 사이트맵 자동 생성
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **products**: 제품 정보
- **projects**: 시공사례
- **news**: 뉴스/공지사항
- **inquiries**: Q&A 문의
- **equipment**: 장비/기계 정보
- **revenue**: 매출 데이터
- **site_settings**: 사이트 설정

### Supabase 설정
```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 개발 환경 시작
supabase start

# 마이그레이션 실행
supabase db push
```

## 🎯 개발 가이드

### 코딩 스타일
- **TypeScript**: 모든 코드에 타입 정의
- **함수형 프로그래밍**: 클래스 대신 함수형 컴포넌트 사용
- **컴포넌트 구조**: 내보내기 → 서브컴포넌트 → 헬퍼 → 정적 콘텐츠 → 타입
- **네이밍**: 카멜케이스, 보조 동사 사용 (isLoading, hasError)

### 성능 최적화
- **RSC 우선**: 'use client' 최소화
- **동적 로딩**: 중요하지 않은 컴포넌트는 동적 로딩
- **이미지 최적화**: WebP 포맷, 지연 로딩
- **번들 분할**: 코드 스플리팅 적용

### 테스트
```bash
# 단위 테스트 실행
bun test

# 컴포넌트 테스트
bun test:components

# E2E 테스트
bun test:e2e
```

## 🌐 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경별 빌드
```bash
# 개발 환경 빌드
bun run build:dev

# 프로덕션 빌드
bun run build
```

## 🔒 보안

- **환경 변수**: 민감한 정보는 .env 파일에 저장
- **인증**: Supabase Auth를 통한 안전한 사용자 인증
- **권한 관리**: 역할 기반 접근 제어 (RBAC)
- **SQL 인젝션 방지**: Supabase의 Row Level Security (RLS)

## 🤝 기여하기

1. 이 저장소를 Fork하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋하세요 (`git commit -am '새 기능 추가'`)
4. 브랜치에 Push하세요 (`git push origin feature/새기능`)
5. Pull Request를 생성하세요

## 📞 지원 및 문의

- **회사**: 린코리아 (RIN Korea)
- **이메일**: 2019@rinkorea.com
- **전화**: +82-032-571-1023
- **주소**: 인천광역시 서구 백범로 707 (주안국가산업단지)

---

## 🚀 향후 계획: AI/LLM 포트폴리오 개발

> **개발 기간**: 2025년 6월 20일 ~ 7월 13일 (24일)  
> **목표**: AI/LLM Engineer 포지션 및 금융공학연구소 포지션 어필

### 🎯 **개발 목표**

기존 린코리아 웹사이트에 **최신 AI/LLM 기술을 통합**하여 **실제 비즈니스 가치를 창출하는 AI 플랫폼**으로 확장합니다.

**🔥 핵심 전문성 증명:**
- **AI/LLM 개발**: 일반 AI/LLM 개발 역량 + 실무 적용 능력
- **금융 도메인**: 금융 도메인 특화 + 기계학습 방법론 + LLM 솔루션

### 🔥 **핵심 AI 기능 (5대 시스템)**

#### 1️⃣ **AI 고객 상담 챗봇**
```
🤖 다중 LLM 지원 (OpenAI GPT-4, Anthropic Claude, Google Gemini)
🔍 RAG 기반 제품 정보 검색 (Vector DB + LangChain)
🌐 실시간 스트리밍 채팅 (Server-Sent Events)
🗣️ 다국어 자동 번역 (한/영/중/인도네시아어)
```

#### 2️⃣ **지능형 Q&A 자동화**
```
🕸️ LangGraph 워크플로우 엔진
📋 문의 자동 분류 및 긴급도 평가
🤖 컨텍스트 기반 자동 답변 생성
👨‍💼 인간 전문가 에스컬레이션 시스템
```

#### 3️⃣ **스마트 견적 시스템**
```
📊 AI 기반 프로젝트 조건 분석
🎯 최적 제품 조합 추천
📄 자동 견적서 PDF 생성
💰 ML 기반 가격 예측 모델
```

#### 4️⃣ **문서 지능 검색 엔진**
```
🔍 PDF/이미지 OCR + 의미 기반 검색
📚 문서 요약 및 Q&A
🧠 실시간 검색 결과 개선
📁 카탈로그, 인증서 지능 관리
```

#### 5️⃣ **📈 금융 AI 분석 시스템** ⭐ **NEW (금융 특화)**
```
💹 매출 데이터 시계열 분석 + 예측 모델
🤖 LLM 기반 재무 보고서 자동 생성
📊 기계학습 기반 리스크 평가 모델
🔍 금융 지표 이상 탐지 시스템
💰 투자 포트폴리오 최적화 알고리즘
```

### 🛠️ **기술 스택 확장**

#### **AI/ML Framework**
```typescript
// Backend (Next.js API Routes)
- LangChain.js: AI 체인 및 워크플로우
- OpenAI SDK: GPT-4 챗봇 및 임베딩
- Anthropic SDK: Claude 3.5 Sonnet
- Google AI SDK: Gemini Pro
- Vector DB: 메모리 벡터 스토어 / Pinecone 연동

// 🔥 금융 AI 추가 (금융 특화)
- TensorFlow.js: 브라우저 기반 ML 모델
- D3.js: 금융 데이터 시각화
- Recharts: 실시간 차트 및 대시보드
- Statistics.js: 금융 통계 분석
```

#### **금융 도메인 확장**
```yaml
# 금융 데이터 처리
Financial Data: 매출, 수익, 비용 분석
Time Series: ARIMA, LSTM 시계열 예측
Risk Models: VaR, CVaR 리스크 계산
Portfolio: 마르코위츠 포트폴리오 최적화

# 기계학습 방법론
ML Models: Random Forest, XGBoost, Neural Networks
Feature Engineering: 금융 지표 생성 및 선택
Model Validation: Cross-validation, Backtesting
```

#### **인프라 및 배포**
```yaml
# Vercel 전용 아키텍처
Platform: Vercel (Serverless Functions)
Domain: ai.rinkorea.com
Database: Supabase (기존 + 금융 데이터 확장)
Monitoring: Vercel Analytics + 금융 모델 성능 추적
CDN: Vercel Edge Network
```

### 📅 **개발 로드맵 (금융 AI 확장)**

#### **Week 1 (6/20-6/26): Next.js AI 챗봇**
- ✅ Vercel 환경 구축 + 다중 LLM API Routes
- ✅ SSE 스트리밍 실시간 채팅 시스템
- ✅ LangChain.js RAG 검색 엔진
- ✅ React 채팅 UI 컴포넌트

#### **Week 2 (6/27-7/3): Edge Functions 워크플로우**
- ✅ JavaScript 기반 워크플로우 상태 머신
- ✅ API Routes Q&A 자동화 시스템
- ✅ Supabase 연동 에스컬레이션
- ✅ Vercel Analytics 성능 모니터링

#### **Week 3 (7/4-7/10): 스마트 견적 + 금융 AI** ⭐
- ✅ AI 견적 생성 API Routes
- ✅ 클라이언트 사이드 PDF 생성
- ✅ **금융 데이터 시계열 분석 모델** (금융 특화)
- ✅ **LLM 기반 재무 리포트 생성** (금융 특화)

#### **Week 4 (7/11-7/13): 완성 & 배포**
- ✅ 브라우저 기반 문서 처리
- ✅ **금융 대시보드 + ML 모델 시각화** (금융 특화)
- ✅ ai.rinkorea.com 완전 배포
- ✅ **AI/LLM + 금융 특화 통합 포트폴리오 완성**

### 🏆 **예상 성과 지표**

#### **기술적 성과 (AI/LLM + 금융 도메인)**
```
📈 응답 정확도: 87%+ (RAG 기반)
⚡ 응답 속도: 평균 2초 이내
🌍 다국어 지원: 4개 언어
👥 동시 사용자: 150명+
🔄 Q&A 자동화율: 73%
📊 견적 생성 시간: 평균 45초

💹 금융 예측 정확도: 85%+ (시계열 모델)
📊 리스크 계산 속도: 실시간 처리
🤖 재무 보고서 생성: 자동화 90%
```

#### **비즈니스 임팩트**
```
⏰ Q&A 처리 시간: 70% 단축
📋 견적서 생성 시간: 90% 단축
😊 고객 만족도: 30% 향상
🚀 업무 효율성: 50% 개선

💰 재무 분석 시간: 80% 단축
📈 투자 의사결정 속도: 3배 향상
🔍 리스크 감지 정확도: 40% 개선
```

### 🎨 **핵심 차별화 요소**

#### **1. 실무 중심 포트폴리오**
- 토이 프로젝트가 아닌 **실제 운영 시스템**
- **B2B 건설/화학** + **금융 도메인** 이중 전문성
- 확장 가능한 서버리스 아키텍처

#### **2. 최신 기술 스택 완전 활용**
- **다중 LLM 지능형 선택**: 작업별 최적 AI 자동 선택
- **Edge Functions 워크플로우**: 글로벌 성능 최적화
- **SSE 스트리밍**: WebSocket보다 나은 사용자 경험
- **브라우저 ML**: TensorFlow.js 실시간 금융 모델

#### **3. AI/LLM + 금융 도메인 요구사항 100% 충족**
```
✅ Python/JavaScript LLM 서비스 개발
✅ LangChain, LangGraph 프레임워크
✅ Vector DB + RAG 시스템 구축
✅ 클라우드 네이티브 아키텍처
✅ 자연어처리 + 추천 시스템

🔥 금융 도메인 추가 (금융 특화)
✅ 금융 데이터 + 기계학습 방법론
✅ 대형언어모델(LLM) 솔루션 개발
✅ 시계열 분석 + 예측 모델
✅ 리스크 평가 + 포트폴리오 최적화
✅ 수학/통계/금융공학 백그라운드 증명
```

### 🌐 **최종 AI 플랫폼 구성**

```
ai.rinkorea.com (Vercel)
├── 🤖 다중 LLM 채팅 시스템
├── 🔄 지능형 Q&A 자동화
├── 💰 스마트 견적 생성
├── 🔍 문서 AI 검색 엔진
├── 📊 실시간 성능 모니터링
├── 📱 모바일 최적화 UI
└── 💹 금융 AI 분석 시스템 ⭐ NEW
    ├── 매출 예측 대시보드
    ├── LLM 재무 보고서 생성
    ├── ML 리스크 평가 모델
    └── 투자 포트폴리오 시각화

rinkorea.com (카페24 - 기존 유지)
└── 🔗 AI 서비스 연결 버튼
```

### 📚 **상세 개발 가이드**

자세한 구현 방법과 코드는 `roadmaps/` 폴더의 가이드 문서들을 참조하세요:

1. **`Quick_Start_Guide.md`** - Vercel에서 즉시 시작하기
2. **`Deployment_Strategy_Final.md`** - 최종 배포 전략
3. **`Multi_LLM_Setup.md`** - 다중 LLM 시스템 구축
4. **`Financial_AI_Guide.md`** ⭐ - 금융 AI 시스템 구축 (신규)
5. **주차별 상세 가이드** - Week1~4 단계별 구현

### 🎯 **성공 목표 (7월 13일)**

**완성될 ai.rinkorea.com:**
- ✅ **3개 LLM 지원** 실시간 AI 상담
- ✅ **워크플로우 자동화** Q&A 시스템  
- ✅ **AI 견적 생성** PDF 출력
- ✅ **문서 지능 검색** 시맨틱 검색
- ✅ **성능 모니터링** 실시간 대시보드
- ✅ **💹 금융 AI 분석** 시계열 예측 + LLM 리포트

**포트폴리오 어필 포인트:**
🔥 **실무급 AI 플랫폼** (실제 비즈니스 연동)  
🔥 **최신 기술 스택** (Vercel + Next.js 14 + 다중 LLM)  
🔥 **완성도 높은 UX** (SSE 스트리밍 + 모바일 최적화)  
🔥 **확장 가능한 아키텍처** (서버리스 + 마이크로서비스)  
🔥 **🆕 금융 도메인 전문성** (기계학습 + LLM + 금융공학)

**🎯 통합 목표 달성:**
- **AI/LLM 개발**: 일반 AI/LLM 개발 역량 + 실무 적용
- **금융 도메인**: 금융 특화 + 기계학습 방법론 + LLM 솔루션

## 📄 라이센스

이 프로젝트는 린코리아의 소유이며, 상업적 목적으로 사용됩니다.

---

**Made with ❤️ by RIN Korea Development Team**
