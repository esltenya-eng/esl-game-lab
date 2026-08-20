import React, { useState } from 'react';
import { UserProfile, AppSettings } from '../types';
import { X, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  user: UserProfile;
  onClose: () => void;
  settings: AppSettings;
}

export const UserProfileOverlay: React.FC<Props> = ({ user, onClose, settings }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isDark = settings.darkMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div 
        className={`w-full max-w-md p-6 rounded-2xl shadow-2xl relative border-2 border-slate-900 ${
            isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-500/10 transition-colors"
        >
            <X className="w-5 h-5 opacity-60" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black font-['Press_Start_2P'] uppercase tracking-wide">
                User Profile
            </h2>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
            
            {/* Nickname */}
            <div className={`p-4 rounded-xl border-2 border-slate-900 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <label className="block text-xs font-bold uppercase opacity-60 mb-1 flex items-center gap-2">
                    <User className="w-3 h-3" /> Nickname
                </label>
                <div className="text-lg font-bold font-['Press_Start_2P'] text-green-500">
                    {user.nickname}
                </div>
            </div>

            {/* Email */}
            <div className={`p-4 rounded-xl border-2 border-slate-900 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <label className="block text-xs font-bold uppercase opacity-60 mb-1 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email
                </label>
                <div className="text-lg font-medium break-all">
                    {user.email}
                </div>
            </div>

            {/* Password */}
            <div className={`p-4 rounded-xl border-2 border-slate-900 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <label className="block text-xs font-bold uppercase opacity-60 mb-1 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Password
                </label>
                <div className="flex items-center justify-between">
                    <div className="text-lg font-mono tracking-widest">
                        {showPassword ? user.password : '••••••••'}
                    </div>
                    <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                        title={showPassword ? "Hide Password" : "Show Password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

        </div>

        <div className="mt-8 text-center">
            <button 
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-bold uppercase text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all ${
                    isDark ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
            >
                Close
            </button>
        </div>

      </div>
    </div>
  );
};