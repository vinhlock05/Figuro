import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import * as paymentService from '../services/paymentService'
import { sendResponse, sendError } from '../utils/response'

export const createPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, gateway, returnUrl, cancelUrl, description, bankCode } = req.body

        // Validate required fields
        if (!orderId || !gateway || !returnUrl || !cancelUrl) {
            return sendError(res, 400, 'orderId, gateway, returnUrl, and cancelUrl are required')
        }

        // Validate gateway
        const validGateways = ['momo', 'zalopay', 'vnpay', 'cod']
        if (!validGateways.includes(gateway)) {
            return sendError(res, 400, 'Invalid payment gateway')
        }

        // Get order to validate ownership and amount
        const order = await paymentService.getOrderPayments(orderId)
        if (!order || order.length === 0) {
            return sendError(res, 404, 'Order not found')
        }

        // Create payment request
        const paymentRequest = {
            orderId,
            amount: req.body.amount || 0, // Will be validated in service
            gateway,
            returnUrl,
            cancelUrl,
            description,
            bankCode // Optional for VNPAY bank selection
        }

        const result = await paymentService.createPayment(paymentRequest)

        if (!result.success) {
            return sendError(res, 400, result.error || 'Payment creation failed')
        }

        return sendResponse(res, 201, 'Payment created successfully', {
            paymentUrl: result.paymentUrl,
            transactionId: result.transactionId,
            gateway
        })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Payment creation failed')
    }
}

export const handlePaymentCallback = async (req: Request, res: Response) => {
    try {
        const { transactionId, status, amount, gateway, signature } = req.body

        // Validate required fields
        if (!transactionId || !status || !gateway) {
            return sendError(res, 400, 'transactionId, status, and gateway are required')
        }

        // Validate status
        const validStatuses = ['success', 'failed', 'pending']
        if (!validStatuses.includes(status)) {
            return sendError(res, 400, 'Invalid payment status')
        }

        const callback = {
            transactionId,
            status,
            amount: amount || 0,
            gateway,
            signature
        }

        const success = await paymentService.handlePaymentCallback(callback)

        if (success) {
            return sendResponse(res, 200, 'Payment callback processed successfully')
        } else {
            return sendError(res, 400, 'Payment callback processing failed')
        }
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Payment callback processing failed')
    }
}

export const getPaymentStatus = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.params

        if (!transactionId) {
            return sendError(res, 400, 'Transaction ID is required')
        }

        const paymentStatus = await paymentService.getPaymentStatus(transactionId)

        return sendResponse(res, 200, 'Payment status retrieved successfully', paymentStatus)
    } catch (error: any) {
        return sendError(res, 404, error.message || 'Payment not found')
    }
}

export const getOrderPayments = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params

        if (!orderId) {
            return sendError(res, 400, 'Order ID is required')
        }

        const payments = await paymentService.getOrderPayments(parseInt(orderId))

        return sendResponse(res, 200, 'Order payments retrieved successfully', { payments })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve order payments')
    }
}

// Mock payment success callback for testing
export const mockPaymentSuccess = async (req: Request, res: Response) => {
    try {
        const { transactionId, gateway } = req.body

        if (!transactionId || !gateway) {
            return sendError(res, 400, 'transactionId and gateway are required')
        }

        const callback = {
            transactionId,
            status: 'success' as const,
            amount: 0,
            gateway,
            signature: 'mock_signature'
        }

        const success = await paymentService.handlePaymentCallback(callback)

        if (success) {
            return sendResponse(res, 200, 'Mock payment success processed')
        } else {
            return sendError(res, 400, 'Mock payment processing failed')
        }
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Mock payment processing failed')
    }
}

// Mock payment failure callback for testing
export const mockPaymentFailure = async (req: Request, res: Response) => {
    try {
        const { transactionId, gateway } = req.body

        if (!transactionId || !gateway) {
            return sendError(res, 400, 'transactionId and gateway are required')
        }

        const callback = {
            transactionId,
            status: 'failed' as const,
            amount: 0,
            gateway,
            signature: 'mock_signature'
        }

        const success = await paymentService.handlePaymentCallback(callback)

        if (success) {
            return sendResponse(res, 200, 'Mock payment failure processed')
        } else {
            return sendError(res, 400, 'Mock payment processing failed')
        }
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Mock payment processing failed')
    }
} 