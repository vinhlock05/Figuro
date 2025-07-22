import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationDialog from './ConfirmationDialog';
import ToastMessage, { type ToastType } from './ToastMessage';

interface UserMenuProps {
    user: { name?: string; email?: string } | null;
    onLogout: () => Promise<void> | void;
    settingsPath?: string;
    className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
    user,
    onLogout,
    settingsPath = '/settings',
    className = '',
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({ open: false, type: 'success', message: '' });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await onLogout();
            setMenuOpen(false);
            setToast({ open: true, type: 'success', message: 'Logged out successfully.' });
            navigate('/login');
        } catch (error) {
            setToast({ open: true, type: 'error', message: 'Logout failed.' });
        }
    };

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 focus:outline-none"
            >
                <span className="font-medium">{user?.name || 'User'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
                    <Link
                        to={settingsPath}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                    >
                        User Settings
                    </Link>
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>
            )}
            <ConfirmationDialog
                open={confirmOpen}
                title="Logout Confirmation"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                cancelText="Cancel"
                onConfirm={() => {
                    setConfirmOpen(false);
                    handleLogout();
                }}
                onCancel={() => setConfirmOpen(false)}
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

export default UserMenu; 