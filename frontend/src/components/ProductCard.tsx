"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { useFavorites } from "../context/FavoriteContext";
import { useComparison } from "../context/ComparisonContext";
import { useCountry } from "../context/CountryContext";
import { countries } from "../data/countries";
import { isWithinTwoHours } from "../utils/dateUtils";

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { t } = useLanguage();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToCompare, isInCompare, removeFromCompare } = useComparison();
    const { selectedCountry } = useCountry();

    // Helper for image URLs
    const getImageUrl = (url: string) => {
        if (!url) return "https://placehold.co/400x300/png?text=No+Image";
        return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}${url}`;
    };

    const isFav = isFavorite(product.documentId || product.id);
    const inCompare = isInCompare(product.documentId || product.id);

    return (
        <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full relative">
            {/* Image Area - Aspect Ratio 4:3 */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Link href={`/product/${product.slug || product.documentId}`}>
                    <img
                        src={getImageUrl(product.images?.[0]?.url)}
                        alt={product.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                </Link>

                {/* Watermark */}
                <div className="absolute bottom-1 right-2 z-10 pointer-events-none opacity-50">
                    <span className="text-white text-[8px] font-black bg-black/20 px-1 rounded backdrop-blur-[1px]">Dealz</span>
                </div>

                {/* Overlays */}
                <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                    {product.isFeatured && (
                        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded shadow-sm">
                            ⭐ {t('common.featuredBadge')}
                        </span>
                    )}
                    {isWithinTwoHours(product.publishedAt) && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm animate-pulse">
                            🆕 {t('common.newBadge')}
                        </span>
                    )}
                </div>

                {/* Action Buttons - Show on Hover (Desktop) / Always (Mobile) */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(product.documentId || product.id);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${isFav ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"}`}
                        title={t('common.addToFavorites')}
                    >
                        ♥
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            inCompare ? removeFromCompare(product.documentId || product.id) : addToCompare(product);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${inCompare ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-blue-600"}`}
                        title={t('common.compare')}
                    >
                        ⇄
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col flex-grow text-sm">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-red-600 transition-colors" title={product.title}>
                        {product.title}
                    </h3>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span>📍 {product.city}</span>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2">
                    <span className="font-black text-red-600 text-base">
                        {product.price?.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">{countries.find(c => c.id === product.country)?.currency || 'AED'}</span>
                    </span>
                    <span className="text-[10px] text-gray-400">
                        {new Date(product.publishedAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
