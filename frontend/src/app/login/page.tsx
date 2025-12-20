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

                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}/api/connect/google`}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        {t('auth.googleLogin')}
                    </a>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <span className="text-gray-500 text-sm">OR</span>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

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

    );
}
