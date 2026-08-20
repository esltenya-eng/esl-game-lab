
import { useState, useCallback, useEffect, useRef } from 'react';
import { AppScreen } from '../types';

/**
 * useAppFlow: State-based navigation with browser History API integration.
 *
 * - navigateTo  → pushes a history entry so the browser back button works
 * - goBack      → pops our internal stack AND the browser entry
 * - popstate    → triggered by browser back; mirrors the stack pop
 * - Cold-open support: if the app loads at /game/<id>, currentScreen starts at
 *   DETAIL and coldOpenGameId is set so App.tsx can fetch from Firestore.
 */

const parsePath = (): { screen: AppScreen; gameId: string | null } => {
  const path = window.location.pathname;
  const match = path.match(/^\/game\/([^/]+)/);
  if (match) return { screen: AppScreen.DETAIL, gameId: match[1] };
  return { screen: AppScreen.SELECTION, gameId: null };
};

export const useAppFlow = (initialScreen: AppScreen = AppScreen.SELECTION) => {
  const parsed = parsePath();
  const coldStartScreen = parsed.screen;
  const coldOpenGameIdInitial = parsed.gameId;

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(coldStartScreen);
  const [params, setParams] = useState<Record<string, string>>(
    coldOpenGameIdInitial ? { id: coldOpenGameIdInitial } : {}
  );
  const [historyStack, setHistoryStack] = useState<Array<{screen: AppScreen, params: Record<string, string>}>>(
    coldStartScreen === AppScreen.DETAIL && coldOpenGameIdInitial
      ? [
          { screen: AppScreen.SELECTION, params: {} },
          { screen: AppScreen.DETAIL, params: { id: coldOpenGameIdInitial } }
        ]
      : [{ screen: initialScreen, params: {} }]
  );

  const [coldOpenGameId] = useState<string | null>(coldOpenGameIdInitial);

  // Prevents the popstate listener from double-handling a back triggered by goBack()
  const skipNextPopState = useRef(false);

  // Claim the initial browser history entry for the SPA
  useEffect(() => {
    if (coldStartScreen === AppScreen.DETAIL && coldOpenGameIdInitial) {
      // Replace with the clean game URL so the back-stack is correct
      window.history.replaceState({ appNav: true, screen: AppScreen.DETAIL }, '', `/game/${coldOpenGameIdInitial}`);
    } else {
      window.history.replaceState({ appNav: true }, '', '/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      if (skipNextPopState.current) {
        skipNextPopState.current = false;
        return;
      }
      // Pop our internal stack to mirror the browser navigation
      setHistoryStack(prev => {
        if (prev.length <= 1) {
          setCurrentScreen(AppScreen.SELECTION);
          setParams({});
          return [{ screen: AppScreen.SELECTION, params: {} }];
        }
        const newStack = [...prev];
        newStack.pop();
        const last = newStack[newStack.length - 1];
        setCurrentScreen(last.screen);
        setParams(last.params);
        return newStack;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((screen: AppScreen, id?: string) => {
    const newParams = id ? { id } : {};
    setCurrentScreen(screen);
    setParams(newParams);
    setHistoryStack(prev => [...prev, { screen, params: newParams }]);

    const url = screen === AppScreen.DETAIL && id ? `/game/${id}` : '/';
    window.history.pushState({ appNav: true, screen, params: newParams }, '', url);
  }, []);

  const goBack = useCallback((e?: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    setHistoryStack(prev => {
      if (prev.length <= 1) {
        skipNextPopState.current = false;
        setCurrentScreen(AppScreen.SELECTION);
        setParams({});
        window.history.replaceState({ appNav: true }, '', '/');
        return [{ screen: AppScreen.SELECTION, params: {} }];
      }

      const newStack = [...prev];
      newStack.pop();
      const last = newStack[newStack.length - 1];
      setCurrentScreen(last.screen);
      setParams(last.params);

      // Keep browser history in sync; suppress the resulting popstate
      skipNextPopState.current = true;
      window.history.back();

      return newStack;
    });
  }, []);

  const resetToHome = useCallback(() => {
    setCurrentScreen(AppScreen.SELECTION);
    setParams({});
    setHistoryStack([{ screen: AppScreen.SELECTION, params: {} }]);
    // Replace current entry so the stack is clean from the browser's perspective
    window.history.replaceState({ appNav: true }, '', '/');
  }, []);

  return { currentScreen, params, coldOpenGameId, navigateTo, goBack, resetToHome };
};
