import React from 'react';
import type { CustomizationOption, Product } from '../../../services/adminService';
import CustomizationItem from './CustomizationItem';
import { Package, ChevronDown, ChevronRight } from 'lucide-react';

interface CustomizationGroupedListProps {
    customizations: CustomizationOption[];
    products: Product[];
    onEdit: (customization: CustomizationOption) => void;
    onDelete: (id: number) => void;
}

interface GroupedCustomizations {
    [productId: number]: {
        product: Product | undefined;
        customizations: CustomizationOption[];
        isExpanded: boolean;
    };
}

const CustomizationGroupedList: React.FC<CustomizationGroupedListProps> = ({
    customizations,
    products,
    onEdit,
    onDelete
}) => {
    const [expandedGroups, setExpandedGroups] = React.useState<Set<number>>(new Set());

    // Group customizations by productId
    const groupedCustomizations = React.useMemo(() => {
        const groups: GroupedCustomizations = {};

        // Ensure customizations is an array
        if (!Array.isArray(customizations)) {
            return groups;
        }

        customizations.forEach(customization => {
            const productId = customization.productId;
            if (!groups[productId]) {
                groups[productId] = {
                    product: products.find(p => p.id === productId),
                    customizations: [],
                    isExpanded: expandedGroups.has(productId)
                };
            }
            groups[productId].customizations.push(customization);
        });

        return groups;
    }, [customizations, products, expandedGroups]);

    const toggleGroup = (productId: number) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedGroups(newExpanded);
    };

    const sortedProductIds = Object.keys(groupedCustomizations)
        .map(id => parseInt(id))
        .sort((a, b) => {
            const productA = groupedCustomizations[a].product?.name || '';
            const productB = groupedCustomizations[b].product?.name || '';
            return productA.localeCompare(productB, 'vi-VN');
        });

    // Debug logging
    console.log('CustomizationGroupedList - customizations:', customizations);
    console.log('CustomizationGroupedList - products:', products);
    console.log('CustomizationGroupedList - groupedCustomizations:', groupedCustomizations);
    console.log('CustomizationGroupedList - sortedProductIds:', sortedProductIds);

    if (sortedProductIds.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 border border-red-300 bg-red-50">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No customization options found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedProductIds.map(productId => {
                const group = groupedCustomizations[productId];
                const isExpanded = expandedGroups.has(productId);

                return (
                    <div key={productId} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Product Header */}
                        <button
                            onClick={() => toggleGroup(productId)}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <Package className="h-5 w-5 text-gray-500" />
                                <div className="text-left">
                                    <h3 className="font-medium text-gray-900">
                                        {group.product?.name || `Product #${productId}`}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {group.customizations.length} customization{group.customizations.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-gray-500" />
                            )}
                        </button>

                        {/* Customizations Table */}
                        {isExpanded && (
                            <div className="border-t border-gray-200">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Value
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price Delta
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {group.customizations.map(customization => (
                                            <CustomizationItem
                                                key={customization.id}
                                                customization={customization}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                showProductId={false} // Don't show product ID since it's grouped
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CustomizationGroupedList;