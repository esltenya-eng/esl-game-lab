import React, { useState, useEffect } from 'react';
import { AppSettings, UserProfile, TeachingLevel, AppScreen } from '../types';
import { TRANSLATIONS } from '../constants';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Footer } from './Footer';

interface Props {
  onBack: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  settings: AppSettings;
  defaultMode?: 'login' | 'signup';
  onNavigate: (screen: AppScreen) => void;
}

export const Screen7_Auth: React.FC<Props> = ({ onBack, onLoginSuccess, settings, defaultMode = 'signup', onNavigate }) => {
  const { signInWithGoogle, currentUser } = useUserStore();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{code: string; message: string} | null>(null);

  const [nickname, setNickname] = useState('');
  const [teachingLevel, setTeachingLevel] = useState<TeachingLevel | undefined>(undefined);

  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;

  // Lock body scroll on mount
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
        onLoginSuccess(currentUser);
    }
  }, [currentUser, onLoginSuccess]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
        if (mode === 'signup') {
            if (password.length < 6) {
                setError({ code: "auth/weak-password", message: t.passwordTooShort || "Min 6 characters." });
                setIsProcessing(false);
                return;
            }
            setStep('profile');
            setIsProcessing(false);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (err: any) {
        setError({ code: err.code, message: err.message });
        setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsProcessing(true);
    
    try {
        await signInWithGoogle();
    } catch (err: any) {
        console.error("Auth Error:", err.code, err.message);
        setError({ 
            code: err.code, 
            message: err.message 
        });
        setIsProcessing(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            nickname: nickname,
            displayName: nickname,
            teachingLevel: teachingLevel || null,
            provider: 'local',
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp()
        }, { merge: true });

    } catch (err: any) {
        setError({ code: err.code, message: err.message });
        if (err.code === 'auth/email-already-in-use') {
            setStep('credentials');
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const teachingLevels: TeachingLevel[] = [
      'Early Childhood', 'Lower Elementary', 'Upper Elementary', 'Middle/Secondary'
  ];

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} onClick={onBack}>
      <div 
        className={`relative z-[10000] w-full max-w-md flex flex-col rounded-[2rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all max-h-[90vh] overflow-hidden ${
          isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onBack} disabled={isProcessing} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-500/10 disabled:opacity-30 z-20">
            <X className="w-5 h-5 opacity-60" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pb-10">
            {step === 'credentials' && (
                <div className="flex flex-col space-y-6">
                    <div className="text-center space-y-2 mb-2">
                        <h1 className="text-lg md:text-xl font-black font-['Press_Start_2P'] uppercase text-blue-600 leading-none tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">ESL GAME LAB</h1>
                        <p className="text-[10px] md:text-[11px] opacity-60 font-medium font-sans">
                            {mode === 'login' ? "New here?" : "Joined before?"}{' '}
                            <button 
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-blue-500 hover:underline font-bold"
                            >
                                {mode === 'login' ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isProcessing}
                            className="w-full py-3.5 bg-white text-slate-900 border-2 border-slate-900 flex items-center justify-center gap-3 rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all hover:bg-slate-50 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5" />
                            )}
                            <span className="font-['Press_Start_2P'] text-[9px] uppercase">Continue with Google</span>
                        </button>

                        <div className="flex items-center gap-4 py-1 opacity-20">
                            <div className="h-px bg-current flex-1"></div>
                            <span className="text-[8px] font-bold uppercase font-['Press_Start_2P'] tracking-widest">OR</span>
                            <div className="h-px bg-current flex-1"></div>
                        </div>

                        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[8px] font-bold font-['Press_Start_2P'] uppercase tracking-widest opacity-80 pl-1">Email</label>
                                <input 
                                    type="email" value={email} required
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border-2 border-slate-900 focus:outline-none text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[8px] font-bold font-['Press_Start_2P'] uppercase tracking-widest opacity-80 pl-1">Password</label>
                                <input 
                                    type="password" value={password} required
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border-2 border-slate-900 focus:outline-none text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in duration-200">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[8px] font-['Press_Start_2P'] uppercase font-bold leading-tight">AUTH ERROR</p>
                                        <p className="text-[11px] font-medium mt-0.5 leading-snug break-words">{error.message}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <button 
                                    type="submit" disabled={isProcessing}
                                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-['Press_Start_2P'] text-[11px] md:text-[12px] uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>{mode === 'login' ? 'Log In' : 'Next Step'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {step === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="flex flex-col space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-base md:text-lg font-bold font-['Press_Start_2P'] uppercase text-green-500 tracking-tight">Profile Setup</h2>
                        <p className="text-[10px] md:text-[11px] opacity-60 font-medium">Almost there! Complete your details.</p>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-[8px] font-bold font-['Press_Start_2P'] uppercase tracking-widest opacity-90 pl-1">Nickname *</label>
                        <input 
                            type="text" value={nickname} required
                            onChange={(e) => setNickname(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 border-slate-900 focus:outline-none text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[8px] font-bold font-['Press_Start_2P'] uppercase tracking-widest opacity-90 pl-1">Teaching Level</label>
                        <div className="grid grid-cols-1 gap-2">
                            {teachingLevels.map((level) => (
                                <button
                                    key={level} type="button"
                                    onClick={() => setTeachingLevel(level as TeachingLevel)}
                                    className={`py-3 px-4 rounded-xl border-2 text-[12px] font-bold transition-all text-left flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] ${
                                        teachingLevel === level ? 'bg-blue-600 text-white border-slate-900' : 'bg-transparent border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <span>{level}</span>
                                    {teachingLevel === level && <Check className="w-4 h-4 animate-in zoom-in duration-200" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col space-y-4">
                        <button 
                            type="submit" disabled={!nickname.trim() || isProcessing}
                            className="w-full py-4 rounded-xl bg-green-500 text-white font-['Press_Start_2P'] text-[11px] md:text-[12px] uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                            Complete Sign Up
                        </button>
                        
                        <button 
                        type="button" onClick={() => setStep('credentials')}
                        className="w-full text-[9px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-all font-['Press_Start_2P']"
                        >
                        [ Go Back ]
                        </button>
                    </div>
                </form>
            )}
        </div>
        
        {/* Unified Footer Component - Identical to other screens */}
        <div className="shrink-0 pt-2 border-t-2 border-dashed border-slate-200/10">
          <Footer settings={settings} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};
