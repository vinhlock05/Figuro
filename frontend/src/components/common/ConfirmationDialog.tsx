import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmationDialogProps {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'info' | 'warning' | 'danger';
    isLoading?: boolean;
    loadingText?: string;
    details?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    title = 'Confirm',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'info',
    isLoading,
    loadingText,
    details,
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative w-full max-w-md animate-fade-in">
                <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-3xl bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 border-b-2 border-neutral-100 dark:border-neutral-700 bg-gradient-to-r from-brand/5 to-accent/5">

                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${variant === 'danger' ? 'bg-danger/10' :
                                variant === 'warning' ? 'bg-accent/10' :
                                    'bg-brand/10'
                                }`}>
                                {variant === 'danger' && <AlertTriangle className="h-6 w-6 text-danger" />}
                                {variant === 'warning' && <AlertTriangle className="h-6 w-6 text-accent" />}
                                {variant === 'info' && <Info className="h-6 w-6 text-brand" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    {title}
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-300">
                                    {variant === 'danger' ? 'This action cannot be undone' :
                                        variant === 'warning' ? 'Please review before proceeding' :
                                            'Please confirm your action'}
                                </p>
                            </div>
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
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">Additional Information:</p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-200">{details}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-3 pt-4">
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`w-full h-12 rounded-xl text-base border-2 transition-all duration-200 ${variant === 'danger'
                                        ? 'border-danger bg-danger text-white hover:bg-danger-dark'
                                        : variant === 'warning'
                                            ? 'border-accent bg-accent text-white hover:bg-accent-dark'
                                            : 'border-brand bg-brand text-white hover:bg-brand-dark'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin-slow rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {loadingText || 'Processing...'}
                                        </div>
                                    ) : (
                                        confirmText
                                    )}
                                </button>

                                <button
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl text-base border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog; 