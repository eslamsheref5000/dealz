"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { useLanguage } from "../context/LanguageContext";

export default function MyBids() {
    const { t } = useLanguage();
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBids = async () => {
            const token = localStorage.getItem("jwt");
            if (!token) return;

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                // Fetch bids by current user, populate product status and winner
                const res = await fetch(`${API_URL}/api/bids?filters[bidder][id][$eq]=${JSON.parse(localStorage.getItem('user') || '{}').id}&populate[product][populate][0]=winner&populate[product][populate][1]=images&sort=createdAt:desc`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();
                if (data.data) {
                    setBids(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBids();
    }, []);

    if (loading) return <div className="text-center py-10">{t('common.loading')}</div>;

    if (bids.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 mb-4">You haven't placed any bids yet.</p>
                <Link href="/?isAuction=true" className="text-red-600 font-bold hover:underline">
                    Find Auctions
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🔨 My Bids</h2>
            {bids.map((bid) => {
                const product = bid.product;
                if (!product) return null; // Deleted product

                const isWinner = product.winner?.documentId === JSON.parse(localStorage.getItem('user') || '{}').documentId; // Check if I am winner
                // Or check against user ID if populated variously. 
                // Strapi 5 might populate full object.

                const isEnded = new Date(product.auctionEndTime) < new Date() || !!product.winner;

                let statusBadge;
                if (isWinner) {
                    statusBadge = <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">🏆 YOU WON</span>;
                } else if (isEnded) {
                    statusBadge = <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">❌ ENDED</span>;
                } else if (Number(product.currentBid) > Number(bid.amount)) {
                    statusBadge = <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">⚠️ OUTBID</span>;
                } else {
                    statusBadge = <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">🔥 WINNING</span>;
                }

                return (
                    <div key={bid.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img src={product.images[0].url.startsWith('http') ? product.images[0].url : `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].url}`} className="w-full h-full object-cover" />
                            ) : <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>}
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <Link href={`/product/${product.documentId}`} className="font-bold text-gray-900 dark:text-white hover:underline line-clamp-1">
                                    {product.title}
                                </Link>
                                {statusBadge}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                My Bid: <span className="font-bold text-gray-900 dark:text-gray-100">{Number(bid.amount).toLocaleString()} AED</span>
                                <span className="mx-2">•</span>
                                Current: <span className="text-red-600 font-bold">{Number(product.currentBid).toLocaleString()} AED</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {moment(bid.publishedAt).fromNow()}
                            </div>
                        </div>
                        {isWinner && (
                            <Link href={`/product/${product.documentId}`} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-green-700">
                                Pay Now
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
