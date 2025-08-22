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
    product_recommendations?: any[];
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
        chatbot_integration: boolean;
        product_knowledge: boolean;
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
            try {
                this.speechRecognition = new SpeechRecognition();
                this.speechRecognition.continuous = false;
                this.speechRecognition.interimResults = false;
                this.speechRecognition.lang = 'vi-VN';

                // Test if speech recognition actually works
                this.speechRecognition.onerror = (event: any) => {
                    if (event.error === 'not-allowed') {
                        console.warn('Microphone access denied');
                        this.isSupported = false;
                    }
                };

                this.isSupported = true;
                console.log('Speech Recognition API initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Speech Recognition:', error);
                this.isSupported = false;
            }
        } else {
            console.warn('Speech Recognition API not supported in this browser');
            this.isSupported = false;
        }
    }

    // Check if voice features are supported
    public isVoiceSupported(): boolean {
        // Additional check for microphone permissions
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('Media devices not supported');
            return false;
        }

        return this.isSupported;
    }

    // Check microphone permissions
    public async checkMicrophonePermission(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            return false;
        }
    }

    // Start listening for voice input with better error handling
    public async startListening(
        onResult: (transcript: string) => void,
        onError: (error: string) => void,
        language: string = 'vi-VN'
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Check if speech recognition is available
            if (!this.speechRecognition) {
                const errorMsg = 'Voice recognition không khả dụng trong browser này. Hãy sử dụng text input.';
                onError(errorMsg);
                reject(new Error(errorMsg));
                return;
            }

            // Check microphone permissions
            const hasPermission = await this.checkMicrophonePermission();
            if (!hasPermission) {
                const errorMsg = 'Cần cấp quyền microphone để sử dụng voice input.';
                onError(errorMsg);
                reject(new Error(errorMsg));
                return;
            }

            if (this.isListening) {
                reject(new Error('Already listening'));
                return;
            }

            try {
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
                    let errorMessage = 'Speech recognition error';

                    switch (event.error) {
                        case 'not-allowed':
                            errorMessage = 'Microphone access bị từ chối. Hãy cấp quyền microphone.';
                            break;
                        case 'no-speech':
                            errorMessage = 'Không nghe thấy giọng nói. Hãy thử lại.';
                            break;
                        case 'audio-capture':
                            errorMessage = 'Không thể truy cập microphone. Hãy kiểm tra thiết bị.';
                            break;
                        case 'network':
                            errorMessage = 'Lỗi kết nối mạng. Hãy kiểm tra internet.';
                            break;
                        default:
                            errorMessage = `Lỗi voice recognition: ${event.error}`;
                    }

                    onError(errorMessage);
                    reject(new Error(errorMessage));
                };

                this.speechRecognition.onend = () => {
                    this.isListening = false;
                };

                this.speechRecognition.start();
            } catch (error) {
                this.isListening = false;
                const errorMsg = 'Không thể khởi động voice recognition. Hãy thử lại.';
                onError(errorMsg);
                reject(new Error(errorMsg));
            }
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

    // Process text input via voice agent API
    public async processTextInput(text: string, language: string = 'vi-VN'): Promise<VoiceResponse> {
        try {
            const response = await axios.post(`${VOICE_API_BASE_URL}/voice/process-text`, {
                text,
                language,
                enable_tts: true
            });

            if (response.data) {
                return {
                    transcript: response.data.transcript || text,
                    intent: response.data.intent || 'unknown',
                    entities: response.data.entities || [],
                    confidence: response.data.confidence || 0.8,
                    response_text: response.data.response_text || this.generateResponse('unknown', []),
                    audio_url: response.data.audio_url,
                    processing_time_ms: response.data.processing_time_ms || 100
                };
            }

            // Fallback to local processing if API fails
            return this.processTextLocally(text);
        } catch (error) {
            console.error('Voice agent API error:', error);
            // Fallback to local processing
            return this.processTextLocally(text);
        }
    }

    // Process audio file via voice agent API
    public async processAudioFile(audioBlob: Blob, language: string = 'vi-VN'): Promise<VoiceResponse> {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('language', language);
            formData.append('enable_tts', 'true');

            const response = await axios.post(`${VOICE_API_BASE_URL}/voice/process`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 seconds for audio processing
            });

            if (response.data) {
                return {
                    transcript: response.data.transcript || '',
                    intent: response.data.intent || 'unknown',
                    entities: response.data.entities || [],
                    confidence: response.data.confidence || 0.8,
                    response_text: response.data.response_text || this.generateResponse('unknown', []),
                    audio_url: response.data.audio_url,
                    processing_time_ms: response.data.processing_time_ms || 100
                };
            }

            throw new Error('Invalid response from voice agent API');
        } catch (error) {
            console.error('Audio processing API error:', error);
            throw new Error('Failed to process audio file');
        }
    }

    // Get product recommendations via voice agent
    public async getProductRecommendations(intent?: string, category?: string, priceMax?: number): Promise<any[]> {
        try {
            const params: any = {};
            if (intent) params.intent = intent;
            if (category) params.category = category;
            if (priceMax) params.price_max = priceMax;

            const response = await axios.get(`${VOICE_API_BASE_URL}/voice/products/recommendations`, { params });
            return response.data.recommendations || [];
        } catch (error) {
            console.error('Product recommendations API error:', error);
            return [];
        }
    }

    // Search products via voice agent
    public async searchProductsByVoice(query: string, category?: string, priceRange?: string, limit: number = 10): Promise<any> {
        try {
            const params: any = { query, limit };
            if (category) params.category = category;
            if (priceRange) params.price_range = priceRange;

            const response = await axios.get(`${VOICE_API_BASE_URL}/voice/products/search`, { params });
            return response.data;
        } catch (error) {
            console.error('Voice product search API error:', error);
            return { products: [], total_found: 0 };
        }
    }

    // Get product categories via voice agent
    public async getProductCategories(): Promise<any[]> {
        try {
            const response = await axios.get(`${VOICE_API_BASE_URL}/voice/products/categories`);
            return response.data.categories || [];
        } catch (error) {
            console.error('Product categories API error:', error);
            return [];
        }
    }

    // Query chatbot via voice agent
    public async queryChatbot(text: string, language: string = 'vi-VN'): Promise<any> {
        try {
            const response = await axios.post(`${VOICE_API_BASE_URL}/voice/chatbot/query`, null, {
                params: { text, language }
            });
            return response.data;
        } catch (error) {
            console.error('Chatbot query API error:', error);
            return {};
        }
    }

    // Stream voice response for real-time interaction
    public async streamVoiceResponse(query: string, language: string = 'vi-VN'): Promise<any> {
        try {
            const response = await axios.get(`${VOICE_API_BASE_URL}/voice/stream`, {
                params: { query, language }
            });
            return response.data;
        } catch (error) {
            console.error('Voice streaming API error:', error);
            return {};
        }
    }

    // Check voice agent health with enhanced status
    public async getHealthStatus(): Promise<HealthResponse> {
        try {
            const response = await axios.get(`${VOICE_API_BASE_URL}/voice/health`);
            return {
                status: response.data.status || 'unknown',
                version: response.data.version || '1.0.0',
                services: {
                    speech_recognition: true,
                    text_to_speech: true,
                    nlp_processing: true,
                    chatbot_integration: true,
                    product_knowledge: true
                }
            };
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


    // Fallback local text processing when API is unavailable
    private processTextLocally(text: string): VoiceResponse {
        const intent = this._extractIntent(text);
        const entities = this._extractEntities(text);

        return {
            transcript: text,
            intent,
            entities,
            confidence: 0.6, // Lower confidence for local processing
            response_text: this.generateResponse(intent, entities),
            processing_time_ms: 50
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
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;