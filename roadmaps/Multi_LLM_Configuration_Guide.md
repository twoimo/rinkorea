# 🤖 다중 LLM API 설정 가이드

## 🔐 **환경 변수 설정**

### **환경 변수 파일 (.env)**
```bash
# backend/ai-service/.env

# === LLM API 키 설정 ===
# OpenAI GPT-4/3.5-turbo
OPENAI_API_KEY=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

# Anthropic Claude (Claude-3.5-sonnet, Claude-3-haiku)
ANTHROPIC_API_KEY=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

# Google Gemini Pro 2.5
GOOGLE_API_KEY=AIzaSyBd3vM8XgfrBWZq3J2upUvIwDsIahdf3lE

# === 기본 모델 설정 ===
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4
FALLBACK_LLM_PROVIDER=anthropic
FALLBACK_LLM_MODEL=claude-3-5-sonnet-20241022

# === Vector DB 설정 ===
PINECONE_API_KEY=pcsk_4AQeoW_T5yG4j6JcG2kbvQZjTsrBg5HzyYofmLZUixjrCz3gG4s4sBWVN6TZ819BzNzCY8

# === Database 설정 ===
SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU

# === 프론트엔드용 (Next.js) ===
NEXT_PUBLIC_SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

## 🔧 **다중 LLM 관리자 구현**

### **LLM Factory 클래스**

```python
# backend/ai-service/llm/llm_factory.py
from typing import Optional
from enum import Enum
import os
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

class LLMProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"

class LLMFactory:
    def __init__(self):
        self.api_keys = {
            LLMProvider.OPENAI: os.getenv("OPENAI_API_KEY"),
            LLMProvider.ANTHROPIC: os.getenv("ANTHROPIC_API_KEY"),
            LLMProvider.GOOGLE: os.getenv("GOOGLE_API_KEY"),
        }
    
    def create_llm(self, provider: LLMProvider, model: str = None, **kwargs):
        """LLM 인스턴스 생성"""
        if provider == LLMProvider.OPENAI:
            return ChatOpenAI(
                api_key=self.api_keys[provider],
                model=model or "gpt-4",
                **kwargs
            )
        elif provider == LLMProvider.ANTHROPIC:
            return ChatAnthropic(
                api_key=self.api_keys[provider],
                model=model or "claude-3-5-sonnet-20241022",
                **kwargs
            )
        elif provider == LLMProvider.GOOGLE:
            return ChatGoogleGenerativeAI(
                google_api_key=self.api_keys[provider],
                model=model or "gemini-pro",
                **kwargs
            )
```

### **다중 LLM 챗봇**

```python
# backend/ai-service/ai/multi_llm_chatbot.py
from llm.llm_factory import LLMFactory, LLMProvider

class MultiLLMChatBot:
    def __init__(self):
        self.factory = LLMFactory()
        self.default_provider = LLMProvider.OPENAI
    
    async def get_response(self, message: str, provider: str = None):
        """선택된 LLM으로 응답 생성"""
        try:
            # 제공자 선택
            selected_provider = LLMProvider(provider) if provider else self.default_provider
            
            # LLM 생성
            llm = self.factory.create_llm(selected_provider)
            
            # 응답 생성
            response = await llm.ainvoke(message)
            
            return {
                "response": response.content,
                "provider_used": selected_provider.value,
                "success": True
            }
        except Exception as e:
            # 폴백 처리
            return await self._fallback_response(message, str(e))
    
    async def _fallback_response(self, message: str, error: str):
        """폴백 LLM으로 응답"""
        for provider in [LLMProvider.ANTHROPIC, LLMProvider.GOOGLE, LLMProvider.OPENAI]:
            try:
                llm = self.factory.create_llm(provider)
                response = await llm.ainvoke(message)
                return {
                    "response": response.content,
                    "provider_used": provider.value,
                    "fallback": True,
                    "original_error": error
                }
            except:
                continue
        
        return {
            "response": "죄송합니다. 일시적인 오류가 발생했습니다.",
            "success": False,
            "error": error
        }
```

---

## 🎨 **프론트엔드 LLM 선택 UI**

```typescript
// src/components/ai/LLMSelector.tsx
import React, { useState } from 'react';

interface LLMSelectorProps {
  onProviderChange: (provider: string) => void;
}

const LLMSelector: React.FC<LLMSelectorProps> = ({ onProviderChange }) => {
  const [selectedProvider, setSelectedProvider] = useState('openai');

  const providers = [
    { value: 'openai', label: 'OpenAI GPT-4', icon: '🤖' },
    { value: 'anthropic', label: 'Claude 3.5 Sonnet', icon: '🧠' },
    { value: 'google', label: 'Gemini Pro', icon: '✨' }
  ];

  const handleChange = (provider: string) => {
    setSelectedProvider(provider);
    onProviderChange(provider);
  };

  return (
    <div className="flex gap-2 p-2 bg-gray-100 rounded-lg">
      {providers.map((provider) => (
        <button
          key={provider.value}
          onClick={() => handleChange(provider.value)}
          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
            selectedProvider === provider.value
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>{provider.icon}</span>
          <span className="text-sm font-medium">{provider.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LLMSelector;
```

---

## 📊 **API 엔드포인트**

```python
# backend/ai-service/api/llm_endpoints.py
from fastapi import APIRouter, HTTPException
from ai.multi_llm_chatbot import MultiLLMChatBot

router = APIRouter(prefix="/api/llm", tags=["Multi-LLM"])
chatbot = MultiLLMChatBot()

@router.get("/providers")
async def get_available_providers():
    """사용 가능한 LLM 제공자 목록"""
    return {
        "providers": [
            {"value": "openai", "label": "OpenAI GPT-4"},
            {"value": "anthropic", "label": "Claude 3.5 Sonnet"},
            {"value": "google", "label": "Google Gemini Pro"}
        ]
    }

@router.post("/chat")
async def chat_with_llm(message: str, provider: str = "openai"):
    """선택된 LLM과 채팅"""
    try:
        result = await chatbot.get_response(message, provider)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🔄 **업데이트된 main.py**

```python
# backend/ai-service/main.py 업데이트
from api.llm_endpoints import router as llm_router

# 라우터 추가
app.include_router(llm_router)

@app.websocket("/ws/chat/{provider}")
async def websocket_chat(websocket: WebSocket, provider: str = "openai"):
    await websocket.accept()
    chatbot = MultiLLMChatBot()
    
    try:
        while True:
            message = await websocket.receive_text()
            result = await chatbot.get_response(message, provider)
            await websocket.send_json(result)
    except WebSocketDisconnect:
        pass
```

---

## 🛡️ **보안 및 사용량 관리**

### **API 키 보안**
```bash
# .env 파일을 .gitignore에 추가
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
```

### **사용량 모니터링**
```python
# backend/ai-service/monitoring/usage_tracker.py
class LLMUsageTracker:
    def __init__(self):
        self.usage_stats = {}
    
    def track_request(self, provider: str, tokens: int = 0):
        """요청 추적"""
        if provider not in self.usage_stats:
            self.usage_stats[provider] = {"requests": 0, "tokens": 0}
        
        self.usage_stats[provider]["requests"] += 1
        self.usage_stats[provider]["tokens"] += tokens
    
    def get_stats(self):
        """사용 통계 반환"""
        return self.usage_stats
```

---

## 🚀 **Quick Start 업데이트**

### **패키지 설치**
```bash
# 추가 패키지 설치
pip install langchain-anthropic langchain-google-genai
```

### **즉시 테스트**
```python
# 테스트 스크립트
from llm.llm_factory import LLMFactory, LLMProvider

async def test_all_llms():
    factory = LLMFactory()
    
    for provider in [LLMProvider.OPENAI, LLMProvider.ANTHROPIC, LLMProvider.GOOGLE]:
        try:
            llm = factory.create_llm(provider)
            response = await llm.ainvoke("안녕하세요!")
            print(f"✅ {provider.value}: {response.content}")
        except Exception as e:
            print(f"❌ {provider.value}: {e}")

# 실행
import asyncio
asyncio.run(test_all_llms())
```

---

## 🎯 **MiDS 포트폴리오 강점**

이 다중 LLM 시스템으로 보여줄 수 있는 것들:

✅ **최신 AI 기술 스택 활용**
- OpenAI GPT-4, Anthropic Claude, Google Gemini

✅ **안정성과 확장성**
- 자동 폴백 시스템
- 성능 모니터링

✅ **실무적 접근**
- 비용 최적화
- 사용량 추적

✅ **유연한 아키텍처**
- 새로운 LLM 쉽게 추가 가능
- 제공자별 특성 활용

이제 **3개의 주요 LLM을 모두 활용하는 시스템**으로 MiDS에서 최고 수준의 AI/LLM 개발 역량을 증명할 수 있습니다! 🚀 