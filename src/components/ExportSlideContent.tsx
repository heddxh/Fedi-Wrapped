import React from 'react';
import { Sparkles, Calendar, MessageCircle } from 'lucide-react';
import { YearStats } from '@/types';
import { StatCard, Heatmap } from '@/components';

interface ExportSlideProps {
    stats: YearStats;
    slideIndex: number;
}

/**
 * Simplified slide content optimized for fixed-size export (1080x1920)
 * These are static versions without animations and interactive elements
 */
export const ExportSlideContent: React.FC<ExportSlideProps> = ({ stats, slideIndex }) => {
    switch (slideIndex) {
        case 0: // Intro
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-16">
                    <div className="w-48 h-48 rounded-full border-4 border-white/20 overflow-hidden mb-12 shadow-2xl">
                        <img src={stats.account.avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-7xl font-display font-bold mb-8 tracking-tight">
                        你好, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 block mt-4">{stats.account.display_name}</span>
                    </h1>
                    <p className="text-3xl text-white/90 max-w-2xl leading-relaxed font-light">
                        这一年在联邦宇宙过得怎么样？
                    </p>
                    <div className="mt-16 px-12 py-4 bg-white/10 rounded-full border border-white/20">
                        <span className="text-2xl font-bold">{stats.year} 年度总结</span>
                    </div>
                </div>
            );

        case 1: // Numbers + Vibe
            return (
                <div className="flex flex-col h-full justify-center px-16 space-y-12">
                    <div className="text-center mb-8">
                        <div className="inline-block px-6 py-2 rounded-full bg-white/10 border border-white/20 text-lg font-bold mb-8 tracking-wider uppercase text-purple-100">
                            年度关键词
                        </div>
                        <h2 className="text-8xl font-display font-bold text-white mb-6">
                            {stats.vibeKeyword}
                        </h2>
                        <p className="text-2xl text-white/90 max-w-2xl mx-auto">{stats.vibeDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
                        <StatCard label="发布总数" value={stats.totalPosts} />
                        <StatCard label="累计字数" value={(stats.wordCount / 1000).toFixed(1) + 'k'} sub="约" />
                        <StatCard label="收获喜欢" value={stats.totalFavourites} />
                        <StatCard label="被转发" value={stats.totalReblogs} />
                    </div>
                </div>
            );

        case 2: // Heatmap
            return (
                <div className="flex flex-col h-full justify-center items-center px-16 text-center">
                    <Calendar size={80} className="text-green-300 mb-8" />
                    <h2 className="text-6xl font-display font-bold mb-6">坚持就是胜利</h2>
                    <p className="text-2xl text-white/90 mb-8 max-w-xl">
                        这是你在 {stats.year} 年发布的每一天。
                    </p>
                    <div className="mb-12 inline-flex items-center gap-3 bg-white/20 px-8 py-3 rounded-full border border-white/20">
                        <Sparkles size={24} fill="currentColor" className="text-yellow-300" />
                        <span className="text-2xl font-bold">最长连续 {stats.longestStreak} 天</span>
                    </div>
                    <div className="w-full scale-150 transform">
                        <Heatmap data={stats.heatmapData} year={stats.year} />
                    </div>
                </div>
            );

        case 3: // Habits
            return (
                <div className="flex flex-col h-full justify-center items-center px-16 text-center">
                    <h2 className="text-6xl font-display font-bold mb-6">你的节奏</h2>
                    <p className="text-2xl text-white/90 mb-12">
                        你最活跃的时间大约是 <span className="text-blue-300 font-bold">{stats.mostActiveHour}:00</span>
                    </p>
                    <div className="grid grid-cols-2 gap-8 max-w-2xl w-full">
                        <div className="bg-white/10 rounded-3xl p-8 text-center">
                            <div className="text-5xl font-bold font-display text-blue-300">{stats.mostActiveHour}:00</div>
                            <div className="text-lg text-white/60 mt-2 uppercase tracking-widest">最活跃时间</div>
                        </div>
                        <div className="bg-white/10 rounded-3xl p-8 text-center">
                            <div className="text-5xl font-bold font-display text-emerald-300">{stats.mostActiveMonth}</div>
                            <div className="text-lg text-white/60 mt-2 uppercase tracking-widest">最活跃月份</div>
                        </div>
                    </div>
                </div>
            );

        case 4: // Highlights (simplified)
            const topPost = stats.topFavoritedPosts[0];
            return (
                <div className="flex flex-col h-full justify-center items-center px-16 text-center">
                    <h2 className="text-6xl font-display font-bold mb-8">高光时刻</h2>
                    <p className="text-2xl text-white/80 mb-12">你最受欢迎的嘟文</p>
                    {topPost && (
                        <div className="bg-white text-black p-10 rounded-3xl shadow-2xl max-w-2xl w-full">
                            <div
                                className="text-xl leading-relaxed mb-6 line-clamp-6"
                                dangerouslySetInnerHTML={{ __html: topPost.content }}
                            />
                            <div className="flex gap-8 text-lg font-bold text-gray-600 justify-center">
                                <span>★ {topPost.favourites_count}</span>
                                <span>↺ {topPost.reblogs_count}</span>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 5: // Thread
            return (
                <div className="flex flex-col h-full justify-center items-center px-16 text-center">
                    <MessageCircle size={100} className="mb-8 text-blue-300" />
                    {stats.longestThread ? (
                        <>
                            <h2 className="text-6xl font-display font-bold mb-6">长串串！</h2>
                            <p className="text-3xl text-white/90 mb-4">
                                你把 <span className="text-blue-300 font-bold">{stats.longestThread.length}</span> 条嘟文串在了一起。
                            </p>
                            <p className="text-xl text-white/60">看来你有很多想法不吐不快！</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-6xl font-display font-bold mb-6">言简意赅</h2>
                            <p className="text-2xl text-white/90">今年没有发现特别长的串。</p>
                        </>
                    )}
                </div>
            );

        case 6: // Connections
            return (
                <div className="flex flex-col h-full justify-center items-center px-16 text-center">
                    <MessageCircle size={100} className="text-pink-300 mb-8" />
                    <h2 className="text-6xl font-display font-bold mb-6">核心朋友圈</h2>
                    <p className="text-2xl text-white/80 mb-12">基于你最常提及的人</p>
                    {stats.topFriends.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-6 max-w-2xl">
                            {stats.topFriends.slice(0, 5).map((friend, idx) => (
                                <div key={friend.username} className="flex flex-col items-center gap-2">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30">
                                        <img
                                            src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=random`}
                                            alt={friend.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="text-lg font-bold">@{friend.username}</span>
                                    <span className="text-sm text-purple-300">{friend.count} 次</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60 italic text-xl">今年你似乎是一匹独狼。</p>
                    )}
                </div>
            );

        case 7: // Summary poster
            return (
                <div className="flex flex-col h-full justify-center items-center px-12">
                    <div className="bg-white/10 backdrop-blur-2xl p-12 rounded-[2rem] shadow-2xl max-w-xl w-full border border-white/20 flex flex-col gap-8">
                        {/* Header */}
                        <div className="flex items-center gap-6 border-b border-white/10 pb-6">
                            <img src={stats.account.avatar} className="w-24 h-24 rounded-full border-4 border-white/10" alt="avatar" />
                            <div>
                                <h3 className="font-bold text-3xl font-display">{stats.account.display_name}</h3>
                                <p className="text-white/60 text-lg font-mono">@{stats.account.username}</p>
                            </div>
                            <div className="ml-auto text-5xl font-bold opacity-20">{stats.year}</div>
                        </div>

                        {/* Keyword */}
                        <div className="text-center py-4">
                            <div className="text-sm uppercase tracking-[0.3em] text-white/50 mb-3">年度关键词</div>
                            <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-purple-200">
                                {stats.vibeKeyword}
                            </h2>
                            <p className="text-white/80 mt-4 text-lg">{stats.vibeDescription}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                                <div className="text-xs text-white/50 uppercase">发布数</div>
                            </div>
                            <div className="bg-black/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-pink-300">{stats.totalFavourites}</div>
                                <div className="text-xs text-white/50 uppercase">喜欢</div>
                            </div>
                            <div className="bg-black/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-300">{stats.longestStreak}</div>
                                <div className="text-xs text-white/50 uppercase">连续天数</div>
                            </div>
                        </div>

                        {/* Tags */}
                        {stats.topTags.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {stats.topTags.slice(0, 5).map(t => (
                                    <span key={t} className="text-sm bg-white/5 px-3 py-1 rounded-full text-white/70 font-mono">{t}</span>
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-end opacity-40 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold tracking-widest">FEDI WRAPPED</span>
                            </div>
                            <div className="text-xs font-mono">{new Date().toLocaleDateString('zh-CN')}</div>
                        </div>
                    </div>
                </div>
            );

        default:
            return null;
    }
};
