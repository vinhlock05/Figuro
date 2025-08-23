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
                <Shield className="h-8 w-8 text-black" />
                <div className="ml-4">
                    <div className="flex items-center">
                        <p className="text-sm font-medium text-black">{user.name}</p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-black">
                            {user.role}
                        </span>
                    </div>
                    <p className="text-sm text-black mt-1 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />{user.email}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <select
                    value={user.role}
                    onChange={e => onRoleUpdate(user.id, e.target.value as 'admin' | 'customer')}
                    className="border border-border rounded px-2 py-1 text-xs bg-background text-black focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                </select>
                <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                    <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    </li>
);

export default UserItem; 