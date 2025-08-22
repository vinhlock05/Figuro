import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface NotificationAction {
    label: string;
    variant: 'primary' | 'danger' | 'secondary';
    onClick: () => void;
}

export interface NotificationProps {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    details?: string;
    actions?: NotificationAction[];
    duration?: number;
    onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
    id,
    type,
    title,
    message,
    details,
    actions,
    duration = 5000,
    onClose
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const handleClose = () => {
        onClose(id);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-400" />;
            default:
                return <Info className="h-5 w-5 text-blue-400" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
                return 'text-blue-800';
            default:
                return 'text-blue-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-md animate-fade-in">
                <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-3xl bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 border-b-2 border-neutral-100 dark:border-neutral-700 bg-gradient-to-r from-brand/5 to-accent/5">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-xl ${type === 'success' ? 'bg-success/10' :
                                    type === 'error' ? 'bg-danger/10' :
                                        type === 'warning' ? 'bg-accent/10' :
                                            'bg-brand/10'
                                    }`}>
                                    {type === 'success' && <CheckCircle className="h-6 w-6 text-success" />}
                                    {type === 'error' && <XCircle className="h-6 w-6 text-danger" />}
                                    {type === 'warning' && <AlertTriangle className="h-6 w-6 text-accent" />}
                                    {type === 'info' && <Info className="h-6 w-6 text-brand" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                                        {type === 'success' ? 'Operation completed successfully' :
                                            type === 'error' ? 'An error occurred' :
                                                type === 'warning' ? 'Please review the information' :
                                                    'Information for you'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {message && (
                                <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
                                    {message}
                                </p>
                            )}

                            {details && (
                                <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">Details:</p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-200">{details}</p>
                                </div>
                            )}

                            {actions && actions.length > 0 && (
                                <div className="flex flex-col space-y-3 pt-4">
                                    {actions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={action.onClick}
                                            className={`w-full h-12 rounded-xl text-base border-2 transition-all duration-200 ${action.variant === 'primary'
                                                ? 'border-brand bg-brand text-white hover:bg-brand-dark'
                                                : action.variant === 'danger'
                                                    ? 'border-danger bg-danger text-white hover:bg-danger-dark'
                                                    : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                                                }`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    {!actions || actions.length === 0 ? (
                        <div className="p-4 border-t-2 border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                            <button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl text-base border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Notification; 