"use client";

import Header from "../../components/Header";
import { useLanguage } from "../../context/LanguageContext";

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <article className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('privacyPolicy.title')}</h1>

                    <p className="lead text-lg text-gray-600 dark:text-gray-300 mb-6">
                        {t('privacyPolicy.intro')}
                    </p>

                    <h3>{t('privacyPolicy.s1Title')}</h3>
                    <p>{t('privacyPolicy.s1Content')}</p>

                    <h3>{t('privacyPolicy.s2Title')}</h3>
                    <p>{t('privacyPolicy.s2Content')}</p>

                    <h3>{t('privacyPolicy.s3Title')}</h3>
                    <p>{t('privacyPolicy.s3Content')}</p>

                    <h3>{t('privacyPolicy.s4Title')}</h3>
                    <p>{t('privacyPolicy.s4Content')}</p>

                    <h3>{t('privacyPolicy.s5Title')}</h3>
                    <p>{t('privacyPolicy.s5Content')}</p>
                </article>
            </div>
        </div>
    );
}
