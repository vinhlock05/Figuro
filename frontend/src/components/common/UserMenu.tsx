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
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
            >
                <span className="font-medium text-neutral-800 dark:text-neutral-100">{user?.name || 'User'}</span>
                <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-soft z-50">
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{user?.name || 'User'}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-300">{user?.email}</p>
                    </div>
                    <Link
                        to={settingsPath}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        onClick={() => setMenuOpen(false)}
                    >
                        User Settings
                    </Link>
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-neutral-100 dark:hover:bg-neutral-700"
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