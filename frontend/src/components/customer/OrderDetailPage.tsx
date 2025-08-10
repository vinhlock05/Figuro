import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Order } from '../../services/customerService';
import { formatVND } from '../../utils/currency';
import {
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Truck,
    ArrowLeft,
    Calendar,
    DollarSign,
    MapPin,
    User,
    Phone,
    Mail
} from 'lucide-react';

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const orderData = await customerService.getOrder(orderId!);
            setOrder(orderData);
        } catch (error) {
            console.error('Error loading order:', error);
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

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            case 'failed':
                return 'Thanh toán thất bại';
            default:
                return status;
        }
    };

    const handlePayAgain = async () => {
        if (!order) return;
        if (order.paymentMethod === 'cod') return;
        try {
            setProcessingPayment(true);
            const result = await customerService.createPayment(order.id, order.paymentMethod as string);
            if (result.success && result.paymentUrl) {
                const redirectUrl = result.paymentUrl as string;
                window.location.href = redirectUrl;
            } else {
                setProcessingPayment(false);
                console.error('Recreate payment failed:', result.error || 'unknown_error');
            }
        } catch (error) {
            setProcessingPayment(false);
            console.error('Recreate payment error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-500 mb-6">
                    Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <Link
                    to="/orders"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Quay lại danh sách đơn hàng
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        to="/orders"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay lại đơn hàng
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                {getOrderStatusIcon(order.status)}
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">Trạng thái đơn hàng</h2>
                                    <p className="text-sm text-gray-500">
                                        Đặt hàng ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                    {getOrderStatusText(order.status)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {getPaymentStatusText(order.paymentStatus)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm đã đặt</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                        {item.product?.imageUrl ? (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                                <div className="h-8 w-8 text-gray-400">📦</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {item.product?.name || 'Sản phẩm không khả dụng'}
                                        </h3>
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
                                            {formatVND(parseFloat(item.price))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="font-medium text-gray-900">{formatVND(parseFloat(order.totalPrice))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-medium text-gray-900">Miễn phí</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-lg font-medium text-gray-900">Tổng cộng</span>
                                    <span className="text-lg font-bold text-gray-900">{formatVND(parseFloat(order.totalPrice))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-900">Địa chỉ giao hàng</h2>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>{order.shippingAddress}</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-900">Phương thức thanh toán</h2>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>
                                {order.paymentMethod === 'momo' ? 'MoMo' :
                                    order.paymentMethod === 'zalopay' ? 'ZaloPay' :
                                        order.paymentMethod === 'vnpay' ? 'VNPAY' :
                                            order.paymentMethod === 'cod' ? 'Tiền mặt khi nhận hàng' :
                                                order.paymentMethod}
                            </p>
                        </div>
                        {order.paymentStatus !== 'paid' && order.paymentMethod !== 'cod' && order.status !== 'cancelled' && (
                            <div className="mt-4">
                                <button
                                    onClick={handlePayAgain}
                                    disabled={processingPayment}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {processingPayment ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang chuyển đến cổng thanh toán...
                                        </>
                                    ) : (
                                        <>Thanh toán lại</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage; 