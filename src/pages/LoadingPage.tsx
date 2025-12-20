import React from 'react';

interface LoadingPageProps {
    loadingMsg: string;
    loadingAvatar: string | null;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ loadingMsg, loadingAvatar }) => {
    return (
        <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8">
            {loadingAvatar ? (
                <div className="w-20 h-20 md:w-24 md:h-24 mb-8 rounded-full border-4 border-indigo-500 overflow-hidden shadow-2xl animate-spin">
                    <img src={loadingAvatar} alt="Loading" className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8"></div>
            )}
            <h2 className="text-xl md:text-3xl font-display font-bold animate-pulse text-slate-800 text-center">{loadingMsg}</h2>
        </div>
    );
};
