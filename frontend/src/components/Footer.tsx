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
    ArrowUp
} from "lucide-react";

export default function Footer() {
    const { t, locale } = useLanguage();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all opacity-0 group-hover/footer:opacity-100 md:opacity-100"
                aria-label={t('footer.backToTop')}
            >
                <ArrowUp size={20} />
            </button>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Newsletter Column */}
                    <div className="space-y-6">
                        <Link href="/" className="text-3xl font-black text-red-600 tracking-tighter block">
                            Dealz.
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {t('footer.brandParams')}
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{t('footer.newsletterTitle')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('footer.newsletterDesc')}</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder={t('footer.emailPlaceholder')}
                                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                                />
                                <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns (Trending + Support) */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="col-span-1">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{section.title}</h3>
                            <ul className="space-y-4">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link href={link.href} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 text-sm transition-colors flex items-center gap-2 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-red-600 transition-colors"></span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* App & Socials Column */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{t('footer.followUs')}</h3>
                            <div className="flex gap-4">
                                {socialIcons.map(({ Icon, href, color }, idx) => (
                                    <a key={idx} href={href} className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 ${color} transition-all hover:scale-110`}>
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">{t('footer.downloadApp')}</h3>
                            <div className="flex flex-col gap-3">
                                <button className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity w-fit">
                                    <Smartphone className="w-6 h-6" />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase opacity-80 leading-none mb-0.5">Get it on</div>
                                        <div className="font-bold text-sm leading-none">{t('footer.appStore')}</div>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity w-fit">
                                    <div className="w-6 h-6 relative flex items-center justify-center">
                                        <span className="text-xl font-bold">▶</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase opacity-80 leading-none mb-0.5">Get it on</div>
                                        <div className="font-bold text-sm leading-none">{t('footer.googlePlay')}</div>
                                    </div>
                                </button>
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

                        <div className="flex items-center gap-2 text-gray-400">
                            <CreditCard size={20} />
                            <span className="text-xs font-medium border border-gray-200 dark:border-gray-700 px-2 py-1 rounded bg-gray-50 dark:bg-gray-800">VISA</span>
                            <span className="text-xs font-medium border border-gray-200 dark:border-gray-700 px-2 py-1 rounded bg-gray-50 dark:bg-gray-800">MASTERCARD</span>
                            <span className="text-xs font-medium border border-gray-200 dark:border-gray-700 px-2 py-1 rounded bg-gray-50 dark:bg-gray-800">APPLE PAY</span>
                        </div>

                        <div className="flex gap-6 text-sm text-gray-400">
                            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                {t('footer.privacyShort')}
                            </Link>
                            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                {t('footer.termsShort')}
                            </Link>
                            <div className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={scrollToTop}>
                                {t('footer.backToTop')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
