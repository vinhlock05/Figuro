import React from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../../../services/adminService';
import { formatVND } from '../../../utils/currency';

interface TopProductsProps {
    topProducts: Product[];
}

const TopProducts: React.FC<TopProductsProps> = ({ topProducts }) => (
    <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-black mb-4">
                Top Products
            </h3>
            {(!topProducts || topProducts.length === 0) ? (
                <div className="text-center py-8 text-black">
                    <Package className="h-12 w-12 mx-auto mb-4 text-black/50" />
                    <p className="text-sm">No products data available</p>
                    <p className="text-xs text-black/70 mt-1">Product analytics will appear here</p>
                </div>
            ) : (
                <div className="flow-root">
                    <ul className="-my-5 divide-y divide-border">
                        {topProducts.slice(0, 5).map((product) => (
                            <li key={product.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 relative">
                                        {product.imageUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-lg object-cover border border-border shadow-sm"
                                                    onError={(e) => {
                                                        // Fallback to package icon if image fails to load
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const fallback = target.parentElement?.nextElementSibling as HTMLElement;
                                                        if (fallback) fallback.classList.remove('hidden');
                                                    }}
                                                />
                                                <Package className="h-8 w-8 text-muted-foreground absolute inset-0 m-auto hidden" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-black truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-black">
                                            {formatVND(product.price)} • Stock: {product.stock}
                                            {product.orderCount !== undefined && ` • ${product.orderCount} orders`}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-sm text-black">
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