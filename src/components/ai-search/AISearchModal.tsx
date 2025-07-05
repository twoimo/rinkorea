import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, HelpCircle, Calculator, Search, TrendingUp, Bot, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { aiAgent, AIFunctionType } from '@/services/langgraph-agent';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import QuoteDisplay from './QuoteDisplay';

interface AISearchModalProps {
    onClose: () => void;
}

interface AIFunction {
    id: AIFunctionType;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    adminOnly?: boolean;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    functionType?: AIFunctionType;
}

// 새로운 인터페이스: 예시 질문
interface ExampleQuestion {
    text: string;
    adminOnly?: boolean;
}

const AISearchModal: React.FC<AISearchModalProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(0);
    const { user } = useAuth();
    const { isAdmin } = useUserRole();

    const [selectedFunction, setSelectedFunction] = useState<AIFunctionType | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const aiFunctions: (AIFunction & { examples: ExampleQuestion[] })[] = [
        {
            id: 'customer_chat',
            name: 'AI 고객 상담 챗봇',
            description: '제품 문의, 기술 지원, 일반 상담을 위한 AI 어시스턴트',
            icon: MessageCircle,
            color: 'bg-blue-500',
            examples: [
                { text: '린코트 제품의 특징은 무엇인가요?' },
                { text: '콘크리트 바닥에 사용할 수 있는 제품을 추천해주세요.' },
                { text: '제품 구매는 어떻게 하나요?' },
            ],
        },
        {
            id: 'qna_automation',
            name: '지능형 Q&A 자동화',
            description: '자주 묻는 질문에 대한 자동 답변 및 Q&A 관리',
            icon: HelpCircle,
            color: 'bg-green-500',
            examples: [
                { text: '제품 시공 방법이 궁금합니다.' },
                { text: '시험성적서를 받을 수 있나요?' },
                { text: '불연재 관련 인증 자료를 찾아주세요.' },
            ],
        },
        {
            id: 'smart_quote',
            name: '스마트 견적 시스템',
            description: '제품 및 서비스에 대한 자동 견적 생성',
            icon: Calculator,
            color: 'bg-purple-500',
            examples: [
                { text: '100제곱미터 면적에 린코트를 시공할 때 예상 비용은?' },
                { text: '린하드플러스 10통에 대한 견적을 내주세요.' },
                { text: '대량 구매 시 할인 혜택이 있나요?' },
            ],
        },
        {
            id: 'document_search',
            name: '문서 지능 검색',
            description: '회사 문서, 매뉴얼, 자료에서 정보 검색',
            icon: Search,
            color: 'bg-orange-500',
            examples: [
                { text: '린씰플러스의 기술 데이터 시트를 찾아줘.' },
                { text: '최근에 진행된 주요 프로젝트 목록을 보여줘.' },
                { text: '2024년 2분기 매출 보고서를 요약해줘.', adminOnly: true },
            ],
        },
        {
            id: 'financial_analysis',
            name: '금융 AI 분석',
            description: '매출, 수익, 트렌드 분석 및 인사이트 제공',
            icon: TrendingUp,
            color: 'bg-red-500',
            adminOnly: true,
            examples: [
                { text: '지난 분기 대비 매출 증감률을 알려줘.', adminOnly: true },
                { text: '가장 수익성이 높은 제품군은 무엇인가?', adminOnly: true },
                { text: '올해 연말 매출을 예측해줘.', adminOnly: true },
            ],
        },
    ];

    const allExamples = aiFunctions.flatMap(f => f.examples.filter(ex => !ex.adminOnly || isAdmin));
    const exampleQuestionsToShow = allExamples.slice(0, 12);

    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyTouchAction = document.body.style.touchAction;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        const isInsideModal = (target: EventTarget | null): boolean => {
            if (!target || !modalRef.current) return false;
            const element = target as Element;
            return modalRef.current.contains(element);
        };

        const preventWheel = (e: WheelEvent) => {
            if (!isInsideModal(e.target)) {
                e.preventDefault();
            }
        };

        const preventTouch = (e: TouchEvent) => {
            if (e.touches.length > 1) return;
            if (!isInsideModal(e.target)) {
                e.preventDefault();
            }
        };

        const preventKeyScroll = (e: KeyboardEvent) => {
            const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
            if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) {
                e.preventDefault();
            }
        };

        const updateModalPosition = () => {
            if (!modalRef.current) return;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            const modalElement = modalRef.current;
            modalElement.style.position = 'absolute';
            modalElement.style.top = `${scrollTop}px`;
            modalElement.style.left = `${scrollLeft}px`;
            modalElement.style.width = `${viewportWidth}px`;
            modalElement.style.height = `${viewportHeight}px`;
            modalElement.style.zIndex = '2147483647';
            modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            modalElement.style.display = 'flex';
            modalElement.style.alignItems = 'center';
            modalElement.style.justifyContent = 'center';
            modalElement.style.padding = '16px';
            modalElement.style.boxSizing = 'border-box';

            animationFrameRef.current = requestAnimationFrame(updateModalPosition);
        };

        updateModalPosition();

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('wheel', preventWheel, { passive: false });
        document.addEventListener('touchmove', preventTouch, { passive: false });
        document.addEventListener('keydown', preventKeyScroll, { passive: false });

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('wheel', preventWheel);
            document.removeEventListener('touchmove', preventTouch);
            document.removeEventListener('keydown', preventKeyScroll);

            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.touchAction = originalBodyTouchAction;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [onClose, isLoading]);

    useEffect(() => {
        // Scroll to the bottom when new messages are added
        if (chatEndRef.current && messages.length > prevMessagesLength.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        prevMessagesLength.current = messages.length;
    }, [messages]);

    const handleExampleQuestionClick = useCallback((question: string) => {
        setInputMessage(question);
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date(),
            functionType: selectedFunction,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await aiAgent.processRequest(
                selectedFunction,
                inputMessage.trim(),
                { user_id: user?.id },
                isAdmin
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                functionType: selectedFunction,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다. 다시 시도해주세요.',
                timestamp: new Date(),
                functionType: selectedFunction,
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [inputMessage, selectedFunction, isLoading, user?.id, isAdmin]);

    const handleInputKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const selectedFunctionInfo = selectedFunction
        ? aiFunctions.find(f => f.id === selectedFunction)
        : null;

    const renderMessageContent = (message: Message) => {
        // Regular expression to find a JSON object or array within the string
        const jsonRegex = /({.*}|\[.*\])/s;
        const match = message.content.match(jsonRegex);

        if (match) {
            const jsonString = match[0];
            const precedingText = message.content.substring(0, match.index);

            try {
                const parsedData = JSON.parse(jsonString);
                if (parsedData && (parsedData.products || parsedData.total)) {
                    return (
                        <>
                            {precedingText.trim() && (
                                <div className="prose prose-sm max-w-none mb-4">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {precedingText}
                                    </ReactMarkdown>
                                </div>
                            )}
                            <QuoteDisplay data={parsedData} />
                        </>
                    );
                }
            } catch {
                // Not a valid JSON, fall through to default rendering
            }
        }

        // Default rendering for user messages or non-quote assistant messages
        return (
            <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                </ReactMarkdown>
            </div>
        );
    };

    const modalContent = (
        <div ref={modalRef} onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {selectedFunction && (
                            <button
                                onClick={() => setSelectedFunction(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 rotate-45" />
                            </button>
                        )}
                        <div className="flex items-center space-x-2">
                            <Bot className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold">
                                {selectedFunction
                                    ? selectedFunctionInfo?.name
                                    : 'AI 검색 및 지원'}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Chat Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                무엇을 도와드릴까요?
                            </h3>
                            <p className="text-gray-600 mb-8">
                                질문을 입력하시면 AI가 가장 적절한 기능으로 답변해 드립니다.
                            </p>
                            {/* Static Example Questions */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {exampleQuestionsToShow.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleQuestionClick(example.text)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        {example.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] p-4 rounded-lg",
                                            message.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        )}
                                    >
                                        {message.role === 'assistant' ? (
                                            renderMessageContent(message)
                                        ) : (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        )}
                                        <p className={cn(
                                            "text-xs mt-2",
                                            message.role === 'user'
                                                ? 'text-blue-200'
                                                : 'text-gray-500'
                                        )}>
                                            {message.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                            <span className="text-gray-600">AI가 답변을 생성하고 있습니다...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4">
                    <div className="flex space-x-4">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleInputKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={2}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>전송</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AISearchModal; 