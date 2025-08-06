import React from 'react';
import { Edit, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import type { Product } from '../../../services/adminService';

interface ProductItemProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
    expanded: boolean;
    onToggleExpand: () => void;
}

const formatPrice = (price: number) => {
    if (typeof price !== 'number') price = Number(price) || 0;
    // Try to use toLocaleString, fallback to regex if needed
    try {
        return `${price.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ`;
    } catch {
        return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ`;
    }
};

const ProductItem: React.FC<ProductItemProps> = ({ product, onEdit, onDelete, expanded, onToggleExpand }) => {
    // Prevent expand/collapse when clicking edit/delete
    const handleItemClick = (e: React.MouseEvent) => {
        // If the click is on a button or inside a button, do nothing
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleExpand();
    };

    return (
        <li key={product.id}>
            <div className="px-4 py-4 sm:px-6 cursor-pointer select-none" onClick={handleItemClick}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-8 w-8 object-cover rounded"
                                />
                            ) : (
                                <Package className="h-8 w-8 text-gray-400" />
                            )}
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
                                {formatPrice(product.price)}
                            </p>
                            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        </div>
                        <button onClick={onToggleExpand} className="text-gray-500 hover:text-gray-700 focus:outline-none" tabIndex={-1} type="button">
                            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                        <div className="flex space-x-2">
                            <button onClick={e => { e.stopPropagation(); onEdit(product); }} className="text-indigo-600 hover:text-indigo-900" type="button">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); onDelete(product.id); }} className="text-red-600 hover:text-red-900" type="button">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
                {expanded && (
                    <div className="mt-4 bg-gray-50 rounded p-4">
                        <h4 className="font-semibold text-sm mb-2">Customizations</h4>
                        {product.customizationOptions && product.customizationOptions.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                                {product.customizationOptions.map(opt => (
                                    <li key={opt.id}>
                                        <span className="font-medium">{opt.optionType}:</span> {opt.optionValue} {' '}
                                        <span className="text-xs text-gray-500">(+{formatPrice(opt.priceDelta)})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-500">No customizations available.</p>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
};

export default ProductItem;
