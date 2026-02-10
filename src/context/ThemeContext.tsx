"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const savedTheme = localStorage.getItem('ptms_theme') as Theme;
            if (savedTheme) {
                setTheme(savedTheme);
                document.documentElement.classList.toggle('light', savedTheme === 'light');
            }
        } catch (error) {
            console.error('Error loading theme from localStorage:', error);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('ptms_theme', newTheme);
            } catch (error) {
                console.error('Error saving theme to localStorage:', error);
            }
        }

        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
