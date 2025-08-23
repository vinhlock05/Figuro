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
    <form onSubmit={onSubmit} className="space-y-4 text-black">
        <div>
            <label className="block text-sm font-medium text-black">Name</label>
            <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-black">Description</label>
            <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-border rounded px-3 py-2 bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-black bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">{editingCategory ? 'Update' : 'Create'}</button>
        </div>
    </form>
);

export default CategoryForm; 