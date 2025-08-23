import React from 'react';

interface StatsGridProps {
    stats: Array<{
        name: string;
        value: string | number;
        icon: React.ElementType;
    }>;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
            <div
                key={item.name}
                className="relative overflow-hidden rounded-lg bg-card px-4 py-5 shadow border border-border"
            >
                <dt>
                    <div className="absolute rounded-md bg-indigo-500 p-3">
                        <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-black">
                        {item.name}
                    </p>
                </dt>
                <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-black">{item.value}</p>
                </dd>
            </div>
        ))}
    </div>
);

export default StatsGrid; 