import React, { useState, useEffect } from 'react';
import { customerService } from '../../../services/customerService';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';
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
                message: 'Cannot load notifications. Please try again.'
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
        <div className="space-y-8 px-6 py-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600 text-lg">
                    Manage notifications and updates from the system
                </p>
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-6">
                    {notifications.map((notification: any) => (
                        <div key={notification.id} className="p-6 bg-white border rounded-xl shadow-lg">
                            <h4 className="font-medium text-gray-900 text-lg mb-2">{notification.content?.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{notification.content?.message}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(notification.sentAt).toLocaleDateString('en-US')}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6">
                    <Bell className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 mb-4">No Notifications</h3>
                    <p className="text-gray-500 text-lg">
                        You don't have any notifications yet. We'll notify you when there are new updates.
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