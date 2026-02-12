
import React from 'react';
import { AppSettings, AppScreen } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  settings: AppSettings;
  onNavigate: (screen: AppScreen) => void;
}

export const Footer: React.FC<Props> = ({ settings, onNavigate }) => {
  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;

  return (
    <footer className={`mt-auto py-5 px-4 border-t-2 border-dashed text-center space-y-5 ${
      isDark ? 'border-slate-800' : 'border-slate-300'
    }`}>
      
      {/* Links Group */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <button
          onClick={() => onNavigate(AppScreen.PRIVACY)}
          className={`text-[10px] md:text-xs font-bold uppercase tracking-widest hover:underline transition-all ${
            isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {t.privacyPolicy}
        </button>
        <button
          onClick={() => onNavigate(AppScreen.TERMS)}
          className={`text-[10px] md:text-xs font-bold uppercase tracking-widest hover:underline transition-all ${
            isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {t.termsOfService}
        </button>
        <button
          onClick={() => onNavigate(AppScreen.CONTACT)}
          className={`text-[10px] md:text-xs font-bold uppercase tracking-widest hover:underline transition-all ${
            isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {t.contact}
        </button>
      </div>
      
      {/* Platform Description */}
      <p className={`text-[10px] md:text-xs font-medium max-w-2xl mx-auto leading-relaxed ${
        isDark ? 'text-slate-600' : 'text-slate-500'
      }`}>
        {t.platformDesc}
      </p>

      {/* Copyright */}
      <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${
        isDark ? 'text-slate-700' : 'text-slate-400'
      }`}>
        {t.footerRights}
      </p>
    </footer>
  );
};
