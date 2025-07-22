import { Router } from 'express'
import * as adminController from '../controllers/adminController'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { adminRateLimit } from '../middleware/rateLimit'

const router = Router()

// Apply admin rate limiting to all admin endpoints
router.post('/products', authenticate, requireAdmin, adminRateLimit, adminController.createProduct)
router.put('/products/:id', authenticate, requireAdmin, adminRateLimit, adminController.updateProduct)
router.delete('/products/:id', authenticate, requireAdmin, adminRateLimit, adminController.deleteProduct)
router.get('/products', authenticate, requireAdmin, adminRateLimit, adminController.listProducts)

// User Management
router.get('/users', authenticate, requireAdmin, adminRateLimit, adminController.listUsers)
router.put('/users/:id/role', authenticate, requireAdmin, adminRateLimit, adminController.updateUserRole)
router.delete('/users/:id', authenticate, requireAdmin, adminRateLimit, adminController.deleteUser)

// Order Management
router.get('/orders', authenticate, requireAdmin, adminRateLimit, adminController.listOrders)
router.put('/orders/:orderId/status', authenticate, requireAdmin, adminRateLimit, adminController.updateOrderStatus)
router.get('/orders/:orderId', authenticate, requireAdmin, adminRateLimit, adminController.getOrderDetails)

// Dashboard
router.get('/dashboard', authenticate, requireAdmin, adminRateLimit, adminController.dashboard)

// Category Management
router.get('/categories', authenticate, requireAdmin, adminRateLimit, adminController.listCategories);
router.post('/categories', authenticate, requireAdmin, adminRateLimit, adminController.createCategory);
router.put('/categories/:id', authenticate, requireAdmin, adminRateLimit, adminController.updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, adminRateLimit, adminController.deleteCategory);

// Customization Option Management
router.get('/customizations', authenticate, requireAdmin, adminRateLimit, adminController.listCustomizations);
router.post('/customizations', authenticate, requireAdmin, adminRateLimit, adminController.createCustomization);
router.put('/customizations/:id', authenticate, requireAdmin, adminRateLimit, adminController.updateCustomization);
router.delete('/customizations/:id', authenticate, requireAdmin, adminRateLimit, adminController.deleteCustomization);

export default router 