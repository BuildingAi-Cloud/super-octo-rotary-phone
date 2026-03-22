import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

export const UiModeSwitch = () => {
  const { uiMode, setUiMode } = useTheme();
  return (
    <button onClick={() => setUiMode(uiMode === 'full' ? 'simple' : 'full')}>
      Switch to {uiMode === 'full' ? 'Simple' : 'Full'} UI
    </button>
  );
};
