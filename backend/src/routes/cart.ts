import { Router } from 'express'
import * as cartController from '../controllers/cartController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, cartController.getCart)
router.post('/add', authenticate, cartController.addItem)
router.put('/update', authenticate, cartController.updateItem)
router.delete('/remove', authenticate, cartController.removeItem)
router.delete('/clear', authenticate, cartController.clearCart)

export default router 