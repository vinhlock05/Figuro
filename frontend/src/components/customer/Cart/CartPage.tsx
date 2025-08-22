import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { customerService } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import { useToast } from '../../../contexts/ToastContext';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Package
} from 'lucide-react';
import type { Cart } from '../../../services/customerService';

const CartPage: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

    const { decrementCartCount } = useCart();
    const { showToast } = useToast();

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
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load cart',
                duration: 5000
            });
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
            showToast({
                type: 'success',
                title: 'Cart Updated',
                message: 'Item quantity updated successfully',
                duration: 3000
            });
        } catch (error) {
            console.error('Error updating item quantity:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to update item quantity',
                duration: 5000
            });
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
            showToast({
                type: 'success',
                title: 'Item Removed',
                message: 'Product has been removed from cart!',
                duration: 3000
            });
        } catch (error) {
            console.error('Error removing item:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Cannot remove product from cart. Please try again.',
                duration: 5000
            });
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
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
            <div className="text-center py-16 px-6">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-4">Empty Cart</h3>
                <p className="text-gray-500 mb-8 text-lg">
                    It looks like you haven't added any products to your cart yet.
                </p>
                <Link
                    to="/products"
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                        <div className="relative">

                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                    Shopping Cart
                                </h1>
                                <p className="text-lg text-neutral-600 dark:text-neutral-300">
                                    {cart.items.length > 0 ? `You have ${cart.items.length} item${cart.items.length > 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin-slow rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-neutral-500 dark:text-neutral-400">Loading your cart...</p>
                    </div>
                ) : cart.items.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Cart Items</h2>
                                </div>
                                <div className="divide-y-2 divide-neutral-100 dark:divide-neutral-700">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="p-6">
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image */}
                                                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-700 rounded-xl flex-shrink-0 overflow-hidden">
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
                                                    {/* Customizations */}
                                                    {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.customizations.map((c, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                                                    >
                                                                        {c.type}: {c.value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="text-lg font-bold text-brand">{formatVND(item.price)}</p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateItemQuantity(item.id.toString(), item.quantity - 1)}
                                                        disabled={updatingItems.has(item.id.toString()) || item.quantity <= 1}
                                                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-12 text-center text-lg font-medium text-neutral-900 dark:text-neutral-100">
                                                        {updatingItems.has(item.id.toString()) ? '...' : item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateItemQuantity(item.id.toString(), item.quantity + 1)}
                                                        disabled={updatingItems.has(item.id.toString())}
                                                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeItem(item.id.toString())}
                                                    disabled={updatingItems.has(item.id.toString())}
                                                    className="p-2 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden sticky top-8">
                                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Order Summary</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Subtotal ({cart.items.length} items)</span>
                                        <span>{formatVND(cart.total || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Shipping</span>
                                        <span>{formatVND(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Tax (8%)</span>
                                        <span>{formatVND((cart.total || 0) * 0.08)}</span>
                                    </div>
                                    <div className="border-t-2 border-neutral-200 dark:border-neutral-600 pt-4">
                                        <div className="flex justify-between text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                            <span>Total</span>
                                            <span>{formatVND((cart.total || 0) * 1.08)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t-2 border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                                    <Link
                                        to="/checkout"
                                        className="w-full h-12 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium flex items-center justify-center"
                                    >
                                        Proceed to Checkout
                                    </Link>
                                    <div className="mt-4 text-center">
                                        <Link
                                            to="/products"
                                            className="text-brand hover:text-brand-dark font-medium transition-colors duration-200"
                                        >
                                            Continue Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-12 max-w-md mx-auto">
                            <ShoppingCart className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Your cart is empty</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                                Looks like you haven't added any items to your cart yet.
                            </p>
                            <Link
                                to="/products"
                                className="inline-block px-8 py-3 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Message */}
            {/* The ToastMessage component is now managed by ToastContext, so this section is no longer needed. */}
        </div>
    );
};

export default CartPage; 