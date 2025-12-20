"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../../../context/LanguageContext";

export default function GoogleRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const processLogin = async () => {
            const accessToken = searchParams.get("access_token");

            if (!accessToken) {
                setStatus("error");
                setTimeout(() => router.push("/login"), 3000);
                return;
            }

            try {
                // Remove 'Bearer ' if present (Strapi sometimes adds it, sometimes not in query)
                const jwt = accessToken.replace("Bearer ", "");

                // Store JWT
                localStorage.setItem("jwt", jwt);

                // Fetch User Details
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                const res = await fetch(`${API_URL}/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });

                if (res.ok) {
                    const user = await res.json();
                    localStorage.setItem("user", JSON.stringify(user));
                    setStatus("success");
                    // Force refresh to update Auth state in components
                    window.location.href = "/";
                } else {
                    setStatus("error");
                    setTimeout(() => router.push("/login"), 3000);
                }
            } catch (err) {
                console.error("Google Login Error:", err);
                setStatus("error");
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        processLogin();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
                {status === "loading" && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-800">{t('auth.connecting')}</h2>
                        <p className="text-gray-500 mt-2">{t('auth.pleaseWait')}</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                        <h2 className="text-xl font-bold text-gray-800">{t('auth.loginSuccess')}</h2>
                        <p className="text-gray-500 mt-2">{t('auth.redirecting')}</p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✕</div>
                        <h2 className="text-xl font-bold text-gray-800">{t('auth.loginFailed')}</h2>
                        <p className="text-gray-500 mt-2">{t('auth.redirectingLogin')}</p>
                    </>
                )}
            </div>
        </div>
    );
}
