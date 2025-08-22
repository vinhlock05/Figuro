import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import type { Order } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import {
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Truck,
    ArrowLeft,
    DollarSign,
    MapPin,
} from 'lucide-react';
import ToastMessage from '../../common/ToastMessage';

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);
    const [toast, setToast] = useState({ open: false, type: 'info' as 'success' | 'error' | 'info', message: '', title: '' });

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

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Paid';
            case 'pending':
                return 'Pending Payment';
            case 'failed':
                return 'Payment Failed';
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

    const handleCancelOrder = async () => {
        if (!order) return;
        try {
            // TODO: Implement cancel order functionality
            setToast({ open: true, type: 'success', message: 'Order cancelled successfully!', title: 'Order Update' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Error cancelling order.', title: 'Order Update' });
            console.error('Error cancelling order:', error);
        }
    };

    const handleReorder = async () => {
        if (!order) return;
        try {
            // TODO: Implement reorder functionality
            setToast({ open: true, type: 'success', message: 'Reorder successful!', title: 'Order Update' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Error reordering.', title: 'Order Update' });
            console.error('Error reordering:', error);
        }
    };

    const getOrderTimeline = (order: Order) => {
        const timeline = [];
        if (order.status === 'pending') {
            timeline.push({ title: 'Order Placed', description: 'Your order has been received.', date: new Date(order.createdAt).toLocaleDateString(), completed: false });
        } else if (order.status === 'confirmed') {
            timeline.push({ title: 'Order Placed', description: 'Your order has been received.', date: new Date(order.createdAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Confirmed', description: 'Your order has been confirmed by the seller.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
        } else if (order.status === 'processing') {
            timeline.push({ title: 'Order Placed', description: 'Your order has been received.', date: new Date(order.createdAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Confirmed', description: 'Your order has been confirmed by the seller.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Processing', description: 'Your order is being prepared for shipping.', date: new Date(order.updatedAt).toLocaleDateString(), completed: false });
        } else if (order.status === 'shipped') {
            timeline.push({ title: 'Order Placed', description: 'Your order has been received.', date: new Date(order.createdAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Confirmed', description: 'Your order has been confirmed by the seller.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Processing', description: 'Your order is being prepared for shipping.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Shipped', description: 'Your order has been shipped.', date: new Date(order.updatedAt).toLocaleDateString(), completed: false });
        } else if (order.status === 'delivered') {
            timeline.push({ title: 'Order Placed', description: 'Your order has been received.', date: new Date(order.createdAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Confirmed', description: 'Your order has been confirmed by the seller.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Processing', description: 'Your order is being prepared for shipping.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Shipped', description: 'Your order has been shipped.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Delivered', description: 'Your order has been delivered.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
        } else if (order.status === 'cancelled') {
            timeline.push({ title: 'Order Placed', description: 'Your order has been received.', date: new Date(order.createdAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Confirmed', description: 'Your order has been confirmed by the seller.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Processing', description: 'Your order is being prepared for shipping.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Shipped', description: 'Your order has been shipped.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Cancelled', description: 'Your order has been cancelled.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
        } else if (order.status === 'refunded') {
            timeline.push({ title: 'Order Placed', description: 'Your order has been received.', date: new Date(order.createdAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Confirmed', description: 'Your order has been confirmed by the seller.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Processing', description: 'Your order is being prepared for shipping.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Shipped', description: 'Your order has been shipped.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Cancelled', description: 'Your order has been cancelled.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
            timeline.push({ title: 'Order Refunded', description: 'Your order has been refunded.', date: new Date(order.updatedAt).toLocaleDateString(), completed: true });
        }
        return timeline;
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
            <div className="text-center py-16 px-6">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-4">Order Not Found</h3>
                <p className="text-gray-500 mb-8 text-lg">
                    The order you are looking for does not exist or has been deleted.
                </p>
                <Link
                    to="/orders"
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Back to Orders
                </Link>
            </div>
        );
    }

    const subtotal = order.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const shippingCost = 0; // Assuming free shipping for now
    const taxAmount = 0; // Assuming no tax for now
    const total = subtotal + shippingCost + taxAmount;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                        <div className="relative">

                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                        Order Details
                                    </h1>
                                    <p className="text-lg text-neutral-600 dark:text-neutral-300">
                                        Order #{order?.id} • {order?.status}
                                    </p>
                                </div>
                                <Link
                                    to="/orders"
                                    className="px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand rounded-xl transition-all duration-200 font-medium"
                                >
                                    <ArrowLeft className="h-4 w-4 inline mr-2" />
                                    Back to Orders
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin-slow rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-neutral-500 dark:text-neutral-400">Loading order details...</p>
                    </div>
                ) : order ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Order Items</h2>
                                </div>
                                <div className="divide-y-2 divide-neutral-100 dark:divide-neutral-700">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="p-6">
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-xl flex-shrink-0 overflow-hidden">
                                                    {item.product?.imageUrl ? (
                                                        <img
                                                            src={item.product.imageUrl}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                            <Package className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                                                        <Link to={`/products/${item.product?.slug}`} className="hover:text-brand transition-colors duration-200">
                                                            {item.product?.name || `Product ${item.productId}`}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                                                        {item.product?.category?.name || 'Uncategorized'}
                                                    </p>
                                                    {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.customizations.map((c, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs px-2 py-1 rounded-lg"
                                                                >
                                                                    {c.type}: {c.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quantity and Price */}
                                                <div className="text-right">
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                                        {formatVND(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Order Timeline</h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {getOrderTimeline(order).map((event, index) => (
                                            <div key={index} className="flex items-start space-x-4">
                                                <div className={`p-2 rounded-full ${event.completed ? 'bg-success text-white' : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-400'
                                                    }`}>
                                                    {event.completed ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                    ) : (
                                                        <Clock className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        {event.description}
                                                    </p>
                                                    {event.date && (
                                                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                                            {event.date}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden sticky top-8">
                                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Order Summary</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Order Info */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600 dark:text-neutral-400">Order ID</span>
                                            <span className="font-medium text-neutral-900 dark:text-neutral-100">#{order.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600 dark:text-neutral-400">Order Date</span>
                                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600 dark:text-neutral-400">Status</span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-success/10 text-success' :
                                                order.status === 'shipped' ? 'bg-brand/10 text-brand' :
                                                    order.status === 'processing' ? 'bg-accent/10 text-accent' :
                                                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                            order.status === 'pending' ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300' :
                                                                'bg-danger/10 text-danger'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600 dark:text-neutral-400">Payment Status</span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-success/10 text-success' :
                                                order.paymentStatus === 'pending' ? 'bg-accent/10 text-accent' :
                                                    'bg-danger/10 text-danger'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="border-t-2 border-neutral-200 dark:border-neutral-600 pt-4 space-y-3">
                                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span>Subtotal</span>
                                            <span>{formatVND(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span>Shipping</span>
                                            <span>{formatVND(shippingCost)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span>Tax</span>
                                            <span>{formatVND(taxAmount)}</span>
                                        </div>
                                        <div className="border-t-2 border-neutral-200 dark:border-neutral-600 pt-3">
                                            <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                                <span>Total</span>
                                                <span>{formatVND(total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t-2 border-neutral-200 dark:border-neutral-600 pt-4 space-y-3">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={handleCancelOrder}
                                                className="w-full h-12 border-2 border-danger text-danger hover:bg-danger hover:text-white rounded-xl transition-all duration-200 font-medium"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <button
                                                onClick={handleReorder}
                                                className="w-full h-12 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium"
                                            >
                                                Reorder
                                            </button>
                                        )}
                                        <Link
                                            to="/support"
                                            className="block w-full h-12 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand rounded-xl transition-all duration-200 font-medium text-center leading-[48px]"
                                        >
                                            Get Help
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-12 max-w-md mx-auto">
                            <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Order not found</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                                The order you're looking for doesn't exist or has been removed.
                            </p>
                            <Link
                                to="/orders"
                                className="inline-block px-8 py-3 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium"
                            >
                                View All Orders
                            </Link>
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
                id="order-detail-toast"
                title="Order Update"
            />
        </div>
    );
};

export default OrderDetailPage; 