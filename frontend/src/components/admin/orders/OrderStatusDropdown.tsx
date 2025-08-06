import React, { useState } from 'react';
import { ChevronDown, Clock, Package, Truck, CheckCircle, AlertCircle, RefreshCw, CheckSquare } from 'lucide-react';
import type { Order } from '../../../services/adminService';

interface OrderStatusDropdownProps {
    currentStatus: Order['status'];
    orderId: number;
    onStatusUpdate: (orderId: number, status: Order['status']) => void;
    disabled?: boolean;
}

// Status flow validation from backend
const STATUS_FLOW: Record<Order['status'], Order['status'][]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': ['refunded'],
    'cancelled': [],
    'refunded': []
};

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; icon: any }> = {
    'pending': {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
    },
    'confirmed': {
        label: 'Confirmed',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckSquare
    },
    'processing': {
        label: 'Processing',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Package
    },
    'shipped': {
        label: 'Shipped',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Truck
    },
    'delivered': {
        label: 'Delivered',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
    },
    'cancelled': {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle
    },
    'refunded': {
        label: 'Refunded',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: RefreshCw
    }
};

const OrderStatusDropdown: React.FC<OrderStatusDropdownProps> = ({
    currentStatus,
    orderId,
    onStatusUpdate,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const currentConfig = STATUS_CONFIG[currentStatus];
    const CurrentIcon = currentConfig.icon;

    // Get valid next statuses based on current status
    const validNextStatuses = STATUS_FLOW[currentStatus] || [];

    const handleStatusSelect = (newStatus: Order['status']) => {
        if (newStatus !== currentStatus) {
            onStatusUpdate(orderId, newStatus);
        }
        setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Check dropdown position when opening
    const handleToggleDropdown = () => {
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeight = 200; // Approximate dropdown height

            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setDropdownPosition('top');
            } else {
                setDropdownPosition('bottom');
            }
        }
        setIsOpen(!isOpen);
    };

    if (disabled || validNextStatuses.length === 0) {
        // Show read-only status if disabled or no valid transitions
        return (
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border ${currentConfig.color}`}>
                <CurrentIcon className="h-3 w-3 mr-1" />
                {currentConfig.label}
            </span>
        );
    }

    return (
        <div className="relative" onKeyDown={handleKeyDown} ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggleDropdown}
                className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${currentConfig.color}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <CurrentIcon className="h-3 w-3 mr-1" />
                {currentConfig.label}
                <ChevronDown className="h-3 w-3 ml-1" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className={`absolute left-0 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}>
                        <div className="py-1" role="listbox">
                            {/* Current status (read-only) */}
                            <div className="px-3 py-2 text-xs font-medium bg-gray-50 text-gray-600">
                                <div className="flex items-center">
                                    <CurrentIcon className="h-3 w-3 mr-2" />
                                    {currentConfig.label} (Current)
                                </div>
                            </div>

                            {validNextStatuses.length > 0 && (
                                <>
                                    <hr className="my-1 border-gray-200" />
                                    {validNextStatuses.map((status) => {
                                        const config = STATUS_CONFIG[status];
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusSelect(status)}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                                                role="option"
                                            >
                                                <Icon className="h-3 w-3 mr-2" />
                                                Change to {config.label}
                                            </button>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrderStatusDropdown;