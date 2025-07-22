import { Router } from 'express'
import * as orderTrackingController from '../controllers/orderTrackingController'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'

const router = Router()

// User routes (require authentication)
router.get('/tracking/:orderId', authenticate, orderTrackingController.getOrderTracking)
router.get('/history/:orderId', authenticate, orderTrackingController.getOrderStatusHistory)
router.get('/tracking-number/:orderId', authenticate, orderTrackingController.getTrackingNumber)
router.post('/cancel/:orderId', authenticate, orderTrackingController.cancelOrder)

// Admin routes (require admin authentication)
router.put('/status/:orderId', authenticate, requireAdmin, orderTrackingController.updateOrderStatus)
router.get('/by-status', authenticate, requireAdmin, orderTrackingController.getOrdersByStatus)
router.get('/statistics', authenticate, requireAdmin, orderTrackingController.getOrderStatistics)
router.post('/bulk-update', authenticate, requireAdmin, orderTrackingController.bulkUpdateOrderStatuses)

export default router 