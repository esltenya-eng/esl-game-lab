import React, { useState, useRef, useEffect } from 'react';
import { SELECTION_OPTIONS, TRANSLATIONS, HOME_HERO_TITLE, GRAMMAR_TOPICS, GRAMMAR_TOPIC_LABELS } from '../constants';
import { SelectionState, AppSettings } from '../types';
import { Sparkles, ChevronDown, Search, Info, LogIn, UserPlus, LogOut, Gamepad2, Home, Check, Book } from 'lucide-react';
import { OnboardingOverlay } from './OnboardingOverlay';
import { useUserStore } from '../hooks/useUserStore';

interface Props {
  onNext: (filters: SelectionState, searchQuery: string, grammarTopic?: string) => void;
  onGoHome: () => void;
  isLoading: boolean;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenFavorites: () => void;
  onOpenTools: () => void;
  onOpenContact: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void; 
}

export const Screen1_Selection: React.FC<Props> = ({ 
  onNext, 
  onGoHome,
  isLoading, 
  settings, 
  onOpenSettings,
  onOpenFavorites,
  onOpenTools,
  onOpenContact,
  onOpenAuth
}) => {
  const { currentUser, isAuthLoading, signOutUser } = useUserStore();
  const [selections, setSelections] = useState<SelectionState>({
    skill: [],
    level: [],
    purpose: [],
    classSize: [],
    time: [],
    theme: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [grammarTopic, setGrammarTopic] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isGrammarDropdownOpen, setIsGrammarDropdownOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const grammarDropdownRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;
  const lang = settings.language;

  // Localized Labels for Grammar Topics
  const getGrammarLabel = (key: string) => {
    return GRAMMAR_TOPIC_LABELS[lang]?.[key] || GRAMMAR_TOPIC_LABELS.en[key] || key;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (grammarDropdownRef.current && !grammarDropdownRef.current.contains(event.target as Node)) {
        setIsGrammarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelection = (category: keyof SelectionState, value: string) => {
    setSelections((prev) => {
      const currentValues = prev[category];
      if (currentValues.includes(value)) {
        return { ...prev, [category]: currentValues.filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...currentValues, value] };
      }
    });
  };

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleSearch = () => {
    onNext(selections, searchQuery, selections.skill.includes('Grammar') ? grammarTopic : undefined);
  };

  const navBtnStyle = `w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all`;

  return (
    <div id="home-screen" data-screen="home" className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-12 pb-10 relative font-sans">
      
      {isOnboardingOpen && <OnboardingOverlay onClose={() => setIsOnboardingOpen(false)} settings={settings} />}

      {/* 1. Utility Navigation Bar */}
      <div className="flex items-center justify-between w-full relative h-14 mb-10 md:mb-20">
          <button onClick={() => setIsOnboardingOpen(true)} className={navBtnStyle} title="Information">
              <Info className="w-5 h-5" />
          </button>

          <button onClick={onGoHome} className="absolute left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center bg-[#2563eb] text-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5" title="Home">
              <Home className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {isAuthLoading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
            ) : currentUser ? (
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

      {/* 2. Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-4 md:mt-8 mb-4 md:mb-8">
          <div className="flex items-center justify-center gap-4 mb-4 md:mb-6 whitespace-nowrap">
              <Gamepad2 className="w-8 h-8 md:w-12 md:h-12 text-[#facc15] drop-shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]" />
              <h1 className="text-3xl md:text-5xl font-black text-[#facc15] font-['Press_Start_2P'] uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] tracking-tighter">
                  {HOME_HERO_TITLE}
              </h1>
              <Gamepad2 className="w-8 h-8 md:w-12 md:h-12 text-[#facc15] transform scale-x-[-1] drop-shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]" />
          </div>
          <p className="text-sm md:text-lg text-green-400 font-medium tracking-tight">
              {t.subtitle}
          </p>
      </div>

      {/* 3. Search & Filter Section */}
      <div className="w-full max-w-3xl mx-auto space-y-8">
         <div className="space-y-4">
            <div className={`relative flex items-center w-full border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden ${
                isDark ? 'bg-slate-800' : 'bg-white'
            }`}>
                <div className="pl-4 text-[#facc15]">
                    <Sparkles className="w-4 h-4" />
                </div>
                <input 
                    type="text" 
                    placeholder={t.searchPlaceholderHome}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={`w-full h-[60px] px-4 bg-transparent focus:outline-none text-base md:text-lg ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                />
                <div className="pr-2">
                    <button 
                        onClick={handleSearch}
                        className="p-3 bg-[#2563eb] text-white rounded-xl active:scale-95 transition-all shadow-md border-2 border-slate-900"
                    >
                        <Search className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Grammar Topic Selector (Restored/Updated to Dropdown with multi-lang support) */}
            {selections.skill.includes('Grammar') && (
                <div className="animate-in slide-in-from-top-2 duration-300 relative" ref={grammarDropdownRef}>
                    <button 
                        onClick={() => setIsGrammarDropdownOpen(!isGrammarDropdownOpen)}
                        className={`flex items-center w-full h-[54px] px-5 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden transition-all ${
                            isDark ? 'bg-indigo-900/30 text-indigo-100' : 'bg-indigo-50 text-indigo-900'
                        }`}
                    >
                        <Book className="w-4 h-4 mr-3 text-indigo-500" />
                        <span className={`text-sm font-bold flex-1 text-left ${grammarTopic ? '' : 'opacity-50'}`}>
                            {grammarTopic ? getGrammarLabel(grammarTopic) : (settings.language === 'ko' ? "세부 문법 요소를 선택하세요..." : settings.language === 'ja' ? "文法詳細を選択してください..." : settings.language === 'zh' ? "请选择语法细分..." : "Select detailed grammar topic...")}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isGrammarDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isGrammarDropdownOpen && (
                        <div className={`absolute top-full left-0 right-0 mt-2 z-[60] border-2 border-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                                {GRAMMAR_TOPICS.map(topicKey => (
                                    <button
                                        key={topicKey}
                                        onClick={() => { setGrammarTopic(topicKey); setIsGrammarDropdownOpen(false); }}
                                        className={`w-full p-3 text-left text-sm font-bold rounded-xl mb-0.5 last:mb-0 transition-colors flex items-center justify-between ${
                                            grammarTopic === topicKey ? 'bg-indigo-600 text-white' : isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-900 hover:bg-indigo-50'
                                        }`}
                                    >
                                        <span>{getGrammarLabel(topicKey)}</span>
                                        {grammarTopic === topicKey && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
         </div>

         <div ref={dropdownRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {Object.entries(SELECTION_OPTIONS).map(([key, options]) => {
              const categoryKey = key as keyof SelectionState;
              const selectedItems = selections[categoryKey];
              const isActive = activeDropdown === key;
              const hasSelections = selectedItems.length > 0;
              
              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => toggleDropdown(key)}
                    className={`w-full min-h-[4.5rem] px-5 py-3 flex flex-col items-start justify-center text-left rounded-xl border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all ${
                      hasSelections 
                        ? 'bg-blue-900/40 border-blue-400 text-white' 
                        : isDark ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-white border-slate-300 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[9px] uppercase font-bold font-['Press_Start_2P'] tracking-widest truncate text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                    </div>
                    <span className={`text-sm font-medium truncate w-full ${hasSelections ? 'text-white' : 'opacity-60'}`}>
                        {hasSelections ? selectedItems.join(', ') : t.any || 'Any'}
                    </span>
                  </button>
                  {isActive && (
                    <div className={`absolute top-full left-0 right-0 mt-3 border-2 border-slate-900 rounded-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className="p-1">
                        {options.map((option) => {
                          const isSelected = selections[categoryKey].includes(option);
                          return (
                            <div
                              key={option}
                              onClick={() => toggleSelection(categoryKey, option)}
                              className={`flex items-center justify-between p-3.5 cursor-pointer rounded-xl mb-0.5 last:mb-0 transition-all ${
                                isSelected 
                                  ? 'bg-blue-600 text-white' 
                                  : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-base font-bold tracking-tight">{option}</span>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-white border-white' : isDark ? 'border-slate-600' : 'border-slate-300'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 animate-in zoom-in duration-200" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <div className="pt-6 flex justify-center">
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`w-[70%] py-5 text-base md:text-xl flex items-center justify-center gap-4 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none rounded-2xl transition-all font-['Press_Start_2P'] uppercase tracking-tight ${
            isLoading ? 'bg-slate-400 text-slate-600 cursor-not-allowed' : 'bg-[#22c55e] text-white hover:bg-[#16a34a]'
          }`}
        >
          {isLoading ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
          ) : (
            <>
              <span className="text-2xl">▶</span>
              <span>{t.goBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};