import { useState, RefObject } from 'react';
import { toBlob, toPng } from 'html-to-image';

interface UseImageCaptureOptions {
    fontCss?: string;
}

/**
 * Hook for capturing and downloading/copying slide images
 */
export const useImageCapture = (slideRef: RefObject<HTMLDivElement>, options: UseImageCaptureOptions = {}) => {
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const filterNode = (node: HTMLElement) => {
        // Exclude any external link stylesheets to prevent CORS errors during capture
        if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
            return false;
        }
        // Exclude elements explicitly marked to be excluded (like buttons)
        if (node.classList && node.classList.contains('exclude-from-capture')) {
            return false;
        }
        return true;
    };

    const handleCopySlide = async (slideIndex: number) => {
        if (!slideRef.current || copying) return;

        setCopying(true);
        try {
            const blob = await toBlob(slideRef.current, {
                cacheBust: true,
                skipAutoScale: true,
                type: 'image/png',
                backgroundColor: '#000000',
                filter: filterNode,
                fontEmbedCSS: options.fontCss || undefined
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

    const handleDownloadSlide = async (slideIndex: number) => {
        if (!slideRef.current || downloading) return;

        setDownloading(true);
        try {
            const dataUrl = await toPng(slideRef.current, {
                cacheBust: true,
                skipAutoScale: true,
                backgroundColor: '#000000',
                filter: filterNode,
                fontEmbedCSS: options.fontCss || undefined
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

    return {
        copying,
        copied,
        downloading,
        handleCopySlide,
        handleDownloadSlide
    };
};
