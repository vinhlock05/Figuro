import React from 'react';
import type { Product } from '../../../services/adminService';
import ProductItem from './ProductItem';

interface ProductListProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No products found</div>
        ) : (
            <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                    <ProductItem key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
                ))}
            </ul>
        )}
    </div>
);

export default ProductList;
