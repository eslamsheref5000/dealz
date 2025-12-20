"use client";

import Header from "../../components/Header";
import { useLanguage } from "../../context/LanguageContext";

export default function HelpPage() {
    const { t } = useLanguage();

    const faqs = [
        {
            q: "How do I post an ad?",
            a: "Click on the 'Post Your Ad' button in the header, login to your account, fill in the details, and submit!"
        },
        {
            q: "Is it free to sell?",
            a: "Yes! Basic ads are completely free. You can choose to upgrade to a Featured Ad for more visibility."
        },
        {
            q: "How can I contact a seller?",
            a: "Go to the product page and click on 'Show Phone Number' or 'Chat with Seller'."
        },
        {
            q: "What payment methods are supported for featured ads?",
            a: "We currently support InstaPay and basic bank transfers."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Help Center</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Frequently Asked Questions</p>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-600 dark:text-gray-400">Still have questions?</p>
                    <a href="mailto:support@dealz.com" className="text-red-600 font-bold hover:underline">Contact Support</a>
                </div>
            </div>
        </div>
    );
}
