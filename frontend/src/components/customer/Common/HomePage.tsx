import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import type { Product } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import { useAuth } from '../../../contexts/AuthContext';
import {
    ArrowRight,
    Heart,
    Truck,
    Shield,
    Package,
    ShoppingBag,
    Headphones,
    HelpCircle,
    CheckCircle,
    UserPlus
} from 'lucide-react';

const HomePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [activeOrders, setActiveOrders] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);

    useEffect(() => {
        loadProducts();
        if (isAuthenticated) {
            loadUserData();
        }
    }, [isAuthenticated]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const [featured, newProducts] = await Promise.all([
                customerService.getProducts({ limit: 8 }),
                customerService.getProducts({ limit: 4, sort: 'newest' })
            ]);
            setFeaturedProducts(featured.products || []);
            setNewArrivals(newProducts.products || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserData = async () => {
        try {
            const ordersResult = await customerService.getOrders();
            setRecentOrders(ordersResult.orders.slice(0, 3));
            setTotalOrders(ordersResult.orders.length);
            setActiveOrders(ordersResult.orders.filter((order: any) => ['processing', 'shipped'].includes(order.status)).length);
            setCompletedOrders(ordersResult.orders.filter((order: any) => order.status === 'delivered').length);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand/5 via-accent/5 to-brand/10 dark:from-brand/10 dark:via-accent/10 dark:to-brand/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto">
                            <div className="relative">
                                <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                                    Welcome to{' '}
                                    <span className="text-brand">Figuro</span>
                                </h1>
                                <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
                                    Discover amazing products, track your orders, and enjoy a seamless shopping experience.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center justify-center px-8 py-4 bg-brand text-white hover:bg-brand-dark rounded-2xl border-2 border-brand transition-all duration-300 font-semibold text-lg hover:scale-105"
                                    >
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                        Browse Products
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand rounded-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
                                    >
                                        <Package className="h-5 w-5 mr-2" />
                                        Track Orders
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                            Why Choose Figuro?
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            We provide the best shopping experience with quality products and excellent service.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center hover:shadow-3xl transition-all duration-300 hover:scale-105">
                            <div className="p-3 bg-brand/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <Shield className="h-8 w-8 text-brand" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Secure Shopping</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Your data and transactions are protected with industry-leading security measures.
                            </p>
                        </div>
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center hover:shadow-3xl transition-all duration-300 hover:scale-105">
                            <div className="p-3 bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <Truck className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Fast Delivery</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Quick and reliable shipping to get your products to you as soon as possible.
                            </p>
                        </div>
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center hover:shadow-3xl transition-all duration-300 hover:scale-105">
                            <div className="p-3 bg-success/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <Headphones className="h-8 w-8 text-success" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">24/7 Support</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Our customer support team is always ready to help you with any questions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="py-20 bg-neutral-50 dark:bg-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                            Quick Actions
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Get started quickly with these essential actions.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link
                            to="/products"
                            className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
                        >
                            <div className="p-3 bg-brand/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand/20 transition-colors duration-200">
                                <ShoppingBag className="h-8 w-8 text-brand" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Shop Products</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Browse our collection</p>
                        </Link>
                        <Link
                            to="/orders"
                            className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
                        >
                            <div className="p-3 bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-200">
                                <Package className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Track Orders</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Monitor your purchases</p>
                        </Link>
                        <Link
                            to="/wishlist"
                            className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
                        >
                            <div className="p-3 bg-danger/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-danger/20 transition-colors duration-200">
                                <Heart className="h-8 w-8 text-danger" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Wishlist</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Save your favorites</p>
                        </Link>
                        <Link
                            to="/help"
                            className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
                        >
                            <div className="p-3 bg-success/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-success/20 transition-colors duration-200">
                                <HelpCircle className="h-8 w-8 text-success" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Get Help</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Support & assistance</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                            Featured Products
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Discover our most popular and trending products. Start shopping now!
                        </p>
                    </div>

                    {!isLoading && featuredProducts.length > 0 ? (
                        <><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featuredProducts.slice(0, 8).map((product) => (
                                <div key={product.id} className="group">
                                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-105">
                                        <div className="relative aspect-square overflow-hidden">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                                                    <Package className="h-16 w-16 text-neutral-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-3">
                                                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-brand transition-colors duration-200">
                                                {product.name}
                                            </h3>

                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-brand">
                                                    {formatVND(product.price)}
                                                </span>

                                                <Link
                                                    to={`/products/${product.slug}`}
                                                    className="inline-flex items-center px-4 py-2 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium hover:scale-105"
                                                >
                                                    Details
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div><div className="text-center mt-12">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center px-8 py-3 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium hover:scale-105"
                                >
                                    View All Products
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Link>
                            </div></>
                    ) : !isLoading ? (
                        <div className="text-center py-12">
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-12 max-w-md mx-auto">
                                <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">No Products Available</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                                    We're currently updating our product catalog. Please check back soon!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin-slow rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                            <p className="text-neutral-500 dark:text-neutral-400">Loading products...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Arrivals Section */}
            <div className="py-20 bg-neutral-50 dark:bg-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                            New Arrivals
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Check out our latest additions to the collection
                        </p>
                    </div>

                    {!isLoading && newArrivals.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {newArrivals.slice(0, 4).map((product) => (
                                <div key={product.id} className="group">
                                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-105">
                                        <div className="relative aspect-square overflow-hidden">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                                                    <Package className="h-16 w-16 text-neutral-400" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-white">
                                                    New
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-brand transition-colors duration-200">
                                                {product.name}
                                            </h3>

                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-brand">
                                                    {formatVND(product.price)}
                                                </span>

                                                <Link
                                                    to={`/products/${product.slug}`}
                                                    className="inline-flex items-center px-4 py-2 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium hover:scale-105"
                                                >
                                                    Details
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Recent Activity Section for Authenticated Users */}
            {isAuthenticated && (
                <div className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                Your Recent Activity
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                                Stay updated with your latest orders and activities.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Orders */}
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Recent Orders</h3>
                                </div>
                                <div className="p-6">
                                    {recentOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentOrders.slice(0, 3).map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                                                    <div>
                                                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                                            Order #{order.id}
                                                        </p>
                                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                            {formatVND(parseFloat(order.totalPrice) || 0)}
                                                        </p>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-success/10 text-success' :
                                                            order.status === 'shipped' ? 'bg-brand/10 text-brand' :
                                                                order.status === 'processing' ? 'bg-accent/10 text-accent' :
                                                                    'bg-neutral-100 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="text-center pt-4">
                                                <Link
                                                    to="/orders"
                                                    className="text-brand hover:text-brand-dark font-medium transition-colors duration-200"
                                                >
                                                    View All Orders →
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                                            <p className="text-neutral-500 dark:text-neutral-400 mb-4">No orders yet</p>
                                            <Link
                                                to="/products"
                                                className="inline-block px-6 py-2 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium"
                                            >
                                                Start Shopping
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Quick Stats</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-brand/10 rounded-lg">
                                                <ShoppingBag className="h-5 w-5 text-brand" />
                                            </div>
                                            <span className="text-neutral-700 dark:text-neutral-300">Total Orders</span>
                                        </div>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                            {totalOrders}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-accent/10 rounded-lg">
                                                <Package className="h-5 w-5 text-accent" />
                                            </div>
                                            <span className="text-neutral-700 dark:text-neutral-300">Active Orders</span>
                                        </div>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                            {activeOrders}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-success/10 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-success" />
                                            </div>
                                            <span className="text-neutral-700 dark:text-neutral-300">Completed</span>
                                        </div>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                            {completedOrders}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Final Call to Action */}
            <div className="py-20 bg-brand/5 dark:bg-brand/10">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-3xl p-12">
                        <div className="relative">
                            <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                                Ready to Get Started?
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                                Join thousands of satisfied customers and start your shopping journey today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-brand text-white hover:bg-brand-dark rounded-2xl border-2 border-brand transition-all duration-300 font-semibold text-lg hover:scale-105"
                                >
                                    <ShoppingBag className="h-5 w-5 mr-2" />
                                    Explore Products
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand rounded-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
                                >
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
