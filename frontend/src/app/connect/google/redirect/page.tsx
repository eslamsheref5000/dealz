
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

            // 1. Extract potential tokens from URL
            const jwt = searchParams.get("jwt"); // Standard Strapi JWT
            const userStr = searchParams.get("user"); // Standard Strapi user data
            const idToken = searchParams.get("id_token"); // Google ID Token
            const accessToken = searchParams.get("access_token"); // Google Access Token
            const rawJwt = searchParams.get("rawJwt"); // Custom param for raw JWT if needed

            let finalJwt = null;

            // 2. Prioritize standard Strapi JWT if available
            if (jwt) {
                console.log("Strapi JWT found in URL!", jwt.substring(0, 10) + "...");
                finalJwt = jwt;
                localStorage.setItem("jwt", jwt);

                if (userStr) {
                    localStorage.setItem("user", userStr);
                } else {
                    // Fetch user if not provided in URL
                    try {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                        const res = await fetch(`${API_URL} /api/users / me`, {
                            headers: { Authorization: `Bearer ${jwt} ` }
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
                return; // Exit if standard JWT flow is complete
            }

            // 3. If no standard JWT, try the Plugin Strategy
            // This is for cases where Google redirects with id_token/access_token
            // and Strapi needs to exchange it via a custom plugin.
            if (idToken || rawJwt || accessToken) {
                try {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

                    // 3. Manual Strategy: Call custom /api/auth-google/login
                    const tokenToExchange = idToken || rawJwt || accessToken;
                    console.log("Exchanging Token via Manual API:", tokenToExchange?.substring(0, 10) + "...");

                    const exchangeRes = await fetch(`${API_URL}/api/google-login/authenticate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: tokenToExchange }),
                    });

                    if (!exchangeRes.ok) {
                        const err = await exchangeRes.json();
                        throw new Error(`Manual Exchange Failed: ${err.error?.message || exchangeRes.statusText}`);
                    }

                    const data = await exchangeRes.json();
                    // Manual API response format usually:
                    // {
                    //   jwt: "...",
                    //   user: { ... }
                    // }

                    finalJwt = data.jwt;
                    console.log("Manual Exchange Successful. New JWT:", finalJwt?.substring(0, 10) + "...");

                    // 4. Store the JWT
                    if (finalJwt) {
                        localStorage.setItem("jwt", finalJwt);
                        if (data.user) {
                            localStorage.setItem("user", JSON.stringify(data.user));
                        }
                    }

                    // 5. Success! Redirect
                    setStatus("success");
                    setTimeout(() => {
                        router.push("/");
                    }, 1500);

                } catch (err: any) {
                    console.error("Login Manual API Error:", err);
                    setStatus("error");
                    alert("Login Error: " + err.message);
                }
                return; // Exit after attempting exchange
            }

            // 6. Check for errors if no token handling occurred
            const error = searchParams.get("error");
            if (error) {
                console.error("Login Error from Strapi:", error);
                setStatus("error");
                alert("Login Failed: " + error);
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
