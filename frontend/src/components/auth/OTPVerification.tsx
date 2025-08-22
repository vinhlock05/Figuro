import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center relative">
                    {/* Back to Home Button - Top Left */}
                    <Link
                        to="/"
                        className="absolute -top-2 -left-2 flex items-center space-x-2 px-3 py-2 text-neutral-700 hover:text-brand dark:text-neutral-100 transition-all duration-300 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-brand/10 text-brand">
                        <Mail className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        Email verification
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-300">
                        We've sent a 6-digit code to your email address
                    </p>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{email}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                    <div>
                        <label htmlFor="otp" className="sr-only">Enter verification code</label>
                        <div className="flex justify-center space-x-3">
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
                                    className="w-14 h-14 text-center text-xl font-bold border-2 border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-neutral-800 dark:text-neutral-100"
                                    placeholder="0"
                                />
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-neutral-500 text-center">Enter the 6-digit code from your email</p>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>
                    )}

                    <div className="space-y-4">
                        <button type="submit" disabled={isVerifying || otp.join('').length !== 6} className="btn-primary w-full h-12 rounded-xl text-base border-2 border-brand/60">
                            {isVerifying ? 'Verifying…' : 'Verify Email'}
                        </button>

                        <button type="button" onClick={handleResend} disabled={isResending} className="btn-secondary w-full h-12 rounded-xl text-base">
                            {isResending ? 'Sending…' : 'Resend code'}
                        </button>

                        <button type="button" onClick={onBackToLogin} className="btn-secondary w-full h-12 rounded-xl text-base">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to login
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-neutral-500">
                        Didn't receive the code? Check your spam folder or try resending.
                    </p>
                </div>
            </div>
        </div>
    );
}; 