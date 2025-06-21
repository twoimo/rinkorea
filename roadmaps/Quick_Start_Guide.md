# �� Quick Start Guide: Vercel에서 즉시 시작하기

## ⚡ **6월 20일 바로 시작할 수 있는 준비 사항**

### **1. 필수 계정 및 도구 준비** (소요시간: 20분)

```bash
# 필수 계정들
✅ Vercel 계정 (https://vercel.com)
✅ GitHub 계정 (코드 저장용)
✅ 모든 API 키 준비 완료

# 개발 도구
✅ Node.js 18+ 설치
✅ Git 설치
✅ VS Code (또는 선호하는 에디터)
```

### **2. API 키 확인** (모두 준비 완료)
```env
# 다중 LLM 지원 (3개 제공자 모두 활성화)
OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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
GOOGLE_API_KEY=AIzaSyBd3vM8XgfrBWZq3J2upUvIwDsIahdf3lE

# 데이터베이스 (기존 활용)
SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
```

---

## 📋 **첫째 날 (6/20) 즉시 실행 가이드**

### **Step 1: Next.js 프로젝트 생성** (5분)

```bash
# 새로운 Next.js 프로젝트 생성
npx create-next-app@latest rinkorea-ai --typescript --tailwind --app --use-npm
cd rinkorea-ai

# Vercel CLI 설치 (글로벌)
npm i -g vercel

# AI 관련 패키지 설치
npm install openai @anthropic-ai/sdk @google/generative-ai
npm install langchain @langchain/openai @langchain/anthropic @langchain/community
npm install @supabase/supabase-js
npm install @radix-ui/react-icons lucide-react
```

### **Step 2: 환경변수 설정** (2분)

```bash
# .env.local 파일 생성
echo "OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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
GOOGLE_API_KEY=AIzaSyBd3vM8XgfrBWZq3J2upUvIwDsIahdf3lE
SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU" > .env.local
```

### **Step 3: 다중 LLM API Routes 구현** (30분)

```typescript
// app/api/chat/[provider]/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { message } = await request.json();
    const { provider } = params;

    let response;
    let providerUsed = provider;

    switch (provider) {
      case 'openai':
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "당신은 린코리아의 AI 상담원입니다. 친근하고 전문적으로 답변해주세요."
            },
            { role: "user", content: message }
          ],
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
        // 폴백: OpenAI 사용
        const fallbackCompletion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: message }],
          max_tokens: 1000,
        });
        response = fallbackCompletion.choices[0].message.content;
        providerUsed = 'openai-fallback';
    }

    return NextResponse.json({ 
      success: true, 
      response, 
      provider: providerUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'AI 서비스 일시 오류' },
      { status: 500 }
    );
  }
}
```

### **Step 4: SSE 스트리밍 API 구현** (20분)

```typescript
// app/api/chat/stream/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { message, provider = 'openai' } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system", 
              content: "당신은 린코리아의 AI 상담원입니다."
            },
            { role: "user", content: message }
          ],
          stream: true,
          max_tokens: 1000,
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            const data = JSON.stringify({ content, done: false });
            controller.enqueue(`data: ${data}\n\n`);
          }
        }

        controller.enqueue(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
        controller.close();

      } catch (error) {
        const errorData = JSON.stringify({ error: error.message, done: true });
        controller.enqueue(`data: ${errorData}\n\n`);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### **Step 5: 다중 LLM 채팅 컴포넌트** (40분)

```typescript
// components/MultiLLMChat.tsx
'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  provider?: string;
  timestamp: Date;
}

const providers = [
  { id: 'openai', name: 'OpenAI GPT-4', icon: '🤖', color: 'bg-green-500' },
  { id: 'anthropic', name: 'Claude 3.5', icon: '🧠', color: 'bg-purple-500' },
  { id: 'google', name: 'Gemini Pro', icon: '✨', color: 'bg-blue-500' }
];

export default function MultiLLMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    setMessages([{
      id: '1',
      content: '안녕하세요! 린코리아 AI 상담원입니다. 제품에 대해 궁금한 점이 있으시면 언제든 물어보세요.',
      type: 'system',
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 일반 응답 방식
      const response = await fetch(`/api/chat/${selectedProvider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          type: 'ai',
          provider: data.provider,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendStreamingMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageInput = input;
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageInput, provider: selectedProvider }),
      });

      const reader = response.body?.getReader();
      let aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        type: 'ai',
        provider: selectedProvider,
        timestamp: new Date()
      };

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
                  const lastMessage = newMessages[newMessages.length - 1];
                  lastMessage.content += data.content;
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

  const currentProvider = providers.find(p => p.id === selectedProvider);

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white border rounded-lg shadow-2xl flex flex-col">
      {/* 헤더 - LLM 선택 */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI 어시스턴트
          </h3>
          <div className={`w-3 h-3 rounded-full ${currentProvider?.color}`} />
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`p-2 text-xs rounded transition-all ${
                selectedProvider === provider.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{provider.icon}</div>
                <div className="font-medium">{provider.name.split(' ')[0]}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.type === 'system'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'ai' && <Bot className="w-4 h-4 mt-1 text-blue-500" />}
                {message.type === 'user' && <User className="w-4 h-4 mt-1" />}
                {message.type === 'system' && <Sparkles className="w-4 h-4 mt-1 text-green-600" />}
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.provider && message.type === 'ai' && (
                    <div className="text-xs opacity-70 mt-1">
                      via {message.provider}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {(isLoading || isStreaming) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">AI가 생각하고 있어요...</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="메시지를 입력하세요..."
            disabled={isLoading || isStreaming}
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading || isStreaming || !input.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>현재 사용 중: {currentProvider?.name}</span>
          <button
            onClick={sendStreamingMessage}
            disabled={isStreaming || !input.trim()}
            className="text-blue-500 hover:underline disabled:opacity-50"
          >
            스트리밍 모드
          </button>
        </div>
      </div>
    </div>
  );
}
```

### **Step 6: 메인 페이지에 추가** (5분)

```typescript
// app/page.tsx
import MultiLLMChat from '@/components/MultiLLMChat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          RinKorea AI Platform
        </h1>
        <div className="text-center text-gray-600 mb-8">
          <p>다중 LLM을 활용한 지능형 상담 시스템</p>
          <p className="text-sm mt-2">
            OpenAI GPT-4 • Anthropic Claude • Google Gemini
          </p>
        </div>
      </div>
      
      <MultiLLMChat />
    </main>
  );
}
```

---

## 🚀 **즉시 실행 및 배포**

### **Step 7: 로컬 테스트** (5분)
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000
# 우측 하단 채팅창에서 다중 LLM 테스트
```

### **Step 8: Vercel 배포** (5분)
```bash
# Vercel 로그인 및 배포
vercel login
vercel --prod

# 환경변수 추가
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY  
vercel env add GOOGLE_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# 재배포
vercel --prod
```

---

## 📊 **첫날 달성 목표 체크리스트**

### **오전 (9:00-12:00): 기본 인프라**
- [ ] Next.js 프로젝트 생성
- [ ] 다중 LLM API Routes 구현
- [ ] 환경변수 설정
- [ ] 기본 채팅 API 테스트

### **오후 (1:00-6:00): 채팅 시스템**
- [ ] SSE 스트리밍 API 구현
- [ ] React 채팅 컴포넌트 완성
- [ ] 3개 LLM 제공자 연동
- [ ] Vercel 배포 완료

**🎯 당일 밤 완성 목표**: **ai.rinkorea.com**에서 3개 LLM으로 실시간 채팅 가능

---

## 🎯 **주차별 핵심 목표 (Vercel 최적화)**

### **Week 1 (6/20-6/26): Next.js AI 챗봇**
```
Day 1-2: Next.js + 다중 LLM API Routes
Day 3-4: LangChain.js RAG 시스템  
Day 5-7: SSE 스트리밍 + 최적화
```

### **Week 2 (6/27-7/3): Edge Functions 워크플로우**
```
Day 8-9: JavaScript 워크플로우 상태 머신
Day 10-11: API Routes Q&A 자동화
Day 12-14: Supabase 연동 + 모니터링
```

### **Week 3 (7/4-7/10): 견적 시스템**
```
Day 15-16: AI 견적 생성 API
Day 17-18: 클라이언트 사이드 PDF 생성
Day 19-21: 전체 시스템 통합
```

### **Week 4 (7/11-7/13): 완성 & 배포**
```
Day 22: 브라우저 기반 문서 처리
Day 23: Vercel 최적화 + 성능 테스트
Day 24: 포트폴리오 완성
```

---

## 🆘 **Vercel 트러블슈팅 가이드**

### **API Routes 500 에러**
```bash
# Vercel Function 로그 확인
vercel logs

# 환경변수 확인
vercel env ls
```

### **환경변수 미인식**
```typescript
// 환경변수 검증 코드 추가
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY가 설정되지 않았습니다');
}
```

### **CORS 에러**
```typescript
// API Route에서 CORS 헤더 추가
export async function POST(request: NextRequest) {
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

### **Vercel Function 타임아웃**
```typescript
// 요청 타임아웃 설정
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('timeout')), 55000) // 55초
);

const result = await Promise.race([aiRequest, timeoutPromise]);
```

---

## 💡 **Vercel 성공 팁**

### **1. 개발 효율성 극대화**
- 핫 리로드로 즉시 테스트
- Vercel CLI로 실시간 로그 확인
- 환경변수는 웹 대시보드에서 관리

### **2. 성능 최적화**
- API Routes는 60초 제한 활용
- 클라이언트 사이드 캐싱 적극 활용
- SSE로 사용자 경험 개선

### **3. 포트폴리오 차별화**
- **다중 LLM 지능형 선택**: 작업별 최적 AI 사용
- **Vercel 최신 기술**: Edge Functions + SSE 스트리밍
- **실제 비즈니스 연동**: 운영 중인 rinkorea.com 활용

---

## 🎉 **최종 목표 (7월 13일)**

**완성될 ai.rinkorea.com 사이트:**

✅ **다중 LLM 채팅 시스템** (3개 제공자)  
✅ **Edge Functions 워크플로우** (Q&A 자동화)  
✅ **AI 견적 생성 시스템** (PDF 출력)  
✅ **실시간 성능 모니터링** (Vercel Analytics)  
✅ **완성도 높은 UX/UI** (모바일 최적화)  

---

## 🚀 **즉시 시작 명령어**

```bash
# 6월 20일 오전 9시부터 바로 실행
npx create-next-app@latest rinkorea-ai --typescript --tailwind --app --use-npm
cd rinkorea-ai
npm install openai @anthropic-ai/sdk @google/generative-ai langchain @langchain/openai @langchain/anthropic @supabase/supabase-js
echo "OPENAI_API_KEY=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" > .env.local
npm run dev
```

**첫날 저녁까지**: 3개 LLM으로 실시간 채팅하는 ai.rinkorea.com 완성! 🎯

**MIDAS 포트폴리오**: **Vercel + Next.js 14 + 다중 LLM** 최신 기술 스택 완전 마스터! 🚀

화이팅! 💪✨