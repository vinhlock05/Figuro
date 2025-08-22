import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { useLocation } from 'react-router-dom';
import UserList from './UserList';
import UserSearch from './UserSearch';
import UserPagination from './UserPagination';
import type { User } from '../../../services/adminService';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import ToastMessage, { type ToastType } from '../../common/ToastMessage';

export const UsersManagement: React.FC = () => {
    const {
        users,
        isLoadingUsers,
        fetchUsers,
        updateUserRole,
        deleteUser
    } = useAdmin();

    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<'admin' | 'customer'>('customer');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; userId: number | null }>({ open: false, userId: null });
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({ open: false, type: 'success', message: '' });

    useEffect(() => {
        const fetch = async () => {
            const result = await fetchUsers({ page, limit });
            if (result && result.pagination) {
                setTotalPages(result.pagination.pages);
            }
        };
        fetch();
        // eslint-disable-next-line
    }, [page, limit, location.pathname]);

    const handleRoleUpdate = async (userId: number, role: 'admin' | 'customer') => {
        try {
            await updateUserRole(userId, role);
            setEditingUser(null);
            setToast({ open: true, type: 'success', message: 'User role updated successfully.' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to update user role.' });
            console.error('Failed to update user role:', error);
        }
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({ open: true, userId: id });
    };

    const confirmDelete = async () => {
        if (confirmDialog.userId == null) return;
        try {
            await deleteUser(confirmDialog.userId);
            setToast({ open: true, type: 'success', message: 'User deleted successfully.' });
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Failed to delete user.' });
        } finally {
            setConfirmDialog({ open: false, userId: null });
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            {/* Search */}
            <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {/* Users table */}
            {isLoadingUsers ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <UserList users={filteredUsers} onEdit={setEditingUser} onDelete={handleDelete} onRoleUpdate={handleRoleUpdate} />
            )}
            {/* Pagination UI */}
            <UserPagination page={page} totalPages={totalPages} setPage={setPage} />
            {/* Role update modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Update User Role
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Update role for <strong>{editingUser.name}</strong>
                                    </p>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="customer"
                                                checked={newRole === 'customer'}
                                                onChange={() => setNewRole('customer')}
                                            />
                                            <span className="ml-2">Customer</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="admin"
                                                checked={newRole === 'admin'}
                                                onChange={() => setNewRole('admin')}
                                            />
                                            <span className="ml-2">Admin</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate(editingUser.id, newRole)}
                                        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationDialog
                open={confirmDialog.open}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ open: false, userId: null })}
            />
            <ToastMessage
                id="user-toast"
                title={toast.type === 'success' ? 'Success' : 'Error'}
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, open: false }))}
            />
        </div>
    );
};

export default UsersManagement; 