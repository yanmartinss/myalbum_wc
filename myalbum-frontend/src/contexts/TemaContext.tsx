import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface TemaContextType {
  mode: ThemeMode;
  toggleTema: () => void;
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export const useTema = () => {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema deve ser usado dentro de TemaProvider');
  return ctx;
};

export const TemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tema');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('tema', mode);
  }, [mode]);

  const toggleTema = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
            success: { main: '#16a34a', light: 'rgba(22,163,74,0.1)', dark: '#15803d' },
            error: { main: '#dc2626', light: 'rgba(220,38,38,0.1)', dark: '#b91c1c' },
            warning: { main: '#d97706', light: 'rgba(217,119,6,0.1)', dark: '#b45309' },
            background: { default: '#f8f9fa', paper: '#ffffff' },
            text: { primary: '#212529', secondary: '#6c757d', disabled: '#adb5bd' },
          }
        : {
            primary: { main: '#60a5fa', light: '#93bbfc', dark: '#2563eb' },
            success: { main: '#34d399', light: 'rgba(52,211,153,0.12)', dark: '#059669' },
            error: { main: '#f87171', light: 'rgba(248,113,113,0.12)', dark: '#dc2626' },
            warning: { main: '#fbbf24', light: 'rgba(251,191,36,0.12)', dark: '#d97706' },
            background: { default: '#111318', paper: '#1a1d27' },
            text: { primary: '#e8ecf4', secondary: '#8892b0', disabled: '#5a6480' },
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: '"Inter", sans-serif',
            WebkitFontSmoothing: 'antialiased',
          },
          '*, *::before, *::after': {
            transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
          },
          '::-webkit-scrollbar': { width: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: mode === 'light' ? '#dee2e6' : '#2e3144',
            borderRadius: 3,
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: mode === 'light' ? '#adb5bd' : '#5a6480',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { minHeight: 40 },
        },
      },
    },
  }), [mode]);

  return (
    <TemaContext.Provider value={{ mode, toggleTema }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TemaContext.Provider>
  );
};
