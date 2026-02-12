
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, FileJson, FileSpreadsheet, Lock, AlertCircle, Database, Check, Layers, Image as ImageIcon, Loader2, Play } from 'lucide-react';
import { AppSettings, GameRecommendation, CatalogGame } from '../types';
import { FAMOUS_GAMES } from '../constants';
import { fetchAllCatalogGames, getGamesWithoutImages, updateGameImage } from '../services/catalogService';
import { generateSecureImage } from '../services/imageProxyService';

interface Props {
  onBack: () => void;
  settings: AppSettings;
  favorites: GameRecommendation[];
  history: GameRecommendation[];
}

type DataSource = 'Catalog' | 'Internal' | 'Favorite' | 'History';

const escapeCSV = (val: string) => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

export const Screen11_AdminExport: React.FC<Props> = ({ onBack, settings, favorites, history }) => {
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource>('Catalog');
  const [catalogGames, setCatalogGames] = useState<CatalogGame[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  
  // Batch Image State
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const isDark = settings.darkMode;
  const MASTER_CODE = '042905140930';

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    document.title = "Admin Portal | ESL Game Lab";
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && source === 'Catalog') {
      loadCatalog();
    }
  }, [isAuthenticated, source]);

  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const games = await fetchAllCatalogGames();
      setCatalogGames(games);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode.trim() === MASTER_CODE) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError("INVALID SECURITY CODE");
    }
  };

  const runImageBatch = async () => {
    if (isBatchRunning) return;
    setIsBatchRunning(true);
    setBatchLogs(["Starting image batch process..."]);
    
    try {
      const targets = await getGamesWithoutImages(10); // 10개씩 배치
      setBatchProgress({ current: 0, total: targets.length });
      
      if (targets.length === 0) {
        setBatchLogs(prev => [...prev, "No games need image generation."]);
        setIsBatchRunning(false);
        return;
      }

      for (let i = 0; i < targets.length; i++) {
        const game = targets[i];
        setBatchLogs(prev => [...prev, `Generating for: ${game.game_title}...`]);
        
        try {
          const imageUrl = await generateSecureImage({
            prompt: game.game_title,
            gameId: game.id,
            season: game.season
          });
          
          await updateGameImage(game.id, imageUrl);
          setBatchLogs(prev => [...prev, `✓ Success: ${game.game_title}`]);
        } catch (err: any) {
          setBatchLogs(prev => [...prev, `✗ Failed: ${game.game_title} - ${err.message}`]);
        }
        
        setBatchProgress(prev => ({ ...prev, current: i + 1 }));
        // API Rate Limit 방지를 위한 지연
        await new Promise(r => setTimeout(r, 2000));
      }
      
      setBatchLogs(prev => [...prev, "Batch process finished."]);
      loadCatalog(); // 새로고침
    } catch (e) {
      console.error(e);
      setBatchLogs(prev => [...prev, "Critical error during batch."]);
    } finally {
      setIsBatchRunning(false);
    }
  };

  const getExportData = (): any[] => {
    if (source === 'Catalog') return catalogGames;
    if (source === 'Internal') return FAMOUS_GAMES.map(g => ({ title: g.title, tags: ['internal'], description: g.tip }));
    if (source === 'Favorite') return favorites;
    if (source === 'History') return history;
    return [];
  };

  const exportJSON = () => {
    const data = getExportData();
    const fileName = `esl_game_lab_${source.toLowerCase()}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const data = getExportData();
    const headers = ["id", "title", "skill", "tags", "description", "imageUrl", "source", "season"];
    
    const rows = data.map(item => {
      const title = item.game_title || item.title || "";
      const id = item.id || title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const skill = item.skill || (item.tags ? item.tags[0] : "");
      return [
        escapeCSV(id),
        escapeCSV(title),
        escapeCSV(skill),
        escapeCSV(Array.isArray(item.tags) ? item.tags.join(',') : ""),
        escapeCSV(item.game_description || item.description || item.thumbnail_image || ""),
        escapeCSV(item.imageUrl || ""),
        escapeCSV(item.source || "legacy"),
        escapeCSV(item.season || "")
      ].join(',');
    });
    
    const content = [headers.join(','), ...rows].join('\n');
    const fileName = `esl_game_lab_${source.toLowerCase()}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.csv`;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-[80vh] flex items-center justify-center p-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-sm p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex p-4 bg-red-100 text-red-600 rounded-full border-2 border-black"><Lock className="w-10 h-10" /></div>
            <h1 className="text-sm font-['Press_Start_2P'] uppercase text-red-500">Security Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className={`w-full px-4 py-4 border-2 border-black rounded-xl text-center font-mono tracking-widest text-xl focus:outline-none ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="••••••••" autoComplete="off" />
            {error && <p className="text-red-500 text-[9px] font-bold text-center font-['Press_Start_2P']">{error}</p>}
            <button type="submit" className="w-full py-4 bg-red-600 text-white font-['Press_Start_2P'] text-[10px] uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5">Authorize</button>
          </form>
          <button onClick={onBack} className="w-full mt-6 text-[10px] opacity-40 hover:underline font-bold uppercase">Cancel</button>
        </div>
      </div>
    );
  }

  const exportData = getExportData();
  const seasonStats = catalogGames.reduce((acc: any, g) => {
    if (g.season) acc[g.season] = (acc[g.season] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-8">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-12 h-12 text-green-500" />
            <div>
              <h1 className="text-xl md:text-2xl font-['Press_Start_2P'] text-green-500 uppercase leading-tight">Admin Console</h1>
              <p className="text-xs font-bold opacity-60 uppercase">System Maintenance & Global Catalog</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 border-2 border-black bg-slate-200 text-slate-700 text-[9px] font-['Press_Start_2P'] uppercase rounded-lg">Lock</button>
             <button onClick={onBack} className="px-4 py-2 border-2 border-black bg-white text-black text-[9px] font-['Press_Start_2P'] uppercase rounded-lg">Exit</button>
          </div>
        </div>

        {/* Action Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
             <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-blue-500" />
                <h2 className="text-[10px] font-['Press_Start_2P'] uppercase">Select Source</h2>
             </div>
             <div className="grid grid-cols-2 gap-2">
                {['Catalog', 'Internal', 'Favorite', 'History'].map(s => (
                  <button key={s} onClick={() => setSource(s as DataSource)} className={`py-2 text-[9px] font-bold border-2 border-black rounded-lg transition-all ${source === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {s}
                  </button>
                ))}
             </div>
             <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between items-center">
                <span className="text-[8px] font-bold font-['Press_Start_2P'] uppercase">Records</span>
                <span className="text-2xl font-black font-['Press_Start_2P']">{exportData.length}</span>
             </div>
          </div>

          <div className={`p-6 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:col-span-2 bg-blue-600 text-white`}>
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    <h2 className="text-[10px] font-['Press_Start_2P'] uppercase">Export {source}</h2>
                </div>
                {isLoadingCatalog && <Loader2 className="w-5 h-5 animate-spin" />}
             </div>
             <div className="flex flex-wrap gap-4">
                <button onClick={exportJSON} className="flex-1 min-w-[140px] py-4 bg-white text-blue-600 border-2 border-black rounded-xl font-bold font-['Press_Start_2P'] text-[9px] uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-0.5">Download JSON</button>
                <button onClick={exportCSV} className="flex-1 min-w-[140px] py-4 bg-white text-green-600 border-2 border-black rounded-xl font-bold font-['Press_Start_2P'] text-[9px] uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-0.5">Download CSV</button>
             </div>
          </div>
        </div>

        {/* Automation Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 border-4 border-black rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    <h2 className="text-[10px] font-['Press_Start_2P'] uppercase">Image Batch Generator</h2>
                </div>
                <button 
                  onClick={runImageBatch} 
                  disabled={isBatchRunning}
                  className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[8px] font-['Press_Start_2P'] active:translate-y-0.5 disabled:opacity-50`}
                >
                  {isBatchRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Run Batch (10)
                </button>
             </div>
             
             {isBatchRunning && (
               <div className="mb-4 bg-slate-900 rounded p-2 border border-slate-700">
                  <div className="flex justify-between text-[8px] text-white font-mono mb-1">
                    <span>PROGRESS</span>
                    <span>{batchProgress.current} / {batchProgress.total}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div>
                  </div>
               </div>
             )}

             <div className={`h-40 overflow-y-auto font-mono text-[9px] p-3 rounded border-2 border-black ${isDark ? 'bg-slate-900 text-green-500' : 'bg-slate-50 text-slate-700'}`}>
                {batchLogs.length === 0 ? "> Ready for processing..." : batchLogs.map((log, i) => <div key={i} className="mb-1">{">"} {log}</div>)}
             </div>
          </div>

          <div className={`p-6 border-4 border-black rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
              <h3 className="text-[9px] font-['Press_Start_2P'] uppercase mb-4 opacity-60">Global Catalog Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   {Object.entries(seasonStats).map(([s, count]) => (
                     <div key={s} className="flex justify-between items-center text-xs font-bold border-b border-slate-200 pb-1">
                        <span className="capitalize">{s}</span>
                        <span className="bg-blue-100 text-blue-600 px-2 rounded">{count as number}</span>
                     </div>
                   ))}
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-100 rounded-xl border-2 border-slate-900">
                   <Database className="w-8 h-8 text-blue-500 mb-2" />
                   <div className="text-[10px] font-['Press_Start_2P'] text-center">Cloud Storage<br/><span className="text-blue-600">Active</span></div>
                </div>
              </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className={`border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-4 bg-black text-white text-[9px] font-['Press_Start_2P'] uppercase flex justify-between">
            <span>Data Preview (Latest 20)</span>
            {isLoadingCatalog && <span className="animate-pulse">Loading Catalog...</span>}
          </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
               <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700 border-b-2 border-black">
                  <tr className="font-bold uppercase text-[10px]">
                     <th className="px-4 py-3">IMG</th>
                     <th className="px-4 py-3">Title</th>
                     <th className="px-4 py-3">Skill</th>
                     <th className="px-4 py-3">Season</th>
                     <th className="px-4 py-3">Source</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-black/10">
                  {exportData.slice(0, 20).map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-500/5">
                       <td className="px-4 py-2">
                          {item.imageUrl ? <div className="w-8 h-8 rounded border border-black overflow-hidden"><img src={item.imageUrl} className="w-full h-full object-cover" /></div> : <div className="w-8 h-8 bg-slate-200 rounded border border-slate-300"></div>}
                       </td>
                       <td className="px-4 py-2 font-bold">{item.game_title || item.title}</td>
                       <td className="px-4 py-2">{item.skill || (item.tags ? item.tags[0] : "-")}</td>
                       <td className="px-4 py-2 capitalize">{item.season || "-"}</td>
                       <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${item.source === 'internal' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{item.source || 'legacy'}</span></td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
