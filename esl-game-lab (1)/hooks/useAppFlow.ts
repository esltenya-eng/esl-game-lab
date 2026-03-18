
import { useState, useCallback, useEffect, useRef } from 'react';
import { AppScreen } from '../types';

/**
 * useAppFlow: State-based navigation with browser History API integration.
 *
 * - navigateTo  → pushes a history entry so the browser back button works
 * - goBack      → pops our internal stack AND the browser entry
 * - popstate    → triggered by browser back; mirrors the stack pop
 * - replaceState on mount so the very first entry is owned by the SPA
 *   (prevents the browser from navigating away on the first back press)
 */
export const useAppFlow = (initialScreen: AppScreen = AppScreen.SELECTION) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(initialScreen);
  const [params, setParams] = useState<Record<string, string>>({});
  const [historyStack, setHistoryStack] = useState<Array<{screen: AppScreen, params: Record<string, string>}>>([
    { screen: initialScreen, params: {} }
  ]);

  // Prevents the popstate listener from double-handling a back triggered by goBack()
  const skipNextPopState = useRef(false);

  // Claim the initial browser history entry for the SPA
  useEffect(() => {
    window.history.replaceState({ appNav: true }, '');
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
          setCurrentScreen(initialScreen);
          setParams({});
          return [{ screen: initialScreen, params: {} }];
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
  }, [initialScreen]);

  const navigateTo = useCallback((screen: AppScreen, id?: string) => {
    const newParams = id ? { id } : {};
    setCurrentScreen(screen);
    setParams(newParams);
    setHistoryStack(prev => [...prev, { screen, params: newParams }]);
    // Push to browser history so the back button navigates within the SPA
    window.history.pushState({ appNav: true, screen, params: newParams }, '');
  }, []);

  const goBack = useCallback((e?: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    setHistoryStack(prev => {
      if (prev.length <= 1) {
        skipNextPopState.current = false;
        setCurrentScreen(initialScreen);
        setParams({});
        return [{ screen: initialScreen, params: {} }];
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
  }, [initialScreen]);

  const resetToHome = useCallback(() => {
    setCurrentScreen(AppScreen.SELECTION);
    setParams({});
    setHistoryStack([{ screen: AppScreen.SELECTION, params: {} }]);
    // Replace current entry so the stack is clean from the browser's perspective
    window.history.replaceState({ appNav: true }, '');
  }, []);

  return { currentScreen, params, navigateTo, goBack, resetToHome };
};
