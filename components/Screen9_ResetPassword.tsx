
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';
import { auth } from '../firebase';
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  oobCode: string;
  onSuccess: () => void;
  settings: AppSettings;
}

export const Screen9_ResetPassword: React.FC<Props> = ({ oobCode, onSuccess, settings }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'verifying' | 'ready' | 'processing' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;

  useEffect(() => {
    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setStatus('ready');
      } catch (err: any) {
        console.error("ESL GAME LAB: Reset Code Verification Failed", err);
        setStatus('error');
        
        let msg = t.resetLinkInvalid;
        if (err.code === 'auth/expired-action-code') {
          msg = t.resetLinkExpired;
        }
        setError(msg);
      }
    };
    verifyCode();
  }, [oobCode, t.resetLinkExpired, t.resetLinkInvalid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (newPassword.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setStatus('processing');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
    } catch (err: any) {
      console.error("ESL GAME LAB: Password Reset Confirmation Failed", err);
      setStatus('error');
      
      let msg = t.errorGeneric;
      if (err.code === 'auth/weak-password') {
        msg = t.passwordTooShort;
      } else if (err.code === 'auth/expired-action-code') {
        msg = t.resetLinkExpired;
      }
      setError(msg);
    }
  };

  const resetForm = () => {
    setStatus('ready');
    setError(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="font-['Press_Start_2P'] text-[10px] uppercase animate-pulse">
            {settings.language === 'ko' ? '링크 확인 중...' : 'Verifying Link...'}
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto p-8 mt-10 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center justify-center p-6 rounded-full bg-green-100 text-green-600 mb-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-['Press_Start_2P'] uppercase text-green-600 leading-tight">
            {t.resetPassword}
        </h1>
        <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t.passwordResetSuccess}
        </p>
        <button 
          onClick={onSuccess}
          className="w-full py-5 bg-blue-600 text-white font-['Press_Start_2P'] text-[12px] uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all rounded-xl hover:bg-blue-700"
        >
          {t.goToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 md:p-8 mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-blue-100 text-blue-600 mb-4 border-2 border-black">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-['Press_Start_2P'] uppercase text-blue-600 leading-relaxed mb-2">
          {t.resetPassword}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={`border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl space-y-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div>
          <label className="block text-[10px] font-bold font-['Press_Start_2P'] uppercase mb-3 opacity-80">
              {t.newPassword}
          </label>
          <input 
            type="password" 
            value={newPassword}
            disabled={status === 'processing'}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
            placeholder="••••••••"
            className={`w-full px-4 py-4 rounded-xl border-2 border-black focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-lg ${
              isDark ? 'bg-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-900 placeholder-slate-400'
            }`}
            required 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold font-['Press_Start_2P'] uppercase mb-3 opacity-80">
              {t.confirmNewPassword}
          </label>
          <input 
            type="password" 
            value={confirmPassword}
            disabled={status === 'processing'}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            placeholder="••••••••"
            className={`w-full px-4 py-4 rounded-xl border-2 border-black focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-lg ${
              isDark ? 'bg-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-900 placeholder-slate-400'
            }`}
            required 
          />
        </div>

        {error && (
          <div className="flex items-start text-red-500 text-xs font-bold p-4 bg-red-50 rounded-xl border-2 border-red-200 animate-in fade-in shake">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit"
          disabled={status === 'processing' || status === 'error'}
          className="w-full py-5 rounded-xl bg-blue-600 text-white font-['Press_Start_2P'] text-[12px] uppercase hover:bg-blue-700 transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {status === 'processing' && <Loader2 className="w-5 h-5 animate-spin" />}
          {t.apply}
        </button>
      </form>

      {status === 'error' && (
        <div className="text-center p-6 bg-red-100 text-red-600 border-4 border-black rounded-2xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <p className="mb-4">{error || 'Something went wrong.'}</p>
           <button 
            onClick={resetForm}
            className="text-xs underline font-['Press_Start_2P'] uppercase"
           >
             Try Again
           </button>
        </div>
      )}
    </div>
  );
};
