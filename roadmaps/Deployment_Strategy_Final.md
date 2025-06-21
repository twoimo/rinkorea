# 🚀 최종 배포 전략 가이드

## 🎯 **배포 전략 결정**

### **✅ 1번: Vercel 전용 (기본 전략)**
- **프론트엔드 + 백엔드**: Vercel (Next.js + API Routes)
- **도메인**: 새로운 서브도메인 (예: ai.rinkorea.com)
- **데이터베이스**: Supabase (기존 활용)

### **🔄 2번: 하이브리드 (대안 전략)**
- **기존 사이트**: 카페24 (rinkorea.com 유지)
- **AI 프론트엔드**: Vercel (Next.js)
- **AI 백엔드**: Railway/Render (FastAPI Python)

---

## 📊 **카페24 호스팅 분석**

### **현재 카페24 환경**
```
도메인: rinkorea.com
서비스: 10G 광대역웹 FullSSD Plus 일반형
계약기간: 2021.11.10 - 2028.11.09 (7년 남음)
용량: 웹 1GB, 트래픽 1.5GB/월
서버: PHP 7.3, MariaDB 10.x
FTP: rinfactory@rinkorea.com
```

### **카페24 제약사항**
- ❌ Node.js/Python 런타임 미지원
- ❌ Serverless Functions 미지원  
- ❌ 최신 웹 기술 제한적
- ✅ 안정적인 PHP/MySQL 환경
- ✅ 2028년까지 장기 계약

---

## 🎯 **1번: Vercel 전용 전략 (기본)**

### **아키텍처 구성**
```
ai.rinkorea.com (Vercel)
├── Next.js 14 (프론트엔드)
├── API Routes (백엔드)
├── LangChain.js (AI 엔진)
├── Supabase (데이터베이스)
└── Edge Functions (성능 최적화)

rinkorea.com (카페24) 
└── 기존 사이트 유지 (리다이렉션)
```

### **도메인 연결 방법**
```bash
# Vercel에서 커스텀 도메인 설정
ai.rinkorea.com → Vercel 배포

# 카페24에서 서브도메인 설정
A 레코드: ai → 76.76.19.61 (Vercel IP)
CNAME: ai → cname.vercel-dns.com
```

### **장점**
- ✅ **단일 플랫폼**: 관리 단순
- ✅ **최신 기술**: Edge Functions + SSR
- ✅ **자동 배포**: Git 연동
- ✅ **확장성**: Serverless 스케일링
- ✅ **비용 효율**: 무료 시작

---

## 🔄 **2번: 하이브리드 전략 (대안)**

### **아키텍처 구성**
```
rinkorea.com (카페24)
└── 기존 웹사이트 유지

ai.rinkorea.com (Vercel)  
└── Next.js AI 프론트엔드

api.rinkorea.com (Railway)
└── FastAPI Python 백엔드
```

### **Railway 백엔드 설정**
```python
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"

[env]
PYTHON_VERSION = "3.11"
```

### **장점**
- ✅ **기존 사이트 유지**: rinkorea.com 그대로
- ✅ **Python 완전 활용**: LangChain 모든 기능
- ✅ **분리된 관리**: AI 기능 독립적
- ✅ **확장성**: 각 서비스별 최적화

### **단점**
- ⚠️ **복잡성**: 3개 플랫폼 관리
- ⚠️ **추가 비용**: Railway $5/월
- ⚠️ **CORS 설정**: 도메인 간 통신

---

## 📅 **1번 기본 전략: 수정된 로드맵**

### **Week 1 (6/20-6/26): Next.js 기반 AI 챗봇**

#### **Day 1-2: Vercel 환경 구축**
```bash
# 프로젝트 초기화
npx create-next-app@latest rinkorea-ai --typescript --tailwind --app
cd rinkorea-ai

# AI 패키지 설치
npm install openai @anthropic-ai/sdk @google/generative-ai
npm install @langchain/openai @langchain/anthropic langchain
npm install @supabase/supabase-js

# Vercel 배포
vercel --prod
```

#### **Day 3-4: 다중 LLM API 구현**
```typescript
// pages/api/chat/[provider].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createLLMProvider } from '@/lib/llm-factory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query;
  const { message } = req.body;
  
  try {
    const llm = createLLMProvider(provider as string);
    const response = await llm.invoke(message);
    
    res.json({ success: true, response, provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### **Day 5-7: RAG 시스템 + 스트리밍**
```typescript
// lib/rag-system.ts
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';

export class NextRAGSystem {
  private vectorStore: MemoryVectorStore;
  
  async initialize() {
    // Supabase 데이터 로드
    const products = await this.loadProductData();
    
    // 벡터 스토어 생성
    this.vectorStore = await MemoryVectorStore.fromTexts(
      products.map(p => p.description),
      products.map(p => p.metadata),
      new OpenAIEmbeddings()
    );
  }
  
  async search(query: string) {
    return await this.vectorStore.similaritySearch(query, 4);
  }
}
```

### **Week 2-4: 워크플로우 + 견적 + 최종 완성**
- **Week 2**: Edge Functions 기반 워크플로우
- **Week 3**: 견적 시스템 + PDF 생성
- **Week 4**: 최종 통합 + 배포

---

## 🔧 **Vercel 배포 설정**

### **vercel.json**
```json
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/ai/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### **환경변수 설정**
```bash
# Vercel 환경변수 추가
vercel env add OPENAI_API_KEY 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

vercel env add ANTHROPIC_API_KEY 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

vercel env add GOOGLE_API_KEY AIzaSyBd3vM8XgfrBWZq3J2upUvIwDsIahdf3lE

vercel env add SUPABASE_URL https://fpyqjvnpduwifxgnbrck.supabase.co

vercel env add SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
```

---

## 🌐 **도메인 연결 가이드**

### **카페24에서 서브도메인 설정**
1. 카페24 관리자 페이지 로그인
2. **도메인 관리** → **서브도메인 관리**
3. **ai.rinkorea.com** 추가
4. **DNS 설정**:
   ```
   타입: CNAME
   이름: ai
   값: cname.vercel-dns.com
   ```

### **Vercel에서 도메인 연결**
```bash
# Vercel CLI로 도메인 추가
vercel domains add ai.rinkorea.com

# 또는 Vercel 대시보드에서
Project Settings → Domains → Add ai.rinkorea.com
```

---

## 🎯 **성공 시나리오**

### **7월 13일 완성 목표**
```
✅ ai.rinkorea.com - 완전한 AI 포트폴리오
   ├── 다중 LLM 채팅 시스템
   ├── RAG 기반 제품 상담
   ├── 워크플로우 자동화
   ├── 스마트 견적 생성
   └── 실시간 성능 모니터링

✅ rinkorea.com - 기존 사이트 유지
   └── AI 서비스로 리다이렉션 링크
```

### **MIDAS 포트폴리오 어필 포인트**
1. **최신 기술 스택**: Next.js 14 + Edge Functions
2. **다중 LLM 시스템**: 3개 주요 API 통합
3. **실제 비즈니스 적용**: 운영 중인 사이트 연동
4. **확장 가능한 아키텍처**: Serverless + 모듈화
5. **완성도 높은 UX**: SSE 스트리밍 + 최적화

---

## 🚀 **즉시 시작 가능**

**6월 20일부터 바로 시작할 수 있는 준비 완료:**
- ✅ 모든 API 키 확보
- ✅ 도메인 환경 분석 완료  
- ✅ 최적화된 아키텍처 설계
- ✅ 상세한 구현 계획

**1번 Vercel 전용으로 진행하되, 필요시 2번 하이브리드로 전환 가능한 유연한 전략입니다!** 🎉

**바로 시작하시겠습니까?** 