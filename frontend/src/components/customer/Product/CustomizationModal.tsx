import React, { useState, useEffect } from 'react';
import type { Product, GroupedCustomizationOptions } from '../../../services/customerService';
import { formatVND } from '../../../utils/currency';

interface CustomizationModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, customizations: Record<string, string>, quantity: number) => void;
    getCustomizationOptions: (productId: string) => Promise<GroupedCustomizationOptions>;
    calculateCustomizedPrice: (productId: string, customizations: Array<{ type: string; value: string }>) => Promise<{
        price?: number;
        totalPrice?: number;
        basePrice?: number;
        priceAdjustment?: number;
        customizations?: Array<{ type: string; value: string }>;
    }>;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
    product,
    isOpen,
    onClose,
    onAddToCart,
    getCustomizationOptions,
    calculateCustomizedPrice
}) => {
    const [customizations, setCustomizations] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [customizationOptions, setCustomizationOptions] = useState<GroupedCustomizationOptions>({});
    const [customizedPrice, setCustomizedPrice] = useState<number>(() => {
        const basePrice = parseFloat(product.price) || 0;
        console.log('Initial price setup:', { productPrice: product.price, basePrice });
        return basePrice;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

    useEffect(() => {
        if (isOpen && product.isCustomizable) {
            loadCustomizationOptions();
        }
    }, [isOpen, product.id]);

    useEffect(() => {
        const basePrice = parseFloat(product.price) || 0;
        if (Object.keys(customizations).length > 0) {
            calculatePrice();
        } else {
            setCustomizedPrice(basePrice * quantity);
        }
    }, [customizations, product.price, quantity]);

    // Recalculate price when quantity changes
    useEffect(() => {
        const basePrice = parseFloat(product.price) || 0;
        if (Object.keys(customizations).length > 0) {
            calculatePrice();
        } else {
            setCustomizedPrice(basePrice * quantity);
        }
    }, [quantity]);

    const loadCustomizationOptions = async () => {
        try {
            setIsLoading(true);
            const options = await getCustomizationOptions(product.id.toString());
            setCustomizationOptions(options);
        } catch (error) {
            console.error('Failed to load customization options:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculatePrice = async () => {
        const basePrice = parseFloat(product.price) || 0;
        console.log('calculatePrice called:', { basePrice, quantity, customizations });

        if (Object.keys(customizations).length === 0) {
            // If no customizations, just calculate base price * quantity
            const totalPrice = basePrice * quantity;
            console.log('No customizations, setting price to:', totalPrice);
            setCustomizedPrice(totalPrice);
            return;
        }

        try {
            setIsCalculatingPrice(true);
            const customizationsArray = Object.entries(customizations).map(([type, value]) => ({
                type,
                value
            }));

            console.log('Calling calculateCustomizedPrice with:', customizationsArray);
            const result = await calculateCustomizedPrice(product.id.toString(), customizationsArray);
            console.log('API response:', result);

            // Use totalPrice from API response, fallback to price if not available
            const apiPrice = result.totalPrice || result.price || basePrice;
            const totalPrice = apiPrice * quantity;
            console.log('Setting customized price to:', totalPrice);
            setCustomizedPrice(totalPrice);
        } catch (error) {
            console.error('Failed to calculate customized price:', error);
            // Fallback to base price * quantity if calculation fails
            const fallbackPrice = basePrice * quantity;
            console.log('Using fallback price:', fallbackPrice);
            setCustomizedPrice(fallbackPrice);
        } finally {
            setIsCalculatingPrice(false);
        }
    };

    const handleCustomizationChange = (optionType: string, value: string) => {
        setCustomizations(prev => ({
            ...prev,
            [optionType]: value
        }));
    };

    const handleAddToCart = () => {
        onAddToCart(product, customizations, quantity);
        onClose();
        // Reset state
        setCustomizations({});
        setQuantity(1);
    };

    const handleClose = () => {
        onClose();
        // Reset state
        setCustomizations({});
        setQuantity(1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            Customize {product.name}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Product Image and Basic Info */}
                    <div className="flex space-x-4">
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/100x100?text=Product'}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                                {product.name}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                {product.description}
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    {formatVND(customizedPrice)}
                                </span>
                                {isCalculatingPrice && (
                                    <span className="text-xs text-neutral-500">Calculating...</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Quantity
                        </label>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(prev => prev + 1)}
                                className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Customization Options */}
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
                            <p className="text-sm text-neutral-500 mt-2">Loading options...</p>
                        </div>
                    ) : Object.keys(customizationOptions).length > 0 ? (
                        <div className="space-y-4">
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                                Customization Options
                            </h4>
                            {Object.entries(customizationOptions).map(([optionType, options]) => (
                                <div key={optionType} className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                                        {optionType.replace('_', ' ')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {options.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => handleCustomizationChange(optionType, option.optionValue)}
                                                className={`p-3 text-sm rounded-lg border transition-all ${customizations[optionType] === option.optionValue
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                    : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                                                    }`}
                                            >
                                                <div className="font-medium">{option.optionValue}</div>
                                                {parseFloat(option.priceDelta) > 0 && (
                                                    <div className="text-xs text-neutral-500">
                                                        +{formatVND(parseFloat(option.priceDelta))}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-neutral-500">No customization options available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 px-4 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={isCalculatingPrice}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isCalculatingPrice ? 'Calculating...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
