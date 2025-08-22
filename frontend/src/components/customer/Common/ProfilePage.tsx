import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
    User,
    Mail,
    Shield,
    Lock
} from 'lucide-react';

const CustomerProfilePage: React.FC = () => {
    const { user, sendVerificationEmail, getProfile } = useAuth();
    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const handleSendVerification = async () => {
        try {
            setIsSendingVerification(true);
            await sendVerificationEmail();
            setVerificationSent(true);
            setTimeout(() => {
                getProfile();
            }, 2000);
        } catch (error) {
            console.error('Send verification error:', error);
        } finally {
            setIsSendingVerification(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'notifications', name: 'Notifications', icon: Mail },
        { id: 'billing', name: 'Billing', icon: Lock },
    ];

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 px-6 py-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-600 text-lg">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <h2 className="text-xl font-medium text-gray-900">Profile Information</h2>
                            </div>
                            <div className="p-8 space-y-8">
                                {/* Profile Picture */}
                                <div className="flex items-center space-x-6">
                                    <div className="h-20 w-20 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={user.name || ''}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Email Address
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="email"
                                                value={user.email || ''}
                                                disabled
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                            {!user.emailVerified && (
                                                <button
                                                    onClick={handleSendVerification}
                                                    disabled={isSendingVerification || verificationSent}
                                                    className="px-4 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 rounded-lg hover:bg-indigo-50 transition-colors"
                                                >
                                                    {isSendingVerification ? 'Sending...' : verificationSent ? 'Sent' : 'Verify'}
                                                </button>
                                            )}
                                        </div>
                                        {!user.emailVerified && (
                                            <p className="mt-2 text-sm text-yellow-600">
                                                Please verify your email address
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="Enter phone number"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Address Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter street address"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter city"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                State/Province
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter state/province"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter ZIP code"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <h2 className="text-xl font-medium text-gray-900">Security Settings</h2>
                            </div>
                            <div className="p-8 space-y-8">
                                {/* Change Password */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Change Password</h4>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter current password"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                            Update Password
                                        </button>
                                    </div>
                                </div>

                                {/* Two-Factor Authentication */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Two-Factor Authentication</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Add an extra layer of security to your account
                                            </p>
                                        </div>
                                        <button className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>

                                {/* Login Sessions */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Active Login Sessions</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Current Session</p>
                                                <p className="text-sm text-gray-500">This device • Active</p>
                                            </div>
                                            <span className="text-sm text-green-600">Current</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <h2 className="text-xl font-medium text-gray-900">Notification Preferences</h2>
                            </div>
                            <div className="p-8 space-y-8">
                                {/* Email Notifications */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Email Notifications</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Order Updates</p>
                                                <p className="text-sm text-gray-500">Receive notifications about order status changes</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Promotional Emails</p>
                                                <p className="text-sm text-gray-500">Receive offers and promotions</p>
                                            </div>
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Newsletter</p>
                                                <p className="text-sm text-gray-500">Receive monthly newsletter</p>
                                            </div>
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Push Notifications */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Push Notifications</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Order Updates</p>
                                                <p className="text-sm text-gray-500">Receive notifications about order status changes</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">New Products</p>
                                                <p className="text-sm text-gray-500">Receive notifications about new products</p>
                                            </div>
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <h2 className="text-xl font-medium text-gray-900">Payment Information</h2>
                            </div>
                            <div className="p-8 space-y-8">
                                {/* Payment Methods */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Payment Methods</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <Lock className="h-6 w-6 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                                                    <p className="text-sm text-gray-500">Expires 12/25</p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-green-600">Default</span>
                                        </div>
                                        <button className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            Add Payment Method
                                        </button>
                                    </div>
                                </div>

                                {/* Billing Address */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h4 className="text-lg font-medium text-gray-900 mb-6">Billing Address</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter first name"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter last name"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter address"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter city"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter ZIP code"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                        Save Billing Info
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage; 