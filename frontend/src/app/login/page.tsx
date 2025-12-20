"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            console.log("Login Fetch URL:", `${API_URL}/api/auth/local`);
            const res = await fetch(`${API_URL}/api/auth/local`, {
                method: "POST", // Login endpoint
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                // Store Token and User Data
                localStorage.setItem("jwt", data.jwt);
                localStorage.setItem("user", JSON.stringify(data.user));

                alert(t('auth.loginSuccess'));
                window.location.href = "/"; // Force refresh to update UI state
            } else {
                alert(data.error?.message || t('auth.loginFailed'));
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
                    <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">{t('auth.loginTitle')}</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">{t('auth.email')} <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="identifier"
                                required
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${formData.identifier.length > 0
                                    ? (formData.identifier.includes('@') ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500')
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
                        <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">{t('auth.loginBtn')}</button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        {t('auth.noAccount')}{" "}
                        <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
                            {t('auth.registerBtn')}
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
        </div >
    );
}
