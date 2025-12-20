import { useState, useCallback, RefObject } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { EXPORT_WIDTH, EXPORT_HEIGHT } from '@/components/ExportContainer';

interface UseFixedExportOptions {
    fontCss?: string;
}

/**
 * Hook for fixed-size image export (1080x1920)
 */
export const useFixedExport = (
    exportRef: RefObject<HTMLDivElement>,
    options: UseFixedExportOptions = {}
) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState<'idle' | 'preparing' | 'capturing' | 'done'>('idle');

    const filterNode = useCallback((node: HTMLElement) => {
        // Exclude external stylesheets to prevent CORS errors
        if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
            return false;
        }
        // Exclude elements marked for exclusion
        if (node.classList?.contains('exclude-from-capture')) {
            return false;
        }
        return true;
    }, []);

    const captureOptions = {
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
        cacheBust: true,
        backgroundColor: '#000000',
        filter: filterNode,
        fontEmbedCSS: options.fontCss || undefined,
        pixelRatio: 1,
    };

    // Temporarily show the export container for capture
    const prepareForCapture = useCallback(() => {
        if (!exportRef.current) return;
        const el = exportRef.current;
        // Save original styles
        const originalStyles = {
            opacity: el.style.opacity,
            zIndex: el.style.zIndex,
            transform: el.style.transform,
        };
        // Make visible for capture
        el.style.opacity = '1';
        el.style.zIndex = '9999';
        el.style.transform = 'translateX(-9999px)'; // Move off-screen but fully rendered
        return originalStyles;
    }, [exportRef]);

    const restoreAfterCapture = useCallback((originalStyles: any) => {
        if (!exportRef.current || !originalStyles) return;
        const el = exportRef.current;
        el.style.opacity = originalStyles.opacity;
        el.style.zIndex = originalStyles.zIndex;
        el.style.transform = originalStyles.transform;
    }, [exportRef]);

    const copyToClipboard = useCallback(async (slideIndex: number): Promise<boolean> => {
        if (!exportRef.current || isExporting) return false;

        setIsExporting(true);
        setExportProgress('capturing');

        const originalStyles = prepareForCapture();

        // Wait a tick for render
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const blob = await toBlob(exportRef.current, {
                ...captureOptions,
                type: 'image/png',
            });

            restoreAfterCapture(originalStyles);

            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                setExportProgress('done');
                setTimeout(() => setExportProgress('idle'), 2000);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to copy image', err);
            restoreAfterCapture(originalStyles);
            setExportProgress('idle');
            return false;
        } finally {
            setIsExporting(false);
        }
    }, [exportRef, isExporting, captureOptions, prepareForCapture, restoreAfterCapture]);

    const downloadImage = useCallback(async (slideIndex: number): Promise<boolean> => {
        if (!exportRef.current || isExporting) return false;

        setIsExporting(true);
        setExportProgress('capturing');

        const originalStyles = prepareForCapture();

        // Wait a tick for render
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const dataUrl = await toPng(exportRef.current, captureOptions);

            restoreAfterCapture(originalStyles);

            const link = document.createElement('a');
            link.download = `fedi-wrapped-slide-${slideIndex + 1}.png`;
            link.href = dataUrl;
            link.click();

            setExportProgress('done');
            setTimeout(() => setExportProgress('idle'), 2000);
            return true;
        } catch (err) {
            console.error('Failed to download image', err);
            restoreAfterCapture(originalStyles);
            setExportProgress('idle');
            return false;
        } finally {
            setIsExporting(false);
        }
    }, [exportRef, isExporting, captureOptions, prepareForCapture, restoreAfterCapture]);

    return {
        isExporting,
        exportProgress,
        copyToClipboard,
        downloadImage,
        exportWidth: EXPORT_WIDTH,
        exportHeight: EXPORT_HEIGHT,
    };
};

