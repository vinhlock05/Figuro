import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Cart } from '../../services/customerService';
import ToastMessage, { type ToastType } from '../common/ToastMessage';
import { useCart } from '../../contexts/CartContext';
import { formatVND } from '../../utils/currency';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
} from 'lucide-react';

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

    // Toast states
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({
        open: false,
        type: 'success',
        message: ''
    });

    const { decrementCartCount, clearCartCount } = useCart();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const cartData = await customerService.getCart();
            setCart(cartData);
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateItemQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;

        try {
            setUpdatingItems(prev => new Set(prev).add(itemId));
            const updatedCart = await customerService.updateCartItem(itemId, quantity);
            setCart(updatedCart);
        } catch (error) {
            console.error('Error updating item quantity:', error);
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            setUpdatingItems(prev => new Set(prev).add(itemId));
            const updatedCart = await customerService.removeFromCart(itemId);
            setCart(updatedCart);
            decrementCartCount();
            setToast({
                open: true,
                type: 'success',
                message: 'Sản phẩm đã được xóa khỏi giỏ hàng!'
            });
        } catch (error) {
            console.error('Error removing item:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.'
            });
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const clearCart = async () => {
        try {
            await customerService.clearCart();
            setCart({ id: 0, userId: 0, createdAt: '', items: [], total: 0, itemCount: 0 });
            clearCartCount();
            setToast({
                open: true,
                type: 'success',
                message: 'Giỏ hàng đã được làm trống!'
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể làm trống giỏ hàng. Vui lòng thử lại.'
            });
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                <p className="text-gray-500 mb-6">
                    Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.
                </p>
                <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Bắt đầu mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
                    <p className="text-gray-600">
                        {cart.itemCount} sản phẩm trong giỏ hàng
                    </p>
                </div>

                <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Làm trống giỏ hàng
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Sản phẩm trong giỏ hàng</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {cart.items.map((item) => (
                                <div key={item.id} className="p-6">
                                    <div className="flex items-center">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
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

                                        {/* Product Details */}
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {item.product?.name || `Product ${item.productId}`}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {item.product?.category?.name || 'Unknown Category'}
                                                    </p>
                                                    {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                                                        <div className="mt-1">
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                Giá gốc: {formatVND(parseFloat(item.product?.price || '0'))}
                                                            </p>
                                                            {item.customizations.map((c, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mr-1 mb-1"
                                                                >
                                                                    {c.type}: {c.value}
                                                                    {c.priceDelta && c.priceDelta > 0 && (
                                                                        <span className="ml-1 text-green-600">
                                                                            (+{formatVND(c.priceDelta)})
                                                                        </span>
                                                                    )}
                                                                    {c.priceDelta && c.priceDelta < 0 && (
                                                                        <span className="ml-1 text-red-600">
                                                                            ({formatVND(c.priceDelta)})
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id.toString())}
                                                    disabled={updatingItems.has(item.id.toString())}
                                                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>

                                            {/* Quantity and Price */}
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                                                    <div className="flex items-center border border-gray-300 rounded-md">
                                                        <button
                                                            onClick={() => updateItemQuantity(item.id.toString(), item.quantity - 1)}
                                                            disabled={updatingItems.has(item.id.toString()) || item.quantity <= 1}
                                                            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                                                            {updatingItems.has(item.id.toString()) ? '...' : item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateItemQuantity(item.id.toString(), item.quantity + 1)}
                                                            disabled={updatingItems.has(item.id.toString())}
                                                            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {formatVND(item.price)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatVND(parseFloat(item.price) / item.quantity)} mỗi sản phẩm
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow sticky top-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Tóm tắt đơn hàng</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Subtotal */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="font-medium text-gray-900">
                                    {formatVND(cart.total || 0)}
                                </span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-medium text-gray-900">Miễn phí</span>
                            </div>

                            {/* Tax */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Thuế (8%)</span>
                                <span className="font-medium text-gray-900">
                                    {formatVND((cart.total || 0) * 0.08)}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-lg font-medium text-gray-900">Tổng cộng</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {formatVND((cart.total || 0) * 1.08)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Bao gồm thuế và phí vận chuyển
                                </p>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                            >
                                Tiến hành thanh toán
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>

                            {/* Continue Shopping */}
                            <Link
                                to="/products"
                                className="block text-center text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Message */}
            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
};

export default CartPage; 