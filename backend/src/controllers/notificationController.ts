import { Response } from 'express';
import {
    getNotifications as getNotificationsService,
    markAsRead as markAsReadService,
    markAllAsRead as markAllAsReadService,
    getUnreadCount as getUnreadCountService
} from '../services/notificationService';
import { sendResponse, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const notifications = await getNotificationsService(userId);
        return sendResponse(res, 200, 'Notifications retrieved successfully', notifications);
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve notifications');
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { notificationId } = req.params;

        if (!notificationId) {
            return sendError(res, 400, 'Notification ID is required');
        }

        await markAsReadService(userId, parseInt(notificationId));
        return sendResponse(res, 200, 'Notification marked as read successfully');
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to mark notification as read');
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        await markAllAsReadService(userId);
        return sendResponse(res, 200, 'All notifications marked as read successfully');
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to mark all notifications as read');
    }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const count = await getUnreadCountService(userId);
        return sendResponse(res, 200, 'Unread count retrieved successfully', { count });
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get unread count');
    }
}; 