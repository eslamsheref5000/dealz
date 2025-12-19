"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Country = {
    id: string;
    name: string;
    currency: string;
    cities: string[];
    flag: string;
    phoneCode: string;
};

export const countries: Country[] = [
    {
        id: 'UAE',
        name: 'United Arab Emirates',
        currency: 'AED',
        cities: [
            'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'
        ],
        flag: '🇦🇪',
        phoneCode: '+971'
    },
    {
        id: 'Egypt',
        name: 'Egypt',
        currency: 'EGP',
        cities: [
            'Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura',
            'El-Mahalla El-Kubra', 'Tanta', 'Asyut', 'Ismailia', 'Fayyum', 'Zagazig', 'Aswan', 'Damietta',
            'Damanhur', 'Minya', 'Beni Suef', 'Qena', 'Sohag', 'Hurghada', '6th of October', 'Shibin El Kom',
            'Banha', 'Kafr el-Sheikh', 'Arish', 'Mallawi', '10th of Ramadan', 'Bilbais', 'Marsa Matruh',
            'Idfu', 'Mit Ghamr', 'Al-Hamidiyya', 'Desouk', 'Qalyub', 'Abu Kabir', 'Kafr el-Dawwar',
            'Girga', 'Akhmim', 'Matareya'
        ],
        flag: '🇪🇬',
        phoneCode: '+20'
    },
    {
        id: 'KSA',
        name: 'Saudi Arabia',
        currency: 'SAR',
        cities: [
            'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Ta\'if', 'Tabuk', 'Buraydah',
            'Khamis Mushait', 'Abha', 'Al-Khobar', 'Jubail', 'Hail', 'Najran', 'Yanbu'
        ],
        flag: '🇸🇦',
        phoneCode: '+966'
    }
];

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
                const countryMap: { [key: string]: string } = {
                    'United Arab Emirates': 'UAE',
                    'Egypt': 'Egypt',
                    'Saudi Arabia': 'KSA'
                };
                const detectedId = countryMap[data.country_name];
                if (detectedId) {
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
