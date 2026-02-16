
import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';

// Only load the home screen immediately for fastest initial load
const Screen1_Selection = lazy(() => import('./components/Screen1_Selection').then(m => ({ default: m.Screen1_Selection })));

// Lazy load all other screens
const Screen2_List = lazy(() => import('./components/Screen2_List').then(m => ({ default: m.Screen2_List })));
const Screen3_Detail = lazy(() => import('./components/Screen3_Detail').then(m => ({ default: m.Screen3_Detail })));
const Screen4_Settings = lazy(() => import('./components/Screen4_Settings').then(m => ({ default: m.Screen4_Settings })));
const Screen5_Favorites = lazy(() => import('./components/Screen5_Favorites').then(m => ({ default: m.Screen5_Favorites })));
const Screen6_Contact = lazy(() => import('./components/Screen6_Contact').then(m => ({ default: m.Screen6_Contact })));
const Screen7_Auth = lazy(() => import('./components/Screen7_Auth').then(m => ({ default: m.Screen7_Auth })));
const Screen8_PrivacyPolicy = lazy(() => import('./components/Screen8_PrivacyPolicy').then(m => ({ default: m.Screen8_PrivacyPolicy })));
const Screen9_ResetPassword = lazy(() => import('./components/Screen9_ResetPassword').then(m => ({ default: m.Screen9_ResetPassword })));
const Screen10_TermsOfService = lazy(() => import('./components/Screen10_TermsOfService').then(m => ({ default: m.Screen10_TermsOfService })));
const Screen11_AdminExport = lazy(() => import('./components/Screen11_AdminExport').then(m => ({ default: m.Screen11_AdminExport })));
const ToolsOverlay = lazy(() => import('./components/ToolsOverlay').then(m => ({ default: m.ToolsOverlay })));

// Lazy load UI components that aren't critical for initial render
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
const AdBanner = lazy(() => import('./components/AdBanner').then(m => ({ default: m.AdBanner })));
const NeedIntroCard = lazy(() => import('./components/NeedIntroCard').then(m => ({ default: m.NeedIntroCard })));
import { AppScreen, SelectionState, GameRecommendation } from './types';
import { TRANSLATIONS, DEVELOPER_BLOG_URL } from './constants';
import { MessageCircle, Wrench, Heart, Settings, Plus, X, ArrowUp, Home, BookOpen, Rss, Layers, Target, Lightbulb, AlertTriangle, Zap, CheckCircle2, Users, Flag, Sparkles, ArrowLeft } from 'lucide-react';

import { useAppFlow } from './hooks/useAppFlow';
import { useUserStore } from './hooks/useUserStore';
import { useGameEngine } from './hooks/useGameEngine';

const App: React.FC = () => {
  useEffect(() => {
    console.log("%cESL GAME LAB — FEB25_LOCKED", "color: #00ff99; font-weight: bold; font-size: 14px; background: #051a0d; padding: 4px 8px; border-radius: 4px;");
  }, []);

  const { currentScreen, navigateTo, goBack, resetToHome } = useAppFlow(AppScreen.SELECTION);
  const { 
    settings, updateSettings, favorites, toggleFavorite, removeFavorite, 
    history, addToHistory, currentUser, signOutUser
  } = useUserStore();
  
  const { 
    recommendations, selectedDetail, isLoading, setIsLoading, 
    isBooting, isAppending, loadingSuggestion, error, filters, milestone,
    isResultIncomplete, 
    getRecommendations, getGameDetail, clearError 
  } = useGameEngine(settings.language);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeftMobileMenuOpen, setIsLeftMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentGrammarTopic, setCurrentGrammarTopic] = useState('');
  
  const t = TRANSLATIONS[settings.language];
  const g = t.gamificationGuide;
  const isHomeActive = currentScreen === AppScreen.SELECTION;
  
  // 관리 화면 정의 (리스트, 상세, 설정 등 모든 주요 화면 포함)
  const isManagementScreen = [
    AppScreen.SELECTION, 
    AppScreen.LIST, 
    AppScreen.DETAIL, 
    AppScreen.TOOLS, 
    AppScreen.SETTINGS, 
    AppScreen.FAVORITES, 
    AppScreen.CONTACT
  ].includes(currentScreen);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onSearchRequested = async (selectedFilters: SelectionState, query: string, grammarTopic?: string, isAppend = false) => {
    if (!isAppend) {
      navigateTo(AppScreen.LIST);
      setCurrentGrammarTopic(grammarTopic || '');
    }
    await getRecommendations(selectedFilters, query, grammarTopic, isAppend);
  };

  const onGameSelected = useCallback(async (game: GameRecommendation) => {
    addToHistory(game);
    const currentFilters = filters || { skill: [], level: [], purpose: [], classSize: [], time: [], theme: [] };
    navigateTo(AppScreen.DETAIL, game.id);
    await getGameDetail(game, currentFilters);
  }, [addToHistory, getGameDetail, filters, navigateTo]);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    navigateTo(AppScreen.AUTH);
  };

  const menuActions = [
    { 
      icon: Wrench, 
      label: t.tools, 
      colorClass: 'bg-indigo-500 text-white', 
      action: () => { navigateTo(AppScreen.TOOLS); setIsMobileMenuOpen(false); },
      isActive: currentScreen === AppScreen.TOOLS
    },
    { 
      icon: Heart, 
      label: t.favorites, 
      colorClass: 'bg-pink-500 text-white', 
      action: () => { navigateTo(AppScreen.FAVORITES); setIsMobileMenuOpen(false); },
      isActive: currentScreen === AppScreen.FAVORITES
    },
    { 
      icon: Settings, 
      label: t.settings, 
      colorClass: 'bg-yellow-400 text-slate-900', 
      action: () => { navigateTo(AppScreen.SETTINGS); setIsMobileMenuOpen(false); },
      isActive: currentScreen === AppScreen.SETTINGS
    },
    { 
      icon: MessageCircle, 
      label: t.contact, 
      colorClass: 'bg-green-500 text-white', 
      action: () => { navigateTo(AppScreen.CONTACT); setIsMobileMenuOpen(false); },
      isActive: currentScreen === AppScreen.CONTACT
    },
  ];

  const leftMenuActions = [
    {
      icon: BookOpen,
      label: 'GUIDE',
      colorClass: 'bg-emerald-500 text-white',
      action: () => { navigateTo(AppScreen.GAMIFICATION_GUIDE); setIsLeftMobileMenuOpen(false); }
    },
    {
      icon: Layers,
      label: 'TOOLS',
      colorClass: 'bg-blue-500 text-white',
      action: () => { navigateTo(AppScreen.GAMIFICATION_TOOLS); setIsLeftMobileMenuOpen(false); }
    },
    {
      icon: Rss,
      label: 'BLOG',
      colorClass: 'bg-orange-500 text-white',
      action: () => { window.open(DEVELOPER_BLOG_URL, '_blank', 'noopener,noreferrer'); setIsLeftMobileMenuOpen(false); }
    }
  ];

  const renderScreenContent = () => {
    switch (currentScreen) {
      case AppScreen.LIST:
        return <Screen2_List recommendations={recommendations} filters={filters || {skill:[], level:[], purpose:[], classSize:[], time:[], theme:[]}} grammarTopic={currentGrammarTopic} onSelectGame={onGameSelected} onBack={goBack} onGoHome={resetToHome} isLoading={isLoading || isBooting} isAppending={isAppending} isResultIncomplete={isResultIncomplete} toggleFavorite={toggleFavorite} favorites={favorites} settings={settings} onUpdateList={onSearchRequested} onOpenAuth={handleOpenAuth} />;
      case AppScreen.DETAIL:
        return <Screen3_Detail detail={selectedDetail} onBack={goBack} onGoHome={resetToHome} settings={settings} toggleFavorite={toggleFavorite} isFavorite={favorites.some(f => f.game_title === selectedDetail?.game_title)} onOpenAuth={() => handleOpenAuth('login')} />;
      case AppScreen.SETTINGS:
        return <Screen4_Settings settings={settings} onUpdateSettings={updateSettings} onBack={goBack} onGoHome={resetToHome} onOpenAuth={handleOpenAuth} onLogout={signOutUser} />;
      case AppScreen.FAVORITES:
        return <Screen5_Favorites favorites={favorites} history={history} onSelectGame={onGameSelected} onRemoveFavorite={removeFavorite} onBack={goBack} onGoHome={resetToHome} settings={settings} onOpenSettings={() => navigateTo(AppScreen.SETTINGS)} onOpenTools={() => navigateTo(AppScreen.TOOLS)} />;
      case AppScreen.CONTACT:
        return <Screen6_Contact onBack={goBack} onGoHome={resetToHome} settings={settings} user={currentUser} />;
      case AppScreen.AUTH:
        return <Screen7_Auth onBack={goBack} onLoginSuccess={() => goBack()} settings={settings} onNavigate={navigateTo} />;
      case AppScreen.PRIVACY:
        return <Screen8_PrivacyPolicy onBack={goBack} settings={settings} />;
      case AppScreen.TERMS:
        return <Screen10_TermsOfService onBack={goBack} settings={settings} />;
      case AppScreen.TOOLS:
        return <ToolsOverlay onClose={goBack} onGoHome={resetToHome} settings={settings} />;
      case AppScreen.RESET_PASSWORD:
        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get('oobCode') || '';
        return <Screen9_ResetPassword oobCode={oobCode} onSuccess={() => navigateTo(AppScreen.AUTH)} settings={settings} />;
      case AppScreen.ADMIN_EXPORT:
        return <Screen11_AdminExport onBack={goBack} settings={settings} favorites={favorites} history={history} />;
      case AppScreen.GAMIFICATION_GUIDE:
        return (
          <div className="eglg-guide max-w-6xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-8 space-y-10 animate-in fade-in duration-700 pb-40 text-slate-200 selection:bg-emerald-500 selection:text-white">
            <style>{`
              .eglg-guide, .eglg-guide * {
                font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif !important;
                letter-spacing: -0.01em;
              }
            `}</style>

            <div className="flex items-center justify-between py-4 border-b border-slate-800/50 mb-4">
              <button onClick={goBack} className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-800/55 border border-slate-600/40 rounded-[2.5rem] px-6 py-8 md:px-12 md:pt-8 md:pb-12 space-y-16 shadow-2xl">
              <header className="text-center space-y-6 max-w-4xl mx-auto">
                <h1 className="text-[clamp(20px,2.6vw,38px)] font-extrabold text-white tracking-tight leading-tight break-keep">{g.title}</h1>
                <p className="text-lg md:text-xl text-slate-400 leading-[1.8] font-semibold break-keep opacity-95">"{g.subtitle1}" <br className="hidden md:block"/>{g.subtitle2}</p>
              </header>

              <section className="bg-slate-800/65 border border-slate-700/40 rounded-3xl p-6 md:p-10 shadow-sm space-y-8 max-w-[800px] mx-auto">
                <div className="space-y-4">
                  <div className="text-emerald-500 text-[11px] font-bold uppercase tracking-wider">01 WHAT</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{g.section1Title}</h2>
                </div>
                <div className="space-y-7 text-base md:text-lg text-slate-200/90 leading-[1.8] font-medium break-keep">
                  <p>{g.section1P1}</p>
                  <div className="max-w-[720px] mx-auto mt-4 mb-6">
                    <img src="https://storage.googleapis.com/esl_game_lab/gamelabguide.jpeg" alt="Guide Illustration" className="w-full h-auto rounded-2xl block mx-auto" />
                  </div>
                  <div className="space-y-5 pt-4 bg-slate-900/50 p-8 rounded-2xl border border-slate-700/30 shadow-inner">
                    <p className="font-bold text-emerald-400 uppercase text-[12px] tracking-wide">{g.section1Key}</p>
                    <ul className="list-none space-y-4 text-slate-300">
                      <li className="flex items-center gap-7"><span className="text-white font-bold min-w-[90px] text-sm">Goal</span> <span className="opacity-40">|</span> {g.section1Goal.split('|')[1].trim()}</li>
                      <li className="flex items-center gap-7"><span className="text-white font-bold min-w-[90px] text-sm">Rules</span> <span className="opacity-40">|</span> {g.section1Rules.split('|')[1].trim()}</li>
                      <li className="flex items-center gap-7"><span className="text-white font-bold min-w-[90px] text-sm">Feedback</span> <span className="opacity-40">|</span> {g.section1Feedback.split('|')[1].trim()}</li>
                      <li className="flex items-center gap-7"><span className="text-white font-bold min-w-[90px] text-sm">Reward</span> <span className="opacity-40">|</span> {g.section1Reward.split('|')[1].trim()}</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );
      case AppScreen.GAMIFICATION_TOOLS:
        return (
          <div className={`max-w-4xl mx-auto px-4 py-8 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>
            <div className="flex items-center justify-between mb-6">
              <button onClick={goBack} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Back</button>
            </div>
            <h1 className="text-3xl font-bold mb-4">Gamification Tools</h1>
            <p className="text-lg opacity-75">Coming soon...</p>
          </div>
        );
      case AppScreen.SELECTION:
      default:
        return <Screen1_Selection onNext={onSearchRequested} onGoHome={resetToHome} isLoading={isLoading || isBooting} settings={settings} onOpenSettings={() => navigateTo(AppScreen.SETTINGS)} onOpenFavorites={() => navigateTo(AppScreen.FAVORITES)} onOpenTools={() => navigateTo(AppScreen.TOOLS)} onOpenContact={() => navigateTo(AppScreen.CONTACT)} onOpenAuth={handleOpenAuth} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} text-base font-sans relative overflow-x-hidden`}>
      <div className="fixed inset-0 pointer-events-none border-[12px] border-slate-900/20 z-0"></div>

      <main className="flex-1 pb-2 relative z-10 overflow-x-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-sm opacity-75">Loading...</p>
            </div>
          </div>
        }>
          {renderScreenContent()}
        </Suspense>
      </main>

      {isLoading && (
        <NeedIntroCard 
          isDark={settings.darkMode} 
          suggestion={loadingSuggestion}
          isReady={milestone === 100 || !!selectedDetail}
          onAutoFinish={() => setIsLoading(false)}
        />
      )}

      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 z-[3000] rounded-xl font-bold border-4 border-black animate-in slide-in-from-top-4">
          <span className="font-['Press_Start_2P'] text-[10px] uppercase">ERROR: {error}</span>
          <button onClick={clearError} className="ml-4 font-bold">&times;</button>
        </div>
      )}

      {!isLoading && currentScreen !== AppScreen.AUTH && (
        <AdBanner isDark={settings.darkMode} isLoading={isLoading} />
      )}

      {currentScreen !== AppScreen.AUTH && (
        <div id="persistent-footer-area" className="relative z-10">
          <Footer settings={settings} onNavigate={navigateTo} />
        </div>
      )}

      {!isLoading && (
        <>
          {isHomeActive && (
            <div className="fixed bottom-24 z-[999] flex flex-col items-start gap-4 animate-in slide-in-from-left-4 duration-300" style={{ left: 'max(1rem, calc(50vw - 448px - 5rem))' }}>
              <div className="hidden md:flex flex-col items-start gap-4">
                {leftMenuActions.map((item, idx) => (
                  <div key={idx} className="relative w-12 h-12 flex justify-start">
                    <button onClick={item.action} className={`group absolute left-0 flex items-center justify-start h-12 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 ease-out overflow-hidden w-12 hover:w-max hover:min-w-[120px] ${item.colorClass}`}>
                      <div className="pl-3 shrink-0"><item.icon className="w-5 h-5" /></div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1.5 group-hover:translate-x-0 whitespace-nowrap px-3">
                        <span className="font-['Press_Start_2P'] text-[9px] uppercase tracking-tight">{item.label}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex md:hidden flex-col items-start gap-3">
                  {isLeftMobileMenuOpen && (
                     <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                       {leftMenuActions.map((item, idx) => (
                         <button key={idx} onClick={item.action} className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.colorClass}`}>
                           <item.icon className="w-5 h-5" />
                         </button>
                       ))}
                     </div>
                  )}
                  <button onClick={() => setIsLeftMobileMenuOpen(!isLeftMobileMenuOpen)} className="w-12 h-12 bg-emerald-600 text-white flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {isLeftMobileMenuOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
              </div>
            </div>
          )}

          {isManagementScreen && (
            <div className="fixed bottom-24 z-[999] flex flex-col items-end gap-3 transition-all duration-300" style={{ right: 'max(1rem, calc(50vw - 448px - 5rem))' }}>
                {/* 상세 화면(DETAIL)과 리스트 화면(LIST)에서는 상단 홈 버튼이 있으므로 플로팅 홈 버튼을 숨김 */}
                {!isHomeActive && currentScreen !== AppScreen.LIST && currentScreen !== AppScreen.DETAIL && (
                  <button onClick={resetToHome} className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in active:translate-y-0.5">
                    <Home className="w-5 h-5" />
                  </button>
                )}
                
                <div className="hidden md:flex flex-col gap-3">
                     {menuActions.map((item, idx) => (
                       <button key={idx} onClick={item.action} className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${item.isActive ? 'ring-4 ring-white scale-110' : 'hover:scale-105'} ${item.colorClass}`}>
                         <item.icon className="w-5 h-5" />
                       </button>
                     ))}
                </div>

                <div className="flex md:hidden flex-col items-end gap-3">
                    {isMobileMenuOpen && (
                       <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                         {menuActions.map((item, idx) => (
                           <button key={idx} onClick={item.action} className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.isActive ? 'ring-4 ring-white' : ''} ${item.colorClass}`}>
                             <item.icon className="w-5 h-5" />
                           </button>
                         ))}
                       </div>
                    )}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                </div>

                {showScrollTop && (
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-12 h-12 bg-slate-800 text-white flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ArrowUp className="w-5 h-5" />
                  </button>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
