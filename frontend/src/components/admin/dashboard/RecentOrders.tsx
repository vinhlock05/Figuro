import React from 'react';
import { ShoppingCart, Calendar } from 'lucide-react';
import type { Order } from '../../../services/adminService';
import { formatVND } from '../../../utils/currency';

interface RecentOrdersProps {
    recentOrders: Order[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ recentOrders }) => (
    <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-black mb-4">
                Recent Orders
            </h3>
            {(!recentOrders || recentOrders.length === 0) ? (
                <div className="text-center py-8 text-black">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-black" />
                    <p className="text-sm">No recent orders found</p>
                    <p className="text-xs text-black/70 mt-1">Orders will appear here once customers place them</p>
                </div>
            ) : (
                <div className="flow-root">
                    <ul className="-my-5 divide-y divide-border">
                        {recentOrders.slice(0, 5).map((order) => (
                            <li key={order.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <ShoppingCart className="h-8 w-8 text-black" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-black truncate">
                                            Order #{order.id}
                                        </p>
                                        <p className="text-sm text-black">
                                            {formatVND(order.totalPrice)} • {order.items.length} items
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : order.status === 'shipped'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : order.status === 'processing'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                        : 'bg-muted text-black'
                                                }`}
                                        >
                                            {String(order.status)}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 text-sm text-black">
                                        <Calendar className="h-4 w-4 inline mr-1" />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
);

export default RecentOrders; 