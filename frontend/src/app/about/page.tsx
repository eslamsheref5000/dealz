"use client";

import { useLanguage } from "../../context/LanguageContext";
import Footer from "../../components/Footer";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-6">{t('footer.about') || "About Dealz"}</h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm space-y-6">
                    <p className="text-lg leading-relaxed">
                        {t('footer.brandParams') || "Your number one destination for buying and selling in the Middle East."}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                        Dealz is the leading marketplace for second-hand goods, connecting buyers and sellers in a safe and secure environment.
                        We believe in the power of giving items a second life, reducing waste, and helping our community find great deals.
                    </p>

                    <h2 className="text-2xl font-bold mt-8">Our Mission</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        To simplify trade and empower people to upgrade their lives through smart buying and selling.
                    </p>

                    <h2 className="text-2xl font-bold mt-8">Why Dealz?</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        <li><strong>Trust & Safety:</strong> Verified users and secure payments.</li>
                        <li><strong>AI Powered:</strong> Smart suggestions and easy ad posting.</li>
                        <li><strong>Community First:</strong> Local trade with real people.</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
}
