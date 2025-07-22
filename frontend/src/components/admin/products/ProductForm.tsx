import React from 'react';
import type { Product, CreateProductData } from '../../../services/adminService';

interface ProductFormProps {
    formData: CreateProductData;
    setFormData: (data: CreateProductData) => void;
    selectedCustomizations: number[];
    setSelectedCustomizations: (ids: number[]) => void;
    categories: { id: number; name: string }[];
    customizations: any[];
    isLoadingCustomizations: boolean;
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
    selectedCustomizations,
    setSelectedCustomizations,
    categories,
    customizations,
    isLoadingCustomizations,
    onSubmit,
    onCancel,
    editingProduct,
}) => {
    const handleCustomizationChange = (id: number) => {
        setSelectedCustomizations(
            selectedCustomizations.includes(id)
                ? selectedCustomizations.filter(cid => cid !== id)
                : [...selectedCustomizations, id]
        );
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price (VNĐ)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                    <div className="text-xs text-gray-500 mt-1">{formatPrice(formData.price)}</div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Customization Options</label>
                {isLoadingCustomizations ? (
                    <div>Loading customizations...</div>
                ) : (
                    <div className="max-h-32 overflow-y-auto border rounded p-2">
                        {customizations.length === 0 && <div className="text-gray-400 text-sm">No customizations available</div>}
                        {Object.entries(customizations.reduce((acc, opt) => {
                            if (!acc[opt.optionType]) acc[opt.optionType] = [];
                            acc[opt.optionType].push(opt);
                            return acc;
                        }, {} as Record<string, typeof customizations>)).map(([type, opts]) => (
                            <div key={type} className="mb-2">
                                <div className="font-semibold text-xs text-gray-600 mb-1">{type}</div>
                                <div className="flex flex-wrap gap-2">
                                    {(opts as typeof customizations).map(opt => (
                                        <label key={opt.id} className="inline-flex items-center text-xs">
                                            <input
                                                type="checkbox"
                                                checked={selectedCustomizations.includes(opt.id)}
                                                onChange={() => handleCustomizationChange(opt.id)}
                                                className="mr-1"
                                            />
                                            {opt.optionValue} {opt.priceDelta ? `(+${formatPrice(opt.priceDelta)})` : ''}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
                <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {editingProduct ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
