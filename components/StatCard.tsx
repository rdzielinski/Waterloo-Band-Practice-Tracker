import React from 'react';

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; className?: string }> = ({ title, value, icon: Icon, className = '' }) => (
    <div className={`bg-maroon-dark p-6 rounded-lg shadow-inner flex items-center space-x-4 ${className}`}>
        <div className="bg-maroon-light/50 p-3 rounded-full">
            <Icon className="w-8 h-8 text-gold" />
        </div>
        <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export default StatCard;
