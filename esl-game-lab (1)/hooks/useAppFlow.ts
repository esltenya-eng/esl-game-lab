
import { useState, useCallback } from 'react';
import { AppScreen } from '../types';

/**
 * useAppFlow: Pure State-based navigation to avoid URL/Hash redirect issues in Preview environments.
 * This completely removes reliance on window.location and hashChange listeners.
 */
export const useAppFlow = (initialScreen: AppScreen = AppScreen.SELECTION) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(initialScreen);
  const [params, setParams] = useState<Record<string, string>>({});
  const [historyStack, setHistoryStack] = useState<Array<{screen: AppScreen, params: Record<string, string>}>>([
    { screen: initialScreen, params: {} }
  ]);

  const navigateTo = useCallback((screen: AppScreen, id?: string) => {
    const newParams = id ? { id } : {};
    setCurrentScreen(screen);
    setParams(newParams);
    setHistoryStack(prev => [...prev, { screen, params: newParams }]);
  }, []);

  const goBack = useCallback((e?: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    setHistoryStack(prev => {
      if (prev.length <= 1) {
        // Already at home or base, cannot go back further
        setCurrentScreen(initialScreen);
        setParams({});
        return [{ screen: initialScreen, params: {} }];
      }
      
      const newStack = [...prev];
      newStack.pop(); // Remove current
      const lastItem = newStack[newStack.length - 1];
      
      setCurrentScreen(lastItem.screen);
      setParams(lastItem.params);
      return newStack;
    });
  }, [initialScreen]);

  const resetToHome = useCallback(() => {
    setCurrentScreen(AppScreen.SELECTION);
    setParams({});
    setHistoryStack([{ screen: AppScreen.SELECTION, params: {} }]);
  }, []);

  return { currentScreen, params, navigateTo, goBack, resetToHome };
};
