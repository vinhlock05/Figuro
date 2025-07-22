import React from 'react';
import type { Category } from '../../../services/adminService';

interface CategoryItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onEdit, onDelete }) => (
    <tr key={category.id}>
        <td className="border px-4 py-2">{category.name}</td>
        <td className="border px-4 py-2">{category.description}</td>
        <td className="border px-4 py-2">
            <button onClick={() => onEdit(category)} className="mr-2 text-blue-600">Edit</button>
            <button onClick={() => onDelete(category.id)} className="text-red-600">Delete</button>
        </td>
    </tr>
);

export default CategoryItem; 