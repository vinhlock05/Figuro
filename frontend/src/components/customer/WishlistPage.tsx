import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import type { Product } from '../../services/customerService';
import ToastMessage, { type ToastType } from '../common/ToastMessage';
import { useCart } from '../../contexts/CartContext';
import { formatVND } from '../../utils/currency';
import {
    Heart,
    ShoppingCart,
    Trash2,
    Star,
    Package,
    Settings
} from 'lucide-react';

const WishlistPage: React.FC = () => {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({
        open: false,
        type: 'success',
        message: ''
    });

    const { incrementCartCount } = useCart();

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const wishlistData = await customerService.getWishlist();
            setWishlistItems(wishlistData);
        } catch (error) {
            console.error('Error loading wishlist:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể tải danh sách yêu thích. Vui lòng thử lại.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: string) => {
        try {
            await customerService.addToCart(productId, 1);
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

    const handleRemoveFromWishlist = async (productId: string) => {
        try {
            await customerService.removeFromWishlist(productId);
            setWishlistItems(prev => prev.filter(item => item.id.toString() !== productId));
            setToast({
                open: true,
                type: 'success',
                message: 'Đã xóa sản phẩm khỏi danh sách yêu thích!'
            });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể xóa sản phẩm khỏi danh sách yêu thích. Vui lòng thử lại.'
            });
        }
    };

    const handleCustomizeProduct = async (product: Product) => {
        // TODO: Implement customization modal
        console.log('Customize product:', product);
    };

    const WishlistItem: React.FC<{ product: Product }> = ({ product }) => (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                        />
                    ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        </div>
                        <button
                            onClick={() => handleRemoveFromWishlist(product.id.toString())}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm text-gray-500">
                                    {product.rating ? product.rating.toFixed(1) : '4.5'}
                                </span>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                                {formatVND(product.price)}
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            {product.isCustomizable ? (
                                <>
                                    <button
                                        onClick={() => handleCustomizeProduct(product)}
                                        className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                                    >
                                        <Settings className="h-4 w-4 mr-1" />
                                        Tùy chỉnh
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(product.id.toString())}
                                        className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                        Thêm nhanh
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleAddToCart(product.id.toString())}
                                    className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Thêm vào giỏ hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
                <p className="text-gray-600">
                    Quản lý các sản phẩm bạn đã yêu thích
                </p>
            </div>

            {/* Wishlist Items */}
            {wishlistItems.length > 0 ? (
                <div className="space-y-4">
                    {wishlistItems.map((product) => (
                        <WishlistItem key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Danh sách yêu thích trống</h3>
                    <p className="text-gray-500 mb-6">
                        Bạn chưa có sản phẩm nào trong danh sách yêu thích.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Duyệt sản phẩm
                    </button>
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

export default WishlistPage; 