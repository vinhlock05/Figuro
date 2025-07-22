import React from 'react';
import { Edit, Trash2, Shield, Mail } from 'lucide-react';
import type { User } from '../../../services/adminService';

interface UserItemProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
    onRoleUpdate: (userId: number, role: 'admin' | 'customer') => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onEdit, onDelete, onRoleUpdate }) => (
    <li key={user.id}>
        <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center">
                <Shield className="h-8 w-8 text-gray-400" />
                <div className="ml-4">
                    <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {user.role}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />{user.email}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <select
                    value={user.role}
                    onChange={e => onRoleUpdate(user.id, e.target.value as 'admin' | 'customer')}
                    className="border rounded px-2 py-1 text-xs"
                >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                </select>
                <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-900">
                    <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    </li>
);

export default UserItem; 