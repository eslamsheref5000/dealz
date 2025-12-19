"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoriteContextType {
    favorites: string[];
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('favorites');
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch (e) {
                console.error("Invalid favorites data");
            }
        }
    }, []);

    const toggleFavorite = (productId: string) => {
        setFavorites(prev => {
            const isFav = prev.includes(productId);
            const next = isFav
                ? prev.filter(id => id !== productId)
                : [...prev, productId];
            localStorage.setItem('favorites', JSON.stringify(next));
            return next;
        });
    };

    const isFavorite = (productId: string) => favorites.includes(productId);

    return (
        <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoriteContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoriteProvider');
    }
    return context;
}
