import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { useLocation } from 'react-router-dom';
import OrderList from './OrderList';
import OrderSearch from './OrderSearch';
import OrderSort, { type SortConfig } from './OrderSort';
import OrderPagination from './OrderPagination';
import type { Order } from '../../../services/adminService';

import ConfirmationDialog from '../../common/ConfirmationDialog';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';
import { formatVND } from '../../../utils/currency';
import { useOrderSorting } from '../../../hooks/useOrderSorting';

export const OrdersManagement: React.FC = () => {
    const {
        orders,
        isLoadingOrders,
        fetchOrders,
        updateOrderStatus,
        getOrderDetails,
        deleteOrder
    } = useAdmin();

    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderDetails, setOrderDetails] = useState<Order | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; orderId: number | null; status: Order['status'] | null }>({ open: false, orderId: null, status: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({ open: false, type: 'success', message: '' });

    useEffect(() => {
        const fetch = async () => {
            const result = await fetchOrders({ page, limit });
            if (result && result.pagination) {
                setTotalPages(result.pagination.pages);
            }
        };
        fetch();
        // eslint-disable-next-line
    }, [page, limit, location.pathname]);

    const handleStatusUpdate = (orderId: number, status: Order['status']) => {
        setConfirmDialog({ open: true, orderId, status });
    };

    const confirmStatusUpdate = async () => {
        if (confirmDialog.orderId == null || !confirmDialog.status) return;
        try {
            await updateOrderStatus(confirmDialog.orderId, confirmDialog.status);
            setToast({ open: true, type: 'success', message: 'Order status updated successfully.' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to update order status.' });
        } finally {
            setConfirmDialog({ open: false, orderId: null, status: null });
        }
    };

    const handleViewDetails = async (order: Order) => {
        setSelectedOrder(order);
        setIsLoadingDetails(true);
        try {
            const details = await getOrderDetails(order.id);
            setOrderDetails(details);
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to fetch order details.' });
            setOrderDetails(null);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleDeleteOrder = (orderId: number) => {
        setDeleteDialog({ open: true, orderId });
    };

    const confirmDeleteOrder = async () => {
        if (deleteDialog.orderId == null) return;
        try {
            await deleteOrder(deleteDialog.orderId);
            setToast({ open: true, type: 'success', message: 'Order deleted successfully.' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to delete order.' });
        } finally {
            setDeleteDialog({ open: false, orderId: null });
        }
    };

    // Filter orders based on search term
    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply sorting to filtered orders
    const sortedOrders = useOrderSorting(filteredOrders, sortConfig);

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600">Manage orders and track status</p>
            </div>
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <OrderSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <OrderSort sortConfig={sortConfig} onSortChange={setSortConfig} />
            </div>
            {/* Orders table */}
            {isLoadingOrders ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <OrderList orders={sortedOrders} onViewDetails={handleViewDetails} onStatusUpdate={handleStatusUpdate} onDeleteOrder={handleDeleteOrder} />
            )}
            {/* Pagination UI */}
            <OrderPagination page={page} totalPages={totalPages} setPage={setPage} />
            {/* Order details modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Order Details #{selectedOrder.id}
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        setOrderDetails(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {isLoadingDetails ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : orderDetails ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                            <p className="text-sm text-gray-900">{orderDetails.status}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                                            <p className="text-sm text-gray-900">{formatVND(orderDetails.totalPrice)}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Created</h4>
                                            <p className="text-sm text-gray-900">
                                                {new Date(orderDetails.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Updated</h4>
                                            <p className="text-sm text-gray-900">
                                                {new Date(orderDetails.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                                        <p className="text-sm text-gray-900">{orderDetails.shippingAddress}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                                        <div className="space-y-2">
                                            {orderDetails.items.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-900">{formatVND(item.price)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Failed to load order details</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationDialog
                open={confirmDialog.open}
                title="Update Order Status"
                message={`Are you sure you want to update the status of this order to '${confirmDialog.status}'?`}
                confirmText="Update"
                cancelText="Cancel"
                onConfirm={confirmStatusUpdate}
                onCancel={() => setConfirmDialog({ open: false, orderId: null, status: null })}
            />
            <ConfirmationDialog
                open={deleteDialog.open}
                title="Delete Order"
                message="Are you sure you want to delete this order? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeleteOrder}
                onCancel={() => setDeleteDialog({ open: false, orderId: null })}
            />
            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, open: false }))}
            />
        </div>
    );
};

export default OrdersManagement;