import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import type { Order } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import {
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Truck,
    Eye,
    Calendar,
    DollarSign,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import ToastMessage from '../../common/ToastMessage';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [toast, setToast] = useState({
        open: false,
        type: 'success' as 'success' | 'error' | 'info',
        message: '',
    });

    useEffect(() => {
        loadOrders();
    }, [currentPage, searchQuery, statusFilter, sortBy]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await customerService.getOrders({
                page: currentPage,
                limit: 10
            });
            setOrders(result.orders);
            setTotalPages(result.pagination.pages);
        } catch (error) {
            console.error('Error loading orders:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Failed to load orders.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            // TODO: Implement cancel order functionality
            console.log('Cancel order:', orderId);
            setToast({
                open: true,
                type: 'info',
                message: 'Cancel order functionality coming soon.',
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Failed to cancel order.',
            });
        }
    };

    const getOrderStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-6 w-6 text-blue-500" />;
            case 'delivered':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'shipped':
                return <Truck className="h-6 w-6 text-blue-500" />;
            case 'processing':
                return <Clock className="h-6 w-6 text-yellow-500" />;
            case 'cancelled':
                return <AlertCircle className="h-6 w-6 text-red-500" />;
            case 'refunded':
                return <AlertCircle className="h-6 w-6 text-orange-500" />;
            default:
                return <Package className="h-6 w-6 text-gray-500" />;
        }
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getOrderStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'processing':
                return 'Processing';
            case 'shipped':
                return 'Shipped';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            case 'refunded':
                return 'Refunded';
            default:
                return status;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            String(order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.paymentStatus && order.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === '' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                        <div className="relative">

                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                    My Orders
                                </h1>
                                <p className="text-lg text-neutral-600 dark:text-neutral-300">
                                    Track your orders and view order history
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-brand focus:ring-brand focus:bg-white dark:focus:bg-neutral-800 transition-all duration-200"
                            />
                        </div>
                        <div className="lg:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="lg:w-48">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                            >
                                <option value="createdAt">Date Created</option>
                                <option value="updatedAt">Last Updated</option>
                                <option value="total">Total Amount</option>
                                <option value="status">Status</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin-slow rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-neutral-500 dark:text-neutral-400">Loading your orders...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                        {/* Order Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="p-3 bg-brand/10 rounded-xl">
                                                    <Package className="h-6 w-6 text-brand" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                                        Order #{order.id}
                                                    </h3>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Order Items Preview */}
                                            <div className="space-y-2">
                                                {order.items?.slice(0, 3).map((item, index) => (
                                                    <div key={index} className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex-shrink-0 overflow-hidden">
                                                            {item.product?.imageUrl ? (
                                                                <img
                                                                    src={item.product.imageUrl}
                                                                    alt={item.product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                                    <Package className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                                                {item.product?.name || `Product ${item.productId}`}
                                                            </p>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                Qty: {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items && order.items.length > 3 && (
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        +{order.items.length - 3} more items
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Status and Actions */}
                                        <div className="flex flex-col items-end space-y-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                                    {formatVND(order.totalPrice || 0)}
                                                </p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-success/10 text-success' :
                                                    order.status === 'shipped' ? 'bg-brand/10 text-brand' :
                                                        order.status === 'processing' ? 'bg-accent/10 text-accent' :
                                                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                order.status === 'pending' ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300' :
                                                                    'bg-danger/10 text-danger'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="px-4 py-2 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand rounded-xl transition-all duration-200 font-medium"
                                                >
                                                    View Details
                                                </Link>
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="px-4 py-2 border-2 border-danger text-danger hover:bg-danger hover:text-white rounded-xl transition-all duration-200 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-12 max-w-md mx-auto">
                            <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">No orders found</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                                {searchQuery || statusFilter ? 'Try adjusting your search or filter criteria.' : 'You haven\'t placed any orders yet.'}
                            </p>
                            {!searchQuery && !statusFilter && (
                                <Link
                                    to="/products"
                                    className="inline-block px-8 py-3 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium"
                                >
                                    Start Shopping
                                </Link>
                            )}
                            {(searchQuery || statusFilter) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('');
                                    }}
                                    className="inline-block px-8 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand rounded-xl transition-all duration-200 font-medium"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 rounded-xl border-2 transition-all duration-200 ${page === currentPage
                                            ? 'border-brand bg-brand text-white'
                                            : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Message */}
            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                id="orders-toast"
                title="Order Update"
            />
        </div>
    );
};

export default OrdersPage; 