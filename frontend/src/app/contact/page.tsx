"use client";

import { useLanguage } from "../../context/LanguageContext";
import Footer from "../../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-6">{t('footer.contactUs') || "Contact Us"}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm h-full">
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full text-blue-600">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold">support@dealz.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full text-green-600">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-semibold">+971 800-DEALZ</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full text-purple-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Office</p>
                                    <p className="font-semibold">Dubai Internet City, UAE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm h-full">
                        <h2 className="text-2xl font-bold mb-6">Send Message</h2>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <input type="text" placeholder="Your Name" className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                            <input type="email" placeholder="Email Address" className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                            <textarea placeholder="Message" rows={4} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"></textarea>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">Send</button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
