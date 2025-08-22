import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import type { Product } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import { useCart } from '../../../contexts/CartContext';
import ToastMessage from '../../common/ToastMessage';
import CustomizationModal from './CustomizationModal';
import {
    Heart,
    ShoppingCart,
    Package,
    ChevronRight,
    Truck,
    Shield
} from 'lucide-react';

const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { incrementCartCount } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState({ open: false, type: 'info' as 'success' | 'error' | 'info', message: '', title: '' });
    const [wishlistStatus, setWishlistStatus] = useState(false);
    const [quantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showCustomizationModal, setShowCustomizationModal] = useState(false);

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
            try {
                const isInWishlist = await customerService.isInWishlist(productData.id.toString());
                setWishlistStatus(isInWishlist);
            } catch (wishlistError) {
                console.error('Error checking wishlist status:', wishlistError);
                // Continue without wishlist status
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setError('Cannot load product information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (customizations?: Record<string, string>) => {
        if (!product) return;

        try {
            setIsAddingToCart(true);

            // Convert customizations to the format expected by the API
            const customizationsArray = customizations ? Object.entries(customizations).map(([type, value]) => ({
                type,
                value
            })) : undefined;

            await customerService.addToCart(product.id.toString(), quantity, customizationsArray);
            incrementCartCount();

            const customizationText = customizations && Object.keys(customizations).length > 0
                ? ` with customizations`
                : '';

            setToast({
                open: true,
                type: 'success',
                message: `Product${customizationText} has been added to cart!`,
                title: 'Success'
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Cannot add product to cart. Please try again.',
                title: 'Error'
            });
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleAddToCartClick = () => {
        if (product && product.isCustomizable) {
            setShowCustomizationModal(true);
        } else {
            handleAddToCart();
        }
    };

    const handleAddToCartWithCustomizations = (_product: Product, customizations: Record<string, string>) => {
        handleAddToCart(customizations);
    };

    const handleToggleWishlist = async () => {
        if (!product) return;

        try {
            if (wishlistStatus) {
                await customerService.removeFromWishlist(product.id.toString());
                setWishlistStatus(false);
                setToast({
                    open: true,
                    type: 'success',
                    message: 'Product has been removed from wishlist!',
                    title: 'Success'
                });
            } else {
                await customerService.addToWishlist(product.id.toString());
                setWishlistStatus(true);
                setToast({
                    open: true,
                    type: 'success',
                    message: 'Product has been added to wishlist!',
                    title: 'Success'
                });
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Cannot update wishlist. Please try again.',
                title: 'Error'
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin-slow rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-neutral-500 dark:text-neutral-400">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                <div className="text-center py-12">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-12 max-w-md mx-auto">
                        <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                            {error ? 'Error Loading Product' : 'Product not found'}
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                            {error || "The product you're looking for doesn't exist or has been removed."}
                        </p>
                        <Link
                            to="/products"
                            className="inline-block px-8 py-3 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <nav className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-200">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link to="/products" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-200">
                            Products
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-neutral-900 dark:text-neutral-100">{product.name}</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                            <div className="relative aspect-square">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                                        <Package className="h-24 w-24 text-neutral-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        {/* Product Header */}
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                            <div className="relative">

                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                        {product.name}
                                    </h1>
                                    <p className="text-lg text-neutral-600 dark:text-neutral-300">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Price and Actions */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-3xl font-bold text-brand">
                                            {formatVND(product.price)}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={handleAddToCartClick}
                                            disabled={isAddingToCart}
                                            className="flex-1 h-12 bg-brand text-white hover:bg-brand-dark rounded-xl border-2 border-brand transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                        >
                                            {isAddingToCart ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin-slow rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Adding...
                                                </div>
                                            ) : (
                                                <>
                                                    <div className='flex items-center justify-center'>
                                                        <ShoppingCart className='h-4 w-4 mr-2' />
                                                        {product.isCustomizable ? 'Customize & Add' : 'Add to Cart'}
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleToggleWishlist}
                                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${wishlistStatus
                                                ? 'border-danger bg-danger text-white hover:bg-danger-dark'
                                                : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-danger hover:text-danger'
                                                }`}
                                        >
                                            <Heart className={`h-5 w-5 ${wishlistStatus ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Product Details</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Category</span>
                                        <p className="text-neutral-900 dark:text-neutral-100">
                                            {product.category?.name || 'Uncategorized'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Availability</span>
                                        <p className="text-success font-medium">
                                            In Stock
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Returns */}
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Shipping & Returns</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-brand/10 rounded-lg">
                                        <Truck className="h-5 w-5 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Free Shipping</h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Free shipping on orders over $50. Standard delivery takes 3-5 business days.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-success/10 rounded-lg">
                                        <Shield className="h-5 w-5 text-success" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">30-Day Returns</h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Not satisfied? Return within 30 days for a full refund.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Modal */}
            {showCustomizationModal && product && (
                <CustomizationModal
                    product={product}
                    isOpen={showCustomizationModal}
                    onClose={() => setShowCustomizationModal(false)}
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
                id="product-detail-toast"
                title={toast.title}
            />
        </div>
    );
};

export default ProductDetailPage;
