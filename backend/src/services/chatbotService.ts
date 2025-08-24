import { prisma } from '../lib/prisma';

export interface ChatbotQuery {
    text: string;
    language: string;
    context?: {
        source?: string;
        userId?: number;
        sessionId?: string;
        previousQueries?: string[];
    };
}

export interface ChatbotResponse {
    success: boolean;
    message: string;
    intent?: string;
    entities?: Array<{
        type: string;
        value: string;
        confidence: number;
    }>;
    suggestions?: string[];
    actions?: Array<{
        type: string;
        description: string;
        url?: string;
    }>;
    data?: any;
}

export class ChatbotService {
    /**
     * Process user query and return intelligent response
     */
    async processQuery(query: ChatbotQuery): Promise<ChatbotResponse> {
        try {
            const { text, language, context } = query;
            const lowerText = text.toLowerCase();

            // Detect intent and extract entities
            const intent = this.detectIntent(lowerText, language);
            const entities = this.extractEntities(lowerText, language);

            // Generate response based on intent
            const response = await this.generateResponse(intent, entities, context, language);

            // Log the interaction
            await this.logInteraction(query, intent, response);

            return response;
        } catch (error) {
            console.error('Error processing chatbot query:', error);
            return {
                success: false,
                message: query.language === 'vi-VN'
                    ? 'Xin lỗi, tôi gặp vấn đề khi xử lý yêu cầu của bạn. Vui lòng thử lại.'
                    : 'Sorry, I encountered an issue processing your request. Please try again.',
                suggestions: ['Try again', 'Contact support']
            };
        }
    }

    /**
     * Detect user intent from text
     */
    private detectIntent(text: string, language: string): string {
        if (language === 'vi-VN') {
            // Vietnamese intent detection
            if (this.matchesPattern(text, [
                'mua', 'đặt', 'order', 'thêm vào giỏ', 'add to cart'
            ])) {
                return 'purchase';
            }
            if (this.matchesPattern(text, [
                'tìm kiếm', 'search', 'tìm', 'find', 'sản phẩm', 'product'
            ])) {
                return 'search';
            }
            if (this.matchesPattern(text, [
                'giá', 'price', 'bao nhiêu', 'cost'
            ])) {
                return 'price_inquiry';
            }
            if (this.matchesPattern(text, [
                'trạng thái', 'status', 'đơn hàng', 'order'
            ])) {
                return 'order_status';
            }
            if (this.matchesPattern(text, [
                'hủy', 'cancel', 'bỏ', 'delete'
            ])) {
                return 'cancel';
            }
            if (this.matchesPattern(text, [
                'giúp', 'help', 'hỗ trợ', 'support'
            ])) {
                return 'help';
            }
        } else {
            // English intent detection
            if (this.matchesPattern(text, [
                'buy', 'purchase', 'order', 'add to cart', 'checkout'
            ])) {
                return 'purchase';
            }
            if (this.matchesPattern(text, [
                'search', 'find', 'look for', 'product'
            ])) {
                return 'search';
            }
            if (this.matchesPattern(text, [
                'price', 'cost', 'how much', 'expensive', 'cheap'
            ])) {
                return 'price_inquiry';
            }
            if (this.matchesPattern(text, [
                'status', 'order status', 'track', 'where is'
            ])) {
                return 'order_status';
            }
            if (this.matchesPattern(text, [
                'cancel', 'delete', 'remove', 'stop'
            ])) {
                return 'cancel';
            }
            if (this.matchesPattern(text, [
                'help', 'support', 'assist', 'guide'
            ])) {
                return 'help';
            }
        }

        return 'general';
    }

    /**
     * Extract entities from text
     */
    private extractEntities(text: string, language: string): Array<{ type: string; value: string; confidence: number }> {
        const entities: Array<{ type: string; value: string; confidence: number }> = [];

        // Extract product names
        const productKeywords = ['naruto', 'goku', 'luffy', 'sasuke', 'vegeta', 'ichigo', 'eren'];
        for (const keyword of productKeywords) {
            if (text.includes(keyword)) {
                entities.push({
                    type: 'product',
                    value: keyword,
                    confidence: 0.9
                });
            }
        }

        // Extract categories
        const categoryKeywords = ['anime', 'manga', 'figure', 'mô hình', 'model'];
        for (const keyword of categoryKeywords) {
            if (text.includes(keyword)) {
                entities.push({
                    type: 'category',
                    value: keyword,
                    confidence: 0.8
                });
            }
        }

        // Extract numbers (quantities, prices)
        const numberMatches = text.match(/\d+/g);
        if (numberMatches) {
            entities.push({
                type: 'number',
                value: numberMatches[0],
                confidence: 0.7
            });
        }

        return entities;
    }

    /**
     * Generate response based on intent and entities
     */
    private async generateResponse(
        intent: string,
        entities: Array<{ type: string; value: string; confidence: number }>,
        context?: any,
        language?: string
    ): Promise<ChatbotResponse> {
        const isVietnamese = language === 'vi-VN';

        switch (intent) {
            case 'purchase':
                return {
                    success: true,
                    message: isVietnamese
                        ? 'Tôi sẽ giúp bạn mua sản phẩm. Bạn có thể chọn sản phẩm từ danh sách hoặc tìm kiếm theo tên.'
                        : 'I will help you purchase a product. You can select from our list or search by name.',
                    intent: 'purchase',
                    entities,
                    suggestions: isVietnamese
                        ? ['Xem sản phẩm', 'Tìm kiếm', 'Giỏ hàng']
                        : ['View products', 'Search', 'Cart'],
                    actions: [
                        {
                            type: 'navigate',
                            description: isVietnamese ? 'Xem sản phẩm' : 'View products',
                            url: '/products'
                        }
                    ]
                };

            case 'search':
                return {
                    success: true,
                    message: isVietnamese
                        ? 'Tôi sẽ giúp bạn tìm kiếm sản phẩm. Bạn có thể tìm theo tên, danh mục hoặc từ khóa.'
                        : 'I will help you search for products. You can search by name, category, or keywords.',
                    intent: 'search',
                    entities,
                    suggestions: isVietnamese
                        ? ['Tìm theo tên', 'Tìm theo danh mục', 'Tìm kiếm nâng cao']
                        : ['Search by name', 'Search by category', 'Advanced search'],
                    actions: [
                        {
                            type: 'navigate',
                            description: isVietnamese ? 'Tìm kiếm' : 'Search',
                            url: '/search'
                        }
                    ]
                };

            case 'price_inquiry':
                return {
                    success: true,
                    message: isVietnamese
                        ? 'Tôi sẽ giúp bạn kiểm tra giá sản phẩm. Bạn có thể xem giá chi tiết trên trang sản phẩm.'
                        : 'I will help you check product prices. You can view detailed pricing on the product page.',
                    intent: 'price_inquiry',
                    entities,
                    suggestions: isVietnamese
                        ? ['Xem giá', 'So sánh giá', 'Khuyến mãi']
                        : ['View prices', 'Compare prices', 'Promotions'],
                    actions: [
                        {
                            type: 'navigate',
                            description: isVietnamese ? 'Xem giá' : 'View prices',
                            url: '/products'
                        }
                    ]
                };

            case 'order_status':
                return {
                    success: true,
                    message: isVietnamese
                        ? 'Tôi sẽ giúp bạn kiểm tra trạng thái đơn hàng. Bạn có thể xem tất cả đơn hàng trong tài khoản.'
                        : 'I will help you check your order status. You can view all orders in your account.',
                    intent: 'order_status',
                    entities,
                    suggestions: isVietnamese
                        ? ['Xem đơn hàng', 'Theo dõi đơn hàng', 'Liên hệ hỗ trợ']
                        : ['View orders', 'Track orders', 'Contact support'],
                    actions: [
                        {
                            type: 'navigate',
                            description: isVietnamese ? 'Đơn hàng của tôi' : 'My orders',
                            url: '/orders'
                        }
                    ]
                };

            case 'cancel':
                return {
                    success: true,
                    message: isVietnamese
                        ? 'Tôi hiểu bạn muốn hủy. Bạn có thể hủy đơn hàng hoặc xóa sản phẩm khỏi giỏ hàng.'
                        : 'I understand you want to cancel. You can cancel orders or remove items from cart.',
                    intent: 'cancel',
                    entities,
                    suggestions: isVietnamese
                        ? ['Hủy đơn hàng', 'Xóa giỏ hàng', 'Liên hệ hỗ trợ']
                        : ['Cancel order', 'Clear cart', 'Contact support'],
                    actions: [
                        {
                            type: 'navigate',
                            description: isVietnamese ? 'Đơn hàng của tôi' : 'My orders',
                            url: '/orders'
                        }
                    ]
                };

            case 'help':
                return {
                    success: true,
                    message: isVietnamese
                        ? 'Tôi ở đây để giúp bạn! Bạn có thể hỏi về sản phẩm, đơn hàng, hoặc bất kỳ vấn đề nào khác.'
                        : 'I am here to help you! You can ask about products, orders, or any other issues.',
                    intent: 'help',
                    entities,
                    suggestions: isVietnamese
                        ? ['Hướng dẫn sử dụng', 'Liên hệ hỗ trợ', 'FAQ']
                        : ['User guide', 'Contact support', 'FAQ'],
                    actions: [
                        {
                            type: 'navigate',
                            description: isVietnamese ? 'Hỗ trợ' : 'Support',
                            url: '/support'
                        }
                    ]
                };

            default:
                return {
                    success: true,
                    message: isVietnamese
                        ? 'Xin chào! Tôi có thể giúp bạn tìm kiếm sản phẩm, đặt hàng, hoặc kiểm tra trạng thái đơn hàng. Bạn cần gì?'
                        : 'Hello! I can help you search for products, place orders, or check order status. What do you need?',
                    intent: 'general',
                    entities,
                    suggestions: isVietnamese
                        ? ['Tìm sản phẩm', 'Đặt hàng', 'Kiểm tra đơn hàng']
                        : ['Search products', 'Place order', 'Check order status'],
                    actions: [
                        {
                            type: 'navigate',
                            description: isVietnamese ? 'Khám phá sản phẩm' : 'Explore products',
                            url: '/products'
                        }
                    ]
                };
        }
    }

    /**
     * Check if text matches any pattern
     */
    private matchesPattern(text: string, patterns: string[]): boolean {
        return patterns.some(pattern => text.includes(pattern));
    }

    /**
     * Log chatbot interaction for analytics
     */
    private async logInteraction(
        query: ChatbotQuery,
        intent: string,
        response: ChatbotResponse
    ): Promise<void> {
        try {
            // You can implement logging to database or analytics service here
            console.log('Chatbot interaction logged', {
                userId: query.context?.userId,
                sessionId: query.context?.sessionId,
                text: query.text,
                language: query.language,
                intent,
                responseSuccess: response.success
            });
        } catch (error) {
            console.error('Error logging chatbot interaction:', error);
        }
    }
}

export const chatbotService = new ChatbotService();
