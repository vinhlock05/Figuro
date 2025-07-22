import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface OTPVerificationProps {
    email: string;
    onBackToLogin: () => void;
    onVerificationSuccess: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
    email,
    onBackToLogin,
    onVerificationSuccess
}) => {
    const { sendVerificationEmail, verifyEmail } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if current is filled
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Move to previous input if current is cleared
        if (!value && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        try {
            setIsVerifying(true);
            setError('');
            await verifyEmail(otpCode);
            setSuccess(true);
            setTimeout(() => {
                onVerificationSuccess();
            }, 1500);
        } catch (err: any) {
            console.error('OTP verification error:', err);
            setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        try {
            setIsResending(true);
            setError('');
            await sendVerificationEmail();
        } catch (err: any) {
            console.error('Resend error:', err);
            setError('Failed to resend verification code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Email verified successfully!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Redirecting to dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                        <Mail className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verify your email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent a 6-digit code to
                    </p>
                    <p className="text-sm font-medium text-gray-900">{email}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="otp" className="sr-only">
                            Enter verification code
                        </label>
                        <div className="flex justify-center space-x-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="0"
                                />
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500 text-center">
                            Enter the 6-digit code from your email
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={isVerifying || otp.join('').length !== 6}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Verifying...
                                </div>
                            ) : (
                                'Verify Email'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Resend code
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to login
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Didn't receive the code? Check your spam folder or try resending.
                    </p>
                </div>
            </div>
        </div>
    );
}; 