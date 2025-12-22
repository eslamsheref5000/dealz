"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

export default function AnalyticsDashboard() {
    const { t } = useLanguage();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            try {
                const res = await fetch(`${API_URL}/api/products/analytics/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center animate-pulse"><div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div></div>;
    if (!data) return <div className="text-center py-10 text-gray-500">No analytics data available.</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                    <div className="text-blue-100 text-sm font-medium mb-1">{t('analytics.totalViews') || "Total Views"}</div>
                    <div className="text-3xl font-bold">{data.totalViews?.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/20">
                    <div className="text-purple-100 text-sm font-medium mb-1">{t('analytics.totalAds') || "Total Ads"}</div>
                    <div className="text-3xl font-bold">{data.totalAds}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
                    <div className="text-orange-100 text-sm font-medium mb-1">{t('analytics.activeAuctions') || "Active Auctions"}</div>
                    <div className="text-3xl font-bold">{data.activeAuctions}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg shadow-green-200 dark:shadow-green-900/20">
                    <div className="text-green-100 text-sm font-medium mb-1">{t('analytics.totalBids') || "Bids Received"}</div>
                    <div className="text-3xl font-bold">{data.totalBidsReceived}</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('analytics.topPerforming') || "Top Performing Ads"}</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.topAds} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                            />
                            <YAxis
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Legend />
                            <Bar name="Views" dataKey="views" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar name="Bids" dataKey="bids" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
