import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Status } from '@/types';

interface ThreadModalProps {
    posts: Status[];
    onClose: () => void;
}

export const ThreadModal: React.FC<ThreadModalProps> = ({ posts, onClose }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl h-[90dvh] md:h-[85vh] bg-white/10 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-col border border-white/20 animate-fade-in-up ring-1 ring-white/10">
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-white/5 rounded-t-[1.5rem] md:rounded-t-[2rem]">
                    <h3 className="text-xl md:text-2xl font-bold font-display text-white">完整对话</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 flex-1 custom-scrollbar">
                    {posts.map((post, i) => (
                        <div key={post.id} className="relative pl-4 sm:pl-10">
                            {/* Vertical line connecting posts */}
                            {i < posts.length - 1 && (
                                <div className="absolute left-[9px] sm:left-[19px] top-12 bottom-[-24px] md:bottom-[-32px] w-0.5 bg-white/30" />
                            )}

                            <div className="absolute left-0 top-3 w-5 h-5 sm:w-10 sm:h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-[10px] sm:text-sm font-bold z-10 text-white shadow-lg backdrop-blur-md">
                                {i + 1}
                            </div>

                            <div className="bg-white/90 text-black p-4 md:p-6 rounded-2xl shadow-lg border border-white/50 backdrop-blur-sm">
                                <div
                                    className="text-base md:text-lg leading-relaxed space-y-3 break-words"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                                {post.media_attachments && post.media_attachments.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        {post.media_attachments.map(m => (
                                            (m.type === 'image') && <img key={m.id} src={m.url} className="rounded-lg max-h-40 object-cover w-full bg-gray-100" crossOrigin="anonymous" />
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 pt-3 border-t border-gray-200/50 flex gap-4 text-xs md:text-sm text-gray-600 font-medium">
                                    <span>★ {post.favourites_count}</span>
                                    <span>↺ {post.reblogs_count}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="text-center text-white/50 pt-4 pb-4 font-medium tracking-widest text-xs uppercase">
                        End of Thread
                    </div>
                </div>
            </div>
        </div>
    );
};
