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
    X
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
    const { t, locale } = useLanguage();
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [showCookieConsent, setShowCookieConsent] = useState(false);

    useEffect(() => {
        // Mock cookie check
        const consent = localStorage.getItem("dealz_cookie_consent");
        if (!consent) {
            setTimeout(() => setShowCookieConsent(true), 1500);
        }
    }, []);

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

    return (
        <div className="relative">
            {/* Live Stats Strip */}
            <div className="bg-gray-900 border-t-4 border-red-600 text-white py-3 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center md:justify-between items-center relative z-10">
                    <div className="hidden md:flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Live Stats
                    </div>
                    <div className="flex gap-8 md:gap-16">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-2 group cursor-default">
                                <stat.icon size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                                <div className="text-center md:text-left">
                                    <div className="font-bold text-sm md:text-base leading-none">{stat.value}</div>
                                    <div className="text-[10px] md:text-xs text-gray-400 font-medium uppercase">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300 relative group/footer">
                {/* Back to Top Button */}
                <button
                    onClick={scrollToTop}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all opacity-0 group-hover/footer:opacity-100 md:opacity-100 z-10 ring-4 ring-white dark:ring-gray-900"
                    aria-label={t('footer.backToTop')}
                >
                    <ArrowUp size={20} />
                </button>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">

                        {/* Brand & Newsletter Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <Link href="/" className="group inline-block">
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 tracking-tighter hover:to-red-800 transition-all">
                                    Dealz.
                                </span>
                            </Link>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-l-2 border-red-100 dark:border-red-900 pl-4">
                                {t('footer.brandParams')}
                            </p>

                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group/newsletter">
                                <div className="absolute -right-10 -top-10 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover/newsletter:bg-red-500/20 transition-all"></div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2 relative z-10">{t('footer.newsletterTitle')}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 relative z-10">{t('footer.newsletterDesc')}</p>
                                <div className="flex gap-2 relative z-10">
                                    <input
                                        type="email"
                                        placeholder={t('footer.emailPlaceholder')}
                                        className="flex-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-300 dark:hover:border-red-800 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400"
                                    />
                                    <button className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
                                        <Send size={18} />
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

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <p className="text-sm text-gray-400 text-center md:text-left">
                                © {new Date().getFullYear()} Dealz. {t('footer.rights')}.
                            </p>

                            <div className="flex items-center gap-3 text-gray-400">
                                <div className="h-6 px-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded flex items-center justify-center"><CreditCard size={14} /></div>
                                <div className="h-6 px-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded flex items-center justify-center gap-1">
                                    <ShieldCheck size={12} className="text-green-500" />
                                    <span className="text-[10px] font-bold">SSL SECURED</span>
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
