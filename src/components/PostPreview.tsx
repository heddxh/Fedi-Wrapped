import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Status } from '@/types';

interface PostPreviewProps {
    post: Status;
    title?: string;
    compact?: boolean;
    preventLink?: boolean;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post, title, compact = false, preventLink = false }) => {
    if (!post) return null;

    const createMarkup = () => {
        return { __html: post.content };
    };

    const Component = preventLink ? 'div' : 'a';

    return (
        <Component
            href={preventLink ? undefined : post.url}
            target={preventLink ? undefined : "_blank"}
            rel={preventLink ? undefined : "noopener noreferrer"}
            className={`block bg-white text-black p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl w-full mx-auto transform transition-transform duration-300 flex flex-col ${preventLink ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:scale-[1.01]'} ${compact ? 'max-h-[500px]' : 'h-full'} overflow-hidden relative group`}
        >
            <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0 justify-between">
                {title && (
                    <div className="px-3 py-1 md:px-4 md:py-1.5 bg-black text-white rounded-full text-xs md:text-sm font-bold uppercase tracking-wide shadow-lg">
                        {title}
                    </div>
                )}
                {preventLink && (
                    <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 md:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"
                        onClick={(e) => e.stopPropagation()}
                        title="Open in new tab"
                    >
                        <ExternalLink size={14} className="text-gray-600" />
                    </a>
                )}
            </div>

            {/* Content Scroll Area */}
            <div className={`overflow-y-auto custom-scrollbar ${compact ? 'max-h-[350px]' : 'max-h-[60vh] flex-1'}`}>
                <div
                    className="text-base md:text-xl font-medium leading-relaxed mb-4 md:mb-6 space-y-3 md:space-y-4 font-sans break-words"
                    dangerouslySetInnerHTML={createMarkup()}
                />

                {/* Media Attachments */}
                {post.media_attachments && post.media_attachments.length > 0 && (
                    <div className={`grid gap-2 md:gap-3 mb-4 ${post.media_attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.media_attachments.map((media) => (
                            (media.type === 'image' || media.type === 'gifv' || media.type === 'unknown') ? (
                                <img
                                    key={media.id}
                                    src={media.url}
                                    alt={media.description}
                                    className="rounded-lg md:rounded-xl object-contain w-full h-auto max-h-[300px] md:max-h-[500px] bg-black/5 border border-gray-200"
                                    crossOrigin="anonymous"
                                />
                            ) : null
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-auto flex justify-between items-center border-t border-gray-200 pt-4 md:pt-6 shrink-0">
                <div className="flex gap-4 md:gap-6 text-sm md:text-base font-bold text-gray-600">
                    <span className="flex items-center gap-1 md:gap-2">★ {post.favourites_count}</span>
                    <span className="flex items-center gap-1 md:gap-2">↺ {post.reblogs_count}</span>
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
            </div>
        </Component>
    );
};
