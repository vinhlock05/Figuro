import React from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../../../services/adminService';
import { formatVND } from '../../../utils/currency';

interface TopProductsProps {
    topProducts: Product[];
}

const TopProducts: React.FC<TopProductsProps> = ({ topProducts }) => (
    <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Top Products
            </h3>
            {(!topProducts || topProducts.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No products data available</p>
                    <p className="text-xs text-gray-400 mt-1">Product analytics will appear here</p>
                </div>
            ) : (
                <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                        {topProducts.slice(0, 5).map((product) => (
                            <li key={product.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 relative">
                                        {product.imageUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                                                    onError={(e) => {
                                                        // Fallback to package icon if image fails to load
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const fallback = target.parentElement?.nextElementSibling as HTMLElement;
                                                        if (fallback) fallback.classList.remove('hidden');
                                                    }}
                                                />
                                                <Package className="h-8 w-8 text-gray-400 absolute inset-0 m-auto hidden" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatVND(product.price)} • Stock: {product.stock}
                                            {product.orderCount !== undefined && ` • ${product.orderCount} orders`}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-sm text-gray-500">
                                        {product.category && typeof product.category === 'object' ? product.category.name : ''}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
);

export default TopProducts; 