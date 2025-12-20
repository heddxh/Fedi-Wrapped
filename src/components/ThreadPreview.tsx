import React from 'react';
import { Status } from '@/types';

interface ThreadPreviewProps {
    root: Status;
    length: number;
    onClick?: () => void;
}

export const ThreadPreview: React.FC<ThreadPreviewProps> = ({ root, length, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`block relative w-full max-w-xl mx-auto mt-4 md:mt-8 transition-transform ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} px-2 md:px-0`}
        >
            {/* Thread illusion cards behind with entrance animation */}
            <div className="absolute top-4 left-4 right-[-10px] h-full bg-white/30 rounded-[2rem] transform rotate-3 animate-card-fan opacity-0" style={{ '--tw-rotate': '3deg', animationDelay: '0.1s' } as any} />
            <div className="absolute top-2 left-2 right-[-5px] h-full bg-white/60 rounded-[2rem] transform rotate-1 animate-card-fan opacity-0" style={{ '--tw-rotate': '1deg', animationDelay: '0.2s' } as any} />

            <div className="relative bg-white text-black p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl animate-fade-in-up z-10 min-h-[250px] md:min-h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-wide bg-blue-100 text-blue-800 px-3 py-1 md:px-4 md:py-1.5 rounded-full">
                        串的开始
                    </span>
                    <span className="text-sm md:text-base font-bold text-gray-500">
                        还有 {length - 1} 条
                    </span>
                </div>

                {/* Center Big Text for Thread Preview */}
                <div className="flex-1 flex items-center justify-center">
                    <h3 className="text-3xl md:text-5xl font-display font-bold text-gray-800 tracking-widest text-center">
                        开串！
                    </h3>
                </div>

                <div className="text-xs md:text-sm font-medium text-gray-400 border-t border-gray-200 pt-4 flex justify-between items-center mt-auto">
                    <span>{new Date(root.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {onClick && <span className="text-blue-500 font-bold text-xs uppercase tracking-wide">点击展开</span>}
                </div>
            </div>
        </div>
    );
};
