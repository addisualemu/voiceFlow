"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'voiceflow-current-context';

interface CurrentContextValue {
  currentContext: string | null;
  setCurrentContext: (context: string | null) => void;
  isLoaded: boolean;
}

const CurrentContextContext = createContext<CurrentContextValue | undefined>(undefined);

/**
 * Provider component to manage current context selection across the app
 */
export function CurrentContextProvider({ children }: { children: ReactNode }) {
  const [currentContext, setCurrentContextState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCurrentContextState(stored);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when context changes
  const setCurrentContext = useCallback((context: string | null) => {
    setCurrentContextState(context);
    if (context === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, context);
    }
  }, []);

  return (
    <CurrentContextContext.Provider value={{ currentContext, setCurrentContext, isLoaded }}>
      {children}
    </CurrentContextContext.Provider>
  );
}

/**
 * Hook to access the current context selection
 */
export function useCurrentContext() {
  const context = useContext(CurrentContextContext);
  if (context === undefined) {
    throw new Error('useCurrentContext must be used within a CurrentContextProvider');
  }
  return context;
}
