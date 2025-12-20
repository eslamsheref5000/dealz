"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
    const { t, locale } = useLanguage();

    const sections = [
        {
            title: locale === 'ar' ? "ديلز" : (locale === 'fr' ? "Dealz" : "Dealz"),
            links: [
                { label: locale === 'ar' ? "عن ديلز" : (locale === 'fr' ? "À propos de Dealz" : "About Dealz"), href: "/help" },
                { label: locale === 'ar' ? "الوظائف" : (locale === 'fr' ? "Carrières" : "Careers"), href: "/help" }, // Generic link for now
                { label: locale === 'ar' ? "الخصوصية" : (locale === 'fr' ? "Confidentialité" : "Privacy Policy"), href: "/privacy" },
                { label: locale === 'ar' ? "الشروط" : (locale === 'fr' ? "Termes" : "Terms of Use"), href: "/terms" },
                { label: locale === 'ar' ? "خريطة الموقع" : (locale === 'fr' ? "Plan du site" : "Sitemap"), href: "/sitemap" },
            ]
        },
        {
            title: locale === 'ar' ? "دعم" : (locale === 'fr' ? "Support" : "Support"),
            links: [
                { label: locale === 'ar' ? "مركز المساعدة" : (locale === 'fr' ? "Centre d'aide" : "Help Center"), href: "/help" },
                { label: locale === 'ar' ? "اتصل بنا" : (locale === 'fr' ? "Contactez-nous" : "Contact Us"), href: "/help" },
                { label: locale === 'ar' ? "قواعد السلامة" : (locale === 'fr' ? "Sécurité" : "Safety Rules"), href: "/help" },
            ]
        },
        {
            title: locale === 'ar' ? "تواصل معنا" : (locale === 'fr' ? "Suivez-nous" : "Follow Us"),
            socials: true
        }
    ];

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 mt-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-2xl font-black text-red-600 tracking-tighter mb-4 block">
                            Dealz.
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            {locale === 'ar'
                                ? "وجهتك الأولى للبيع والشراء في الشرق الأوسط. أفضل الصفقات، كل يوم."
                                : (locale === 'fr' ? "Votre destination numéro un pour acheter et vendre au Moyen-Orient. Les meilleures offres, chaque jour." : "Your number one destination for buying and selling in the Middle East. The best deals, every day.")}
                        </p>
                    </div>

                    {/* Links Columns */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="col-span-1">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{section.title}</h3>
                            {section.links && (
                                <ul className="space-y-3">
                                    {section.links.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link href={link.href} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 text-sm transition-colors">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {section.socials && (
                                <div className="flex gap-4">
                                    {['Fb', 'Tw', 'In', 'Yt'].map((social, sIdx) => (
                                        <div key={sIdx} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors cursor-pointer">
                                            <span className="text-xs font-bold">{social}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Dealz. {locale === 'ar' ? "جميع الحقوق محفوظة" : (locale === 'fr' ? "Tous droits réservés" : "All rights reserved")}.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {locale === 'ar' ? "الخصوصية" : (locale === 'fr' ? "Confidentialité" : "Privacy")}
                        </Link>
                        <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {locale === 'ar' ? "الشروط" : (locale === 'fr' ? "Termes" : "Terms")}
                        </Link>
                        <Link href="/sitemap" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {locale === 'ar' ? "خريطة الموقع" : (locale === 'fr' ? "Plan" : "Sitemap")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
