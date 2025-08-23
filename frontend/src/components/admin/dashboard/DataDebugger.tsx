import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { DashboardStats } from '../../../services/adminService';

interface DataDebuggerProps {
    data: DashboardStats;
}

const DataDebugger: React.FC<DataDebuggerProps> = ({ data }) => {
    const [isVisible, setIsVisible] = useState(false);

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-muted-foreground text-background p-2 rounded-full shadow-lg hover:bg-foreground transition-colors"
                    title="Show Debug Info"
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-card text-black p-4 rounded-lg shadow-xl max-w-md max-h-96 overflow-auto text-xs border border-border">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">Debug Data</h4>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-black hover:text-black transition-colors"
                >
                    <EyeOff className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-2">
                <div>
                    <strong>Total Stats:</strong>
                    <pre className="bg-muted p-2 rounded mt-1 text-green-600 dark:text-green-400">
                        {JSON.stringify({
                            totalUsers: data.totalUsers,
                            totalOrders: data.totalOrders,
                            totalProducts: data.totalProducts,
                            totalRevenue: data.totalRevenue
                        }, null, 2)}
                    </pre>
                </div>

                <div>
                    <strong>Recent Orders ({data.recentOrders?.length || 0}):</strong>
                    <pre className="bg-muted p-2 rounded mt-1 text-blue-600 dark:text-blue-400">
                        {JSON.stringify(data.recentOrders || [], null, 2)}
                    </pre>
                </div>

                <div>
                    <strong>Top Products ({data.topProducts?.length || 0}):</strong>
                    <pre className="bg-muted p-2 rounded mt-1 text-yellow-600 dark:text-yellow-400">
                        {JSON.stringify(data.topProducts || [], null, 2)}
                    </pre>
                </div>

                <div>
                    <strong>Orders by Status ({data.ordersByStatus?.length || 0}):</strong>
                    <pre className="bg-muted p-2 rounded mt-1 text-purple-600 dark:text-purple-400">
                        {JSON.stringify(data.ordersByStatus || [], null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default DataDebugger;