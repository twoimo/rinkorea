# 🚀 Vercel 배포 최적화 가이드

## 🎯 **Vercel 제약사항 분석 및 해결책**

### **⚠️ Vercel 제약사항**
- **Serverless Function 실행 시간**: 무료 10초, Pro 60초
- **메모리 제한**: 최대 1GB (Pro 플랜)
- **WebSocket 제한**: 지속적 연결 어려움
- **Python 지원**: 제한적 (Node.js/Edge Runtime 권장)
- **파일 시스템**: Read-only (임시 파일만 가능)

### **✅ 최적화된 해결책**

---

## 🔄 **수정된 아키텍처**

### **1. 백엔드 → Next.js API Routes 전환**
```typescript
// pages/api/chat/[provider].ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { provider } = req.query;
  const { message } = req.body;

  try {
    let response;
    
    switch (provider) {
      case 'openai':
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: message }],
          max_tokens: 1000,
        });
        response = completion.choices[0].message.content;
        break;
        
      case 'anthropic':
        const claudeResponse = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{ role: "user", content: message }],
        });
        response = claudeResponse.content[0].text;
        break;
        
      case 'google':
        const model = googleAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(message);
        response = result.response.text();
        break;
        
      default:
        throw new Error('Unsupported provider');
    }

    res.status(200).json({ success: true, response, provider });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### **2. LangChain.js 기반 RAG 시스템**
```typescript
// lib/rag-system.ts
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';

export class VercelRAGSystem {
  private vectorStore: MemoryVectorStore;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initializeVectorStore() {
    // Supabase에서 제품 데이터 로드
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/product_introductions`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });
    
    const products = await response.json();
    
    // 문서로 변환
    const documents = products.map((product: any) => new Document({
      pageContent: `제품명: ${product.name}\n설명: ${product.description}\n특징: ${product.features?.join(', ')}`,
      metadata: { source: 'products', id: product.id },
    }));

    // 텍스트 분할
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splits = await textSplitter.splitDocuments(documents);
    
    // 벡터 스토어 생성
    this.vectorStore = await MemoryVectorStore.fromDocuments(splits, this.embeddings);
  }

  async similaritySearch(query: string, k: number = 4) {
    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }
    
    return await this.vectorStore.similaritySearch(query, k);
  }
}
```

### **3. Server-Sent Events (SSE) 스트리밍**
```typescript
// pages/api/chat/stream.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message, provider = 'openai' } = req.body;

  // SSE 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
      stream: true,
      max_tokens: 1000,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
    res.end();
  }
}
```

### **4. Edge Functions 활용**
```typescript
// pages/api/edge/llm-router.ts
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { message, taskType } = await req.json();
  
  // 작업 유형별 최적 LLM 선택
  const providerMap = {
    'coding': 'openai',
    'reasoning': 'anthropic', 
    'multilingual': 'google',
    'general': 'openai'
  };
  
  const selectedProvider = providerMap[taskType] || 'openai';
  
  // 선택된 LLM으로 리다이렉트
  const response = await fetch(`${req.nextUrl.origin}/api/chat/${selectedProvider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  
  return response;
}
```

---

## 🎨 **프론트엔드 스트리밍 컴포넌트**

### **SSE 기반 채팅 컴포넌트**
```typescript
// components/StreamingChat.tsx
import { useState, useEffect } from 'react';

export default function StreamingChat() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body?.getReader();
      let aiMessage = { role: 'ai', content: '' };
      setMessages(prev => [...prev, aiMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content += data.content;
                  return newMessages;
                });
              }
              if (data.done) break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-4 h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {message.content}
              {message.role === 'ai' && isStreaming && index === messages.length - 1 && (
                <span className="animate-pulse">▋</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="메시지 입력..."
          disabled={isStreaming}
        />
        <button 
          onClick={sendMessage}
          disabled={isStreaming}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </div>
  );
}
```

---

## 📊 **성능 최적화 전략**

### **1. 캐싱 시스템**
```typescript
// lib/cache.ts
const responseCache = new Map<string, {response: string, timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  return null;
}

export function setCachedResponse(key: string, response: string) {
  responseCache.set(key, { response, timestamp: Date.now() });
}
```

### **2. 배치 처리 최적화**
```typescript
// pages/api/batch/inquiries.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { inquiries } = req.body;
  
  // 동시 처리 제한 (Vercel 한계 고려)
  const BATCH_SIZE = 5;
  const results = [];
  
  for (let i = 0; i < inquiries.length; i += BATCH_SIZE) {
    const batch = inquiries.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(processInquiry);
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }
  
  res.json({ results });
}
```

---

## 🚀 **배포 최적화**

### **1. vercel.json 설정**
```json
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "env": {
    "OPENAI_API_KEY": "@openai_api_key",
    "ANTHROPIC_API_KEY": "@anthropic_api_key",
    "GOOGLE_API_KEY": "@google_api_key",
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "rewrites": [
    {
      "source": "/api/chat/:provider",
      "destination": "/api/chat/[provider]"
    }
  ]
}
```

### **2. 환경변수 설정**
```bash
# Vercel 환경변수 설정
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY  
vercel env add GOOGLE_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

---

## 📋 **수정된 24일 로드맵**

### **Week 1 (6/20-6/26): Next.js AI 챗봇**
- **Day 1-2**: Next.js API Routes + 다중 LLM 설정
- **Day 3-4**: LangChain.js RAG 시스템 
- **Day 5-7**: SSE 스트리밍 채팅 + 최적화

### **Week 2 (6/27-7/3): Serverless 워크플로우**
- **Day 8-9**: Edge Functions 기반 LLM 라우터
- **Day 10-11**: Q&A 자동화 (배치 처리)
- **Day 12-14**: Supabase 연동 + 성능 최적화

### **Week 3 (7/4-7/10): 견적 시스템**
- **Day 15-16**: AI 견적 생성 API
- **Day 17-18**: PDF 생성 (클라이언트 사이드)
- **Day 19-21**: 전체 시스템 통합

### **Week 4 (7/11-7/13): 완성 & 배포**
- **Day 22**: 문서 처리 최적화
- **Day 23**: Vercel 배포 + 성능 테스트
- **Day 24**: 포트폴리오 완성

---

## ✅ **Vercel로 가능한 것들**

1. **✅ 다중 LLM 시스템** - JavaScript SDK 사용
2. **✅ 실시간 채팅** - SSE 스트리밍으로 대체
3. **✅ RAG 검색** - LangChain.js + MemoryVectorStore
4. **✅ 자동화 워크플로우** - Edge Functions 활용
5. **✅ 견적 시스템** - 클라이언트 사이드 PDF 생성
6. **✅ 성능 모니터링** - Vercel Analytics 통합

---

## 🎯 **최종 권장사항**

### **👍 Vercel 전용 개발 (추천)**
- **장점**: 배포 간단, 확장성 좋음, 무료 시작 가능
- **단점**: 일부 기능 제약, 학습 곡선

### **🔄 하이브리드 접근**
- **프론트엔드**: Vercel (Next.js)
- **AI 백엔드**: Railway/Render (FastAPI Python)
- **장점**: 최고 성능, 모든 기능 구현 가능

**결론**: **Vercel 전용으로도 충분히 인상적인 포트폴리오 구현 가능**하지만, 일부 아키텍처 수정이 필요합니다!

# Vercel 배포 문제 해결 가이드

## 🚨 하얀 화면 문제 해결 방법

### 1. 환경 변수 설정 (가장 중요!)

Vercel 대시보드에서 다음 환경 변수를 **반드시** 설정하세요:

```
VITE_SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
NODE_ENV=production
```

### 2. createPortal 오류 수정

다음 명령어로 모든 createPortal 오류를 수정하세요:

```bash
# Windows (PowerShell)
Get-ChildItem -Path "src" -Include "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "createPortal\(" -and $content -notmatch "document\.body") {
        $content = $content -replace "(\s+)\);?\s*$", "`$1, document.body);"
        Set-Content -Path $_.FullName -Value $content
        Write-Host "Fixed: $($_.FullName)"
    }
}
```

### 3. 빌드 및 배포 확인

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
npm run preview

# 빌드 성공 후 Vercel에 배포
vercel --prod
```

### 4. 배포 후 확인사항

1. **브라우저 개발자 도구 콘솔 확인**
   - JavaScript 오류가 없는지 확인
   - 404 오류가 없는지 확인

2. **네트워크 탭 확인**
   - 모든 리소스가 로드되는지 확인
   - API 요청이 성공하는지 확인

3. **Vercel 함수 로그 확인**
   - Vercel 대시보드에서 함수 로그 확인

### 5. 일반적인 문제 해결

#### 문제: 하얀 화면만 보임
**해결책:**
1. Vercel 환경 변수 설정 확인
2. 브라우저 캐시 삭제 후 재시도
3. 시크릿 모드에서 접속 확인

#### 문제: "Target container is not a DOM element"
**해결책:**
1. 모든 createPortal 호출에 `document.body` 추가
2. SSR 안전성 확인 (`typeof window !== 'undefined'` 체크)

#### 문제: 환경 변수 오류
**해결책:**
1. Vercel 대시보드에서 환경 변수 재설정
2. 재배포 실행

### 6. 긴급 복구 방법

만약 배포가 계속 실패한다면:

1. **롤백**: 이전 정상 배포로 롤백
2. **로컬 빌드 테스트**: `npm run build && npm run preview`
3. **단계별 배포**: 작은 변경사항부터 점진적으로 배포
4. **환경 분리**: development 브랜치에서 먼저 테스트

### 7. 모니터링 설정

```javascript
// src/lib/error-monitoring.ts
export const initErrorMonitoring = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // 에러 리포팅 서비스에 전송
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // 에러 리포팅 서비스에 전송
    });
  }
};
```

---

## 🎯 체크리스트

- [ ] Vercel 환경 변수 설정 완료
- [ ] 로컬 프로덕션 빌드 성공
- [ ] createPortal 오류 수정 완료
- [ ] 배포 후 정상 작동 확인
- [ ] 브라우저 콘솔 오류 없음
- [ ] 모든 페이지 정상 로드 확인

이 가이드를 따르면 Vercel 배포 시 하얀 화면 문제를 완전히 해결할 수 있습니다. 