"use client";

import Header from "../../components/Header";
import { useLanguage } from "../../context/LanguageContext";

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <article className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('termsOfUse.title')}</h1>

                    <p className="lead text-lg text-gray-600 dark:text-gray-300 mb-6">
                        {t('termsOfUse.intro')}
                    </p>

                    <h3>{t('termsOfUse.s1Title')}</h3>
                    <p>{t('termsOfUse.s1Content')}</p>

                    <h3>{t('termsOfUse.s2Title')}</h3>
                    <p>{t('termsOfUse.s2Content')}</p>

                    <h3>{t('termsOfUse.s3Title')}</h3>
                    <p>{t('termsOfUse.s3Content')}</p>

                    <h3>{t('termsOfUse.s4Title')}</h3>
                    <p>{t('termsOfUse.s4Content')}</p>

                    <h3>{t('termsOfUse.s5Title')}</h3>
                    <p>{t('termsOfUse.s5Content')}</p>
                </article>
            </div>
        </div>
    );
}
