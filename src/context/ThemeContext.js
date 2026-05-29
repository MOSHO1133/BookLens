import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIGHT_COLORS = {
    mode: 'light',
    primary: '#1a1a2e',
    secondary: '#0f3460',
    accent: '#4ade80',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    success: '#0f6e56',
    successLight: '#e8f5ee',
    warning: '#854F0B',
    warningLight: '#FAEEDA',
    danger: '#993C1D',
    dangerLight: '#FAECE7',
    white: '#ffffff',
    tabBar: '#ffffff',
    inputBg: '#ffffff',
};

export const DARK_COLORS = {
    mode: 'dark',
    primary: '#7c3aed',
    secondary: '#4c1d95',
    accent: '#4ade80',
    background: '#0f0f1a',
    card: '#1a1a2e',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#2d2d3d',
    success: '#10b981',
    successLight: '#0d2e1f',
    warning: '#f59e0b',
    warningLight: '#2d1e05',
    danger: '#ef4444',
    dangerLight: '#2d0a0a',
    white: '#1a1a2e',
    tabBar: '#0d0d1a',
    inputBg: '#1a1a2e',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(LIGHT_COLORS);

    useEffect(() => {
        AsyncStorage.getItem('booklens_theme').then(val => {
            if (val === 'dark') setTheme(DARK_COLORS);
        });
    }, []);

    const toggleTheme = async () => {
        const next = theme.mode === 'light' ? DARK_COLORS : LIGHT_COLORS;
        setTheme(next);
        await AsyncStorage.setItem('booklens_theme', next.mode);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme.mode === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);