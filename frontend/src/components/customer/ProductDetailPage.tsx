import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Product, GroupedCustomizationOptions } from '../../services/customerService';
import ToastMessage, { type ToastType } from '../common/ToastMessage';
import { useCart } from '../../contexts/CartContext';
import { formatVND } from '../../utils/currency';
import {
    ShoppingCart,
    Heart,
    Settings,
    ArrowLeft,
    Package,
    X
} from 'lucide-react';

const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [wishlistStatus, setWishlistStatus] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Customization states
    const [showCustomizationModal, setShowCustomizationModal] = useState(false);
    const [customizationOptions, setCustomizationOptions] = useState<GroupedCustomizationOptions>({});
    const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
    const [customizedPrice, setCustomizedPrice] = useState<number | null>(null);
    const [loadingCustomizations, setLoadingCustomizations] = useState(false);

    // Toast states
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({
        open: false,
        type: 'success',
        message: ''
    });

    const { incrementCartCount } = useCart();

    useEffect(() => {
        if (slug) {
            loadProduct();
        }
    }, [slug]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const productData = await customerService.getProduct(slug!);
            setProduct(productData);

            // Check wishlist status
            const isInWishlist = await customerService.isInWishlist(productData.id.toString());
            setWishlistStatus(isInWishlist);
        } catch (error) {
            console.error('Error loading product:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể tải thông tin sản phẩm. Vui lòng thử lại.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            await customerService.addToCart(product.id.toString(), quantity);
            incrementCartCount();
            setToast({
                open: true,
                type: 'success',
                message: 'Sản phẩm đã được thêm vào giỏ hàng!'
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.'
            });
        }
    };

    const handleAddToWishlist = async () => {
        if (!product) return;

        try {
            if (wishlistStatus) {
                await customerService.removeFromWishlist(product.id.toString());
                setWishlistStatus(false);
                setToast({
                    open: true,
                    type: 'success',
                    message: 'Đã xóa sản phẩm khỏi danh sách yêu thích!'
                });
            } else {
                await customerService.addToWishlist(product.id.toString());
                setWishlistStatus(true);
                setToast({
                    open: true,
                    type: 'success',
                    message: 'Đã thêm sản phẩm vào danh sách yêu thích!'
                });
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.'
            });
        }
    };

    const handleCustomizeProduct = async () => {
        if (!product) return;

        setSelectedCustomizations({});
        setCustomizedPrice(null);
        setShowCustomizationModal(true);

        if (product.isCustomizable) {
            setLoadingCustomizations(true);
            try {
                const options = await customerService.getCustomizationOptions(product.id.toString());
                setCustomizationOptions(options);
            } catch (error) {
                console.error('Error loading customization options:', error);
            } finally {
                setLoadingCustomizations(false);
            }
        }
    };

    const handleCustomizationChange = async (optionType: string, optionValue: string) => {
        const newCustomizations = {
            ...selectedCustomizations,
            [optionType]: optionValue
        };
        setSelectedCustomizations(newCustomizations);

        // Calculate new price
        if (product) {
            try {
                const customizationsArray = Object.entries(newCustomizations).map(([type, value]) => ({
                    type,
                    value
                }));
                const result = await customerService.calculateCustomizedPrice(
                    product.id.toString(),
                    customizationsArray
                );
                setCustomizedPrice(result.price);
            } catch (error) {
                console.error('Error calculating price:', error);
            }
        }
    };

    const handleAddCustomizedToCart = async () => {
        if (!product) return;

        try {
            const customizationsArray = Object.entries(selectedCustomizations).map(([type, value]) => ({
                type,
                value
            }));

            await customerService.addToCart(
                product.id.toString(),
                quantity,
                customizationsArray
            );

            setShowCustomizationModal(false);
            setSelectedCustomizations({});
            setCustomizedPrice(null);
            incrementCartCount();
            setToast({
                open: true,
                type: 'success',
                message: 'Sản phẩm tùy chỉnh đã được thêm vào giỏ hàng!'
            });
        } catch (error) {
            console.error('Error adding customized product to cart:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể thêm sản phẩm tùy chỉnh vào giỏ hàng. Vui lòng thử lại.'
            });
        }
    };

    const closeCustomizationModal = () => {
        setShowCustomizationModal(false);
        setSelectedCustomizations({});
        setCustomizedPrice(null);
        setCustomizationOptions({});
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sản phẩm không tồn tại</h3>
                <p className="text-gray-500 mb-6">
                    Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Quay lại danh sách sản phẩm
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover object-center"
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <Package className="h-24 w-24 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <p className="text-lg text-gray-600 mb-4">{product.category.name}</p>
                    </div>

                    <div>
                        <p className="text-3xl font-bold text-gray-900 mb-4">
                            {formatVND(parseFloat(product.price))}
                        </p>
                        {product.stock !== null && (
                            <p className="text-sm text-gray-600 mb-4">
                                Còn lại: {product.stock} sản phẩm
                            </p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Mô tả</h3>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>

                    {product.isCustomizable && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tùy chỉnh</h3>
                            <p className="text-gray-600">
                                Sản phẩm này có thể tùy chỉnh theo ý muốn của bạn.
                                {product.productionTimeDays && (
                                    <span className="block mt-1 text-sm text-gray-500">
                                        Thời gian sản xuất: {product.productionTimeDays} ngày
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số lượng
                        </label>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                -
                            </button>
                            <span className="px-4 py-2 border border-gray-300 rounded-md min-w-[3rem] text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4">
                        {product.isCustomizable ? (
                            <>
                                <button
                                    onClick={handleCustomizeProduct}
                                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                                >
                                    <Settings className="h-5 w-5 mr-2" />
                                    Tùy chỉnh
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Thêm nhanh
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Thêm vào giỏ hàng
                            </button>
                        )}
                        <button
                            onClick={handleAddToWishlist}
                            className={`p-3 border rounded-md transition-colors ${wishlistStatus
                                ? 'border-red-300 bg-red-50 text-red-600'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <Heart className={`h-5 w-5 ${wishlistStatus ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Customization Modal */}
            {showCustomizationModal && product && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Tùy chỉnh {product.name}
                                </h3>
                                <button
                                    onClick={closeCustomizationModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Product Info */}
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                            <div className="h-8 w-8 text-gray-400">📦</div>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                                        <p className="text-sm text-gray-500">Giá cơ bản: {formatVND(product.price)}</p>
                                        {customizedPrice && (
                                            <p className="text-sm font-medium text-indigo-600">
                                                Giá tùy chỉnh: {formatVND(customizedPrice)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Customization Options */}
                                {loadingCustomizations ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : Object.keys(customizationOptions).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(customizationOptions).map(([optionType, options]) => (
                                            <div key={optionType} className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 capitalize">
                                                    {optionType.replace('_', ' ')}
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {options.map((option) => (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleCustomizationChange(option.optionType, option.optionValue)}
                                                            className={`p-3 text-left border rounded-lg transition-colors ${selectedCustomizations[option.optionType] === option.optionValue
                                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            <div className="font-medium">{option.optionValue}</div>
                                                            {Number(option.priceDelta) > 0 && (
                                                                <div className="text-sm text-green-600">
                                                                    +{formatVND(option.priceDelta)}
                                                                </div>
                                                            )}
                                                            {Number(option.priceDelta) < 0 && (
                                                                <div className="text-sm text-red-600">
                                                                    -{formatVND(Math.abs(Number(option.priceDelta)))}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Không có tùy chọn tùy chỉnh cho sản phẩm này.
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={closeCustomizationModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleAddCustomizedToCart}
                                        disabled={Object.keys(selectedCustomizations).length === 0}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default ProductDetailPage; 