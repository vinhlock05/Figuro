import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Types based on actual API responses
export interface Product {
    id: number;
    name: string;
    description: string;
    price: string; // API returns price as string
    imageUrl: string;
    isCustomizable: boolean;
    stock: number;
    productionTimeDays: number | null;
    categoryId: number;
    slug: string | null;

    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        name: string;
        description: string;
    };
}

export interface CustomizationOption {
    id: number;
    productId: number;
    optionType: string;
    optionValue: string;
    priceDelta: string; // Backend returns Decimal as string
}

export interface GroupedCustomizationOptions {
    [optionType: string]: CustomizationOption[];
}

export interface CartItem {
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
    customizations: Record<string, string> | null;
    price: string; // API returns price as string
    updatedAt: string;
    product?: Product; // Will be populated when fetching cart with items
}

export interface Cart {
    id: number;
    userId: number;
    createdAt: string;
    items: CartItem[];
    total?: number; // Calculated on frontend
    itemCount?: number; // Calculated on frontend
}

export interface Order {
    id: string;
    items: CartItem[];
    totalPrice: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentMethod: string;
    shippingAddress: string;
    billingAddress: string;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface WishlistItem {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    isCustomizable: boolean;
    stock: number;
    productionTimeDays: number | null;
    categoryId: number;
    slug: string | null;
    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        name: string;
        description: string;
    };
}

export interface Category {
    id: number;
    name: string;
    description: string;
    _count?: {
        products: number;
    };
}

// Customer Service
class CustomerService {
    private getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }

    // Product APIs
    async getProducts(params?: {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
        sort?: string;
    }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/products`, {
                params,
                headers: this.getAuthHeaders(),
            });

            // Handle the nested data structure with pagination
            const products = response.data.data?.products || [];
            const pagination = response.data.data?.pagination || {};

            return {
                products,
                total: pagination.total || products.length,
                page: pagination.page || 1,
                totalPages: pagination.pages || 1
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            return {
                products: [],
                total: 0,
                page: 1,
                totalPages: 1
            };
        }
    }

    async getProduct(slug: string): Promise<Product> {
        const response = await axios.get(`${API_BASE_URL}/api/products/${slug}`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.product;
    }

    async getCategories(): Promise<Category[]> {
        const response = await axios.get(`${API_BASE_URL}/api/products/categories/all`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.categories || [];
    }

    async searchProducts(query: string, params?: {
        page?: number;
        limit?: number;
        sort?: string;
    }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/products/search`, {
                params: { q: query, ...params },
                headers: this.getAuthHeaders(),
            });

            const products = response.data.data?.products || [];
            const pagination = response.data.data?.pagination || {};

            return {
                products,
                total: pagination.total || products.length,
                page: pagination.page || 1,
                totalPages: pagination.pages || 1
            };
        } catch (error) {
            console.error('Error searching products:', error);
            return {
                products: [],
                total: 0,
                page: 1,
                totalPages: 1
            };
        }
    }

    async getProductSuggestions(query: string): Promise<string[]> {
        const response = await axios.get(`${API_BASE_URL}/api/products/suggestions`, {
            params: { q: query },
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.suggestions || [];
    }

    async getCustomizationOptions(productId: string): Promise<GroupedCustomizationOptions> {
        const response = await axios.get(`${API_BASE_URL}/api/products/${productId}/customizations`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.options || {};
    }

    async calculateCustomizedPrice(productId: string, customizations: Array<{ type: string; value: string }>): Promise<{ price: number }> {
        const response = await axios.post(`${API_BASE_URL}/api/products/${productId}/calculate-price`, {
            customizations,
        }, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data;
    }

    // Cart APIs
    async getCart(): Promise<Cart> {
        const response = await axios.get(`${API_BASE_URL}/api/cart`, {
            headers: this.getAuthHeaders(),
        });

        const cart = response.data.data?.cart;

        // Calculate total and item count
        const total = cart.items?.reduce((sum: number, item: CartItem) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0) || 0;

        const itemCount = cart.items?.length || 0;

        return {
            ...cart,
            total,
            itemCount
        };
    }

    async addToCart(productId: string, quantity: number, customizations?: Array<{ type: string; value: string }>): Promise<Cart> {
        await axios.post(`${API_BASE_URL}/api/cart/add`, {
            productId: parseInt(productId),
            quantity,
            customizations,
        }, {
            headers: this.getAuthHeaders(),
        });

        // After adding item, fetch updated cart
        return this.getCart();
    }

    async updateCartItem(itemId: string, quantity: number, customizations?: Array<{ type: string; value: string }>): Promise<Cart> {
        await axios.put(`${API_BASE_URL}/api/cart/update`, {
            cartItemId: parseInt(itemId),
            quantity,
            customizations,
        }, {
            headers: this.getAuthHeaders(),
        });

        // After updating item, fetch updated cart
        return this.getCart();
    }

    async removeFromCart(itemId: string): Promise<Cart> {
        await axios.delete(`${API_BASE_URL}/api/cart/remove`, {
            data: { cartItemId: parseInt(itemId) },
            headers: this.getAuthHeaders(),
        });

        // After removing item, fetch updated cart
        return this.getCart();
    }

    async clearCart(): Promise<void> {
        await axios.delete(`${API_BASE_URL}/api/cart/clear`, {
            headers: this.getAuthHeaders(),
        });
    }

    // Order APIs
    async getOrders(): Promise<Order[]> {
        const response = await axios.get(`${API_BASE_URL}/api/order`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.orders || [];
    }

    async getOrder(orderId: string): Promise<Order> {
        const response = await axios.get(`${API_BASE_URL}/api/order/${orderId}`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.order;
    }

    async placeOrder(orderData: {
        items: CartItem[];
        shippingAddress: string;
        billingAddress: string;
        paymentMethod: string;
    }): Promise<Order> {
        const response = await axios.post(`${API_BASE_URL}/api/order`, orderData, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.order;
    }

    async createPayment(orderId: string, paymentMethod: string): Promise<{
        success: boolean;
        paymentUrl?: string;
        transactionId?: string;
        error?: string;
    }> {
        const response = await axios.post(`${API_BASE_URL}/api/payment/create`, {
            orderId: parseInt(orderId),
            gateway: paymentMethod,
            returnUrl: `${window.location.origin}/checkout/result?orderId=${orderId}`,
            cancelUrl: `${window.location.origin}/checkout/result?orderId=${orderId}&status=cancelled`,
            description: `Thanh+toan+don+hang+${orderId}`
        }, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data;
    }

    async getPaymentStatus(transactionId: string): Promise<{
        transactionId: string;
        status: 'success' | 'failed' | 'pending';
        amount: number;
        gateway: string;
        paidAt: string | null;
        orderId: number;
        orderStatus: string;
    }> {
        const response = await axios.get(`${API_BASE_URL}/api/payment/status/${transactionId}`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data;
    }

    // Order Tracking
    async trackOrder(orderId: string): Promise<{
        order: Order;
        tracking: {
            status: string;
            location?: string;
            timestamp: string;
            description: string;
        }[];
    }> {
        const response = await axios.get(`${API_BASE_URL}/api/order-tracking/${orderId}`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data;
    }

    // Payment APIs
    async createPaymentIntent(orderId: string, amount: number): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }> {
        const response = await axios.post(`${API_BASE_URL}/api/payments/create-intent`, {
            orderId,
            amount,
        }, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data;
    }

    async confirmPayment(paymentIntentId: string): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await axios.post(`${API_BASE_URL}/api/payments/confirm`, {
            paymentIntentId,
        }, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data;
    }

    // Notification APIs
    async getNotifications(): Promise<{
        id: string;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        read: boolean;
        createdAt: string;
    }[]> {
        const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
            headers: this.getAuthHeaders(),
        });
        return response.data.data?.notifications || [];
    }

    async markNotificationAsRead(notificationId: string): Promise<void> {
        await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
            headers: this.getAuthHeaders(),
        });
    }

    async markAllNotificationsAsRead(): Promise<void> {
        await axios.put(`${API_BASE_URL}/api/notifications/read-all`, {}, {
            headers: this.getAuthHeaders(),
        });
    }

    // Wishlist APIs
    async getWishlist(): Promise<Product[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
                headers: this.getAuthHeaders(),
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            return [];
        }
    }

    async addToWishlist(productId: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/api/wishlist/add`, {
            productId: parseInt(productId),
        }, {
            headers: this.getAuthHeaders(),
        });
    }

    async removeFromWishlist(productId: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, {
            headers: this.getAuthHeaders(),
        });
    }

    async isInWishlist(productId: string): Promise<boolean> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/wishlist/check/${productId}`, {
                headers: this.getAuthHeaders(),
            });
            return response.data.data?.isInWishlist || false;
        } catch (error) {
            console.error('Error checking wishlist status:', error);
            return false;
        }
    }
}

export const customerService = new CustomerService(); 