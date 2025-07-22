import React from 'react';
import type { Category } from '../../../services/adminService';

interface CategoryFormProps {
    formData: { name: string; description: string };
    setFormData: (data: { name: string; description: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    editingCategory: Category | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ formData, setFormData, onSubmit, onCancel, editingCategory }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium">Name</label>
            <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium">Description</label>
            <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
            />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">{editingCategory ? 'Update' : 'Create'}</button>
        </div>
    </form>
);

export default CategoryForm; 