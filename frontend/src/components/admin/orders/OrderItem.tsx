import React from 'react';
import { Eye, Package, Truck, CheckCircle, Clock, AlertCircle, CheckSquare, RefreshCw, Trash2 } from 'lucide-react';
import type { Order } from '../../../services/adminService';
import OrderStatusDropdown from './OrderStatusDropdown';
import { formatVND } from '../../../utils/currency';

interface OrderItemProps {
    order: Order;
    onViewDetails: (order: Order) => void;
    onStatusUpdate: (orderId: number, status: Order['status']) => void;
    onDeleteOrder?: (orderId: number) => void;
}

const getStatusIcon = (status: Order['status']) => {
    switch (status) {
        case 'pending':
            return <Clock className="h-4 w-4 text-black" />;
        case 'confirmed':
            return <CheckSquare className="h-4 w-4 text-black" />;
        case 'processing':
            return <Package className="h-4 w-4 text-black" />;
        case 'shipped':
            return <Truck className="h-4 w-4 text-black" />;
        case 'delivered':
            return <CheckCircle className="h-4 w-4 text-black" />;
        case 'cancelled':
            return <AlertCircle className="h-4 w-4 text-black" />;
        case 'refunded':
            return <RefreshCw className="h-4 w-4 text-black" />;
        default:
            return null;
    }
};

const getPaymentStatusIcon = (paymentStatus?: Order['paymentStatus']) => {
    switch (paymentStatus) {
        case 'paid':
            return <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />;
        case 'failed':
            return <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
        case 'pending':
        default:
            return <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
    }
};

const getPaymentStatusText = (paymentStatus?: Order['paymentStatus']) => {
    switch (paymentStatus) {
        case 'paid':
            return 'Paid';
        case 'failed':
            return 'Payment Failed';
        case 'pending':
        default:
            return 'Unpaid';
    }
};

const OrderItem: React.FC<OrderItemProps> = ({ order, onViewDetails, onStatusUpdate, onDeleteOrder }) => (
    <li key={order.id} className="relative">
        <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                    {getStatusIcon(order.status)}
                    <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                            <p className="text-sm font-medium text-black">Order #{order.id}</p>
                            <OrderStatusDropdown
                                currentStatus={order.status}
                                orderId={order.id}
                                onStatusUpdate={onStatusUpdate}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <p className="text-sm text-black truncate">{order.user?.name || 'Unknown Customer'}</p>
                            <div className="flex items-center space-x-1">
                                {getPaymentStatusIcon(order.paymentStatus)}
                                <span className="text-xs text-black">{getPaymentStatusText(order.paymentStatus)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4 ml-4">
                    <div className="text-right">
                        <span className="text-sm font-medium text-black">
                            {formatVND(order.totalPrice)}
                        </span>
                    </div>
                    <button
                        onClick={() => onViewDetails(order)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex-shrink-0"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {onDeleteOrder && (
                        <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                            title="Delete Order"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-black">
                <span>{order.items.length} items</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    </li>
);

export default OrderItem; 