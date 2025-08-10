import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import {
    Mic,
    MicOff,
    Volume2,
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
        speak,
        stopSpeaking,
        clearError,
        escalateToHuman
    } = useVoice();

    const [textInput, setTextInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<Array<{
        type: 'user' | 'agent';
        text: string;
        timestamp: Date;
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

    useEffect(() => {
        if (lastResponse?.response_text) {
            setConversationHistory(prev => [
                ...prev,
                {
                    type: 'agent',
                    text: lastResponse.response_text,
                    timestamp: new Date()
                }
            ]);
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

    // Persist conversation
    useEffect(() => {
        const toSave = conversationHistory.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
        localStorage.setItem('voiceAgentConversation', JSON.stringify(toSave));
    }, [conversationHistory]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isVoiceModalOpen) {
                closeVoiceModal();
            }
        };

        if (isVoiceModalOpen) {
            document.addEventListener('keydown', handleEscKey);
            return () => document.removeEventListener('keydown', handleEscKey);
        }
    }, [isVoiceModalOpen, closeVoiceModal]);

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            await processTextInput(textInput.trim());
            setTextInput('');
        }
    };

    const handleVoiceToggle = async () => {
        if (isListening) {
            stopListening();
        } else {
            await startListening();
        }
    };

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        setShowSettings(false);
    };

    const quickActions = [
        {
            label: 'Tìm sản phẩm',
            action: () => processTextInput('Tôi muốn tìm sản phẩm mô hình figure')
        },
        {
            label: 'Kiểm tra đơn hàng',
            action: () => processTextInput('Kiểm tra trạng thái đơn hàng của tôi')
        },
        {
            label: 'Gợi ý sản phẩm',
            action: () => processTextInput('Gợi ý cho tôi một số sản phẩm hay')
        },
        {
            label: 'Hỗ trợ tùy chỉnh',
            action: () => processTextInput('Tôi cần hỗ trợ tùy chỉnh sản phẩm')
        }
    ];

    if (!isVoiceModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Backdrop only for the panel area when open on mobile */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            {/* Messenger-like floating panel */}
            <div className="pointer-events-auto fixed bottom-6 right-6 w-full sm:w-96 max-w-[95vw] shadow-2xl">
                <div
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[70vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Trợ lý ảo Figuro</h3>
                                    <p className="text-xs text-gray-500">
                                        {isListening ? 'Đang nghe...' :
                                            isProcessing ? 'Đang xử lý...' :
                                                isSpeaking ? 'Đang nói...' : 'Sẵn sàng hỗ trợ'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={closeVoiceModal}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        {showSettings && (
                            <div className="p-4 bg-gray-50 border-b">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngôn ngữ
                                        </label>
                                        <select
                                            value={language}
                                            onChange={(e) => handleLanguageChange(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                            {conversationHistory.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
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
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm text-gray-600">
                                                {isProcessing ? 'Đang suy nghĩ...' : 'Đang trả lời...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="flex justify-center">
                                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-sm text-red-700">{error}</span>
                                        <button
                                            onClick={clearError}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {conversationHistory.length <= 1 && (
                            <div className="p-4 border-t bg-gray-50">
                                <p className="text-sm text-gray-600 mb-2">Gợi ý nhanh:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={action.action}
                                            className="p-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                                            disabled={isProcessing || isListening}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 border-t bg-gray-50">
                            <form onSubmit={handleTextSubmit} className="flex items-center space-x-2">
                                <div className="flex-1 relative">
                                    <input
                                        ref={textInputRef}
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Nhập tin nhắn hoặc nói..."
                                        className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        disabled={isProcessing || isListening}
                                    />
                                    {textInput && (
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-700"
                                            disabled={isProcessing || isListening}
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Voice controls */}
                                <div className="flex space-x-1">
                                    {isSupported && (
                                        <button
                                            type="button"
                                            onClick={handleVoiceToggle}
                                            className={`p-2 rounded-md ${isListening
                                                ? 'bg-red-500 text-white'
                                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                }`}
                                            disabled={isProcessing}
                                        >
                                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        </button>
                                    )}

                                    {isSpeaking && (
                                        <button
                                            type="button"
                                            onClick={stopSpeaking}
                                            className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                        >
                                            <VolumeX className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Bottom actions */}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                <button
                                    onClick={escalateToHuman}
                                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <Phone className="w-3 h-3" />
                                    <span>Chuyển sang tư vấn viên</span>
                                </button>

                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                    <HelpCircle className="w-3 h-3" />
                                    <span>AI Assistant</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgentModal;