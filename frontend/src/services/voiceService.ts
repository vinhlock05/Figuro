import axios from 'axios';

// Voice Agent API Configuration
const VOICE_API_BASE_URL = import.meta.env.VITE_AGENT_API_BASE_URL || 'http://localhost:8000';

// Types for Voice Agent
export interface VoiceProcessRequest {
    language?: 'vi-VN' | 'en-US' | 'ja-JP';
    enable_tts?: boolean;
}

export interface Entity {
    type: string;
    value: string;
    confidence: number;
}

export interface VoiceResponse {
    transcript: string;
    intent: 'create_order' | 'cancel_order' | 'check_order_status' | 'get_product_info' | 'greeting' | 'goodbye' | 'unknown';
    entities: Entity[];
    confidence: number;
    response_text: string;
    audio_url?: string;
    processing_time_ms: number;
}

export interface TTSRequest {
    text: string;
    language?: 'vi-VN' | 'en-US' | 'ja-JP';
    voice_speed?: number;
}

export interface HealthResponse {
    status: string;
    version: string;
    services: {
        speech_recognition: boolean;
        text_to_speech: boolean;
        nlp_processing: boolean;
    };
}

export interface SupportedLanguage {
    code: string;
    name: string;
}

// Browser Speech Recognition Types
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

class VoiceService {
    private speechRecognition: any = null;
    private speechSynthesis: SpeechSynthesis = window.speechSynthesis;
    private isListening: boolean = false;
    private isSupported: boolean = false;
    private intent_patterns: Record<string, string[]> = {};
    private entity_patterns: Record<string, string[]> = {};

    constructor() {
        this.initializeSpeechRecognition();
        this.setupPatterns();
    }

    private setupPatterns(): void {
        // Intent patterns for Vietnamese
        this.intent_patterns = {
            'create_order': [
                'muốn.*đặt.*mô hình',
                'muốn.*mua.*figure',
                'đặt.*hàng',
                'mua.*sản phẩm',
                'thêm.*vào.*giỏ'
            ],
            'cancel_order': [
                'hủy.*đơn.*hàng',
                'cancel.*order',
                'không.*muốn.*nữa',
                'bỏ.*đặt.*hàng'
            ],
            'check_order_status': [
                'kiểm tra.*đơn.*hàng',
                'trạng thái.*đơn',
                'đơn.*hàng.*thế.*nào',
                'order.*status'
            ],
            'get_product_info': [
                'thông tin.*sản phẩm',
                'chi tiết.*mô hình',
                'giá.*bao nhiêu',
                'product.*info'
            ],
            'greeting': [
                'xin chào',
                'hello',
                'hi',
                'chào'
            ],
            'goodbye': [
                'tạm biệt',
                'goodbye',
                'bye',
                'cảm ơn'
            ]
        };

        // Entity extraction patterns
        this.entity_patterns = {
            'product': [
                '(?:mô hình|figure|model)\\s+([A-Za-z\\s]+)',
                '(Naruto|Goku|Luffy|One Piece|Dragon Ball)',
                '(?:anime|manga)\\s+([A-Za-z\\s]+)'
            ],
            'quantity': [
                '(\\d+)\\s+(?:cái|chiếc|mô hình)',
                '(?:một|hai|ba|bốn|năm)\\s+(?:cái|chiếc)'
            ],
            'color': [
                '(?:màu\\s+)?(đỏ|xanh|vàng|đen|trắng|hồng|tím|cam)'
            ]
        };
    }

    private initializeSpeechRecognition(): void {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'vi-VN';
            this.isSupported = true;
        } else {
            console.warn('Speech Recognition API not supported in this browser - enabling text-only mode');
            // Enable text-only mode for testing/demo
            this.isSupported = true; // Allow voice agent to work with text input only
        }
    }

    // Check if voice features are supported
    public isVoiceSupported(): boolean {
        return this.isSupported;
    }

    // Start listening for voice input
    public startListening(
        onResult: (transcript: string) => void,
        onError: (error: string) => void,
        language: string = 'vi-VN'
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.speechRecognition) {
                // For browsers without speech recognition, show helpful message
                onError('Voice recognition không khả dụng. Hãy sử dụng text input.');
                reject(new Error('Speech recognition not supported'));
                return;
            }

            if (this.isListening) {
                reject(new Error('Already listening'));
                return;
            }

            this.speechRecognition.lang = language;
            this.isListening = true;

            this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript);
                this.isListening = false;
                resolve();
            };

            this.speechRecognition.onerror = (event: any) => {
                this.isListening = false;
                onError(`Speech recognition error: ${event.error}`);
                reject(new Error(event.error));
            };

            this.speechRecognition.onend = () => {
                this.isListening = false;
            };

            this.speechRecognition.start();
        });
    }

    // Stop listening
    public stopListening(): void {
        if (this.speechRecognition && this.isListening) {
            this.speechRecognition.stop();
            this.isListening = false;
        }
    }

    // Check if currently listening
    public getIsListening(): boolean {
        return this.isListening;
    }

    // Process voice input through the voice agent API
    public async processVoiceInput(
        audioBlob: Blob,
        language: string = 'vi-VN',
        enableTTS: boolean = true
    ): Promise<VoiceResponse> {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice_input.wav');
            formData.append('language', language);
            formData.append('enable_tts', enableTTS.toString());

            const response = await axios.post(`${VOICE_API_BASE_URL}/voice/process`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Voice processing error:', error);
            throw new Error('Failed to process voice input');
        }
    }

    // Process text through voice agent (for typing instead of speaking)
    public async processTextInput(
        text: string,
        language: string = 'vi-VN'
    ): Promise<VoiceResponse> {
        try {
            // Try API first
            const response = await axios.post(`${VOICE_API_BASE_URL}/voice/process-text`, {
                text,
                language,
                enable_tts: true
            });

            const apiResult: VoiceResponse = response.data;

            // If API is uncertain, run enhanced client processing and prefer a better intent
            if (apiResult.intent === 'unknown' || (apiResult.confidence !== undefined && apiResult.confidence < 0.6)) {
                try {
                    const enhanced = await this.enhancedTextProcessing(text);
                    // Prefer enhanced if it found a concrete intent
                    if (enhanced.intent !== 'unknown') {
                        return { ...enhanced, audio_url: apiResult.audio_url };
                    }
                } catch { }
            }

            return apiResult;
        } catch (error) {
            // Fallback to enhanced processing with customer service integration
            try {
                return await this.enhancedTextProcessing(text);
            } catch (enhancedError) {
                // Final fallback to basic mock processing
                return this.mockTextProcessing(text);
            }
        }
    }

    // Enhanced text processing with voice helpers integration
    private async enhancedTextProcessing(text: string): Promise<VoiceResponse> {
        const normalized = text
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}+/gu, '');
        // Primary extraction with original text to preserve Vietnamese diacritics
        let intent = this._extractIntent(text);
        let entities = this._extractEntities(text);
        // If unknown, retry with normalized text to increase recall
        if (intent === 'unknown') {
            intent = this._extractIntent(normalized);
            if (entities.length === 0) {
                entities = this._extractEntities(normalized);
            }
        }

        // Import voice helpers dynamically to avoid circular dependencies
        const { voiceProductHelpers, voiceOrderHelpers, voiceCartHelpers } = await import('./voiceHelpers');

        let response_text = '';
        let confidence = 0.8;

        try {
            switch (intent) {
                case 'create_order':
                    const productEntity = entities.find((e: Entity) => e.type === 'product');
                    if (productEntity) {
                        const result = await voiceCartHelpers.addToCart(productEntity.value);
                        response_text = result.message;
                        confidence = result.success ? 0.9 : 0.6;
                    } else {
                        response_text = 'Tôi có thể giúp bạn đặt hàng. Bạn muốn mua sản phẩm gì?';
                    }
                    break;

                case 'check_order_status':
                    const result = await voiceOrderHelpers.checkOrderStatus();
                    response_text = result.message;
                    confidence = result.success ? 0.9 : 0.6;
                    break;

                case 'get_product_info':
                    const productName = entities.find((e: Entity) => e.type === 'product')?.value ||
                        text.replace(/.*(?:thông tin|info|chi tiết).*?về\s*/i, '').trim();
                    if (productName) {
                        const productResult = await voiceProductHelpers.getProductInfo(productName);
                        response_text = productResult.message;
                        confidence = productResult.success ? 0.9 : 0.6;
                    } else {
                        const recommendations = await voiceProductHelpers.getRecommendations();
                        response_text = recommendations.message;
                    }
                    break;

                default:
                    response_text = this.generateResponse(intent, entities);
            }
        } catch (error) {
            console.error('Enhanced processing error:', error);
            response_text = this.generateResponse(intent, entities);
        }

        return {
            transcript: text,
            intent,
            entities,
            confidence,
            response_text,
            processing_time_ms: 200
        };
    }

    // Mock text processing when API is not available
    private mockTextProcessing(text: string): VoiceResponse {
        const lowerText = text.toLowerCase();
        let intent: VoiceResponse['intent'] = 'unknown';
        const entities: Entity[] = [];

        // Simple intent detection
        if (lowerText.includes('đặt') || lowerText.includes('mua') || lowerText.includes('order')) {
            intent = 'create_order';
        } else if (lowerText.includes('hủy') || lowerText.includes('cancel')) {
            intent = 'cancel_order';
        } else if (lowerText.includes('kiểm tra') || lowerText.includes('trạng thái') || lowerText.includes('status')) {
            intent = 'check_order_status';
        } else if (lowerText.includes('thông tin') || lowerText.includes('chi tiết') || lowerText.includes('info')) {
            intent = 'get_product_info';
        } else if (lowerText.includes('chào') || lowerText.includes('hello') || lowerText.includes('hi')) {
            intent = 'greeting';
        } else if (lowerText.includes('tạm biệt') || lowerText.includes('bye') || lowerText.includes('goodbye')) {
            intent = 'goodbye';
        }

        // Simple entity extraction
        const productMatch = text.match(/(?:mô hình|figure|model)\s+([A-Za-z\s]+)/i);
        if (productMatch) {
            entities.push({
                type: 'product',
                value: productMatch[1].trim(),
                confidence: 0.8
            });
        }

        return {
            transcript: text,
            intent,
            entities,
            confidence: 0.8,
            response_text: this.generateResponse(intent, entities),
            processing_time_ms: 100
        };
    }

    // Generate response based on intent
    private generateResponse(intent: VoiceResponse['intent'], _entities: Entity[]): string {
        const responses = {
            create_order: "Tôi đã hiểu yêu cầu đặt hàng của bạn. Hãy để tôi giúp bạn tìm sản phẩm phù hợp.",
            cancel_order: "Tôi sẽ giúp bạn hủy đơn hàng. Vui lòng cung cấp mã đơn hàng.",
            check_order_status: "Tôi sẽ kiểm tra trạng thái đơn hàng của bạn. Vui lòng cho biết mã đơn hàng.",
            get_product_info: "Tôi sẽ cung cấp thông tin chi tiết về sản phẩm bạn quan tâm.",
            greeting: "Xin chào! Tôi là trợ lý ảo của Figuro. Tôi có thể giúp gì cho bạn hôm nay?",
            goodbye: "Cảm ơn bạn đã sử dụng dịch vụ. Hẹn gặp lại!",
            unknown: "Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn. Bạn có thể nói rõ hơn được không?"
        };

        return responses[intent] || responses.unknown;
    }

    // Internal method for intent extraction (used by enhanced processing)
    private _extractIntent(text: string): VoiceResponse['intent'] {
        const text_lower = text.toLowerCase();

        for (const [intent, patterns] of Object.entries(this.intent_patterns)) {
            for (const pattern of patterns) {
                if (new RegExp(pattern).test(text_lower)) {
                    return intent as VoiceResponse['intent'];
                }
            }
        }

        // Fallback heuristics to reduce unknown intent rate
        if (/\b(gio|cart|them|add|mua|dat)\b/.test(text_lower)) return 'create_order';
        if (/\b(huy|cancel)\b/.test(text_lower)) return 'cancel_order';
        if (/\b(trang thai|status|don hang|order)\b/.test(text_lower)) return 'check_order_status';
        if (/\b(thong tin|chi tiet|info|gia|product)\b/.test(text_lower)) return 'get_product_info';
        if (/\b(xin chao|chao|hello|hi)\b/.test(text_lower)) return 'greeting';
        if (/\b(tam biet|bye|goodbye)\b/.test(text_lower)) return 'goodbye';
        return 'unknown';
    }

    // Internal method for entity extraction (used by enhanced processing)
    private _extractEntities(text: string): Entity[] {
        const entities: Entity[] = [];
        const text_lower = text.toLowerCase();

        for (const [entity_type, patterns] of Object.entries(this.entity_patterns)) {
            for (const pattern of patterns) {
                const matches = text_lower.matchAll(new RegExp(pattern, 'gi'));
                for (const match of matches) {
                    let value = '';
                    if (match.length > 1) {
                        value = match[1].trim();
                    } else {
                        value = match[0].trim();
                    }

                    if (value) {
                        entities.push({
                            type: entity_type,
                            value: value,
                            confidence: 0.8
                        });
                    }
                }
            }
        }

        // Deduplicate overlapping entities and limit to top 3
        const unique: Record<string, boolean> = {};
        const filtered = entities.filter(e => {
            const key = `${e.type}:${e.value}`;
            if (unique[key]) return false;
            unique[key] = true;
            return true;
        }).slice(0, 3);
        return filtered;
    }

    // Text-to-Speech using browser API - DISABLED FOR BETTER UX
    public async speak(text: string, language: string = 'vi-VN', rate: number = 1.0): Promise<void> {
        // Prefer server-side TTS (gTTS) for natural voice. Fallback to browser TTS if API fails.
        try {
            const audioUrl = await this.textToSpeech({ text, language: language as any, voice_speed: rate });
            await this.playAudio(audioUrl);
        } catch (_e) {
            // Fallback: use browser TTS if available
            await new Promise<void>((resolve) => {
                if (!this.speechSynthesis) {
                    resolve();
                    return;
                }
                this.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = language;
                utterance.rate = rate;
                utterance.onend = () => resolve();
                utterance.onerror = () => resolve();
                this.speechSynthesis.speak(utterance);
            });
        }
    }

    // Stop current speech
    public stopSpeaking(): void {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }

    // Text-to-Speech via API (higher quality)
    public async textToSpeech(request: TTSRequest): Promise<string> {
        try {
            const response = await axios.post(`${VOICE_API_BASE_URL}/voice/text-to-speech`, request);
            return response.data.audio_url;
        } catch (error) {
            console.error('TTS API error:', error);
            throw new Error('Failed to generate speech');
        }
    }

    // Play audio from URL
    public playAudio(audioUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const audio = new Audio(`${VOICE_API_BASE_URL}${audioUrl}`);

            audio.onended = () => resolve();
            audio.onerror = () => reject(new Error('Failed to play audio'));

            audio.play().catch(reject);
        });
    }

    // Get voice agent health status
    public async getHealthStatus(): Promise<HealthResponse> {
        try {
            const response = await axios.get(`${VOICE_API_BASE_URL}/voice/health`);
            return response.data;
        } catch (error) {
            console.error('Health check error:', error);
            throw new Error('Failed to check voice agent health');
        }
    }

    // Get supported languages
    public async getSupportedLanguages(): Promise<SupportedLanguage[]> {
        try {
            const response = await axios.get(`${VOICE_API_BASE_URL}/voice/supported-languages`);
            return response.data.languages;
        } catch (error) {
            console.error('Languages error:', error);
            // Return default languages if API fails
            return [
                { code: 'vi-VN', name: 'Tiếng Việt' },
                { code: 'en-US', name: 'English (US)' },
                { code: 'ja-JP', name: 'Japanese' }
            ];
        }
    }

    // Record audio from microphone
    public async recordAudio(duration: number = 5000): Promise<Blob> {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks: Blob[] = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    stream.getTracks().forEach(track => track.stop());
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    resolve(audioBlob);
                };

                mediaRecorder.onerror = (_event) => {
                    console.error('Recording error:', _event);
                    stream.getTracks().forEach(track => track.stop());
                    reject(new Error('Recording failed'));
                };

                mediaRecorder.start();

                // Stop recording after specified duration
                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                }, duration);

            } catch (error) {
                console.error('Microphone access error:', error);
                reject(new Error('Failed to access microphone'));
            }
        });
    }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;