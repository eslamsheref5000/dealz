"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";

export default function RegisterPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:1338/api/auth/local/register", {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-red-600 mb-6 italic">{t('common.dealz')}</h2>
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">{t('auth.registerTitle')}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">{t('auth.username')}</label>
                        <input type="text" name="username" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700">{t('auth.email')}</label>
                        <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700">{t('auth.password')}</label>
                        <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500" />
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
    );
}
