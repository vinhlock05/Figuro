import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Sparkles, User, Shield, ArrowLeft, Clock } from 'lucide-react';
import { OAuthButtons } from './OAuthButtons';

const loginSchema = yup.object({
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    rememberMe: yup.boolean().optional(),
});

type LoginFormData = {
    email: string;
    password: string;
    rememberMe?: boolean;
};

interface LoginProps {
    onSwitchToRegister: () => void;
    onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onForgotPassword }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');
    const [showExpiredMessage, setShowExpiredMessage] = useState(false);

    // Check if user was redirected due to token expiration
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('expired') === 'true') {
            setShowExpiredMessage(true);
            // Clear the URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema) as any,
        mode: 'onChange',
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log('Form submitted with data:', data);
        try {
            setError('');
            console.log('Calling login function...');
            await login(data.email, data.password, data.rememberMe);
            console.log('Login successful!');
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    const handleOAuthError = (message: string) => {
        setError(message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full animate-fade-in">
                {/* Auth card */}
                <div className="card p-8 border-2 border-neutral-100 dark:border-neutral-700 shadow-soft relative">
                    <div className="absolute inset-x-0 -top-0.5 h-1 bg-brand/70 rounded-t-xl" />
                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        {/* Back to Home Button - Top Left */}
                        <Link
                            to="/"
                            className="absolute -top-2 -left-2 flex items-center space-x-2 px-3 py-2 text-neutral-700 hover:text-brand dark:text-neutral-100 transition-all duration-300 group"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-medium text-sm">Back to Home</span>
                        </Link>

                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-brand/10 text-brand ring-1 ring-brand/20 animate-bounce-gentle">
                            <Sparkles className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-neutral-500 dark:text-neutral-200">
                            Or{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="font-medium text-brand hover:underline"
                            >
                                create a new account
                            </button>
                        </p>
                    </div>

                    {/* Token Expiration Message */}
                    {showExpiredMessage && (
                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 mb-6 text-yellow-800 animate-slide-up">
                            Session expired. Please sign in again.
                        </div>
                    )}

                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email Address
                                </label>
                                <div className="relative max-w-full">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-brand" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        className="input-primary w-full pl-12 transition-smooth border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base"
                                        placeholder="Email Address"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-danger animate-slide-up">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-brand" />
                                    </div>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        className="input-primary w-full pl-12 pr-12 transition-smooth border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-danger animate-slide-up">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        {...register('rememberMe')}
                                        id="rememberMe"
                                        type="checkbox"
                                        className="h-4 w-4 text-brand focus:ring-brand border-neutral-300 rounded"
                                    />
                                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-200">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <button
                                        type="button"
                                        onClick={onForgotPassword}
                                        className="font-medium text-brand hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger animate-slide-up">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full hover-lift border-2 border-brand/60 h-12 rounded-xl text-base"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Sign In
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 animate-fade-in">
                        <OAuthButtons onError={handleOAuthError} />
                    </div>
                </div>
            </div>
        </div>
    );
}; 