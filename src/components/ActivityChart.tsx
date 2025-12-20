import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-md z-[100] pointer-events-none">
                <p className="text-white font-bold text-lg mb-1">{label}:00 - {parseInt(label) + 1}:00</p>
                <p className="text-purple-300 font-medium">{payload[0].value} 条帖子</p>
            </div>
        );
    }
    return null;
};

interface ActivityChartProps {
    data: { hour: number; count: number }[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    return (
        <div className="w-full h-56 md:h-80 mt-2 relative z-50">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <XAxis
                        dataKey="hour"
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fill: 'white', fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(val) => `${val}`}
                        interval={3}
                        dy={10}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        content={<CustomTooltip />}
                        wrapperStyle={{ zIndex: 100 }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#ffffff' : 'rgba(255,255,255,0.2)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
