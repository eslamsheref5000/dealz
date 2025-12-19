"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries, Locale, Direction } from '../i18n/dictionaries';

interface LanguageContextType {
    locale: Locale;
    direction: Direction;
    t: (key: string) => string;
    switchLanguage: (lang: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');
    const [direction, setDirection] = useState<Direction>('ltr');

    useEffect(() => {
        const stored = localStorage.getItem('locale') as Locale;
        const validLocales: Locale[] = ['en', 'ar', 'fr', 'hi', 'ur'];
        if (stored && validLocales.includes(stored)) {
            switchLanguage(stored);
        }
    }, []);

    const switchLanguage = (lang: Locale) => {
        setLocale(lang);
        const rtlLocales: Locale[] = ['ar', 'ur'];
        const dir = rtlLocales.includes(lang) ? 'rtl' : 'ltr';
        setDirection(dir);
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
        localStorage.setItem('locale', lang);
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let current: any = dictionaries[locale];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
        return current;
    };

    return (
        <LanguageContext.Provider value={{ locale, direction, t, switchLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
