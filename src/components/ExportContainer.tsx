import React, { forwardRef, ReactNode } from 'react';

// Export dimensions: 1080 x 1920 (9:16 ratio for social media stories)
export const EXPORT_WIDTH = 1080;
export const EXPORT_HEIGHT = 1920;

interface ExportContainerProps {
    children: ReactNode;
    background: string;
}

/**
 * Hidden fixed-size container for consistent image export
 * Uses opacity: 0 to hide but still render for html-to-image capture
 */
export const ExportContainer = forwardRef<HTMLDivElement, ExportContainerProps>(
    ({ children, background }, ref) => {
        return (
            <div
                ref={ref}
                className={`fixed ${background}`}
                style={{
                    width: EXPORT_WIDTH,
                    height: EXPORT_HEIGHT,
                    top: 0,
                    left: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -9999,
                }}
            >
                {/* Noise overlay */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')"
                    }}
                />

                {/* Content wrapper - centered */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white p-8">
                    {children}
                </div>
            </div>
        );
    }
);

ExportContainer.displayName = 'ExportContainer';

