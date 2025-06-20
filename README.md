# 🏗️ 린코리아(RIN Korea) 공식 웹사이트

> **친환경 불연재(1액형) 신소재 세라믹 코팅제 전문 기업**  
> 특허 제10-2312833호 | 상표 제40-1678504호

![RIN Korea Logo](public/images/rin-korea-logo-black.png)

## 📋 프로젝트 개요

린코리아는 건설재료사업부와 건설기계사업부를 운영하는 종합 건설 솔루션 전문 기업입니다. 본 프로젝트는 린코리아의 **공식 웹사이트**로, 제품 소개부터 온라인 판매, 시공사례 관리, 고객 지원까지 통합적인 비즈니스 플랫폼을 제공합니다.

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
- **🛍️ 온라인 쇼핑몰**: 제품 판매, 장바구니, 주문 관리
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
│   │   ├── shop/            # 쇼핑몰 컴포넌트
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
    └── optimize-images.js   # 이미지 최적화 스크립트
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
- **이메일**: contact@rinkorea.com
- **전화**: +82-032-571-1023
- **주소**: 인천광역시 서구 백범로 707 (주안국가산업단지)

## 📄 라이센스

이 프로젝트는 린코리아의 소유이며, 상업적 목적으로 사용됩니다.

---

**Made with ❤️ by RIN Korea Development Team**
