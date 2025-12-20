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
                // Log all params for debugging
                console.log("Redirect Params:", Object.fromEntries(searchParams.entries()));

                // Strapi might return 'access_token', 'jwt', or 'token'
                let jwt = accessToken || searchParams.get("jwt") || searchParams.get("token");

                if (!jwt) {
                    throw new Error("No token found in URL");
                }

                // Clean token
                jwt = jwt.replace("Bearer ", "");
                console.log("Using JWT:", jwt.substring(0, 10) + "...");

                // Store JWT
                localStorage.setItem("jwt", jwt);

                // Fetch User Details
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                console.log("Fetching user from:", `${API_URL}/api/users/me`);

                const res = await fetch(`${API_URL}/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });

                if (res.ok) {
                    const user = await res.json();
                    localStorage.setItem("user", JSON.stringify(user));
                    setStatus("success");
                    window.location.href = "/";
                } else {
                    const errorText = await res.text();
                    console.error("User Fetch Failed:", res.status, errorText);
                    setStatus("error");
                    // Update UI to show error (temporary)
                    alert(`Login Failed: ${res.status} - ${errorText}`);
                    setTimeout(() => router.push("/login"), 5000);
                }
            } catch (err) {
                console.error("Google Login Error:", err);
                setStatus("error");
                alert(`Login Script Error: ${err}`);
                setTimeout(() => router.push("/login"), 5000);
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
