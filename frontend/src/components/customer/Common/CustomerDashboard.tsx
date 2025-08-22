import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import type { Order, Product } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import { useAuth } from '../../../contexts/AuthContext';
import {
    ShoppingBag,
    Package,
    Heart,
    CreditCard,
    Truck,
    HelpCircle
} from 'lucide-react';

const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        wishlistItems: 0,
        activeOrders: 0
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Load recent orders
                const ordersResult = await customerService.getOrders();
                setRecentOrders(ordersResult.orders.slice(0, 5));

                // Load featured products
                const products = await customerService.getProducts({ limit: 6 });
                setFeaturedProducts(products.products);

                // Load wishlist
                const wishlist = await customerService.getWishlist();

                // Calculate stats
                const totalSpent = ordersResult.orders.reduce((sum: number, order: Order) => {
                    const orderTotal = parseFloat(order.totalPrice) || 0;
                    return sum + orderTotal;
                }, 0);
                const activeOrders = ordersResult.orders.filter((order: Order) =>
                    ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
                ).length;

                setStats({
                    totalOrders: ordersResult.orders.length,
                    totalSpent,
                    wishlistItems: wishlist.length,
                    activeOrders
                });
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                // Set default stats on error  
                setStats({
                    totalOrders: 0,
                    totalSpent: 0,
                    wishlistItems: 0,
                    activeOrders: 0
                });
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);




    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-pink-400 opacity-20"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                        <div className="relative">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                    Welcome back, {user?.name || 'Customer'}! 👋
                                </h1>
                                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                                    Here's what's happening with your account today
                                </p>
                                <div className="flex items-center justify-center space-x-4">
                                    <Link
                                        to="/products"
                                        className="px-6 py-3 bg-brand text-white hover:bg-brand-dark rounded-xl transition-all duration-200 font-medium border-2 border-brand hover:scale-105"
                                    >
                                        Browse Products
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className="px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand rounded-xl transition-all duration-200 font-medium"
                                    >
                                        View Orders
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-6 hover:shadow-3xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Orders</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalOrders}</p>
                            </div>
                            <div className="p-3 bg-brand/10 rounded-xl">
                                <Package className="h-6 w-6 text-brand" />
                            </div>
                        </div>
                    </div>

                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-6 hover:shadow-3xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Spent</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatVND(stats.totalSpent)}</p>
                            </div>
                            <div className="p-3 bg-success/10 rounded-xl">
                                <CreditCard className="h-6 w-6 text-success" />
                            </div>
                        </div>
                    </div>

                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-6 hover:shadow-3xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Wishlist Items</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.wishlistItems}</p>
                            </div>
                            <div className="p-3 bg-danger/10 rounded-xl">
                                <Heart className="h-6 w-6 text-danger" />
                            </div>
                        </div>
                    </div>

                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-6 hover:shadow-3xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Orders</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.activeOrders}</p>
                            </div>
                            <div className="p-3 bg-accent/10 rounded-xl">
                                <Truck className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Recent Orders</h2>
                        </div>
                        <div className="p-6">
                            {recentOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-brand/10 rounded-lg">
                                                    <Package className="h-4 w-4 text-brand" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-neutral-100">Order #{order.id}</p>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatVND(parseFloat(order.totalPrice) || 0)}</p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-success/10 text-success' :
                                                    order.status === 'processing' ? 'bg-accent/10 text-accent' :
                                                        order.status === 'shipped' ? 'bg-brand/10 text-brand' :
                                                            'bg-neutral-100 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-500 dark:text-neutral-400">No orders yet</p>
                                    <Link
                                        to="/products"
                                        className="inline-block mt-2 px-4 py-2 text-brand hover:text-brand-dark font-medium"
                                    >
                                        Start shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t-2 border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                            <Link
                                to="/orders"
                                className="block text-center text-brand hover:text-brand-dark font-medium transition-colors duration-200"
                            >
                                View all orders →
                            </Link>
                        </div>
                    </div>

                    {/* Featured Products */}
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Featured Products</h2>
                        </div>
                        <div className="p-6">
                            {featuredProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {featuredProducts.map((product) => (
                                        <div key={product.id} className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                                            <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-600 rounded-lg flex-shrink-0 overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        📦
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{product.name}</p>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{product.category?.name || 'Uncategorized'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatVND(product.price)}</p>
                                                <button className="mt-1 p-2 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all duration-200">
                                                    <Heart className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ShoppingBag className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-500 dark:text-neutral-400">No featured products</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t-2 border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                            <Link
                                to="/products"
                                className="block text-center text-brand hover:text-brand-dark font-medium transition-colors duration-200"
                            >
                                Browse all products →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 text-center mb-8">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link
                            to="/products"
                            className="group p-6 bg-neutral-50 dark:bg-neutral-700/50 border-2 border-neutral-200 dark:border-neutral-600 rounded-2xl hover:border-brand hover:bg-brand/5 transition-all duration-300 text-center"
                        >
                            <div className="p-3 bg-brand/10 rounded-xl w-16 h-16 mx-auto mb-4 group-hover:bg-brand/20 transition-all duration-300">
                                <ShoppingBag className="h-8 w-8 text-brand mx-auto" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Shop Products</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Browse our latest collection</p>
                        </Link>

                        <Link
                            to="/orders"
                            className="group p-6 bg-neutral-50 dark:bg-neutral-700/50 border-2 border-neutral-200 dark:border-neutral-600 rounded-2xl hover:border-brand hover:bg-brand/5 transition-all duration-300 text-center"
                        >
                            <div className="p-3 bg-brand/10 rounded-xl w-16 h-16 mx-auto mb-4 group-hover:bg-brand/20 transition-all duration-300">
                                <Package className="h-8 w-8 text-brand mx-auto" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Track Orders</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Check your order status</p>
                        </Link>

                        <Link
                            to="/wishlist"
                            className="group p-6 bg-neutral-50 dark:bg-neutral-700/50 border-2 border-neutral-200 dark:border-neutral-600 rounded-2xl hover:border-brand hover:bg-brand/5 transition-all duration-300 text-center"
                        >
                            <div className="p-3 bg-brand/10 rounded-xl w-16 h-16 mx-auto mb-4 group-hover:bg-brand/20 transition-all duration-300">
                                <Heart className="h-8 w-8 text-brand mx-auto" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Wishlist</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">View saved items</p>
                        </Link>

                        <Link
                            to="/support"
                            className="group p-6 bg-neutral-50 dark:bg-neutral-700/50 border-2 border-neutral-200 dark:border-neutral-600 rounded-2xl hover:border-brand hover:bg-brand/5 transition-all duration-300 text-center"
                        >
                            <div className="p-3 bg-brand/10 rounded-xl w-16 h-16 mx-auto mb-4 group-hover:bg-brand/20 transition-all duration-300">
                                <HelpCircle className="h-8 w-8 text-brand mx-auto" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Get Help</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Contact support</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard; 