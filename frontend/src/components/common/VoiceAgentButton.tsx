import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { Mic, Search, Settings, HelpCircle, MessageCircle, Volume2, Loader2, AlertTriangle } from 'lucide-react';
import VoiceProductSearch from './VoiceProductSearch';

const VoiceAgentButton: React.FC = () => {
    const {
        isSupported,
        isListening,
        isProcessing,
        isSpeaking,
        error,
        startListening,
        stopListening,
        openVoiceModal,
        askProductInfo,
        getRecommendations,
        searchProductsByVoice
    } = useVoice();

    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Show tooltip for first-time users
    useEffect(() => {
        const hasSeenTooltip = localStorage.getItem('voiceAgentTooltipSeen');
        if (!hasSeenTooltip) {
            const timer = setTimeout(() => {
                setShowTooltip(true);
            }, 3000); // Show tooltip after 3 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    const handleTooltipDismiss = () => {
        setShowTooltip(false);
        localStorage.setItem('voiceAgentTooltipSeen', 'true');
    };

    const handleVoiceToggle = async () => {
        if (isListening) {
            stopListening();
        } else {
            await startListening();
        }
    };

    const getButtonState = () => {
        if (error) return 'error';
        if (isListening) return 'listening';
        if (isProcessing) return 'processing';
        if (isSpeaking) return 'speaking';
        return 'idle';
    };

    const getButtonIcon = () => {
        const state = getButtonState();
        switch (state) {
            case 'error':
                return <AlertTriangle className="w-6 h-6" />;
            case 'listening':
                return <Mic className="w-6 h-6 animate-pulse" />;
            case 'processing':
                return <Loader2 className="w-6 h-6 animate-spin" />;
            case 'speaking':
                return <Volume2 className="w-6 h-6 animate-pulse" />;
            default:
                return <MessageCircle className="w-6 h-6" />;
        }
    };

    const getButtonColor = () => {
        const state = getButtonState();
        switch (state) {
            case 'error':
                return 'bg-red-500 hover:bg-red-600';
            case 'listening':
                return 'bg-green-500 hover:bg-green-600';
            case 'processing':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'speaking':
                return 'bg-blue-500 hover:bg-blue-600';
            default:
                return 'bg-indigo-500 hover:bg-indigo-600';
        }
    };

    const getTooltipText = () => {
        const state = getButtonState();
        switch (state) {
            case 'error':
                return 'Có lỗi xảy ra - Click để thử lại';
            case 'listening':
                return 'Đang lắng nghe...';
            case 'processing':
                return 'Đang xử lý...';
            case 'speaking':
                return 'Đang trả lời...';
            default:
                return 'Figuro AI Assistant - Click để bắt đầu';
        }
    };

    const quickActions = [
        {
            label: '🔍 Tìm sản phẩm',
            action: () => setShowVoiceSearch(true),
            icon: Search
        },
        {
            label: '💡 Tư vấn mua hàng',
            action: () => askProductInfo('figure anime'),
            icon: HelpCircle
        },
        {
            label: '📂 Gợi ý sản phẩm',
            action: () => getRecommendations(),
            icon: Settings
        },
        {
            label: '🎭 Naruto figures',
            action: () => searchProductsByVoice('Naruto figures', 'Naruto'),
            icon: Mic
        }
    ];

    if (!isSupported) {
        return null;
    }

    return (
        <>
            {/* Main floating button */}
            <div className="fixed bottom-6 right-6 z-40">
                <div className="relative">
                    {/* Tooltip */}
                    {(isHovered || showTooltip) && (
                        <div className="absolute bottom-full mb-3 right-0 bg-neutral-900 text-white text-xs px-3 py-2 rounded-md whitespace-nowrap shadow-lg">
                            <div className="flex items-center space-x-2">
                                <MessageCircle className="h-4 w-4" />
                                <span>{getTooltipText()}</span>
                                <button onClick={handleTooltipDismiss} className="ml-1 text-white/70 hover:text-white">×</button>
                            </div>
                        </div>
                    )}

                    {/* Activity indicator ring */}
                    {(isListening || isProcessing || isSpeaking) && (
                        <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                    )}

                    {/* Main button */}
                    <button
                        onClick={openVoiceModal}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`
                            relative w-14 h-14 rounded-full text-white shadow-xl
                            flex items-center justify-center
                            transition-transform duration-200 hover:scale-110
                            ${getButtonColor()}
                            border border-white/30
                        `}
                        aria-label="Open AI Assistant"
                    >
                        <div className="flex items-center justify-center w-full h-full">
                            {getButtonIcon()}
                        </div>
                    </button>

                    {/* Status indicator */}
                    <div className={`
                        absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white/60 shadow
                        ${error ? 'bg-danger' :
                            isListening ? 'bg-success' :
                                isProcessing ? 'bg-accent' :
                                    isSpeaking ? 'bg-brand' :
                                        'bg-neutral-200'}
                    `} />

                    {/* Quick Actions Menu */}
                    <button
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className="absolute -top-2 -left-2 p-1 bg-neutral-200 dark:bg-neutral-700 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        title="Hành động nhanh"
                    >
                        <Settings className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                    </button>

                    {/* Quick Actions Dropdown */}
                    {showQuickActions && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border-2 border-neutral-200 dark:border-neutral-600 p-2 z-50">
                            <div className="space-y-1">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            action.action();
                                            setShowQuickActions(false);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                    >
                                        <action.icon className="h-4 w-4" />
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-neutral-200 dark:border-neutral-600 my-2"></div>

                            {/* Voice Toggle */}
                            <button
                                onClick={() => {
                                    handleVoiceToggle();
                                    setShowQuickActions(false);
                                }}
                                className="w-full flex items-center space-x-3 p-3 text-left text-sm text-brand hover:bg-brand/10 rounded-lg transition-colors"
                            >
                                <Mic className="h-4 w-4" />
                                <span>{isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="fixed bottom-6 right-28 z-30">
                <div className={`
                    bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs px-3 py-2 rounded-xl 
                    transition-all duration-300 border border-white/10 shadow-lg
                    ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}>
                    <div className="flex items-center space-x-2">
                        <span className="text-purple-300">⌨</span>
                        <span>Ctrl + /</span>
                    </div>
                </div>
            </div>

            {/* Voice Product Search Modal */}
            <VoiceProductSearch
                isOpen={showVoiceSearch}
                onClose={() => setShowVoiceSearch(false)}
            />

            {/* Click outside to close quick actions */}
            {showQuickActions && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowQuickActions(false)}
                />
            )}
        </>
    );
};

export default VoiceAgentButton;