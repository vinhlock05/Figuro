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
            <div className="bg-card shadow rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-black mb-4">Orders by Status</h3>
                <div className="text-center py-8 text-black">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-black/50" />
                    <p>No order data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card shadow rounded-lg border border-border">
            <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-black">Orders by Status</h3>
                    <div className="flex bg-muted rounded-lg p-1">
                        <button
                            onClick={() => setChartType('pie')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartType === 'pie'
                                ? 'bg-background text-black shadow-sm'
                                : 'text-black hover:text-black'
                                }`}
                        >
                            <PieChart className="h-4 w-4 inline mr-1" />
                            Pie
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartType === 'bar'
                                ? 'bg-background text-black shadow-sm'
                                : 'text-black hover:text-black'
                                }`}
                        >
                            <BarChart className="h-4 w-4 inline mr-1" />
                            Bar
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {chartType === 'pie' ? (
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <svg width="240" height="240" className="transform -rotate-90">
                                {pieChartData.map((item, index) => (
                                    <path
                                        key={index}
                                        d={item.path}
                                        fill={item.color}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                ))}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-black">{totalOrders}</div>
                                    <div className="text-sm text-black">Total Orders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ordersByStatus.map((item) => {
                            const percentage = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
                            const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                            return (
                                <div key={item.status} className="flex items-center space-x-3">
                                    <div className="w-20 text-sm text-black">
                                        {STATUS_LABELS[item.status] || item.status}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-muted rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${barWidth}%`,
                                                    backgroundColor: STATUS_COLORS[item.status] || '#6B7280'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 text-right">
                                        <div className="text-sm font-medium text-black">{item.count}</div>
                                        <div className="text-xs text-black">{percentage.toFixed(1)}%</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                    {ordersByStatus.map((item) => (
                        <div key={item.status} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: STATUS_COLORS[item.status] || '#6B7280' }}
                            />
                            <span className="text-black">{STATUS_LABELS[item.status] || item.status}</span>
                            <span className="text-black font-medium">({item.count})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersChart;