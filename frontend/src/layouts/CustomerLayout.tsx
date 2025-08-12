import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { customerService } from '../services/customerService';
import type { Product } from '../services/customerService';
import { formatVND } from '../utils/currency';
import VoiceAgentButton from '../components/common/VoiceAgentButton';
import VoiceAgentModal from '../components/common/VoiceAgentModal';
import {
    Home,
    ShoppingBag,
    Package,
    User,
    Search,
    ShoppingCart,
    Bell,
    Menu,
    X,
    Heart,
    LogOut
} from 'lucide-react';

interface CustomerLayoutProps {
    children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    //const { openVoiceModal, isSupported: isVoiceSupported } = useVoice();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        // Load notification count and wishlist count
        const loadCounts = async () => {
            try {
                const [notifications, wishlist] = await Promise.all([
                    customerService.getNotifications(),
                    customerService.getWishlist()
                ]);

                const unreadCount = notifications.filter(n => !n.read).length;
                setNotificationCount(unreadCount);
                setWishlistCount(wishlist.length);
            } catch (error) {
                console.error('Error loading counts:', error);
            }
        };

        loadCounts();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Load search suggestions
    useEffect(() => {
        const loadSearchSuggestions = async () => {
            if (searchQuery.trim().length >= 2) {
                try {
                    const params = {
                        page: 1,
                        limit: 5,
                        search: searchQuery,
                        sort: 'relevance',
                    };
                    const result = await customerService.getProducts(params);
                    setSearchSuggestions(result.products);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Error loading search suggestions:', error);
                }
            } else {
                setSearchSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(loadSearchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        }
    };

    const navigation = [
        { name: 'Trang chủ', href: '/dashboard', icon: Home },
        { name: 'Sản phẩm', href: '/products', icon: ShoppingBag },
        { name: 'Đơn hàng', href: '/orders', icon: Package },
        { name: 'Hồ sơ', href: '/profile', icon: User },
    ];

    const isActive = (href: string) => {
        return location.pathname === href || location.pathname.startsWith(href + '/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                    <div className="flex h-16 items-center justify-between px-4">
                        <h1 className="text-xl font-bold text-gray-900">Figuro</h1>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
                    <div className="flex h-16 items-center px-4">
                        <h1 className="text-xl font-bold text-gray-900">Figuro</h1>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(item.href)
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top header */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden text-gray-400 hover:text-gray-600"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="flex-1 max-w-lg mx-4 relative">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                            </form>

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 mt-1">
                                    {searchSuggestions.map((product) => (
                                        <Link
                                            key={product.id}
                                            to={`/products/${product.slug}`}
                                            className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                            onClick={() => {
                                                setSearchQuery(product.name);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <div className="w-10 h-10 rounded bg-gray-200 flex-shrink-0 mr-3">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        📦
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatVND(parseFloat(product.price))}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-4">
                            {/* Wishlist */}
                            <Link
                                to="/wishlist"
                                className="p-2 text-gray-400 hover:text-gray-600 relative"
                            >
                                <Heart className="h-6 w-6" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {wishlistCount > 9 ? '9+' : wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications */}
                            <Link
                                to="/notifications"
                                className="p-2 text-gray-400 hover:text-gray-600 relative"
                            >
                                <Bell className="h-6 w-6" />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </Link>

                            {/* Voice Agent (Header) - Commented out to reduce clutter */}
                            {/* {isVoiceSupported && (
                                <button
                                    onClick={openVoiceModal}
                                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    title="Trợ lý ảo"
                                >
                                    <Mic className="h-6 w-6" />
                                </button>
                            )} */}

                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="p-2 text-gray-400 hover:text-gray-600 relative"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {/* User menu */}
                            <div className="relative">
                                <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-white">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                                        {user?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Floating Voice Agent Button */}
            <VoiceAgentButton />

            {/* Voice Agent Modal */}
            <VoiceAgentModal />
        </div>
    );
};

export default CustomerLayout; 