import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import OrderTrackingService from '../services/orderTrackingService'
import { sendResponse, sendError } from '../utils/response'
import { prisma } from '../lib/prisma'

export const getOrderTracking = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params
        const userId = req.user.userId

        if (!orderId) {
            return sendError(res, 400, 'Order ID is required')
        }

        // Verify user owns the order
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) }
        })

        if (!order) {
            return sendError(res, 404, 'Order not found')
        }

        if (order.userId !== userId && req.user.role !== 'admin') {
            return sendError(res, 403, 'Access denied')
        }

        const trackingInfo = await OrderTrackingService.getOrderTracking(parseInt(orderId))

        if (!trackingInfo) {
            return sendError(res, 404, 'Order tracking information not found')
        }

        return sendResponse(res, 200, 'Order tracking information retrieved successfully', trackingInfo)
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get order tracking')
    }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params
        const { newStatus, description } = req.body
        const adminId = req.user.role === 'admin' ? req.user.userId : undefined

        if (!orderId || !newStatus) {
            return sendError(res, 400, 'Order ID and new status are required')
        }

        // Only admins can update order status
        if (req.user.role !== 'admin') {
            return sendError(res, 403, 'Only admins can update order status')
        }

        const success = await OrderTrackingService.updateOrderStatus({
            orderId: parseInt(orderId),
            newStatus,
            description,
            adminId
        })

        if (success) {
            return sendResponse(res, 200, 'Order status updated successfully')
        } else {
            return sendError(res, 400, 'Failed to update order status')
        }
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to update order status')
    }
}

export const getOrderStatusHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params
        const userId = req.user.userId

        if (!orderId) {
            return sendError(res, 400, 'Order ID is required')
        }

        // Verify user owns the order
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) }
        })

        if (!order) {
            return sendError(res, 404, 'Order not found')
        }

        if (order.userId !== userId && req.user.role !== 'admin') {
            return sendError(res, 403, 'Access denied')
        }

        const history = await OrderTrackingService.getOrderStatusHistory(parseInt(orderId))

        return sendResponse(res, 200, 'Order status history retrieved successfully', { history })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get order status history')
    }
}

export const cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params
        const { reason } = req.body
        const userId = req.user.userId

        if (!orderId) {
            return sendError(res, 400, 'Order ID is required')
        }

        // Verify user owns the order
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) }
        })

        if (!order) {
            return sendError(res, 404, 'Order not found')
        }

        if (order.userId !== userId && req.user.role !== 'admin') {
            return sendError(res, 403, 'Access denied')
        }

        const success = await OrderTrackingService.cancelOrder(parseInt(orderId), reason)

        if (success) {
            return sendResponse(res, 200, 'Order cancelled successfully')
        } else {
            return sendError(res, 400, 'Failed to cancel order')
        }
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to cancel order')
    }
}

export const getTrackingNumber = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params
        const userId = req.user.userId

        if (!orderId) {
            return sendError(res, 400, 'Order ID is required')
        }

        // Verify user owns the order
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) }
        })

        if (!order) {
            return sendError(res, 404, 'Order not found')
        }

        if (order.userId !== userId && req.user.role !== 'admin') {
            return sendError(res, 403, 'Access denied')
        }

        const trackingNumber = await OrderTrackingService.getTrackingNumber(parseInt(orderId))

        if (!trackingNumber) {
            return sendError(res, 404, 'Tracking number not found')
        }

        return sendResponse(res, 200, 'Tracking number retrieved successfully', { trackingNumber })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get tracking number')
    }
}

export const getOrdersByStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query

        // Only admins can view orders by status
        if (req.user.role !== 'admin') {
            return sendError(res, 403, 'Only admins can view orders by status')
        }

        if (!status) {
            return sendError(res, 400, 'Status is required')
        }

        const orders = await OrderTrackingService.getOrdersByStatus(
            status as string,
            parseInt(limit as string),
            parseInt(offset as string)
        )

        return sendResponse(res, 200, 'Orders retrieved successfully', { orders })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get orders by status')
    }
}

export const getOrderStatistics = async (req: AuthRequest, res: Response) => {
    try {
        // Only admins can view order statistics
        if (req.user.role !== 'admin') {
            return sendError(res, 403, 'Only admins can view order statistics')
        }

        const statistics = await OrderTrackingService.getOrderStatistics()

        return sendResponse(res, 200, 'Order statistics retrieved successfully', { statistics })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get order statistics')
    }
}

export const bulkUpdateOrderStatuses = async (req: AuthRequest, res: Response) => {
    try {
        const { updates } = req.body

        // Only admins can bulk update order statuses
        if (req.user.role !== 'admin') {
            return sendError(res, 403, 'Only admins can bulk update order statuses')
        }

        if (!updates || !Array.isArray(updates)) {
            return sendError(res, 400, 'Updates array is required')
        }

        const result = await OrderTrackingService.bulkUpdateOrderStatuses(updates)

        return sendResponse(res, 200, 'Bulk update completed', result)
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to bulk update order statuses')
    }
} 