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
    ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function Footer() {
    const { t, locale } = useLanguage();
    const [openSection, setOpenSection] = useState<string | null>(null);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleSection = (title: string) => {
        setOpenSection(openSection === title ? null : title);
    };

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
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 mt-20 transition-colors duration-300 relative group/footer">
            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all opacity-0 group-hover/footer:opacity-100 md:opacity-100 z-10"
                aria-label={t('footer.backToTop')}
            >
                <ArrowUp size={20} />
            </button>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">

                    {/* Brand & Newsletter Column (Always visible, spans 4 cols on large) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="text-3xl font-black text-red-600 tracking-tighter block">
                            Dealz.
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {t('footer.brandParams')}
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{t('footer.newsletterTitle')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('footer.newsletterDesc')}</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder={t('footer.emailPlaceholder')}
                                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                                />
                                <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors shadow-md hover:shadow-lg">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns (Accordion on Mobile, Grid on Desktop) */}
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

                    {/* App & Socials Column (Spans 3 cols) */}
                    <div className="lg:col-span-3 space-y-8">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{t('footer.followUs')}</h3>
                            <div className="flex gap-4">
                                {socialIcons.map(({ Icon, href, color }, idx) => (
                                    <a key={idx} href={href} className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 ${color} transition-all hover:scale-110 hover:shadow-md`}>
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">{t('footer.downloadApp')}</h3>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <QrCode className="w-16 h-16 text-gray-800" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {t('footer.scanToDownload')}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <button className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity text-xs w-full">
                                            <Smartphone size={14} />
                                            <span className="font-bold">App Store</span>
                                        </button>
                                        <button className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity text-xs w-full">
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

                        <div className="flex items-center gap-3 text-gray-400 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="h-6 w-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"><CreditCard size={16} /></div>
                            <div className="h-6 w-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                            <div className="h-6 w-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
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
    );
}
