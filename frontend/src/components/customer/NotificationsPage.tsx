import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import ToastMessage, { type ToastType } from '../common/ToastMessage';
import { Bell } from 'lucide-react';

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({
        open: false,
        type: 'success',
        message: ''
    });

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const notificationsData = await customerService.getNotifications();
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể tải thông báo. Vui lòng thử lại.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                <p className="text-gray-600">
                    Quản lý thông báo và cập nhật từ hệ thống
                </p>
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notification: any) => (
                        <div key={notification.id} className="p-4 bg-white border rounded-lg">
                            <h4 className="font-medium text-gray-900">{notification.content?.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.content?.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.sentAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
                    <p className="text-gray-500">
                        Bạn chưa có thông báo nào. Chúng tôi sẽ thông báo khi có cập nhật mới.
                    </p>
                </div>
            )}

            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
};

export default NotificationsPage; 