import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, delay = 0 }) => (
    <div
        className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center text-center shadow-xl animate-fade-in-up min-w-[140px] md:min-w-[160px]"
        style={{ animationDelay: `${delay}ms` }}
    >
        <span className="text-xs md:text-base font-bold uppercase tracking-widest text-white/70 mb-2 md:mb-3">{label}</span>
        <span className="text-3xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-1 md:mb-2">{value}</span>
        {sub && <span className="text-xs md:text-sm text-white/50 font-medium">{sub}</span>}
    </div>
);
