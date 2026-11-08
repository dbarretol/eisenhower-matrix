import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'eisenhower-matrix-theme';
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

const readSavedTheme = (): Theme | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === 'light' || saved === 'dark' ? saved : null;
    } catch {
        return null;
    }
};

// Follows the system setting until the user picks a theme, then remembers the choice.
export const useTheme = () => {
    const [savedTheme, setSavedTheme] = useState<Theme | null>(readSavedTheme);
    const [systemTheme, setSystemTheme] = useState<Theme>(() => (darkQuery().matches ? 'dark' : 'light'));
    const theme = savedTheme ?? systemTheme;

    useEffect(() => {
        const query = darkQuery();
        const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const setTheme = (next: Theme) => {
        setSavedTheme(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Storage unavailable; the choice lasts for this session only.
        }
    };

    return { theme, setTheme };
};
