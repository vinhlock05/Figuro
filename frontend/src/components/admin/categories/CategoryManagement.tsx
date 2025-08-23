import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import type { Category } from '../../../services/adminService';
import { useLocation } from 'react-router-dom';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import CategoryPagination from './CategoryPagination';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';

const CategoryManagement: React.FC = () => {
    const {
        categories,
        isLoadingCategories,
        fetchCategories,
        addCategory,
        editCategory,
        removeCategory,
    } = useAdmin();

    const location = useLocation();

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; categoryId: number | null }>({ open: false, categoryId: null });
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({ open: false, type: 'success', message: '' });

    useEffect(() => {
        const fetch = async () => {
            const result = await fetchCategories({ page, limit });
            if (result && result.pagination) setTotalPages(result.pagination.pages);
        };
        fetch();
    }, [page, limit, location.pathname]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await editCategory(editingCategory.id, formData);
                setToast({ open: true, type: 'success', message: 'Category updated successfully.' });
            } else {
                await addCategory(formData);
                setToast({ open: true, type: 'success', message: 'Category created successfully.' });
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to save category.' });
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, description: cat.description || '' });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({ open: true, categoryId: id });
    };

    const confirmDelete = async () => {
        if (confirmDialog.categoryId == null) return;
        try {
            await removeCategory(confirmDialog.categoryId);
            setToast({ open: true, type: 'success', message: 'Category deleted successfully.' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to delete category.' });
        } finally {
            setConfirmDialog({ open: false, categoryId: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-black">Categories</h1>
                <button onClick={() => { setIsModalOpen(true); setEditingCategory(null); setFormData({ name: '', description: '' }); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded">Add Category</button>
            </div>
            {isLoadingCategories ? <div>Loading...</div> : (
                <>
                    <CategoryList categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
                    <CategoryPagination page={page} totalPages={totalPages} setPage={setPage} />
                </>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-96">
                        <h2 className="text-lg font-bold mb-4 text-black">{editingCategory ? 'Edit' : 'Add'} Category</h2>
                        <CategoryForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={() => { setIsModalOpen(false); setEditingCategory(null); setFormData({ name: '', description: '' }); }}
                            editingCategory={editingCategory}
                        />
                    </div>
                </div>
            )}
            <ConfirmationDialog
                open={confirmDialog.open}
                title="Delete Category"
                message="Are you sure you want to delete this category?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ open: false, categoryId: null })}
            />
            <ToastMessage
                id="category-toast"
                title={toast.type === 'success' ? 'Success' : 'Error'}
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, open: false }))}
            />
        </div>
    );
};

export default CategoryManagement;
