
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Hash, Type, Volume2, PartyPopper, Trophy, BellRing, AlertCircle, ArrowLeft, Wrench } from 'lucide-react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onClose: () => void;
  onGoHome: () => void;
  settings: AppSettings;
}

type Tab = 'timer' | 'number' | 'alphabet' | 'sound';

export const ToolsOverlay: React.FC<Props> = ({ onClose, settings }) => {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;

  // Timer State
  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);
  
  // Random Gen State
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [numberRange, setNumberRange] = useState<20 | 30 | 50 | 100>(50);
  const [randomChar, setRandomChar] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      playSound('buzzer');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(300);
  };
  const setPreset = (mins: number) => {
    setIsActive(false);
    setTimeLeft(mins * 60);
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const generateNumber = () => {
    let steps = 0;
    const maxSteps = 12;
    const interval = setInterval(() => {
        setRandomNumber(Math.floor(Math.random() * numberRange) + 1);
        steps++;
        if (steps > maxSteps) {
            clearInterval(interval);
            playSound('bell');
        }
    }, 60);
  };

  const generateAlphabet = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let steps = 0;
    const maxSteps = 12;
    const interval = setInterval(() => {
        setRandomChar(alphabet[Math.floor(Math.random() * alphabet.length)]);
        steps++;
        if (steps > maxSteps) {
            clearInterval(interval);
            playSound('bell');
        }
    }, 60);
  };

  const playSound = (type: 'applause' | 'bell' | 'buzzer' | 'great' | 'wrong') => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const vol = settings.volume / 100;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);
    
    if (type === 'bell') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'buzzer') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'applause') {
        const duration = 2.0;
        const numberOfClaps = 120;
        for (let i = 0; i < numberOfClaps; i++) {
            const timeOffset = Math.random() * duration;
            const burstTime = now + timeOffset;
            const bufferSize = ctx.sampleRate * (0.05 + Math.random() * 0.05);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize / 3));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600 + Math.random() * 2000, burstTime);
            filter.Q.setValueAtTime(1.0, burstTime);
            const gain = ctx.createGain();
            const strength = (0.2 + Math.random() * 0.8) * (1 - timeOffset / duration);
            gain.gain.setValueAtTime(strength, burstTime);
            gain.gain.exponentialRampToValueAtTime(0.001, burstTime + bufferSize/ctx.sampleRate);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            noise.start(burstTime);
        }
    } else if (type === 'great') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.5, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.15);
        });
    }
  };

  const navBtnStyle = `w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all`;
  const optionButtonStyle = `flex-1 py-1.5 md:py-2 border-2 border-slate-900 font-['Press_Start_2P'] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all rounded-lg font-semibold`;

  const tabs = [
    { id: 'timer', icon: Clock, label: 'TIMER' },
    { id: 'number', icon: Hash, label: 'NUMBER' },
    { id: 'alphabet', icon: Type, label: 'ALPHABET' },
    { id: 'sound', icon: Volume2, label: 'SOUND' },
  ];

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 pb-20 font-sans relative">
      {/* Standardized Header Navigation */}
      <div className="flex items-center justify-between w-full relative h-14 mb-12">
          <button onClick={onClose} className={navBtnStyle}>
              <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            <h2 className={`text-[10px] md:text-sm font-['Press_Start_2P'] uppercase ${isDark ? 'text-yellow-400' : 'text-slate-800'}`}>
                {t.tools}
            </h2>
          </div>

          <div className="w-12 flex justify-end">
            <Wrench className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-slate-800'}`} />
          </div>
      </div>

      <div className={`w-full border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex flex-col h-[75vh] md:h-[80vh] overflow-hidden ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
        
        {/* Tabs */}
        <div className="grid grid-cols-4 border-b-4 border-slate-900 shrink-0 h-24 md:h-28">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex flex-col items-center justify-center py-2 border-r-2 last:border-r-0 border-slate-900 transition-all ${
                        activeTab === tab.id
                        ? 'bg-yellow-400 text-slate-900'
                        : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500 hover:bg-white'
                    }`}
                >
                    <tab.icon className={`w-6 h-6 md:w-8 md:h-8 mb-1 transition-transform ${activeTab === tab.id ? 'scale-105' : ''}`} />
                    <span className="text-[7px] md:text-[9px] font-semibold font-['Press_Start_2P'] uppercase text-center w-full px-0.5 leading-tight tracking-tighter overflow-hidden">
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 md:p-6 flex flex-col items-center justify-center overflow-y-auto bg-slate-500/5 custom-scrollbar">
            {activeTab === 'timer' && (
                <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 py-4">
                    <div className="flex w-full gap-2 mb-4">
                        {[1, 3, 5, 10].map((m) => (
                            <button
                                key={m}
                                onClick={() => setPreset(m)}
                                className={`${optionButtonStyle} text-[10px] md:text-[14px] ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}
                            >
                                {m}M
                            </button>
                        ))}
                    </div>

                    <div className="text-6xl md:text-7xl font-semibold mb-6 tabular-nums tracking-tighter text-red-500 font-mono bg-black rounded-2xl p-6 shadow-inner border-4 border-slate-700 w-full text-center leading-none">
                        {formatTime(timeLeft)}
                    </div>

                    <div className="flex w-full gap-3 font-semibold font-['Press_Start_2P'] uppercase text-[12px] md:text-[16px]">
                        <button
                            onClick={toggleTimer}
                            className={`flex-1 py-4 rounded-xl shadow-lg border-2 border-slate-900 transition-all active:scale-95 ${
                                isActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                            }`}
                        >
                            {isActive ? 'STOP' : 'START'}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="flex-1 py-4 rounded-xl shadow-lg border-2 border-slate-900 transition-all active:scale-95 bg-yellow-400 text-slate-900"
                        >
                            RESET
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'number' && (
                <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 py-2">
                    <div className="flex w-full gap-2 mb-3">
                        {( [20, 30, 50, 100] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setNumberRange(range)}
                                className={`${optionButtonStyle} text-[9px] md:text-[13px] ${
                                    numberRange === range ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                ~{range}
                            </button>
                        ))}
                    </div>

                    <div className="h-28 w-28 md:h-40 md:w-40 flex items-center justify-center rounded-[1.5rem] mb-5 bg-black text-white shadow-inner border-4 border-slate-700">
                        <div className="text-4xl md:text-5xl font-semibold font-['Press_Start_2P'] text-blue-400 leading-none flex items-center justify-center">
                            {randomNumber !== null ? randomNumber : '?'}
                        </div>
                    </div>
                    
                    <button
                        onClick={generateNumber}
                        className="w-full max-w-[180px] bg-blue-600 text-white py-3 rounded-xl border-2 border-slate-900 shadow-lg active:scale-95 font-semibold font-['Press_Start_2P'] uppercase text-[12px] md:text-[16px]"
                    >
                        GENERATE
                    </button>
                </div>
            )}

            {activeTab === 'alphabet' && (
                <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 py-4">
                    <div className="h-32 w-32 md:h-40 md:w-40 flex items-center justify-center rounded-[1.5rem] mb-6 bg-black text-white shadow-inner border-4 border-slate-700">
                        <div className="text-4xl md:text-5xl font-semibold font-['Press_Start_2P'] text-purple-400 leading-none flex items-center justify-center">
                            {randomChar !== null ? randomChar : '?'}
                        </div>
                    </div>
                    <button
                        onClick={generateAlphabet}
                        className="w-full max-w-[180px] bg-purple-600 text-white py-3 rounded-xl border-2 border-slate-900 shadow-lg active:scale-95 font-semibold font-['Press_Start_2P'] uppercase text-[12px] md:text-[16px]"
                    >
                        GENERATE
                    </button>
                </div>
            )}

            {activeTab === 'sound' && (
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 py-4">
                    {[
                        { id: 'applause', label: 'APPLAUSE', color: 'bg-yellow-500', icon: PartyPopper },
                        { id: 'great', label: 'WINNER', color: 'bg-green-500', icon: Trophy },
                        { id: 'bell', label: 'BELL', color: 'bg-blue-500', icon: BellRing },
                        { id: 'buzzer', label: 'BUZZER', color: 'bg-red-500', icon: AlertCircle },
                    ].map((sound) => (
                        <button
                            key={sound.id}
                            onClick={() => playSound(sound.id as any)}
                            className={`${sound.color} text-white p-4 rounded-2xl shadow-md active:scale-95 transition-all border-2 border-slate-900 flex flex-col items-center justify-center gap-2 overflow-hidden group h-24 md:h-28 font-semibold`}
                        >
                            <sound.icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform mb-0.5" />
                            <span className="text-[9px] md:text-[11px] font-semibold font-['Press_Start_2P'] uppercase text-center w-full leading-tight truncate px-1 tracking-tighter">
                                {sound.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
