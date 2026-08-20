
import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onBack: () => void;
  settings: AppSettings;
}

export const Screen8_PrivacyPolicy: React.FC<Props> = ({ onBack, settings }) => {
  const isDark = settings.darkMode;
  const t = TRANSLATIONS[settings.language];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-32 font-sans">
      <div className="flex items-center">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all ${
            isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center space-y-4">
        <ShieldCheck className={`w-12 h-12 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className={`text-2xl font-black font-['Press_Start_2P'] uppercase ${isDark ? 'text-yellow-400' : 'text-slate-800'}`}>
          {t.privacyPolicy}
        </h1>
      </div>

      <div className={`border-2 border-slate-900 rounded-2xl p-6 md:p-10 space-y-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] leading-relaxed ${
        isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'
      }`}>
        <section className="space-y-3">
          <h2 className="font-bold text-lg text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl">1. Data Collection</h2>
          <p>ESL GAME LAB is a client-side focused application. We do not store your personal teaching data on our servers. Any settings or favorites are stored locally on your browser's local storage.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-lg text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl">2. AI Services</h2>
          <p>This app utilizes the Gemini API to generate game recommendations. Information sent to the API is limited to your selection criteria (skill, level, etc.) to provide relevant pedagogical suggestions.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-lg text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl">3. Your Rights</h2>
          <p>Since data is stored locally, you have full control. You can clear your favorites or settings at any time by clearing your browser cache or using the app's reset functions.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-lg text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl">4. Contact Us</h2>
          <p>If you have questions regarding these practices, please reach out via the Contact screen.</p>
        </section>
      </div>
    </div>
  );
};
