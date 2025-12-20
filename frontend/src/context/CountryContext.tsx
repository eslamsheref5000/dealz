"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { countries, Country } from '../data/countries';

export { countries }; // Re-export for convenience if needed, though direct import is better

interface CountryContextType {
    selectedCountry: Country;
    setCountry: (countryId: string) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);


export function CountryProvider({ children }: { children: ReactNode }) {
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);

    useEffect(() => {
        const stored = localStorage.getItem('selectedCountry');
        if (stored) {
            const found = countries.find(c => c.id === stored);
            if (found) setSelectedCountry(found);
            return;
        }

        // Automatic IP detection
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                // Map country codes/names to our IDs
                const countryMap: { [key: string]: string } = {
                    'AE': 'UAE', 'United Arab Emirates': 'UAE',
                    'EG': 'Egypt', 'Egypt': 'Egypt',
                    'SA': 'KSA', 'Saudi Arabia': 'KSA',
                    'LB': 'Lebanon', 'Lebanon': 'Lebanon',
                    'QA': 'Qatar', 'Qatar': 'Qatar',
                    'BH': 'Bahrain', 'Bahrain': 'Bahrain',
                    'OM': 'Oman', 'Oman': 'Oman',
                    'KW': 'Kuwait', 'Kuwait': 'Kuwait'
                };

                const detectedId = countryMap[data.country_code] || countryMap[data.country_name];

                if (detectedId) {
                    console.log("Auto-detected Country:", detectedId);
                    setCountry(detectedId);
                }
            })
            .catch(err => console.error("IP Geolocation failed:", err));
    }, []);

    const setCountry = (countryId: string) => {
        const found = countries.find(c => c.id === countryId);
        if (found) {
            setSelectedCountry(found);
            localStorage.setItem('selectedCountry', countryId);
            // Optional: Reload to clear specific state if needed
            // window.location.reload();
        }
    };

    return (
        <CountryContext.Provider value={{ selectedCountry, setCountry }}>
            {children}
        </CountryContext.Provider>
    );
}

export function useCountry() {
    const context = useContext(CountryContext);
    if (context === undefined) {
        throw new Error('useCountry must be used within a CountryProvider');
    }
    return context;
}
