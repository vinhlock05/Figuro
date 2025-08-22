import React, { useState, useEffect } from 'react';
import { customerService } from '../../../services/customerService';
import type { Product } from '../../../services/customerService';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';
import { useCart } from '../../../contexts/CartContext';
import { formatVND } from '../../../utils/currency';
import CustomizationModal from '../Product/CustomizationModal';
import {
    Heart,
    ShoppingCart,
    Trash2,
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
                message: 'Cannot load wishlist. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: string, customizations?: Array<{ type: string; value: string }>, quantity: number = 1) => {
        try {
            await customerService.addToCart(productId, quantity, customizations);
            incrementCartCount();

            const customizationText = customizations && customizations.length > 0
                ? ` with customizations`
                : '';

            setToast({
                open: true,
                type: 'success',
                message: `Product${customizationText} has been added to cart!`
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Cannot add product to cart. Please try again.'
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
                message: 'Product has been removed from wishlist!'
            });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Cannot remove product from wishlist. Please try again.'
            });
        }
    };


    const [showCustomizationModal, setShowCustomizationModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleCustomizeProductClick = (product: Product) => {
        setSelectedProduct(product);
        setShowCustomizationModal(true);
    };

    const handleAddToCartWithCustomizations = (product: Product, customizations: Record<string, string>, quantity: number) => {
        // Convert customizations to the format expected by the API
        const customizationsArray = Object.entries(customizations).map(([type, value]) => ({
            type,
            value
        }));

        handleAddToCart(product.id.toString(), customizationsArray, quantity);
        setShowCustomizationModal(false);
        setSelectedProduct(null);
    };

    const WishlistItem: React.FC<{ product: Product }> = ({ product }) => (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8">
            <div className="flex items-start space-x-6">
                {/* Product Image */}
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                        />
                    ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">{product.category.name}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                        </div>
                        <button
                            onClick={() => handleRemoveFromWishlist(product.id.toString())}
                            className="p-3 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center space-x-4">
                            <p className="text-xl font-medium text-gray-900">
                                {formatVND(product.price)}
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            {product.isCustomizable ? (
                                <>
                                    <button
                                        onClick={() => handleCustomizeProductClick(product)}
                                        className="bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                                    >
                                        <Settings className="h-5 w-5 mr-2" />
                                        Customize
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(product.id.toString())}
                                        className="bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        Quick Add
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleAddToCart(product.id.toString())}
                                    className="bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to Cart
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
        <div className="space-y-8 px-6 py-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Wishlist</h1>
                <p className="text-gray-600 text-lg">
                    Manage the products you have favorited
                </p>
            </div>

            {/* Wishlist Items */}
            {wishlistItems.length > 0 ? (
                <div className="space-y-6">
                    {wishlistItems.map((product) => (
                        <WishlistItem key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6">
                    <Heart className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 mb-4">Empty Wishlist</h3>
                    <p className="text-gray-500 mb-8 text-lg">
                        You don't have any products in your wishlist yet.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        Browse Products
                    </button>
                </div>
            )}

            {/* Customization Modal */}
            {showCustomizationModal && selectedProduct && (
                <CustomizationModal
                    product={selectedProduct}
                    isOpen={showCustomizationModal}
                    onClose={() => {
                        setShowCustomizationModal(false);
                        setSelectedProduct(null);
                    }}
                    onAddToCart={handleAddToCartWithCustomizations}
                    getCustomizationOptions={customerService.getCustomizationOptions}
                    calculateCustomizedPrice={customerService.calculateCustomizedPrice}
                />
            )}

            {/* Toast Message */}
            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                id="wishlist-toast"
                title="Wishlist"
            />
        </div>
    );
};

export default WishlistPage; 