import React from 'react';
import type { CustomizationOption } from '../../../services/adminService';

interface CustomizationItemProps {
    customization: CustomizationOption;
    onEdit: (customization: CustomizationOption) => void;
    onDelete: (id: number) => void;
}

const CustomizationItem: React.FC<CustomizationItemProps> = ({ customization, onEdit, onDelete }) => (
    <tr key={customization.id}>
        <td className="border px-4 py-2">{customization.productId}</td>
        <td className="border px-4 py-2">{customization.optionType}</td>
        <td className="border px-4 py-2">{customization.optionValue}</td>
        <td className="border px-4 py-2">{customization.priceDelta}</td>
        <td className="border px-4 py-2">
            <button onClick={() => onEdit(customization)} className="mr-2 text-blue-600">Edit</button>
            <button onClick={() => onDelete(customization.id)} className="text-red-600">Delete</button>
        </td>
    </tr>
);

export default CustomizationItem; 