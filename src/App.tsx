import React, { useState, useRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { Sparkles, ArrowRight, Calendar, MessageCircle, Moon, Clock, ChevronLeft, ChevronRight, Copy, Check, Download, RefreshCw } from 'lucide-react';

// Types
import { WrappedData, Status, AccountCredential } from '@/types';

// Constants
import { AppState, TOTAL_SLIDES, FALLBACK_GRADIENTS } from '@/constants';

// Services
import { getWrappedData, regenerateVibe } from '@/services';

// Hooks
import { useFontLoader } from '@/hooks';

// Components
import {
    StatCard,
    ActivityChart,
    StackedPostGallery,
    ThreadPreview,
    ThreadModal,
    ProgressBar,
    Heatmap,
    InnerCircleGraph
} from '@/components';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { LoadingPage } from '@/pages/LoadingPage';

// Utils
import { formatTime } from '@/utils';

export default function App() {
    const [state, setState] = useState<AppState>(AppState.LOGIN);

    // State for multiple accounts
    const [accounts, setAccounts] = useState<AccountCredential[]>([
        { instance: '', username: '', token: '', id: '1' }
    ]);

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [data, setData] = useState<WrappedData | null>(null);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [loadingAvatar, setLoadingAvatar] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [slideIndex, setSlideIndex] = useState(0);
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Regenerate state
    const [regeneratingVibe, setRegeneratingVibe] = useState(false);

    // Modal state for threads
    const [activeThread, setActiveThread] = useState<Status[] | null>(null);

    const slideRef = useRef<HTMLDivElement>(null);

    // Load fonts
    const fontCss = useFontLoader();

    // Highlight slide tab state
    const [highlightTab, setHighlightTab] = useState<'fav' | 'boost'>('fav');

    const addAccount = () => {
        setAccounts([...accounts, { instance: '', username: '', token: '', id: Date.now().toString() }]);
    };

    const removeAccount = (index: number) => {
        if (accounts.length > 1) {
            const newAccounts = [...accounts];
            newAccounts.splice(index, 1);
            setAccounts(newAccounts);
        }
    };

    const updateAccount = (index: number, field: keyof AccountCredential, value: string) => {
        const newAccounts = [...accounts];
        newAccounts[index] = { ...newAccounts[index], [field]: value };
        setAccounts(newAccounts);
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const validAccounts = accounts.filter(a => a.instance && a.username);
        if (validAccounts.length === 0) {
            setError("请至少填写一个有效的实例地址和用户名。");
            return;
        }

        setError(null);
        setLoadingAvatar(null);
        setState(AppState.LOADING);

        try {
            const wrappedData = await getWrappedData(
                validAccounts,
                setLoadingMsg,
                (avatarUrl) => setLoadingAvatar(avatarUrl)
            );
            setData(wrappedData);
            setState(AppState.WRAPPED);
        } catch (err: any) {
            setError(err.message || "获取数据失败，请检查网络连接或账号信息。");
            setState(AppState.LOGIN);
        }
    };

    const handleStartOver = () => {
        setData(null);
        setSlideIndex(0);
        setHighlightTab('fav');
        setState(AppState.LOGIN);
        setError(null);
        setLoadingAvatar(null);
    };

    const handleRegenerateVibe = async () => {
        if (!data || regeneratingVibe) return;
        setRegeneratingVibe(true);
        try {
            const newVibe = await regenerateVibe(data.stats.postContentPool);
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    stats: {
                        ...prev.stats,
                        vibeKeyword: newVibe.keyword,
                        vibeDescription: newVibe.description,
                        vibeColor: newVibe.color
                    }
                };
            });
        } catch (e) {
            console.error("Regenerate failed", e);
            alert("重新生成失败，请稍后再试。");
        } finally {
            setRegeneratingVibe(false);
        }
    };

    const nextSlide = () => {
        if (slideIndex < TOTAL_SLIDES - 1) setSlideIndex(p => p + 1);
    };

    const prevSlide = () => {
        if (slideIndex > 0) setSlideIndex(p => p - 1);
    };

    // Filter node for html-to-image (exclude buttons, etc.)
    const filterNode = (node: HTMLElement) => {
        if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
            return false;
        }
        if (node.classList && node.classList.contains('exclude-from-capture')) {
            return false;
        }
        return true;
    };

    // Export handlers - direct capture of visible slide
    const handleCopySlide = async () => {
        if (!slideRef.current || copying) return;

        setCopying(true);
        try {
            const blob = await toBlob(slideRef.current, {
                cacheBust: true,
                type: 'image/png',
                backgroundColor: '#000000',
                filter: filterNode,
                fontEmbedCSS: fontCss || undefined
            });

            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy image', err);
            alert("无法访问剪贴板，请尝试下载图片。");
        } finally {
            setCopying(false);
        }
    };

    const handleDownloadSlide = async () => {
        if (!slideRef.current || downloading) return;

        setDownloading(true);
        try {
            const dataUrl = await toPng(slideRef.current, {
                cacheBust: true,
                backgroundColor: '#000000',
                filter: filterNode,
                fontEmbedCSS: fontCss || undefined
            });

            const link = document.createElement('a');
            link.download = `fedi-wrapped-slide-${slideIndex + 1}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to download image', err);
            alert("图片生成失败。");
        } finally {
            setDownloading(false);
        }
    };

    // Background style based on slide/vibe
    const getBackground = () => {
        if (data && data.stats.vibeColor) {
            return data.stats.vibeColor;
        }
        return FALLBACK_GRADIENTS[slideIndex % FALLBACK_GRADIENTS.length];
    };

    // Render content based on current slide
    const renderSlideContent = () => {
        if (!data) return null;
        const { stats } = data;

        switch (slideIndex) {
            case 0: // Intro
                return (
                    <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center animate-fade-in-up">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 overflow-hidden mb-6 md:mb-8 shadow-2xl">
                            <img src={stats.account.avatar} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-display font-bold mb-4 md:mb-6 tracking-tight break-words max-w-full drop-shadow-lg">
                            你好, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 block mt-2 drop-shadow-sm">{stats.account.display_name}</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-white/90 max-w-lg leading-relaxed font-light drop-shadow-md">
                            这一年在联邦宇宙过得怎么样？准备好查看你的 {stats.year} 年度总结了吗？
                        </p>
                        <p className="text-white/50 text-sm md:text-lg max-w-lg leading-relaxed font-light drop-shadow-md mt-4">
                            向左或向右轻点以切换
                        </p>
                        <div className="mt-8 md:mt-16 flex flex-col items-center gap-4">
                            <button onClick={nextSlide} className="bg-white text-black px-8 py-3 md:px-10 md:py-4 rounded-full text-lg md:text-xl font-bold hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                开启旅程 <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                );

            case 1: // The Numbers (Updated with Vibe)
                return (
                    <div className="flex flex-col h-full justify-center p-4 md:p-8 space-y-4 md:space-y-8">
                        <div className="text-center mb-4">
                            <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/10 border border-white/20 text-xs md:text-sm font-bold mb-4 tracking-wider uppercase text-purple-100 backdrop-blur-md">
                                你的年度关键词
                            </div>
                            <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white drop-shadow-xl">
                                {stats.vibeKeyword}
                            </h2>
                            <p className="text-base md:text-xl text-white/90 mt-4 max-w-2xl mx-auto drop-shadow-md">{stats.vibeDescription}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto w-full">
                            <StatCard label="发布总数" value={stats.totalPosts} delay={100} />
                            <StatCard label="累计字数" value={(stats.wordCount / 1000).toFixed(1) + 'k'} sub="约" delay={200} />
                            <StatCard label="收获喜欢" value={stats.totalFavourites} delay={300} />
                            <StatCard label="被转发" value={stats.totalReblogs} delay={400} />
                        </div>
                    </div>
                );

            case 2: // Heatmap (Activity + Streak)
                return (
                    <div className="flex flex-col h-full justify-center items-center p-4 md:p-8 text-center">
                        <div className="mb-4 md:mb-6 flex flex-col items-center gap-2">
                            <Calendar size={48} className="text-green-300 drop-shadow-md md:w-16 md:h-16" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-2 md:mb-4 drop-shadow-lg">坚持就是胜利</h2>
                        <p className="text-base md:text-xl text-white/90 mb-4 max-w-xl drop-shadow-md">
                            这是你在 {stats.year} 年发布的每一天。
                        </p>

                        {/* Longest Streak Badge */}
                        <div className="mb-6 md:mb-10 inline-flex items-center gap-2 bg-white/20 px-4 py-2 md:px-6 rounded-full border border-white/20 shadow-lg backdrop-blur-sm">
                            <span className="text-yellow-300"><Sparkles size={16} className="md:w-5 md:h-5" fill="currentColor" /></span>
                            <span className="text-sm md:text-lg font-bold">最长连续 {stats.longestStreak} 天</span>
                        </div>

                        <div className="w-full">
                            <Heatmap data={stats.heatmapData} year={stats.year} />
                        </div>
                    </div>
                );

            case 3: // Habits (Graph + Special Posts)
                return (
                    <div className="flex flex-col h-full justify-center p-4 md:p-8 w-full max-w-6xl mx-auto">
                        <div className="text-center mb-2 md:mb-4">
                            <h2 className="text-2xl md:text-4xl font-display font-bold mb-1 md:mb-2 drop-shadow-lg">你的节奏</h2>
                            <p className="text-sm md:text-xl text-white/90 drop-shadow-md">
                                你最活跃的时间大约是 <span className="text-blue-300 font-bold">{stats.mostActiveHour}:00</span>。
                            </p>
                        </div>

                        <div className="bg-white/10 p-3 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/10 backdrop-blur-lg shadow-2xl mb-3 md:mb-6 flex-shrink-0 h-[20vh] md:h-[30vh] min-h-[120px] overflow-hidden">
                            <ActivityChart data={stats.postsByHour} />
                        </div>

                        {/* Special Posts Grid */}
                        <div className="grid grid-cols-2 gap-2 md:gap-4 w-full">
                            {/* Night Owl */}
                            {stats.latestPost && (
                                <a
                                    href={stats.latestPost.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/10 flex flex-col hover:bg-white/15 hover:scale-[1.01] transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-purple-200">
                                        <Moon size={14} className="md:w-5 md:h-5 group-hover:text-purple-100" />
                                        <span className="font-bold text-[10px] md:text-sm uppercase tracking-wider group-hover:text-white">最晚夜猫子</span>
                                        <span className="ml-auto font-mono bg-purple-900/50 px-1.5 md:px-2 py-0.5 rounded text-[9px] md:text-xs border border-purple-500/30">
                                            {formatTime(stats.latestPost.created_at)}
                                        </span>
                                    </div>
                                    <div
                                        className="text-[10px] md:text-base text-white/80 line-clamp-2 md:line-clamp-3 font-medium break-words"
                                        dangerouslySetInnerHTML={{ __html: stats.latestPost.content }}
                                    />
                                </a>
                            )}

                            {/* Rare Moment */}
                            {stats.rarePost && (
                                <a
                                    href={stats.rarePost.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/10 flex flex-col hover:bg-white/15 hover:scale-[1.01] transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-orange-200">
                                        <Clock size={14} className="md:w-5 md:h-5 group-hover:text-orange-100" />
                                        <span className="font-bold text-[10px] md:text-sm uppercase tracking-wider group-hover:text-white">罕见出没</span>
                                    </div>
                                    <div
                                        className="text-[10px] md:text-base text-white/80 line-clamp-2 md:line-clamp-3 font-medium break-words"
                                        dangerouslySetInnerHTML={{ __html: stats.rarePost.content }}
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                );

            case 4: // Top Content (Highlights) with Tabs
                const postsToShow = highlightTab === 'fav' ? stats.topFavoritedPosts : stats.topRebloggedPosts;
                return (
                    <div className="flex flex-col h-full justify-center items-center p-4 md:p-6">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4 md:mb-8 drop-shadow-lg">高光时刻</h2>

                        <div className="flex bg-white/10 p-1 md:p-1.5 rounded-full mb-4 md:mb-8 relative z-30 shadow-lg border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setHighlightTab('fav')}
                                className={`px-5 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-bold transition-all ${highlightTab === 'fav' ? 'bg-white text-black shadow-md' : 'text-white/70 hover:text-white'}`}
                            >
                                最受欢迎
                            </button>
                            <button
                                onClick={() => setHighlightTab('boost')}
                                className={`px-5 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-bold transition-all ${highlightTab === 'boost' ? 'bg-white text-black shadow-md' : 'text-white/70 hover:text-white'}`}
                            >
                                最多转发
                            </button>
                        </div>

                        <StackedPostGallery posts={postsToShow} />
                    </div>
                );

            case 5: // Longest Thread
                return (
                    <div className="flex flex-col h-full justify-center items-center p-4 md:p-8 text-center">
                        <MessageCircle size={64} className="mb-6 text-blue-300 drop-shadow-md md:w-20 md:h-20" />
                        {stats.longestThread ? (
                            <>
                                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 drop-shadow-lg">长串串！</h2>
                                <p className="text-lg md:text-2xl text-white/90 mb-4 drop-shadow-md">
                                    你把 <span className="text-blue-300 font-bold">{stats.longestThread.length}</span> 条嘟文串在了一起。
                                </p>
                                <p className="text-sm md:text-lg text-white/60 mb-8 md:mb-12 drop-shadow-sm">看来你有很多想法不吐不快！</p>
                                <div className="w-full animate-fade-in-up">
                                    <ThreadPreview
                                        root={stats.longestThread.root}
                                        length={stats.longestThread.length}
                                        onClick={() => setActiveThread(stats.longestThread!.posts)}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 drop-shadow-lg">言简意赅</h2>
                                <p className="text-base md:text-xl text-white/90 drop-shadow-md">今年没有发现特别长的串。</p>
                            </>
                        )}
                    </div>
                );

            case 6: // Connections (Friends)
                return (
                    <div className="flex flex-col h-full justify-center items-center p-4 md:p-8">
                        <div className="mb-4 md:mb-8 flex gap-3">
                            <MessageCircle className="text-pink-300 w-12 h-12 md:w-16 md:h-16 drop-shadow-md" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 drop-shadow-lg">核心朋友圈</h2>
                        <p className="text-base md:text-xl text-white/80 mb-4 text-center max-w-md drop-shadow-md">
                            基于你最常提及的人。
                        </p>
                        <div className="w-full max-w-2xl transform scale-[0.8] sm:scale-75 md:scale-90 lg:scale-100 transition-transform origin-center">
                            {stats.topFriends.length > 0 ? (
                                <InnerCircleGraph friends={stats.topFriends} userAvatar={stats.account.avatar} />
                            ) : (
                                <p className="text-white/60 italic mt-12 text-center text-lg md:text-xl">今年你似乎是一匹独狼。</p>
                            )}
                        </div>
                    </div>
                );

            case 7: // Summary (Redesigned as One-Sheet Poster - Responsive)
                return (
                    <div className="flex flex-col h-full justify-center items-center p-3 md:p-8">
                        <div className="relative bg-white/10 backdrop-blur-2xl p-4 md:p-10 rounded-2xl md:rounded-[2rem] shadow-2xl max-w-md md:max-w-lg w-full border border-white/20 flex flex-col gap-3 md:gap-6 animate-fade-in-up">
                            {/* Header: User Info */}
                            <div className="flex items-center gap-3 md:gap-5 border-b border-white/10 pb-3 md:pb-5">
                                <img src={stats.account.avatar} className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-white/10 shadow-lg" alt="avatar" crossOrigin="anonymous" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base md:text-2xl font-display drop-shadow-md truncate">{stats.account.display_name}</h3>
                                    <p className="text-white/60 text-[10px] md:text-sm font-mono truncate">@{stats.account.username}</p>
                                </div>
                                <div className="text-2xl md:text-4xl font-bold font-display tracking-tighter opacity-20">{stats.year}</div>
                            </div>

                            {/* Hero: Keyword */}
                            <div className="text-center py-1 md:py-3">
                                <div className="text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/50 mb-1 md:mb-2 font-bold">年度关键词</div>
                                <h2 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-purple-200 drop-shadow-xl">{stats.vibeKeyword}</h2>
                                <p className="text-white/80 mt-1 md:mt-3 text-xs md:text-lg leading-relaxed line-clamp-2">{stats.vibeDescription}</p>
                            </div>

                            {/* Stats Grid - 3 columns on mobile, 2 columns on desktop */}
                            <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-4">
                                <div className="bg-black/20 rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
                                    <div className="text-lg md:text-2xl font-bold font-display">{stats.totalPosts}</div>
                                    <div className="text-[8px] md:text-xs text-white/50 uppercase tracking-wide">发布数</div>
                                </div>
                                <div className="bg-black/20 rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
                                    <div className="text-lg md:text-2xl font-bold font-display text-pink-300">{stats.totalFavourites}</div>
                                    <div className="text-[8px] md:text-xs text-white/50 uppercase tracking-wide">喜欢</div>
                                </div>
                                <div className="bg-black/20 rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
                                    <div className="text-lg md:text-2xl font-bold font-display text-blue-300">{stats.totalReblogs}</div>
                                    <div className="text-[8px] md:text-xs text-white/50 uppercase tracking-wide">转发</div>
                                </div>
                                <div className="bg-black/20 rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
                                    <div className="text-lg md:text-2xl font-bold font-display text-emerald-300">{stats.mostActiveHour}:00</div>
                                    <div className="text-[8px] md:text-xs text-white/50 uppercase tracking-wide">活跃时间</div>
                                </div>
                                <div className="bg-black/20 rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
                                    <div className="text-lg md:text-2xl font-bold font-display text-orange-300">{stats.mostActiveMonth}</div>
                                    <div className="text-[8px] md:text-xs text-white/50 uppercase tracking-wide">活跃月份</div>
                                </div>
                                <div className="bg-black/20 rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
                                    <div className="text-lg md:text-2xl font-bold font-display text-yellow-300">{stats.longestStreak}</div>
                                    <div className="text-[8px] md:text-xs text-white/50 uppercase tracking-wide">连续天数</div>
                                </div>
                            </div>

                            {/* Tags */}
                            {stats.topTags.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                                    {stats.topTags.slice(0, 5).map(t => (
                                        <span key={t} className="text-[10px] md:text-sm bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-white/70 font-mono">{t}</span>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-end opacity-40">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <Sparkles size={12} className="md:w-4 md:h-4" />
                                    <span className="text-[9px] md:text-xs font-bold tracking-widest">FEDI WRAPPED</span>
                                </div>
                                <div className="text-[9px] md:text-xs font-mono">{new Date().toLocaleDateString('zh-CN')}</div>
                            </div>
                        </div>

                        <div className="mt-3 md:mt-6 flex gap-2 md:gap-4 exclude-from-capture">
                            <button
                                onClick={handleRegenerateVibe}
                                disabled={regeneratingVibe}
                                className="px-3 md:px-5 py-2 md:py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-xs md:text-base font-bold shadow-lg border border-white/5 backdrop-blur-sm flex items-center gap-1 md:gap-2"
                            >
                                <RefreshCw size={14} className={`md:w-5 md:h-5 ${regeneratingVibe ? 'animate-spin' : ''}`} />
                                <span>重新生成</span>
                            </button>

                            <button onClick={handleStartOver} className="px-4 md:px-6 py-2 md:py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-xs md:text-base font-bold shadow-lg border border-white/5 backdrop-blur-sm">
                                重新开始
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (state === AppState.LOGIN) {
        return (
            <LoginPage
                accounts={accounts}
                showAdvanced={showAdvanced}
                error={error}
                fontCss={fontCss}
                onAddAccount={addAccount}
                onRemoveAccount={removeAccount}
                onUpdateAccount={updateAccount}
                onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
                onSubmit={handleLogin}
            />
        );
    }

    if (state === AppState.LOADING) {
        return <LoadingPage loadingMsg={loadingMsg} loadingAvatar={loadingAvatar} />;
    }

    return (
        <div className="fixed inset-0 w-full h-[100dvh] text-white overflow-hidden transition-colors duration-1000 bg-black flex items-center justify-center">
            {/* Inject fonts if loaded */}
            {fontCss && <style>{fontCss}</style>}

            <ProgressBar current={slideIndex} total={TOTAL_SLIDES} />

            {/* Dynamic Navigation Arrows - Hover Zones */}
            {/* Left Zone */}
            <div
                className="absolute inset-y-0 left-0 w-[15%] z-40 group cursor-pointer flex items-center justify-start pl-2 md:pl-4 outline-none"
                onClick={prevSlide}
                role="button"
                aria-label="Previous Slide"
            >
                <div className="p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md opacity-30 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1 translate-x-0 md:translate-x-4 border border-white/20">
                    <ChevronLeft size={24} className="text-white drop-shadow-md md:w-8 md:h-8" />
                </div>
            </div>

            {/* Right Zone */}
            <div
                className="absolute inset-y-0 right-0 w-[15%] z-40 group cursor-pointer flex items-center justify-end pr-2 md:pr-4 outline-none"
                onClick={nextSlide}
                role="button"
                aria-label="Next Slide"
            >
                <div className="p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md opacity-30 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 -translate-x-0 md:-translate-x-4 border border-white/20">
                    <ChevronRight size={24} className="text-white drop-shadow-md md:w-8 md:h-8" />
                </div>
            </div>

            {/* Main Content Area - Full screen on desktop, 9:16 on mobile portrait for export */}
            <div
                ref={slideRef}
                className={`relative z-0 flex flex-col items-center overflow-hidden ${getBackground()} w-full h-full md:w-full md:h-full`}
                style={{
                    // Mobile portrait: 9:16 aspect ratio for social media export
                    // Desktop/landscape: fill the screen
                }}
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                {/* Higher Z-index for content to be interactive over nav zones in the center */}
                <div className="relative z-50 w-full h-full max-w-6xl mx-auto flex flex-col pointer-events-none [&>*]:pointer-events-auto justify-center px-4 md:px-8 py-10 overflow-y-auto">
                    {renderSlideContent()}
                </div>
            </div>

            {/* Persistent Copy/Share Button */}
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex gap-3">
                <button
                    onClick={handleDownloadSlide}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all flex items-center gap-2 shadow-lg border border-white/10"
                    title="下载当前页面"
                    disabled={downloading}
                >
                    <Download size={20} className={`md:w-6 md:h-6 ${downloading ? "animate-bounce" : ""}`} />
                </button>
                <button
                    onClick={handleCopySlide}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all flex items-center gap-2 shadow-lg border border-white/10"
                    title="复制当前页面"
                    disabled={copying}
                >
                    {copied ? <Check size={20} className="text-green-400 md:w-6 md:h-6" /> : <Copy size={20} className={`md:w-6 md:h-6 ${copying ? "animate-pulse" : ""}`} />}
                </button>
            </div>

            {/* Modal for threads */}
            {activeThread && (
                <ThreadModal posts={activeThread} onClose={() => setActiveThread(null)} />
            )}
        </div>
    );
}
