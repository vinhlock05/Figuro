import { prisma } from '../lib/prisma';

export interface NotificationData {
    userId: number;
    type: 'wishlist_add' | 'wishlist_remove' | 'order_status' | 'payment_success' | 'payment_failed';
    title: string;
    message: string;
    data?: any;
}

export const createNotification = async (notificationData: NotificationData) => {
    const notification = await prisma.notification.create({
        data: {
            userId: notificationData.userId,
            type: notificationData.type,
            content: JSON.stringify({
                title: notificationData.title,
                message: notificationData.message,
                data: notificationData.data
            }),
            status: 'pending'
        }
    });

    return notification;
};

export const getNotifications = async (userId: number) => {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' },
        take: 50
    });

    return notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        content: JSON.parse(notification.content),
        status: notification.status,
        sentAt: notification.sentAt
    }));
};

export const markAsRead = async (userId: number, notificationId: number) => {
    await prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId
        },
        data: {
            status: 'read'
        }
    });
};

export const markAllAsRead = async (userId: number) => {
    await prisma.notification.updateMany({
        where: {
            userId,
            status: 'pending'
        },
        data: {
            status: 'read'
        }
    });
};

export const getUnreadCount = async (userId: number) => {
    const count = await prisma.notification.count({
        where: {
            userId,
            status: 'pending'
        }
    });

    return count;
};

// Specific notification creators
export const createWishlistAddNotification = async (userId: number, productName: string) => {
    return createNotification({
        userId,
        type: 'wishlist_add',
        title: 'Sản phẩm đã được thêm vào danh sách yêu thích',
        message: `"${productName}" đã được thêm vào danh sách yêu thích của bạn.`,
        data: { productName }
    });
};

export const createWishlistRemoveNotification = async (userId: number, productName: string) => {
    return createNotification({
        userId,
        type: 'wishlist_remove',
        title: 'Sản phẩm đã được xóa khỏi danh sách yêu thích',
        message: `"${productName}" đã được xóa khỏi danh sách yêu thích của bạn.`,
        data: { productName }
    });
}; 