import React from 'react';
import type { Category } from '../../../services/adminService';

interface CategoryItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onEdit, onDelete }) => (
    <tr key={category.id}>
        <td className="border border-border px-4 py-2 text-black">{category.name}</td>
        <td className="border border-border px-4 py-2 text-black">{category.description}</td>
        <td className="border border-border px-4 py-2">
            <button onClick={() => onEdit(category)} className="mr-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
            <button onClick={() => onDelete(category.id)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Delete</button>
        </td>
    </tr>
);

export default CategoryItem; 