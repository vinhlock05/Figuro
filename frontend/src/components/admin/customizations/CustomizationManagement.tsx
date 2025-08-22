import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import type { CustomizationOption } from '../../../services/adminService';
import { useLocation } from 'react-router-dom';
import CustomizationList from './CustomizationList';
import CustomizationGroupedList from './CustomizationGroupedList';
import CustomizationForm from './CustomizationForm';

import ConfirmationDialog from '../../common/ConfirmationDialog';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';
import { List, Grid } from 'lucide-react';

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

    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomization, setEditingCustomization] = useState<CustomizationOption | null>(null);
    const [formData, setFormData] = useState({ productId: '', optionType: '', optionValue: '', priceDelta: 0 });
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; customizationId: number | null }>({ open: false, customizationId: null });
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({ open: false, type: 'success', message: '' });
    const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');

    useEffect(() => {
        const fetch = async () => {
            await fetchCustomizations(selectedProductId);
        };
        fetch();
    }, [selectedProductId, fetchCustomizations, location.pathname]);

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

    // Fetch products when component mounts for grouped view
    useEffect(() => {
        console.log('CustomizationManagement - viewMode:', viewMode, 'products:', products);
        if (viewMode === 'grouped' && (!products || products.length === 0)) {
            console.log('CustomizationManagement - fetching products');
            fetchProducts();
        }
    }, [viewMode, products, fetchProducts]);

    // Debug render
    console.log('CustomizationManagement RENDER - customizations:', customizations);
    console.log('CustomizationManagement RENDER - isLoadingCustomizations:', isLoadingCustomizations);
    console.log('CustomizationManagement RENDER - viewMode:', viewMode);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customizations</h1>
                <div className="flex items-center space-x-4">
                    {/* Product Filter */}
                    <select
                        value={selectedProductId || ''}
                        onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : undefined)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">All Products</option>
                        {products?.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grouped')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'grouped'
                                ? 'bg-white text-gray-900 shadow'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Grid className="h-4 w-4 inline mr-1" />
                            Grouped
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                                ? 'bg-white text-gray-900 shadow'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List className="h-4 w-4 inline mr-1" />
                            List
                        </button>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Add Customization
                    </button>
                </div>
            </div>
            {isLoadingCustomizations ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {viewMode === 'grouped' ? (
                        <CustomizationGroupedList
                            customizations={Array.isArray(customizations) ? customizations : []}
                            products={products || []}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <CustomizationList
                            customizations={Array.isArray(customizations) ? customizations : []}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
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
                id="customization-toast"
                title={toast.type === 'success' ? 'Success' : 'Error'}
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, open: false }))}
            />
        </div>
    );
};

export default CustomizationManagement;
