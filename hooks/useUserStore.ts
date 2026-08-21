
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings, GameRecommendation, UserProfile, SupportedLanguage } from '../types';
import { HISTORY_LIMIT } from '../constants';
import { auth, db, googleProvider } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  getRedirectResult,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc,
  collection, 
  getDocs, 
  deleteDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const STORAGE_KEYS = {
  SETTINGS: 'eslgamelab_settings',
  LANGUAGE_GUEST: 'eslgamelab_language_guest',
  FAVORITES_GUEST: 'eslgamelab_favorites_guest',
  HISTORY: 'eslgamelab_history',
};

// Validate data from Firestore matches GameRecommendation interface
const isValidGameRecommendation = (data: any): data is GameRecommendation => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.ranking === 'number' &&
    typeof data.game_title === 'string' &&
    Array.isArray(data.tags) &&
    typeof data.thumbnail_image === 'string' &&
    typeof data.summary_en === 'string'
  );
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  volume: 100,
  fontSize: 'medium',
  language: 'ko'
};

const getGameId = (title: string) => {
  return title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
};

const getUserFavKey = (uid: string) => `eslgamelab_favorites_${uid}`;

export const useUserStore = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const guestLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE_GUEST);
    
    let initialSettings = saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS };
    if (guestLang) {
      initialSettings.language = guestLang as SupportedLanguage;
    }
    return initialSettings;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  
  const manualUpdateRef = useRef<number>(0);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    manualUpdateRef.current = Date.now();

    if (auth?.currentUser && db) {
      try {
        await setDoc(doc(db, `users/${auth.currentUser.uid}/preferences`, "settings"), {
          language: newSettings.language,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("LANG: Cloud save failed", e);
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE_GUEST, newSettings.language);
    }
  }, []);

  const syncFromFirestore = useCallback(async (uid: string) => {
    if (!db) return; // Firebase unavailable this session -- stay on local/guest data
    if (Date.now() - manualUpdateRef.current < 5000) return;

    setSyncStatus('syncing');
    try {
      const favsCol = collection(db, `users/${uid}/favorites`);
      const snapshot = await getDocs(favsCol);
      const cloudFavs = snapshot.docs
        .map(doc => doc.data())
        .filter(isValidGameRecommendation);
      setFavorites(cloudFavs);
      localStorage.setItem(getUserFavKey(uid), JSON.stringify(cloudFavs));

      const prefDoc = await getDoc(doc(db, `users/${uid}/preferences`, "settings"));
      if (prefDoc.exists()) {
        const cloudLang = prefDoc.data().language as SupportedLanguage;
        setSettings(prev => ({ ...prev, language: cloudLang }));
      }
      
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error("ESL GAME LAB: Sync failure:", error);
    }
  }, []);

  const [favorites, setFavorites] = useState<GameRecommendation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES_GUEST);
    return saved ? JSON.parse(saved) : [];
  });

  // 구글 로그인 함수 강화
  const signInWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      throw { code: 'auth/unavailable', message: 'Sign-in is temporarily unavailable.' };
    }
    setIsAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Google sign-in successful
      return result;
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.code);
      throw error; // UI에서 처리하도록 에러 전파
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      if (auth) await signOut(auth);
      setCurrentUser(null);
      setSyncStatus('idle');
    } catch (error) {
      console.error("ESL GAME LAB: Sign-Out error:", error);
    }
  }, []);

  useEffect(() => {
    // Firebase failed to initialize this session -- stay in guest mode
    // (game browsing works fine without it) instead of spinning forever.
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }

    // Track if this is the first auth state change to avoid redundant syncs
    let isInitialLoad = true;

    // 1. 리다이렉트 결과 체크 (로그인 창 떴다 사라지는 문제 해결용)
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect Result Error:", error.code);
    });

    // 2. 인증 상태 리스너
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: user.providerData[0]?.providerId || 'google'
        };
        // User authenticated
        setCurrentUser(profile);

        // Only sync from Firestore on initial load if we don't have cached data
        const cachedFavs = localStorage.getItem(getUserFavKey(user.uid));
        if (!cachedFavs || !isInitialLoad) {
          await syncFromFirestore(user.uid);
        }

        // Update last seen timestamp (lightweight operation)
        if (db) {
          setDoc(doc(db, "users", user.uid), {
              ...profile,
              lastSeen: serverTimestamp()
          }, { merge: true }).catch(err => console.error("Failed to update lastSeen:", err));
        }
      } else {
        setCurrentUser(null);
        // User signed out
      }
      setIsAuthLoading(false);
      isInitialLoad = false;
    });
    return () => unsubscribe();
  }, [syncFromFirestore]);

  const toggleFavorite = useCallback(async (game: GameRecommendation) => {
    setFavorites(prev => {
      const exists = prev.find(g => g.game_title === game.game_title);
      const updated = exists 
        ? prev.filter(g => g.game_title !== game.game_title)
        : [...prev, game];
      
      if (auth?.currentUser && db) {
        localStorage.setItem(getUserFavKey(auth.currentUser.uid), JSON.stringify(updated));
        const gameId = getGameId(game.game_title);
        const favRef = doc(db, `users/${auth.currentUser.uid}/favorites`, gameId);
        if (exists) {
            deleteDoc(favRef).catch(e => console.error("Cloud delete fail", e));
        } else {
            setDoc(favRef, {
                ...game,
                game_id: gameId,
                savedAt: serverTimestamp()
            }).catch(e => console.error("Cloud save fail", e));
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.FAVORITES_GUEST, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((gameTitle: string) => {
    setFavorites(prev => {
        const game = prev.find(g => g.game_title === gameTitle);
        if (game) {
            const updated = prev.filter(g => g.game_title !== gameTitle);
            if (auth?.currentUser && db) {
                localStorage.setItem(getUserFavKey(auth.currentUser.uid), JSON.stringify(updated));
                const gameId = getGameId(gameTitle);
                const favRef = doc(db, `users/${auth.currentUser.uid}/favorites`, gameId);
                deleteDoc(favRef).catch(e => console.error("Cloud delete fail", e));
            } else {
                localStorage.setItem(STORAGE_KEYS.FAVORITES_GUEST, JSON.stringify(updated));
            }
            return updated;
        }
        return prev;
    });
  }, []);

  const [history, setHistory] = useState<GameRecommendation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = useCallback((game: GameRecommendation) => {
    setHistory(prev => {
      const filtered = prev.filter(g => g.game_title !== game.game_title);
      const updated = [game, ...filtered].slice(0, HISTORY_LIMIT);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    settings,
    updateSettings,
    favorites,
    toggleFavorite,
    removeFavorite,
    history,
    addToHistory,
    currentUser,
    isAuthLoading,
    syncStatus,
    signInWithGoogle,
    signOutUser
  };
};
