"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function PointsPage() {
    const router = useRouter();
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

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading Rewards...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white pb-20">
            <Header />

            <main className="max-w-6xl mx-auto px-4 pt-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                        <svg width="300" height="300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-purple-200 uppercase tracking-widest text-sm font-bold mb-2">My Dealz Balance</p>
                            <h1 className="text-6xl font-black mb-1">{profile?.points || 0} <span className="text-2xl opacity-75">PTS</span></h1>
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm">
                                <span className="text-yellow-300">★</span>
                                <span className="font-bold">Level {profile?.level || 1}</span>
                            </div>
                        </div>

                        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20 w-full md:w-auto min-w-[250px] text-center">
                            <p className="text-sm text-purple-100 mb-2">Next Reward At</p>
                            <p className="text-2xl font-bold">{(profile?.level || 1) * 1000} PTS</p>
                            <div className="w-full bg-black/20 h-2 rounded-full mt-3 overflow-hidden">
                                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${((profile?.points || 0) % 1000) / 10}%` }}></div>
                            </div>
                            <p className="text-xs text-right mt-1 opacity-75">{((profile?.points || 0) % 1000)} / 1000</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Recent Activity</h2>
                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">View All</button>
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
                                                {tx.amount > 0 ? '+' : ''}{tx.amount} PTS
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No points history yet.</p>
                                    <button onClick={() => router.push('/sell')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-purple-700">Post an Ad (+50 PTS)</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">🏆 Leaderboard</h2>
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
                                        <p className="font-bold truncate">{entry.user?.username || 'Anonymous'}</p>
                                        <p className="text-xs text-gray-500">Level {entry.level}</p>
                                    </div>
                                    <div className="font-mono font-bold text-purple-600">
                                        {entry.points}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
