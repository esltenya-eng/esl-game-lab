import React, { useState, useEffect } from 'react';
import { GameRecommendation, SelectionState, AppSettings } from '../types';
import { ArrowLeft, Heart, Search, LogIn, UserPlus, LogOut, Home, Loader2, Check, AlertCircle } from 'lucide-react';
import { TRANSLATIONS, GRAMMAR_TOPIC_LABELS } from '../constants';
import { useUserStore } from '../hooks/useUserStore';

interface Props {
  recommendations: GameRecommendation[];
  filters: SelectionState;
  grammarTopic: string;
  onSelectGame: (game: GameRecommendation) => void;
  onBack: (e?: any) => void;
  onGoHome: () => void;
  isLoading: boolean;
  isAppending: boolean;
  isResultIncomplete?: boolean; // 결과 부족 알림 여부
  toggleFavorite: (game: GameRecommendation) => void;
  favorites: GameRecommendation[];
  settings: AppSettings;
  onUpdateList: (filters: SelectionState, query: string, grammarTopic?: string, isAppend?: boolean) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Screen2_List: React.FC<Props> = ({
  recommendations,
  filters,
  grammarTopic,
  onSelectGame,
  onBack,
  onGoHome,
  isLoading,
  isAppending,
  isResultIncomplete,
  toggleFavorite,
  favorites,
  settings,
  onUpdateList,
  onOpenAuth
}) => {
  const { currentUser, signOutUser } = useUserStore();
  const [localSearch, setLocalSearch] = useState('');
  
  // grammarTopic은 Prop으로 받으며, UI에서는 드롭다운이 제거되지만 
  // 내부 검색/로드모어 시 필터링 정합성을 위해 최신값을 계속 유지함.
  const [selectedGrammarTopic, setSelectedGrammarTopic] = useState(grammarTopic);
  
  const isDark = settings.darkMode;
  const t = TRANSLATIONS[settings.language];
  const lang = settings.language;

  // Prop으로 넘어오는 grammarTopic이 바뀌면 로컬 상태 동기화 (메인화면 검색 진입 시 대응)
  useEffect(() => {
    setSelectedGrammarTopic(grammarTopic);
  }, [grammarTopic]);

  const isFavorite = (gameTitle: string) => favorites.some(f => f.game_title === gameTitle);
  const activeFilters = Object.entries(filters).flatMap(([_, values]) => values);

  // 다국어 문법 라벨 헬퍼 (해시태그 표시용)
  const getGrammarLabel = (key: string) => {
    return GRAMMAR_TOPIC_LABELS[lang]?.[key] || GRAMMAR_TOPIC_LABELS.en[key] || key;
  };

  const navBtnStyle = `w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all`;

  // 공통 호출 함수: grammarTopic이 검색 시 누락되지 않도록 함
  const handlePerformUpdate = (isAppend: boolean) => {
    onUpdateList(filters, localSearch, selectedGrammarTopic, isAppend);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 font-sans relative">
      <div className="flex items-center justify-between w-full relative h-14 mb-8">
          <button onClick={onBack} className={navBtnStyle}>
              <ArrowLeft className="w-5 h-5" />
          </button>

          <button onClick={onGoHome} className="absolute left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center bg-[#2563eb] text-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5" title="Home">
              <Home className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {currentUser ? (
                <button onClick={signOutUser} className="flex items-center gap-2 px-3 py-1.5 h-12 bg-blue-600 text-white border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold font-['Press_Start_2P'] text-[8px] uppercase active:translate-y-0.5">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.signOut}</span>
                </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => onOpenAuth('login')} className={`${navBtnStyle} w-auto px-3 gap-2`}>
                        <LogIn className="w-4 h-4" />
                        <span className="hidden sm:inline font-['Press_Start_2P'] text-[8px]">{t.signIn}</span>
                    </button>
                    <button onClick={() => onOpenAuth('signup')} className={`${navBtnStyle} w-auto px-3 gap-2 bg-[#facc15] text-slate-900`}>
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline font-['Press_Start_2P'] text-[8px]">{t.signUp}</span>
                    </button>
                </div>
            )}
          </div>
      </div>

      <div className="space-y-4">
        {/* 검색바 */}
        <div className={`relative flex items-center w-full border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
             <div className="pl-4 text-[#94a3b8]"><Search className="w-4 h-4" /></div>
             <input 
                type="text" 
                placeholder={t.searchPlaceholderHome} 
                value={localSearch} 
                onChange={(e) => setLocalSearch(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handlePerformUpdate(false)} 
                className="w-full py-4 px-4 bg-transparent focus:outline-none text-base" 
             />
             <div className="pr-2">
                <button onClick={() => handlePerformUpdate(false)} className="px-5 py-2 bg-[#2563eb] text-white rounded-xl text-[10px] font-['Press_Start_2P'] uppercase border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5">GO</button>
             </div>
        </div>

        {/* 결과 부족 안내 (grammarTopic이 있을 때 결과가 적으면 표시) */}
        {isResultIncomplete && !isLoading && recommendations.length > 0 && (
          <div className="p-4 bg-amber-50 border-2 border-amber-500/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in duration-300">
             <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[11px] md:text-xs font-bold text-amber-800 leading-relaxed break-keep">
                {settings.language === 'ko' 
                  ? `선택한 문법(${getGrammarLabel(selectedGrammarTopic)})에 꼭 맞는 게임이 충분하지 않아 일부 결과만 표시했어요. 검색어를 바꾸거나 다른 문법을 선택해보세요.`
                  : `Not enough games perfectly match "${getGrammarLabel(selectedGrammarTopic)}". Showing limited results. Try adjusting your query or selecting another topic.`
                }
             </p>
          </div>
        )}

        {/* 선택한 조건 해시태그 (문법 주제 포함) */}
        {(activeFilters.length > 0 || selectedGrammarTopic) && (
          <div className="flex flex-wrap gap-2 px-2 animate-in fade-in slide-in-from-top-1 duration-300">
             {activeFilters.map((val, idx) => (
               <span key={idx} className={`px-3 py-1 rounded-full text-[10px] font-bold border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                 #{val}
               </span>
             ))}
             {selectedGrammarTopic && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-indigo-500 text-white`}>
                    #{t.grammarFocus || "Grammar"}: {getGrammarLabel(selectedGrammarTopic)}
                </span>
             )}
          </div>
        )}
      </div>

      {/* 게임 목록 */}
      <div className="flex flex-col space-y-5">
        {recommendations.map((game, index) => {
            const displayRank = index + 1;
            return (
                <div key={game.id + index} onClick={() => onSelectGame(game)} className={`w-full p-5 md:p-6 border-2 border-slate-900 rounded-[1.5rem] relative cursor-pointer transition-all hover:-translate-y-1.5 ${isDark ? 'bg-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,0.1)]'}`}>
                    <div className="flex items-start gap-4 md:gap-6 pr-10">
                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 border-slate-900 rounded-xl font-['Press_Start_2P'] text-[12px] ${displayRank <= 3 ? 'bg-[#facc15] text-slate-900' : 'bg-[#334155] text-white'}`}>
                            {displayRank}
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-base md:text-xl font-black font-['Press_Start_2P'] uppercase text-[#4ade80] leading-tight line-clamp-1">{game.game_title}</h3>
                            <p className={`text-sm md:text-base font-medium line-clamp-2 leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{game.summary_localized || game.summary_en}</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {game.tags.map((tag, idx) => (
                                    <span key={idx} className="text-sm md:text-base px-3 py-0.5 rounded-full border border-[#4ade80] bg-green-900/10 text-[#4ade80] font-medium uppercase font-['VT323']">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(game); }} className="absolute top-5 right-5 p-2"><Heart className={`w-6 h-6 ${isFavorite(game.game_title) ? 'fill-[#ef4444] text-[#ef4444]' : 'text-slate-400'}`} /></button>
                </div>
            );
        })}
        
        {recommendations.length > 0 && (
          <button 
            onClick={() => handlePerformUpdate(true)} 
            disabled={isAppending}
            className={`w-full h-12 md:h-14 border-2 border-slate-900 rounded-xl flex items-center justify-center font-['Press_Start_2P'] uppercase text-[12px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
          >
            {isAppending ? <Loader2 className="w-5 h-5 animate-spin" /> : t.loadMore}
          </button>
        )}
      </div>
    </div>
  );
};