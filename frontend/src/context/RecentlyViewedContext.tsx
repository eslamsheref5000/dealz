"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RecentlyViewedContextType {
    recentIds: string[];
    addToRecentlyViewed: (id: string) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
    recentIds: [],
    addToRecentlyViewed: () => { },
});

export const RecentlyViewedProvider = ({ children }: { children: ReactNode }) => {
    const [recentIds, setRecentIds] = useState<string[]>([]);

    useEffect(() => {
        // Load from localStorage
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
            setRecentIds(JSON.parse(stored));
        }
    }, []);

    const addToRecentlyViewed = (id: string) => {
        setRecentIds(prev => {
            // Remove if exists, then add to front (max 10)
            const filtered = prev.filter(item => item !== id);
            const updated = [id, ...filtered].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <RecentlyViewedContext.Provider value={{ recentIds, addToRecentlyViewed }}>
            {children}
        </RecentlyViewedContext.Provider>
    );
};

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
