import { customerService } from './customerService';
import type { Product, Order } from './customerService';

/**
 * Voice-specific helper functions for interacting with the customer service
 * These functions are optimized for voice interactions and provide contextual responses
 */

export interface VoiceResponse {
    success: boolean;
    message: string;
    data?: any;
    suggestedActions?: string[];
}

// Product search and recommendations for voice
export const voiceProductHelpers = {
    // Search products by voice query
    async searchProducts(query: string): Promise<VoiceResponse> {
        try {
            const products = await customerService.getProducts({
                search: query,
                limit: 5 // Limit for voice responses
            });

            if (products.products.length === 0) {
                return {
                    success: false,
                    message: `Không tìm thấy sản phẩm nào với từ khóa "${query}". Bạn có thể thử tìm kiếm với từ khóa khác.`,
                    suggestedActions: [
                        'Thử tìm kiếm với tên nhân vật khác',
                        'Duyệt qua danh mục sản phẩm',
                        'Xem sản phẩm phổ biến'
                    ]
                };
            }

            const productList = products.products.map((p: Product) => p.name).join(', ');
            return {
                success: true,
                message: `Tìm thấy ${products.products.length} sản phẩm: ${productList}. Bạn muốn xem chi tiết sản phẩm nào?`,
                data: products.products,
                suggestedActions: products.products.map((p: Product) => `Xem chi tiết ${p.name}`)
            };
        } catch (error) {
            return {
                success: false,
                message: 'Có lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại sau.',
                suggestedActions: ['Thử lại tìm kiếm', 'Duyệt danh mục sản phẩm']
            };
        }
    },

    // Get product recommendations
    async getRecommendations(category?: string): Promise<VoiceResponse> {
        try {
            const products = await customerService.getProducts({
                category: category,
                limit: 3,
                sort: 'popular' // Get popular products
            });

            if (products.products.length === 0) {
                return {
                    success: false,
                    message: category
                        ? `Hiện tại chưa có sản phẩm nào trong danh mục ${category}.`
                        : 'Hiện tại chưa có sản phẩm nào để gợi ý.',
                    suggestedActions: ['Xem tất cả danh mục', 'Tìm kiếm sản phẩm khác']
                };
            }

            const recommendations = products.products.map((p: Product) =>
                `${p.name} với giá ${formatPrice(p.price)}`
            ).join(', ');

            return {
                success: true,
                message: category
                    ? `Gợi ý sản phẩm trong danh mục ${category}: ${recommendations}`
                    : `Gợi ý sản phẩm cho bạn: ${recommendations}`,
                data: products.products,
                suggestedActions: ['Thêm vào giỏ hàng', 'Xem chi tiết sản phẩm', 'Tìm sản phẩm khác']
            };
        } catch (error) {
            return {
                success: false,
                message: 'Không thể tải gợi ý sản phẩm. Vui lòng thử lại.',
                suggestedActions: ['Thử lại', 'Tìm kiếm thủ công']
            };
        }
    },

    // Get product details by name
    async getProductInfo(productName: string): Promise<VoiceResponse> {
        try {
            const products = await customerService.getProducts({
                search: productName,
                limit: 1
            });

            if (products.products.length === 0) {
                return {
                    success: false,
                    message: `Không tìm thấy sản phẩm "${productName}". Bạn có thể nói rõ hơn tên sản phẩm?`,
                    suggestedActions: ['Thử tên khác', 'Tìm kiếm tương tự', 'Xem danh mục']
                };
            }

            const product = products.products[0];
            const message = `${product.name}: ${product.description || 'Mô hình figure chất lượng cao'}. ` +
                `Giá: ${formatPrice(product.price)}. ` +
                `${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}. ` +
                `Bạn có muốn thêm vào giỏ hàng không?`;

            return {
                success: true,
                message,
                data: product,
                suggestedActions: [
                    'Thêm vào giỏ hàng',
                    'Xem tùy chọn tùy chỉnh',
                    'So sánh với sản phẩm khác'
                ]
            };
        } catch (error) {
            return {
                success: false,
                message: 'Không thể tải thông tin sản phẩm. Vui lòng thử lại.',
                suggestedActions: ['Thử lại', 'Tìm sản phẩm khác']
            };
        }
    }
};

// Order management for voice
export const voiceOrderHelpers = {
    // Check order status
    async checkOrderStatus(orderId?: string): Promise<VoiceResponse> {
        try {
            if (orderId) {
                // Check specific order
                const order = await customerService.getOrder(orderId);
                const statusText = getOrderStatusText(order.status);

                return {
                    success: true,
                    message: `Đơn hàng ${orderId} đang ở trạng thái: ${statusText}. ` +
                        `Tổng giá trị: ${formatPrice(order.totalPrice)}. ` +
                        `${getOrderStatusDescription(order.status)}`,
                    data: order,
                    suggestedActions: getOrderActions(order.status)
                };
            } else {
                // Get recent orders
                const orders = await customerService.getOrders();

                if (orders.length === 0) {
                    return {
                        success: false,
                        message: 'Bạn chưa có đơn hàng nào. Bạn có muốn mua sắm không?',
                        suggestedActions: ['Xem sản phẩm', 'Tìm kiếm sản phẩm', 'Xem khuyến mãi']
                    };
                }

                const recentOrder = orders[0];
                const statusText = getOrderStatusText(recentOrder.status);

                return {
                    success: true,
                    message: `Đơn hàng gần nhất ${recentOrder.id} đang ở trạng thái: ${statusText}. ` +
                        `Bạn có ${orders.length} đơn hàng. Muốn xem chi tiết đơn hàng nào?`,
                    data: orders.slice(0, 3), // Take only first 3 for voice response
                    suggestedActions: [
                        'Xem chi tiết đơn hàng',
                        'Theo dõi giao hàng',
                        'Xem tất cả đơn hàng'
                    ]
                };
            }
        } catch (error) {
            return {
                success: false,
                message: orderId
                    ? `Không tìm thấy đơn hàng ${orderId}. Vui lòng kiểm tra lại mã đơn hàng.`
                    : 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.',
                suggestedActions: ['Thử lại', 'Xem đơn hàng trên trang web']
            };
        }
    },

    // Get order tracking info
    async trackOrder(orderId: string): Promise<VoiceResponse> {
        try {
            const order = await customerService.getOrder(orderId);
            const trackingInfo = getTrackingInfo(order);

            return {
                success: true,
                message: trackingInfo,
                data: order,
                suggestedActions: ['Xem chi tiết vận chuyển', 'Liên hệ hỗ trợ']
            };
        } catch (error) {
            return {
                success: false,
                message: `Không thể theo dõi đơn hàng ${orderId}. Vui lòng thử lại.`,
                suggestedActions: ['Thử lại', 'Liên hệ hỗ trợ']
            };
        }
    }
};

// Cart management for voice
export const voiceCartHelpers = {
    // Add product to cart via voice
    async addToCart(productName: string, quantity: number = 1): Promise<VoiceResponse> {
        try {
            const products = await customerService.getProducts({
                search: productName,
                limit: 1
            });

            if (products.products.length === 0) {
                return {
                    success: false,
                    message: `Không tìm thấy sản phẩm "${productName}". Bạn có thể nói rõ hơn tên sản phẩm?`,
                    suggestedActions: ['Thử tên khác', 'Tìm kiếm sản phẩm']
                };
            }

            const product = products.products[0];

            if (product.stock < quantity) {
                return {
                    success: false,
                    message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm. Bạn có muốn thêm số lượng có sẵn không?`,
                    suggestedActions: [`Thêm ${product.stock} sản phẩm`, 'Tìm sản phẩm khác']
                };
            }

            await customerService.addToCart(product.id.toString(), quantity);

            return {
                success: true,
                message: `Đã thêm ${quantity} ${product.name} vào giỏ hàng với giá ${formatPrice(parseFloat(product.price) * quantity)}.`,
                data: product,
                suggestedActions: ['Xem giỏ hàng', 'Tiếp tục mua sắm', 'Thanh toán ngay']
            };
        } catch (error) {
            return {
                success: false,
                message: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.',
                suggestedActions: ['Thử lại', 'Xem giỏ hàng']
            };
        }
    },

    // View cart summary
    async getCartSummary(): Promise<VoiceResponse> {
        try {
            const cart = await customerService.getCart();

            if (cart.items.length === 0) {
                return {
                    success: false,
                    message: 'Giỏ hàng của bạn đang trống. Bạn có muốn mua sắm không?',
                    suggestedActions: ['Xem sản phẩm', 'Tìm kiếm sản phẩm']
                };
            }

            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            const productList = cart.items.map(item =>
                `${item.quantity} ${item.product?.name || 'Sản phẩm'}`
            ).join(', ');

            return {
                success: true,
                message: `Giỏ hàng có ${totalItems} sản phẩm: ${productList}. ` +
                    `Tổng tiền: ${formatPrice(cart.total || 0)}. Bạn có muốn thanh toán không?`,
                data: cart,
                suggestedActions: ['Thanh toán', 'Chỉnh sửa giỏ hàng', 'Tiếp tục mua sắm']
            };
        } catch (error) {
            return {
                success: false,
                message: 'Không thể tải giỏ hàng. Vui lòng thử lại.',
                suggestedActions: ['Thử lại', 'Xem trang giỏ hàng']
            };
        }
    }
};

// Helper functions
function formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice);
}

function getOrderStatusText(status: string): string {
    const statusMap: Record<string, string> = {
        'pending': 'đang chờ xử lý',
        'confirmed': 'đã xác nhận',
        'processing': 'đang xử lý',
        'shipped': 'đang giao hàng',
        'delivered': 'đã giao hàng',
        'cancelled': 'đã hủy',
        'returned': 'đã trả hàng'
    };
    return statusMap[status] || status;
}

function getOrderStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
        'pending': 'Đơn hàng đang được xem xét và sẽ được xác nhận sớm.',
        'confirmed': 'Đơn hàng đã được xác nhận và đang chuẩn bị.',
        'processing': 'Đơn hàng đang được đóng gói.',
        'shipped': 'Đơn hàng đang trên đường giao đến bạn.',
        'delivered': 'Đơn hàng đã được giao thành công.',
        'cancelled': 'Đơn hàng đã bị hủy.',
        'returned': 'Đơn hàng đã được trả lại.'
    };
    return descriptions[status] || '';
}

function getOrderActions(status: string): string[] {
    const actions: Record<string, string[]> = {
        'pending': ['Hủy đơn hàng', 'Xem chi tiết'],
        'confirmed': ['Theo dõi đơn hàng', 'Xem chi tiết'],
        'processing': ['Theo dõi đơn hàng', 'Xem chi tiết'],
        'shipped': ['Theo dõi vận chuyển', 'Xem chi tiết'],
        'delivered': ['Đánh giá sản phẩm', 'Mua lại'],
        'cancelled': ['Đặt hàng lại', 'Xem sản phẩm khác'],
        'returned': ['Đặt hàng lại', 'Liên hệ hỗ trợ']
    };
    return actions[status] || ['Xem chi tiết'];
}

function getTrackingInfo(order: Order): string {
    const status = getOrderStatusText(order.status);
    // Order interface doesn't have estimatedDelivery, so we'll create a simple estimate based on status
    let estimatedDelivery = 'chưa xác định';
    if (order.status === 'confirmed' || order.status === 'processing') {
        estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'); // 3 days
    } else if (order.status === 'shipped') {
        estimatedDelivery = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'); // 1 day
    }

    return `Đơn hàng ${order.id} hiện tại ${status}. ` +
        `Dự kiến giao hàng: ${estimatedDelivery}. ` +
        getOrderStatusDescription(order.status);
}

export default {
    voiceProductHelpers,
    voiceOrderHelpers,
    voiceCartHelpers
};