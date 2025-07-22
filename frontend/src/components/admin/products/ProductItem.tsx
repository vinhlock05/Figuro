import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';
import type { Product } from '../../../services/adminService';

interface ProductItemProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onEdit, onDelete }) => (
    <li key={product.id}>
        <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                        <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {product.category.name}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : Number(product.price || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </li>
);

export default ProductItem;
