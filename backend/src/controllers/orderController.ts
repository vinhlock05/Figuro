import { Response } from 'express'
import * as orderService from '../services/orderService'
import { AuthRequest } from '../middleware/auth'
import { sendResponse, sendError } from '../utils/response'

export const placeOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { shippingAddress, paymentMethod } = req.body
        if (!shippingAddress || !paymentMethod) {
            return sendError(res, 400, 'shippingAddress and paymentMethod are required')
        }
        const order = await orderService.placeOrder(req.user.userId, shippingAddress, paymentMethod)
        return sendResponse(res, 201, 'Order placed successfully', { order })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to place order')
    }
}

export const getUserOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit } = req.query;
        const result = await orderService.getUserOrders(req.user.userId, { page, limit });
        return sendResponse(res, 200, 'Orders fetched', result);
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get orders');
    }
};

export const getOrderDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params
        const order = await orderService.getOrderDetails(req.user.userId, Number(orderId))
        return sendResponse(res, 200, 'Order details fetched', { order })
    } catch (error: any) {
        return sendError(res, 404, error.message || 'Order not found')
    }
} 