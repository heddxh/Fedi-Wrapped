import { GoogleGenAI } from "@google/genai";
import { Status } from '@/types';
import { COLOR_MAP, DEFAULT_COLOR } from '@/constants';

// Declare global to avoid TS errors
declare const __GEMINI_API_KEY__: string;

/**
 * Generate AI prompt for sentiment analysis
 */
const generateAiPrompt = (username: string, samplePosts: string[]) => {
    return `
    Analyze these social media posts from the user "${username}" for the year.
    Determine the overall mood/vibe/keyword of their year.
    
    Return a JSON object with:
    1. "keyword": A Chinese word (2~6 characters) summarizing their year (e.g., 热烈, 纯粹, 有始有终, 痛并快乐着).
    2. "description": A 1-sentence Chinese summary of their whole-year posts humorously (max 30 words).
    3. "colorType": One of these exact strings based on mood: "energetic", "calm", "melancholy", "romantic", "dark", "nature", "dreamy", "fiery", "royal", "electric", "cozy", "mystic", "cool".

    Posts:
    ${samplePosts.join("\n---\n")}
  `;
};

/**
 * Call GenAI API for sentiment analysis
 */
const callGenAi = async (prompt: string): Promise<{ keyword: string, description: string, color: string }> => {
    // Try standard process.env, then fallback to injected global
    const apiKey = (typeof __GEMINI_API_KEY__ !== 'undefined' ? __GEMINI_API_KEY__ : undefined) || process.env.API_KEY;

    if (!apiKey) {
        return {
            keyword: "未知",
            description: "我们需要 API Key 来分析你的年度心情。",
            color: "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900"
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const result = JSON.parse(response.text || '{}');

        return {
            keyword: result.keyword || "多彩",
            description: result.description || "这一年你留下了许多精彩的瞬间。",
            color: COLOR_MAP[result.colorType] || DEFAULT_COLOR
        };
    } catch (e) {
        console.error("AI Analysis failed", e);
        return {
            keyword: "神秘",
            description: "AI 暂时无法分析你的心情。",
            color: "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900"
        };
    }
};

/**
 * Analyze sentiment from posts using AI
 */
export const analyzeSentiment = async (posts: Status[], username: string): Promise<{ keyword: string, description: string, color: string }> => {
    // Sample diverse posts to save tokens, prefer longer text
    const samplePosts = posts
        .filter(p => p.content.length > 20)
        .sort(() => 0.5 - Math.random())
        .slice(0, 40)
        .map(p => p.content.replace(/<[^>]*>?/gm, ''));

    const prompt = generateAiPrompt(username, samplePosts);
    return await callGenAi(prompt);
};

/**
 * Regenerate vibe from post content pool
 */
export const regenerateVibe = async (postContentPool: string[]): Promise<{ keyword: string, description: string, color: string }> => {
    // Re-sample from the pool
    const samplePosts = postContentPool
        .sort(() => 0.5 - Math.random())
        .slice(0, 40);

    const prompt = generateAiPrompt("User", samplePosts);
    return await callGenAi(prompt);
};
