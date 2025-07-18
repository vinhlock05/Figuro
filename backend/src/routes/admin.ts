import { Router } from 'express'
import * as adminController from '../controllers/adminController'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'

const router = Router()

// Product Management
router.post('/products', authenticate, requireAdmin, adminController.createProduct)
router.put('/products/:id', authenticate, requireAdmin, adminController.updateProduct)
router.delete('/products/:id', authenticate, requireAdmin, adminController.deleteProduct)
router.get('/products', authenticate, requireAdmin, adminController.listProducts)

// User Management
router.get('/users', authenticate, requireAdmin, adminController.listUsers)
router.put('/users/:id/role', authenticate, requireAdmin, adminController.updateUserRole)
router.delete('/users/:id', authenticate, requireAdmin, adminController.deleteUser)

// Order Management
router.get('/orders', authenticate, requireAdmin, adminController.listOrders)
router.put('/orders/:orderId/status', authenticate, requireAdmin, adminController.updateOrderStatus)
router.get('/orders/:orderId', authenticate, requireAdmin, adminController.getOrderDetails)

// Dashboard
router.get('/dashboard', authenticate, requireAdmin, adminController.dashboard)

export default router 