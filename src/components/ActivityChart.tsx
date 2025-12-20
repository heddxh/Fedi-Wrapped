import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-2 rounded-lg shadow-xl backdrop-blur-md z-[100] pointer-events-none">
                <p className="text-white font-bold text-sm">{label}:00 - {parseInt(label) + 1}:00</p>
                <p className="text-purple-300 font-medium text-xs">{payload[0].value} 条帖子</p>
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
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <XAxis
                        dataKey="hour"
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fill: 'white', fontSize: 8, fontWeight: 600 }}
                        tickFormatter={(val) => `${val}`}
                        interval={5}
                        dy={5}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        content={<CustomTooltip />}
                        wrapperStyle={{ zIndex: 100 }}
                    />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#ffffff' : 'rgba(255,255,255,0.2)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

