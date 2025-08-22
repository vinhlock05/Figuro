import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { voiceService } from '../services/voiceService';
import type { VoiceResponse } from '../services/voiceService';
import { voiceProductHelpers } from '../services/voiceHelpers';
import { voiceContextService } from '../services/voiceContextService';
import type { VoiceContextData } from '../services/voiceContextService';

interface VoiceContextType {
    // State
    isListening: boolean;
    isProcessing: boolean;
    isSpeaking: boolean;
    isVoiceModalOpen: boolean;
    currentTranscript: string;
    lastResponse: VoiceResponse | null;
    error: string | null;
    isSupported: boolean;
    language: string;

    // Actions
    startListening: () => Promise<void>;
    stopListening: () => void;
    processTextInput: (text: string) => Promise<void>;
    speak: (text: string) => Promise<void>;
    stopSpeaking: () => void;
    openVoiceModal: () => void;
    closeVoiceModal: () => void;
    clearError: () => void;
    setLanguage: (lang: string) => void;

    // Voice Agent specific functions
    askProductInfo: (productName: string) => Promise<void>;
    checkOrderStatus: (orderId?: string) => Promise<void>;
    getRecommendations: (category?: string) => Promise<void>;
    searchProductsByVoice: (query: string, category?: string, priceRange?: string) => Promise<void>;
    getProductCategories: () => Promise<void>;
    queryChatbot: (text: string) => Promise<void>;
    escalateToHuman: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error('useVoice must be used within a VoiceProvider');
    }
    return context;
};

interface VoiceProviderProps {
    children: React.ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [language, setLanguage] = useState('vi-VN');
    const [voiceContext, setVoiceContext] = useState<VoiceContextData | null>(null);

    const loadVoiceContext = useCallback(async () => {
        try {
            const context = await voiceContextService.getVoiceContext();
            setVoiceContext(context);
        } catch (error) {
            console.error('Failed to load voice context:', error);
            // Continue without context - not critical for functionality
        }
    }, []);

    useEffect(() => {
        const checkVoiceSupport = async () => {
            try {
                // Check if voice is supported
                const supported = voiceService.isVoiceSupported();
                setIsSupported(supported);

                if (supported) {
                    // Additional check for microphone permissions
                    const hasPermission = await voiceService.checkMicrophonePermission();
                    if (!hasPermission) {
                        console.warn('Microphone permission not granted');
                        // Still show as supported but with limited functionality
                    }
                }
            } catch (error) {
                console.error('Error checking voice support:', error);
                setIsSupported(false);
            }
        };

        checkVoiceSupport();
    }, []);

    useEffect(() => {
        // Initialize voice context from backend when modal opens
        if (isVoiceModalOpen && !voiceContext) {
            loadVoiceContext();
        }
    }, [isVoiceModalOpen, voiceContext, loadVoiceContext]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const openVoiceModal = useCallback(() => {
        setIsVoiceModalOpen(true);
        setError(null);
        setCurrentTranscript('');
        setLastResponse(null);
    }, []);

    const stopListening = useCallback(() => {
        voiceService.stopListening();
        setIsListening(false);
    }, []);

    const stopSpeaking = useCallback(() => {
        voiceService.stopSpeaking();
        setIsSpeaking(false);
    }, []);

    const closeVoiceModal = useCallback(() => {
        setIsVoiceModalOpen(false);
        stopListening();
        stopSpeaking();
    }, [stopListening, stopSpeaking]);

    const speak = useCallback(async (text: string) => {
        try {
            setIsSpeaking(true);
            await voiceService.speak(text, language);
        } catch (err) {
            // Silent fail; the UI still shows text
        } finally {
            setIsSpeaking(false);
        }
    }, [language]);

    // Handle intent-specific actions
    const handleIntentActions = useCallback(async (response: VoiceResponse) => {
        const { intent, entities } = response;

        try {
            switch (intent) {
                case 'create_order':
                    const productEntity = entities.find(e => e.type === 'product');
                    if (productEntity) {
                        // Search for the product and provide detailed info
                        const searchResult = await voiceProductHelpers.searchProducts(productEntity.value);
                        if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
                            // Navigate to first product found
                            const product = searchResult.data[0];
                            window.location.href = `/products/${product.slug || product.id}`;
                        } else {
                            // Navigate to search page
                            window.location.href = `/products?search=${encodeURIComponent(productEntity.value)}`;
                        }
                    } else {
                        window.location.href = '/products';
                    }
                    break;

                case 'check_order_status':
                    // Navigate to orders page
                    window.location.href = '/orders';
                    break;

                case 'get_product_info':
                    const productInfoEntity = entities.find(e => e.type === 'product');
                    if (productInfoEntity) {
                        // Search for product info
                        const productResult = await voiceProductHelpers.searchProducts(productInfoEntity.value);
                        if (productResult.success && productResult.data && productResult.data.length > 0) {
                            const product = productResult.data[0];
                            window.location.href = `/products/${product.slug || product.id}`;
                        } else {
                            window.location.href = `/products?search=${encodeURIComponent(productInfoEntity.value)}`;
                        }
                    } else {
                        window.location.href = '/products';
                    }
                    break;

                case 'greeting':
                    // Stay on current page, just provide greeting response
                    break;

                case 'goodbye':
                    // Close voice modal after a short delay
                    setTimeout(() => {
                        closeVoiceModal();
                    }, 2000);
                    break;

                default:
                    // For unknown intents, provide help
                    break;
            }
        } catch (error) {
            console.error('Error handling intent action:', error);
        }
    }, [closeVoiceModal]);

    const processTextInput = useCallback(async (text: string) => {
        try {
            setError(null);
            setIsProcessing(true);
            setCurrentTranscript(text);

            const response = await voiceService.processTextInput(text, language);
            setLastResponse(response);

            // Save conversation to backend context
            if (voiceContext?.sessionId) {
                try {
                    await voiceContextService.updateVoiceContext(
                        voiceContext.sessionId,
                        text,
                        response.response_text || '',
                        response.intent,
                        response.entities
                    );
                } catch (contextError) {
                    console.error('Failed to save conversation context:', contextError);
                    // Don't fail the main flow if context saving fails
                }
            }

            if (response.audio_url) {
                try {
                    await voiceService.playAudio(response.audio_url);
                } catch {
                    if (response.response_text) {
                        await speak(response.response_text);
                    }
                }
            } else if (response.response_text) {
                await speak(response.response_text);
            }

            // Handle specific intents
            await handleIntentActions(response);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process input');
        } finally {
            setIsProcessing(false);
        }
    }, [language, speak, handleIntentActions, voiceContext]);

    const startListening = useCallback(async () => {
        try {
            setError(null);
            setIsListening(true);
            setCurrentTranscript('');

            await voiceService.startListening(
                (transcript) => {
                    setCurrentTranscript(transcript);
                    setIsListening(false);
                    // Auto-process the transcript
                    processTextInput(transcript);
                },
                (error) => {
                    setError(error);
                    setIsListening(false);

                    // If microphone permission denied, show helpful message
                    if (error.includes('cấp quyền microphone')) {
                        setError('Để sử dụng voice input, hãy: 1) Click vào icon microphone trên thanh địa chỉ 2) Chọn "Allow" 3) Refresh trang');
                    }
                },
                language
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
            setError(errorMessage);
            setIsListening(false);
        }
    }, [language, processTextInput]);

    // Keyboard shortcut handler (Ctrl + /)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === '/') {
                event.preventDefault();
                if (isVoiceModalOpen) {
                    closeVoiceModal();
                } else {
                    openVoiceModal();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVoiceModalOpen, openVoiceModal, closeVoiceModal]);

    // Voice agent specific functions
    const askProductInfo = useCallback(async (productName: string) => {
        const query = `Cho tôi biết thông tin về sản phẩm ${productName}`;
        await processTextInput(query);
    }, [processTextInput]);

    const checkOrderStatus = useCallback(async (orderId?: string) => {
        const query = orderId
            ? `Kiểm tra trạng thái đơn hàng ${orderId}`
            : 'Kiểm tra trạng thái đơn hàng của tôi';
        await processTextInput(query);
    }, [processTextInput]);

    const getRecommendations = useCallback(async (category?: string) => {
        const query = category
            ? `Gợi ý sản phẩm trong danh mục ${category}`
            : 'Gợi ý sản phẩm cho tôi';
        await processTextInput(query);
    }, [processTextInput]);

    const searchProductsByVoice = useCallback(async (query: string, category?: string, priceRange?: string) => {
        try {
            const searchResult = await voiceService.searchProductsByVoice(query, category, priceRange);
            if (searchResult.products && searchResult.products.length > 0) {
                // Navigate to search results or first product
                window.location.href = `/products?search=${encodeURIComponent(query)}`;
            } else {
                await processTextInput(`Tìm kiếm sản phẩm: ${query}`);
            }
        } catch (error) {
            console.error('Voice product search failed:', error);
            await processTextInput(`Tìm kiếm sản phẩm: ${query}`);
        }
    }, [processTextInput]);

    const getProductCategories = useCallback(async () => {
        try {
            const categories = await voiceService.getProductCategories();
            if (categories.length > 0) {
                const categoryNames = categories.map(cat => cat.name).join(', ');
                await processTextInput(`Các danh mục sản phẩm: ${categoryNames}`);
            } else {
                await processTextInput('Xem tất cả danh mục sản phẩm');
            }
        } catch (error) {
            console.error('Failed to get product categories:', error);
            await processTextInput('Xem tất cả danh mục sản phẩm');
        }
    }, [processTextInput]);

    const queryChatbot = useCallback(async (text: string) => {
        try {
            const chatbotResponse = await voiceService.queryChatbot(text, language);
            if (chatbotResponse.response) {
                setLastResponse({
                    transcript: text,
                    intent: 'get_product_info',
                    entities: [],
                    confidence: 0.9,
                    response_text: chatbotResponse.response.response || 'Tôi đã nhận được câu hỏi của bạn.',
                    processing_time_ms: 100
                });
            }
        } catch (error) {
            console.error('Chatbot query failed:', error);
            await processTextInput(text);
        }
    }, [language, processTextInput]);

    const escalateToHuman = useCallback(() => {
        // Navigate to contact/support page
        window.location.href = '/contact';
        closeVoiceModal();
    }, [closeVoiceModal]);

    const contextValue: VoiceContextType = {
        // State
        isListening,
        isProcessing,
        isSpeaking,
        isVoiceModalOpen,
        currentTranscript,
        lastResponse,
        error,
        isSupported,
        language,

        // Actions
        startListening,
        stopListening,
        processTextInput,
        speak,
        stopSpeaking,
        openVoiceModal,
        closeVoiceModal,
        clearError,
        setLanguage,

        // Voice Agent specific functions
        askProductInfo,
        checkOrderStatus,
        getRecommendations,
        searchProductsByVoice,
        getProductCategories,
        queryChatbot,
        escalateToHuman
    };

    return (
        <VoiceContext.Provider value={contextValue}>
            {children}
        </VoiceContext.Provider>
    );
};

export default VoiceProvider;