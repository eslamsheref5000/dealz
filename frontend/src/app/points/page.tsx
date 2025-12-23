"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';

export default function PointsPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [profile, setProfile] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGamificationData = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

                // 1. Get My Profile
                const userRes = await fetch(`${API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userData = await userRes.json();

                // Fetch Gamification Profile
                const profileRes = await fetch(`${API_URL}/api/gamification-profiles?filters[user][id][$eq]=${userData.id}&populate=*`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profileData = await profileRes.json();

                if (profileData.data && profileData.data.length > 0) {
                    setProfile(profileData.data[0]);

                    // 2. Get History (Transactions)
                    const historyRes = await fetch(`${API_URL}/api/point-transactions?filters[profile][id][$eq]=${profileData.data[0].id}&sort=createdAt:desc&limit=10`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const historyData = await historyRes.json();
                    setHistory(historyData.data);
                }

                // 3. Get Leaderboard (Top 10)
                const leaderboardRes = await fetch(`${API_URL}/api/gamification-profiles?sort=points:desc&limit=10&populate[user]=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const leaderboardData = await leaderboardRes.json();
                setLeaderboard(leaderboardData.data);

            } catch (error) {
                console.error("Failed to fetch gamification data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGamificationData();
    }, []);

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">{t('common.loading')}</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white pb-20">
            <Header />

            <main className="max-w-6xl mx-auto px-4 pt-8">
                {/* Hero Section */}
                {/* Wallet Hero Section */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-3xl p-8 shadow-2xl mb-10 relative overflow-hidden border border-gray-700">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grid)" />
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 h-full min-h-[180px]">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-500/30 uppercase tracking-wider">
                                    {t('wallet.official_currency')}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-1 flex items-baseline gap-2">
                                {Number(profile?.points || 0).toLocaleString()}
                                <span className="text-2xl font-medium text-gray-400">DLZ Coins</span>
                            </h1>
                            <p className="text-gray-400 text-sm">{t('wallet.balance_desc')}</p>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 w-full md:w-auto">
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold">{t('wallet.current_level')}</p>
                                    <p className="text-xl font-bold text-yellow-400">Level {profile?.level || 1}</p>
                                </div>
                                <div className="h-10 w-px bg-gray-700"></div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold">{t('wallet.next_reward')}</p>
                                    <p className="text-sm font-medium text-white">{(profile?.level || 1) * 1000} DLZ</p>
                                </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden border border-gray-700">
                                <div
                                    className="bg-yellow-400 h-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                    style={{ width: `${((profile?.points || 0) % 1000) / 10}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{t('wallet.recent_activity')}</h2>
                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">{t('wallet.view_all')}</button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {history.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {history.map((tx) => (
                                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {tx.amount > 0 ? '↑' : '↓'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{tx.description || tx.type}</p>
                                                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount} DLZ
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p>{t('wallet.no_history')}</p>
                                    <button onClick={() => router.push('/post-ad')} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">{t('wallet.post_ad_reward')}</button>
                                </div>
                            )}
                        </div>


                        {/* Badges Grid - New Feature */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-6">🏅 {t('wallet.badges')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Example Badges - Dynamic in future */}
                                {['Early Adopter', 'Verified Seller', 'Top Rater', 'Power User'].map((badge, i) => (
                                    <div key={i} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 ${i < 2
                                        ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 opacity-100'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50 grayscale'
                                        }`}>
                                        <div className="text-3xl">{['🛡️', '✅', '⭐', '⚡'][i]}</div>
                                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{badge}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">🏆 {t('wallet.top_holders')}</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {leaderboard.map((entry, idx) => (
                                <div key={entry.id} className={`p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${idx < 3 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-lg ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        idx === 1 ? 'bg-gray-300 text-gray-800' :
                                            idx === 2 ? 'bg-orange-300 text-orange-900' :
                                                'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate text-gray-900 dark:text-white">{entry.user?.username || 'Anonymous'}</p>
                                        <p className="text-xs text-gray-500">Level {entry.level}</p>
                                    </div>
                                    <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        {Number(entry.points).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
