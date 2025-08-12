import { useMemo } from 'react';
import type { Order } from '../services/adminService';
import type { SortConfig } from '../components/admin/orders/OrderSort';

export const useOrderSorting = (orders: Order[], sortConfig: SortConfig) => {
    const sortedOrders = useMemo(() => {
        if (!orders.length) return orders;

        const sorted = [...orders].sort((a, b) => {
            const { field, direction } = sortConfig;
            let aValue: any;
            let bValue: any;

            switch (field) {
                case 'product':
                    // Get first product name from items, or empty string if no items
                    aValue = a.items[0]?.productName || '';
                    bValue = b.items[0]?.productName || '';
                    break;

                case 'customer':
                    aValue = a.user?.name || '';
                    bValue = b.user?.name || '';
                    break;

                case 'date':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;

                case 'price':
                    aValue = parseFloat(a.totalPrice) || 0;
                    bValue = parseFloat(b.totalPrice) || 0;
                    break;

                case 'status':
                    // Define status order for sorting
                    const statusOrder = {
                        'pending': 1,
                        'confirmed': 2,
                        'processing': 3,
                        'shipped': 4,
                        'delivered': 5,
                        'cancelled': 6,
                        'refunded': 7
                    };
                    aValue = statusOrder[a.status] || 0;
                    bValue = statusOrder[b.status] || 0;
                    break;

                default:
                    return 0;
            }

            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue, 'vi-VN', { sensitivity: 'base' });
                return direction === 'asc' ? comparison : -comparison;
            }

            // Handle number comparison
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        return sorted;
    }, [orders, sortConfig]);

    return sortedOrders;
};

export default useOrderSorting;