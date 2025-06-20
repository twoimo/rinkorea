# Week 1: AI 챗봇 구현 가이드

## 🎯 **목표**
린코리아 제품 정보를 활용한 **실시간 AI 상담 챗봇** 구축

---

## 📋 **Day 1-2: 인프라 & 기본 설정**

### **1. 프로젝트 구조 생성**

```bash
# AI 백엔드 디렉토리 생성
mkdir backend/ai-service
cd backend/ai-service

# Python 가상환경 설정
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 기본 패키지 설치
pip install langchain langchain-openai openai python-dotenv fastapi uvicorn websockets
```

### **2. 환경 설정 파일 생성**

```python
# backend/ai-service/.env
OPENAI_API_KEY=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
SUPABASE_URL=https://fpyqjvnpduwifxgnbrck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXFqdm5wZHV3aWZ4Z25icmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDQsImV4cCI6MjA2NTExNjQwNH0.Uqn7ajeRHEqMl7gbPtOYHKd1ZhUb6xiMTZsK4QMxtfU
PINECONE_API_KEY=pcsk_4AQeoW_T5yG4j6JcG2kbvQZjTsrBg5HzyYofmLZUixjrCz3gG4s4sBWVN6TZ819BzNzCY8
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### **3. FastAPI 기본 구조**

```python
# backend/ai-service/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

load_dotenv()

app = FastAPI(title="RinKorea AI Service", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 로깅 설정
logging.basicConfig(level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")))
logger = logging.getLogger(__name__)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RinKorea AI"}

# WebSocket 연결 관리자
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # 여기에 AI 처리 로직 추가
            response = f"Echo: {data}"
            await manager.send_personal_message(response, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### **4. 프론트엔드 챗봇 UI 컴포넌트**

```typescript
// src/components/ai/ChatBot.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const websocket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // WebSocket 연결
    websocket.current = new WebSocket('ws://localhost:8000/ws/chat');
    
    websocket.current.onopen = () => {
      setIsConnected(true);
      addMessage('안녕하세요! 린코리아 AI 상담원입니다. 제품에 대해 궁금한 점이 있으시면 언제든 물어보세요.', 'bot');
    };

    websocket.current.onmessage = (event) => {
      setIsTyping(false);
      addMessage(event.data, 'bot');
    };

    websocket.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      websocket.current?.close();
    };
  }, []);

  const addMessage = (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !websocket.current) return;

    addMessage(inputValue, 'user');
    setIsTyping(true);
    websocket.current.send(inputValue);
    setInputValue('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center">
        <Bot className="w-5 h-5 mr-2" />
        <span className="font-semibold">AI 상담원</span>
        <div className={`ml-auto w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && <Bot className="w-4 h-4 mt-1 text-blue-600" />}
                {message.sender === 'user' && <User className="w-4 h-4 mt-1" />}
                <span className="text-sm">{message.content}</span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">입력 중...</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="메시지를 입력하세요..."
            disabled={!isConnected}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!isConnected || !inputValue.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
```

---

## 📋 **Day 3-4: RAG 시스템 구축**

### **1. Vector Database 설정**

```python
# backend/ai-service/database/vector_store.py
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import os
from typing import List

class VectorStore:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.persist_directory = "./chroma_db"
        self.vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def initialize_store(self):
        """벡터 스토어 초기화"""
        self.vector_store = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )

    def add_documents(self, documents: List[Document]):
        """문서를 벡터 스토어에 추가"""
        if not self.vector_store:
            self.initialize_store()
        
        # 문서 청킹
        texts = self.text_splitter.split_documents(documents)
        
        # 벡터 스토어에 추가
        self.vector_store.add_documents(texts)
        self.vector_store.persist()

    def similarity_search(self, query: str, k: int = 4):
        """유사도 검색"""
        if not self.vector_store:
            self.initialize_store()
        
        return self.vector_store.similarity_search(query, k=k)

    def similarity_search_with_score(self, query: str, k: int = 4):
        """점수와 함께 유사도 검색"""
        if not self.vector_store:
            self.initialize_store()
        
        return self.vector_store.similarity_search_with_score(query, k=k)
```

### **2. 제품 데이터 로더**

```python
# backend/ai-service/data/product_loader.py
from langchain.schema import Document
from typing import List
import asyncio
import aiohttp
import os

class ProductDataLoader:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")

    async def load_products(self) -> List[Document]:
        """Supabase에서 제품 데이터 로드"""
        async with aiohttp.ClientSession() as session:
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json"
            }
            
            async with session.get(
                f"{self.supabase_url}/rest/v1/product_introductions",
                headers=headers
            ) as response:
                products = await response.json()

        documents = []
        for product in products:
            # 제품 정보를 Document로 변환
            content = f"""
            제품명: {product['name']}
            설명: {product['description']}
            특징: {', '.join(product.get('features', []))}
            카테고리: {product.get('category', '일반')}
            """
            
            metadata = {
                "source": "product_db",
                "product_id": product['id'],
                "product_name": product['name'],
                "type": "product_info"
            }
            
            documents.append(Document(page_content=content, metadata=metadata))

        return documents

    async def load_projects(self) -> List[Document]:
        """프로젝트 데이터 로드"""
        async with aiohttp.ClientSession() as session:
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json"
            }
            
            async with session.get(
                f"{self.supabase_url}/rest/v1/projects",
                headers=headers
            ) as response:
                projects = await response.json()

        documents = []
        for project in projects:
            content = f"""
            프로젝트명: {project['title']}
            설명: {project['description']}
            위치: {project.get('location', '')}
            카테고리: {project.get('category', '')}
            완료일: {project.get('completion_date', '')}
            """
            
            metadata = {
                "source": "project_db",
                "project_id": project['id'],
                "project_name": project['title'],
                "type": "project_case"
            }
            
            documents.append(Document(page_content=content, metadata=metadata))

        return documents
```

### **3. 초기 데이터 임베딩**

```python
# backend/ai-service/scripts/setup_vector_db.py
import asyncio
from database.vector_store import VectorStore
from data.product_loader import ProductDataLoader

async def setup_vector_database():
    """벡터 데이터베이스 초기 설정"""
    print("벡터 데이터베이스 설정 시작...")
    
    # 데이터 로더 초기화
    loader = ProductDataLoader()
    vector_store = VectorStore()
    
    try:
        # 제품 데이터 로드
        print("제품 데이터 로딩 중...")
        product_docs = await loader.load_products()
        print(f"제품 문서 {len(product_docs)}개 로드 완료")
        
        # 프로젝트 데이터 로드
        print("프로젝트 데이터 로딩 중...")
        project_docs = await loader.load_projects()
        print(f"프로젝트 문서 {len(project_docs)}개 로드 완료")
        
        # 벡터 스토어에 추가
        print("벡터화 및 저장 중...")
        all_docs = product_docs + project_docs
        vector_store.add_documents(all_docs)
        
        print("벡터 데이터베이스 설정 완료!")
        
        # 테스트 검색
        test_results = vector_store.similarity_search("방수 제품", k=3)
        print("\n테스트 검색 결과:")
        for i, doc in enumerate(test_results, 1):
            print(f"{i}. {doc.page_content[:100]}...")
            
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(setup_vector_database())
```

---

## 📋 **Day 5-7: 챗봇 완성**

### **1. LangChain 대화 체인**

```python
# backend/ai-service/ai/chat_chain.py
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema.runnable import RunnablePassthrough, RunnableLambda
from langchain.schema import StrOutputParser
from database.vector_store import VectorStore
import os

class ChatChain:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.7,
            model="gpt-4",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.vector_store = VectorStore()
        self.vector_store.initialize_store()
        
        # 메모리 설정 (최근 10개 대화 기억)
        self.memory = ConversationBufferWindowMemory(
            k=10,
            memory_key="chat_history",
            return_messages=True
        )
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """당신은 린코리아의 전문 AI 상담원입니다. 다음 지침을 따라 응답하세요:

1. 친근하고 전문적인 톤으로 대화하세요
2. 제공된 컨텍스트 정보를 기반으로 정확한 답변을 제공하세요
3. 모르는 내용은 솔직히 말하고, 전문가 상담을 권하세요
4. 제품 추천 시에는 고객의 구체적인 요구사항을 먼저 파악하세요
5. 안전하고 품질 좋은 제품 사용을 위한 조언을 포함하세요

컨텍스트 정보:
{context}

현재 대화에서 참고할 수 있는 관련 정보를 바탕으로 고객의 질문에 답변해주세요."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])

    def get_relevant_context(self, question: str) -> str:
        """질문과 관련된 컨텍스트 검색"""
        try:
            docs = self.vector_store.similarity_search(question, k=4)
            context = "\n\n".join([doc.page_content for doc in docs])
            return context
        except Exception as e:
            print(f"컨텍스트 검색 오류: {e}")
            return ""

    async def get_response(self, question: str) -> str:
        """질문에 대한 응답 생성"""
        try:
            # 관련 컨텍스트 검색
            context = self.get_relevant_context(question)
            
            # 체인 실행
            chain = (
                {
                    "context": RunnableLambda(lambda x: context),
                    "question": RunnablePassthrough(),
                    "chat_history": RunnableLambda(lambda x: self.memory.chat_memory.messages)
                }
                | self.prompt
                | self.llm
                | StrOutputParser()
            )
            
            response = await chain.ainvoke(question)
            
            # 메모리에 대화 저장
            self.memory.chat_memory.add_user_message(question)
            self.memory.chat_memory.add_ai_message(response)
            
            return response
            
        except Exception as e:
            print(f"응답 생성 오류: {e}")
            return "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."

    def clear_history(self):
        """대화 기록 초기화"""
        self.memory.clear()
```

### **2. WebSocket 핸들러 업데이트**

```python
# backend/ai-service/main.py 업데이트
from ai.chat_chain import ChatChain
import json

# 챗 체인 인스턴스 생성
chat_chain = ChatChain()

# WebSocket 연결별 세션 관리
user_sessions = {}

@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket)
    
    # 새 세션이면 ChatChain 인스턴스 생성
    if session_id not in user_sessions:
        user_sessions[session_id] = ChatChain()
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            user_message = message_data.get("message", "")
            message_type = message_data.get("type", "text")
            
            if message_type == "clear":
                # 대화 기록 초기화
                user_sessions[session_id].clear_history()
                response = "대화 기록이 초기화되었습니다."
            else:
                # AI 응답 생성
                response = await user_sessions[session_id].get_response(user_message)
            
            # 응답 전송
            await manager.send_personal_message(
                json.dumps({
                    "message": response,
                    "type": "bot_response",
                    "timestamp": datetime.utcnow().isoformat()
                }),
                websocket
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # 세션 정리 (선택적)
        if session_id in user_sessions:
            del user_sessions[session_id]
```

### **3. 다국어 지원**

```python
# backend/ai-service/ai/translator.py
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os

class Translator:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.3,
            model="gpt-3.5-turbo",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        self.translation_prompt = ChatPromptTemplate.from_template("""
        다음 텍스트를 {target_language}로 번역해주세요. 
        건설/화학 제품 관련 전문 용어는 정확하게 번역하고, 자연스러운 문체로 작성해주세요.
        
        원문: {text}
        
        번역:
        """)

    async def translate(self, text: str, target_language: str) -> str:
        """텍스트 번역"""
        try:
            chain = self.translation_prompt | self.llm
            result = await chain.ainvoke({
                "text": text,
                "target_language": target_language
            })
            return result.content
        except Exception as e:
            print(f"번역 오류: {e}")
            return text

    async def detect_language(self, text: str) -> str:
        """언어 감지"""
        detection_prompt = ChatPromptTemplate.from_template("""
        다음 텍스트의 언어를 감지하고, 언어 코드만 반환해주세요:
        - 한국어: ko
        - 영어: en  
        - 중국어: zh
        - 인도네시아어: id
        
        텍스트: {text}
        
        언어 코드:
        """)
        
        try:
            chain = detection_prompt | self.llm
            result = await chain.ainvoke({"text": text})
            return result.content.strip().lower()
        except Exception as e:
            print(f"언어 감지 오류: {e}")
            return "ko"  # 기본값 한국어
```

### **4. 실행 스크립트**

```bash
# backend/ai-service/run.py
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    # 벡터 DB 초기 설정 (최초 실행시에만)
    import asyncio
    from scripts.setup_vector_db import setup_vector_database
    
    print("벡터 데이터베이스 확인 중...")
    if not os.path.exists("./chroma_db"):
        print("벡터 데이터베이스를 초기화합니다...")
        asyncio.run(setup_vector_database())
    
    # 서버 실행
    print("AI 서비스 시작...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
```

---

## 🚀 **실행 및 테스트**

### **1. 백엔드 실행**
```bash
cd backend/ai-service
python run.py
```

### **2. 프론트엔드에 챗봇 추가**
```typescript
// src/app/layout.tsx에 추가
import ChatBot from '@/components/ai/ChatBot';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
```

### **3. 테스트 시나리오**
- ✅ "린코트에 대해 알려주세요"
- ✅ "방수 제품 추천해주세요"  
- ✅ "견적을 받고 싶어요"
- ✅ "English please" (다국어 테스트)

---

## 📊 **Week 1 완성 체크리스트**

- [ ] FastAPI 기본 서버 구동
- [ ] WebSocket 실시간 채팅
- [ ] LangChain + GPT-4 연동
- [ ] Vector DB (Chroma) 구축
- [ ] 제품 데이터 RAG 검색
- [ ] 대화 메모리 관리
- [ ] 다국어 번역 기능
- [ ] 반응형 채팅 UI
- [ ] 에러 핸들링
- [ ] 기본 테스트 완료

**Week 1 목표 달성 시 얻는 것:**
✅ 실시간 AI 상담 챗봇 프로토타입  
✅ LangChain 실무 경험  
✅ Vector DB 구축 노하우  
✅ WebSocket 실시간 통신

다음 주차에서는 이 챗봇을 기반으로 **LangGraph 워크플로우**를 구축할 예정입니다! 🚀 