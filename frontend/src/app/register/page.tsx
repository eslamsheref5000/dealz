"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";

export default function RegisterPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        agreedToTerms: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.agreedToTerms) {
            alert(t('auth.agreeToTerms') || "You must agree to the Terms and Privacy Policy.");
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            console.log("Register Fetch URL:", `${API_URL}/api/auth/local/register`);
            const res = await fetch(`${API_URL}/api/auth/local/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                alert(t('auth.registerSuccess'));
                router.push("/login");
            } else {
                alert(data.error?.message || t('auth.registerFailed'));
            }
        } catch (err) {
            console.error(err);
            alert(t('auth.networkError'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-red-600 mb-6 italic">{t('common.dealz')}</h2>
                    <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">{t('auth.registerTitle')}</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">{t('auth.username')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="username"
                                required
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${formData.username.length > 0
                                    ? (formData.username.length >= 3 ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500')
                                    : 'border-gray-300 focus:ring-red-500'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">{t('auth.email')} <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="email"
                                required
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${formData.email.length > 0
                                    ? (formData.email.includes('@') ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500')
                                    : 'border-gray-300 focus:ring-red-500'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">{t('auth.password')} <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                name="password"
                                required
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${formData.password.length > 0
                                    ? (formData.password.length >= 6 ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500')
                                    : 'border-gray-300 focus:ring-red-500'
                                    }`}
                            />
                        </div>


                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                name="agreedToTerms"
                                checked={formData.agreedToTerms}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                            />
                            <label className="text-sm text-gray-600">
                                {t('auth.agreeToTerms') || "I agree to the Terms of Service and Privacy Policy"}
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">{t('auth.registerBtn')}</button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        {t('auth.hasAccount')}{" "}
                        <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                            {t('auth.loginBtn')}
                        </Link>
                    </p>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition flex items-center justify-center gap-1">
                            ← {t('auth.backToHome')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
