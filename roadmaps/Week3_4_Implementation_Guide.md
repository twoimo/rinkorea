# Week 3-4: 스마트 견적 시스템 & 문서 AI

## 🎯 **Week 3 목표**
AI 기반 **스마트 견적 시스템** 구축 (7/4 - 7/10)

## 🎯 **Week 4 목표**
**문서 지능 검색 엔진** 구축 및 전체 시스템 완성 (7/11 - 7/13)

---

## 📋 **Week 3: 스마트 견적 시스템**

### **Day 15-16: 데이터 분석 & 모델링**

```python
# backend/ai-service/estimation/project_analyzer.py
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import pandas as pd
import os

class ProjectAnalyzer:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.3,
            model="gpt-4",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

    async def analyze_project_requirements(self, requirements: dict):
        """프로젝트 요구사항 분석"""
        analysis_prompt = ChatPromptTemplate.from_template("""
        다음 프로젝트 요구사항을 분석하여 최적의 제품 조합을 추천해주세요:
        
        프로젝트 정보:
        - 용도: {purpose}
        - 면적: {area} m²
        - 환경: {environment}
        - 예산: {budget}
        
        린코리아 제품군:
        - 린코트: 바닥 코팅재 (방수, 내구성)
        - 린하드: 경화제 (강도 증진)
        - 린씰: 실링제 (방수, 밀봉)
        
        추천 제품 조합과 수량을 JSON 형태로 반환:
        """)
        
        result = await self.llm.ainvoke({
            "purpose": requirements.get("purpose"),
            "area": requirements.get("area"),
            "environment": requirements.get("environment"),
            "budget": requirements.get("budget")
        })
        
        return result.content

class EstimationEngine:
    def __init__(self):
        self.analyzer = ProjectAnalyzer()
        
    async def generate_estimate(self, project_data: dict):
        """견적서 자동 생성"""
        # 1. 프로젝트 분석
        analysis = await self.analyzer.analyze_project_requirements(project_data)
        
        # 2. 제품 매칭 및 가격 계산
        products = self._match_products(analysis)
        total_cost = self._calculate_cost(products)
        
        # 3. 견적서 데이터 구성
        estimate = {
            "project_id": project_data.get("id"),
            "products": products,
            "total_cost": total_cost,
            "delivery_time": self._estimate_delivery_time(products),
            "validity_period": 30  # 30일
        }
        
        return estimate
    
    def _match_products(self, analysis):
        """제품 매칭"""
        # 실제 제품 DB에서 매칭하는 로직
        return [
            {"name": "린코트", "quantity": 10, "unit_price": 50000},
            {"name": "린하드", "quantity": 5, "unit_price": 30000}
        ]
    
    def _calculate_cost(self, products):
        """비용 계산"""
        return sum(p["quantity"] * p["unit_price"] for p in products)
    
    def _estimate_delivery_time(self, products):
        """배송 시간 예측"""
        return "3-5 영업일"
```

### **Day 17-18: 견적 시스템 개발**

```python
# backend/ai-service/api/estimation_endpoints.py
from fastapi import APIRouter, HTTPException
from estimation.estimation_engine import EstimationEngine
from pydantic import BaseModel

router = APIRouter(prefix="/api/estimation", tags=["Smart Estimation"])

class EstimationRequest(BaseModel):
    purpose: str
    area: float
    environment: str
    budget: int
    contact_info: dict

estimation_engine = EstimationEngine()

@router.post("/generate")
async def generate_estimate(request: EstimationRequest):
    """AI 견적서 생성"""
    try:
        project_data = request.dict()
        estimate = await estimation_engine.generate_estimate(project_data)
        
        return {
            "success": True,
            "estimate": estimate,
            "generated_at": "2025-07-08T10:30:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/template/{project_type}")
async def get_estimate_template(project_type: str):
    """견적서 템플릿 조회"""
    templates = {
        "warehouse": {
            "recommended_products": ["린코트", "린하드"],
            "typical_area": "1000-5000 m²",
            "estimated_cost_per_sqm": 15000
        }
    }
    return templates.get(project_type, templates["warehouse"])
```

### **Day 19-21: PDF 견적서 생성**

```python
# backend/ai-service/pdf/pdf_generator.py
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfutils
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import io

class PDFEstimateGenerator:
    def __init__(self):
        # 한글 폰트 등록 (필요시)
        # pdfmetrics.registerFont(TTFont('Korean', 'NanumGothic.ttf'))
        pass
    
    def generate_estimate_pdf(self, estimate_data: dict) -> bytes:
        """견적서 PDF 생성"""
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        
        # PDF 내용 작성
        self._draw_header(p)
        self._draw_estimate_details(p, estimate_data)
        self._draw_footer(p)
        
        p.save()
        buffer.seek(0)
        return buffer.getvalue()
    
    def _draw_header(self, canvas):
        """헤더 그리기"""
        canvas.setFont("Helvetica-Bold", 24)
        canvas.drawString(50, 750, "RinKorea Estimate")
        
    def _draw_estimate_details(self, canvas, data):
        """견적 내용 그리기"""
        y_position = 700
        for product in data.get("products", []):
            text = f"{product['name']}: {product['quantity']} x {product['unit_price']:,}원"
            canvas.drawString(50, y_position, text)
            y_position -= 30
    
    def _draw_footer(self, canvas):
        """푸터 그리기"""
        canvas.drawString(50, 50, "린코리아 - 고품질 건설 소재")
```

---

## 📋 **Week 4: 문서 AI & 최종 완성**

### **Day 22: 문서 처리 AI**

```python
# backend/ai-service/documents/document_processor.py
import pytesseract
from PIL import Image
import PyPDF2
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
import io

class DocumentProcessor:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
    
    async def process_pdf(self, pdf_bytes: bytes) -> list:
        """PDF 문서 처리"""
        text_content = self._extract_pdf_text(pdf_bytes)
        chunks = self.text_splitter.split_text(text_content)
        
        # 임베딩 생성
        embeddings = await self.embeddings.aembed_documents(chunks)
        
        return [
            {"text": chunk, "embedding": emb}
            for chunk, emb in zip(chunks, embeddings)
        ]
    
    def _extract_pdf_text(self, pdf_bytes: bytes) -> str:
        """PDF에서 텍스트 추출"""
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    
    async def process_image(self, image_bytes: bytes) -> str:
        """이미지 OCR 처리"""
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image, lang='kor+eng')
        return text

class SemanticSearchEngine:
    def __init__(self):
        self.vector_store = None  # ChromaDB 연결
    
    async def semantic_search(self, query: str, top_k: int = 5):
        """의미 기반 검색"""
        # 벡터 검색 수행
        results = self.vector_store.similarity_search(query, k=top_k)
        return results
    
    async def document_qa(self, question: str, document_context: str):
        """문서 기반 Q&A"""
        from langchain_openai import ChatOpenAI
        
        llm = ChatOpenAI(model="gpt-4")
        prompt = f"""
        다음 문서 내용을 바탕으로 질문에 답변해주세요:
        
        문서: {document_context}
        질문: {question}
        
        답변:
        """
        
        response = await llm.ainvoke(prompt)
        return response.content
```

### **Day 23: 통합 & 테스트**

```python
# backend/ai-service/integration/system_integrator.py
from ai.chat_chain import ChatChain
from workflows.executor import WorkflowExecutor
from estimation.estimation_engine import EstimationEngine
from documents.document_processor import DocumentProcessor

class AISystemIntegrator:
    def __init__(self):
        self.chatbot = ChatChain()
        self.qna_workflow = WorkflowExecutor()
        self.estimation_engine = EstimationEngine()
        self.document_processor = DocumentProcessor()
    
    async def unified_ai_service(self, request_type: str, data: dict):
        """통합 AI 서비스"""
        if request_type == "chat":
            return await self.chatbot.get_response(data["message"])
        
        elif request_type == "qna_automation":
            return await self.qna_workflow.process_inquiry(data)
        
        elif request_type == "estimation":
            return await self.estimation_engine.generate_estimate(data)
        
        elif request_type == "document_search":
            return await self.document_processor.semantic_search(data["query"])
        
        else:
            return {"error": "Unknown request type"}

# 성능 테스트
class PerformanceTester:
    async def run_load_test(self):
        """부하 테스트"""
        import asyncio
        import time
        
        tasks = []
        start_time = time.time()
        
        # 100개 동시 요청
        for i in range(100):
            task = self._test_request(f"테스트 문의 {i}")
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        end_time = time.time()
        
        return {
            "total_requests": 100,
            "total_time": end_time - start_time,
            "average_response_time": (end_time - start_time) / 100,
            "success_rate": sum(1 for r in results if r.get("success")) / 100
        }
```

### **Day 24: 문서화 & 포트폴리오 완성**

```markdown
# 최종 포트폴리오 구성

## 📁 GitHub Repository 구조
```
rinkorea-ai-platform/
├── backend/ai-service/          # Python AI 백엔드
│   ├── ai/                      # 챗봇 엔진
│   ├── workflows/               # LangGraph 워크플로우
│   ├── estimation/              # 견적 시스템
│   ├── documents/               # 문서 AI
│   ├── api/                     # FastAPI 엔드포인트
│   └── tests/                   # 테스트 코드
├── frontend/                    # Next.js 프론트엔드
├── docker/                      # Docker 설정
├── docs/                        # 기술 문서
└── README.md                    # 데모 가이드
```

## 📊 성과 지표 대시보드
- 챗봇 응답 정확도: **87%**
- Q&A 자동 처리율: **73%**  
- 견적 생성 시간: **평균 45초**
- 동시 사용자 처리: **150명+**

## 🚀 라이브 데모 사이트
- URL: https://rinkorea-ai.vercel.app
- 관리자 패널: /admin
- API 문서: /docs
```

---

## 🏆 **최종 완성 체크리스트**

### **Week 3: 견적 시스템**
- [ ] 프로젝트 요구사항 분석 AI
- [ ] 제품 매칭 알고리즘
- [ ] 가격 예측 모델
- [ ] PDF 견적서 자동 생성
- [ ] 견적 히스토리 관리

### **Week 4: 문서 AI & 통합**
- [ ] PDF/이미지 OCR 처리
- [ ] 의미 기반 검색 엔진
- [ ] 문서 Q&A 시스템
- [ ] 전체 시스템 통합
- [ ] 성능 최적화 & 테스트

### **포트폴리오 완성**
- [ ] GitHub 리포지토리 정리
- [ ] 라이브 데모 사이트 배포
- [ ] 기술 문서 작성
- [ ] 발표 자료 준비
- [ ] 성과 지표 정리

**최종 결과물:**
🎯 **완성도 높은 AI 플랫폼**
🎯 **실무 즉시 활용 가능한 시스템**
🎯 **MIDAS 요구사항 100% 충족**
🎯 **확장 가능한 아키텍처**

이 계획으로 **MIDAS에서 원하는 모든 기술 스택과 실무 경험**을 완벽하게 갖춘 포트폴리오가 완성됩니다! 🚀 