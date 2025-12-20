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
                    <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>

                    <p className="lead text-lg text-gray-600 dark:text-gray-300 mb-6">
                        Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, post an ad, or contact support.</p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use your information to provide, maintain, and improve our services, including to process transactions and send you related information.</p>

                    <h3>3. Sharing of Information</h3>
                    <p>We do not sell your personal information. We may share information with third-party vendors who need access to such information to carry out work on our behalf.</p>

                    <h3>4. Data Security</h3>
                    <p>We implement reasonable security measures to protect your information, but no method of transmission over the Internet is 100% secure.</p>

                    <h3>5. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@dealz.com.</p>
                </article>
            </div>
        </div>
    );
}
