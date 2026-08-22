import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Sanitize user-supplied strings before interpolating into AI prompts.
// Strips newlines and backticks (the primary prompt-injection vectors) and enforces length limits.
const sanitizeInput = (str, maxLen = 100) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[\r\n`]/g, ' ').trim().slice(0, maxLen);
};

// In-memory cache for recommendations and game details
const recommendationCache = new Map();
const detailCache = new Map();
const RECOMMENDATION_CACHE_TTL = 60 * 60 * 1000;  // 1 hour
const DETAIL_CACHE_TTL = 24 * 60 * 60 * 1000;     // 24 hours

const getCachedResponse = (cache, key, ttl) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  return null;
};

const setCachedResponse = (cache, key, data) => {
  cache.set(key, { data, ts: Date.now() });
  // Evict oldest entries if cache grows too large
  if (cache.size > 500) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
};

const app = express();
const PORT = process.env.PORT || 8080;

// Cloud Run puts exactly one reverse proxy (Google Front End) in front of the
// container, so the client's real IP is the first hop in X-Forwarded-For.
app.set('trust proxy', 1);

// Every route below calls Gemini (a paid, per-request API) and has no auth in
// front of it -- the frontend just calls these URLs directly, and so can
// anyone else who finds them. Rate limit per-IP so a script can't run up the
// Gemini bill by hammering the endpoint (the recommendations cache is also
// trivially bypassed by varying excludedGames, so caching alone isn't a
// mitigation).
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  });
};

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// Stricter: this endpoint is only meant to be used from the admin console's
// batch image generator (10 at a time), not by regular visitors.
const imageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const SYSTEM_INSTRUCTION = process.env.SYSTEM_INSTRUCTION ||
  `You are the expert game engine for "ESL GAME LAB", recommending English classroom activities for elementary students.

[Strict Language Rules]
1. Game Title (game_title) & Tags (tags): ALWAYS English, regardless of UI language. NEVER translate or localize these fields.
2. Teacher Directions (teacher_directions): ALWAYS English.
3. Student Interactions (student_interactions): The spoken sentence MUST be English. NEVER translate it.
   - Format: "English sentence" (Action/Context in target language if applicable)
   - If UI language is English: English only, no parentheses.
   - If UI language is KO/JA/ZH: Parentheses contain behavioral descriptions only (gestures, expressions, context). NO translation of the English sentence.
4. Localization: Descriptions, How to Play, Materials, Illustration, and Caution are localized to the user's requested language.`;

// Middleware
// ALLOWED_ORIGIN accepts a comma-separated list so both the custom domain
// and the Cloud Run URL can be whitelisted without changing the image.
const rawOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
const allowedOrigins = rawOrigin.split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl calls (no Origin header)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: ${origin} not in allowed list`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper functions
const getLanguageName = (code) => {
  switch(code) {
    case 'ko': return 'Korean';
    case 'ja': return 'Japanese';
    case 'zh': return 'Chinese';
    default: return 'English';
  }
};

const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

// Escapes text for safe embedding inside SVG markup.
const escapeSvgText = (str) => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Deterministic HSL background color derived from the game id, so repeated
// placeholders for the same game look consistent without any external asset.
const colorFromSeed = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 55%)`;
};

// Builds a self-contained inline SVG placeholder (as a data URI) so we never
// depend on an external image CDN while real image generation is pending.
const buildPlaceholderImage = (gameId) => {
  const label = escapeSvgText(gameId.slice(0, 40));
  const bg = colorFromSeed(gameId);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${bg}" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#ffffff">${label}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// POST /api/recommendations - Get game recommendations
app.post('/api/recommendations', aiLimiter, async (req, res) => {
  try {
    const { filters, searchQuery: rawQuery, language = 'en', grammarTopic: rawTopic, excludedGames = [] } = req.body;
    const searchQuery = sanitizeInput(rawQuery, 100);
    const grammarTopic = sanitizeInput(rawTopic, 60);

    if (!filters) {
      return res.status(400).json({ error: 'Filters are required' });
    }

    // Only use cache for initial requests (no excludedGames).
    // LOAD MORE requests must bypass the cache so Gemini generates genuinely new games.
    const cacheKey = JSON.stringify({ filters, searchQuery, language, grammarTopic });
    if (excludedGames.length === 0) {
      const cached = getCachedResponse(recommendationCache, cacheKey, RECOMMENDATION_CACHE_TTL);
      if (cached) return res.json(cached);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelName = 'gemini-2.5-flash';
    const langName = getLanguageName(language);
    const isEnglish = language === 'en';

    const grammarConstraint = grammarTopic
      ? `HARD CONSTRAINT: Return ONLY activities practicing "${grammarTopic}". Every item MUST have grammar_focus="${grammarTopic}". Return fewer items rather than mismatched ones.`
      : "";

    const prompt = `
      RECOMMENDATION TASK: Provide EXACTLY 10 unique English teaching game activities.
      - Filters: ${JSON.stringify(filters)}
      - Grammar Topic: ${grammarTopic || 'None'}
      ${grammarConstraint}
      - game_title and all tags MUST always be in English. NEVER translate them.
      - summary_en MUST always be in English.${isEnglish ? '' : `\n      - summary_localized MUST be in ${langName}.`}
      - Exclude these games: ${excludedGames.length ? excludedGames.join(', ') : 'None'}
      - Search Query: ${searchQuery || 'None'}
    `;

    // For English users, only request summary_en (summary_localized would be identical)
    const summaryProperties = isEnglish
      ? { summary_en: { type: Type.STRING } }
      : { summary_en: { type: Type.STRING }, summary_localized: { type: Type.STRING } };
    const summaryRequired = isEnglish ? ['summary_en'] : ['summary_en', 'summary_localized'];

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ranking: { type: Type.NUMBER },
                  game_title: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 7 },
                  grammar_focus: { type: Type.STRING },
                  ...summaryProperties
                },
                required: ["ranking", "game_title", "tags", ...summaryRequired]
              }
            }
          },
          required: ["recommendations"]
        },
      },
    });

    const rawText = response.text;
    if (!rawText) throw new Error('Gemini returned an empty response. The request may have been blocked by safety filters.');
    const parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed.recommendations)) throw new Error('Gemini response missing recommendations array.');
    parsed.recommendations = parsed.recommendations.map(r => ({ ...r, id: slugify(r.game_title) }));

    setCachedResponse(recommendationCache, cacheKey, parsed);
    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations', message: error.message });
  }
});

// POST /api/game-detail - Get detailed game instructions
app.post('/api/game-detail', aiLimiter, async (req, res) => {
  try {
    const { gameTitle: rawTitle, filters, language = 'en' } = req.body;
    const gameTitle = sanitizeInput(rawTitle, 80);

    if (!gameTitle || !filters) {
      return res.status(400).json({ error: 'gameTitle and filters are required' });
    }

    // Check cache
    const detailCacheKey = JSON.stringify({ gameTitle, filters, language });
    const cachedDetail = getCachedResponse(detailCache, detailCacheKey, DETAIL_CACHE_TTL);
    if (cachedDetail) return res.json(cachedDetail);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelName = 'gemini-2.5-flash';
    const langName = getLanguageName(language);

    const prompt = `
      Detailed instructions for: "${gameTitle}".
      Target Level: ${filters.level.join(', ')}

      STRICT CONTENT RULES:
      - Localize everything EXCEPT game_title, tags, teacher_directions, and student_interactions to ${langName}.
      - game_title and all tags MUST always be in English. NEVER translate them.
      - Include a colorful emoji ('icon') that represents the game's theme perfectly.
      - 'illustration' MUST be 2-3 plain descriptive sentences in ${langName} describing observable physical details: student positions, materials held, a typical student-to-student exchange, and the teacher's role. No emotional atmosphere, no filler, no URLs or markdown.

      TEACHER DIRECTIONS — CRITICAL RULES:
      1. LANGUAGE: Always English, regardless of UI language.
      2. CONTENT: Write the EXACT WORDS the teacher says aloud — not meta-instructions.
         - WRONG: "Tell students to find a partner."  CORRECT: "Find a partner."
      3. COMPLEXITY BY LEVEL:
         - simple: Very short sentences (≤8 words). One action per sentence. Basic vocabulary. Example: "Stand up. Find a partner. Ask your question."
         - medium: Complete sentences (≤15 words). Can link two actions with "and"/"then". Example: "Walk around the room and ask three classmates the question on your card."
         - complex: Elaborate sentences (≤25 words) with conditionals and academic vocabulary. Example: "Once you've gathered responses from at least four classmates, analyze which answers were most common."

      STUDENT INTERACTIONS — CRITICAL RULES:
      1. LANGUAGE: Always English. NEVER translate the sentence.
      2. MINIMUM: At least 3 items. Empty array is NOT acceptable.
      3. CONTENT: Actual English sentences a student says — not descriptions of actions.
         - WRONG: "Students ask each other."  CORRECT: "What's your favorite season?"
         - If UI language is KO/JA/ZH: add short behavioral parenthetical in ${langName} after the English sentence. NEVER translate the English.
      4. Every interaction must be logical for this specific game and match level (${filters.level.join(', ')}).
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            game_title: { type: Type.STRING },
            icon: { type: Type.STRING },
            illustration: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 7 },
            materials: { type: Type.STRING },
            game_description: { type: Type.STRING },
            how_to_play: { type: Type.ARRAY, items: { type: Type.STRING } },
            teacher_directions: {
              type: Type.OBJECT,
              properties: {
                simple: { type: Type.ARRAY, items: { type: Type.STRING } },
                medium: { type: Type.ARRAY, items: { type: Type.STRING } },
                complex: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["simple", "medium", "complex"]
            },
            student_interactions: { type: Type.ARRAY, items: { type: Type.STRING } },
            caution: { type: Type.STRING }
          },
          required: ["game_title", "icon", "illustration", "how_to_play", "teacher_directions", "student_interactions", "materials", "game_description", "caution"]
        },
      },
    });

    const rawDetailText = response.text;
    if (!rawDetailText) throw new Error('Gemini returned an empty response for game detail.');
    const parsed = JSON.parse(rawDetailText);
    setCachedResponse(detailCache, detailCacheKey, parsed);
    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/game-detail:', error);
    res.status(500).json({ error: 'Failed to fetch game details', message: error.message });
  }
});

// POST /api/image-proxy/generate - Generate images via Gemini
app.post('/api/image-proxy/generate', imageLimiter, async (req, res) => {
  try {
    const { prompt, gameId } = req.body;

    if (!prompt || !gameId) {
      return res.status(400).json({ error: 'prompt and gameId are required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Note: Gemini doesn't have image generation yet, so we'll return a placeholder
    // When Gemini image generation becomes available, implement it here.
    // The placeholder is a self-contained inline SVG (no external CDN dependency).
    res.json({
      imageUrl: buildPlaceholderImage(gameId),
      message: 'Image generation not yet implemented. Using placeholder.'
    });

  } catch (error) {
    console.error('Error in /api/image-proxy/generate:', error);
    res.status(500).json({ error: 'Failed to generate image', message: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on port ${PORT}`);
});
