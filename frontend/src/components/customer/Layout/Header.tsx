import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { customerService } from '../../../services/customerService';
import type { Product } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import {
    Search,
    ShoppingCart,
    Heart,
    Bell,
    User,
    Sun,
    Moon,
    ChevronDown,
    ShoppingBag,
    Home,
    BarChart3,
    Package,
    LogOut
} from 'lucide-react';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    // Check if current path matches navigation item
    const isActivePath = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

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
                setNotifications(notifications);
            } catch (error) {
                console.error('Error loading counts:', error);
            }
        };

        if (user) {
            loadCounts();
        }
    }, [user]);

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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;
    const cartCount = cartItemCount;

    return (
        <header className="bg-white dark:bg-neutral-800 border-b-2 border-neutral-100 dark:border-neutral-700 shadow-soft sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Bar */}
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Home Navigation */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="p-2 bg-brand/10 rounded-xl group-hover:bg-brand/20 transition-all duration-300">
                                <ShoppingBag className="h-6 w-6 text-brand" />
                            </div>
                            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-brand transition-colors duration-300">
                                Figuro
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-brand focus:ring-brand focus:bg-white dark:focus:bg-neutral-800 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200"
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* Wishlist */}
                        <Link
                            to="/wishlist"
                            className="p-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 relative"
                        >
                            <Heart className="h-5 w-5" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Notifications */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 relative"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {unreadNotifications}
                                </span>
                            )}
                        </button>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="p-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 relative"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-brand text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 p-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200"
                                >
                                    <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-brand" />
                                    </div>
                                    <span className="text-sm font-medium">{user?.name || 'User'}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-neutral-100 dark:border-neutral-700 shadow-3xl py-2 z-50">
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200"
                                        >
                                            <BarChart3 className="h-4 w-4 inline mr-2" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/orders"
                                            className="block px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200"
                                        >
                                            <Package className="h-4 w-4 inline mr-2" />
                                            Orders
                                        </Link>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200"
                                        >
                                            <User className="h-4 w-4 inline mr-2" />
                                            Profile
                                        </Link>
                                        <div className="border-t border-neutral-200 dark:border-neutral-600 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-all duration-200"
                                        >
                                            <LogOut className="h-4 w-4 inline mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/cart"
                                    className="px-4 py-2 bg-brand text-white hover:bg-brand-dark rounded-xl transition-all duration-200 font-medium"
                                >
                                    Cart ({cartCount})
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Bar */}
                <nav className="flex items-center justify-center space-x-8 py-4 border-t border-neutral-100 dark:border-neutral-700">
                    <Link
                        to="/dashboard"
                        className={`text-neutral-600 dark:text-neutral-300 hover:text-brand dark:hover:text-brand-light px-3 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 font-medium ${isActivePath('/dashboard') ? 'bg-neutral-50 dark:bg-neutral-700' : ''}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/products"
                        className={`text-neutral-600 dark:text-neutral-300 hover:text-brand dark:hover:text-brand-light px-3 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 font-medium ${isActivePath('/products') ? 'bg-neutral-50 dark:bg-neutral-700' : ''}`}
                    >
                        Products
                    </Link>
                    <Link
                        to="/orders"
                        className={`text-neutral-600 dark:text-neutral-300 hover:text-brand dark:hover:text-brand-light px-3 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 font-medium ${isActivePath('/orders') ? 'bg-neutral-50 dark:bg-neutral-700' : ''}`}
                    >
                        Orders
                    </Link>
                </nav>
            </div>

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="absolute right-4 top-full mt-2 w-80 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-neutral-100 dark:border-neutral-700 shadow-3xl z-50">
                    <div className="p-4 border-b-2 border-neutral-100 dark:border-neutral-700">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4">
                        {notifications.length > 0 ? (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
                                    >
                                        <p className="text-sm text-neutral-700 dark:text-neutral-200">{notification.message}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                            {new Date(notification.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">No notifications</p>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
