import { Router } from 'express';
import { createPayment, handlePaymentCallback, getPaymentStatus, getOrderPayments } from '../services/paymentService';
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
        // VNPay returns data via query parameters
        const vnpayData = req.query;

        // Log the return data for debugging
        console.log('VNPay return data:', vnpayData);

        // TODO: Verify signature and update order status
        // For now, just redirect to success page
        res.redirect(`http://localhost:5173/orders/${vnpayData.vnp_TxnRef}?status=success`);
    } catch (error: any) {
        console.error('VNPay return error:', error);
        res.redirect('http://localhost:5173/checkout?error=payment_failed');
    }
});

// Payment callback
router.post('/callback', async (req, res) => {
    try {
        const { transactionId, status, amount, gateway, signature } = req.body;

        if (!transactionId || !status || !gateway) {
            return sendError(res, 400, 'Missing required callback parameters');
        }

        const success = await handlePaymentCallback({
            transactionId,
            status,
            amount,
            gateway,
            signature
        });

        if (success) {
            return sendResponse(res, 200, 'Payment callback processed successfully');
        } else {
            return sendError(res, 400, 'Payment callback processing failed');
        }
    } catch (error: any) {
        console.error('Payment callback error:', error);
        return sendError(res, 500, error.message || 'Internal server error');
    }
});

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