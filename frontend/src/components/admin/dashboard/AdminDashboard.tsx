import React, { useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import StatsGrid from './StatsGrid';
import RecentOrders from './RecentOrders';
import TopProducts from './TopProducts';
import {
    Users,
    ShoppingCart,
    Package,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock
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
                <h3 className="text-lg font-medium text-gray-900">No data available</h3>
                <p className="text-gray-500">Dashboard statistics will appear here once data is available.</p>
            </div>
        );
    }

    // Map icon keys to icon components
    const iconMap: Record<string, React.ElementType> = {
        totalUsers: Users,
        totalOrders: ShoppingCart,
        totalRevenue: DollarSign,
    };

    // Config for stats fields
    const statsConfig: Array<{
        key: 'totalUsers' | 'totalOrders' | 'totalRevenue';
        name: string;
        icon: string;
        isMoney?: boolean;
        change?: string;
        changeType?: 'positive' | 'negative';
    }> = [
            { key: 'totalUsers', name: 'Total Users', icon: 'totalUsers', change: '+0%', changeType: 'positive' },
            { key: 'totalOrders', name: 'Total Orders', icon: 'totalOrders', change: '+0%', changeType: 'positive' },
            { key: 'totalRevenue', name: 'Total Revenue', icon: 'totalRevenue', isMoney: true, change: '+0%', changeType: 'positive' },
        ];

    // Generate stats array dynamically
    const stats = statsConfig.map(cfg => {
        let value: string | number = dashboardStats[cfg.key];
        if (cfg.isMoney && typeof value === 'number') {
            value = `$${value.toLocaleString()}`;
        }
        return {
            name: cfg.name,
            value,
            icon: iconMap[cfg.icon],
            change: cfg.change || '+0%',
            changeType: cfg.changeType || 'positive',
        };
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Overview of your store's performance</p>
            </div>

            {/* Stats grid */}
            <StatsGrid stats={stats} />

            {/* Recent orders */}
            <RecentOrders recentOrders={dashboardStats.recentOrders} />

            {/* Top products */}
            <TopProducts topProducts={dashboardStats.topProducts} />
        </div>
    );
};

export default AdminDashboard;

