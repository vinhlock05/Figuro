import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customerService';
import type { Order, Product } from '../../services/customerService';
import { formatVND } from '../../utils/currency';
import {
    ShoppingBag,
    Package,
    Heart,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight
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
                const orders = await customerService.getOrders();
                setRecentOrders(orders.slice(0, 5));

                // Load featured products
                const products = await customerService.getProducts({ limit: 6 });
                setFeaturedProducts(products.products);

                // Load wishlist
                const wishlist = await customerService.getWishlist();

                // Calculate stats
                const totalSpent = orders.reduce((sum, order) => {
                    const orderTotal = parseFloat(order.totalPrice) || 0;
                    return sum + orderTotal;
                }, 0);
                const activeOrders = orders.filter(order =>
                    ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
                ).length;

                setStats({
                    totalOrders: orders.length,
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

    const getOrderStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'shipped':
                return <Package className="h-5 w-5 text-blue-500" />;
            case 'processing':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'cancelled':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg">
                <div className="px-6 py-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Chào mừng trở lại, {user?.name}!
                    </h1>
                    <p className="text-indigo-100">
                        Khám phá các sản phẩm tuyệt vời và theo dõi đơn hàng của bạn một cách dễ dàng.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatVND(stats.totalSpent)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Sản phẩm yêu thích</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Package className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đơn hàng đang xử lý</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h2>
                        <Link
                            to="/orders"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                        >
                            Xem tất cả
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                            <div key={order.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {getOrderStatusIcon(order.status)}
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                Order #{order.id}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatVND(parseFloat(order.totalPrice) || 0)}
                                        </span>
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="text-indigo-600 hover:text-indigo-500"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đơn hàng nào</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Bắt đầu mua sắm để xem đơn hàng của bạn tại đây.
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Mua ngay
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Products */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Sản phẩm nổi bật</h2>
                        <Link
                            to="/products"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                        >
                            Xem tất cả
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="group relative">
                                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        <Link to={`/products/${product.slug}`}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.category.name}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-lg font-medium text-gray-900">
                                            {formatVND(parseFloat(product.price))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Thao tác nhanh</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            to="/products"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                            <ShoppingBag className="h-6 w-6 text-indigo-600 mr-3" />
                            <span className="text-sm font-medium text-gray-900">Mua ngay</span>
                        </Link>

                        <Link
                            to="/orders"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                            <Package className="h-6 w-6 text-indigo-600 mr-3" />
                            <span className="text-sm font-medium text-gray-900">Xem đơn hàng</span>
                        </Link>

                        <Link
                            to="/profile"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                            <Heart className="h-6 w-6 text-indigo-600 mr-3" />
                            <span className="text-sm font-medium text-gray-900">Hồ sơ của tôi</span>
                        </Link>

                        <Link
                            to="/wishlist"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                            <Heart className="h-6 w-6 text-indigo-600 mr-3" />
                            <span className="text-sm font-medium text-gray-900">Danh sách yêu thích</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard; 