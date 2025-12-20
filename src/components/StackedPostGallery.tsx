import React, { useState } from 'react';
import { Hand } from 'lucide-react';
import { Status } from '@/types';
import { PostPreview } from './PostPreview';

interface StackedPostGalleryProps {
    posts: Status[];
}

export const StackedPostGallery: React.FC<StackedPostGalleryProps> = ({ posts }) => {
    const [index, setIndex] = useState(0);
    const [animationState, setAnimationState] = useState<'idle' | 'animating' | 'resetting'>('idle');

    if (!posts || posts.length === 0) {
        return <p className="text-center text-white/50 mt-10 text-xl">此类别下没有找到帖子。</p>;
    }

    const handleNext = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        if (animationState !== 'idle' || posts.length <= 1) return;

        setAnimationState('animating');

        setTimeout(() => {
            setIndex((prev) => (prev + 1) % posts.length);
            setAnimationState('resetting');

            setTimeout(() => {
                setAnimationState('idle');
            }, 50);
        }, 400);
    };

    const currentPost = posts[index];
    const nextPost = posts[(index + 1) % posts.length];
    const isSingle = posts.length === 1;

    const topCardClasses = (() => {
        switch (animationState) {
            case 'animating': return 'translate-x-[120%] rotate-12 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]';
            case 'resetting': return 'translate-x-0 rotate-0 opacity-100 transition-none duration-0';
            case 'idle': return 'translate-x-0 rotate-0 opacity-100 transition-all duration-300 hover:scale-[1.01]';
        }
    })();

    const backCardClasses = (() => {
        switch (animationState) {
            case 'animating': return 'scale-100 opacity-100 translate-y-0 z-30 transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]';
            case 'resetting': return 'scale-[0.92] opacity-60 translate-y-6 z-10 transition-none duration-0';
            case 'idle': return 'scale-[0.92] opacity-60 translate-y-6 z-10 transition-all duration-500';
        }
    })();

    return (
        <div className="relative w-full max-w-2xl h-[55vh] md:h-[60vh] mx-auto mt-4 md:mt-8 perspective-1000 z-50 animate-fade-in-up px-2 md:px-0">
            {/* Background Card (Next) */}
            {!isSingle && (
                <div className={`absolute top-0 left-0 w-full h-full will-change-transform ${backCardClasses}`}>
                    <PostPreview key={nextPost.id} post={nextPost} title={`#${((index + 1) % posts.length) + 1}`} preventLink={true} />
                </div>
            )}

            {/* Foreground Card (Current) */}
            <div
                className={`absolute top-0 left-0 w-full h-full z-40 cursor-pointer will-change-transform ${topCardClasses}`}
                onClick={handleNext}
            >
                <PostPreview key={currentPost.id} post={currentPost} title={`#${index + 1}`} preventLink={true} />

                {!isSingle && (
                    <div className="absolute bottom-6 left-0 right-0 w-max m-auto pointer-events-none animate-bounce z-50">
                        <div className="bg-black/80 text-white text-xs md:text-sm px-4 py-2 rounded-full flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm whitespace-nowrap border border-white/10">
                            <Hand size={16} /> 点击切换下一张
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute -bottom-10 md:-bottom-12 w-full text-center text-white/40 text-xs md:text-sm font-medium">
                {index + 1} / {posts.length}
            </div>
        </div>
    );
};
