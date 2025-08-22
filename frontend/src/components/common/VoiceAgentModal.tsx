import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import {
    Mic,
    MicOff,
    VolumeX,
    Send,
    X,
    MessageCircle,
    Phone,
    Loader2,
    AlertCircle,
    Settings,
    HelpCircle
} from 'lucide-react';

const VoiceAgentModal: React.FC = () => {
    const {
        isVoiceModalOpen,
        closeVoiceModal,
        isListening,
        isProcessing,
        isSpeaking,
        currentTranscript,
        lastResponse,
        error,
        isSupported,
        language,
        setLanguage,
        startListening,
        stopListening,
        processTextInput,
        stopSpeaking,
        clearError,
        searchProductsByVoice,
        getProductCategories,
        escalateToHuman
    } = useVoice();

    const [textInput, setTextInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<Array<{
        type: 'user' | 'agent';
        text: string;
        timestamp: Date;
        products?: any[];
    }>>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory]);

    // Add messages to conversation history
    useEffect(() => {
        if (currentTranscript) {
            setConversationHistory(prev => [
                ...prev,
                {
                    type: 'user',
                    text: currentTranscript,
                    timestamp: new Date()
                }
            ]);
        }
    }, [currentTranscript]);

    // Add messages to conversation history with product recommendations
    useEffect(() => {
        if (lastResponse?.response_text) {
            const messageData: any = {
                type: 'agent',
                text: lastResponse.response_text,
                timestamp: new Date()
            };

            // Add product recommendations if available
            if (lastResponse.product_recommendations && lastResponse.product_recommendations.length > 0) {
                messageData.products = lastResponse.product_recommendations;
            }

            setConversationHistory(prev => [...prev, messageData]);
        }
    }, [lastResponse]);

    // Load persisted conversation when modal opens; add welcome if empty
    useEffect(() => {
        if (isVoiceModalOpen) {
            try {
                const saved = localStorage.getItem('voiceAgentConversation');
                if (saved) {
                    const parsed = JSON.parse(saved) as Array<{ type: 'user' | 'agent'; text: string; timestamp: string }>;
                    setConversationHistory(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
                } else if (conversationHistory.length === 0) {
                    setConversationHistory([{ type: 'agent', text: 'Xin chào! Tôi là trợ lý ảo của Figuro. Tôi có thể giúp bạn tìm sản phẩm, kiểm tra đơn hàng, hoặc tư vấn về mô hình figure. Bạn cần hỗ trợ gì?', timestamp: new Date() }]);
                }
            } catch {
                if (conversationHistory.length === 0) {
                    setConversationHistory([{ type: 'agent', text: 'Xin chào! Tôi là trợ lý ảo của Figuro. Tôi có thể giúp bạn tìm sản phẩm, kiểm tra đơn hàng, hoặc tư vấn về mô hình figure. Bạn cần hỗ trợ gì?', timestamp: new Date() }]);
                }
            }
        }
    }, [isVoiceModalOpen]);

    // Persist conversation to localStorage
    useEffect(() => {
        if (conversationHistory.length > 0) {
            localStorage.setItem('voiceAgentConversation', JSON.stringify(conversationHistory));
        }
    }, [conversationHistory]);

    const handleVoiceToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            processTextInput(textInput.trim());
            setTextInput('');
        }
    };

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
    };

    const quickActions = [
        {
            label: '🔍 Tìm sản phẩm',
            action: () => processTextInput('Tôi muốn tìm sản phẩm figure')
        },
        {
            label: '📦 Kiểm tra đơn hàng',
            action: () => processTextInput('Tôi muốn kiểm tra đơn hàng của mình')
        },
        {
            label: '💡 Tư vấn mua hàng',
            action: () => processTextInput('Tôi cần tư vấn về việc mua figure')
        },
        {
            label: '📂 Xem danh mục',
            action: () => getProductCategories()
        },
        {
            label: '💰 Sản phẩm giá rẻ',
            action: () => searchProductsByVoice('sản phẩm giá rẻ', undefined, 'low')
        },
        {
            label: '🎭 Naruto figures',
            action: () => searchProductsByVoice('Naruto figures', 'Naruto')
        }
    ];

    if (!isVoiceModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeVoiceModal} />
            <div className="relative w-full max-w-2xl animate-fade-in">
                <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-3xl bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 border-b-2 border-neutral-100 dark:border-neutral-700 bg-gradient-to-r from-brand/5 to-accent/5">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-brand/10 rounded-xl">
                                    <MessageCircle className="h-6 w-6 text-brand" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                        Trợ lý ảo Figuro
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                                        {isListening ? 'Đang nghe...' :
                                            isProcessing ? 'Đang xử lý...' :
                                                isSpeaking ? 'Đang nói...' : 'Sẵn sàng hỗ trợ'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200"
                                >
                                    <Settings className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={closeVoiceModal}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 border-b-2 border-neutral-100 dark:border-neutral-700">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Ngôn ngữ
                                    </label>
                                    <select
                                        value={language}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand"
                                    >
                                        <option value="vi-VN">Tiếng Việt</option>
                                        <option value="en-US">English</option>
                                        <option value="ja-JP">日本語</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-neutral-800 max-h-96">

                        {/* Messages with Product Recommendations */}
                        {conversationHistory.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-4 rounded-2xl border-2 ${message.type === 'user'
                                        ? 'border-brand/20 bg-brand/10 text-neutral-900 dark:text-neutral-100'
                                        : 'border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                                        }`}
                                >
                                    <p className="text-sm">{message.text}</p>

                                    {/* Product Recommendations */}
                                    {message.products && message.products.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs font-medium text-brand">🎯 Sản phẩm gợi ý:</p>
                                            {message.products.slice(0, 3).map((product, pIndex) => (
                                                <div key={pIndex} className="p-2 bg-white dark:bg-neutral-600 rounded-lg border border-neutral-200 dark:border-neutral-500">
                                                    <p className="text-xs font-medium">{product.name}</p>
                                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                        {product.category?.name} - {product.price?.toLocaleString('vi-VN')} VND
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-brand/60' : 'text-neutral-500 dark:text-neutral-400'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {(isProcessing || isSpeaking) && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-600">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin-slow">
                                            <Loader2 className="h-4 w-4 text-brand" />
                                        </div>
                                        <span className="text-sm text-neutral-600 dark:text-neutral-300">
                                            {isProcessing ? 'Đang suy nghĩ...' : 'Đang trả lời...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="flex justify-center">
                                <div className="bg-danger/10 border-2 border-danger/20 p-4 rounded-2xl flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-danger" />
                                    <span className="text-sm text-danger">{error}</span>
                                    <button
                                        onClick={clearError}
                                        className="text-danger hover:text-danger-dark"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {conversationHistory.length <= 1 && (
                        <div className="p-4 border-t-2 border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Gợi ý nhanh:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={action.action}
                                        className="p-3 text-sm bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-600 text-left text-neutral-700 dark:text-neutral-200 transition-all duration-200 hover:border-brand/30"
                                        disabled={isProcessing || isListening}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t-2 border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                        <form onSubmit={handleTextSubmit} className="flex items-center space-x-3">
                            <div className="flex-1 relative">
                                <input
                                    ref={textInputRef}
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Nhập tin nhắn hoặc nói..."
                                    className="w-full p-3 pr-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-brand focus:border-brand bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                    disabled={isProcessing || isListening}
                                />
                                {textInput && (
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand hover:text-brand-dark"
                                        disabled={isProcessing || isListening}
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Voice controls */}
                            <div className="flex space-x-2">
                                {isSupported ? (
                                    <button
                                        type="button"
                                        onClick={handleVoiceToggle}
                                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${isListening
                                            ? 'border-danger bg-danger text-white hover:bg-danger-dark'
                                            : 'border-brand bg-brand text-white hover:bg-brand-dark'
                                            }`}
                                        disabled={isProcessing}
                                    >
                                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            disabled
                                            className="p-3 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                            title="Voice không được hỗ trợ trong browser này"
                                        >
                                            <Mic className="h-4 w-4" />
                                        </button>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 max-w-48">
                                            Voice input không khả dụng. Hãy sử dụng text input hoặc thử browser khác (Chrome/Edge).
                                        </div>
                                    </div>
                                )}

                                {isSpeaking && (
                                    <button
                                        type="button"
                                        onClick={stopSpeaking}
                                        className="p-3 bg-neutral-500 text-white rounded-xl border-2 border-neutral-500 hover:bg-neutral-600 transition-colors duration-200"
                                    >
                                        <VolumeX className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Bottom actions */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-neutral-200 dark:border-neutral-600">
                            <button
                                onClick={escalateToHuman}
                                className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-200"
                            >
                                <Phone className="h-4 w-4" />
                                <span>Chuyển sang tư vấn viên</span>
                            </button>

                            <div className="flex items-center space-x-2 text-xs text-neutral-400 dark:text-neutral-500">
                                <HelpCircle className="h-3 w-3" />
                                <span>AI Assistant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgentModal;