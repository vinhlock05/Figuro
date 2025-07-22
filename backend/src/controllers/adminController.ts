import { Request, Response } from 'express'
import * as adminService from '../services/adminService'
import { sendResponse, sendError } from '../utils/response'
import { getCache, setCache } from '../utils/cache'

const DASHBOARD_CACHE_KEY = 'admin:dashboard'
const DASHBOARD_CACHE_TTL = 30 // 30 seconds

// Product Management
export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await adminService.createProduct(req.body)
        return sendResponse(res, 201, 'Product created', { product })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to create product')
    }
}
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const product = await adminService.updateProduct(Number(id), req.body)
        return sendResponse(res, 200, 'Product updated', { product })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to update product')
    }
}
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await adminService.deleteProduct(Number(id))
        return sendResponse(res, 200, 'Product deleted')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to delete product')
    }
}
export const listProducts = async (req: Request, res: Response) => {
    try {
        const products = await adminService.listProducts(req.query)
        return sendResponse(res, 200, 'Products fetched', { products })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to fetch products')
    }
}

// User Management
export const listUsers = async (req: Request, res: Response) => {
    try {
        const users = await adminService.listUsers(req.query);
        return sendResponse(res, 200, 'Users fetched', { users })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to fetch users')
    }
}
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { role } = req.body
        const user = await adminService.updateUserRole(Number(id), role)
        return sendResponse(res, 200, 'User role updated', { user })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to update user role')
    }
}
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await adminService.deleteUser(Number(id))
        return sendResponse(res, 200, 'User deleted')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to delete user')
    }
}

// Order Management
export const listOrders = async (req: Request, res: Response) => {
    try {
        const orders = await adminService.listOrders(req.query);
        return sendResponse(res, 200, 'Orders fetched', { orders })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to fetch orders')
    }
}
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params
        const { status } = req.body
        const order = await adminService.updateOrderStatus(Number(orderId), status)
        return sendResponse(res, 200, 'Order status updated', { order })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to update order status')
    }
}
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params
        const order = await adminService.getOrderDetails(Number(orderId))
        return sendResponse(res, 200, 'Order details fetched', { order })
    } catch (error: any) {
        return sendError(res, 404, error.message || 'Order not found')
    }
}

export const dashboard = async (req: Request, res: Response) => {
    try {
        const cached = await getCache(DASHBOARD_CACHE_KEY)
        if (cached) {
            return sendResponse(res, 200, 'Dashboard stats fetched (cache)', cached)
        }
        const stats = await adminService.getDashboardStats()
        await setCache(DASHBOARD_CACHE_KEY, stats, DASHBOARD_CACHE_TTL)
        return sendResponse(res, 200, 'Dashboard stats fetched', stats)
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to fetch dashboard stats')
    }
}

// Category Management
export const listCategories = async (req: Request, res: Response) => {
    try {
        const categories = await adminService.listCategories(req.query);
        return sendResponse(res, 200, 'Categories fetched', { categories });
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to fetch categories');
    }
};
export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = await adminService.createCategory(req.body);
        return sendResponse(res, 201, 'Category created', { category });
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to create category');
    }
};
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = await adminService.updateCategory(Number(req.params.id), req.body);
        return sendResponse(res, 200, 'Category updated', { category });
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to update category');
    }
};
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        await adminService.deleteCategory(Number(req.params.id));
        return sendResponse(res, 200, 'Category deleted');
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to delete category');
    }
};

// Customization Option Management
export const listCustomizations = async (req: Request, res: Response) => {
    try {
        const productId = req.query.productId ? Number(req.query.productId) : undefined;
        const customizations = await adminService.listCustomizations(productId, req.query);
        return sendResponse(res, 200, 'Customizations fetched', { customizations });
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to fetch customizations');
    }
};
export const createCustomization = async (req: Request, res: Response) => {
    try {
        const customization = await adminService.createCustomization(req.body);
        return sendResponse(res, 201, 'Customization created', { customization });
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to create customization');
    }
};
export const updateCustomization = async (req: Request, res: Response) => {
    try {
        const customization = await adminService.updateCustomization(Number(req.params.id), req.body);
        return sendResponse(res, 200, 'Customization updated', { customization });
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to update customization');
    }
};
export const deleteCustomization = async (req: Request, res: Response) => {
    try {
        await adminService.deleteCustomization(Number(req.params.id));
        return sendResponse(res, 200, 'Customization deleted');
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to delete customization');
    }
}; 