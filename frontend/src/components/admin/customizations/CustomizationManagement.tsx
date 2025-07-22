import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import type { CustomizationOption } from '../../../services/adminService';
import { useLocation } from 'react-router-dom';
import CustomizationList from './CustomizationList';
import CustomizationForm from './CustomizationForm';
import CustomizationPagination from './CustomizationPagination';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';

const CustomizationManagement: React.FC = () => {
    const {
        customizations,
        isLoadingCustomizations,
        fetchCustomizations,
        addCustomization,
        editCustomization,
        removeCustomization,
        products,
        fetchProducts, // <-- get fetchProducts from useAdmin
    } = useAdmin();

    const location = useLocation();

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomization, setEditingCustomization] = useState<CustomizationOption | null>(null);
    const [formData, setFormData] = useState({ productId: '', optionType: '', optionValue: '', priceDelta: 0 });
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; customizationId: number | null }>({ open: false, customizationId: null });
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({ open: false, type: 'success', message: '' });

    useEffect(() => {
        const fetch = async () => {
            const result = await fetchCustomizations({ page, limit });
            if (result && result.pagination) setTotalPages(result.pagination.pages);
        };
        fetch();
    }, [page, limit, location.pathname]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomization) {
                await editCustomization(editingCustomization.id, formData);
                setToast({ open: true, type: 'success', message: 'Customization updated successfully.' });
            } else {
                await addCustomization(formData);
                setToast({ open: true, type: 'success', message: 'Customization created successfully.' });
            }
            setIsModalOpen(false);
            setEditingCustomization(null);
            setFormData({ productId: '', optionType: '', optionValue: '', priceDelta: 0 });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to save customization.' });
        }
    };

    const handleEdit = (opt: CustomizationOption) => {
        setEditingCustomization(opt);
        setFormData({
            productId: String(opt.productId),
            optionType: opt.optionType,
            optionValue: opt.optionValue,
            priceDelta: opt.priceDelta,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({ open: true, customizationId: id });
    };

    const confirmDelete = async () => {
        if (confirmDialog.customizationId == null) return;
        try {
            await removeCustomization(confirmDialog.customizationId);
            setToast({ open: true, type: 'success', message: 'Customization deleted successfully.' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to delete customization.' });
        } finally {
            setConfirmDialog({ open: false, customizationId: null });
        }
    };

    // Fetch products when opening modal if not loaded
    const handleOpenModal = async () => {
        if (!products || products.length === 0) {
            await fetchProducts();
        }
        setIsModalOpen(true);
        setEditingCustomization(null);
        setFormData({ productId: '', optionType: '', optionValue: '', priceDelta: 0 });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customizations</h1>
                <button onClick={handleOpenModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded">Add Customization</button>
            </div>
            {isLoadingCustomizations ? <div>Loading...</div> : (
                <>
                    <CustomizationList customizations={customizations} onEdit={handleEdit} onDelete={handleDelete} />
                    <CustomizationPagination page={page} totalPages={totalPages} setPage={setPage} />
                </>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-96">
                        <h2 className="text-lg font-bold mb-4">{editingCustomization ? 'Edit' : 'Add'} Customization</h2>
                        <CustomizationForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={() => { setIsModalOpen(false); setEditingCustomization(null); setFormData({ productId: '', optionType: '', optionValue: '', priceDelta: 0 }); }}
                            editingCustomization={editingCustomization}
                            products={products} // <-- pass products here
                        />
                    </div>
                </div>
            )}
            <ConfirmationDialog
                open={confirmDialog.open}
                title="Delete Customization"
                message="Are you sure you want to delete this customization?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ open: false, customizationId: null })}
            />
            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, open: false }))}
            />
        </div>
    );
};

export default CustomizationManagement;
