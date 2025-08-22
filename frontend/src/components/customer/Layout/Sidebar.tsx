import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
    Home,
    ShoppingBag,
    Package,
    User,
    Heart,
    Bell,
    Settings,
    LogOut,
    X,
    BarChart3
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Products', href: '/products', icon: ShoppingBag },
        { name: 'Orders', href: '/orders', icon: Package },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Wishlist', href: '/wishlist', icon: Heart },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        return location.pathname === href || location.pathname.startsWith(href + '/');
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:static lg:inset-0`}>

                {/* Enhanced Header */}
                <div className="flex items-center justify-between h-24 px-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-red via-accent-gold to-accent-neon-blue rounded-2xl flex items-center justify-center shadow-lg border border-accent-gold/30">
                            <span className="text-white font-bold text-2xl">F</span>
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-accent-red via-accent-gold to-accent-neon-blue bg-clip-text text-transparent">
                                Figuro
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Customer Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-xl hover:bg-white/80 transition-all duration-200 hover:scale-110"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Enhanced Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-3">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActiveRoute = isActive(item.href);

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => {
                                    // Close sidebar on mobile after navigation
                                    if (window.innerWidth < 1024) {
                                        onClose();
                                    }
                                }}
                                className={`group flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-105 ${isActiveRoute
                                    ? 'bg-gradient-to-r from-accent-red/15 to-accent-neon-blue/15 text-accent-neon-blue border-2 border-accent-neon-blue/30 shadow-lg shadow-accent-neon-blue/20'
                                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-accent-neon-blue hover:border hover:border-purple-200/50'
                                    }`}
                            >
                                <div className={`mr-3 p-2 rounded-xl transition-all duration-300 ${isActiveRoute
                                    ? 'bg-gradient-to-r from-accent-red/20 to-accent-neon-blue/20 text-accent-neon-blue'
                                    : 'bg-gray-100 text-gray-500 group-hover:bg-gradient-to-r group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-accent-neon-blue'
                                    }`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="font-semibold">{item.name}</span>
                                {isActiveRoute && (
                                    <div className="ml-auto w-3 h-3 bg-gradient-to-r from-accent-red to-accent-neon-blue rounded-full animate-pulse shadow-lg"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Enhanced Footer */}
                <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-red-50 to-pink-50">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-4 text-sm font-semibold text-accent-red hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 rounded-2xl transition-all duration-300 group hover:scale-105 border-2 border-red-200/50 hover:border-red-300/70 shadow-md hover:shadow-lg"
                    >
                        <div className="mr-3 p-2 rounded-xl bg-red-100 group-hover:bg-red-200 transition-all duration-300">
                            <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </div>
                        <span>Logout</span>
                    </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-accent-red/5 to-accent-neon-blue/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-4 w-24 h-24 bg-gradient-to-br from-accent-gold/5 to-accent-red/5 rounded-full blur-2xl" />
            </div>
        </>
    );
};

export default Sidebar;
