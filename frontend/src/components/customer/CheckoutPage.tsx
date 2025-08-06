import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Cart, Address } from '../../services/customerService';
import { formatVND } from '../../utils/currency';
import ToastMessage, { type ToastType } from '../common/ToastMessage';
import { useCart } from '../../contexts/CartContext';
import {
    CreditCard,
    Truck,
    MapPin,
    User,
    Phone,
    Mail,
    ArrowLeft,
    Lock,
    Shield,
    CheckCircle
} from 'lucide-react';

interface CheckoutFormData {
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: string;
    useSameAddress: boolean;
}

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { clearCartCount } = useCart();
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

    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({
        open: false,
        type: 'success',
        message: ''
    });

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
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể tải giỏ hàng. Vui lòng thử lại.'
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

    const handleUseSameAddress = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            useSameAddress: checked,
            billingAddress: checked ? prev.shippingAddress : {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'Vietnam'
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
                setToast({
                    open: true,
                    type: 'error',
                    message: 'Vui lòng điền đầy đủ thông tin giao hàng và thanh toán.'
                });
                return false;
            }
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!cart || cart.items.length === 0) {
            setToast({
                open: true,
                type: 'error',
                message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.'
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

            // Handle payment method redirects
            if (formData.paymentMethod !== 'cod') {
                try {
                    // Create payment for digital payment methods
                    const paymentResult = await customerService.createPayment(order.id, formData.paymentMethod);

                    if (paymentResult.success && paymentResult.paymentUrl) {
                        setToast({
                            open: true,
                            type: 'success',
                            message: 'Đơn hàng đã được tạo! Đang chuyển đến trang thanh toán...'
                        });

                        // Redirect to actual payment gateway
                        setTimeout(() => {
                            window.open(paymentResult.paymentUrl, '_blank');
                            navigate(`/orders/${order.id}`);
                        }, 1500);
                        return;
                    } else {
                        throw new Error(paymentResult.error || 'Không thể tạo thanh toán');
                    }
                } catch (error) {
                    console.error('Payment creation error:', error);
                    setToast({
                        open: true,
                        type: 'error',
                        message: 'Không thể tạo thanh toán. Vui lòng thử lại.'
                    });
                    return;
                }
            }

            setToast({
                open: true,
                type: 'success',
                message: 'Đặt hàng thành công! Chúng tôi sẽ gửi email xác nhận.'
            });

            // Redirect to order confirmation
            setTimeout(() => {
                navigate(`/orders/${order.id}`);
            }, 2000);

        } catch (error) {
            console.error('Error placing order:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể đặt hàng. Vui lòng thử lại.'
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
            <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">🛒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                <p className="text-gray-500 mb-6">
                    Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
                </p>
                <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        );
    }

    const subtotal = cart.total || 0;
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay lại giỏ hàng
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Forms */}
                <div className="space-y-8">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <Truck className="h-5 w-5 text-indigo-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-900">Địa chỉ giao hàng</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
                                <input
                                    type="text"
                                    value={formData.shippingAddress.firstName}
                                    onChange={(e) => handleInputChange('shippingAddress', 'firstName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                                <input
                                    type="text"
                                    value={formData.shippingAddress.lastName}
                                    onChange={(e) => handleInputChange('shippingAddress', 'lastName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={formData.shippingAddress.email}
                                onChange={(e) => handleInputChange('shippingAddress', 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                            <input
                                type="tel"
                                value={formData.shippingAddress.phone}
                                onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                            <input
                                type="text"
                                value={formData.shippingAddress.address}
                                onChange={(e) => handleInputChange('shippingAddress', 'address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố *</label>
                                <input
                                    type="text"
                                    value={formData.shippingAddress.city}
                                    onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                                <input
                                    type="text"
                                    value={formData.shippingAddress.state}
                                    onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã bưu điện *</label>
                                <input
                                    type="text"
                                    value={formData.shippingAddress.zipCode}
                                    onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
                                <h2 className="text-lg font-medium text-gray-900">Địa chỉ thanh toán</h2>
                            </div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.useSameAddress}
                                    onChange={(e) => handleUseSameAddress(e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Dùng địa chỉ giao hàng</span>
                            </label>
                        </div>

                        {!formData.useSameAddress && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
                                        <input
                                            type="text"
                                            value={formData.billingAddress.firstName}
                                            onChange={(e) => handleInputChange('billingAddress', 'firstName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                                        <input
                                            type="text"
                                            value={formData.billingAddress.lastName}
                                            onChange={(e) => handleInputChange('billingAddress', 'lastName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.billingAddress.email}
                                        onChange={(e) => handleInputChange('billingAddress', 'email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        value={formData.billingAddress.phone}
                                        onChange={(e) => handleInputChange('billingAddress', 'phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                                    <input
                                        type="text"
                                        value={formData.billingAddress.address}
                                        onChange={(e) => handleInputChange('billingAddress', 'address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố *</label>
                                        <input
                                            type="text"
                                            value={formData.billingAddress.city}
                                            onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                                        <input
                                            type="text"
                                            value={formData.billingAddress.state}
                                            onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã bưu điện *</label>
                                        <input
                                            type="text"
                                            value={formData.billingAddress.zipCode}
                                            onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center mb-4">
                            <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-900">Phương thức thanh toán</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="momo"
                                    checked={formData.paymentMethod === 'momo'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center text-white font-bold text-sm">M</div>
                                        <span className="ml-2 font-medium">MoMo</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Thanh toán qua ví MoMo (sẽ mở trang thanh toán)</p>
                                </div>
                            </label>

                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="zalopay"
                                    checked={formData.paymentMethod === 'zalopay'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">Z</div>
                                        <span className="ml-2 font-medium">ZaloPay</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Thanh toán qua ZaloPay (sẽ mở trang thanh toán)</p>
                                </div>
                            </label>

                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="vnpay"
                                    checked={formData.paymentMethod === 'vnpay'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">V</div>
                                        <span className="ml-2 font-medium">VNPAY</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Thanh toán qua VNPAY (sẽ mở trang thanh toán)</p>
                                </div>
                            </label>

                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={formData.paymentMethod === 'cod'}
                                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-sm">C</div>
                                        <span className="ml-2 font-medium">Tiền mặt khi nhận hàng</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Thanh toán khi nhận hàng (không cần thanh toán trước)</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow sticky top-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Tóm tắt đơn hàng</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Cart Items */}
                            <div className="space-y-3">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            {item.product?.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                                    <div className="h-6 w-6 text-gray-400">📦</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {item.product?.name || `Product ${item.productId}`}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Số lượng: {item.quantity}
                                            </p>
                                            {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                                                <div className="mt-1">
                                                    {item.customizations.map((c, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1"
                                                        >
                                                            {c.type}: {c.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatVND(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="font-medium text-gray-900">{formatVND(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="font-medium text-gray-900">Miễn phí</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Thuế (8%)</span>
                                    <span className="font-medium text-gray-900">{formatVND(tax)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-medium text-gray-900">Tổng cộng</span>
                                        <span className="text-lg font-bold text-gray-900">{formatVND(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Thanh toán an toàn</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Thông tin thanh toán của bạn được mã hóa và bảo mật.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Đặt hàng
                                    </>
                                )}
                            </button>
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

export default CheckoutPage; 