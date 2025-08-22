import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessageProps {
    open: boolean;
    type?: ToastType;
    message: string;
    duration?: number; // ms
    onClose: (id: string) => void;
    id: string;
    title: string;
}

const typeStyles: Record<ToastType, string> = {
    success: 'bg-green-100 text-green-800 border-green-400',
    error: 'bg-red-100 text-red-800 border-red-400',
    info: 'bg-blue-100 text-blue-800 border-blue-400',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-400',
};

const ToastMessage: React.FC<ToastMessageProps> = ({
    open,
    type = 'info',
    message,
    duration = 3000,
    onClose,
    id,
    title,
}) => {
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [open, duration, onClose, id]);

    if (!open) return null;

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return 'border-green-400';
            case 'error':
                return 'border-red-400';
            case 'info':
                return 'border-blue-400';
            case 'warning':
                return 'border-yellow-400';
            default:
                return 'border-blue-400';
        }
    };

    const getIconBackground = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'info':
                return 'bg-blue-500';
            case 'warning':
                return 'bg-yellow-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 19.07a10 10 0 1114.14 0A10 10 0 014.93 19.07z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                    </svg>
                );
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'info':
                return 'text-blue-800';
            case 'warning':
                return 'text-yellow-800';
            default:
                return 'text-blue-800';
        }
    };

    return (
        <div className={`max-w-sm w-full bg-white dark:bg-neutral-800 shadow-3xl rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-2 ${getBorderColor()}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className={`p-2 rounded-xl ${getIconBackground()}`}>
                            {getIcon()}
                        </div>
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className={`text-sm font-medium ${getTextColor()}`}>
                            {title}
                        </p>
                        {message && (
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                                {message}
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => onClose(id)}
                            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToastMessage; 