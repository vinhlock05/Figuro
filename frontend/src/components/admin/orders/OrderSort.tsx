import React, { useState } from 'react';
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortField = 'product' | 'date' | 'price' | 'status' | 'customer';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

interface OrderSortProps {
    sortConfig: SortConfig;
    onSortChange: (config: SortConfig) => void;
}

const SORT_OPTIONS = [
    { value: 'product', label: 'Tên sản phẩm' },
    { value: 'customer', label: 'Khách hàng' },
    { value: 'date', label: 'Ngày tạo' },
    { value: 'price', label: 'Tổng tiền' },
    { value: 'status', label: 'Trạng thái' }
] as const;

const OrderSort: React.FC<OrderSortProps> = ({ sortConfig, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentOption = SORT_OPTIONS.find(option => option.value === sortConfig.field);

    const handleSortFieldChange = (field: SortField) => {
        onSortChange({
            field,
            direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
        setIsOpen(false);
    };

    const toggleDirection = () => {
        onSortChange({
            ...sortConfig,
            direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const getSortIcon = () => {
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="h-4 w-4" />;
        } else {
            return <ArrowDown className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sắp xếp theo:</span>

            {/* Sort Field Dropdown */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <ArrowUpDown className="h-4 w-4 mr-2 text-gray-400" />
                    {currentOption?.label}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </button>

                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                            <div className="py-1">
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortFieldChange(option.value)}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${sortConfig.field === option.value
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-gray-700'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Sort Direction Button */}
            <button
                type="button"
                onClick={toggleDirection}
                className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                title={sortConfig.direction === 'asc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}
            >
                {getSortIcon()}
            </button>
        </div>
    );
};

export default OrderSort;