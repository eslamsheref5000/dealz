"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin,
    Smartphone,
    CreditCard,
    Send,
    ArrowUp,
    QrCode,
    ChevronDown,
    Activity,
    Users,
    Tag,
    ShieldCheck,
    X,
    Truck,
    Globe,
    Zap,
    Leaf,
    Crown,
    Bot,
    Award,
    Bitcoin,
    Clock,
    TrendingUp,
    Mic,
    CloudSun
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
    const { t, locale } = useLanguage();
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const [activeTickerIndex, setActiveTickerIndex] = useState(0);
    const [time, setTime] = useState<Date | null>(null);

    // Mock Live Activity Data
    const activities = [
        { user: "Ali", action: t('footer.justSold'), item: "iPhone 15 Pro", location: "Dubai" },
        { user: "Sarah", action: t('footer.justSold'), item: "Toyota Camry", location: "Abu Dhabi" },
        { user: "Ahmed", action: t('footer.justSold'), item: "PS5 Console", location: "Sharjah" },
        { user: "John", action: t('footer.justSold'), item: "MacBook Air", location: "Riyadh" },
    ];

    useEffect(() => {
        setTime(new Date());
        const interval = setInterval(() => {
            setActiveTickerIndex((prev) => (prev + 1) % activities.length);
            setTime(new Date());
        }, 1000);

        // Mock cookie check
        const consent = localStorage.getItem("dealz_cookie_consent");
        if (!consent) {
            setTimeout(() => setShowCookieConsent(true), 1500);
        }

        return () => clearInterval(interval);
    }, [activities.length]);

    const handleAcceptCookies = () => {
        localStorage.setItem("dealz_cookie_consent", "true");
        setShowCookieConsent(false);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleSection = (title: string) => {
        setOpenSection(openSection === title ? null : title);
    };

    const stats = [
        { icon: Tag, label: t('footer.adsPosted'), value: "1M+" },
        { icon: Users, label: t('footer.activeUsers'), value: "500K+" },
        { icon: Activity, label: t('footer.dailyDeals'), value: "10K+" },
    ];

    const sections = [
        {
            title: t('footer.trending'),
            links: [
                { label: t('categories.Motors'), href: "/c/Motors" },
                { label: t('categories.Properties'), href: "/c/Properties" },
                { label: t('categories.Mobiles'), href: "/c/Mobiles" },
                { label: t('categories.Jobs'), href: "/c/Jobs" },
                { label: t('categories.Electronics'), href: "/c/Electronics" },
            ]
        },
        {
            title: t('footer.support'),
            links: [
                { label: t('footer.helpCenter'), href: "/help" },
                { label: t('footer.contactUs'), href: "/help" },
                { label: t('footer.safety'), href: "/help" },
                { label: t('footer.sitemap'), href: "/sitemap" },
                { label: t('footer.about'), href: "/help" },
            ]
        },
        {
            title: t('common.dealz'),
            links: [
                { label: t('footer.about'), href: "/help" },
                { label: t('footer.careers'), href: "/help" },
                { label: t('footer.privacy'), href: "/privacy" },
                { label: t('footer.terms'), href: "/terms" },
            ]
        }
    ];

    const socialIcons = [
        { Icon: Facebook, href: "#", color: "hover:text-blue-600" },
        { Icon: Twitter, href: "#", color: "hover:text-sky-500" },
        { Icon: Instagram, href: "#", color: "hover:text-pink-600" },
        { Icon: Linkedin, href: "#", color: "hover:text-blue-700" },
        { Icon: Youtube, href: "#", color: "hover:text-red-600" },
    ];

    // Format time helpers
    const formatTime = (offset: number) => {
        if (!time) return "00:00";
        const d = new Date(time.getTime() + offset * 3600 * 1000);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div className="relative">
            {/* V8 Exclusive: Hyper-Tech Top Bar */}
            <div className="bg-gray-900 border-t-4 border-red-600 text-white py-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center relative z-10 gap-4 md:gap-0">

                    {/* Live Ticker & V8: DLZ Token */}
                    <div className="flex items-center gap-4 bg-gray-800/50 py-1.5 px-4 rounded-full border border-gray-700 w-full md:w-auto overflow-hidden">
                        <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                            <Zap size={12} className="fill-current animate-pulse" />
                            {t('footer.recentActivity')}
                        </div>
                        <div className="h-4 w-[1px] bg-gray-600 hidden md:block"></div>
                        <div className="text-xs text-gray-300 truncate w-full md:w-48 relative h-4">
                            {activities.map((activity, idx) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-all duration-500 transform ${idx === activeTickerIndex ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                                        }`}
                                >
                                    <span className="font-bold text-white">{activity.user}</span> {activity.action} <span className="text-red-400">{activity.item}</span> {t('footer.in')} {activity.location}
                                </div>
                            ))}
                        </div>
                        {/* V8 DLZ Token */}
                        <div className="hidden md:flex items-center gap-2 border-l border-gray-600 pl-4">
                            <TrendingUp size={12} className="text-green-500" />
                            <span className="text-[10px] font-mono text-gray-300">
                                {t('footer.dlzToken')}: <span className="text-green-400 font-bold">$42.50</span> <span className="text-green-600 text-[9px]">(+2.4%)</span>
                            </span>
                        </div>
                    </div>

                    {/* V7: Global Markets & V8: Weather (Desktop Only) */}
                    <div className="hidden lg:flex items-center gap-6 text-[10px] text-gray-400 font-mono">
                        <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-900/10 rounded border border-blue-500/20">
                            <CloudSun size={12} className="text-blue-400" />
                            <span className="text-blue-200">{t('footer.weather')} 32°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-gray-500" />
                            <span className="text-gray-300">DXB {time ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">LON</span>
                            <span className="text-gray-300">{formatTime(-4)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">NYC</span>
                            <span className="text-gray-300">{formatTime(-9)}</span>
                        </div>
                    </div>

                    {/* Eco-Impact */}
                    <div className="hidden md:flex items-center gap-3 bg-green-900/20 border border-green-500/30 px-3 py-1.5 rounded-full">
                        <Leaf size={14} className="text-green-500 animate-bounce" />
                        <div className="text-[10px] font-medium text-green-100">
                            <span className="font-bold text-white">12,450</span> {t('footer.co2Saved')}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-12 pb-8 transition-colors duration-300 relative group/footer">
                {/* Back to Top Button */}
                <button
                    onClick={scrollToTop}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all opacity-0 group-hover/footer:opacity-100 md:opacity-100 z-10 ring-4 ring-white dark:ring-gray-900"
                    aria-label={t('footer.backToTop')}
                >
                    <ArrowUp size={20} />
                </button>

                {/* V7/V8: AI Assistant with Voice */}
                <div className="absolute top-0 right-8 -translate-y-1/2 hidden md:block z-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/ai-btn:opacity-100 transition-opacity whitespace-nowrap">
                            {t('footer.voiceCmd')}
                        </div>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white pl-4 pr-6 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group/ai-btn relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/ai-btn:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="bg-white/20 p-1.5 rounded-full animate-pulse">
                                <Bot size={18} />
                            </div>
                            <span className="font-bold text-sm tracking-wide">{t('footer.askAI')}</span>
                            <div className="ml-2 border-l border-white/20 pl-2">
                                <Mic size={14} className="opacity-70 group-hover/ai-btn:opacity-100" />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">

                        {/* Brand Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <Link href="/" className="group inline-block">
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 tracking-tighter hover:to-red-800 transition-all">
                                    Dealz.
                                </span>
                            </Link>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-l-2 border-red-100 dark:border-red-900 pl-4">
                                {t('footer.brandParams')}
                            </p>

                            {/* Currency/Language Selector */}
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <Globe size={14} className="text-gray-500" />
                                    {locale === 'en' ? 'English' : locale === 'ar' ? 'العربية' : locale === 'fr' ? 'Français' : locale === 'hi' ? 'हिंदी' : 'اردو'}
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <span className="text-gray-500 font-bold">$</span>
                                    USD
                                </button>
                            </div>

                            {/* V8: Holographic Elite Card */}
                            <div className="group/elite perspective-1000">
                                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-yellow-500/30 shadow-xl relative overflow-hidden transition-transform duration-500 transform preserve-3d group-hover/elite:rotate-x-12 group-hover/elite:rotate-y-12 group-hover/elite:scale-105">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                                    <div className="absolute -right-10 -top-10 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl group-hover/elite:bg-yellow-500/30 transition-all"></div>

                                    <div className="flex items-start justify-between relative z-10 mb-4 translate-z-10">
                                        <div>
                                            <h4 className="font-bold text-yellow-500 text-lg mb-1 flex items-center gap-2">
                                                <Crown size={18} className="fill-current" />
                                                {t('footer.dealzElite')}
                                            </h4>
                                            <p className="text-xs text-gray-400">Unlock 0% fees & priority support.</p>
                                        </div>
                                    </div>

                                    <button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-2.5 rounded-xl transition-all shadow-md hover:shadow-yellow-500/20 text-sm relative z-10 translate-z-20">
                                        {t('footer.joinElite')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                            {sections.map((section, idx) => (
                                <div key={idx} className="border-b border-gray-100 dark:border-gray-800 md:border-none pb-4 md:pb-0">
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="flex w-full md:w-auto justify-between items-center md:cursor-default"
                                    >
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg md:mb-6">{section.title}</h3>
                                        <ChevronDown
                                            className={`md:hidden text-gray-400 transition-transform duration-300 ${openSection === section.title ? 'rotate-180' : ''}`}
                                            size={20}
                                        />
                                    </button>
                                    <ul className={`space-y-3 mt-4 md:mt-0 ${openSection === section.title ? 'block' : 'hidden md:block'}`}>
                                        {section.links.map((link, lIdx) => (
                                            <li key={lIdx}>
                                                <Link href={link.href} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 text-sm transition-colors flex items-center gap-2 group w-fit">
                                                    <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                                                    <span className="relative">
                                                        {link.label}
                                                        <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-red-600 transition-all group-hover:w-full"></span>
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* App & Socials Column */}
                        <div className="lg:col-span-3 space-y-8">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{t('footer.followUs')}</h3>
                                <div className="flex gap-4">
                                    {socialIcons.map(({ Icon, href, color }, idx) => (
                                        <a key={idx} href={href} className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 ${color} transition-all hover:scale-110 hover:shadow-md hover:border-red-100 dark:hover:border-red-900`}>
                                            <Icon size={20} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">{t('footer.downloadApp')}</h3>
                                <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl flex items-center gap-4 relative overflow-hidden group/app">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover/app:bg-white/10 transition-all"></div>
                                    <div className="bg-white p-2 rounded-xl shadow-sm z-10">
                                        <QrCode className="w-14 h-14 text-black" />
                                    </div>
                                    <div className="space-y-2 z-10 w-full">
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                            {t('footer.scanToDownload')}
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-xs w-full backdrop-blur-sm border border-white/5">
                                                <Smartphone size={14} className="text-white" />
                                                <span className="font-bold">App Store</span>
                                            </button>
                                            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-xs w-full backdrop-blur-sm border border-white/5">
                                                <div className="w-3.5 h-3.5 flex items-center justify-center bg-white text-black rounded-full text-[8px] font-bold">▶</div>
                                                <span className="font-bold">Google Play</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar: Logistics, Payment, Crypto */}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                            <div className="space-y-2 text-center md:text-left">
                                <p className="text-sm text-gray-400">
                                    © {new Date().getFullYear()} Dealz. {t('footer.rights')}.
                                </p>
                                <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-2 text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        {t('footer.statusOperational')}
                                    </div>
                                    <div className="h-3 w-px bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="flex gap-2 opacity-70 items-center">
                                        <Truck size={12} /> <span className="text-[10px]">DHL</span>
                                    </div>
                                </div>
                            </div>

                            {/* V7: Award & Crypto Badge */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-700/30">
                                    <Award size={14} className="text-yellow-600 dark:text-yellow-500" />
                                    <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">{t('footer.bestTechAward')}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="flex -space-x-1">
                                        <div className="h-6 w-8 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-l flex items-center justify-center relative z-10"><CreditCard size={12} /></div>
                                        <div className="h-6 w-8 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-r flex items-center justify-center relative z-0"><Bitcoin size={12} className="text-orange-500" /></div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck size={12} className="text-green-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 text-sm text-gray-400">
                                <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    {t('footer.privacyShort')}
                                </Link>
                                <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    {t('footer.termsShort')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Cookie Consent Modal */}
            {showCookieConsent && (
                <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <button onClick={() => setShowCookieConsent(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={16} />
                    </button>
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full text-red-600 dark:text-red-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t('footer.cookieTitle')}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {t('footer.cookieDesc')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAcceptCookies}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                        >
                            {t('footer.accept')}
                        </button>
                        <button
                            onClick={() => setShowCookieConsent(false)}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
