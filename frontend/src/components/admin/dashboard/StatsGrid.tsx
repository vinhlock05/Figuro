import React from 'react';

interface StatsGridProps {
    stats: Array<{
        name: string;
        value: string | number;
        icon: React.ElementType;
        change: string;
        changeType: 'positive' | 'negative';
    }>;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
            <div
                key={item.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
            >
                <dt>
                    <div className="absolute rounded-md bg-indigo-500 p-3">
                        <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">
                        {item.name}
                    </p>
                </dt>
                <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                    <p
                        className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {item.changeType === 'positive' ? (
                            <svg className="h-4 w-4 flex-shrink-0 self-center" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        ) : (
                            <svg className="h-4 w-4 flex-shrink-0 self-center" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        )}
                        <span className="sr-only">
                            {item.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {item.change}
                    </p>
                </dd>
            </div>
        ))}
    </div>
);

export default StatsGrid; 