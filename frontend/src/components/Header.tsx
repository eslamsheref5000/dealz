"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useCountry, countries } from "../context/CountryContext";

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const { t, locale, switchLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { selectedCountry, setCountry } = useCountry();
    const [isLangOpen, setIsLangOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.language-dropdown')) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        // Check for user in localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Invalid user data");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };

    return (
        <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-red-200 dark:shadow-red-900/20">
                        <svg
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-xl sm:text-2xl font-black tracking-tighter text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                        DEALZ<span className="text-red-600">.</span>
                    </span>
                </Link>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 sm:gap-4">

                    {/* Country - Hide on very small screens, show flag only on mobile */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300">
                        <span>{selectedCountry.flag}</span>
                        <span className="hidden md:inline">{selectedCountry.id}</span>
                    </div>

                    {/* Language - Click-based dropdown for better mobile support */}
                    <div className="relative language-dropdown">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="text-gray-600 dark:text-gray-300 hover:text-red-600 text-sm font-bold border border-gray-200 dark:border-gray-700 hover:border-red-200 rounded px-2 sm:px-3 py-1.5 transition-all flex items-center gap-1 bg-gray-50/50 dark:bg-gray-800/50"
                        >
                            <span>🌐</span>
                            <span className="hidden md:inline">
                                {locale === 'en' ? 'English' :
                                    locale === 'ar' ? 'العربية' :
                                        locale === 'fr' ? 'Français' :
                                            locale === 'hi' ? 'हिन्दी' :
                                                'اردو'}
                            </span>
                            <span className="text-[10px] opacity-50">▼</span>
                        </button>

                        {isLangOpen && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {[
                                    { id: 'en', label: 'English' },
                                    { id: 'ar', label: 'العربية' },
                                    { id: 'fr', label: 'Français' },
                                    { id: 'hi', label: 'हिन्दी' },
                                    { id: 'ur', label: 'اردو' }
                                ].map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => {
                                            switchLanguage(lang.id as any);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors ${locale === lang.id ? 'text-red-600 font-bold bg-red-50/50 dark:bg-red-900/10' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle - Small icon */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* User - Icon only on mobile */}
                            <Link href="/profile" className="font-bold text-gray-700 dark:text-gray-200 hover:text-red-600 transition flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    👤
                                </div>
                                <span className="hidden lg:inline">{user.username}</span>
                            </Link>

                            <Link href="/inbox" className="text-gray-600 dark:text-gray-300 hover:text-red-600 text-xl relative">
                                💬
                            </Link>

                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 text-xl" title={t('header.logout')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                            </button>

                            {user?.isAdmin && (
                                <Link href="/moderation" className="hidden lg:inline-block text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                                    🛡️ Admin
                                </Link>
                            )}

                            {user?.isAdmin && (
                                <Link href="/moderation" className="lg:hidden text-blue-600 dark:text-blue-400 text-xl">
                                    🛡️
                                </Link>
                            )}

                            <Link href="/post-ad" className="bg-red-600 text-white w-9 h-9 md:w-auto md:px-5 md:py-2.5 rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 dark:shadow-red-900/20 text-sm flex items-center justify-center gap-1">
                                <span className="text-xl pb-1">+</span> <span className="hidden md:inline">{t('header.postAd')}</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-gray-700 dark:text-gray-200 hover:text-red-600 font-bold text-sm hidden sm:inline">
                                {t('header.login')}
                            </Link>
                            <Link href="/post-ad" className="bg-red-600 text-white px-4 py-2 rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 dark:shadow-red-900/20 text-sm flex items-center gap-1">
                                + {t('header.postAd')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
