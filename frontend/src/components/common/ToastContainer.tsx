import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
    const { toasts, hideToast } = useToast();
    const [exitingToasts, setExitingToasts] = useState<Set<string>>(new Set());

    const handleHideToast = (id: string) => {
        setExitingToasts(prev => new Set(prev).add(id));

        // Remove toast after animation completes
        setTimeout(() => {
            hideToast(id);
            setExitingToasts(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }, 300);
    };

    const getIcon = (type: string) => {
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

    const getBackgroundColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
            case 'info':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
        }
    };

    const getTextColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-green-800 dark:text-green-200';
            case 'error':
                return 'text-red-800 dark:text-red-200';
            case 'warning':
                return 'text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'text-blue-800 dark:text-blue-200';
            default:
                return 'text-blue-800 dark:text-blue-200';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
            {toasts.map((toast) => {
                const isExiting = exitingToasts.has(toast.id);
                return (
                    <div
                        key={toast.id}
                        className={`w-full p-4 rounded-xl border-2 shadow-xl backdrop-blur-sm bg-white/95 dark:bg-neutral-800/95 ${getBackgroundColor(toast.type)} transition-all duration-300 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
                            }`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                {getIcon(toast.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${getTextColor(toast.type)}`}>
                                    {toast.title}
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => handleHideToast(toast.id)}
                                className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ToastContainer;
