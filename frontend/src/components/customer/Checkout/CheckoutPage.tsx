import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useToast } from '../../../contexts/ToastContext';
import { customerService } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import PaymentMethodSelector from './PaymentMethodSelector';
import {
    Package
} from 'lucide-react';
import type { Address, Cart } from '../../../services/customerService';

interface CheckoutFormData {
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: string;
    useSameAddress: boolean;
}

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { clearCartCount } = useCart();
    const { showToast } = useToast();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState<CheckoutFormData>({
        shippingAddress: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Vietnam'
        },
        billingAddress: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Vietnam'
        },
        paymentMethod: 'momo',
        useSameAddress: true
    });

    // Set billing address to shipping address by default
    useEffect(() => {
        if (formData.useSameAddress) {
            setFormData(prev => ({
                ...prev,
                billingAddress: prev.shippingAddress
            }));
        }
    }, [formData.shippingAddress, formData.useSameAddress]);

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
                title: 'Cart Error',
                message: 'Cannot load cart. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: 'shippingAddress' | 'billingAddress', key: keyof Address, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [key]: value
            }
        }));
    };


    const handlePaymentMethodChange = (method: string) => {
        setFormData(prev => ({
            ...prev,
            paymentMethod: method
        }));
    };

    const validateForm = (): boolean => {
        const { shippingAddress, billingAddress } = formData;

        const requiredFields: (keyof Address)[] = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];

        for (const field of requiredFields) {
            if (!shippingAddress[field] || !billingAddress[field]) {
                showToast({
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Please fill in all required shipping and billing information.'
                });
                return false;
            }
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!cart || cart.items.length === 0) {
            showToast({
                type: 'error',
                title: 'Cart Error',
                message: 'Cart is empty. Please add products before placing an order.'
            });
            return;
        }

        if (!validateForm()) return;

        try {
            setProcessing(true);

            // Convert addresses to string format for backend
            const shippingAddressString = `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}, ${formData.shippingAddress.address}, ${formData.shippingAddress.city}, ${formData.shippingAddress.state} ${formData.shippingAddress.zipCode}, ${formData.shippingAddress.country}`;

            const billingAddressString = formData.useSameAddress
                ? shippingAddressString
                : `${formData.billingAddress.firstName} ${formData.billingAddress.lastName}, ${formData.billingAddress.address}, ${formData.billingAddress.city}, ${formData.billingAddress.state} ${formData.billingAddress.zipCode}, ${formData.billingAddress.country}`;

            const orderData = {
                items: cart.items,
                shippingAddress: shippingAddressString,
                billingAddress: billingAddressString,
                paymentMethod: formData.paymentMethod
            };

            const order = await customerService.placeOrder(orderData);

            // Clear cart count after successful order
            clearCartCount();

            // Handle different payment methods
            switch (formData.paymentMethod) {
                case 'cod':
                    // Cash on Delivery - no payment processing needed
                    showToast({
                        type: 'success',
                        title: 'Order Success',
                        message: 'Order placed successfully! You will pay with cash upon delivery.'
                    });

                    // Redirect to order confirmation
                    setTimeout(() => {
                        navigate(`/orders/${order.id}`);
                    }, 2000);
                    break;

                case 'momo':
                case 'zalopay':
                case 'vnpay':
                    // Digital payment methods - create payment and redirect
                    try {
                        const paymentResult = await customerService.createPayment(order.id, formData.paymentMethod);

                        if (paymentResult.success && paymentResult.paymentUrl) {
                            const paymentNames = {
                                'momo': 'MoMo Wallet',
                                'zalopay': 'ZaloPay',
                                'vnpay': 'VNPAY'
                            };

                            showToast({
                                type: 'success',
                                title: 'Payment Redirect',
                                message: `Order created! Redirecting to ${paymentNames[formData.paymentMethod]}...`
                            });

                            // Redirect to payment gateway
                            setTimeout(() => {
                                window.location.href = paymentResult.paymentUrl as string;
                            }, 1500);
                            return;
                        } else {
                            throw new Error(paymentResult.error || 'Cannot create payment');
                        }
                    } catch (error) {
                        console.error('Payment creation error:', error);
                        showToast({
                            type: 'error',
                            title: 'Payment Error',
                            message: `Cannot create ${formData.paymentMethod.toUpperCase()} payment. Please try again or choose a different payment method.`
                        });
                        return;
                    }
                    break;

                default:
                    showToast({
                        type: 'error',
                        title: 'Invalid Payment',
                        message: 'Invalid payment method selected.'
                    });
                    return;
            }

        } catch (error) {
            console.error('Error placing order:', error);
            showToast({
                type: 'error',
                title: 'Order Error',
                message: 'Cannot place order. Please try again.'
            });
        } finally {
            setProcessing(false);
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
                <div className="mx-auto h-16 w-16 text-gray-400 mb-6">🛒</div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Empty Cart</h3>
                <p className="text-gray-500 mb-8 text-lg">
                    Please add products to your cart before checkout.
                </p>
                <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    const subtotal = cart.total || 0;
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                        <div className="relative">

                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                    Checkout
                                </h1>
                                <p className="text-lg text-neutral-600 dark:text-neutral-300">
                                    Complete your order and secure your purchase
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Shipping Information</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress.firstName}
                                            onChange={(e) => handleInputChange('shippingAddress', 'firstName', e.target.value)}
                                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress.lastName}
                                            onChange={(e) => handleInputChange('shippingAddress', 'lastName', e.target.value)}
                                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.shippingAddress.email}
                                        onChange={(e) => handleInputChange('shippingAddress', 'email', e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.shippingAddress.phone}
                                        onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Address</label>
                                    <input
                                        type="text"
                                        value={formData.shippingAddress.address}
                                        onChange={(e) => handleInputChange('shippingAddress', 'address', e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                        placeholder="Enter street address"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress.city}
                                            onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">State/Province</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress.state}
                                            onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                            placeholder="Enter state"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">ZIP Code</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress.zipCode}
                                            onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                            placeholder="Enter ZIP code"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Payment Information</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Payment Method Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Payment Method</label>
                                    <PaymentMethodSelector
                                        selectedMethod={formData.paymentMethod}
                                        onMethodChange={handlePaymentMethodChange}
                                    />
                                </div>

                                {/* Payment Form Fields - Dynamic based on selected method */}
                                {formData.paymentMethod !== 'cod' && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                                            <div className="flex items-center space-x-2 mb-3">
                                                {formData.paymentMethod === 'momo' && <span className="text-2xl">💜</span>}
                                                {formData.paymentMethod === 'zalopay' && <span className="text-2xl">💙</span>}
                                                {formData.paymentMethod === 'vnpay' && <span className="text-2xl">💚</span>}
                                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                    {formData.paymentMethod === 'momo' && 'MoMo Wallet Payment'}
                                                    {formData.paymentMethod === 'zalopay' && 'ZaloPay Payment'}
                                                    {formData.paymentMethod === 'vnpay' && 'VNPAY Payment'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {formData.paymentMethod === 'momo' && 'You will be redirected to MoMo app to complete payment'}
                                                {formData.paymentMethod === 'zalopay' && 'You will be redirected to ZaloPay to complete payment'}
                                                {formData.paymentMethod === 'vnpay' && 'You will be redirected to VNPAY to complete payment'}
                                            </p>
                                        </div>

                                        {/* Digital Payment Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Payment Gateway</label>
                                                <input
                                                    type="text"
                                                    value={
                                                        formData.paymentMethod === 'momo' ? 'MoMo Wallet' :
                                                            formData.paymentMethod === 'zalopay' ? 'ZaloPay' :
                                                                formData.paymentMethod === 'vnpay' ? 'VNPAY' : ''
                                                    }
                                                    className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Payment Status</label>
                                                <input
                                                    type="text"
                                                    value="Pending - Will redirect to payment gateway"
                                                    className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* COD Specific Information */}
                                {formData.paymentMethod === 'cod' && (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-2xl">💵</span>
                                            <span className="font-medium text-green-800 dark:text-green-200">Cash on Delivery</span>
                                        </div>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Pay with cash when your order is delivered. No upfront payment required.
                                        </p>
                                        <div className="mt-3 p-3 bg-white dark:bg-neutral-800 rounded-lg border border-green-200 dark:border-green-700">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-700 dark:text-green-300">Payment Amount:</span>
                                                <span className="font-medium text-green-800 dark:text-green-200">
                                                    {formatVND(total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Order Notes (Optional)</h2>
                            </div>
                            <div className="p-6">
                                <textarea
                                    placeholder="Add any special instructions or notes for your order..."
                                    rows={4}
                                    className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200 resize-none"
                                />
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
                                {/* Cart Items */}
                                <div className="space-y-3">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.product?.imageUrl ? (
                                                    <img
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                                    {item.product?.name || `Product ${item.productId}`}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                                {formatVND(item.price)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="border-t-2 border-neutral-200 dark:border-neutral-600 pt-4 space-y-3">
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Subtotal</span>
                                        <span>{formatVND(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Shipping</span>
                                        <span>{formatVND(shipping)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>Tax</span>
                                        <span>{formatVND(tax)}</span>
                                    </div>
                                    <div className="border-t-2 border-neutral-200 dark:border-neutral-600 pt-3">
                                        <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                            <span>Total</span>
                                            <span>{formatVND(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Summary */}
                                <div className="border-t-2 border-neutral-200 dark:border-neutral-600 pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Payment Method:</span>
                                        <div className="flex items-center space-x-2">
                                            {formData.paymentMethod === 'momo' && <span className="text-xl">💜</span>}
                                            {formData.paymentMethod === 'zalopay' && <span className="text-xl">💙</span>}
                                            {formData.paymentMethod === 'vnpay' && <span className="text-xl">💚</span>}
                                            {formData.paymentMethod === 'cod' && <span className="text-xl">💵</span>}
                                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {formData.paymentMethod === 'momo' && 'MoMo'}
                                                {formData.paymentMethod === 'zalopay' && 'ZaloPay'}
                                                {formData.paymentMethod === 'vnpay' && 'VNPAY'}
                                                {formData.paymentMethod === 'cod' && 'Cash on Delivery'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Method Details */}
                                    <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                            {formData.paymentMethod === 'cod' && 'Pay with cash when your order is delivered'}
                                            {formData.paymentMethod === 'momo' && 'Complete payment through MoMo app'}
                                            {formData.paymentMethod === 'zalopay' && 'Complete payment through ZaloPay app'}
                                            {formData.paymentMethod === 'vnpay' && 'Complete payment through VNPAY gateway'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t-2 border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={processing}
                                    className="w-full h-12 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin-slow rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            {formData.paymentMethod === 'cod' && <span>💵</span>}
                                            {formData.paymentMethod === 'momo' && <span>💜</span>}
                                            {formData.paymentMethod === 'zalopay' && <span>💙</span>}
                                            {formData.paymentMethod === 'vnpay' && <span>💚</span>}
                                            <span>
                                                {formData.paymentMethod === 'cod' && 'Place Order (Pay on Delivery)'}
                                                {formData.paymentMethod === 'momo' && 'Place Order & Pay with MoMo'}
                                                {formData.paymentMethod === 'zalopay' && 'Place Order & Pay with ZaloPay'}
                                                {formData.paymentMethod === 'vnpay' && 'Place Order & Pay with VNPAY'}
                                            </span>
                                        </div>
                                    )}
                                </button>
                                <div className="mt-4 text-center">
                                    <Link
                                        to="/cart"
                                        className="text-brand hover:text-brand-dark font-medium transition-colors duration-200"
                                    >
                                        Back to Cart
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Message */}
            {/* The ToastMessage component is no longer used, but the context provides the showToast function */}
        </div>
    );
};

export default CheckoutPage; 