import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Shield, LogOut, Send, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { user, logout, sendVerificationEmail, getProfile, forceLogout } = useAuth();
    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSendVerification = async () => {
        try {
            setIsSendingVerification(true);
            await sendVerificationEmail();
            setVerificationSent(true);
            // Refresh user data to check if email is verified
            setTimeout(() => {
                getProfile();
            }, 2000);
        } catch (error) {
            console.error('Send verification error:', error);
        } finally {
            setIsSendingVerification(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                            <button
                                onClick={forceLogout}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Force Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information.</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Full name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email address
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Role
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{user.role}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Email verification
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <div className="flex items-center">
                                        {user.emailVerified ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Not verified
                                            </span>
                                        )}
                                        {!user.emailVerified && (
                                            <button
                                                onClick={handleSendVerification}
                                                disabled={isSendingVerification || verificationSent}
                                                className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            >
                                                {isSendingVerification ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-1"></div>
                                                        Sending...
                                                    </>
                                                ) : verificationSent ? (
                                                    <>
                                                        <Send className="h-3 w-3 mr-1" />
                                                        Sent
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-3 w-3 mr-1" />
                                                        Resend
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Member since
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Account Actions</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Manage your account settings and preferences.</p>
                        </div>
                        <div className="mt-5">
                            <div className="space-y-3">
                                {!user.emailVerified && (
                                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <div className="flex items-center">
                                            <Mail className="h-5 w-5 text-yellow-400 mr-3" />
                                            <div>
                                                <h4 className="text-sm font-medium text-yellow-800">Email not verified</h4>
                                                <p className="text-sm text-yellow-700">Please verify your email address to access all features.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSendVerification}
                                            disabled={isSendingVerification || verificationSent}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                                        >
                                            {isSendingVerification ? 'Sending...' : verificationSent ? 'Sent' : 'Resend'}
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-center">
                                        <Shield className="h-5 w-5 text-blue-400 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-medium text-blue-800">Account Security</h4>
                                            <p className="text-sm text-blue-700">Your account is secure and protected.</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Secure
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 