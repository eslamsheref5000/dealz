"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ComparisonContextType {
    compareList: any[];
    addToCompare: (product: any) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("compareList");
        if (stored) {
            try {
                setCompareList(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse compareList");
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("compareList", JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product: any) => {
        if (compareList.length >= 4) {
            alert("You can only compare up to 4 products at a time.");
            return;
        }
        if (!compareList.find(p => p.documentId === product.documentId || p.id === product.id)) {
            setCompareList([...compareList, product]);
        }
    };

    const removeFromCompare = (id: string) => {
        setCompareList(compareList.filter(p => p.documentId !== id && p.id !== id));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    const isInCompare = (id: string) => {
        return compareList.some(p => p.documentId === id || p.id === id);
    };

    return (
        <ComparisonContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error("useComparison must be used within a ComparisonProvider");
    }
    return context;
}
