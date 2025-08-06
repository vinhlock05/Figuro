import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/common/Notification';
import type { NotificationProps } from '../components/common/Notification';

interface NotificationContextType {
    showNotification: (notification: Omit<NotificationProps, 'id' | 'onClose'>) => void;
    clearNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationProps[]>([]);

    const showNotification = useCallback((notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: NotificationProps = {
            ...notification,
            id,
            onClose: clearNotification,
        };

        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = {
        showNotification,
        clearNotification,
        clearAllNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Notification Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        {...notification}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}; 