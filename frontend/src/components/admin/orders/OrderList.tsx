import React from 'react';
import type { Order } from '../../../services/adminService';
import OrderItem from './OrderItem';

interface OrderListProps {
    orders: Order[];
    onViewDetails: (order: Order) => void;
    onStatusUpdate: (orderId: number, status: Order['status']) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onViewDetails, onStatusUpdate }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders found</div>
        ) : (
            <ul className="divide-y divide-gray-200">
                {orders.map(order => (
                    <OrderItem key={order.id} order={order} onViewDetails={onViewDetails} onStatusUpdate={onStatusUpdate} />
                ))}
            </ul>
        )}
    </div>
);

export default OrderList; 