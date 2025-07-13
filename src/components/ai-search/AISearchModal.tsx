import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, HelpCircle, Calculator, Search, TrendingUp, Bot, Send, Loader2, Sparkles, ArrowRight, Zap } from 'lucide-react';
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
    gradient: string;
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

interface ExampleQuestion {
    text: string;
    adminOnly?: boolean;
    category?: string;
}

function AISearchModal({ onClose }: AISearchModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(0);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { user } = useAuth();
    const { isAdmin } = useUserRole();

    const [selectedFunction, setSelectedFunction] = useState<AIFunctionType | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);

    const aiFunctions: (AIFunction & { examples: ExampleQuestion[] })[] = [
        {
            id: 'customer_chat',
            name: 'AI 고객 상담 챗봇',
            description: '제품 문의, 기술 지원, 일반 상담을 위한 AI 어시스턴트',
            icon: MessageCircle,
            color: 'text-blue-600',
            gradient: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
            examples: [
                { text: '린코트 제품을 보여주세요', category: '제품 문의' },
                { text: '온라인 스토어 제품을 보여주세요', category: '제품 문의' },
                { text: '모든 제품 라인업을 보여주세요', category: '제품 문의' },
            ],
        },
        {
            id: 'qna_automation',
            name: '지능형 Q&A 자동화',
            description: '자주 묻는 질문에 대한 자동 답변 및 Q&A 관리',
            icon: HelpCircle,
            color: 'text-green-600',
            gradient: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
            examples: [
                { text: '린코트 시공 방법과 관련 프로젝트를 보여주세요', category: '시공 관련' },
                { text: '현대건설기계 군산공장 프로젝트를 보여주세요', category: '프로젝트 사례' },
                { text: '교육시설 적용 사례를 찾아주세요', category: '프로젝트 사례' },
            ],
        },
        {
            id: 'smart_quote',
            name: '스마트 견적 시스템',
            description: '제품 및 서비스에 대한 자동 견적 생성',
            icon: Calculator,
            color: 'text-purple-600',
            gradient: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
            examples: [
                { text: '100제곱미터 면적에 린코트를 시공할 때 예상 비용은?', category: '견적 문의' },
                { text: '린하드플러스 10통에 대한 견적을 내주세요.', category: '견적 문의' },
            ],
        },
        {
            id: 'document_search',
            name: '문서 지능 검색',
            description: '회사 문서, 매뉴얼, 자료에서 정보 검색',
            icon: Search,
            color: 'text-orange-600',
            gradient: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
            examples: [
                { text: '콘크리트 연삭기 장비를 보여주세요', category: '장비 문의' },
                { text: '린코트 카탈로그와 도장사양서를 보여주세요', category: '자료 검색' },
                { text: '시험성적서와 인증서를 보여주세요', category: '자료 검색' },
            ],
        },
        {
            id: 'financial_analysis',
            name: '금융 AI 분석',
            description: '매출, 수익, 트렌드 분석 및 인사이트 제공',
            icon: TrendingUp,
            color: 'text-red-600',
            gradient: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
            adminOnly: true,
            examples: [
                { text: '지난 분기 대비 매출 증감률을 알려줘.', adminOnly: true, category: '분석' },
                { text: '가장 수익성이 높은 제품군은 무엇인가?', adminOnly: true, category: '분석' },
                { text: '올해 연말 매출을 예측해줘.', adminOnly: true, category: '예측' },
            ],
        },
    ];

    const allExamples = aiFunctions.flatMap(f => f.examples.filter(ex => !ex.adminOnly || isAdmin));
    const exampleQuestionsToShow = allExamples.slice(0, 12);

    // Auto-resize textarea
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 120;
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    }, []);

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputMessage, adjustTextareaHeight]);

    // Modal positioning and scroll prevention
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
            modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            modalElement.style.backdropFilter = 'blur(8px)';
            modalElement.style.display = 'flex';
            modalElement.style.alignItems = 'center';
            modalElement.style.justifyContent = 'center';
            modalElement.style.padding = '8px';
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

    // Auto-scroll to new messages
    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const newMessage = messages[messages.length - 1];

            if (newMessage?.role === 'assistant' && lastMessageRef.current) {
                setTimeout(() => {
                    lastMessageRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
            } else if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages]);

    const handleExampleQuestionClick = useCallback((question: string) => {
        setInputMessage(question);
        setShowWelcome(false);
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 100);
    }, []);

    const handleSendMessage = useCallback(async (messageContent?: string, funcType?: AIFunctionType) => {
        const content = typeof messageContent === 'string' ? messageContent : inputMessage.trim();
        if (!content || isLoading) return;

        setShowWelcome(false);

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
                        content = content.substring(0, startIndex) + content.substring(endIndex + marker.end.length);
                    }
                } catch (e) {
                    console.error(`Failed to parse ${marker.type} card JSON:`, e);
                }
            }
        });

        content = content.trim();

        return (
            <>
                {content && (
                    <div className="prose prose-sm max-w-none text-sm sm:text-base">
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
        <div ref={modalRef} onClick={onClose} className="animate-fade-in">
            <div
                className="bg-white w-full h-full sm:rounded-2xl sm:shadow-2xl sm:max-w-6xl sm:max-h-[95vh] sm:h-auto overflow-hidden flex flex-col animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                {/* Enhanced Header */}
                <div className="flex-shrink-0 sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between safe-area-inset-top">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {selectedFunction && (
                            <button
                                onClick={() => setSelectedFunction(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 touch-manipulation flex-shrink-0"
                                aria-label="뒤로 가기"
                            >
                                <ArrowRight className="w-5 h-5 rotate-180" />
                            </button>
                        )}
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="relative">
                                <Bot className="w-6 h-6 flex-shrink-0" />
                                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold truncate leading-tight">
                                    {selectedFunction
                                        ? selectedFunctionInfo?.name
                                        : 'AI 검색 및 지원'}
                                </h2>
                                {selectedFunction && selectedFunctionInfo && (
                                    <p className="text-sm text-blue-100 truncate">
                                        {selectedFunctionInfo.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 touch-manipulation flex-shrink-0 ml-3"
                        aria-label="모달 닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Enhanced Chat Messages */}
                <div 
                    ref={chatContainerRef} 
                    className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 overscroll-contain bg-gradient-to-b from-gray-50/50 to-white"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {showWelcome && messages.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 animate-fade-in">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                                    <Bot className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    무엇을 도와드릴까요?
                                </h3>
                                <p className="text-gray-600 mb-6 px-4 max-w-md mx-auto">
                                    질문을 입력하시면 AI가 가장 적절한 기능으로 답변해 드립니다.
                                </p>
                            </div>

                            {/* AI Function Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                                {aiFunctions.filter(f => !f.adminOnly || isAdmin).map((func, index) => (
                                    <div
                                        key={func.id}
                                        className={cn(
                                            "group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
                                            func.gradient,
                                            "animate-fade-in"
                                        )}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        onClick={() => setSelectedFunction(func.id)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={cn("p-2 rounded-lg bg-white/80 group-hover:bg-white transition-colors", func.color)}>
                                                <func.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-gray-800">
                                                    {func.name}
                                                </h4>
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    {func.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Enhanced Example Questions */}
                            <div className="max-w-3xl mx-auto">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center space-x-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <span>인기 질문</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {exampleQuestionsToShow.slice(0, 6).map((example, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleExampleQuestionClick(example.text)}
                                            className="group px-4 py-3 bg-white hover:bg-blue-50 active:bg-blue-100 text-gray-700 hover:text-blue-800 rounded-xl transition-all duration-200 text-sm text-left touch-manipulation border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md animate-fade-in"
                                            style={{ animationDelay: `${(index + 3) * 100}ms` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="flex-1 font-medium">{example.text}</span>
                                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                                            </div>
                                            {example.category && (
                                                <span className="text-xs text-gray-500 mt-1 block">
                                                    {example.category}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
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
                                            className={cn(
                                                "flex animate-fade-in",
                                                message.role === 'user' ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                                    message.role === 'user'
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white max-w-[85%] rounded-br-lg'
                                                        : 'bg-white text-gray-800 max-w-[90%] rounded-bl-lg border border-gray-100'
                                                )}
                                            >
                                                {message.role === 'assistant' ? (
                                                    <>
                                                        {funcInfo && (
                                                            <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-100">
                                                                <div className={cn("p-1.5 rounded-lg", funcInfo.gradient)}>
                                                                    <funcInfo.icon className={cn("w-4 h-4", funcInfo.color)} />
                                                                </div>
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {funcInfo.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {renderMessageContent(message)}
                                                    </>
                                                ) : (
                                                    <p className="whitespace-pre-wrap break-words font-medium">{message.content}</p>
                                                )}
                                                <p className={cn(
                                                    "text-xs mt-3 opacity-75 flex items-center space-x-1",
                                                    message.role === 'user'
                                                        ? 'text-blue-200'
                                                        : 'text-gray-500'
                                                )}>
                                                    <span>{message.timestamp.toLocaleTimeString()}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Enhanced Follow-up Questions */}
                                        {message.role === 'assistant' && index === messages.length - 1 && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                                            <div className="mt-4 space-y-2 animate-fade-in">
                                                <p className="text-sm font-medium text-gray-600 mb-2">💡 추천 질문:</p>
                                                {message.followUpQuestions.map((question, qIndex) => (
                                                    <button
                                                        key={qIndex}
                                                        onClick={() => handleSendMessage(question, message.functionType)}
                                                        className="group flex items-center justify-between w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-800 rounded-xl transition-all duration-200 text-sm text-left touch-manipulation border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                                                    >
                                                        <span className="flex-1 font-medium">{question}</span>
                                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                            {isLoading && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="bg-white p-4 rounded-2xl max-w-[90%] rounded-bl-lg border border-gray-100 shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                                <div className="absolute inset-0 w-5 h-5 border-2 border-blue-200 rounded-full animate-pulse"></div>
                                            </div>
                                            <span className="text-gray-700 text-sm font-medium">AI가 답변을 생성하고 있습니다...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Enhanced Input Area */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-white safe-area-inset-bottom">
                    <div className="flex space-x-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleInputKeyPress}
                                placeholder="메시지를 입력하세요..."
                                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm leading-relaxed min-h-[48px] max-h-[120px] touch-manipulation transition-all duration-200 shadow-sm hover:shadow-md"
                                disabled={isLoading}
                                style={{ height: '48px' }}
                            />
                        </div>
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim() || isLoading}
                            className="group px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center touch-manipulation min-w-[48px] h-[48px] flex-shrink-0 shadow-lg hover:shadow-xl disabled:shadow-md"
                            aria-label="메시지 전송"
                        >
                            <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 text-center leading-tight px-2 bg-gray-50 rounded-lg py-2">
                        <span className="font-medium">💡 팁:</span> AI 어시스턴트는 실수를 할 수 있습니다. 중요한 정보는{' '}
                        <span className="text-blue-600 font-semibold">전화(032-571-1023)</span> 또는{' '}
                        <span className="text-blue-600 font-semibold">이메일(2019@rinkorea.com)</span>로 재확인하세요.
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

export default AISearchModal;
