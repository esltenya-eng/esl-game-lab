
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { GameRecommendation } from '../types';

interface Props {
  suggestion: GameRecommendation | null;
  isReady: boolean;
  onAutoFinish: () => void;
  isDark: boolean;
}

const getActivityEmoji = (key: string): string => {
  const mapping: Record<string, string> = {
    MUSIC: "🎵",
    LISTENING: "👂",
    SPEAKING: "🗣️",
    PRONUNCIATION: "👄",
    VOCABULARY: "📚",
    GRAMMAR: "🧩",
    READING: "📖",
    WRITING: "✍️",
    QUIZ: "💡",
    MEMORY: "🧠",
    SEARCH: "🔍",
    ART: "🎨",
    DEFAULT: "✨"
  };
  return mapping[key] || mapping.DEFAULT;
};

export const NeedIntroCard: React.FC<Props> = ({ 
  suggestion, 
  isReady,
  onAutoFinish,
  isDark 
}) => {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>(0);
  const finishTriggered = useRef(false);

  const CATEGORY_DATA = useMemo(() => ({
    MUSIC: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['dance', 'music', 'movement', 'tpr', 'freeze dance', 'action verb', 'gesture', 'run', 'jump', 'clap', 'stomp', 'mime', 'body', 'physical', 'stand up', 'sit down', 'simon says', 'charades', 'act it out'],
      strong: ['freeze dance', 'dance', 'music', 'movement', 'tpr']
    },
    LISTENING: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['listening', 'listen', 'audio', 'sound', 'dictation', 'follow the directions', 'comprehension', 'minimal pairs', 'whisper', 'telephone game', 'repeat after me', 'hear'],
      strong: ['listening', 'listen', 'audio', 'sound']
    },
    SPEAKING: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['speaking', 'say', 'talk', 'role-play', 'interview', 'conversation', 'debate', 'presentation', 'oral', 'describe', 'explain', 'storytelling'],
      strong: ['speaking', 'say', 'talk']
    },
    PRONUNCIATION: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['pronunciation', 'phonics', 'sounds', 'syllable', 'stress', 'intonation', 'rhyming', 'minimal pairs', 'blend', 'digraph', 'vowel', 'consonant'],
      strong: ['pronunciation', 'phonics', 'sounds', 'syllable']
    },
    VOCABULARY: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['vocabulary', 'word', 'words', 'spelling', 'letters', 'word scramble', 'anagram', 'unscramble', 'word search', 'crossword', 'hangman', 'bingo', 'synonym', 'antonym', 'match the word'],
      strong: ['vocabulary', 'word', 'words', 'spelling', 'letters']
    },
    GRAMMAR: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['grammar', 'sentence', 'tense', 'past', 'present', 'future', 'parts of speech', 'noun', 'verb', 'adjective', 'adverb', 'preposition', 'word order', 'scramble sentence', 'clause'],
      strong: ['grammar', 'sentence', 'tense']
    },
    READING: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['reading', 'story', 'passage', 'text', 'reader', 'book', 'comprehension questions', 'paragraph', 'dialogue'],
      strong: ['reading', 'story', 'passage', 'text', 'reader', 'book']
    },
    WRITING: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['writing', 'write', 'journal', 'paragraph writing', 'sentence writing', 'creative writing', 'fill in the blank', 'worksheet'],
      strong: ['writing', 'write']
    },
    QUIZ: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['quiz', 'trivia', 'question', 'multiple choice', 'true or false', 'jeopardy', 'kahoot', 'points', 'timed quiz'],
      strong: ['quiz', 'trivia', 'question']
    },
    MEMORY: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['memory', 'match', 'pairs', 'matching game', 'flip cards', 'concentration', 'matching pictures', 'matching words', 'match the pair'],
      strong: ['memory', 'match', 'pairs']
    },
    SEARCH: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['find', 'search', 'scavenger hunt', 'i spy', 'detective', 'clue', 'mystery', 'look around', 'classroom hunt'],
      strong: ['find', 'search']
    },
    ART: {
      label: 'PEDAGOGICAL CORE',
      keywords: ['drawing', 'draw', 'pictionary', 'sketch', 'picture', 'illustration'],
      strong: ['drawing', 'draw']
    }
  }), []);

  const gameContext = useMemo(() => {
    const defaultLabel = 'MODULE INITIALIZED';
    if (suggestion?.icon) return { emoji: suggestion.icon, label: defaultLabel };
    if (!suggestion) return { emoji: getActivityEmoji('DEFAULT'), label: defaultLabel };

    const title = suggestion.game_title.toLowerCase();
    const summary = (suggestion.summary_en || "").toLowerCase();
    const tags = (suggestion.tags || []).join(' ').toLowerCase();
    const fullText = `${title} ${summary} ${tags}`;

    let scores: Record<string, number> = {};
    Object.entries(CATEGORY_DATA).forEach(([key, cat]) => {
      const category = cat as any;
      let score = 0;
      category.keywords.forEach((kw: string) => {
        if (fullText.includes(kw)) {
          score += 2;
          if (category.strong.includes(kw)) score += 2; 
        }
      });
      scores[key] = score;
    });

    let bestKey = 'DEFAULT';
    let maxScore = 0;
    Object.entries(scores).forEach(([key, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestKey = key;
      }
    });

    return { emoji: getActivityEmoji(bestKey), label: (CATEGORY_DATA as any)[bestKey]?.label || defaultLabel };
  }, [suggestion, CATEGORY_DATA]);

  useEffect(() => {
    const updateProgress = () => {
      setProgress(prev => {
        if (isReady && suggestion && !finishTriggered.current) {
          finishTriggered.current = true;
          setTimeout(onAutoFinish, 120);
          return 100;
        }
        if (!isReady) {
          const increment = prev < 50 ? 0.6 : (prev < 90 ? 0.2 : 0.04);
          const next = prev + increment;
          return next >= 98 ? 98 : next;
        }
        return prev;
      });
      requestRef.current = requestAnimationFrame(updateProgress);
    };
    requestRef.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isReady, suggestion, onAutoFinish]);

  const progressBlocks = 12;
  const activeBlocks = Math.floor((progress / 100) * progressBlocks);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm font-sans animate-in fade-in duration-500">
      <div className="max-w-xl w-full p-4 flex flex-col items-center space-y-8">
        <div className="w-full aspect-[1.5/1] border-4 border-[#22c55e] rounded-xl flex flex-col items-center justify-center p-6 md:p-10 space-y-4 md:space-y-6 shadow-[0_0_20px_rgba(34,197,94,0.4)] bg-black text-white text-center">
            
            <div className="mb-4 animate-bounce flex items-center justify-center h-20 md:h-24 w-full">
                <div className="text-5xl md:text-7xl select-none">
                   {gameContext.emoji}
                </div>
            </div>

            <div className="space-y-2 w-full">
                <p className="text-[#22c55e] font-['Press_Start_2P'] text-[9px] md:text-[10px] uppercase tracking-widest">
                  {gameContext.label}
                </p>
                {/* Title: Removed line-clamp and truncation to ensure full title visibility via wrapping */}
                <h2 className="text-xl md:text-2xl font-['Press_Start_2P'] uppercase leading-tight px-2 break-words">
                    {suggestion?.game_title || "GAME ENGINE ACTIVE"}
                </h2>
            </div>

            {/* Summary: Removed line-clamp to allow text to fill the available space naturally without truncation */}
            <p className="text-xl md:text-2xl font-['VT323'] italic text-green-300 max-w-full px-4 leading-snug break-words">
                "{suggestion?.summary_en || "Syncing pedagogical sequence..."}"
            </p>

            <div className="w-full max-w-[240px] flex items-center justify-center gap-2 pt-2">
                {[...Array(progressBlocks)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-3 h-4 border border-slate-800 transition-colors duration-200 ${
                            i < activeBlocks 
                            ? 'bg-[#22c55e] shadow-[0_0_5px_rgba(34,197,94,0.8)]' 
                            : 'bg-slate-900/50' /* Improved inactive state visibility to show the grid slots */
                        }`}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
