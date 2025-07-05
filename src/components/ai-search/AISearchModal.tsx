import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, HelpCircle, Calculator, Search, TrendingUp, Bot, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { aiAgent, AIFunctionType } from '@/services/langgraph-agent';
import { cn } from '@/lib/utils';

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

const AISearchModal: React.FC<AISearchModalProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { isAdmin } = useUserRole();

    const [selectedFunction, setSelectedFunction] = useState<AIFunctionType | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const aiFunctions: AIFunction[] = [
        {
            id: 'customer_chat',
            name: 'AI 고객 상담 챗봇',
            description: '제품 문의, 기술 지원, 일반 상담을 위한 AI 어시스턴트',
            icon: MessageCircle,
            color: 'bg-blue-500',
        },
        {
            id: 'qna_automation',
            name: '지능형 Q&A 자동화',
            description: '자주 묻는 질문에 대한 자동 답변 및 Q&A 관리',
            icon: HelpCircle,
            color: 'bg-green-500',
        },
        {
            id: 'smart_quote',
            name: '스마트 견적 시스템',
            description: '제품 및 서비스에 대한 자동 견적 생성',
            icon: Calculator,
            color: 'bg-purple-500',
        },
        {
            id: 'document_search',
            name: '문서 지능 검색',
            description: '회사 문서, 매뉴얼, 자료에서 정보 검색',
            icon: Search,
            color: 'bg-orange-500',
        },
        {
            id: 'financial_analysis',
            name: '금융 AI 분석',
            description: '매출, 수익, 트렌드 분석 및 인사이트 제공',
            icon: TrendingUp,
            color: 'bg-red-500',
            adminOnly: true,
        },
    ];

    const availableFunctions = aiFunctions.filter(func => !func.adminOnly || isAdmin);

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
        // 새 메시지가 추가될 때 스크롤을 맨 아래로
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleFunctionSelect = useCallback((functionType: AIFunctionType) => {
        setSelectedFunction(functionType);
        setMessages([]);
        setInputMessage('');
    }, []);

    const handleBackToFunctions = useCallback(() => {
        setSelectedFunction(null);
        setMessages([]);
        setInputMessage('');
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (!inputMessage.trim() || !selectedFunction || isLoading) return;

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
        } catch (error) {
            console.error('AI request failed:', error);
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

    const modalContent = (
        <div ref={modalRef} onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {selectedFunction && (
                            <button
                                onClick={handleBackToFunctions}
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

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {!selectedFunction ? (
                        /* Function Selection */
                        <div className="p-6 h-full overflow-y-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    어떤 도움이 필요하신가요?
                                </h3>
                                <p className="text-gray-600">
                                    원하는 AI 기능을 선택하여 시작하세요
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {availableFunctions.map((func) => (
                                    <button
                                        key={func.id}
                                        onClick={() => handleFunctionSelect(func.id)}
                                        className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={cn(
                                                "p-3 rounded-lg text-white",
                                                func.color
                                            )}>
                                                <func.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600">
                                                    {func.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {func.description}
                                                </p>
                                                {func.adminOnly && (
                                                    <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                                        관리자 전용
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Chat Interface */
                        <div className="flex flex-col h-full">
                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className={cn(
                                            "w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white mb-4",
                                            selectedFunctionInfo?.color
                                        )}>
                                            {selectedFunctionInfo?.icon && (
                                                <selectedFunctionInfo.icon className="w-8 h-8" />
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {selectedFunctionInfo?.name}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {selectedFunctionInfo?.description}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            무엇을 도와드릴까요? 메시지를 입력해주세요.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={cn(
                                                    "flex",
                                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[80%] p-4 rounded-lg",
                                                        message.role === 'user'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-800'
                                                    )}
                                                >
                                                    <p className="whitespace-pre-wrap">{message.content}</p>
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
                            <div className="border-t border-gray-200 p-4">
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
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AISearchModal; 