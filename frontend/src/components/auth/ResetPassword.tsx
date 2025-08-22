import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = yup.object({
    newPassword: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

interface ResetPasswordProps {
    token: string;
    onBackToLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onBackToLogin }) => {
    const { resetPassword } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: yupResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            setError('');
            await resetPassword(token, data.newPassword);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Reset Password Successfully
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your password has been reset successfully. You can log in with your new password.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={onBackToLogin}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 animate-fade-in">
                <div className="relative card p-8 border-2 border-neutral-100 dark:border-neutral-700 shadow-soft">
                    <div className="absolute inset-x-0 -top-0.5 h-1 bg-brand/70 rounded-t-xl" />
                    <div className="relative">
                        {/* Back to Home Button - Top Left */}
                        <Link
                            to="/"
                            className="absolute -top-8 left-0 flex items-center space-x-2 px-2 py-1 text-neutral-700 hover:text-brand dark:text-neutral-100 transition-all duration-300 group"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-medium text-sm">Back to Home</span>
                        </Link>

                        <h2 className="mt-2 text-center text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                            Set new password
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-300">
                            Enter your new password below.
                        </p>
                    </div>

                    <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="newPassword" className="sr-only">New password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-brand" />
                                </div>
                                <input
                                    {...register('newPassword')}
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="input-primary w-full pl-12 pr-12 border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base focus:border-brand focus:ring-brand"
                                    placeholder="New password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="mt-2 text-sm text-danger">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm new password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-brand" />
                                </div>
                                <input
                                    {...register('confirmPassword')}
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="input-primary w-full pl-12 pr-12 border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base focus:border-brand focus:ring-brand"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-danger">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>
                        )}

                        <button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl text-base border-2 border-brand bg-brand text-white hover:bg-brand-dark transition-smooth">
                            {isSubmitting ? 'Updating…' : 'Update password'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button type="button" onClick={onBackToLogin} className="inline-flex items-center text-brand hover:underline text-sm">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 