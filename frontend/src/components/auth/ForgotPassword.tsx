import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = yup.object({
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

interface ForgotPasswordProps {
    onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
    const { requestPasswordReset } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: yupResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setError('');
            await requestPasswordReset(data.email);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Check your email
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            We've sent a password reset link to your email address.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={onBackToLogin}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
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
                            Reset password
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-300">
                            Enter your email and we'll send a link to reset your password.
                        </p>
                    </div>

                    <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-brand" />
                                </div>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className="input-primary w-full pl-12 border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base focus:border-brand focus:ring-brand"
                                    placeholder="Email address"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-danger">{errors.email.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>
                        )}

                        <button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl text-base border-2 border-brand bg-brand text-white hover:bg-brand-dark transition-smooth">
                            {isSubmitting ? 'Sending…' : 'Send reset link'}
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