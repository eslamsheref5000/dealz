"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function NotificationManager() {
    const [showPrompt, setShowPrompt] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        if (typeof window !== "undefined" && 'Notification' in window) {
            if (Notification.permission === 'default') {
                // Show prompt after a delay
                const timer = setTimeout(() => {
                    setShowPrompt(true);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("jwt");

        if (storedUser && token) {
            const user = JSON.parse(storedUser);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            const checkNotifications = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/notifications?filters[recipient][id][$eq]=${user.id}&filters[isRead][$eq]=false&sort=createdAt:desc&pagination[limit]=1`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.data && data.data.length > 0) {
                        const latest = data.data[0];
                        const lastNotifId = localStorage.getItem("lastNotifId");

                        if (latest.documentId !== lastNotifId) {
                            localStorage.setItem("lastNotifId", latest.documentId);

                            // Show browser notification if allowed
                            if (Notification.permission === 'granted') {
                                new Notification(t('common.dealz') || "Dealz", {
                                    body: latest.content,
                                    icon: "/brand-icon.png"
                                });
                            }

                            // Could also show a toast here
                        }
                    }
                } catch (e) {
                    console.error("Notification poll failed", e);
                }
            };

            // Check immediately then poll every 60s
            checkNotifications();
            const interval = setInterval(checkNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [t]);

    const handleAllow = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification(t('common.dealz') || "Dealz", {
                body: "Notifications enabled! You will now receive updates.",
                icon: "/brand-icon.png"
            });
            setShowPrompt(false);
        } else {
            setShowPrompt(false);
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 animate-in slide-in-from-bottom duration-500 flex flex-col gap-3">
            <div className="flex gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Enable Notifications?</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get instant updates on your ads and messages.</p>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => setShowPrompt(false)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    Later
                </button>
                <button
                    onClick={handleAllow}
                    className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                >
                    Allow
                </button>
            </div>
        </div>
    );
}
