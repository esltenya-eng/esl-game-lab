
import React, { useState } from 'react';
import { GameRecommendation, AppSettings } from '../types';
import { ArrowLeft, Heart, History, Trash2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  favorites: GameRecommendation[];
  history: GameRecommendation[];
  onSelectGame: (game: GameRecommendation) => void;
  onRemoveFavorite: (gameTitle: string) => void;
  onBack: () => void;
  onGoHome: () => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenTools: () => void;
}

export const Screen5_Favorites: React.FC<Props> = ({
  favorites,
  history,
  onSelectGame,
  onRemoveFavorite,
  onBack,
  settings,
}) => {
  const t = TRANSLATIONS[settings.language];
  const isDark = settings.darkMode;
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  const displayList = activeTab === 'favorites' ? favorites : history;
  const navBtnStyle = `w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-[#3b82f6] text-white transition-all`;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-20 relative font-sans">
      {/* Standardized Header Navigation */}
      <div className="flex items-center justify-between w-full relative h-14 mb-12">
          <button onClick={onBack} className={navBtnStyle}>
              <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            <h2 className={`text-[10px] md:text-sm font-['Press_Start_2P'] uppercase ${isDark ? 'text-yellow-400' : 'text-slate-800'}`}>
                {t.favorites}
            </h2>
          </div>

          <div className="w-12 flex justify-end">
            <Heart className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-slate-800'}`} />
          </div>
      </div>

      <div className="flex items-center space-x-4 px-2 font-['Press_Start_2P'] text-[10px] uppercase">
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-4 border-4 border-black transition-all ${
                activeTab === 'favorites' 
                ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                : isDark ? 'bg-gray-800 text-gray-500 hover:bg-gray-700' : 'bg-gray-200 text-gray-500 hover:bg-white'
            }`}
          >
              <Heart className="w-4 h-4 inline-block mr-2 -mt-1" />
              FAVORITES
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 border-4 border-black transition-all ${
                activeTab === 'history' 
                ? 'bg-blue-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                : isDark ? 'bg-gray-800 text-gray-500 hover:bg-gray-700' : 'bg-gray-200 text-gray-500 hover:bg-white'
            }`}
          >
              <History className="w-4 h-4 inline-block mr-2 -mt-1" />
              HISTORY
          </button>
      </div>

      {displayList.length === 0 ? (
        <div className={`text-center py-20 border-4 border-dashed ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-400 text-gray-500'}`}>
          <div className="mb-4">
              {activeTab === 'favorites' ? <Heart className="w-12 h-12 mx-auto" /> : <History className="w-12 h-12 mx-auto" />}
          </div>
          <p className="font-['Press_Start_2P'] text-xs mb-2">EMPTY SLOT</p>
          <p className="font-['VT323'] text-xl uppercase">
            {activeTab === 'favorites' ? "SAVE YOUR BEST GAMES!" : "PLAY SOME GAMES FIRST!"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {displayList.map((game) => (
            <div
              key={game.game_title}
              onClick={() => onSelectGame(game)}
              className={`w-full p-5 border-4 border-black relative cursor-pointer group transition-all hover:-translate-y-1 active:translate-y-0.5 active:shadow-none ${
                  isDark 
                  ? 'bg-gray-800 hover:bg-gray-750 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-white hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <div className="flex flex-col space-y-3 pr-10">
                 <h3 className={`text-xl font-['Press_Start_2P'] leading-tight ${isDark ? 'text-green-400' : 'text-blue-800'}`}>
                    {game.game_title}
                 </h3>
                 <div className="flex flex-wrap gap-2 items-center">
                    {game.tags && game.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className={`text-sm font-['VT323'] px-1.5 py-0.5 uppercase border-2 font-bold ${
                            isDark ? 'text-gray-300 border-gray-600 bg-gray-900' : 'text-gray-600 border-gray-300 bg-slate-50'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                 </div>
              </div>

              {activeTab === 'favorites' && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(game.game_title);
                    }}
                    className="absolute top-4 right-4 p-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white text-red-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                    title="Remove"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
