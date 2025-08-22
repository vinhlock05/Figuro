import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';
import CustomizationModal from './CustomizationModal';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product, customizations?: Record<string, string>, quantity?: number) => void;
    onAddToWishlist?: (product: Product) => void;
    variant?: 'default' | 'compact' | 'featured';
    getCustomizationOptions?: (productId: string) => Promise<any>;
    calculateCustomizedPrice?: (productId: string, customizations: Array<{ type: string; value: string }>) => Promise<{ price: number }>;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    getCustomizationOptions,
    calculateCustomizedPrice
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showCustomizationModal, setShowCustomizationModal] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.isCustomizable && getCustomizationOptions && calculateCustomizedPrice) {
            // Show customization modal for customizable products
            setShowCustomizationModal(true);
        } else if (onAddToCart) {
            // Direct add to cart for non-customizable products
            onAddToCart(product);
        }
    };

    const handleAddToCartWithCustomizations = (product: Product, customizations: Record<string, string>, quantity: number) => {
        if (onAddToCart) {
            onAddToCart(product, customizations, quantity);
        }
    };

    return (
        <>
            <div
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft hover:shadow-glow transition-all duration-300 overflow-hidden group h-full flex flex-col"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative h-48 bg-neutral-100 dark:bg-neutral-700">
                    <img
                        src={product.imageUrl || 'https://via.placeholder.com/300x300?text=Product'}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category tag - always visible */}
                    {product.category && (
                        <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-neutral-800/80 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
                                {product.category.name}
                            </span>
                        </div>
                    )}

                    {/* Customization indicator */}
                    {product.isCustomizable && (
                        <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-blue-600/90 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
                                Customizable
                            </span>
                        </div>
                    )}

                    {/* Quick view overlay */}
                    <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`} />

                    {/* Quick actions */}
                    <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-2 bg-neutral-800 text-white font-medium rounded-lg hover:bg-neutral-700 transition-all duration-200 text-sm"
                            >
                                {product.isCustomizable ? 'Customize & Add' : 'Add to Cart'}
                            </button>
                            <Link
                                to={`/products/${product.slug}`}
                                className="px-4 py-2 bg-white text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-all duration-200 text-sm"
                            >
                                View
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Product info */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                        {product.name}
                    </h3>

                    {/* Description - always visible */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2 flex-1">
                        {product.description || 'High-quality anime figure with premium craftsmanship'}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                {formatVND(parseFloat(product.price))}
                            </span>
                            {/* Stock status - on same line as price */}
                            {product.stock && (
                                <span className={`text-xs items-end px-2 py-1 rounded-lg ${product.stock > 10
                                    ? 'bg-green-100 text-green-700'
                                    : product.stock > 0
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Modal */}
            {showCustomizationModal && getCustomizationOptions && calculateCustomizedPrice && (
                <CustomizationModal
                    product={product}
                    isOpen={showCustomizationModal}
                    onClose={() => setShowCustomizationModal(false)}
                    onAddToCart={handleAddToCartWithCustomizations}
                    getCustomizationOptions={getCustomizationOptions}
                    calculateCustomizedPrice={calculateCustomizedPrice}
                />
            )}
        </>
    );
};

export default ProductCard;
