import { Router } from 'express'
import * as notificationController from '../controllers/notificationController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All notification routes require authentication
router.use(authenticate)

// Get user notifications
router.get('/', notificationController.getUserNotifications)

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadNotificationCount)

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats)

// Mark notification as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead)

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllNotificationsAsRead)

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification)

export default router 