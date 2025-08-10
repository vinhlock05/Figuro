import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import {
    Mic,
    MessageCircle,
    Volume2,
    Loader2,
    AlertTriangle
} from 'lucide-react';

const VoiceAgentButton: React.FC = () => {
    const {
        openVoiceModal,
        isListening,
        isProcessing,
        isSpeaking,
        isSupported,
        error
    } = useVoice();

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
                return 'Có lỗi xảy ra - Nhấn để thử lại';
            case 'listening':
                return 'Đang nghe...';
            case 'processing':
                return 'Đang xử lý...';
            case 'speaking':
                return 'Đang trả lời...';
            default:
                return 'Trợ lý ảo Figuro - Nhấn để bắt đầu';
        }
    };

    if (!isSupported) {
        return null; // Don't show button if voice features aren't supported
    }

    return (
        <>
            {/* Main floating button */}
            <div className="fixed bottom-6 right-6 z-40">
                <div className="relative">
                    {/* Tooltip */}
                    {(isHovered || showTooltip) && (
                        <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap transform transition-all duration-200">
                            {showTooltip ? 'Thử trợ lý ảo của chúng tôi!' : getTooltipText()}
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            {showTooltip && (
                                <button
                                    onClick={handleTooltipDismiss}
                                    className="ml-2 text-gray-300 hover:text-white"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )}

                    {/* Activity indicator ring */}
                    {(isListening || isProcessing || isSpeaking) && (
                        <div className="absolute inset-0 rounded-full border-4 border-white animate-ping"></div>
                    )}

                    {/* Main button */}
                    <button
                        onClick={openVoiceModal}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`
                            relative w-14 h-14 rounded-full text-white shadow-lg 
                            transform transition-all duration-200 hover:scale-110 
                            ${getButtonColor()}
                            ${showTooltip ? 'animate-bounce' : ''}
                        `}
                        aria-label="Mở trợ lý ảo"
                    >
                        {getButtonIcon()}

                        {/* Pulse effect for idle state */}
                        {getButtonState() === 'idle' && (
                            <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
                        )}
                    </button>

                    {/* Status indicator */}
                    <div className={`
                        absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                        ${error ? 'bg-red-500' :
                            isListening ? 'bg-green-500' :
                                isProcessing ? 'bg-yellow-500' :
                                    isSpeaking ? 'bg-blue-500' :
                                        'bg-gray-400'}
                    `}>
                    </div>
                </div>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="fixed bottom-6 right-24 z-30">
                <div className={`
                    bg-gray-800 text-white text-xs px-2 py-1 rounded 
                    transition-opacity duration-300
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}>
                    Phím tắt: Ctrl + /
                </div>
            </div>
        </>
    );
};

export default VoiceAgentButton;