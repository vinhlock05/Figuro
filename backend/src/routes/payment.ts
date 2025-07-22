import { Router } from 'express'
import * as paymentController from '../controllers/paymentController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Payment creation (requires authentication)
router.post('/create', authenticate, paymentController.createPayment)

// Payment callbacks (public - called by payment gateways)
router.post('/callback', paymentController.handlePaymentCallback)

// Payment status (public - for checking payment status)
router.get('/status/:transactionId', paymentController.getPaymentStatus)

// Order payments (requires authentication)
router.get('/order/:orderId', authenticate, paymentController.getOrderPayments)

// Mock payment callbacks for testing (development only)
if (process.env.NODE_ENV === 'development') {
    router.post('/mock/success', paymentController.mockPaymentSuccess)
    router.post('/mock/failure', paymentController.mockPaymentFailure)
}

export default router 