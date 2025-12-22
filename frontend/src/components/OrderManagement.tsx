"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

interface OrderManagementProps {
    tab: 'orders' | 'sales';
}

export default function OrderManagement({ tab }: OrderManagementProps) {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, [tab]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("jwt");
            const userStr = localStorage.getItem("user");
            if (!token || !userStr) return;
            const user = JSON.parse(userStr);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            let filterString = ``;
            if (tab === 'orders') {
                filterString = `filters[buyer][id][$eq]=${user.id}`;
            } else {
                filterString = `filters[seller][id][$eq]=${user.id}`;
            }

            const res = await fetch(`${API_URL}/api/transactions?${filterString}&populate=*&sort=createdAt:desc`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTransactions(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'ship' | 'receive') => {
        try {
            const token = localStorage.getItem("jwt");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            const res = await fetch(`${API_URL}/api/transactions/${id}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
                showToast(data.meta?.message || "Success!", "success");
                fetchTransactions(); // Refresh
            } else {
                showToast(data.error?.message || "Action failed", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network Error", "error");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    if (transactions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {tab === 'orders' ? "No Orders Yet" : "No Sales Yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    {tab === 'orders' ? "Start shopping to see your orders here." : "Start selling to see your sales here."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {transactions.map((tx: any) => (
                <div key={tx.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-center">
                    {/* Image */}
                    <div className="w-full md:w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                            src={tx.product?.images?.[0]?.url
                                ? (tx.product.images[0].url.startsWith('http') ? tx.product.images[0].url : `${process.env.NEXT_PUBLIC_API_URL}${tx.product.images[0].url}`)
                                : "https://placehold.co/100x100?text=No+Img"}
                            alt="Product"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{tx.product?.title || "Unknown Product"}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                                ${tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    tx.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'}`}>
                                {tx.status}
                            </span>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p>Amount: <span className="font-bold text-gray-900 dark:text-white">{Number(tx.amount).toLocaleString()} AED</span></p>
                            <p>Date: {moment(tx.createdAt).format("MMM Do YYYY")}</p>
                            <p>Transaction ID: #{tx.documentId?.substring(0, 8)}</p>
                        </div>

                        {/* Status Message */}
                        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm">
                            {tx.status === 'held' && "💰 Funds are held safely by Dealz Escrow."}
                            {tx.status === 'shipped' && "🚚 Item is on the way!"}
                            {tx.status === 'completed' && "✅ Transaction completed."}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full md:w-auto flex flex-col gap-2">
                        {tab === 'sales' && tx.status === 'held' && (
                            <button
                                onClick={() => handleAction(tx.documentId, 'ship')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition w-full whitespace-nowrap"
                            >
                                📦 Mark Shipped
                            </button>
                        )}

                        {tab === 'orders' && tx.status === 'shipped' && (
                            <button
                                onClick={() => handleAction(tx.documentId, 'receive')}
                                className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition w-full whitespace-nowrap animate-pulse"
                                title="Click only after you receive the item"
                            >
                                ✅ Confirm Receipt
                            </button>
                        )}

                        <button className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition w-full">
                            Report Issue
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
