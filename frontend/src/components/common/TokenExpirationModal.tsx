import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

interface TokenExpirationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

const TokenExpirationModal: React.FC<TokenExpirationModalProps> = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex items-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">
                        Phiên đăng nhập đã hết hạn
                    </h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.
                    </p>
                    <p className="text-sm text-gray-500">
                        Để bảo mật tài khoản, chúng tôi tự động đăng xuất sau một thời gian không hoạt động.
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={onLogin}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center justify-center"
                    >
                        <LogIn className="h-4 w-4 mr-2" />
                        Đăng nhập lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenExpirationModal; 