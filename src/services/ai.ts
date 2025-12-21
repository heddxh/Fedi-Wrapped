import { Status } from '@/types';
import { COLOR_MAP, DEFAULT_COLOR } from '@/constants';

/**
 * Call the backend proxy API for AI analysis
 */
const callProxyApi = async (endpoint: string, body: object): Promise<{ keyword: string, description: string, color: string }> => {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();

        return {
            keyword: result.keyword || "多彩",
            description: result.description || "这一年你留下了许多精彩的瞬间。",
            color: result.color || DEFAULT_COLOR
        };
    } catch (e) {
        console.error("AI Analysis failed", e);
        return {
            keyword: "神秘",
            description: "AI 暂时无法分析你的心情。",
            color: DEFAULT_COLOR
        };
    }
};

/**
 * Analyze sentiment from posts using AI (via backend proxy)
 */
export const analyzeSentiment = async (posts: Status[], username: string): Promise<{ keyword: string, description: string, color: string }> => {
    // Sample diverse posts to save tokens, prefer longer text
    // Strip HTML tags before sending to backend
    const samplePosts = posts
        .filter(p => p.content.length > 20)
        .sort(() => 0.5 - Math.random())
        .slice(0, 40)
        .map(p => p.content.replace(/<[^>]*>?/gm, ''));

    return await callProxyApi('/api/analyze', { posts: samplePosts, username });
};

/**
 * Regenerate vibe from post content pool (via backend proxy)
 */
export const regenerateVibe = async (postContentPool: string[]): Promise<{ keyword: string, description: string, color: string }> => {
    return await callProxyApi('/api/regenerate', { postContentPool });
};
