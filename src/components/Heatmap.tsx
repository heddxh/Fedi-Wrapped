import React from 'react';

interface HeatmapProps {
    data: Record<string, number>;
    year?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, year }) => {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(Date.UTC(targetYear, 0, 1));
    const endDate = new Date(Date.UTC(targetYear, 11, 31));
    const days: { date: string, count: number }[] = [];

    const startDay = startDate.getDay();
    for (let i = 0; i < startDay; i++) {
        days.push({ date: `pad-${i}`, count: -1 });
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        days.push({ date: dateKey, count: data[dateKey] || 0 });
    }

    const getLevel = (count: number) => {
        if (count === -1) return -1;
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 8) return 3;
        return 4;
    };

    const colors = [
        'bg-white/5',  // 0
        'bg-green-500/20', // 1
        'bg-green-500/40', // 2
        'bg-green-500/60', // 3
        'bg-green-400'  // 4
    ];

    return (
        <div className="w-full overflow-x-auto py-4 md:py-8 flex justify-start md:justify-center no-scrollbar px-4">
            <div className="grid grid-rows-7 grid-flow-col gap-1 auto-cols-max">
                {days.map((day, i) => {
                    const level = getLevel(day.count);
                    const colIndex = Math.floor(i / 7);
                    return (
                        <div
                            key={day.date}
                            title={day.count >= 0 ? `${day.date}: ${day.count} posts` : ''}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-[2px] md:rounded-[3px] ${level === -1 ? 'bg-transparent' : colors[level]} transition-colors duration-300 animate-scale-in opacity-0`}
                            style={{ animationDelay: `${colIndex * 15}ms` }}
                        />
                    );
                })}
            </div>
        </div>
    );
};
