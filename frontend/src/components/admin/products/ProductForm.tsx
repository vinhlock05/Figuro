import React from 'react';
import type { Product, CreateProductData } from '../../../services/adminService';

interface ProductFormProps {
    formData: CreateProductData;
    setFormData: (data: CreateProductData) => void;
    categories: { id: number; name: string }[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    editingProduct: Product | null;
}

const formatPrice = (price: number) => {
    if (typeof price !== 'number') price = Number(price) || 0;
    try {
        return `${price.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ`;
    } catch {
        return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ`;
    }
};

const ProductForm: React.FC<ProductFormProps> = ({
    formData,
    setFormData,
    categories,
    onSubmit,
    onCancel,
    editingProduct,
}) => {

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-border rounded-md px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black">Description</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-border rounded-md px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-black">Price (VNĐ)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="mt-1 block w-full border border-border rounded-md px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        required
                    />
                    <div className="text-xs text-black mt-1">{formatPrice(formData.price)}</div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-black">Stock</label>
                    <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        className="mt-1 block w-full border border-border rounded-md px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-black">Category</label>
                <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border border-border rounded-md px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    required
                >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-black">Image URL (optional)</label>
                <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-1 block w-full border border-border rounded-md px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-black bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
