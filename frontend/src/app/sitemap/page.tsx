"use client";

import Header from "../../components/Header";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";

export default function SitemapPage() {
    const { t } = useLanguage();

    const sections = [
        {
            title: "Main Pages",
            links: [
                { label: "Home", href: "/" },
                { label: "Login", href: "/login" },
                { label: "Register", href: "/register" },
                { label: "Post Ad", href: "/post-ad" },
                { label: "Profile", href: "/profile" },
                { label: "Inbox", href: "/inbox" },
                { label: "Comparison", href: "/compare" },
            ]
        },
        {
            title: "Categories",
            links: [
                { label: "Motors", href: "/category/motors" },
                { label: "Properties", href: "/category/properties" },
                { label: "Mobiles", href: "/category/mobiles" },
                { label: "Electronics", href: "/category/electronics" },
                { label: "Jobs", href: "/category/jobs" },
                { label: "Furniture", href: "/category/furniture" },
            ]
        },
        {
            title: "Support & Legal",
            links: [
                { label: "Help Center", href: "/help" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Use", href: "/terms" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-10">Sitemap</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">{section.title}</h2>
                            <ul className="space-y-3">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors block">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
