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

            const accessToken = searchParams.get("access_token");
            const idToken = searchParams.get("id_token");
            const rawJwt = searchParams.get("jwt");

            let finalJwt = rawJwt || accessToken;

            // 1. Check if we have a valid token to start with
            if (!finalJwt) {
                setStatus("error");
                return;
            }

            // 2. Remove "Bearer " prefix if present
            finalJwt = finalJwt.replace("Bearer ", "");

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

                // 3. Check if this is a Google Access Token (starts with "ya29.")
                // If so, we must exchange it for a Strapi JWT using our custom endpoint
                if (finalJwt.startsWith("ya29.")) {
                    console.log("Detected Google Access Token. Exchanging for Strapi JWT...");

                    // Try the exchange
                    const exchangeRes = await fetch(`${API_URL}/api/users-permissions/auth/google/manual-exchange`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ access_token: finalJwt }),
                    });

                    if (!exchangeRes.ok) {
                        const err = await exchangeRes.json();
                        throw new Error(`Token Exchange Failed: ${err.error?.message || exchangeRes.statusText}`);
                    }

                    const data = await exchangeRes.json();
                    finalJwt = data.jwt;

                    console.log("Token Exchange Successful. New JWT:", finalJwt?.substring(0, 10) + "...");
                }

                // 4. Store the JWT (either original or exchanged)
                localStorage.setItem("jwt", finalJwt);

                // 5. Fetch User Profile to confirm everything is working
                console.log(`Fetching user from: ${API_URL}/api/users/me`);
                const res = await fetch(`${API_URL}/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${finalJwt}`,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("User Fetch Failed:", res.status, JSON.stringify(errorData));
                    throw new Error(`User Fetch Failed: ${res.status} ${JSON.stringify(errorData)}`);
                }

                const userData = await res.json();
                console.log("User Fetched Successfully:", userData);

                localStorage.setItem("user", JSON.stringify(userData));

                // 6. Success! Redirect
                setStatus("success");
                setTimeout(() => {
                    router.push("/");
                }, 1500);

            } catch (err: any) {
                console.error("Login Sequence Error:", err);
                setStatus("error");
                // Show detailed error on screen
                alert("Login Error: " + err.message);
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
