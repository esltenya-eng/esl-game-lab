
import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchRecommendations, fetchGameDetail } from '../services/geminiService';
import { SelectionState, GameRecommendation, GameDetail, SupportedLanguage } from '../types';
import { TRANSLATIONS, FAMOUS_GAMES } from '../constants';

const CACHE_KEYS = {
  FILTERS: 'eslgamelab_cached_filters',
  GAMES_CACHE: 'eslgamelab_games_cache',
  DETAIL_CACHE_PREFIX: 'eslgamelab_detail_'
};

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
  const [isResultIncomplete, setIsResultIncomplete] = useState(false); // 필터링 후 결과 부족 여부
  
  const lastRequestIdRef = useRef<number>(0);
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
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const segments = hash.split('/');
      
      const cachedGames = localStorage.getItem(CACHE_KEYS.GAMES_CACHE);
      if (cachedGames) setRecommendations(JSON.parse(cachedGames));

      if (segments[0] === 'detail' && segments[1]) {
        const gameId = segments[1];
        const cachedDetail = localStorage.getItem(CACHE_KEYS.DETAIL_CACHE_PREFIX + gameId);
        if (cachedDetail) {
          setSelectedDetail(JSON.parse(cachedDetail));
        }
      }
      setIsBooting(false);
    };
    resolveInitialState();
  }, []);

  const getRecommendations = useCallback(async (newFilters: SelectionState, query: string, grammarTopic?: string, append = false) => {
    const currentRequestId = ++lastRequestIdRef.current;
    setError(null);
    setMilestone(10);
    setIsResultIncomplete(false);

    if (append) {
      setIsAppending(true);
    } else {
      setRecommendations([]);
      setLoadingSuggestion(getFallbackGame());
      setIsLoading(true);
    }

    try {
      setMilestone(40);
      const response = await fetchRecommendations(newFilters, query, language, grammarTopic);
      
      if (currentRequestId !== lastRequestIdRef.current) return false;

      let validatedPool = response.recommendations.map(r => ({
        ...r,
        id: r.game_title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      }));

      // ---------------------------------------------------------
      // 후처리 검증 (Post-filtering)
      // ---------------------------------------------------------
      if (grammarTopic) {
        const lowerTopic = grammarTopic.toLowerCase();
        validatedPool = validatedPool.filter(item => {
          // 1차 통과: LLM이 명시적으로 표시한 grammar_focus가 일치하는가
          if (item.grammar_focus && item.grammar_focus.toLowerCase() === lowerTopic) return true;
          
          // 2차 통과: 요약이나 태그 내에 키워드가 직접 포함되어 있는가
          const contentBlob = `${item.summary_localized || ""} ${item.summary_en} ${item.tags.join(" ")}`.toLowerCase();
          return contentBlob.includes(lowerTopic);
        });

        // 결과가 3개 미만이면 '결과 부족' 상태 활성화
        if (validatedPool.length < 3) {
          setIsResultIncomplete(true);
        }
      }

      setRecommendations(prev => append ? [...prev, ...validatedPool] : validatedPool);
      setFilters(newFilters);
      localStorage.setItem(CACHE_KEYS.FILTERS, JSON.stringify(newFilters));
      localStorage.setItem(CACHE_KEYS.GAMES_CACHE, JSON.stringify(validatedPool.slice(0, 30)));

      setMilestone(100);
      setIsAppending(false);
      return true;
    } catch (e) {
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
    
    setSelectedDetail(null);
    setLoadingSuggestion(game);
    setIsLoading(true);

    try {
        const detail = await fetchGameDetail(game.game_title, currentFilters, language);
        
        if (currentRequestId === lastRequestIdRef.current) {
          const mergedDetail: GameDetail = { 
            ...detail, 
            tags: [...game.tags]
          };
          
          setSelectedDetail(mergedDetail);
          localStorage.setItem(CACHE_KEYS.DETAIL_CACHE_PREFIX + game.id, JSON.stringify(mergedDetail));
          setMilestone(100);
        }
        return true;
    } catch (e) {
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
    isResultIncomplete, // UI 노출용
    getRecommendations,
    getGameDetail,
    clearError: () => setError(null)
  };
};
