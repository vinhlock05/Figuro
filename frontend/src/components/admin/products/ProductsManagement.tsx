import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import {
    Plus
} from 'lucide-react';
import type { Product, CreateProductData } from '../../../services/adminService';
import { useLocation } from 'react-router-dom';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import ProductSearch from './ProductSearch';
import ProductPagination from './ProductPagination';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';

export const ProductsManagement: React.FC = () => {
    const {
        products,
        isLoadingProducts,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        categories,
        fetchCategories,
    } = useAdmin();

    const location = useLocation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        imageUrl: '',
    });

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; productId: number | null }>({ open: false, productId: null });
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({ open: false, type: 'success', message: '' });

    useEffect(() => {
        const fetch = async () => {
            const result = await fetchProducts({ page, limit });
            if (result && result.pagination) {
                setTotalPages(result.pagination.pages);
            }
        };
        fetch();
        fetchCategories();
        // eslint-disable-next-line
    }, [page, limit, location.pathname]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                categoryId: Number(formData.category),
            };
            if (editingProduct) {
                await updateProduct(editingProduct.id, submitData);
                setToast({ open: true, type: 'success', message: 'Product updated successfully.' });
            } else {
                await createProduct(submitData);
                setToast({ open: true, type: 'success', message: 'Product created successfully.' });
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            resetForm();
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to save product.' });
            console.error('Failed to save product:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: String(product.category.id),
            imageUrl: product.imageUrl || '',
        });

        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({ open: true, productId: id });
    };

    const confirmDelete = async () => {
        if (confirmDialog.productId == null) return;
        try {
            await deleteProduct(confirmDialog.productId);
            setToast({ open: true, type: 'success', message: 'Product deleted successfully.' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to delete product.' });
        } finally {
            setConfirmDialog({ open: false, productId: null });
        }
    };



    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category: '',
            imageUrl: '',
        });

    };

    const filteredProducts = products.filter(product => {
        if (!product || typeof product !== 'object') {
            console.warn('Invalid product object:', product);
            return false;
        }
        return (
            (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.category && product.category.name && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600">Manage your product inventory</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </button>
            </div>
            {/* Search */}
            <ProductSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {/* Products table */}
            {isLoadingProducts ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <ProductList
                    products={filteredProducts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
            {/* Pagination UI */}
            <ProductPagination page={page} totalPages={totalPages} setPage={setPage} />
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h3>
                            <ProductForm
                                formData={formData}
                                setFormData={setFormData}
                                categories={categories}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setIsModalOpen(false);
                                    setEditingProduct(null);
                                    resetForm();
                                }}
                                editingProduct={editingProduct}
                            />
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationDialog
                open={confirmDialog.open}
                title="Delete Product"
                message="Are you sure you want to delete this product?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ open: false, productId: null })}
            />
            <ToastMessage
                id="product-toast"
                title={toast.type === 'success' ? 'Success' : 'Error'}
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, open: false }))}
            />
        </div>
    );
};

export default ProductsManagement; 