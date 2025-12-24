"use client";

import { useLanguage } from "../../context/LanguageContext";
import Footer from "../../components/Footer";

export default function PrivacyPage() {
    const { t } = useLanguage();

    // Helper to render sections if they exist in dictionaries, or fallback
    const renderSection = (num: number) => {
        const titleKey = `privacyPolicy.s${num}Title`;
        const contentKey = `privacyPolicy.s${num}Content`;
        const title = t(titleKey);
        const content = t(contentKey);

        if (!title && !content) return null;

        return (
            <div className="mb-8" key={num}>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{content}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-2">{t('privacyPolicy.title') || "Privacy Policy"}</h1>
                <p className="text-gray-500 mb-12">{t('privacyPolicy.intro')}</p>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => renderSection(n))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
