import { useState, useEffect } from 'react';

/**
 * Hook to load fonts and get CSS for html-to-image
 */
export const useFontLoader = () => {
    const [fontCss, setFontCss] = useState('');

    useEffect(() => {
        const loadFonts = async () => {
            try {
                const res = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@500;700&display=swap');
                const css = await res.text();
                setFontCss(css);
            } catch (e) {
                console.warn("Failed to load remote fonts, falling back to system fonts.", e);
            }
        };
        loadFonts();
    }, []);

    return fontCss;
};
