import React from 'react';
import { Eye, Edit, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Order } from '../../../services/adminService';

interface OrderItemProps {
    order: Order;
    onViewDetails: (order: Order) => void;
    onStatusUpdate: (orderId: number, status: Order['status']) => void;
}

const getStatusIcon = (status: Order['status']) => {
    switch (status) {
        case 'pending':
            return <Clock className="h-4 w-4" />;
        case 'processing':
            return <Package className="h-4 w-4" />;
        case 'shipped':
            return <Truck className="h-4 w-4" />;
        case 'delivered':
            return <CheckCircle className="h-4 w-4" />;
        case 'cancelled':
            return <AlertCircle className="h-4 w-4" />;
        default:
            return null;
    }
};

const OrderItem: React.FC<OrderItemProps> = ({ order, onViewDetails, onStatusUpdate }) => (
    <li key={order.id}>
        <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center">
                {getStatusIcon(order.status)}
                <div className="ml-4">
                    <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {order.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{order.user?.name || ''}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={() => onViewDetails(order)} className="text-blue-600 hover:text-blue-900">
                    <Eye className="h-4 w-4" />
                </button>
                <button onClick={() => onStatusUpdate(order.id, 'processing')} className="text-indigo-600 hover:text-indigo-900">
                    <Edit className="h-4 w-4" />
                </button>
            </div>
        </div>
    </li>
);

export default OrderItem; 