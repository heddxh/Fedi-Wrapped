import React from 'react';

interface Friend {
    username: string;
    count: number;
    avatar?: string;
}

interface InnerCircleGraphProps {
    friends: Friend[];
    userAvatar: string;
}

export const InnerCircleGraph: React.FC<InnerCircleGraphProps> = ({ friends, userAvatar }) => {
    const centerSize = 112; // 7rem
    const baseSize = 80;   // 5rem
    const minSize = 48;    // 3rem

    const maxCount = friends.length > 0 ? friends[0].count : 1;

    return (
        <div className="relative w-full h-[40vh] min-h-[300px] md:h-[500px] flex items-center justify-center animate-fade-in-up mt-4 md:mt-8">
            {/* Orbits / Decorative Rings */}
            <div className="absolute border border-white/10 rounded-full w-[240px] h-[240px] md:w-[300px] md:h-[300px]" />
            <div className="absolute border border-white/5 rounded-full w-[360px] h-[360px] md:w-[480px] md:h-[480px]" />

            {/* User Center */}
            <div className="absolute z-20 rounded-full p-1 md:p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <img
                    src={userAvatar}
                    alt="Me"
                    className="w-16 h-16 md:w-28 md:h-28 rounded-full object-cover border-2 md:border-4 border-black"
                    crossOrigin="anonymous"
                />
            </div>

            {/* Friends Orbit Container - Rotates */}
            <div className="absolute w-full h-full flex items-center justify-center animate-orbit">
                {friends.map((friend, i) => {
                    const rank = i;
                    // Adjust radius for mobile
                    const radius = (typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 160) + (rank * (typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 30));
                    const angle = (i * 72) - 90;
                    const angleRad = angle * (Math.PI / 180);

                    // Position relative to center
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;

                    const scale = (friend.count / maxCount);
                    const size = minSize + (baseSize - minSize) * scale;
                    // Scale size down on mobile
                    const displaySize = typeof window !== 'undefined' && window.innerWidth < 768 ? size * 0.7 : size;

                    const isBottomHalf = y > 0;

                    return (
                        <div
                            key={friend.username}
                            className="absolute z-10 group"
                            style={{
                                transform: `translate(${x}px, ${y}px)`,
                            }}
                        >
                            {/* Counter-rotate the friend container so the avatar stays upright while orbiting */}
                            <div className="animate-orbit-reverse relative flex flex-col items-center justify-center">
                                <div
                                    className="rounded-full p-[2px] md:p-[3px] bg-white/20 transition-transform duration-300 group-hover:scale-125 group-hover:z-30 group-hover:bg-white cursor-pointer"
                                    style={{ width: displaySize, height: displaySize }}
                                >
                                    <img
                                        src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=random`}
                                        alt={friend.username}
                                        className="w-full h-full rounded-full object-cover border border-black"
                                        crossOrigin="anonymous"
                                    />
                                </div>

                                {/* Tooltip */}
                                <div className={`absolute ${isBottomHalf ? 'bottom-full mb-3' : 'top-full mt-3'} opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm whitespace-nowrap pointer-events-none border border-white/10 shadow-xl z-50`}>
                                    <span className="font-bold text-base md:text-lg">@{friend.username}</span>
                                    <br />
                                    <span className="text-purple-300 font-medium">{friend.count} 次互动</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
