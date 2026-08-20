import React, { useState } from 'react';
import { ArrowLeft, Star, CheckCircle2, Home, MessageCircle } from 'lucide-react';
import { AppSettings, UserProfile } from '../types';
import { TRANSLATIONS } from '../constants';
import { PROFILE_MESSAGES } from '../content/profile_message';

interface Props {
  onBack: () => void;
  onGoHome: () => void;
  settings: AppSettings;
  user?: UserProfile | null;
}

const FORM_ENDPOINT = "https://formspree.io/f/xpqaanvg";

export const Screen6_Contact: React.FC<Props> = ({ onBack, settings, user }) => {
  const [form, setForm] = useState({ message: "", company: "" });
  const [rating, setRating] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  const isDark = settings.darkMode;
  const isKO = settings.language === 'ko';
  const t = TRANSLATIONS[settings.language];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim() && rating === 0) {
        setErrorMsg(isKO ? "메시지나 별점 중 하나는 꼭 입력해주세요." : "Please enter a message or a rating.");
        setStatus('error');
        return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      const starString = "★".repeat(rating) + "☆".repeat(5 - rating);
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.nickname || "Anonymous Teacher",
          email: user?.email || "not-provided@eslgamelab.app",
          rating: `${starString} (${rating}/5)`,
          message: form.message.trim(),
          _subject: `ESL GAME LAB Feedback - ${rating} Stars from ${user?.nickname || 'Anonymous'}`,
        })
      });
      setStatus("success");
      setForm({ message: "", company: "" });
      setRating(0);
    } catch (error: any) {
      setStatus("error");
      setErrorMsg("Failed to send message.");
    }
  };

  const navBtnStyle = `w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all`;
  const devImageUrl = "https://raw.githubusercontent.com/esltenya-eng/esl-game-lab-assets/main/esl_game_profile.jpeg";

  if (status === 'success') {
    return (
        <div className="max-w-xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 font-sans">
            <div className="relative">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
            </div>
            <h2 className={`text-2xl font-black font-['Press_Start_2P'] uppercase ${isDark ? 'text-green-400' : 'text-slate-800'}`}>Sent!</h2>
            <p className={`text-xl font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.feedbackSuccess}</p>
            <div className="flex flex-col w-full gap-3 pt-4">
                <button onClick={() => setStatus('idle')} className={`w-full py-4 rounded-xl font-bold font-['Press_Start_2P'] uppercase text-xs flex items-center justify-center border-2 border-slate-900 ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}>Return</button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6 pb-[calc(60px+env(safe-area-inset-bottom)+24px)] font-sans">
      {/* Standardized Header Navigation */}
      <div className="flex items-center justify-between w-full relative h-14 mb-12">
          <button onClick={onBack} className={navBtnStyle}>
              <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            <h2 className={`text-[10px] md:text-sm font-['Press_Start_2P'] uppercase ${isDark ? 'text-yellow-400' : 'text-slate-800'}`}>
                {t.contact}
            </h2>
          </div>

          <div className="w-12 flex justify-end">
            <MessageCircle className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-slate-800'}`} />
          </div>
      </div>

      <div className={`flex items-center space-x-4 md:space-x-6 p-4 md:p-6 rounded-3xl transition-all ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-900">
                  <img src={devImageUrl} alt="Jay" className="w-full h-full object-cover scale-[1.2]" />
              </div>
          </div>
          <div className="flex-1">
              <div className={`relative p-4 rounded-2xl font-bold leading-relaxed ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                  <p className="relative z-10 text-sm md:text-base tracking-tight font-medium">
                    {PROFILE_MESSAGES[settings.language] || PROFILE_MESSAGES.en}
                  </p>
              </div>
          </div>
      </div>
      <form onSubmit={handleSend} className={`border-4 border-black rounded-3xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
         <div className="space-y-4">
             <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Leave feedback..." className={`w-full h-40 p-4 border-2 rounded-2xl ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`} />
             <div className="flex justify-between items-center py-2">
                <span className="text-[8px] font-['Press_Start_2P'] uppercase">Rate Us</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setRating(star)}><Star className={`w-6 h-6 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} /></button>
                    ))}
                </div>
             </div>
             <button type="submit" className="w-full py-5 bg-green-500 text-white font-['Press_Start_2P'] text-[10px] uppercase border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Send</button>
         </div>
      </form>
    </div>
  );
};
