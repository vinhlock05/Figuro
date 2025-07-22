import React from 'react';
import type { CustomizationOption } from '../../../services/adminService';
import CustomizationItem from './CustomizationItem';

interface CustomizationListProps {
    customizations: CustomizationOption[];
    onEdit: (customization: CustomizationOption) => void;
    onDelete: (id: number) => void;
}

const CustomizationList: React.FC<CustomizationListProps> = ({ customizations, onEdit, onDelete }) => (
    <table className="min-w-full bg-white border">
        <thead>
            <tr>
                <th className="border px-4 py-2">Product ID</th>
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Value</th>
                <th className="border px-4 py-2">Price Delta</th>
                <th className="border px-4 py-2">Actions</th>
            </tr>
        </thead>
        <tbody>
            {customizations.map(customization => (
                <CustomizationItem key={customization.id} customization={customization} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </tbody>
    </table>
);

export default CustomizationList; 