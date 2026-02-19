import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const SYSTEM_INSTRUCTION = process.env.SYSTEM_INSTRUCTION ||
  'You are an expert ESL (English as a Second Language) teacher assistant specializing in creating engaging, age-appropriate classroom activities and games.';

// Middleware
app.use(cors());
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

const selectionStateSchema = {
  type: Type.OBJECT,
  properties: {
    skill: { type: Type.ARRAY, items: { type: Type.STRING } },
    level: { type: Type.ARRAY, items: { type: Type.STRING } },
    purpose: { type: Type.ARRAY, items: { type: Type.STRING } },
    classSize: { type: Type.ARRAY, items: { type: Type.STRING } },
    time: { type: Type.ARRAY, items: { type: Type.STRING } },
    theme: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["skill", "level", "purpose", "classSize", "time", "theme"]
};

// POST /api/recommendations - Get game recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const { filters, searchQuery, language = 'en', grammarTopic, excludedGames = [] } = req.body;

    if (!filters) {
      return res.status(400).json({ error: 'Filters are required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelName = 'gemini-2.0-flash';
    const langName = getLanguageName(language);

    const grammarConstraint = grammarTopic ? `
      HARD CONSTRAINT:
      If grammarTopic is provided, you MUST return ONLY activities that primarily practice exactly this grammarTopic: "${grammarTopic}". Do NOT mix other grammar topics.
      Every item MUST include grammar_focus equal to "${grammarTopic}" (exact string match).
      If you cannot comply, return fewer items rather than returning mismatched items.
    ` : "";

    const prompt = `
      RECOMMENDATION TASK:
      Provide EXACTLY 15 unique English teaching game activities.
      - Filters: ${JSON.stringify(filters)}
      - Grammar Topic: ${grammarTopic || 'None'}
      ${grammarConstraint}
      - IMPORTANT: 'tags' MUST have 4 to 7 items.
      - IMPORTANT: 'summary_en' MUST ALWAYS be in English.
      - IMPORTANT: 'summary_localized' MUST ALWAYS be in ${langName}.
      - All other descriptive fields should be in: ${langName}
      - Exclude: ${excludedGames.join(', ')}
      - Search Query: ${searchQuery || 'None'}

      RULES:
      - You MUST provide exactly 15 recommendations (unless complying with grammarTopic reduces the count).
      - Each game MUST have between 4 and 7 tags.
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
            screen: { type: Type.INTEGER },
            filters: selectionStateSchema,
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ranking: { type: Type.NUMBER },
                  game_title: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 7 },
                  thumbnail_image: { type: Type.STRING },
                  summary_en: { type: Type.STRING },
                  summary_localized: { type: Type.STRING },
                  grammar_focus: { type: Type.STRING },
                  grammar_focus_reason: { type: Type.STRING }
                },
                required: ["ranking", "game_title", "tags", "thumbnail_image", "summary_en", "summary_localized"]
              }
            }
          },
          required: ["screen", "filters", "recommendations"]
        },
      },
    });

    const parsed = JSON.parse(response.text);
    parsed.recommendations = parsed.recommendations.map(r => ({ ...r, id: slugify(r.game_title) }));

    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations', message: error.message });
  }
});

// POST /api/game-detail - Get detailed game instructions
app.post('/api/game-detail', async (req, res) => {
  try {
    const { gameTitle, filters, language = 'en' } = req.body;

    if (!gameTitle || !filters) {
      return res.status(400).json({ error: 'gameTitle and filters are required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelName = 'gemini-2.0-flash';
    const langName = getLanguageName(language);

    const prompt = `
      Detailed instructions for: "${gameTitle}".
      Target Level: ${filters.level.join(', ')}

      STRICT CONTENT RULES:
      - Localize everything EXCEPT game_title, tags, and teacher_directions to ${langName}.
      - Include a colorful emoji ('icon') that represents the game's theme perfectly.
      - 'tags' MUST have 4 to 7 items.
      - 'illustration' MUST be 2-3 plain descriptive sentences (written in ${langName}) that paint a specific, concrete picture of the classroom during this activity: where students are positioned, what materials they are holding, what a typical student-to-student exchange physically looks like, and what the teacher is doing. Focus on observable, physical details — NOT vague emotional atmosphere. Do NOT write filler sentences like "laughter fills the room", "everyone is happily participating", or any sentence that could apply to any activity. Do NOT include any URLs, image links, markdown syntax, or special characters. Plain prose only.

      TEACHER DIRECTIONS — CRITICAL RULES (violations are unacceptable):
      1. LANGUAGE: teacher_directions MUST ALWAYS be written in English regardless of any other language setting.
      2. CONTENT — WHAT, NOT HOW: Each direction MUST be the EXACT WORDS the teacher says out loud to students during the activity.
         - WRONG (meta-instruction to teacher): "Tell students to find a partner and practice vocabulary."
         - CORRECT (actual teacher speech): "Find a partner and take turns using the words from today's lesson."
         - Write as if the teacher is speaking directly to the class right now.
      3. COMPLEXITY BY LEVEL:
         - simple: Very short sentences (≤8 words each). Basic everyday vocabulary only. One action per sentence. No subordinate clauses.
           Example: "Stand up. Find a partner. Ask your question."
         - medium: Complete sentences (≤15 words). Moderate vocabulary. Can link two related actions with 'and' or 'then'.
           Example: "Walk around the room and ask three different classmates the question on your card."
         - complex: Elaborate sentences with conditional structures, academic vocabulary, and dependent clauses (≤25 words). Can include nuanced task instructions.
           Example: "Once you've gathered responses from at least four classmates, analyze which answers were most common and prepare to share your findings."

      STUDENT INTERACTIONS — CRITICAL RULES:
      1. MINIMUM: student_interactions MUST contain at least 3 items. An empty array is NOT acceptable.
      2. CONTENT: Each item MUST be an actual sentence a student would say during the game — not a description of what students do.
         - WRONG: "Students ask each other about their favorites."
         - CORRECT: "What's your favorite season, and why do you like it?"
      3. LOGICAL CONSISTENCY: Every interaction must make sense within the specific game being described.
      4. LEVEL APPROPRIATENESS: Language must match the target level (${filters.level.join(', ')}).
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
            screen: { type: Type.INTEGER },
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

    const parsed = JSON.parse(response.text);
    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/game-detail:', error);
    res.status(500).json({ error: 'Failed to fetch game details', message: error.message });
  }
});

// POST /api/image-proxy/generate - Generate images via Gemini
app.post('/api/image-proxy/generate', async (req, res) => {
  try {
    const { prompt, gameId } = req.body;

    if (!prompt || !gameId) {
      return res.status(400).json({ error: 'prompt and gameId are required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Note: Gemini doesn't have image generation yet, so we'll return a placeholder
    // When Gemini image generation becomes available, implement it here

    // For now, return a placeholder response
    res.json({
      imageUrl: `https://via.placeholder.com/400x300?text=${encodeURIComponent(gameId)}`,
      message: 'Image generation not yet implemented. Using placeholder.'
    });

  } catch (error) {
    console.error('Error in /api/image-proxy/generate:', error);
    res.status(500).json({ error: 'Failed to generate image', message: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API Server running on port ${PORT}`);
  console.log(`🔑 API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
