import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface CustomizationOption {
    id: number;
    productId: number;
    optionType: string;
    optionValue: string;
    priceDelta: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
    createdAt: string;
    updatedAt?: string;
    isCustomizable?: boolean;
    productionTimeDays?: number;
    categoryId?: number;
    slug?: string;
    category: Category;
    customizationOptions: CustomizationOption[];
}

export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Order {
    id: number;
    userId: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    items: OrderItem[];
    shippingAddress: string;
    createdAt: string;
    updatedAt: string;
    user?: User; // Add this line for customer info
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export interface DashboardStats {
    totalUsers: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    recentOrders: Order[];
    topProducts: Product[];
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface PaginatedResult<T> {
    items: T[];
    pagination: Pagination;
}

class AdminService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Product Management
    async createProduct(productData: CreateProductData): Promise<Product> {
        const response = await this.api.post('/api/admin/products', productData);
        return response.data.data.product;
    }

    async updateProduct(id: number, productData: UpdateProductData): Promise<Product> {
        const response = await this.api.put(`/api/admin/products/${id}`, productData);
        return response.data.data.product;
    }

    async deleteProduct(id: number): Promise<void> {
        await this.api.delete(`/api/admin/products/${id}`);
    }

    // User Management
    async updateUserRole(id: number, role: 'admin' | 'customer'): Promise<User> {
        const response = await this.api.put(`/api/admin/users/${id}/role`, { role });
        return response.data.data.user;
    }

    async deleteUser(id: number): Promise<void> {
        await this.api.delete(`/api/admin/users/${id}`);
    }

    // Order Management
    async updateOrderStatus(orderId: number, status: Order['status']): Promise<Order> {
        const response = await this.api.put(`/api/admin/orders/${orderId}/status`, { status });
        return response.data.data.order;
    }

    async getOrderDetails(orderId: number): Promise<Order> {
        const response = await this.api.get(`/api/admin/orders/${orderId}`);
        return response.data.data.order;
    }

    // Dashboard
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await this.api.get('/api/admin/dashboard');
        return response.data.data;
    }

    // Category Management
    public async createCategory(data: any): Promise<Category> {
        const response = await this.api.post('/api/admin/categories', data);
        return response.data.category || response.data.data?.category;
    }
    public async updateCategory(id: number, data: any): Promise<Category> {
        const response = await this.api.put(`/api/admin/categories/${id}`, data);
        return response.data.category || response.data.data?.category;
    }
    public async deleteCategory(id: number): Promise<void> {
        await this.api.delete(`/api/admin/categories/${id}`);
    }
    // Customization Option Management
    public async createCustomization(data: any): Promise<CustomizationOption> {
        const response = await this.api.post('/api/admin/customizations', data);
        return response.data.customization || response.data.data?.customization;
    }
    public async updateCustomization(id: number, data: any): Promise<CustomizationOption> {
        const response = await this.api.put(`/api/admin/customizations/${id}`, data);
        return response.data.customization || response.data.data?.customization;
    }
    public async deleteCustomization(id: number): Promise<void> {
        await this.api.delete(`/api/admin/customizations/${id}`);
    }

    // Pagination-enabled list methods
    public async listProducts(query: any = {}): Promise<PaginatedResult<Product>> {
        const response = await this.api.get('/api/admin/products', { params: query });
        const products = response.data.data.products;
        return { items: products.items, pagination: products.pagination };
    }
    public async listUsers(query: any = {}): Promise<PaginatedResult<User>> {
        const response = await this.api.get('/api/admin/users', { params: query });
        const users = response.data.data.users;
        return { items: users.items, pagination: users.pagination };
    }
    public async listOrders(query: any = {}): Promise<PaginatedResult<Order>> {
        const response = await this.api.get('/api/admin/orders', { params: query });
        const orders = response.data.data.orders;
        return { items: orders.items, pagination: orders.pagination };
    }
    public async listCategories(query: any = {}): Promise<PaginatedResult<Category>> {
        const response = await this.api.get('/api/admin/categories', { params: query });
        const categories = response.data.data.categories;
        return { items: categories.items, pagination: categories.pagination };
    }
    public async listCustomizations(query: any = {}): Promise<PaginatedResult<CustomizationOption>> {
        const response = await this.api.get('/api/admin/customizations', { params: query });
        const customizations = response.data.data.customizations;
        return { items: customizations.items, pagination: customizations.pagination };
    }
}

export const adminService = new AdminService(); 