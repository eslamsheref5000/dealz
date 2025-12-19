"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { useCountry } from "../context/CountryContext";
import { useFavorites } from "../context/FavoriteContext";
import { isWithinTwoHours } from "../utils/dateUtils";

interface CategoryRowProps {
    categoryName: string;
    title: string;
}

export default function CategoryRow({ categoryName, title }: CategoryRowProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedCountry } = useCountry();
    const { t } = useLanguage();
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        // Fetch top 8 items from this category
        const url = `http://localhost:1338/api/products?populate=*&filters[country][$eq]=${selectedCountry.id}&filters[category][name][$eq]=${encodeURIComponent(categoryName)}&filters[approvalStatus][$eq]=approved&sort[0]=isFeatured:desc&sort[1]=publishedAt:desc&pagination[limit]=8`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setProducts(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(`Error fetching ${categoryName}:`, err);
                setLoading(false);
            });
    }, [categoryName, selectedCountry.id]);

    if (!loading && products.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {title}
                </h2>
                <Link
                    href={`/?category=${encodeURIComponent(categoryName)}`}
                    className="text-red-600 text-sm font-bold hover:underline"
                >
                    {t('common.viewAll') || "See All"}
                </Link>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x px-1">
                {loading ? (
                    // Skeleton loader
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="min-w-[240px] h-[280px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse snap-center"></div>
                    ))
                ) : (
                    products.map((ad: any) => (
                        <div key={ad.documentId || ad.id} className="min-w-[240px] max-w-[240px] bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 border-l-4 border-l-transparent hover:border-l-red-500 snap-center relative group">
                            {ad.isFeatured && (
                                <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm">
                                    {t('common.featured') || "Featured"}
                                </div>
                            )}
                            {isWithinTwoHours(ad.publishedAt || ad.createdAt) && (
                                <div className={`absolute top-3 ${ad.isFeatured ? 'left-20' : 'left-3'} z-10 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm flex items-center gap-1 transition-all`}>
                                    <span>✨</span> {t('home.newBadge')}
                                </div>
                            )}

                            <Link href={`/product/${ad.slug || ad.documentId}`} className="block h-full flex flex-col">
                                <div className="relative h-40 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    <img
                                        src={ad.images && ad.images.length > 0 ? `http://localhost:1338${ad.images[0].url}` : "https://placehold.co/600x400/png?text=No+Image"}
                                        alt={ad.title}
                                        className="object-cover w-full h-full group-hover:scale-110 transition duration-500"
                                    />
                                </div>

                                <div className="p-3 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1" title={ad.title}>
                                            {ad.title}
                                        </h3>
                                        <div className="text-red-600 font-bold text-lg">
                                            {ad.price?.toLocaleString()} <span className="text-xs text-gray-400 font-normal">{selectedCountry.currency}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            📍 {ad.city}
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(ad.documentId);
                                }}
                                className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition z-20"
                            >
                                <span className={`text-lg ${isFavorite(ad.documentId) ? 'text-red-500' : 'text-gray-400 dark:text-gray-300'}`}>
                                    {isFavorite(ad.documentId) ? '❤️' : '🤍'}
                                </span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
