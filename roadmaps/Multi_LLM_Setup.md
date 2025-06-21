# 🤖 다중 LLM 설정 가이드

## 🎯 **MIDAS 포트폴리오 핵심 차별화 요소**

**3개 주요 LLM API를 모두 지원하는 유연한 AI 시스템**으로 **최고 수준의 AI/LLM 개발 역량**을 증명합니다!

---

## 🔐 **환경 변수 설정**

### **.env 파일 구성**
```bash
# backend/ai-service/.env

# === 다중 LLM API 키 ===
# OpenAI GPT-4 (가장 범용적)
OPENAI_API_KEY=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

# Anthropic Claude (추론 능력 우수)
ANTHROPIC_API_KEY=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

# Google Gemini (다국어 지원 강력)
GOOGLE_API_KEY=AIzaSyBd3vM8XgfrBWZq3J2upUvIwDsIahdf3lE

# === 기본 설정 ===
DEFAULT_LLM_PROVIDER=openai
FALLBACK_LLM_PROVIDER=anthropic

# === Database & Vector DB 설정 ===
SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
PINECONE_API_KEY=pcsk_4AQeoW_T5yG4j6JcG2kbvQZjTsrBg5HzyYofmLZUixjrCz3gG4s4sBWVN6TZ819BzNzCY8
```

---

## 🔧 **다중 LLM 팩토리 구현**

### **1. LLM 팩토리 클래스**
```python
# backend/ai-service/llm/llm_factory.py
from typing import Optional
from enum import Enum
import os
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

class LLMProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"

class LLMFactory:
    """다중 LLM 제공자를 관리하는 팩토리 클래스"""
    
    def __init__(self):
        self.api_keys = {
            LLMProvider.OPENAI: os.getenv("OPENAI_API_KEY"),
            LLMProvider.ANTHROPIC: os.getenv("ANTHROPIC_API_KEY"),
            LLMProvider.GOOGLE: os.getenv("GOOGLE_API_KEY"),
        }
        
        self.model_configs = {
            LLMProvider.OPENAI: {
                "models": ["gpt-4", "gpt-3.5-turbo"],
                "default": "gpt-4"
            },
            LLMProvider.ANTHROPIC: {
                "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
                "default": "claude-3-5-sonnet-20241022"
            },
            LLMProvider.GOOGLE: {
                "models": ["gemini-pro"],
                "default": "gemini-pro"
            }
        }
    
    def create_llm(self, 
                   provider: LLMProvider,
                   model: Optional[str] = None,
                   temperature: float = 0.7,
                   max_tokens: int = 4000):
        """LLM 인스턴스 생성"""
        
        if not self.api_keys[provider]:
            raise ValueError(f"{provider.value} API 키가 설정되지 않았습니다.")
        
        model = model or self.model_configs[provider]["default"]
        
        if provider == LLMProvider.OPENAI:
            return ChatOpenAI(
                api_key=self.api_keys[provider],
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )
        
        elif provider == LLMProvider.ANTHROPIC:
            return ChatAnthropic(
                api_key=self.api_keys[provider],
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )
        
        elif provider == LLMProvider.GOOGLE:
            return ChatGoogleGenerativeAI(
                google_api_key=self.api_keys[provider],
                model=model,
                temperature=temperature,
                max_output_tokens=max_tokens
            )
    
    def get_available_providers(self):
        """사용 가능한 제공자 목록"""
        return [
            provider for provider, api_key in self.api_keys.items()
            if api_key is not None
        ]
    
    def test_provider(self, provider: LLMProvider):
        """제공자 연결 테스트"""
        try:
            llm = self.create_llm(provider)
            # 간단한 테스트 메시지
            response = llm.invoke("Hello")
            return True, response.content
        except Exception as e:
            return False, str(e)

# 싱글톤 인스턴스
llm_factory = LLMFactory()
```

### **2. 지능형 LLM 매니저**
```python
# backend/ai-service/llm/llm_manager.py
import asyncio
from datetime import datetime
from llm.llm_factory import LLMFactory, LLMProvider, llm_factory
import logging

logger = logging.getLogger(__name__)

class SmartLLMManager:
    """지능형 LLM 선택 및 관리"""
    
    def __init__(self):
        self.factory = llm_factory
        self.performance_stats = {}
        self.fallback_order = [
            LLMProvider.OPENAI,
            LLMProvider.ANTHROPIC,
            LLMProvider.GOOGLE
        ]
    
    async def get_best_llm(self, task_type: str = "general"):
        """작업 유형에 따른 최적 LLM 선택"""
        
        # 작업 유형별 최적 제공자
        task_preferences = {
            "coding": LLMProvider.OPENAI,  # 코딩은 GPT-4가 우수
            "reasoning": LLMProvider.ANTHROPIC,  # 추론은 Claude가 강력
            "multilingual": LLMProvider.GOOGLE,  # 다국어는 Gemini
            "general": LLMProvider.OPENAI  # 기본값
        }
        
        preferred_provider = task_preferences.get(task_type, LLMProvider.OPENAI)
        
        # 성능 기반 폴백 처리
        for provider in [preferred_provider] + self.fallback_order:
            try:
                llm = self.factory.create_llm(provider)
                await self._test_llm_connection(llm, provider)
                
                logger.info(f"선택된 LLM: {provider.value} (작업: {task_type})")
                return llm, provider
                
            except Exception as e:
                logger.warning(f"LLM 실패 {provider.value}: {e}")
                continue
        
        raise Exception("모든 LLM 제공자에 연결할 수 없습니다.")
    
    async def _test_llm_connection(self, llm, provider: LLMProvider):
        """LLM 연결 및 성능 테스트"""
        start_time = datetime.now()
        
        # 간단한 테스트 요청
        response = await llm.ainvoke("안녕하세요")
        
        response_time = (datetime.now() - start_time).total_seconds()
        
        # 성능 통계 업데이트
        if provider.value not in self.performance_stats:
            self.performance_stats[provider.value] = {
                "total_requests": 0,
                "success_count": 0,
                "avg_response_time": 0,
                "last_success": None
            }
        
        stats = self.performance_stats[provider.value]
        stats["total_requests"] += 1
        stats["success_count"] += 1
        stats["last_success"] = datetime.now()
        
        # 평균 응답 시간 업데이트
        if stats["avg_response_time"] == 0:
            stats["avg_response_time"] = response_time
        else:
            stats["avg_response_time"] = (stats["avg_response_time"] + response_time) / 2
    
    def get_performance_report(self):
        """성능 리포트 생성"""
        return {
            "provider_stats": self.performance_stats,
            "recommendation": self._get_best_performer()
        }
    
    def _get_best_performer(self):
        """가장 성능이 좋은 제공자 추천"""
        best_provider = None
        best_score = 0
        
        for provider_name, stats in self.performance_stats.items():
            if stats["total_requests"] == 0:
                continue
            
            success_rate = stats["success_count"] / stats["total_requests"]
            speed_score = 1 / (stats["avg_response_time"] + 0.1)
            
            # 종합 점수 (성공률 70% + 속도 30%)
            total_score = success_rate * 0.7 + (speed_score / 10) * 0.3
            
            if total_score > best_score:
                best_score = total_score
                best_provider = provider_name
        
        return best_provider

# 싱글톤 인스턴스
smart_llm_manager = SmartLLMManager()
```

---

## 🎨 **웹 인터페이스 구현**

### **FastAPI 엔드포인트**
```python
# backend/ai-service/api/multi_llm_endpoints.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from llm.llm_manager import smart_llm_manager
from llm.llm_factory import LLMProvider
from typing import Optional

router = APIRouter(prefix="/api/multi-llm", tags=["Multi-LLM System"])

class ChatRequest(BaseModel):
    message: str
    provider: Optional[str] = None
    task_type: Optional[str] = "general"
    model: Optional[str] = None

@router.get("/providers")
async def get_available_providers():
    """사용 가능한 LLM 제공자 및 모델 목록"""
    return {
        "providers": [
            {
                "value": "openai",
                "label": "OpenAI GPT-4",
                "icon": "🤖",
                "models": ["gpt-4", "gpt-3.5-turbo"],
                "strengths": ["코딩", "범용적 사용", "빠른 응답"]
            },
            {
                "value": "anthropic",
                "label": "Claude 3.5 Sonnet",
                "icon": "🧠",
                "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
                "strengths": ["추론", "분석", "긴 문맥 이해"]
            },
            {
                "value": "google",
                "label": "Google Gemini Pro",
                "icon": "✨",
                "models": ["gemini-pro"],
                "strengths": ["다국어", "창의적 작업", "이미지 분석"]
            }
        ]
    }

@router.post("/chat")
async def chat_with_multi_llm(request: ChatRequest):
    """다중 LLM 지원 채팅"""
    try:
        if request.provider:
            # 특정 제공자 지정
            provider = LLMProvider(request.provider)
            llm = smart_llm_manager.factory.create_llm(
                provider=provider,
                model=request.model
            )
            used_provider = provider
        else:
            # 지능형 선택
            llm, used_provider = await smart_llm_manager.get_best_llm(request.task_type)
        
        # 응답 생성
        response = await llm.ainvoke(request.message)
        
        return {
            "success": True,
            "response": response.content,
            "provider_used": used_provider.value,
            "task_type": request.task_type,
            "model_used": request.model or "default"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"채팅 처리 오류: {str(e)}")

@router.get("/performance")
async def get_performance_stats():
    """LLM 성능 통계"""
    return smart_llm_manager.get_performance_report()

@router.post("/test/{provider}")
async def test_llm_provider(provider: str):
    """특정 LLM 제공자 테스트"""
    try:
        llm_provider = LLMProvider(provider)
        success, result = smart_llm_manager.factory.test_provider(llm_provider)
        
        return {
            "provider": provider,
            "success": success,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"테스트 실패: {str(e)}")
```

---

## 🎨 **React 컴포넌트**

### **LLM 선택기 컴포넌트**
```typescript
// src/components/ai/LLMProviderSelector.tsx
import React, { useState, useEffect } from 'react';

interface Provider {
  value: string;
  label: string;
  icon: string;
  models: string[];
  strengths: string[];
}

interface LLMProviderSelectorProps {
  onProviderChange: (provider: string, model?: string) => void;
  selectedProvider: string;
}

const LLMProviderSelector: React.FC<LLMProviderSelectorProps> = ({
  onProviderChange,
  selectedProvider
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    fetch('/api/multi-llm/providers')
      .then(res => res.json())
      .then(data => setProviders(data.providers));
  }, []);

  const currentProvider = providers.find(p => p.value === selectedProvider);

  const handleProviderChange = (newProvider: string) => {
    const provider = providers.find(p => p.value === newProvider);
    const defaultModel = provider?.models[0] || '';
    setSelectedModel(defaultModel);
    onProviderChange(newProvider, defaultModel);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onProviderChange(selectedProvider, model);
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="font-semibold mb-3">AI 모델 선택</h3>
      
      {/* 제공자 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        {providers.map((provider) => (
          <button
            key={provider.value}
            onClick={() => handleProviderChange(provider.value)}
            className={`p-3 border rounded-lg text-left transition-all ${
              selectedProvider === provider.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{provider.icon}</span>
              <span className="font-medium text-sm">{provider.label}</span>
            </div>
            <div className="text-xs text-gray-600">
              {provider.strengths.slice(0, 2).join(', ')}
            </div>
          </button>
        ))}
      </div>

      {/* 모델 선택 */}
      {currentProvider && currentProvider.models.length > 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">모델 선택</label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            {currentProvider.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 강점 표시 */}
      {currentProvider && (
        <div className="mt-3">
          <div className="text-xs text-gray-600 mb-1">이 모델의 강점:</div>
          <div className="flex flex-wrap gap-1">
            {currentProvider.strengths.map((strength, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-xs rounded"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMProviderSelector;
```

---

## 📊 **성능 모니터링 대시보드**

### **모니터링 컴포넌트**
```typescript
// src/components/ai/LLMPerformanceDashboard.tsx
import React, { useState, useEffect } from 'react';

interface PerformanceStats {
  provider_stats: Record<string, {
    total_requests: number;
    success_count: number;
    avg_response_time: number;
    last_success: string | null;
  }>;
  recommendation: string;
}

const LLMPerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/multi-llm/performance')
        .then(res => res.json())
        .then(data => setStats(data));
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30초마다 업데이트
    
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>로딩 중...</div>;

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">LLM 성능 모니터링</h3>
      
      {/* 추천 제공자 */}
      <div className="mb-4 p-3 bg-green-50 rounded-lg">
        <div className="text-sm font-medium text-green-800">
          현재 최고 성능: {stats.recommendation || '측정 중...'}
        </div>
      </div>

      {/* 제공자별 통계 */}
      <div className="space-y-4">
        {Object.entries(stats.provider_stats).map(([provider, stat]) => {
          const successRate = stat.total_requests > 0 
            ? ((stat.success_count / stat.total_requests) * 100).toFixed(1)
            : '0';

          return (
            <div key={provider} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium capitalize">{provider}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  parseFloat(successRate) > 90 
                    ? 'bg-green-100 text-green-800'
                    : parseFloat(successRate) > 70
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  성공률 {successRate}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">총 요청</div>
                  <div className="font-medium">{stat.total_requests}</div>
                </div>
                <div>
                  <div className="text-gray-600">평균 응답시간</div>
                  <div className="font-medium">{stat.avg_response_time.toFixed(2)}초</div>
                </div>
                <div>
                  <div className="text-gray-600">마지막 성공</div>
                  <div className="font-medium">
                    {stat.last_success 
                      ? new Date(stat.last_success).toLocaleTimeString()
                      : '없음'
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LLMPerformanceDashboard;
```

---

## 🚀 **Quick Setup 가이드**

### **1. 패키지 설치**
```bash
# 다중 LLM 패키지 설치
pip install langchain-anthropic langchain-google-genai
pip install anthropic google-generativeai
```

### **2. 즉시 테스트 스크립트**
```python
# test_multi_llm.py
import asyncio
from llm.llm_factory import LLMFactory, LLMProvider

async def test_all_providers():
    factory = LLMFactory()
    test_message = "안녕하세요! 린코리아 AI 테스트입니다."
    
    for provider in [LLMProvider.OPENAI, LLMProvider.ANTHROPIC, LLMProvider.GOOGLE]:
        try:
            print(f"\n🧪 {provider.value} 테스트 중...")
            llm = factory.create_llm(provider)
            response = await llm.ainvoke(test_message)
            print(f"✅ {provider.value}: {response.content[:100]}...")
        except Exception as e:
            print(f"❌ {provider.value}: {e}")

if __name__ == "__main__":
    asyncio.run(test_all_providers())
```

### **3. 실행 명령어**
```bash
# 백엔드 실행
cd backend/ai-service
python main.py

# 테스트 실행
python test_multi_llm.py
```

---

## 🎯 **MIDAS 포트폴리오 핵심 가치**

이 다중 LLM 시스템으로 증명할 수 있는 것들:

### **✅ 최신 AI 기술 마스터**
- OpenAI GPT-4, Anthropic Claude, Google Gemini 모든 API 활용
- 각 모델의 강점을 이해하고 적절히 활용

### **✅ 시스템 설계 능력**  
- 확장 가능한 팩토리 패턴 적용
- 지능형 폴백 시스템 구현
- 성능 모니터링 및 최적화

### **✅ 실무적 접근**
- 비용 효율성 고려 (작업별 최적 모델 선택)
- 안정성 확보 (다중 폴백 지원)
- 사용자 경험 최적화

### **✅ 확장성 및 유지보수성**
- 새로운 LLM 제공자 쉽게 추가 가능
- 모듈화된 구조로 유지보수 용이
- 실시간 성능 모니터링

**결과**: **MIDAS에서 원하는 모든 AI/LLM 기술 역량을 완벽하게 증명** 🚀

이제 **3개의 최신 LLM을 모두 활용하는 시스템**으로 **최고 수준의 포트폴리오**를 완성할 수 있습니다! 💪 