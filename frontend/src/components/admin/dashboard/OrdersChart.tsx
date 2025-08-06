import React, { useState } from 'react';
import { BarChart, PieChart, TrendingUp } from 'lucide-react';
import type { OrdersByStatus } from '../../../services/adminService';

interface OrdersChartProps {
    ordersByStatus: OrdersByStatus[];
}

type ChartType = 'pie' | 'bar';

const STATUS_COLORS: Record<string, string> = {
    'pending': '#F59E0B', // yellow
    'confirmed': '#3B82F6', // blue
    'processing': '#6366F1', // indigo
    'shipped': '#8B5CF6', // purple
    'delivered': '#10B981', // green
    'cancelled': '#EF4444', // red
    'refunded': '#6B7280', // gray
};

const STATUS_LABELS: Record<string, string> = {
    'pending': 'Chờ xử lý',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang xử lý',
    'shipped': 'Đã gửi',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy',
    'refunded': 'Đã hoàn tiền',
};

const OrdersChart: React.FC<OrdersChartProps> = ({ ordersByStatus }) => {
    const [chartType, setChartType] = useState<ChartType>('pie');

    const totalOrders = ordersByStatus.reduce((sum, item) => sum + item.count, 0);
    const maxCount = Math.max(...ordersByStatus.map(item => item.count));

    // Generate pie chart paths
    const generatePieChart = () => {
        if (totalOrders === 0) return [];

        const radius = 90;
        const centerX = 120;
        const centerY = 120;
        let currentAngle = 0;

        return ordersByStatus.map((item) => {
            const percentage = (item.count / totalOrders) * 100;
            const angle = (item.count / totalOrders) * 360;

            const startAngle = (currentAngle * Math.PI) / 180;
            const endAngle = ((currentAngle + angle) * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            currentAngle += angle;

            return {
                path: pathData,
                color: STATUS_COLORS[item.status] || '#6B7280',
                percentage,
                ...item
            };
        });
    };

    const pieChartData = generatePieChart();

    if (!ordersByStatus || ordersByStatus.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
                <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No order data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Orders by Status</h3>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setChartType('pie')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartType === 'pie'
                                    ? 'bg-white text-gray-900 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <PieChart className="h-4 w-4 inline mr-1" />
                            Pie
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartType === 'bar'
                                    ? 'bg-white text-gray-900 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <BarChart className="h-4 w-4 inline mr-1" />
                            Bar
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
                    {/* Chart */}
                    <div className="flex-1 mb-6 lg:mb-0">
                        {chartType === 'pie' ? (
                            <div className="flex justify-center">
                                <svg width="240" height="240" className="transform -rotate-90">
                                    {pieChartData.map((slice, index) => (
                                        <path
                                            key={index}
                                            d={slice.path}
                                            fill={slice.color}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                            title={`${STATUS_LABELS[slice.status]}: ${slice.count}`}
                                        />
                                    ))}
                                </svg>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ordersByStatus.map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-20 text-sm text-gray-600 truncate">
                                            {STATUS_LABELS[item.status] || item.status}
                                        </div>
                                        <div className="flex-1 mx-3">
                                            <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                                    style={{
                                                        width: `${(item.count / maxCount) * 100}%`,
                                                        backgroundColor: STATUS_COLORS[item.status] || '#6B7280'
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {item.count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-12 text-sm text-gray-600 text-right">
                                            {((item.count / totalOrders) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="lg:w-48">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
                        <div className="space-y-2">
                            {ordersByStatus.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: STATUS_COLORS[item.status] || '#6B7280' }}
                                        />
                                        <span className="text-sm text-gray-600">
                                            {STATUS_LABELS[item.status] || item.status}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {item.count}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">Total</span>
                                <span className="text-lg font-bold text-gray-900">{totalOrders}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersChart;