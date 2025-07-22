import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import NotificationService from '../services/notificationService'
import { sendResponse, sendError } from '../utils/response'
import { prisma } from '../lib/prisma'

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const { limit = 20, offset = 0 } = req.query
        const userId = req.user.userId

        const notifications = await NotificationService.getUserNotifications(
            userId,
            parseInt(limit as string),
            parseInt(offset as string)
        )

        return sendResponse(res, 200, 'Notifications retrieved successfully', { notifications })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve notifications')
    }
}

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { notificationId } = req.params
        const userId = req.user.userId

        if (!notificationId) {
            return sendError(res, 400, 'Notification ID is required')
        }

        const result = await NotificationService.markNotificationAsRead(
            parseInt(notificationId),
            userId
        )

        if (result.count === 0) {
            return sendError(res, 404, 'Notification not found or already read')
        }

        return sendResponse(res, 200, 'Notification marked as read')
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to mark notification as read')
    }
}

export const getNotificationStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId

        const stats = await NotificationService.getNotificationStats(userId)

        return sendResponse(res, 200, 'Notification statistics retrieved successfully', { stats })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve notification statistics')
    }
}

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId

        // Update all unread notifications for the user
        const result = await prisma.notification.updateMany({
            where: {
                userId: userId,
                status: 'sent' // Only mark sent notifications as read
            },
            data: { status: 'read' }
        })

        return sendResponse(res, 200, 'All notifications marked as read', {
            updatedCount: result.count
        })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to mark notifications as read')
    }
}

export const deleteNotification = async (req: AuthRequest, res: Response) => {
    try {
        const { notificationId } = req.params
        const userId = req.user.userId

        if (!notificationId) {
            return sendError(res, 400, 'Notification ID is required')
        }

        const result = await prisma.notification.deleteMany({
            where: {
                id: parseInt(notificationId),
                userId: userId // Ensure user owns the notification
            }
        })

        if (result.count === 0) {
            return sendError(res, 404, 'Notification not found')
        }

        return sendResponse(res, 200, 'Notification deleted successfully')
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to delete notification')
    }
}

export const getUnreadNotificationCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId

        const count = await prisma.notification.count({
            where: {
                userId: userId,
                status: 'sent' // Count unread notifications
            }
        })

        return sendResponse(res, 200, 'Unread notification count retrieved', { count })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get unread notification count')
    }
} 