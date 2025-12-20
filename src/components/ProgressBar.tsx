import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => (
    <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-6 flex gap-1.5 md:gap-2 z-50">
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="h-1 md:h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                    className={`h-full bg-white transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)] ${i < current ? 'w-full' : i === current ? 'w-full animate-pulse-slow' : 'w-0'}`}
                />
            </div>
        ))}
    </div>
);
