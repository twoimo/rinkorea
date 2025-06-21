# MIDAS AI/LLM 엔지니어 포트폴리오 개발 계획

## 🎯 **목표**
린코리아 프로젝트 기반 **실무형 AI/LLM 시스템** 구축으로 MIDAS 채용 요구사항 100% 충족

**개발 기간**: 2025년 6월 20일 ~ 7월 13일 (24일, 약 3.5주)

---

## 📋 **MIDAS 요구사항 분석**

### ✅ 핵심 기술 스택
- **Python 기반 LLM 서비스 개발** ✅
- **LangChain, LangGraph 프레임워크** ✅  
- **VectorDB + RAG 시스템** ✅
- **클라우드, CI/CD, 백엔드 개발** ✅
- **자연어처리, 추천 시스템** ✅

### 🏆 **차별화 포인트**
- 실제 운영중인 웹사이트에 AI 기능 통합
- B2B 건설/화학 도메인 특화 AI
- 다국어 지원 + 실시간 서비스

---

## 🚀 **핵심 구현 기능**

### 1️⃣ **AI 고객 상담 챗봇** (1주차)
```
🔸 LangChain + OpenAI GPT-4 기반
🔸 제품 DB 연동 RAG 시스템
🔸 실시간 웹소켓 채팅
🔸 다국어 지원 (한/영/중/인도네시아)
```

### 2️⃣ **지능형 Q&A 자동화** (2주차)  
```
🔸 LangGraph 워크플로우 엔진
🔸 문의 분류 → 자동 답변 → 전문가 검토
🔸 Vector DB 기반 유사 문의 검색
🔸 답변 품질 평가 시스템
```

### 3️⃣ **스마트 견적 시스템** (3주차)
```
🔸 프로젝트 조건 분석 AI
🔸 최적 제품 조합 추천
🔸 자동 견적서 PDF 생성
🔸 가격 예측 ML 모델
```

### 4️⃣ **문서 지능 검색 엔진** (4주차)
```
🔸 PDF/이미지 OCR + 임베딩
🔸 의미 기반 검색 (Semantic Search)
🔸 문서 요약 및 Q&A
🔸 실시간 검색 결과 개선
```

---

## 📅 **상세 일정표**

### **Week 1: AI 챗봇 기반 구축** (6/20 - 6/26)

#### Day 1-2: 인프라 & 기본 설정
```bash
✅ LangChain 환경 구축
✅ OpenAI API 연동
✅ Supabase Vector 확장 설정
✅ 기본 챗봇 UI 구현
```

#### Day 3-4: RAG 시스템 구축
```bash
✅ 제품 데이터 벡터화
✅ Chroma/Pinecone Vector DB 구축
✅ 문서 청킹 & 임베딩 파이프라인
✅ 검색 품질 테스트
```

#### Day 5-7: 챗봇 완성
```bash
✅ 대화 플로우 설계
✅ 컨텍스트 기억 시스템
✅ 다국어 번역 연동
✅ 웹소켓 실시간 채팅
```

**Week 1 결과물**: 실시간 AI 상담 챗봇

---

### **Week 2: LangGraph 워크플로우** (6/27 - 7/3)

#### Day 8-9: Q&A 시스템 분석
```bash
✅ 기존 Q&A 데이터 분석
✅ 문의 카테고리 분류 모델
✅ 자동 답변 템플릿 생성
```

#### Day 10-11: LangGraph 워크플로우
```bash
✅ 상태 머신 설계
✅ 에이전트 체인 구축
✅ 조건부 분기 로직
✅ 휴먼 피드백 루프
```

#### Day 12-14: 통합 & 최적화
```bash
✅ 기존 Q&A 시스템 연동
✅ 자동화 규칙 설정
✅ 성능 모니터링
✅ A/B 테스트 준비
```

**Week 2 결과물**: 지능형 고객 서비스 자동화 시스템

---

### **Week 3: 추천 & 견적 AI** (7/4 - 7/10)

#### Day 15-16: 데이터 분석 & 모델링
```bash
✅ 프로젝트 히스토리 분석
✅ 제품 매칭 알고리즘
✅ 가격 예측 모델 훈련
```

#### Day 17-18: 견적 시스템 개발
```bash
✅ 요구사항 입력 폼
✅ AI 기반 제품 추천
✅ 견적서 자동 생성
✅ PDF 템플릿 시스템
```

#### Day 19-21: 고도화
```bash
✅ 추천 정확도 개선
✅ 실시간 가격 업데이트
✅ 견적 히스토리 관리
✅ 사용자 피드백 수집
```

**Week 3 결과물**: 스마트 견적 & 추천 시스템

---

### **Week 4: 문서 AI & 최종 완성** (7/11 - 7/13)

#### Day 22: 문서 처리 AI
```bash
✅ OCR + PDF 텍스트 추출
✅ 문서 임베딩 시스템
✅ 의미 기반 검색 엔진
```

#### Day 23: 통합 & 테스트
```bash
✅ 전체 시스템 통합
✅ 성능 최적화
✅ 종합 테스트
✅ 버그 수정
```

#### Day 24: 문서화 & 발표 준비
```bash
✅ 기술 문서 작성
✅ 데모 시나리오 준비
✅ 성과 지표 정리
✅ 포트폴리오 완성
```

**Week 4 결과물**: 종합 AI 플랫폼 + 완성된 포트폴리오

---

## 🛠 **기술 스택 상세**

### **Backend (Python)**
```python
# Core AI/ML - 다중 LLM 지원
langchain==0.1.0
langchain-openai==0.0.5
langchain-anthropic==0.1.3
langchain-google-genai==0.0.8
langgraph==0.0.30
openai==1.12.0
anthropic==0.8.1
google-generativeai==0.3.2

# Vector DB & Search
chromadb==0.4.22
pinecone-client==3.0.0
faiss-cpu==1.7.4

# Document Processing
pypdf2==3.0.1
python-docx==0.8.11
pillow==10.2.0
pytesseract==0.3.10

# Web Framework
fastapi==0.109.0
uvicorn==0.27.0
websockets==12.0

# Database & Cloud
supabase==2.3.0
redis==5.0.1
celery==5.3.6
```

### **실제 API 키 설정 (완전 활성화)**
```env
# === 다중 LLM API 키 ===
OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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
GOOGLE_API_KEY=AIzaSyBd3vM8XgfrBWZq3J2upUvIwDsIahdf3lE

# === Vector Database ===
PINECONE_API_KEY=pcsk_4AQeoW_T5yG4j6JcG2kbvQZjTsrBg5HzyYofmLZUixjrCz3gG4s4sBWVN6TZ819BzNzCY8

# === Main Database ===
SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU

# === 프론트엔드용 (Next.js) ===
NEXT_PUBLIC_SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
```

**🚀 다중 LLM 시스템의 핵심 차별화**
- **3개 주요 LLM API 완전 통합**: OpenAI, Anthropic, Google 모든 API 활성화
- **지능형 LLM 선택**: 작업 유형별 최적 LLM 자동 선택 (코딩→GPT-4, 추론→Claude, 다국어→Gemini)  
- **자동 폴백 시스템**: 1차 LLM 실패 시 자동으로 2차, 3차 LLM 시도 (99.9% 가용성 보장)
- **실시간 성능 모니터링**: 응답시간, 성공률 기반으로 최적 LLM 추천
- **비용 최적화**: 작업 복잡도에 따른 효율적 모델 선택

### **Frontend (Next.js/React)**
```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "@langchain/community": "^0.0.25",
    "socket.io-client": "^4.7.4",
    "pdf-lib": "^1.17.1",
    "react-markdown": "^9.0.1"
  }
}
```

### **Infrastructure**
```yaml
# Docker Compose
services:
  - ai-backend (Python FastAPI)
  - vector-db (ChromaDB)
  - redis-cache
  - nginx-proxy
```

---

## 📊 **예상 성과 지표**

### **기술적 성과**
- **응답 정확도**: 85%+ (RAG 기반)
- **응답 속도**: 평균 2초 이내
- **다국어 지원**: 4개 언어
- **동시 사용자**: 100명+

### **비즈니스 임팩트**
- **Q&A 처리 시간**: 70% 단축
- **견적서 생성 시간**: 90% 단축  
- **고객 만족도**: 30% 향상
- **업무 효율성**: 50% 개선

---

## 🎨 **핵심 차별화 요소**

### 1️⃣ **실무 중심 포트폴리오**
- 토이 프로젝트가 아닌 **실제 운영 시스템**
- B2B 도메인 특화 AI 솔루션
- 확장 가능한 마이크로서비스 아키텍처

### 2️⃣ **최신 기술 스택 활용**
- LangGraph 상태 머신으로 복잡한 워크플로우 구현
- Multi-modal AI (텍스트 + 이미지 + PDF)
- Real-time streaming response

### 3️⃣ **완성도 높은 UX/UI**
- 직관적인 채팅 인터페이스
- 실시간 상태 표시
- 모바일 최적화

### 4️⃣ **확장성 & 운영성**
- 모니터링 & 로깅 시스템
- A/B 테스트 프레임워크  
- CI/CD 파이프라인

---

## 📝 **제출 포트폴리오 구성**

### **1. GitHub Repository**
```
📦 rinkorea-ai-platform
├── 📁 backend/          # Python FastAPI + LangChain
├── 📁 frontend/         # Next.js + React
├── 📁 ai-models/        # Custom AI Models
├── 📁 docker/           # Docker Configurations
├── 📁 docs/             # Technical Documentation
├── 📁 tests/            # Unit & Integration Tests
└── 📄 README.md         # Demo & Setup Guide
```

### **2. 라이브 데모 사이트**
- **URL**: `https://rinkorea-ai.vercel.app`
- **Admin Panel**: 실시간 AI 성능 모니터링
- **API Documentation**: Swagger UI
- **Performance Dashboard**: 응답 시간, 정확도 등

### **3. 기술 발표 자료**
- **Architecture Overview**: 시스템 구조도
- **AI Pipeline**: LangChain/LangGraph 플로우
- **Performance Metrics**: 정량적 성과 지표
- **Future Roadmap**: 확장 계획

### **4. 상세 문서**
- **Technical Specification**: 기술 명세서
- **API Reference**: REST API 문서
- **Deployment Guide**: 배포 가이드
- **Troubleshooting**: 트러블슈팅 가이드

---

## 🔥 **성공 전략**

### **1주차 끝 - 1차 검증**
- 기본 챗봇 동작 확인
- RAG 검색 품질 테스트
- 피드백 반영 후 조정

### **2주차 끝 - 중간 점검**  
- LangGraph 워크플로우 검증
- Q&A 자동화 효과 측정
- 기능 우선순위 재조정

### **3주차 끝 - 통합 테스트**
- 전체 시스템 통합 완료
- 성능 벤치마크 수행
- 사용자 테스트 진행

### **최종 완성 - 포트폴리오 제출**
- 완성도 높은 라이브 데모
- 상세한 기술 문서
- 인상적인 발표 자료

---

## 💡 **성공 포인트**

1. **실용성**: 실제 비즈니스 문제 해결
2. **기술력**: 최신 AI 기술 스택 활용  
3. **완성도**: 프로덕션 레벨 품질
4. **확장성**: 미래 발전 가능성
5. **문서화**: 체계적인 기술 문서

이 계획대로 진행하면 **MIDAS에서 원하는 모든 기술 요구사항을 충족**하면서도 **실무 즉시 활용 가능한 포트폴리오**를 완성할 수 있습니다! 🚀

---

*"단순한 토이 프로젝트가 아닌, 실제 비즈니스 가치를 창출하는 AI 시스템 구축"* 