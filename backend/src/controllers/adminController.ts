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
        const users = await adminService.listUsers()
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
        const orders = await adminService.listOrders()
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