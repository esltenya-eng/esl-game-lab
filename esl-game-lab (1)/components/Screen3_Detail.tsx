
import React, { useState } from 'react';
import { GameDetail, AppSettings, GameRecommendation } from '../types';
import { ArrowLeft, Volume2, User, AlertCircle, Wrench, ListOrdered, Heart, Minus, Plus, LogIn, Home, LogOut, UserPlus, Presentation } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useUserStore } from '../hooks/useUserStore';

interface Props {
  detail: GameDetail | null;
  onBack: (e?: any) => void;
  onGoHome: () => void;
  settings: AppSettings;
  toggleFavorite: (game: GameRecommendation) => void;
  isFavorite: boolean;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Screen3_Detail: React.FC<Props> = ({ detail, onBack, onGoHome, settings, toggleFavorite, isFavorite, onOpenAuth }) => {
  const { currentUser, signOutUser } = useUserStore();
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [directionLevel, setDirectionLevel] = useState<'simple' | 'medium' | 'complex'>('medium');
  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;

  const speak = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsPlaying(index);
      utterance.onend = () => setIsPlaying(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!detail) return null;

  const directions = (detail.teacher_directions[directionLevel] || detail.teacher_directions.medium).slice(0, 5);
  const navBtnStyle = `w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all`;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 font-sans relative animate-in fade-in duration-500">
      {/* Navigation Header */}
      <div className="flex items-center justify-between w-full relative h-14 mb-12">
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

      <div className="flex flex-col gap-6 md:gap-8">
        
        {/* Section 0: Result Icon */}
        <div className="flex flex-col items-center justify-center">
            <div className="text-6xl md:text-7xl mb-4 select-none">
                {detail.icon || "✨"}
            </div>
        </div>

        {/* Section 1: Title & Tags - Further reduced font size and weight to satisfy pressure reduction */}
        <div className="text-center relative px-2">
            <h1 className={`text-lg md:text-4xl font-semibold ${settings.language === 'en' ? "font-['Press_Start_2P'] uppercase" : "font-bold font-sans"} text-[#facc15] leading-normal mb-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-tighter truncate whitespace-nowrap overflow-hidden`}>
                {detail.game_title}
            </h1>
            {/* 해시태그 한 줄 배치 최적화 */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 md:gap-2 px-4">
                {detail.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 text-sm font-bold rounded-full border-2 border-[#4ade80] text-[#4ade80] bg-green-900/20 uppercase tracking-tight whitespace-nowrap">
                        #{tag}
                    </span>
                ))}
            </div>
            <button onClick={() => toggleFavorite(detail as any)} className="absolute -top-4 right-0 p-3 border-2 border-slate-900 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-slate-800">
                <Heart className={`w-7 h-7 ${isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : 'text-slate-400'}`} />
            </button>
        </div>

        {/* Section 2: Classroom Scene Card */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-bold font-['Press_Start_2P'] px-2 flex items-center uppercase text-[#a855f7]">
            <Presentation className="w-4 h-4 mr-2" /> {t.classroomScene}
          </h2>
          <div className="w-full bg-slate-800 border-2 border-slate-900 rounded-[1.5rem] flex flex-col items-center justify-center p-6 md:p-8 space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               <p className="text-sm font-normal opacity-90 text-center max-w-2xl leading-relaxed italic px-2 text-white">
                   {detail.illustration}
               </p>
          </div>
        </div>

        {/* Section 3: Materials & Caution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-bold font-['Press_Start_2P'] px-2 flex items-center uppercase text-[#3b82f6]"><Wrench className="w-4 h-4 mr-2" /> {t.materials}</h2>
              <div className="border-2 border-slate-900 rounded-2xl p-6 bg-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full text-white">
                <p className="text-sm font-medium opacity-80 leading-relaxed">{detail.materials}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-bold font-['Press_Start_2P'] px-2 flex items-center uppercase text-[#ef4444]"><AlertCircle className="w-4 h-4 mr-2" /> {t.caution}</h2>
              <div className="border-2 border-slate-900 rounded-2xl p-6 bg-red-900/10 border-red-900/50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full text-white">
                <p className="text-sm font-medium opacity-80 leading-relaxed">{detail.caution}</p>
              </div>
            </div>
        </div>

        {/* Section 4: How To Play Card */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-bold font-['Press_Start_2P'] px-2 flex items-center uppercase text-[#22c55e]"><ListOrdered className="w-4 h-4 mr-2" /> {t.howToPlay}</h2>
          <div className="border-2 border-slate-900 rounded-[2rem] p-8 md:p-10 bg-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white">
            <div className="flex flex-col gap-5">
              {detail.how_to_play.map((step, idx) => (
                 <div key={idx} className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-[#22c55e] text-slate-900 font-['Press_Start_2P'] text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">{idx + 1}</div>
                    <p className="text-sm font-medium tracking-tight opacity-95 leading-relaxed">{step.replace(/^\d+[\.\)\-\s]+/, '').trim()}</p>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Teacher Directions Card */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
              <h2 className="text-[13px] font-bold font-['Press_Start_2P'] flex items-center uppercase text-[#facc15]"><Volume2 className="w-4 h-4 mr-2" /> {t.teacherDirections}</h2>
              <div className="flex items-center gap-2 bg-slate-900 p-1 border-2 border-slate-800 rounded-lg">
                  <button onClick={() => setDirectionLevel(prev => prev === 'simple' ? 'simple' : prev === 'medium' ? 'simple' : 'medium')} className="p-1 text-white hover:text-[#facc15]"><Minus className="w-3 h-3" /></button>
                  <span className="text-[8px] font-['Press_Start_2P'] uppercase text-white min-w-[60px] text-center">{directionLevel}</span>
                  <button onClick={() => setDirectionLevel(prev => prev === 'complex' ? 'complex' : prev === 'medium' ? 'complex' : 'medium')} className="p-1 text-white hover:text-[#facc15]"><Plus className="w-3 h-3" /></button>
              </div>
          </div>
          <div className="flex flex-col gap-3 text-white">
            {directions.map((direction, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 bg-slate-800 border-2 border-slate-900 rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isPlaying === idx ? 'ring-2 ring-blue-500 bg-slate-700' : ''}`}>
                <p className="text-sm font-medium tracking-tight">"{direction}"</p>
                <button onClick={() => speak(direction, idx)} className="p-3 bg-[#2563eb] text-white rounded-full active:scale-90 shadow-md"><Volume2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Student Interactions Card */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-bold font-['Press_Start_2P'] flex items-center uppercase text-[#00ff9d] px-2">{t.studentInteractions}</h2>
          <div className="border-2 border-slate-900 bg-black rounded-[2rem] p-8 md:p-10 flex flex-col gap-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-[#00ff9d]">
            {detail.student_interactions.map((interaction, idx) => (
              <div key={idx} className="flex items-start gap-5">
                <User className="w-6 h-6 md:w-8 md:h-8 shrink-0 mt-1 opacity-70" />
                <p className="text-sm font-medium italic leading-relaxed break-keep text-left">
                    {interaction.split(/(\([^)]+\))/g).map((part, i) => part.startsWith('(') && part.endsWith(')') ? <span key={i} className="text-xs opacity-70 italic font-normal">{part}</span> : <span key={i}>{part}</span>)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
