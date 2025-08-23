import React from 'react';
import type { User } from '../../../services/adminService';
import UserItem from './UserItem';

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
    onRoleUpdate: (userId: number, role: 'admin' | 'customer') => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onRoleUpdate }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md text-black">
        {users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No users found</div>
        ) : (
            <ul className="divide-y divide-gray-200">
                {users.map(user => (
                    <UserItem key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} onRoleUpdate={onRoleUpdate} />
                ))}
            </ul>
        )}
    </div>
);

export default UserList; 