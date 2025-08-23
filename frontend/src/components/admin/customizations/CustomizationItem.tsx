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
        {showProductId && <td className="border border-border px-4 py-2 text-black">{customization.productId}</td>}
        <td className="px-4 py-3 text-sm text-black">{customization.optionType}</td>
        <td className="px-4 py-3 text-sm text-black">{customization.optionValue}</td>
        <td className="px-4 py-3 text-sm text-black">{formatPrice(customization.priceDelta)}</td>
        <td className="px-4 py-3 text-sm">
            <button
                onClick={() => onEdit(customization)}
                className="mr-3 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
                Edit
            </button>
            <button
                onClick={() => onDelete(customization.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
                Delete
            </button>
        </td>
    </tr>
);

export default CustomizationItem; 