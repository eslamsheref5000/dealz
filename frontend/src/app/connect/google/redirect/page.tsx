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
        const handleLogin = async () => {
            if (status !== 'loading') return;

            const jwt = searchParams.get("jwt");
            const userStr = searchParams.get("user");

            if (jwt) {
                console.log("Strapi JWT found in URL!", jwt.substring(0, 10) + "...");

                localStorage.setItem("jwt", jwt);
                if (userStr) {
                    localStorage.setItem("user", userStr);
                } else {
                    // Fetch user if not provided in URL
                    try {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                        const res = await fetch(`${API_URL}/api/users/me`, {
                            headers: { Authorization: `Bearer ${jwt}` }
                        });
                        if (res.ok) {
                            const userData = await res.json();
                            localStorage.setItem("user", JSON.stringify(userData));
                        }
                    } catch (e) {
                        console.error("Failed to fetch user profile", e);
                    }
                }

                setStatus("success");
                setTimeout(() => router.push("/"), 1500);
            } else {
                // No JWT found? Check for error params
                const error = searchParams.get("error");
                if (error) {
                    console.error("Login Error from Strapi:", error);
                    setStatus("error");
                    alert("Login Failed: " + error);
                } else {
                    // Fallback: Maybe Strapi sent access_token but failed to exchange? 
                    // For now, treat as error if we expected standard flow
                    console.warn("No JWT found in redirect URL.");
                    setStatus("error");
                }
            }
        };

        handleLogin();
    }, [searchParams, router, status, t]);

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
                        <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-48">
                            <p className="font-bold mb-1">Debug Info:</p>
                            <pre>{JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}</pre>
                        </div>
                        <button
                            onClick={() => router.push("/login")}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Return to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
