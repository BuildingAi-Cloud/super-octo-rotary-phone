import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type UiMode = 'full' | 'simple';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [uiMode, setUiMode] = useState<UiMode>('full');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, uiMode, setUiMode }}>
      <div data-theme={theme} data-ui-mode={uiMode}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
