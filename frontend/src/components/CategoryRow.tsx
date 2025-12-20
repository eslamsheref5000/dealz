"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
        const url = `${API_URL}/api/products?populate=*&filters[country][$eq]=${selectedCountry.id}&filters[category][name][$eq]=${encodeURIComponent(categoryName)}&filters[approvalStatus][$eq]=approved&sort[0]=isFeatured:desc&sort[1]=publishedAt:desc&pagination[limit]=8`;

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
                    href={`/c/${encodeURIComponent(categoryName)}`}
                    className="text-red-600 text-sm font-bold hover:underline"
                >
                    {t('common.viewAll') || "See All"}
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
                {loading ? (
                    // Skeleton loader
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-full">
                            <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                        </div>
                    ))
                ) : (
                    products.map((ad: any) => (
                        <div key={ad.documentId || ad.id} className="h-full">
                            <ProductCard product={ad} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
