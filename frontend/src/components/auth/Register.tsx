import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Shield, ArrowLeft } from 'lucide-react';

const registerSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

interface RegisterProps {
    onSwitchToLogin: () => void;
    onError?: (message: string) => void;
    onRegisterSuccess?: (email: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onError, onRegisterSuccess }) => {
    const { register: registerUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        console.log('Register form submitted with data:', data);
        try {
            setError('');
            console.log('Calling register function...');
            await registerUser(data);
            console.log('Registration successful!');
            onRegisterSuccess?.(data.email);
        } catch (err: any) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            onError?.(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full animate-fade-in">
                {/* Auth card */}
                <div className="card p-8 border-2 border-neutral-100 dark:border-neutral-700 shadow-soft">
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

                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-brand/10 text-brand">
                            <Shield className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            Join Figuro
                        </h2>
                        <p className="text-neutral-500 dark:text-neutral-200">
                            Or{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="font-medium text-brand hover:underline"
                            >
                                sign in to existing account
                            </button>
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-brand" />
                                    </div>
                                    <input
                                        {...register('name')}
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        className="input-primary w-full pl-12 border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base"
                                        placeholder="Full Name"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-2 text-sm text-danger">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="sr-only">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-brand" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        className="input-primary w-full pl-12 border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base"
                                        placeholder="Email Address"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-danger">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-brand" />
                                    </div>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        className="input-primary w-full pl-12 pr-12 border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base"
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
                                    <p className="mt-2 text-sm text-danger">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-brand" />
                                    </div>
                                    <input
                                        {...register('confirmPassword')}
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        className="input-primary w-full pl-12 pr-12 border-2 border-neutral-300 dark:border-neutral-700 h-12 rounded-xl text-base"
                                        placeholder="Confirm New Password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-danger">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>
                        )}

                        <div>
                            <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12 rounded-xl text-base border-2 border-brand/60">
                                {isSubmitting ? 'Creating account…' : 'Create account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 