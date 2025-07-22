import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessageProps {
    open: boolean;
    type?: ToastType;
    message: string;
    duration?: number; // ms
    onClose: () => void;
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
}) => {
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [open, duration, onClose]);

    if (!open) return null;
    return (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded border shadow-lg flex items-center gap-2 ${typeStyles[type]}`}
            role="alert"
        >
            {type === 'success' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            {type === 'error' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {type === 'info' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
            )}
            {type === 'warning' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 19.07a10 10 0 1114.14 0A10 10 0 014.93 19.07z" /></svg>
            )}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 text-lg font-bold leading-none">&times;</button>
        </div>
    );
};

export default ToastMessage; 