"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

export default function Wallet() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        available: 0,
        pending: 0,
        totalEarned: 0
    });

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("jwt");
            const userStr = localStorage.getItem("user");
            if (!token || !userStr) return;
            const user = JSON.parse(userStr);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            // Fetch all sales transactions
            const res = await fetch(`${API_URL}/api/transactions?filters[seller][id][$eq]=${user.id}&sort=createdAt:desc`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            const txs = data.data || [];

            setTransactions(txs);

            // Calculate Balances
            const available = txs
                .filter((tx: any) => tx.status === 'completed')
                .reduce((acc: number, tx: any) => acc + Number(tx.netAmount || tx.amount), 0);

            const pending = txs
                .filter((tx: any) => tx.status === 'held' || tx.status === 'shipped')
                .reduce((acc: number, tx: any) => acc + Number(tx.netAmount || tx.amount), 0);

            const total = txs
                .filter((tx: any) => tx.status === 'completed')
                .reduce((acc: number, tx: any) => acc + Number(tx.netAmount || tx.amount), 0);

            setStats({
                available,
                pending,
                totalEarned: total
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = () => {
        if (stats.available <= 0) {
            return showToast(t('wallet.noFunds') || "No funds available for withdrawal.", "error");
        }
        // Mock Withdrawal
        showToast(t('wallet.withdrawSuccess') || "Withdrawal request submitted successfully!", "success");
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading wallet...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Available Balance */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.77 2.13-2.11 0-2.85-4.54-3.05-4.54-5.83 0-1.58 1.13-2.73 2.72-3.04V4h2.67v1.89c1.68.3 3.01 1.45 3.09 3.33h-1.92c-.15-1.07-1.1-1.72-2.31-1.72-1.39 0-2.07.97-2.07 1.95 0 2.22 4.47 2.47 4.47 5.79.03 1.63-1.13 2.87-2.79 3.25z" /></svg>
                    </div>
                    <p className="text-green-100 font-medium mb-1">{t('wallet.availableBalance') || "Available Balance"}</p>
                    <h2 className="text-3xl font-bold">{stats.available.toLocaleString()} AED</h2>
                    <button
                        onClick={handleWithdraw}
                        className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"
                    >
                        <span>🏦</span> {t('wallet.withdraw') || "Withdraw Funds"}
                    </button>
                </div>

                {/* Pending Balance */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                    </div>
                    <p className="text-yellow-100 font-medium mb-1">{t('wallet.pendingBalance') || "Pending Balance"}</p>
                    <h2 className="text-3xl font-bold">{stats.pending.toLocaleString()} AED</h2>
                    <p className="text-xs text-yellow-100 mt-2 opacity-80">{t('wallet.pendingDesc') || "Funds withheld until order completion"}</p>
                </div>

                {/* Total Earned */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">{t('wallet.totalEarned') || "Total Earned"}</p>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEarned.toLocaleString()} AED</h2>
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[70%]"></div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions List (Simplified) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('wallet.history') || "Transaction History"}</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">
                            {t('wallet.noTransactions') || "No transactions yet"}
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                        ${tx.status === 'completed' ? 'bg-green-100 text-green-600' :
                                            tx.status === 'held' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-red-100 text-red-600'}`}>
                                        {tx.status === 'completed' ? '↙' : tx.status === 'held' ? '⏳' : '✗'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {tx.status === 'completed' ? 'Sale Revenue' : 'Pending Sale'}
                                        </p>
                                        <p className="text-xs text-gray-500">{moment(tx.createdAt).format("MMM DD, YYYY • hh:mm A")}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                                        +{Number(tx.netAmount || tx.amount).toLocaleString()} AED
                                    </p>
                                    <span className="text-xs text-gray-400 capitalize">{tx.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
