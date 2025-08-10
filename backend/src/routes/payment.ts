import { Router } from 'express';
import crypto from 'crypto';
import qs from 'qs';
import { prisma } from '../lib/prisma';
import { createPayment, getPaymentStatus, getOrderPayments, processVnpayReturn, processZaloPayCallback, processMomoCallback } from '../services/paymentService';
import * as paymentService from '../services/paymentService';
import { authenticate } from '../middleware/auth';
import { sendResponse, sendError } from '../utils/response';

const router = Router();

// Create payment
router.post('/create', authenticate, async (req, res) => {
    try {
        const { orderId, gateway, returnUrl, cancelUrl, description } = req.body;

        if (!orderId || !gateway) {
            return sendError(res, 400, 'Order ID and payment gateway are required');
        }

        const paymentResult = await createPayment({
            orderId,
            amount: 0, // Will be calculated from order totalPrice
            gateway,
            returnUrl,
            cancelUrl,
            description
        });

        if (paymentResult.success) {
            return sendResponse(res, 200, 'Payment created successfully', paymentResult);
        } else {
            return sendError(res, 400, paymentResult.error || 'Payment creation failed');
        }
    } catch (error: any) {
        console.error('Payment creation error:', error);
        return sendError(res, 500, error.message || 'Internal server error');
    }
});

// VNPay return callback (GET method for VNPay redirects)
router.get('/vnpay-return', async (req, res) => {
    try {
        const vnpParams: any = { ...req.query };
        const redirectUrl = await processVnpayReturn(vnpParams);
        return res.redirect(redirectUrl);
    } catch (error: any) {
        console.error('VNPay return error:', error);
        const fallback = `${process.env.WEB_BASE_URL || 'http://localhost:5173'}/checkout/result?status=failed`;
        return res.redirect(fallback);
    }
});

// ZaloPay callback
router.post('/zalopay-callback', async (req, res) => {
    const result = await processZaloPayCallback(req.body);
    return res.json(result);
});

// Momo callback
router.post('/momo-callback', async (req, res) => {
    const code = await processMomoCallback(req.body);
    return res.sendStatus(code);
})

// Get payment status
router.get('/status/:transactionId', authenticate, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const paymentStatus = await getPaymentStatus(transactionId);
        return sendResponse(res, 200, 'Payment status retrieved successfully', paymentStatus);
    } catch (error: any) {
        console.error('Get payment status error:', error);
        return sendError(res, 500, error.message || 'Internal server error');
    }
});

// Get order payments
router.get('/order/:orderId', authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;
        const payments = await getOrderPayments(parseInt(orderId));
        return sendResponse(res, 200, 'Order payments retrieved successfully', { payments });
    } catch (error: any) {
        console.error('Get order payments error:', error);
        return sendError(res, 500, error.message || 'Internal server error');
    }
});

export default router; 