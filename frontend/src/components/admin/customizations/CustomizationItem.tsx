import React from 'react';
import type { CustomizationOption } from '../../../services/adminService';

interface CustomizationItemProps {
    customization: CustomizationOption;
    onEdit: (customization: CustomizationOption) => void;
    onDelete: (id: number) => void;
    showProductId?: boolean;
}

const formatPrice = (price: number) => {
    if (typeof price !== 'number') price = Number(price) || 0;
    try {
        return `${price.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ`;
    } catch {
        return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ`;
    }
};

const CustomizationItem: React.FC<CustomizationItemProps> = ({ customization, onEdit, onDelete, showProductId = true }) => (
    <tr key={customization.id}>
        {showProductId && <td className="border px-4 py-2">{customization.productId}</td>}
        <td className="px-4 py-3 text-sm text-gray-900">{customization.optionType}</td>
        <td className="px-4 py-3 text-sm text-gray-900">{customization.optionValue}</td>
        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(customization.priceDelta)}</td>
        <td className="px-4 py-3 text-sm">
            <button
                onClick={() => onEdit(customization)}
                className="mr-3 text-indigo-600 hover:text-indigo-900 font-medium"
            >
                Edit
            </button>
            <button
                onClick={() => onDelete(customization.id)}
                className="text-red-600 hover:text-red-900 font-medium"
            >
                Delete
            </button>
        </td>
    </tr>
);

export default CustomizationItem; 