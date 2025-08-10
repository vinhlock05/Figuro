import React, { createContext, useContext, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import type { DashboardStats, Product, User, Order } from '../services/adminService';
import type { Category, CustomizationOption } from '../services/adminService';


interface AdminContextType {
    // Dashboard
    dashboardStats: DashboardStats | null;
    isLoadingStats: boolean;
    fetchDashboardStats: () => Promise<void>;

    // Products
    products: Product[];
    isLoadingProducts: boolean;
    fetchProducts: (params?: any) => Promise<any>; // Accepts params and returns paginated result
    createProduct: (data: any) => Promise<Product>;
    updateProduct: (id: number, data: any) => Promise<Product>;
    deleteProduct: (id: number) => Promise<void>;

    // Users
    users: User[];
    isLoadingUsers: boolean;
    fetchUsers: (params?: any) => Promise<any>; // Accepts params and returns paginated result
    updateUserRole: (id: number, role: 'admin' | 'customer') => Promise<User>;
    deleteUser: (id: number) => Promise<void>;

    // Orders
    orders: Order[];
    isLoadingOrders: boolean;
    fetchOrders: (params?: any) => Promise<any>;
    updateOrderStatus: (orderId: number, status: Order['status']) => Promise<Order>;
    getOrderDetails: (orderId: number) => Promise<Order>;
    deleteOrder: (orderId: number) => Promise<void>;

    // Categories
    categories: Category[];
    isLoadingCategories: boolean;
    fetchCategories: (params?: any) => Promise<any>;
    addCategory: (data: any) => Promise<Category>;
    editCategory: (id: number, data: any) => Promise<Category>;
    removeCategory: (id: number) => Promise<void>;

    // Customizations
    customizations: CustomizationOption[];
    isLoadingCustomizations: boolean;
    fetchCustomizations: (productId?: number) => Promise<CustomizationOption[]>;
    addCustomization: (data: any) => Promise<CustomizationOption>;
    editCustomization: (id: number, data: any) => Promise<CustomizationOption>;
    removeCustomization: (id: number) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

interface AdminProviderProps {
    children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
    // Dashboard state
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Products state
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Users state
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Orders state
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    // Customizations state
    const [customizations, setCustomizations] = useState<CustomizationOption[]>([]);
    const [isLoadingCustomizations, setIsLoadingCustomizations] = useState(false);

    // Dashboard functions
    const fetchDashboardStats = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (isLoadingStats) return;

        try {
            setIsLoadingStats(true);
            const stats = await adminService.getDashboardStats();
            setDashboardStats(stats);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    }, [isLoadingStats]);

    // Product functions
    const fetchProducts = useCallback(async (params = {}) => {
        setIsLoadingProducts(true);
        try {
            const result = await adminService.listProducts(params);
            setProducts(result.items);
            return result;
        } catch (error) {
            setProducts([]);
            return null;
        } finally {
            setIsLoadingProducts(false);
        }
    }, []);

    const createProduct = async (data: any) => {
        try {
            const newProduct = await adminService.createProduct(data);
            setProducts(prev => [...prev, newProduct]);
            return newProduct;
        } catch (error) {
            console.error('Failed to create product:', error);
            throw error;
        }
    };

    const updateProduct = async (id: number, data: any) => {
        try {
            const updatedProduct = await adminService.updateProduct(id, data);
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
            return updatedProduct;
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await adminService.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete product:', error);
            throw error;
        }
    };

    // User functions
    const fetchUsers = useCallback(async (params = {}) => {
        setIsLoadingUsers(true);
        try {
            const result = await adminService.listUsers(params);
            setUsers(result.items);
            return result;
        } catch (error) {
            setUsers([]);
            return null;
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    const updateUserRole = async (id: number, role: 'admin' | 'customer') => {
        try {
            const updatedUser = await adminService.updateUserRole(id, role);
            setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
            return updatedUser;
        } catch (error) {
            console.error('Failed to update user role:', error);
            throw error;
        }
    };

    const deleteUser = async (id: number) => {
        try {
            await adminService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    };

    // Order functions
    const fetchOrders = useCallback(async (params: any = {}) => {
        try {
            setIsLoadingOrders(true);
            const result = await adminService.listOrders(params);
            setOrders(result.items);
            return result;
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setOrders([]);
            return null;
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    const updateOrderStatus = async (orderId: number, status: Order['status']) => {
        try {
            const updatedOrder = await adminService.updateOrderStatus(orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
            return updatedOrder;
        } catch (error) {
            console.error('Failed to update order status:', error);
            throw error;
        }
    };

    const getOrderDetails = async (orderId: number) => {
        try {
            const order = await adminService.getOrderDetails(orderId);
            return order;
        } catch (error) {
            console.error('Failed to get order details:', error);
            throw error;
        }
    };

    const deleteOrder = async (orderId: number) => {
        try {
            await adminService.deleteOrder(orderId);
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            console.error('Failed to delete order:', error);
            throw error;
        }
    };

    // Category functions
    const fetchCategories = useCallback(async (params = {}) => {
        setIsLoadingCategories(true);
        try {
            const result = await adminService.listCategories(params);
            setCategories(result.items);
            return result;
        } catch (error) {
            setCategories([]);
            return null;
        } finally {
            setIsLoadingCategories(false);
        }
    }, []);
    const addCategory = async (data: any) => {
        const cat = await adminService.createCategory(data);
        setCategories(prev => [...prev, cat]);
        return cat;
    };
    const editCategory = async (id: number, data: any) => {
        const cat = await adminService.updateCategory(id, data);
        setCategories(prev => prev.map(c => c.id === id ? cat : c));
        return cat;
    };
    const removeCategory = async (id: number) => {
        await adminService.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    // Customization functions
    const fetchCustomizations = useCallback(async (productId?: number) => {
        setIsLoadingCustomizations(true);
        try {
            const result = await adminService.listCustomizations(productId);
            console.log('Fetched customizations:', result);
            // Ensure result is always an array
            const customizationsArray = Array.isArray(result) ? result : [];
            setCustomizations(customizationsArray);
            return customizationsArray;
        } catch (error) {
            console.error('Error fetching customizations:', error);
            setCustomizations([]);
            return [];
        } finally {
            setIsLoadingCustomizations(false);
        }
    }, []);
    const addCustomization = async (data: any) => {
        const opt = await adminService.createCustomization(data);
        setCustomizations(prev => [...prev, opt]);
        return opt;
    };
    const editCustomization = async (id: number, data: any) => {
        const opt = await adminService.updateCustomization(id, data);
        setCustomizations(prev => prev.map(o => o.id === id ? opt : o));
        return opt;
    };
    const removeCustomization = async (id: number) => {
        await adminService.deleteCustomization(id);
        setCustomizations(prev => prev.filter(o => o.id !== id));
    };

    // Remove the useEffect that fetches all data on mount

    const value: AdminContextType = {
        // Dashboard
        dashboardStats,
        isLoadingStats,
        fetchDashboardStats,

        // Products
        products,
        isLoadingProducts,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,

        // Users
        users,
        isLoadingUsers,
        fetchUsers,
        updateUserRole,
        deleteUser,

        // Orders
        orders,
        isLoadingOrders,
        fetchOrders,
        updateOrderStatus,
        getOrderDetails,
        deleteOrder,

        // Categories
        categories,
        isLoadingCategories,
        fetchCategories,
        addCategory,
        editCategory,
        removeCategory,
        // Customizations
        customizations,
        isLoadingCustomizations,
        fetchCustomizations,
        addCustomization,
        editCustomization,
        removeCustomization,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}; 