"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../../../context/LanguageContext";

function PaymentCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLanguage();

    // Paymob sends 'success' as string "true" or "false"
    const success = searchParams.get("success") === "true";
    const orderId = searchParams.get("id"); // Paymob transaction ID, mostly

    // Optional: Call backend to confirm status if needed, but webhook handles the real work.
    // UI just reflects the query param state.

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl max-w-md w-full text-center space-y-6">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {success ? <CheckCircle size={40} /> : <XCircle size={40} />}
            </div>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {success ? (t('checkout.paymentSuccess') || "Payment Successful!") : (t('checkout.paymentFailed') || "Payment Failed")}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {success
                        ? (t('checkout.successDesc') || "Your transaction has been completed successfully.")
                        : (t('checkout.failedDesc') || "Something went wrong. Please try again.")}
                </p>
                {orderId && <p className="text-xs font-mono text-gray-400 mt-4">Trans ID: {orderId}</p>}
            </div>

            <div className="pt-4 space-y-3">
                {success ? (
                    <Link
                        href="/profile?tab=orders"
                        className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        {t('checkout.viewOrders') || "View My Orders"} <ArrowRight size={18} />
                    </Link>
                ) : (
                    <button
                        onClick={() => router.back()}
                        className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
                    >
                        {t('checkout.tryAgain') || "Try Again"}
                    </button>
                )}
                <Link href="/" className="block text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                    {t('common.backToHome') || "Return to Home"}
                </Link>
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Loading...</div>}>
                <PaymentCallbackContent />
            </Suspense>
        </div>
    );
}
