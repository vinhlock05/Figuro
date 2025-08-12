import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    User,
    Shield,
    Bell,
    CreditCard,
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
        { id: 'profile', name: 'Hồ sơ', icon: User },
        { id: 'security', name: 'Bảo mật', icon: Shield },
        { id: 'notifications', name: 'Thông báo', icon: Bell },
        { id: 'billing', name: 'Thanh toán', icon: CreditCard },
    ];

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
                <p className="text-gray-600">
                    Quản lý cài đặt và tùy chọn tài khoản của bạn
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab.id
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
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Thông tin hồ sơ</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Profile Picture */}
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            value={user.name || ''}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ email
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="email"
                                                value={user.email || ''}
                                                disabled
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                            />
                                            {!user.emailVerified && (
                                                <button
                                                    onClick={handleSendVerification}
                                                    disabled={isSendingVerification || verificationSent}
                                                    className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                                                >
                                                    {isSendingVerification ? 'Đang gửi...' : verificationSent ? 'Đã gửi' : 'Xác thực'}
                                                </button>
                                            )}
                                        </div>
                                        {!user.emailVerified && (
                                            <p className="mt-1 text-sm text-yellow-600">
                                                Vui lòng xác thực địa chỉ email của bạn
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="Nhập số điện thoại"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày sinh
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Thông tin địa chỉ</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Địa chỉ đường
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nhập địa chỉ đường"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Thành phố
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nhập thành phố"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tỉnh/Thành phố
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nhập tỉnh/thành phố"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mã bưu điện
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nhập mã bưu điện"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Cài đặt bảo mật</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Change Password */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Đổi mật khẩu</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Nhập mật khẩu hiện tại"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Nhập mật khẩu mới"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-m font-medium text-gray-700 mb-2">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Xác nhận mật khẩu mới"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                            Cập nhật mật khẩu
                                        </button>
                                    </div>
                                </div>

                                {/* Two-Factor Authentication */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Xác thực hai yếu tố</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Thêm một lớp bảo mật bổ sung cho tài khoản của bạn
                                            </p>
                                        </div>
                                        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Bật 2FA
                                        </button>
                                    </div>
                                </div>

                                {/* Login Sessions */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Phiên đăng nhập đang hoạt động</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Phiên hiện tại</p>
                                                <p className="text-sm text-gray-500">Thiết bị này • Đang hoạt động</p>
                                            </div>
                                            <span className="text-sm text-green-600">Hiện tại</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Tùy chọn thông báo</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Email Notifications */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Thông báo email</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Cập nhật đơn hàng</p>
                                                <p className="text-sm text-gray-500">Nhận thông báo về thay đổi trạng thái đơn hàng</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Email khuyến mãi</p>
                                                <p className="text-sm text-gray-500">Nhận ưu đãi và khuyến mãi</p>
                                            </div>
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Bản tin</p>
                                                <p className="text-sm text-gray-500">Nhận bản tin hàng tháng</p>
                                            </div>
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Push Notifications */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Thông báo đẩy</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Cập nhật đơn hàng</p>
                                                <p className="text-sm text-gray-500">Nhận thông báo về thay đổi trạng thái đơn hàng</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Sản phẩm mới</p>
                                                <p className="text-sm text-gray-500">Nhận thông báo về sản phẩm mới</p>
                                            </div>
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Thông tin thanh toán</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Payment Methods */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Phương thức thanh toán</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                                            <div className="flex items-center space-x-3">
                                                <CreditCard className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Visa kết thúc bằng 4242</p>
                                                    <p className="text-sm text-gray-500">Hết hạn 12/25</p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-green-600">Mặc định</span>
                                        </div>
                                        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Thêm phương thức thanh toán
                                        </button>
                                    </div>
                                </div>

                                {/* Billing Address */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Địa chỉ thanh toán</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tên
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter last name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter address"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter city"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter ZIP code"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
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