
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Target, Sparkles, CheckCircle } from 'lucide-react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onClose: () => void;
  settings: AppSettings;
}

export const OnboardingOverlay: React.FC<Props> = ({ onClose, settings }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;

  const ICONS = [Sparkles, Target, BookOpen, CheckCircle];
  const COLORS = ["bg-blue-500", "bg-green-500", "bg-indigo-600", "bg-purple-600"];

  const steps = t.onboardingSteps;
  const current = steps[currentStep];
  const CurrentIcon = ICONS[currentStep] || Sparkles;
  const currentColor = COLORS[currentStep] || "bg-blue-500";

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md font-sans">
      <div className={`w-full max-w-2xl min-h-[480px] border-4 border-slate-900 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
        
        {/* Progress Bar */}
        <div className="h-1.5 flex w-full">
            {steps.map((_: any, i: number) => (
                <div 
                    key={i} 
                    className={`flex-1 transition-colors duration-500 ${i <= currentStep ? currentColor : isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                />
            ))}
        </div>

        {/* Header */}
        <div className="px-6 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${currentColor}`}></div>
                <span className="text-[10px] md:text-[12px] font-bold font-['Press_Start_2P'] uppercase opacity-60">
                    STEP {currentStep + 1} / {steps.length}
                </span>
            </div>
            <button onClick={onClose} className="hover:text-red-500 transition-all p-1.5 rounded-xl bg-slate-500/10">
                <X className="w-5 h-5 md:w-6 md:h-6 opacity-80" />
            </button>
        </div>

        {/* Content Area - Optimized margins for better density */}
        <div className="flex-1 px-8 md:px-12 py-1 flex flex-col items-center justify-center text-center">
            
            {/* Illustration */}
            <div className={`w-24 h-24 md:w-36 md:h-36 rounded-[2rem] flex items-center justify-center mb-3 md:mb-3 shadow-xl border-4 border-slate-900 relative shrink-0 ${currentColor} transform hover:scale-105 transition-transform`}>
                <CurrentIcon className="w-12 h-12 md:w-20 md:h-20 text-white" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-11 md:h-11 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-slate-900" />
                </div>
            </div>

            <h1 className={`text-xl md:text-3xl font-black mb-0 font-['Press_Start_2P'] uppercase tracking-tight break-keep leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {current.title}
            </h1>
            <h2 className="text-sm md:text-2xl font-bold mb-0.5 md:mb-1 text-blue-500 font-['VT323'] uppercase tracking-[0.2em] text-center break-keep">
                {current.subtitle}
            </h2>
            <div className={`max-w-[520px] text-base md:text-xl leading-relaxed text-center whitespace-pre-line break-keep font-medium px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {current.content}
            </div>
        </div>

        {/* Footer Navigation */}
        <div className={`px-6 py-4 border-t border-slate-200/20 flex items-center justify-between shrink-0 ${isDark ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
            <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-[11px] md:text-[13px] font-['Press_Start_2P'] uppercase transition-all ${
                    currentStep === 0 ? 'opacity-0 cursor-default' : 'hover:translate-x-[-4px] text-blue-500'
                }`}
            >
                <ChevronLeft className="w-4 h-4" />
                {t.back}
            </button>

            <button
                onClick={handleNext}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none transition-all font-bold uppercase text-[10px] md:text-[12px] text-white font-['Press_Start_2P'] ${currentColor}`}
            >
                <span>{currentStep === steps.length - 1 ? t.finish : t.next}</span>
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>

      </div>
    </div>
  );
};
