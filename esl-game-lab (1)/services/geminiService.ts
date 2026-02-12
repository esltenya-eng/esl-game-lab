
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { SelectionState, Screen2Response, GameDetail } from '../types';

const getLanguageName = (code: string) => {
  switch(code) {
    case 'ko': return 'Korean';
    case 'ja': return 'Japanese';
    case 'zh': return 'Chinese';
    default: return 'English';
  }
};

const slugify = (text: string) => text.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

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

export const fetchRecommendations = async (
  filters: SelectionState, 
  searchQuery?: string, 
  language: string = 'en', 
  grammarTopic?: string,
  excludedGames: string[] = []
): Promise<Screen2Response> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';
  const langName = getLanguageName(language);

  // 하드 제약 문구 (요청된 필수 조건 반영)
  const grammarConstraint = grammarTopic ? `
    HARD CONSTRAINT:
    If grammarTopic is provided, you MUST return ONLY activities that primarily practice exactly this grammarTopic: "${grammarTopic}". Do NOT mix other grammar topics.
    Every item MUST include grammar_focus equal to "${grammarTopic}" (exact string match).
    If you cannot comply, return fewer items rather than returning mismatched items.
  ` : "";

  let prompt = `
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

  try {
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

    const parsed = JSON.parse(response.text) as Screen2Response;
    parsed.recommendations = parsed.recommendations.map(r => ({ ...r, id: slugify(r.game_title) }));
    return parsed;
  } catch (error) {
    console.error("fetchRecommendations error", error);
    throw error;
  }
};

export const fetchGameDetail = async (gameTitle: string, filters: SelectionState, language: string = 'en'): Promise<GameDetail> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';
  const langName = getLanguageName(language);
  
  const prompt = `
    Detailed instructions for: "${gameTitle}".
    Target Level: ${filters.level.join(', ')}
    
    STRICT CONTENT RULES:
    - Localize everything EXCEPT game_title, tags, and teacher_directions to ${langName}.
    - Include a colorful emoji ('icon') that represents the game's theme perfectly.
    - 'tags' MUST have 4 to 7 items.
  `;

  try {
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
    return JSON.parse(response.text) as GameDetail;
  } catch (error) {
    console.error("fetchGameDetail error", error);
    throw error;
  }
};
