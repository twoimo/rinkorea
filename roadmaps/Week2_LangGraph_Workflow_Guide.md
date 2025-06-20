# Week 2: LangGraph Q&A 자동화 워크플로우

## 🎯 **목표**
**LangGraph 상태 머신**을 활용한 지능형 Q&A 자동화 시스템 구축

---

## 📋 **Day 8-9: Q&A 시스템 분석**

### **1. 기존 Q&A 데이터 분석**

```python
# backend/ai-service/analysis/qna_analyzer.py
import pandas as pd
import asyncio
from collections import Counter
from database.supabase_client import SupabaseClient

class QnAAnalyzer:
    def __init__(self):
        self.supabase = SupabaseClient()
        
    async def analyze_existing_qna(self):
        """기존 Q&A 데이터 분석"""
        # 기존 Q&A 데이터 로드
        inquiries = await self.supabase.fetch_inquiries()
        
        analysis_result = {
            "total_count": len(inquiries),
            "status_distribution": Counter([q["status"] for q in inquiries]),
            "category_analysis": self._categorize_inquiries(inquiries),
            "response_time_analysis": self._analyze_response_times(inquiries),
            "common_keywords": self._extract_keywords(inquiries)
        }
        
        return analysis_result
    
    def _categorize_inquiries(self, inquiries):
        """문의 카테고리 자동 분류"""
        categories = {
            "제품_문의": ["제품", "린코트", "린하드", "방수", "코팅"],
            "기술_지원": ["시공", "사용법", "적용", "방법", "기술"],
            "견적_요청": ["견적", "가격", "비용", "구매", "주문"],
            "일반_문의": ["문의", "연락", "위치", "회사"]
        }
        
        categorized = {cat: 0 for cat in categories.keys()}
        
        for inquiry in inquiries:
            content = inquiry["title"] + " " + inquiry["content"]
            for category, keywords in categories.items():
                if any(keyword in content for keyword in keywords):
                    categorized[category] += 1
                    break
        
        return categorized
    
    def _extract_keywords(self, inquiries):
        """주요 키워드 추출"""
        from collections import Counter
        import re
        
        all_text = " ".join([
            inquiry["title"] + " " + inquiry["content"] 
            for inquiry in inquiries
        ])
        
        # 한글 키워드 추출 (2글자 이상)
        korean_words = re.findall(r'[가-힣]{2,}', all_text)
        return Counter(korean_words).most_common(20)
```

### **2. 자동 답변 템플릿 생성**

```python
# backend/ai-service/templates/response_templates.py
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os

class ResponseTemplateGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.3,
            model="gpt-4",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        self.template_categories = {
            "제품_문의": {
                "system_prompt": "린코리아 제품 전문가로서 답변합니다.",
                "context_needed": ["product_info", "specifications"],
                "tone": "전문적이고 상세한"
            },
            "기술_지원": {
                "system_prompt": "기술 지원 전문가로서 실용적인 조언을 제공합니다.",
                "context_needed": ["technical_docs", "installation_guide"],
                "tone": "친절하고 실용적인"
            },
            "견적_요청": {
                "system_prompt": "영업 담당자로서 견적 정보를 안내합니다.",
                "context_needed": ["pricing_info", "contact_info"],
                "tone": "비즈니스 친화적인"
            }
        }

    async def generate_response_template(self, category: str, inquiry_text: str):
        """카테고리별 맞춤 답변 템플릿 생성"""
        category_config = self.template_categories.get(category, self.template_categories["제품_문의"])
        
        prompt = ChatPromptTemplate.from_template("""
        당신은 {system_prompt}
        
        다음 고객 문의에 대한 {tone} 답변 템플릿을 생성해주세요:
        
        문의 내용: {inquiry}
        
        답변 템플릿은 다음 구조를 따라주세요:
        1. 인사말
        2. 문의 내용 확인
        3. 구체적인 답변/정보 제공
        4. 추가 지원 안내
        5. 마무리 인사
        
        템플릿:
        """)
        
        response = await self.llm.ainvoke({
            "system_prompt": category_config["system_prompt"],
            "tone": category_config["tone"],
            "inquiry": inquiry_text
        })
        
        return response.content
```

---

## 📋 **Day 10-11: LangGraph 워크플로우**

### **1. 상태 정의 및 노드 구성**

```python
# backend/ai-service/workflows/qna_workflow.py
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from typing import TypedDict, Annotated, List
import operator
import os

class QnAState(TypedDict):
    inquiry_id: str
    inquiry_text: str
    user_info: dict
    category: str
    urgency_level: str
    context_documents: List[str]
    generated_response: str
    requires_human_review: bool
    confidence_score: float
    next_action: str

class QnAWorkflow:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.7,
            model="gpt-4",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # 워크플로우 그래프 구성
        self.workflow = StateGraph(QnAState)
        self._build_workflow()

    def _build_workflow(self):
        """워크플로우 그래프 구축"""
        # 노드 추가
        self.workflow.add_node("classify_inquiry", self.classify_inquiry)
        self.workflow.add_node("assess_urgency", self.assess_urgency)
        self.workflow.add_node("retrieve_context", self.retrieve_context)
        self.workflow.add_node("generate_response", self.generate_response)
        self.workflow.add_node("review_response", self.review_response)
        self.workflow.add_node("send_response", self.send_response)
        self.workflow.add_node("escalate_to_human", self.escalate_to_human)
        
        # 시작점 설정
        self.workflow.set_entry_point("classify_inquiry")
        
        # 엣지 정의
        self.workflow.add_edge("classify_inquiry", "assess_urgency")
        self.workflow.add_edge("assess_urgency", "retrieve_context")
        self.workflow.add_edge("retrieve_context", "generate_response")
        self.workflow.add_edge("generate_response", "review_response")
        
        # 조건부 엣지 - 응답 품질에 따른 분기
        self.workflow.add_conditional_edges(
            "review_response",
            self.should_escalate_to_human,
            {
                "send_response": "send_response",
                "escalate_to_human": "escalate_to_human"
            }
        )
        
        self.workflow.add_edge("send_response", END)
        self.workflow.add_edge("escalate_to_human", END)

    async def classify_inquiry(self, state: QnAState) -> QnAState:
        """문의 카테고리 분류"""
        classification_prompt = ChatPromptTemplate.from_template("""
        다음 고객 문의를 카테고리로 분류해주세요:
        
        문의 내용: {inquiry_text}
        
        카테고리 옵션:
        - 제품_문의: 제품 정보, 사양, 특징 관련
        - 기술_지원: 시공, 사용법, 기술적 도움
        - 견적_요청: 가격, 구매, 주문 관련
        - 일반_문의: 회사 정보, 연락처 등
        - 불만_처리: 문제 신고, 불만 사항
        
        분류 결과만 반환하세요 (예: 제품_문의):
        """)
        
        result = await self.llm.ainvoke(
            classification_prompt.format(inquiry_text=state["inquiry_text"])
        )
        
        state["category"] = result.content.strip()
        return state

    async def assess_urgency(self, state: QnAState) -> QnAState:
        """긴급도 평가"""
        urgency_prompt = ChatPromptTemplate.from_template("""
        다음 문의의 긴급도를 평가해주세요:
        
        문의 내용: {inquiry_text}
        카테고리: {category}
        
        긴급도 레벨:
        - 높음: 즉시 대응 필요 (불만, 긴급 기술 지원)
        - 보통: 24시간 내 대응 (일반 기술 문의, 견적)
        - 낮음: 48시간 내 대응 (일반 정보 문의)
        
        긴급도만 반환하세요 (예: 보통):
        """)
        
        result = await self.llm.ainvoke(
            urgency_prompt.format(
                inquiry_text=state["inquiry_text"],
                category=state["category"]
            )
        )
        
        state["urgency_level"] = result.content.strip()
        return state

    async def retrieve_context(self, state: QnAState) -> QnAState:
        """관련 컨텍스트 문서 검색"""
        from database.vector_store import VectorStore
        
        vector_store = VectorStore()
        vector_store.initialize_store()
        
        # 카테고리에 따른 검색 쿼리 최적화
        search_query = self._optimize_search_query(state["inquiry_text"], state["category"])
        
        # 관련 문서 검색
        relevant_docs = vector_store.similarity_search(search_query, k=6)
        state["context_documents"] = [doc.page_content for doc in relevant_docs]
        
        return state

    async def generate_response(self, state: QnAState) -> QnAState:
        """자동 응답 생성"""
        response_prompt = ChatPromptTemplate.from_template("""
        당신은 린코리아의 전문 고객 상담원입니다.
        
        문의 정보:
        - 카테고리: {category}
        - 긴급도: {urgency_level}
        - 문의 내용: {inquiry_text}
        
        참고 정보:
        {context}
        
        다음 지침에 따라 응답을 작성해주세요:
        1. 친근하고 전문적인 톤 유지
        2. 구체적이고 실용적인 정보 제공
        3. 추가 문의나 상담 채널 안내
        4. 회사의 전문성과 신뢰성 강조
        
        응답:
        """)
        
        context = "\n\n".join(state["context_documents"])
        
        result = await self.llm.ainvoke(
            response_prompt.format(
                category=state["category"],
                urgency_level=state["urgency_level"],
                inquiry_text=state["inquiry_text"],
                context=context
            )
        )
        
        state["generated_response"] = result.content
        return state

    async def review_response(self, state: QnAState) -> QnAState:
        """응답 품질 검토"""
        review_prompt = ChatPromptTemplate.from_template("""
        다음 고객 응답의 품질을 0-100점으로 평가해주세요:
        
        원래 문의: {inquiry_text}
        생성된 응답: {response}
        
        평가 기준:
        - 문의 내용과의 관련성 (30점)
        - 정보의 정확성과 완성도 (30점)
        - 응답의 명확성과 이해도 (20점)
        - 고객 서비스 품질 (20점)
        
        점수만 숫자로 반환하세요 (예: 85):
        """)
        
        result = await self.llm.ainvoke(
            review_prompt.format(
                inquiry_text=state["inquiry_text"],
                response=state["generated_response"]
            )
        )
        
        try:
            confidence_score = float(result.content.strip())
            state["confidence_score"] = confidence_score
            state["requires_human_review"] = confidence_score < 75
        except:
            state["confidence_score"] = 0
            state["requires_human_review"] = True
        
        return state

    def should_escalate_to_human(self, state: QnAState) -> str:
        """인간 개입 필요성 판단"""
        if state["requires_human_review"] or state["urgency_level"] == "높음":
            return "escalate_to_human"
        return "send_response"

    async def send_response(self, state: QnAState) -> QnAState:
        """자동 응답 발송"""
        # 실제 응답 발송 로직 (이메일, 알림 등)
        state["next_action"] = "response_sent"
        return state

    async def escalate_to_human(self, state: QnAState) -> QnAState:
        """인간 전문가에게 에스컬레이션"""
        state["next_action"] = "human_review_required"
        return state

    def _optimize_search_query(self, inquiry_text: str, category: str) -> str:
        """카테고리별 검색 쿼리 최적화"""
        category_keywords = {
            "제품_문의": "제품 사양 특징",
            "기술_지원": "시공 설치 사용법",
            "견적_요청": "가격 견적 구매",
            "일반_문의": "회사 정보 연락처"
        }
        
        additional_keywords = category_keywords.get(category, "")
        return f"{inquiry_text} {additional_keywords}"

    def compile_workflow(self):
        """워크플로우 컴파일"""
        return self.workflow.compile()
```

### **2. 워크플로우 실행기**

```python
# backend/ai-service/workflows/workflow_executor.py
import asyncio
from typing import Dict, Any
from workflows.qna_workflow import QnAWorkflow, QnAState

class WorkflowExecutor:
    def __init__(self):
        self.qna_workflow = QnAWorkflow()
        self.compiled_workflow = self.qna_workflow.compile_workflow()

    async def process_inquiry(self, inquiry_data: Dict[str, Any]) -> Dict[str, Any]:
        """문의 처리 실행"""
        
        # 초기 상태 설정
        initial_state: QnAState = {
            "inquiry_id": inquiry_data["id"],
            "inquiry_text": f"{inquiry_data['title']} {inquiry_data['content']}",
            "user_info": {
                "name": inquiry_data["name"],
                "email": inquiry_data["email"],
                "phone": inquiry_data.get("phone")
            },
            "category": "",
            "urgency_level": "",
            "context_documents": [],
            "generated_response": "",
            "requires_human_review": False,
            "confidence_score": 0.0,
            "next_action": ""
        }

        try:
            # 워크플로우 실행
            result = await self.compiled_workflow.ainvoke(initial_state)
            
            return {
                "success": True,
                "inquiry_id": result["inquiry_id"],
                "category": result["category"],
                "urgency_level": result["urgency_level"],
                "generated_response": result["generated_response"],
                "confidence_score": result["confidence_score"],
                "requires_human_review": result["requires_human_review"],
                "next_action": result["next_action"]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "inquiry_id": inquiry_data["id"]
            }

    async def batch_process_inquiries(self, inquiries: list) -> list:
        """다중 문의 배치 처리"""
        tasks = [self.process_inquiry(inquiry) for inquiry in inquiries]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        processed_results = []
        for result in results:
            if isinstance(result, Exception):
                processed_results.append({
                    "success": False,
                    "error": str(result)
                })
            else:
                processed_results.append(result)
        
        return processed_results
```

---

## 📋 **Day 12-14: 통합 & 최적화**

### **1. Q&A 시스템 통합**

```python
# backend/ai-service/api/qna_endpoints.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from workflows.workflow_executor import WorkflowExecutor
from database.supabase_client import SupabaseClient
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/qna", tags=["QnA Automation"])

class InquiryProcessRequest(BaseModel):
    inquiry_id: str
    auto_process: bool = True

class BatchProcessRequest(BaseModel):
    inquiry_ids: list[str]
    auto_process: bool = True

workflow_executor = WorkflowExecutor()
supabase_client = SupabaseClient()

@router.post("/process/{inquiry_id}")
async def process_single_inquiry(
    inquiry_id: str,
    background_tasks: BackgroundTasks
):
    """단일 문의 자동 처리"""
    try:
        # 문의 데이터 조회
        inquiry_data = await supabase_client.get_inquiry(inquiry_id)
        if not inquiry_data:
            raise HTTPException(status_code=404, detail="문의를 찾을 수 없습니다")
        
        # 워크플로우 실행
        result = await workflow_executor.process_inquiry(inquiry_data)
        
        # 결과 저장
        if result["success"]:
            background_tasks.add_task(
                save_workflow_result,
                inquiry_id,
                result
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-process")
async def batch_process_inquiries(
    request: BatchProcessRequest,
    background_tasks: BackgroundTasks
):
    """다중 문의 배치 처리"""
    try:
        # 문의 데이터 조회
        inquiries = []
        for inquiry_id in request.inquiry_ids:
            inquiry_data = await supabase_client.get_inquiry(inquiry_id)
            if inquiry_data:
                inquiries.append(inquiry_data)
        
        # 배치 처리 실행
        results = await workflow_executor.batch_process_inquiries(inquiries)
        
        # 결과 저장
        background_tasks.add_task(
            save_batch_results,
            results
        )
        
        return {
            "processed_count": len(results),
            "success_count": sum(1 for r in results if r.get("success")),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def save_workflow_result(inquiry_id: str, result: dict):
    """워크플로우 결과 저장"""
    try:
        await supabase_client.update_inquiry_with_ai_response(
            inquiry_id,
            {
                "ai_category": result["category"],
                "ai_urgency": result["urgency_level"],
                "ai_response": result["generated_response"],
                "ai_confidence": result["confidence_score"],
                "requires_human_review": result["requires_human_review"],
                "processed_at": "now()"
            }
        )
    except Exception as e:
        print(f"결과 저장 오류: {e}")
```

### **2. 성능 모니터링 시스템**

```python
# backend/ai-service/monitoring/performance_monitor.py
from datetime import datetime, timedelta
import asyncio
from typing import Dict, List
import logging

class PerformanceMonitor:
    def __init__(self):
        self.metrics = {
            "total_processed": 0,
            "auto_resolved": 0,
            "escalated_to_human": 0,
            "average_confidence": 0.0,
            "processing_time": [],
            "category_distribution": {},
            "hourly_volume": {}
        }
        
    async def log_workflow_execution(self, 
                                   start_time: datetime,
                                   end_time: datetime,
                                   result: Dict):
        """워크플로우 실행 로그"""
        processing_time = (end_time - start_time).total_seconds()
        
        self.metrics["total_processed"] += 1
        self.metrics["processing_time"].append(processing_time)
        
        if result.get("requires_human_review"):
            self.metrics["escalated_to_human"] += 1
        else:
            self.metrics["auto_resolved"] += 1
            
        # 카테고리별 분포 업데이트
        category = result.get("category", "unknown")
        self.metrics["category_distribution"][category] = (
            self.metrics["category_distribution"].get(category, 0) + 1
        )
        
        # 시간별 처리량 업데이트
        hour_key = start_time.strftime("%Y-%m-%d-%H")
        self.metrics["hourly_volume"][hour_key] = (
            self.metrics["hourly_volume"].get(hour_key, 0) + 1
        )
        
        # 평균 신뢰도 업데이트
        confidence = result.get("confidence_score", 0)
        total_confidence = (self.metrics["average_confidence"] * 
                          (self.metrics["total_processed"] - 1) + confidence)
        self.metrics["average_confidence"] = total_confidence / self.metrics["total_processed"]

    def get_performance_report(self) -> Dict:
        """성능 리포트 생성"""
        if not self.metrics["processing_time"]:
            return {"error": "처리된 데이터가 없습니다"}
            
        avg_processing_time = sum(self.metrics["processing_time"]) / len(self.metrics["processing_time"])
        auto_resolution_rate = (self.metrics["auto_resolved"] / 
                              self.metrics["total_processed"] * 100) if self.metrics["total_processed"] > 0 else 0
        
        return {
            "summary": {
                "total_processed": self.metrics["total_processed"],
                "auto_resolved": self.metrics["auto_resolved"],
                "escalated_to_human": self.metrics["escalated_to_human"],
                "auto_resolution_rate": round(auto_resolution_rate, 2),
                "average_confidence": round(self.metrics["average_confidence"], 2),
                "average_processing_time": round(avg_processing_time, 2)
            },
            "category_distribution": self.metrics["category_distribution"],
            "hourly_volume": self.metrics["hourly_volume"]
        }
```

---

## 🚀 **Week 2 완성 체크리스트**

### **기술적 구현**
- [ ] LangGraph 상태 머신 구축
- [ ] 문의 분류 자동화
- [ ] 긴급도 평가 시스템
- [ ] 컨텍스트 기반 답변 생성
- [ ] 품질 검토 및 에스컬레이션

### **워크플로우 최적화**
- [ ] 조건부 분기 로직
- [ ] 배치 처리 시스템
- [ ] 성능 모니터링
- [ ] 오류 처리 및 복구

### **통합 및 테스트**
- [ ] 기존 Q&A 시스템 연동
- [ ] API 엔드포인트 구현
- [ ] 실시간 성능 모니터링
- [ ] A/B 테스트 환경 구축

**Week 2 완료 시 결과물:**
✅ 지능형 Q&A 자동화 시스템
✅ LangGraph 워크플로우 엔진
✅ 실시간 성능 모니터링
✅ 확장 가능한 상태 머신

**Week 2에서 달성하는 핵심 가치:**
🔥 **자동화율 70% 달성**
🔥 **응답 시간 80% 단축**  
🔥 **일관된 품질의 고객 서비스**
🔥 **실시간 워크플로우 모니터링**

이제 Week 3에서 스마트 견적 시스템을 구축할 준비가 완료됩니다! 🚀 