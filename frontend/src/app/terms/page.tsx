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
                    <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Terms of Use</h1>

                    <p className="lead text-lg text-gray-600 dark:text-gray-300 mb-6">
                        Welcome to Dealz. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
                    </p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By using our services, you agree to these terms. If you do not agree, please do not use our services.</p>

                    <h3>2. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

                    <h3>3. Listing Rules</h3>
                    <p>All ads must comply with our prohibited items policy. We reserve the right to remove any ad that violates our policies.</p>

                    <h3>4. Safety & Conduct</h3>
                    <p>Dealz is a marketplace for local trading. Buying and selling is done directly between users. We are not responsible for any transactions or disputes between users.</p>

                    <h3>5. Contact Us</h3>
                    <p>If you have any questions about these Terms, please contact us at support@dealz.com.</p>
                </article>
            </div>
        </div>
    );
}
