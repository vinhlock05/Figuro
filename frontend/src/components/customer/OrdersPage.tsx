import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Order } from '../../services/customerService';
import { formatVND } from '../../utils/currency';
import {
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Truck,
    Eye,
    Calendar,
    DollarSign
} from 'lucide-react';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const ordersData = await customerService.getOrders();
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOrderStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'delivered':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'shipped':
                return <Truck className="h-5 w-5 text-blue-500" />;
            case 'processing':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'cancelled':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'refunded':
                return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default:
                return <Package className="h-5 w-5 text-gray-500" />;
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
                return 'Chờ xử lý';
            case 'confirmed':
                return 'Đã xác nhận';
            case 'processing':
                return 'Đang xử lý';
            case 'shipped':
                return 'Đã gửi hàng';
            case 'delivered':
                return 'Đã giao hàng';
            case 'cancelled':
                return 'Đã hủy';
            case 'refunded':
                return 'Đã hoàn tiền';
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

    const filteredOrders = selectedStatus === 'all'
        ? orders
        : orders.filter(order => order.status === selectedStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                    <p className="text-gray-600">
                        Theo dõi đơn hàng và xem lịch sử đơn hàng
                    </p>
                </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'all'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả đơn hàng
                        </button>
                        <button
                            onClick={() => setSelectedStatus('pending')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'pending'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Chờ xử lý
                        </button>
                        <button
                            onClick={() => setSelectedStatus('confirmed')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'confirmed'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã xác nhận
                        </button>
                        <button
                            onClick={() => setSelectedStatus('processing')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'processing'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đang xử lý
                        </button>
                        <button
                            onClick={() => setSelectedStatus('shipped')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'shipped'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã gửi hàng
                        </button>
                        <button
                            onClick={() => setSelectedStatus('delivered')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'delivered'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã giao hàng
                        </button>
                        <button
                            onClick={() => setSelectedStatus('cancelled')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'cancelled'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã hủy
                        </button>
                        <button
                            onClick={() => setSelectedStatus('refunded')}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStatus === 'refunded'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã hoàn tiền
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {getOrderStatusIcon(order.status)}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Đơn hàng #{order.id}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Đặt hàng ngày {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                            {getOrderStatusText(order.status)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                                order.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                                                    order.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                                                        order.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-3 mb-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                                {item.product?.imageUrl ? (
                                                    <img
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                                        <div className="h-6 w-6 text-gray-400">📦</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {item.product?.name || 'Product not available'}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Số lượng: {item.quantity} × {formatVND(parseFloat(item.price) / item.quantity)}
                                                </p>
                                                {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                                                    <div className="mt-1">
                                                        {item.customizations.map((c, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1"
                                                            >
                                                                {c.type}: {c.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatVND(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    Tổng cộng: {formatVND(parseFloat(order.totalPrice || '0'))}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedStatus === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${getOrderStatusText(selectedStatus).toLowerCase()}`}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {selectedStatus === 'all'
                            ? 'Bắt đầu mua sắm để xem đơn hàng của bạn tại đây.'
                            : `Bạn chưa có đơn hàng nào ở trạng thái ${getOrderStatusText(selectedStatus).toLowerCase()}.`
                        }
                    </p>
                    {selectedStatus === 'all' && (
                        <Link
                            to="/products"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Bắt đầu mua sắm
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrdersPage; 