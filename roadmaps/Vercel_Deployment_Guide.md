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

---

## 🎨 **프론트엔드 스트리밍 컴포넌트**

### **SSE 기반 채팅 컴포넌트**
```typescript
// components/StreamingChat.tsx
import { useState } from 'react';

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
