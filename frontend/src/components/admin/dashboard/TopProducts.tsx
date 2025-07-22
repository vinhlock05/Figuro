import React from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../../../services/adminService';

interface TopProductsProps {
    topProducts: Product[];
}

const TopProducts: React.FC<TopProductsProps> = ({ topProducts }) => (
    <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Top Products
            </h3>
            <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                    {(topProducts || []).slice(0, 5).map((product) => (
                        <li key={product.id} className="py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <Package className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ${typeof product.price === 'number' ? product.price.toFixed(2) : Number(product.price || 0).toFixed(2)} • Stock: {product.stock}
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
        </div>
    </div>
);

export default TopProducts; 