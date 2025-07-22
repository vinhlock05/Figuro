import { Router } from 'express'
import * as authController from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { authRateLimit } from '../middleware/rateLimit'

const router = Router()

// Apply stricter rate limiting to auth endpoints
router.post('/register', authRateLimit, authController.register)
router.post('/login', authRateLimit, authController.login)

// OAuth login endpoints
router.post('/google-login', authRateLimit, authController.googleLogin)
router.post('/facebook-login', authRateLimit, authController.facebookLogin)

// OAuth callback endpoints (for server-side flow)
router.get('/google/callback', authController.googleCallback)
router.get('/facebook/callback', authController.facebookCallback)

// OAuth initiation endpoints
router.get('/google', authController.initiateGoogleLogin)
router.get('/facebook', authController.initiateFacebookLogin)

router.get('/profile', authenticate, authController.profile)

// Password reset
router.post('/request-reset', authRateLimit, authController.requestPasswordReset)
router.post('/reset-password', authRateLimit, authController.resetPassword)

// Email verification
router.post('/send-verification', authenticate, authRateLimit, authController.sendVerification)
router.post('/verify-email', authRateLimit, authController.verifyEmail)

export default router 