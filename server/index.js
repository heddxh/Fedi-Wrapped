import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '5mb' }));

// Gemini API setup
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Color map for vibe analysis
const COLOR_MAP = {
    energetic: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
    calm: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600",
    melancholy: "bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800",
    romantic: "bg-gradient-to-br from-pink-400 via-rose-500 to-red-400",
    dark: "bg-gradient-to-br from-gray-900 via-slate-800 to-neutral-900",
    nature: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
    dreamy: "bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500",
    fiery: "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500",
    royal: "bg-gradient-to-br from-purple-700 via-violet-800 to-indigo-900",
    electric: "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600",
    cozy: "bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500",
    mystic: "bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-700",
    cool: "bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500"
};
const DEFAULT_COLOR = "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900";

/**
 * Generate AI prompt for sentiment analysis
 */
const generateAiPrompt = (username, samplePosts) => {
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
 * Call Gemini API
 */
const callGenAi = async (prompt) => {
    if (!genAI) {
        return {
            keyword: "未知",
            description: "服务器未配置 API Key。",
            color: DEFAULT_COLOR
        };
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const parsed = JSON.parse(text || '{}');

        return {
            keyword: parsed.keyword || "多彩",
            description: parsed.description || "这一年你留下了许多精彩的瞬间。",
            color: COLOR_MAP[parsed.colorType] || DEFAULT_COLOR
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

// API Routes
app.post('/api/analyze', async (req, res) => {
    try {
        const { posts, username } = req.body;

        if (!posts || !Array.isArray(posts)) {
            return res.status(400).json({ error: 'Invalid request: posts array required' });
        }

        // Sample diverse posts to save tokens
        const samplePosts = posts
            .filter(p => p.length > 20)
            .sort(() => 0.5 - Math.random())
            .slice(0, 40);

        const prompt = generateAiPrompt(username || 'User', samplePosts);
        const result = await callGenAi(prompt);

        res.json(result);
    } catch (error) {
        console.error('Analyze error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

app.post('/api/regenerate', async (req, res) => {
    try {
        const { postContentPool, username } = req.body;

        if (!postContentPool || !Array.isArray(postContentPool)) {
            return res.status(400).json({ error: 'Invalid request: postContentPool array required' });
        }

        // Re-sample from the pool
        const samplePosts = postContentPool
            .sort(() => 0.5 - Math.random())
            .slice(0, 40);

        const prompt = generateAiPrompt(username || 'User', samplePosts);
        const result = await callGenAi(prompt);

        res.json(result);
    } catch (error) {
        console.error('Regenerate error:', error);
        res.status(500).json({ error: 'Regeneration failed' });
    }
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GEMINI_API_KEY configured: ${genAI ? 'YES' : 'NO'}`);
});
