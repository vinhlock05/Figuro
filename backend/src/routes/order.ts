import { Router } from 'express'
import * as orderController from '../controllers/orderController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/', authenticate, orderController.placeOrder)
router.get('/', authenticate, orderController.getUserOrders)
router.get('/:orderId', authenticate, orderController.getOrderDetails)

export default router 