# 🚀 KAP 우선 즉시 시작 가이드

## 🎯 목표: 첫날부터 금융 AI 시스템 구축

**한국자산평가(KAP) 금융공학연구소** 포지션을 우선 어필하기 위해 **금융 AI 분석 시스템**부터 즉시 구현합니다.

**🔥 Week 1 목표**: KAP 요구사항 100% 충족하는 금융 AI 완성

---

## ⚡ 20분 초기 설정

### 1단계: Next.js 프로젝트 생성

```bash
# Next.js 14 + TypeScript 프로젝트 생성
npx create-next-app@latest ai-rinkorea --typescript --tailwind --eslint --app --use-npm

cd ai-rinkorea

# KAP 금융 AI 특화 패키지 설치
npm install @tensorflow/tfjs recharts openai @supabase/supabase-js lucide-react
npm install simple-statistics ml-matrix
```

### 2단계: 환경변수 설정

```env
# .env.local
OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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
GOOGLE_AI_API_KEY=AIzaSyBd3vM8XgfrBWZq3J2upUvIwDsIahdf3lE
SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
PINECONE_API_KEY=pcsk_4AQeoW_T5yG4j6JcG2kbvQZjTsrBg5HzyYofmLZUixjrCz3gG4s4sBWVN6TZ819BzNzCY8
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3단계: 금융 AI 디렉토리 구조

```bash
mkdir -p app/api/financial/{data,forecast,report}
mkdir -p components/financial
mkdir -p lib/financial
mkdir -p types
```

---

## 📊 금융 데이터 스키마 구축

### Supabase SQL Editor에서 실행:

```sql
-- 금융 지표 분석 테이블
CREATE TABLE IF NOT EXISTS financial_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  revenue DECIMAL(15,2),
  cost DECIMAL(15,2),
  profit DECIMAL(15,2),
  profit_margin DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 리스크 분석 테이블  
CREATE TABLE IF NOT EXISTS risk_analysis (
  id SERIAL PRIMARY KEY,
  analysis_date DATE NOT NULL,
  var_95 DECIMAL(15,2),
  cvar_95 DECIMAL(15,2),
  volatility DECIMAL(5,4),
  sharpe_ratio DECIMAL(5,4),
  max_drawdown DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 재무 보고서 저장
CREATE TABLE IF NOT EXISTS financial_reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  data_snapshot JSONB,
  generated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 첫 번째 금융 AI API

### app/api/financial/data/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: revenueData, error } = await supabase
      .from('revenue')
      .select('*')
      .order('period', { ascending: true });

    if (error) throw error;

    const metrics = calculateFinancialMetrics(revenueData);
    
    return NextResponse.json({
      success: true,
      data: revenueData,
      analysis: {
        avgGrowthRate: calculateAvgGrowthRate(revenueData),
        volatility: calculateVolatility(revenueData),
        totalPeriods: revenueData.length
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function calculateAvgGrowthRate(data: any[]) {
  const growthRates = data.slice(1).map((item, index) => {
    const prevRevenue = data[index].total_revenue;
    return ((item.total_revenue - prevRevenue) / prevRevenue) * 100;
  });
  
  return growthRates.length > 0 
    ? Number((growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length).toFixed(2))
    : 0;
}

function calculateVolatility(data: any[]) {
  const returns = data.slice(1).map((item, index) => {
    const prevRevenue = data[index].total_revenue;
    return (item.total_revenue - prevRevenue) / prevRevenue;
  });
  
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  
  return Number((Math.sqrt(variance) * 100).toFixed(2));
}

function calculateFinancialMetrics(data: any[]) {
  return data.map((item, index) => {
    const prevItem = data[index - 1];
    const growthRate = prevItem 
      ? ((item.total_revenue - prevItem.total_revenue) / prevItem.total_revenue) * 100
      : 0;
    
    return {
      ...item,
      growth_rate: Number(growthRate.toFixed(2)),
      profit_margin: Number(((item.profit / item.total_revenue) * 100).toFixed(2))
    };
  });
}
```

---

## 📈 기본 금융 대시보드

### components/financial/FinancialDashboard.tsx

```typescript
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

export default function FinancialDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const response = await fetch('/api/financial/data');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💹 KAP 금융 AI 분석 대시보드
          </h1>
          <p className="text-gray-600">
            한국자산평가 금융공학연구소 특화 • 실제 매출 데이터 기반 분석
          </p>
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 성장률</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.analysis.avgGrowthRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">변동성</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.analysis.volatility}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">데이터 기간</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.analysis.totalPeriods}개월
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* 매출 차트 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            📊 매출 추이 분석 (기본 데이터)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total_revenue" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="총 매출"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="순이익"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 다음 단계 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 다음 구현 단계 (오후 진행)
          </h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>TensorFlow.js LSTM 시계열 예측 모델 구현</li>
            <li>GPT-4 기반 재무 보고서 자동 생성</li>
            <li>VaR, CVaR 리스크 평가 모델</li>
            <li>포트폴리오 최적화 알고리즘</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### app/page.tsx

```typescript
import FinancialDashboard from '@/components/financial/FinancialDashboard';

export default function Home() {
  return (
    <main>
      <FinancialDashboard />
    </main>
  );
}
```

---

## ✅ 첫날 완료 체크리스트

### 🔥 오전 완료 목표 (12:00까지)
- [ ] Next.js 프로젝트 생성 완료
- [ ] 환경변수 설정 (3개 LLM + Supabase)  
- [ ] Supabase 금융 데이터 스키마 확장
- [ ] 첫 번째 금융 API Routes 구현
- [ ] 기본 금융 대시보드 화면 구현
- [ ] 실제 매출 데이터 연동 확인

### 🚀 오후 진행 목표 (12:00-18:00)
- [ ] TensorFlow.js LSTM 모델 기본 구조
- [ ] GPT-4 재무 분석 API Routes 구현  
- [ ] 리스크 계산 함수 (VaR, CVaR) 구현
- [ ] 금융 지표 시각화 컴포넌트 확장

---

## 🎯 성공 기준

**첫날 완료 시 확인할 수 있어야 할 것:**

1. ✅ `http://localhost:3000` → 금융 대시보드 접속
2. ✅ `/api/financial/data` → JSON 응답으로 매출 데이터 조회  
3. ✅ 차트에서 실제 린코리아 매출 데이터 시각화
4. ✅ 평균 성장률, 변동성 등 기본 금융 지표 계산

**👍 성공하면 → Week 1 Day 2부터 본격적인 LSTM 예측 모델 구현**  
**⚠️ 문제 발생 시 → `Financial_AI_Guide.md` 상세 구현 가이드 참조**

---

## 💡 KAP 어필 포인트

**첫날부터 증명되는 것:**
- 🔥 **실제 금융 데이터 활용** (토이 프로젝트 아님)
- 🔥 **기계학습 준비 완료** (TensorFlow.js 설정)  
- 🔥 **LLM 금융 분석** (GPT-4 API 연동)
- 🔥 **수학적 지표 계산** (변동성, 성장률 등)
- 🔥 **시각화 완성도** (전문적인 대시보드)

**KAP 금융공학연구소가 요구하는 "금융 데이터 + 기계학습 + LLM" 역량을 첫날부터 바로 보여줍니다!** 💪💹