import React from 'react';
import type { Category } from '../../../services/adminService';
import CategoryItem from './CategoryItem';

interface CategoryListProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => (
    <table className="min-w-full bg-white border text-black">
        <thead>
            <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Actions</th>
            </tr>
        </thead>
        <tbody>
            {categories.map(category => (
                <CategoryItem key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </tbody>
    </table>
);

export default CategoryList; 