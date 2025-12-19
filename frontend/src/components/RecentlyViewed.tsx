"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { useLanguage } from "../context/LanguageContext";
import { useCountry } from "../context/CountryContext";

export default function RecentlyViewed() {
    const { recentIds } = useRecentlyViewed();
    const [products, setProducts] = useState<any[]>([]);
    const { t } = useLanguage();
    const { selectedCountry } = useCountry();

    useEffect(() => {
        if (recentIds.length === 0) return;

        // Fetch details for these IDs
        // Construct query for multiple IDs
        // filters[documentId][$in][0]=...&filters[documentId][$in][1]=...
        const queryParams = recentIds.map((id, index) => `filters[documentId][$in][${index}]=${id}`).join('&');

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
        fetch(`${API_URL}/api/products?populate=*&filters[approvalStatus][$eq]=approved&${queryParams}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    // Sort them in the order of recentIds
                    const sorted = data.data.sort((a: any, b: any) => {
                        return recentIds.indexOf(a.documentId) - recentIds.indexOf(b.documentId);
                    });
                    setProducts(sorted);
                }
            })
            .catch(err => console.error("Error fetching recently viewed:", err));
    }, [recentIds]);

    if (products.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span>🕒</span> {t('home.recentlyViewed') || "Recently Viewed"}
            </h2>

            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
                {products.map((ad: any) => (
                    <div key={ad.documentId || ad.id} className="min-w-[200px] max-w-[200px] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex-shrink-0 snap-center">
                        <Link href={`/product/${ad.slug || ad.documentId}`} className="block h-full">
                            <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-800 rounded-t-xl overflow-hidden">
                                <img
                                    src={ad.images && ad.images.length > 0 ? (ad.images[0].url.startsWith('http') ? ad.images[0].url : `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}${ad.images[0].url}`) : "https://placehold.co/600x400/png?text=No+Image"}
                                    alt={ad.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="p-3">
                                <p className="font-bold text-red-600 text-lg">
                                    {ad.price?.toLocaleString()} <span className="text-xs text-gray-400">{selectedCountry.currency}</span>
                                </p>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mt-1">
                                    {ad.title}
                                </h3>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
