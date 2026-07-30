
import { useState, useCallback, useRef, useEffect } from 'react';
import { SelectionState, GameRecommendation, GameDetail, SupportedLanguage } from '../types';
import { TRANSLATIONS, FAMOUS_GAMES } from '../constants';
import { getGameById, persistGameDetail } from '../services/catalogService';

// Lazy load gemini service to reduce initial bundle size (saves ~263 KB!)
const loadGeminiService = () => import('../services/geminiService');

const CACHE_KEYS = {
  FILTERS: 'eslgamelab_cached_filters',
  GAMES_CACHE: 'eslgamelab_games_cache',
  DETAIL_CACHE_PREFIX: 'eslgamelab_detail_'
};

// L1 cache entry format: always includes persistedId to prove Firestore presence
interface DetailCacheEntry {
  detail: GameDetail;
  persistedId: string;
}

export type ShareStatus = 'idle' | 'saving' | 'ready' | 'error';

export const useGameEngine = (language: SupportedLanguage) => {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<GameDetail | null>(null);
  const [filters, setFilters] = useState<SelectionState | null>(() => {
    const saved = localStorage.getItem(CACHE_KEYS.FILTERS);
    return saved ? JSON.parse(saved) : null;
  });

  const [isBooting, setIsBooting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [milestone, setMilestone] = useState(0);
  const [isResultIncomplete, setIsResultIncomplete] = useState(false);

  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  const [persistedGameId, setPersistedGameId] = useState<string | null>(null);
  const [coldOpenNotFound, setColdOpenNotFound] = useState(false);

  const lastRequestIdRef = useRef<number>(0);
  const recommendationsRef = useRef<GameRecommendation[]>(recommendations);
  useEffect(() => { recommendationsRef.current = recommendations; }, [recommendations]);
  const t = TRANSLATIONS[language];

  const getFallbackGame = useCallback((): GameRecommendation => {
    const famous = FAMOUS_GAMES[Math.floor(Math.random() * FAMOUS_GAMES.length)];
    return {
      id: famous.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      ranking: 1,
      game_title: famous.title,
      tags: ["Classic", "Featured", "Interactive", "Popular"],
      thumbnail_image: "",
      summary_en: famous.tip,
      summary_localized: famous.tip,
      icon: famous.icon
    };
  }, []);

  const [loadingSuggestion, setLoadingSuggestion] = useState<GameRecommendation | null>(null);

  useEffect(() => {
    const resolveInitialState = async () => {
      const cachedGames = localStorage.getItem(CACHE_KEYS.GAMES_CACHE);
      if (cachedGames) setRecommendations(JSON.parse(cachedGames));
      setIsBooting(false);
      // Preload gemini service module while user reads the home screen
      loadGeminiService();
    };
    resolveInitialState();
  }, []);

  // Cold-open: load a game directly from Firestore by slug id.
  // Called by App.tsx when the app mounts at /game/<id>.
  const loadGameById = useCallback(async (id: string) => {
    const currentRequestId = ++lastRequestIdRef.current;
    setError(null);
    setColdOpenNotFound(false);
    setShareStatus('idle');
    setPersistedGameId(null);

    setSelectedDetail(null);
    setIsLoading(true);
    setLoadingSuggestion(getFallbackGame());
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      const catalogGame = await getGameById(id);

      if (currentRequestId !== lastRequestIdRef.current) return;

      if (!catalogGame) {
        setColdOpenNotFound(true);
        setIsLoading(false);
        return;
      }

      setSelectedDetail(catalogGame as GameDetail);
      setPersistedGameId(catalogGame.id);
      setShareStatus('ready');
      setMilestone(100);
      setTimeout(() => {
        if (currentRequestId === lastRequestIdRef.current) setIsLoading(false);
      }, 500);
    } catch {
      if (currentRequestId === lastRequestIdRef.current) {
        setColdOpenNotFound(true);
        setIsLoading(false);
      }
    }
  }, [getFallbackGame]);

  const getRecommendations = useCallback(async (newFilters: SelectionState, query: string, grammarTopic?: string, append = false) => {
    const currentRequestId = ++lastRequestIdRef.current;
    setError(null);
    setMilestone(10);
    setIsResultIncomplete(false);

    if (append) {
      setIsAppending(true);
    } else {
      setRecommendations([]);
      setSelectedDetail(null);
      setLoadingSuggestion(getFallbackGame());
      setIsLoading(true);
      // Yield to the browser so the loading screen is painted before any
      // further work (microtasks from preloaded modules resolve without
      // giving the browser a chance to paint, causing a visible freeze).
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    try {
      setMilestone(40);
      // Dynamically import gemini service only when needed
      const { fetchRecommendations } = await loadGeminiService();
      const excludedGames = append ? recommendationsRef.current.map(r => r.game_title) : [];
      const response = await fetchRecommendations(newFilters, query, language, grammarTopic, excludedGames);

      if (currentRequestId !== lastRequestIdRef.current) return false;

      let validatedPool = response.recommendations.map(r => ({
        ...r,
        id: r.game_title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      }));

      if (grammarTopic) {
        const lowerTopic = grammarTopic.toLowerCase();
        validatedPool = validatedPool.filter(item => {
          if (item.grammar_focus && item.grammar_focus.toLowerCase() === lowerTopic) return true;
          const contentBlob = `${item.summary_localized || ""} ${item.summary_en} ${item.tags.join(" ")}`.toLowerCase();
          return contentBlob.includes(lowerTopic);
        });

        if (validatedPool.length < 3) {
          setIsResultIncomplete(true);
        }
      }

      setRecommendations(prev => {
        const merged = append ? [...prev, ...validatedPool] : validatedPool;
        localStorage.setItem(CACHE_KEYS.GAMES_CACHE, JSON.stringify(merged.slice(0, 30)));
        return merged;
      });
      setFilters(newFilters);
      localStorage.setItem(CACHE_KEYS.FILTERS, JSON.stringify(newFilters));

      setMilestone(100);
      setIsAppending(false);
      // Safeguard: if NeedIntroCard's onAutoFinish fails to fire (e.g. suggestion null,
      // animation glitch), force-clear loading after 500 ms so the list is never stuck.
      setTimeout(() => {
        if (currentRequestId === lastRequestIdRef.current) setIsLoading(false);
      }, 500);
      return true;
    } catch (e) {
      console.error('[useGameEngine] getRecommendations failed:', e);
      if (currentRequestId === lastRequestIdRef.current) {
        setError(t.errorGeneric || "An error occurred.");
        setIsLoading(false);
        setIsAppending(false);
      }
      return false;
    }
  }, [language, t.errorGeneric, getFallbackGame]);

  const getGameDetail = useCallback(async (game: GameRecommendation, currentFilters: SelectionState) => {
    const currentRequestId = ++lastRequestIdRef.current;
    setError(null);
    setMilestone(20);
    setColdOpenNotFound(false);
    setShareStatus('idle');
    setPersistedGameId(null);

    setSelectedDetail(null);
    setLoadingSuggestion(game);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      // L1: localStorage — only valid if entry includes a persistedId (guarantees Firestore presence)
      const cachedRaw = localStorage.getItem(CACHE_KEYS.DETAIL_CACHE_PREFIX + game.id);
      if (cachedRaw) {
        try {
          const entry: DetailCacheEntry = JSON.parse(cachedRaw);
          if (entry.detail && entry.persistedId && currentRequestId === lastRequestIdRef.current) {
            setSelectedDetail(entry.detail);
            setPersistedGameId(entry.persistedId);
            setShareStatus('ready');
            setMilestone(100);
            setTimeout(() => {
              if (currentRequestId === lastRequestIdRef.current) setIsLoading(false);
            }, 500);
            return true;
          }
        } catch {
          // corrupt entry — fall through to L2
        }
      }

      // L2: Firestore catalog_games
      setMilestone(35);
      const catalogGame = await getGameById(game.id);
      if (catalogGame && currentRequestId === lastRequestIdRef.current) {
        const mergedDetail: GameDetail = { ...catalogGame as GameDetail, tags: [...game.tags] };
        setSelectedDetail(mergedDetail);
        setPersistedGameId(catalogGame.id);
        setShareStatus('ready');
        // Write back to L1 in the new format
        localStorage.setItem(
          CACHE_KEYS.DETAIL_CACHE_PREFIX + game.id,
          JSON.stringify({ detail: mergedDetail, persistedId: catalogGame.id })
        );
        setMilestone(100);
        setTimeout(() => {
          if (currentRequestId === lastRequestIdRef.current) setIsLoading(false);
        }, 500);
        return true;
      }

      // L3: API (server in-memory cache → Gemini)
      setMilestone(50);
      const { fetchGameDetail } = await loadGeminiService();
      const detail = await fetchGameDetail(game.game_title, currentFilters, language);

      if (currentRequestId !== lastRequestIdRef.current) return false;

      const mergedDetail: GameDetail = { ...detail, tags: [...game.tags] };
      setSelectedDetail(mergedDetail);
      setShareStatus('saving');
      setMilestone(100);
      setTimeout(() => {
        if (currentRequestId === lastRequestIdRef.current) setIsLoading(false);
      }, 500);

      // Async persist to Firestore — does not block render
      persistGameDetail(mergedDetail).then(storedId => {
        if (currentRequestId !== lastRequestIdRef.current) return;
        if (storedId) {
          setPersistedGameId(storedId);
          setShareStatus('ready');
          // Only write L1 after confirmed Firestore write
          localStorage.setItem(
            CACHE_KEYS.DETAIL_CACHE_PREFIX + game.id,
            JSON.stringify({ detail: mergedDetail, persistedId: storedId })
          );
        } else {
          setShareStatus('error');
        }
      });

      return true;
    } catch (e) {
      console.error('[useGameEngine] getGameDetail failed:', e);
      if (currentRequestId === lastRequestIdRef.current) {
        setError(t.errorGeneric || "An error occurred.");
        setIsLoading(false);
      }
      return false;
    }
  }, [language, t.errorGeneric]);

  return {
    recommendations,
    selectedDetail,
    isLoading,
    setIsLoading,
    isBooting,
    isAppending,
    loadingSuggestion,
    error,
    filters,
    milestone,
    isResultIncomplete,
    shareStatus,
    persistedGameId,
    coldOpenNotFound,
    loadGameById,
    getRecommendations,
    getGameDetail,
    clearError: () => setError(null)
  };
};
