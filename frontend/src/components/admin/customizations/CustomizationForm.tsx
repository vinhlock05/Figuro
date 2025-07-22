import React from 'react';
import type { CustomizationOption, Product } from '../../../services/adminService';

interface CustomizationFormProps {
    formData: { productId: string; optionType: string; optionValue: string; priceDelta: number };
    setFormData: (data: { productId: string; optionType: string; optionValue: string; priceDelta: number }) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    editingCustomization: CustomizationOption | null;
    products: Product[];
}

const formatPrice = (price: number) => {
    if (typeof price !== 'number') price = Number(price) || 0;
    try {
        return `${price.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ`;
    } catch {
        return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ`;
    }
};

const CustomizationForm: React.FC<CustomizationFormProps> = ({ formData, setFormData, onSubmit, onCancel, editingCustomization, products }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium">Product</label>
            <select
                value={formData.productId}
                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
            >
                <option value="" disabled>Select a product</option>
                {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium">Type</label>
            <input
                type="text"
                value={formData.optionType}
                onChange={e => setFormData({ ...formData, optionType: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium">Value</label>
            <input
                type="text"
                value={formData.optionValue}
                onChange={e => setFormData({ ...formData, optionValue: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium">Price Delta (VNĐ)</label>
            <input
                type="number"
                value={formData.priceDelta}
                onChange={e => setFormData({ ...formData, priceDelta: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                required
            />
            <div className="text-xs text-gray-500 mt-1">{formatPrice(formData.priceDelta)}</div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">{editingCustomization ? 'Update' : 'Create'}</button>
        </div>
    </form>
);

export default CustomizationForm; 