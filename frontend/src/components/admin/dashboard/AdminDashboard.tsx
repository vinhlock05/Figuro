import React, { useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import StatsGrid from './StatsGrid';
import RecentOrders from './RecentOrders';
import TopProducts from './TopProducts';
import OrdersChart from './OrdersChart';
import DataDebugger from './DataDebugger';
import { formatVND } from '../../../utils/currency';
import {
    Users,
    ShoppingCart,
    DollarSign,
    Package
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { dashboardStats, isLoadingStats, fetchDashboardStats } = useAdmin();

    useEffect(() => {
        fetchDashboardStats();
        // eslint-disable-next-line
    }, []);

    if (isLoadingStats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!dashboardStats) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-black">No data available</h3>
                <p className="text-black">Dashboard statistics will appear here once data is available.</p>
            </div>
        );
    }

    // Debug logging
    console.log('Dashboard Stats:', dashboardStats);
    console.log('Recent Orders:', dashboardStats.recentOrders);
    console.log('Top Products:', dashboardStats.topProducts);

    // Map icon keys to icon components
    const iconMap: Record<string, React.ElementType> = {
        totalUsers: Users,
        totalOrders: ShoppingCart,
        totalProducts: Package,
        totalRevenue: DollarSign,
    };

    // Config for stats fields
    const statsConfig: Array<{
        key: 'totalUsers' | 'totalOrders' | 'totalProducts' | 'totalRevenue';
        name: string;
        icon: string;
        isMoney?: boolean;
    }> = [
            { key: 'totalUsers', name: 'Total Users', icon: 'totalUsers' },
            { key: 'totalOrders', name: 'Total Orders', icon: 'totalOrders' },
            { key: 'totalProducts', name: 'Total Products', icon: 'totalProducts' },
            { key: 'totalRevenue', name: 'Total Revenue', icon: 'totalRevenue', isMoney: true },
        ];

    // Generate stats array dynamically
    const stats = statsConfig.map(cfg => {
        let value: string | number = dashboardStats[cfg.key];
        if (cfg.isMoney) {
            // Handle both string and number for totalRevenue
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            value = formatVND(numValue || 0);
        }
        return {
            name: cfg.name,
            value,
            icon: iconMap[cfg.icon],
        };
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-black">Dashboard</h1>
                <p className="text-black">Overview of your store's performance</p>
            </div>

            {/* Stats grid */}
            <StatsGrid stats={stats} />

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders Chart */}
                <OrdersChart ordersByStatus={dashboardStats.ordersByStatus || []} />

                {/* Recent orders */}
                <RecentOrders recentOrders={dashboardStats.recentOrders} />
            </div>

            {/* Top products */}
            <TopProducts topProducts={dashboardStats.topProducts} />

            {/* Debug component - only in development */}
            {import.meta.env.DEV && (
                <DataDebugger data={dashboardStats} />
            )}
        </div>
    );
};

export default AdminDashboard;

