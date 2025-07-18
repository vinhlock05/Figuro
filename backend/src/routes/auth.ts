import { Router } from 'express'
import * as authController from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/profile', authController.profile)

// Password reset
router.post('/request-reset', authController.requestPasswordReset)
router.post('/reset-password', authController.resetPassword)

// Email verification
router.post('/send-verification', authenticate, authController.sendVerification)
router.post('/verify-email', authController.verifyEmail)

export default router 