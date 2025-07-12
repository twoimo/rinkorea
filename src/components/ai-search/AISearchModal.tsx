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
import CardDisplay from './CardDisplay';

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
    functionType: AIFunctionType;
    followUpQuestions?: string[];
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
    const lastMessageRef = useRef<HTMLDivElement>(null);
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
                { text: '린코트 제품을 보여주세요' },
                { text: '온라인 스토어 제품을 보여주세요' },
                { text: '모든 제품 라인업을 보여주세요' },
            ],
        },
        {
            id: 'qna_automation',
            name: '지능형 Q&A 자동화',
            description: '자주 묻는 질문에 대한 자동 답변 및 Q&A 관리',
            icon: HelpCircle,
            color: 'bg-green-500',
            examples: [
                { text: '린코트 시공 방법과 관련 프로젝트를 보여주세요' },
                { text: '현대건설기계 군산공장 프로젝트를 보여주세요' },
                { text: '교육시설 적용 사례를 찾아주세요' },
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
                { text: '콘크리트 연삭기 장비를 보여주세요' },
                { text: '린코트 카탈로그와 도장사양서를 보여주세요' },
                { text: '시험성적서와 인증서를 보여주세요' },
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
        // Smart scrolling: AI messages scroll to top, user messages scroll to bottom
        if (messages.length > prevMessagesLength.current) {
            const newMessage = messages[messages.length - 1];

            if (newMessage?.role === 'assistant' && lastMessageRef.current) {
                // For AI responses, scroll to show the top of the message
                setTimeout(() => {
                    lastMessageRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
            } else if (chatEndRef.current) {
                // For user messages, scroll to bottom as before
                chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages]);

    const handleExampleQuestionClick = useCallback((question: string) => {
        setInputMessage(question);
    }, []);

    const handleSendMessage = useCallback(async (messageContent?: string, funcType?: AIFunctionType) => {
        const content = typeof messageContent === 'string' ? messageContent : inputMessage.trim();
        if (!content || isLoading) return;

        let functionToUse = funcType || selectedFunction;
        if (!functionToUse && messages.length > 0) {
            const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant');
            if (lastAiMessage) {
                functionToUse = lastAiMessage.functionType;
            }
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content,
            timestamp: new Date(),
            functionType: functionToUse || 'customer_chat',
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputMessage('');
        setIsLoading(true);

        try {
            const result = await aiAgent.processRequest(
                functionToUse,
                content,
                { user_id: user?.id, history: updatedMessages.slice(0, -1) },
                isAdmin
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.response,
                timestamp: new Date(),
                functionType: result.function_type as AIFunctionType,
                followUpQuestions: result.follow_up_questions
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('AI request failed:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다. 다시 시도해주세요.',
                timestamp: new Date(),
                functionType: 'customer_chat'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [inputMessage, selectedFunction, isLoading, user?.id, isAdmin, messages]);

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
        let content = message.content;
        let quoteData = null;
        const cardComponents: JSX.Element[] = [];

        // Extract quote data
        const quoteStartMarker = '[QUOTE_START]';
        const quoteEndMarker = '[QUOTE_END]';
        const quoteStartIndex = content.indexOf(quoteStartMarker);
        const quoteEndIndex = content.indexOf(quoteEndMarker);

        if (quoteStartIndex !== -1 && quoteEndIndex !== -1) {
            const jsonString = content.substring(quoteStartIndex + quoteStartMarker.length, quoteEndIndex).trim();
            try {
                const parsed = JSON.parse(jsonString);
                if (parsed && parsed.products) {
                    quoteData = parsed;
                    // Remove the quote part (including markers) from the content string
                    content = content.substring(0, quoteStartIndex) + content.substring(quoteEndIndex + quoteEndMarker.length);
                }
            } catch (e) {
                console.error("Failed to parse quote JSON:", e);
            }
        }

        // Extract NEW SHOW_* markers first
        const showMarkers = [
            { regex: /\[SHOW_PRODUCT:([^\]]+)\]/g, type: 'products' as const },
            { regex: /\[SHOW_EQUIPMENT:([^\]]+)\]/g, type: 'equipment' as const },
            // projects: 닫는 대괄호가 없어도 매칭
            { regex: /\[SHOW_PROJECT:([a-f0-9-,]+)\]?/gi, type: 'projects' as const },
            { regex: /\[SHOW_CERTIFICATE:([^\]]+)\]/g, type: 'certificates' as const },
            { regex: /\[SHOW_RESOURCES:([^\]]+)\]/g, type: 'resources' as const },
            { regex: /\[SHOW_SHOP:([^\]]+)\]/g, type: 'shop' as const }
        ];

        showMarkers.forEach(marker => {
            let match;
            while ((match = marker.regex.exec(content)) !== null) {
                const idsString = match[1];
                const ids = idsString.split(',').map(id => id.trim()).filter(id => id);

                if (ids.length > 0) {
                    cardComponents.push(
                        <CardDisplay key={`show-${marker.type}-${cardComponents.length}`} data={{ type: marker.type, ids }} />
                    );
                }
            }
            // Remove all markers from content
            content = content.replace(marker.regex, '');
        });

        // Extract card data for different types (existing system)
        const cardMarkers = [
            { start: '[PRODUCTS_START]', end: '[PRODUCTS_END]', type: 'products' },
            { start: '[PROJECTS_START]', end: '[PROJECTS_END]', type: 'projects' },
            { start: '[EQUIPMENT_START]', end: '[EQUIPMENT_END]', type: 'equipment' },
            { start: '[SHOP_START]', end: '[SHOP_END]', type: 'shop' },
            { start: '[CERTIFICATES_START]', end: '[CERTIFICATES_END]', type: 'certificates' },
            { start: '[RESOURCES_START]', end: '[RESOURCES_END]', type: 'resources' }
        ];

        cardMarkers.forEach((marker, index) => {
            const startIndex = content.indexOf(marker.start);
            const endIndex = content.indexOf(marker.end);

            if (startIndex !== -1 && endIndex !== -1) {
                const jsonString = content.substring(startIndex + marker.start.length, endIndex).trim();
                try {
                    const parsed = JSON.parse(jsonString);
                    if (parsed && parsed.type === marker.type && parsed.ids && Array.isArray(parsed.ids)) {
                        cardComponents.push(
                            <CardDisplay key={`card-${marker.type}-${index}`} data={parsed} />
                        );
                        // Remove the card part (including markers) from the content string
                        content = content.substring(0, startIndex) + content.substring(endIndex + marker.end.length);
                    }
                } catch (e) {
                    console.error(`Failed to parse ${marker.type} card JSON:`, e);
                }
            }
        });

        // Clean up any extra whitespace
        content = content.trim();

        return (
            <>
                {content && (
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
                {quoteData && <QuoteDisplay data={quoteData} />}
                {cardComponents.map((component, index) => (
                    <React.Fragment key={index}>{component}</React.Fragment>
                ))}
            </>
        );
    };

    const modalContent = (
        <div ref={modalRef} onClick={onClose}>
            <div
                className="bg-white w-full h-full sm:rounded-lg sm:shadow-xl sm:max-w-6xl sm:max-h-[90vh] sm:h-auto overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        {selectedFunction && (
                            <button
                                onClick={() => setSelectedFunction(null)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 rotate-45" />
                            </button>
                        )}
                        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                            <h2 className="text-lg sm:text-xl font-semibold truncate">
                                {selectedFunction
                                    ? selectedFunctionInfo?.name
                                    : 'AI 검색 및 지원'}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation flex-shrink-0"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Chat Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-4 sm:py-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                                무엇을 도와드릴까요?
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">
                                질문을 입력하시면 AI가 가장 적절한 기능으로 답변해 드립니다.
                            </p>
                            {/* Static Example Questions */}
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                                {exampleQuestionsToShow.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleQuestionClick(example.text)}
                                        className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm sm:text-base touch-manipulation"
                                    >
                                        {example.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => {
                                const funcInfo = message.role === 'assistant'
                                    ? aiFunctions.find(f => f.id === message.functionType)
                                    : null;

                                return (
                                    <React.Fragment key={message.id}>
                                        <div
                                            ref={index === messages.length - 1 ? lastMessageRef : null}
                                            className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}
                                        >
                                            <div
                                                className={cn(
                                                    "p-3 sm:p-4 rounded-lg text-sm sm:text-base",
                                                    message.role === 'user'
                                                        ? 'bg-blue-600 text-white max-w-[85%] sm:max-w-[70%]'
                                                        : 'bg-gray-100 text-gray-800 max-w-[90%] sm:max-w-[75%]'
                                                )}
                                            >
                                                {message.role === 'assistant' ? (
                                                    <>
                                                        {funcInfo && (
                                                            <div className="flex items-center space-x-1.5 sm:space-x-2 mb-2 pb-2 border-b border-gray-200">
                                                                <funcInfo.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0", funcInfo.color.replace('bg-', 'text-'))} />
                                                                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{funcInfo.name}</span>
                                                            </div>
                                                        )}
                                                        {renderMessageContent(message)}
                                                    </>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                                )}
                                                <p className={cn(
                                                    "text-xs mt-1.5 sm:mt-2",
                                                    message.role === 'user'
                                                        ? 'text-blue-200'
                                                        : 'text-gray-500'
                                                )}>
                                                    {message.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Render follow-up questions for the last assistant message */}
                                        {message.role === 'assistant' && index === messages.length - 1 && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                                            <div className="mt-3 sm:mt-4 flex flex-wrap justify-start gap-2 sm:gap-3">
                                                {message.followUpQuestions.map((question, qIndex) => (
                                                    <button
                                                        key={qIndex}
                                                        onClick={() => handleSendMessage(question, message.functionType)}
                                                        className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 active:bg-blue-200 transition-colors text-sm sm:text-base touch-manipulation"
                                                    >
                                                        {question}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg max-w-[90%] sm:max-w-[75%]">
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                                            <span className="text-gray-600 text-sm sm:text-base">AI가 답변을 생성하고 있습니다...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 bg-white">
                    <div className="flex space-x-2 sm:space-x-4">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleInputKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                            rows={2}
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim() || isLoading}
                            className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation min-w-0 flex-shrink-0"
                        >
                            <Send className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:block">전송</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AISearchModal; 