
import React, { useState, useEffect } from 'react';
import { AppSettings, SupportedLanguage } from '../types';
import { ArrowLeft, Moon, Sun, Volume2, Type, Globe, Sliders, LogOut, User, Check } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useUserStore } from '../hooks/useUserStore';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onBack: (e?: React.MouseEvent) => void;
  onGoHome: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Screen4_Settings: React.FC<Props> = ({ settings, onUpdateSettings, onBack, onOpenAuth, onLogout }) => {
  const { currentUser } = useUserStore();
  const [draft, setDraft] = useState<AppSettings>({ ...settings });
  const [isApplying, setIsApplying] = useState(false);
  
  const t = TRANSLATIONS[draft.language];
  const isDark = draft.darkMode;

  useEffect(() => {
    setDraft({ ...settings });
  }, [settings]);

  const handleApply = async () => {
    setIsApplying(true);
    onUpdateSettings(draft);
    setTimeout(() => setIsApplying(false), 500);
  };

  const navBtnStyle = `w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all`;
  const cardClass = `p-4 rounded-2xl border-2 border-black ${isDark ? 'bg-slate-800/50' : 'bg-white'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`;

  return (
    <div className="max-w-xl mx-auto p-4 pb-10 font-sans relative z-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between w-full relative h-14 mb-8">
          <button onClick={(e) => { onUpdateSettings(draft); onBack(e); }} className={navBtnStyle}>
              <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            <h2 className={`text-[10px] md:text-sm font-['Press_Start_2P'] uppercase ${isDark ? 'text-yellow-400' : 'text-slate-800'}`}>
                {t.settings}
            </h2>
          </div>
          <div className="w-12 flex justify-end"><Sliders className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-slate-800'}`} /></div>
      </div>

      <div className="flex flex-col gap-4">
        <div className={cardClass}>
            <div className="flex items-center space-x-2 mb-3">
                <User className="w-4 h-4 text-blue-400" />
                <span className={`text-base font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.accountSettings}</span>
            </div>
            {currentUser ? (
                <div className="p-3 rounded-xl border-2 border-black bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`} alt="" className="w-8 h-8 rounded-full border border-black" />
                        <div>
                            <p className="text-sm font-bold text-white">{currentUser.displayName || 'Teacher'}</p>
                            <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="p-2 bg-red-500 text-white rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"><LogOut className="w-3 h-3" /></button>
                </div>
            ) : (
                <button onClick={() => onOpenAuth('login')} className="w-full py-3 bg-white text-slate-900 border-2 border-black flex items-center justify-center gap-3 rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5">
                    <span className="font-['Press_Start_2P'] text-[9px] uppercase">{t.signIn}</span>
                </button>
            )}
        </div>

        <div className={cardClass}>
            <div className="flex items-center space-x-2 mb-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className={`text-base font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.language}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-['Press_Start_2P'] uppercase">
                {[{ code: 'en', label: 'English' }, { code: 'ko', label: '한국어' }, { code: 'ja', label: '日本語' }, { code: 'zh', label: '中文' }].map((lang) => (
                    <button key={lang.code} type="button" onClick={() => setDraft(prev => ({ ...prev, language: lang.code as SupportedLanguage }))} className={`py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all rounded-lg ${draft.language === lang.code ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <span className={lang.code === 'en' ? 'text-[8px]' : 'text-[12px]'}>{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className={cardClass}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-yellow-300" />
                    <span className={`text-base font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.themeSettings}</span>
                </div>
                <button type="button" onClick={() => setDraft(prev => ({ ...prev, darkMode: !prev.darkMode }))} className="px-4 py-2 bg-[#facc15] text-black border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 rounded-sm uppercase font-['Press_Start_2P'] text-[8px]">
                    {t.darkModeLabel}
                </button>
            </div>
        </div>

        <div className={cardClass}>
            <div className="flex items-center space-x-2 mb-4">
                <Volume2 className="w-5 h-5 text-green-400" />
                <span className={`text-base font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.volumeSettings}</span>
            </div>
            <div className="space-y-2 px-2">
                <input type="range" min="0" max="100" value={draft.volume} onChange={(e) => setDraft(prev => ({ ...prev, volume: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-400 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div className={`text-right font-['VT323'] text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{draft.volume}%</div>
            </div>
        </div>

        <div className={cardClass}>
            <div className="flex items-center space-x-2 mb-4">
                <Type className="w-5 h-5 text-purple-400" />
                <span className={`text-base font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.fontSizeSettings}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-['VT323'] uppercase">
                {(['small', 'medium', 'large'] as const).map((size) => (
                    <button key={size} type="button" onClick={() => setDraft(prev => ({ ...prev, fontSize: size }))} className={`h-10 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all rounded-sm flex items-center justify-center ${draft.fontSize === size ? 'bg-[#22c55e] text-white' : 'bg-slate-700 text-slate-300'}`}>
                        <span className={size === 'small' ? 'text-[10px]' : size === 'medium' ? 'text-[16px]' : 'text-[24px]'}>{size}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-2">
            <button type="button" onClick={handleApply} disabled={isApplying} className={`w-full py-4 rounded-xl border-4 border-black font-['Press_Start_2P'] text-[14px] uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 flex items-center justify-center gap-3 transition-all ${isApplying ? 'bg-slate-600 cursor-wait' : 'bg-[#22c55e] text-white'}`}>
                {isApplying ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Check className="w-5 h-5" />}
                <span>{t.apply}</span>
            </button>
        </div>
      </div>
    </div>
  );
};
